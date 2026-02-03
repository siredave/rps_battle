const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
    },
    player1: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: String,
      bet: {
        type: Number,
        required: true,
      },
      choices: [
        {
          round: Number,
          choice: {
            type: String,
            enum: ["rock", "paper", "scissors"],
          },
        },
      ],
      roundsWon: {
        type: Number,
        default: 0,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    player2: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username: String,
      bet: {
        type: Number,
        required: true,
      },
      choices: [
        {
          round: Number,
          choice: {
            type: String,
            enum: ["rock", "paper", "scissors"],
          },
        },
      ],
      roundsWon: {
        type: Number,
        default: 0,
      },
      score: {
        type: Number,
        default: 0,
      },
    },
    totalRounds: {
      type: Number,
      default: 10,
    },
    currentRound: {
      type: Number,
      default: 0,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    winnerUsername: String,
    totalPot: {
      type: Number,
      default: 0,
    },
    winnerPayout: Number,
    status: {
      type: String,
      enum: ["waiting", "in_progress", "completed"],
      default: "waiting",
    },
    roundResults: [
      {
        round: Number,
        player1Choice: String,
        player2Choice: String,
        result: {
          type: String,
          enum: ["player1_win", "player2_win", "tie"],
        },
      },
    ],
    startTime: Date,
    endTime: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Game", gameSchema);
