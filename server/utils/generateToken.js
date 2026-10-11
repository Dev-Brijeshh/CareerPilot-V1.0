const jwt = require("jsonwebtoken");

/**
 * Signs a JWT containing the user's Mongo _id.
 * Falls back to a sane default expiry so the app still behaves
 * correctly even if JWT_EXPIRE is missing from the environment.
 */
const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    },
  );
};

module.exports = generateToken;
