require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");

const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const Game = require("./models/Game");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// WebSocket connections
const activePlayers = new Map();
const gameRooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins
  socket.on("user_join", (userData) => {
    activePlayers.set(socket.id, {
      socketId: socket.id,
      userId: userData.userId,
      username: userData.username,
      status: "available",
    });

    // Broadcast available players
    io.emit("players_updated", Array.from(activePlayers.values()));
  });

  // Challenge another player
  socket.on("challenge_player", async (data) => {
    const { targetPlayerId, betAmount } = data;
    const challenger = activePlayers.get(socket.id);

    const targetSocket = Array.from(activePlayers.entries()).find(
      ([_, player]) => player.userId === targetPlayerId,
    );

    if (targetSocket) {
      io.to(targetSocket[0]).emit("challenge_received", {
        from: challenger,
        betAmount,
        challengerId: socket.id,
      });
    }
  });

  // Accept challenge
  socket.on("challenge_accepted", async (data) => {
    const { challengerId, betAmount } = data;
    const acceptor = activePlayers.get(socket.id);
    const challenger = activePlayers.get(challengerId);

    if (challenger && acceptor) {
      const gameId = `${challengerId}-${socket.id}-${Date.now()}`;

      gameRooms.set(gameId, {
        gameId,
        player1: {
          socketId: challengerId,
          userId: challenger.userId,
          username: challenger.username,
          bet: betAmount,
          roundChoices: new Array(10).fill(null),
          roundsWon: 0,
        },
        player2: {
          socketId: socket.id,
          userId: acceptor.userId,
          username: acceptor.username,
          bet: betAmount,
          roundChoices: new Array(10).fill(null),
          roundsWon: 0,
        },
        currentRound: 0,
        totalRounds: 10,
        roundResults: [],
        status: "in_progress",
      });

      // Join both players to a room
      io.to(challengerId).emit("game_started", { gameId });
      io.to(socket.id).emit("game_started", { gameId });

      // Update player statuses
      challenger.status = "in_game";
      acceptor.status = "in_game";
      io.emit("players_updated", Array.from(activePlayers.values()));
    }
  });

  // Play round
  socket.on("play_round", (data) => {
    const { gameId, round, choice } = data;
    const game = gameRooms.get(gameId);

    if (!game) return;

    // Store choice
    if (game.player1.socketId === socket.id) {
      game.player1.roundChoices[round] = choice;
    } else {
      game.player2.roundChoices[round] = choice;
    }

    // Check if both players have made a choice
    if (game.player1.roundChoices[round] && game.player2.roundChoices[round]) {
      const player1Choice = game.player1.roundChoices[round];
      const player2Choice = game.player2.roundChoices[round];

      const result = determineWinner(player1Choice, player2Choice);

      if (result === "player1_win") {
        game.player1.roundsWon += 1;
      } else if (result === "player2_win") {
        game.player2.roundsWon += 1;
      }

      game.roundResults.push({
        round,
        player1Choice,
        player2Choice,
        result,
      });

      // Emit round result to both players
      io.to(game.player1.socketId).emit("round_complete", {
        round,
        result,
        player1RoundsWon: game.player1.roundsWon,
        player2RoundsWon: game.player2.roundsWon,
      });

      io.to(game.player2.socketId).emit("round_complete", {
        round,
        result,
        player1RoundsWon: game.player1.roundsWon,
        player2RoundsWon: game.player2.roundsWon,
      });

      // Check if game is over
      if (round === game.totalRounds - 1) {
        endGame(gameId, io, activePlayers);
      }
    }
  });

  // Reject challenge
  socket.on("challenge_rejected", (data) => {
    const { challengerId } = data;
    io.to(challengerId).emit("challenge_rejected");
  });

  // User disconnects
  socket.on("disconnect", () => {
    activePlayers.delete(socket.id);
    io.emit("players_updated", Array.from(activePlayers.values()));
    console.log("User disconnected:", socket.id);
  });
});

const determineWinner = (choice1, choice2) => {
  if (choice1 === choice2) return "tie";
  if (
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "paper" && choice2 === "rock") ||
    (choice1 === "scissors" && choice2 === "paper")
  ) {
    return "player1_win";
  }
  return "player2_win";
};

const endGame = async (gameId, io, activePlayers) => {
  const game = gameRooms.get(gameId);

  if (!game) return;

  game.status = "completed";

  let winner = null;
  let winnerPayout = 0;

  if (game.player1.roundsWon > game.player2.roundsWon) {
    winner = game.player1.userId;
    winnerPayout = game.player1.bet + game.player2.bet;

    // Update winner balance
    await User.findByIdAndUpdate(winner, {
      $inc: {
        "wallet.balance": winnerPayout,
        "wallet.totalWon": winnerPayout,
        "stats.wins": 1,
        "stats.totalGames": 1,
      },
    });

    // Update loser stats
    await User.findByIdAndUpdate(game.player2.userId, {
      $inc: {
        "stats.losses": 1,
        "stats.totalGames": 1,
      },
    });
  } else if (game.player2.roundsWon > game.player1.roundsWon) {
    winner = game.player2.userId;
    winnerPayout = game.player1.bet + game.player2.bet;

    await User.findByIdAndUpdate(winner, {
      $inc: {
        "wallet.balance": winnerPayout,
        "wallet.totalWon": winnerPayout,
        "stats.wins": 1,
        "stats.totalGames": 1,
      },
    });

    await User.findByIdAndUpdate(game.player1.userId, {
      $inc: {
        "stats.losses": 1,
        "stats.totalGames": 1,
      },
    });
  } else {
    // Tie
    winnerPayout = (game.player1.bet + game.player2.bet) / 2;

    await User.findByIdAndUpdate(game.player1.userId, {
      $inc: {
        "wallet.balance": winnerPayout,
        "wallet.totalWon": winnerPayout,
        "stats.totalGames": 1,
      },
    });

    await User.findByIdAndUpdate(game.player2.userId, {
      $inc: {
        "wallet.balance": winnerPayout,
        "wallet.totalWon": winnerPayout,
        "stats.totalGames": 1,
      },
    });
  }

  // Emit game end event
  io.to(game.player1.socketId).emit("game_ended", {
    result:
      winner === game.player1.userId
        ? "win"
        : winner === game.player2.userId
          ? "loss"
          : "tie",
    winnerPayout,
    player1RoundsWon: game.player1.roundsWon,
    player2RoundsWon: game.player2.roundsWon,
  });

  io.to(game.player2.socketId).emit("game_ended", {
    result:
      winner === game.player2.userId
        ? "win"
        : winner === game.player1.userId
          ? "loss"
          : "tie",
    winnerPayout,
    player1RoundsWon: game.player1.roundsWon,
    player2RoundsWon: game.player2.roundsWon,
  });

  // Update player statuses
  const player1 = activePlayers.get(game.player1.socketId);
  const player2 = activePlayers.get(game.player2.socketId);

  if (player1) player1.status = "available";
  if (player2) player2.status = "available";

  io.emit("players_updated", Array.from(activePlayers.values()));

  // Remove game from rooms
  gameRooms.delete(gameId);
};

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
