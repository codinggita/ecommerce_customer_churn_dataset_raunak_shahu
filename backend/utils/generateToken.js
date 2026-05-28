const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user ID
 * @param {string} id - User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallbacksecret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
