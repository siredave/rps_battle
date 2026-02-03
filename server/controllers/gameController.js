const Game = require("../models/Game");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

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

exports.createGame = async (req, res) => {
  try {
    const { player2Id, betAmount } = req.body;
    const player1Id = req.userId;

    // Validate bet amount
    const player1 = await User.findById(player1Id);
    if (player1.wallet.balance < betAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const player2 = await User.findById(player2Id);
    if (player2.wallet.balance < betAmount) {
      return res
        .status(400)
        .json({ message: "Player 2 has insufficient balance" });
    }

    // Deduct bet from both players
    player1.wallet.balance -= betAmount;
    player1.wallet.totalWagered += betAmount;
    await player1.save();

    player2.wallet.balance -= betAmount;
    player2.wallet.totalWagered += betAmount;
    await player2.save();

    // Create game
    const game = new Game({
      gameId: uuidv4(),
      player1: {
        userId: player1Id,
        username: player1.username,
        bet: betAmount,
      },
      player2: {
        userId: player2Id,
        username: player2.username,
        bet: betAmount,
      },
      totalPot: betAmount * 2,
      startTime: new Date(),
    });

    await game.save();

    res.status(201).json({
      message: "Game created",
      game: {
        gameId: game.gameId,
        player1: game.player1,
        player2: game.player2,
        totalPot: game.totalPot,
        status: game.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOne({ gameId })
      .populate("player1.userId", "username avatar")
      .populate("player2.userId", "username avatar")
      .populate("winner", "username");

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.status(200).json({ game });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recordRound = async (req, res) => {
  try {
    const { gameId, round, player1Choice, player2Choice } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const result = determineWinner(player1Choice, player2Choice);

    // Record round result
    game.roundResults.push({
      round,
      player1Choice,
      player2Choice,
      result,
    });

    // Update round wins
    if (result === "player1_win") {
      game.player1.roundsWon += 1;
    } else if (result === "player2_win") {
      game.player2.roundsWon += 1;
    }

    game.currentRound = round;

    // Check if game is complete
    if (round === game.totalRounds) {
      game.status = "completed";
      game.endTime = new Date();

      let winner;
      if (game.player1.roundsWon > game.player2.roundsWon) {
        winner = game.player1.userId;
        game.winner = winner;
        game.winnerUsername = game.player1.username;
        game.winnerPayout = game.totalPot;

        // Update winner balance
        const winnerUser = await User.findById(winner);
        winnerUser.wallet.balance += game.totalPot;
        winnerUser.wallet.totalWon += game.totalPot;
        winnerUser.stats.wins += 1;
        winnerUser.stats.totalGames += 1;

        // Update loser stats
        const loserUser = await User.findById(game.player2.userId);
        loserUser.stats.losses += 1;
        loserUser.stats.totalGames += 1;

        await winnerUser.save();
        await loserUser.save();
      } else if (game.player2.roundsWon > game.player1.roundsWon) {
        winner = game.player2.userId;
        game.winner = winner;
        game.winnerUsername = game.player2.username;
        game.winnerPayout = game.totalPot;

        const winnerUser = await User.findById(winner);
        winnerUser.wallet.balance += game.totalPot;
        winnerUser.wallet.totalWon += game.totalPot;
        winnerUser.stats.wins += 1;
        winnerUser.stats.totalGames += 1;

        const loserUser = await User.findById(game.player1.userId);
        loserUser.stats.losses += 1;
        loserUser.stats.totalGames += 1;

        await winnerUser.save();
        await loserUser.save();
      } else {
        // Tie - split pot
        game.winnerPayout = game.totalPot / 2;

        const player1User = await User.findById(game.player1.userId);
        player1User.wallet.balance += game.totalPot / 2;
        player1User.wallet.totalWon += game.totalPot / 2;
        player1User.stats.totalGames += 1;

        const player2User = await User.findById(game.player2.userId);
        player2User.wallet.balance += game.totalPot / 2;
        player2User.wallet.totalWon += game.totalPot / 2;
        player2User.stats.totalGames += 1;

        await player1User.save();
        await player2User.save();
      }
    }

    await game.save();

    res.status(200).json({
      message: "Round recorded",
      roundResult: {
        round,
        result,
        gameStatus: game.status,
        player1RoundsWon: game.player1.roundsWon,
        player2RoundsWon: game.player2.roundsWon,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGameHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const games = await Game.find({
      $or: [{ "player1.userId": userId }, { "player2.userId": userId }],
      status: "completed",
    })
      .sort({ endTime: -1 })
      .limit(20);

    res.status(200).json({ games });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
