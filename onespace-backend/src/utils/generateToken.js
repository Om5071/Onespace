const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
