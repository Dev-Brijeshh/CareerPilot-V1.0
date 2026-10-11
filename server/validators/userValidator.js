const { body } = require("express-validator");

const updateProfileValidator = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

module.exports = {
  updateProfileValidator,
  changePasswordValidator,
};
