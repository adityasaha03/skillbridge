const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return secret;
};

const getRefreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || getSecret();
};

const signAccessToken = (payload) => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: '15m',
  });
};

const signRefreshToken = (payload) => {
  const jti = crypto.randomBytes(16).toString('hex');
  return jwt.sign({ ...payload, jti }, getRefreshSecret(), {
    expiresIn: '7d',
  });
};

const verifyToken = (token, secret = getSecret()) => {
  return jwt.verify(token, secret);
};

const verifyAccessToken = (token) => {
  return verifyToken(token, getSecret());
};

const verifyRefreshToken = (token) => {
  return verifyToken(token, getRefreshSecret());
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
