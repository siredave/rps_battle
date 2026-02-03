const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.register,
);

router.post("/login", authController.login);

router.get("/profile", authMiddleware, authController.getProfile);

router.put("/wallet", authMiddleware, authController.updateBalance);

router.get("/leaderboard", authController.getLeaderboard);

module.exports = router;
