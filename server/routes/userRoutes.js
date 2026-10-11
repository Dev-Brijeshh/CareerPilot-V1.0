const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");
const validationMiddleware = require("../middleware/validationMiddleware");
const {
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/userValidator");

const router = express.Router();

// All routes below require a valid JWT.
router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", updateProfileValidator, validationMiddleware, updateProfile);
router.delete("/profile", deleteAccount);
router.put(
  "/change-password",
  changePasswordValidator,
  validationMiddleware,
  changePassword,
);

module.exports = router;
