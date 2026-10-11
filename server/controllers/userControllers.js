const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../middleware/asyncHandler");

// Shape returned to the client whenever we hand back a user object.
// Keeping this in one place stops the password hash (or other
// internal fields) from ever leaking through a response by accident.
const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return res.status(201).json({
    success: true,
    message: "Registration Successful",
    data: {
      ...toPublicUser(user),
      token,
    },
  });
});

// @desc    Authenticate a user & return a token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly opt in to the password hash, which is excluded by
  // default on the schema (`select: false`).
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    success: true,
    message: "Login Successful",
    data: {
      ...toPublicUser(user),
      token,
    },
  });
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Current user fetched successfully",
    data: toPublicUser(req.user),
  });
});

// @desc    Log the user out
// @route   POST /api/auth/logout
// @access  Private
// JWTs are stateless, so there's nothing to invalidate server-side
// with this simple scheme; this endpoint exists so the frontend has
// a symmetrical call to make while it clears its stored token.
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// @desc    Get the logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: toPublicUser(req.user),
  });
});

// @desc    Update name/email/avatar
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (name) {
    user.name = name;
  }

  if (typeof avatar === "string") {
    user.avatar = avatar;
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    user.email = email;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: toPublicUser(updatedUser),
  });
});

// @desc    Change the current password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Password is `select: false` on the schema, so it must be
  // explicitly requested here to verify the current password.
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isPasswordCorrect) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

// @desc    Delete the logged-in user's account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
    data: null,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};
