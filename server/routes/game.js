const express = require("express");
const authMiddleware = require("../middleware/auth");
const gameController = require("../controllers/gameController");

const router = express.Router();

router.post("/create", authMiddleware, gameController.createGame);

router.get("/:gameId", authMiddleware, gameController.getGame);

router.post("/round", authMiddleware, gameController.recordRound);

router.get("/history", authMiddleware, gameController.getGameHistory);

module.exports = router;
