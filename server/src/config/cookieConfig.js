const isProduction = process.env.NODE_ENV === 'production';
const sameSitePolicy = process.env.COOKIE_SAMESITE || 'lax';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: sameSitePolicy,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE,
});

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: sameSitePolicy,
  path: '/',
  maxAge: REFRESH_TOKEN_MAX_AGE,
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: sameSitePolicy,
  path: '/',
});

module.exports = {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
};
