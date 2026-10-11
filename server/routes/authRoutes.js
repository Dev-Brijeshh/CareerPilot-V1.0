const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const router = express.Router();

// Public
router.post("/register", registerValidator, validationMiddleware, registerUser);
router.post("/login", loginValidator, validationMiddleware, loginUser);

// Private
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;
