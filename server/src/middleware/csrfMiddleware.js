const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';
const sameSitePolicy = process.env.COOKIE_SAMESITE || 'lax';

const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const setCsrfCookie = (res, token) => {
  res.cookie('_csrf', token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: sameSitePolicy,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const verifyCsrf = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const hasAuthCookie = req.cookies?.accessToken || req.cookies?.refreshToken;
  if (!hasAuthCookie) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
  const cookieToken = req.cookies?._csrf;

  if (!clientToken || !cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing. Please provide the x-csrf-token header matching the _csrf cookie.',
    });
  }

  try {
    const clientBuf = Buffer.from(clientToken);
    const cookieBuf = Buffer.from(cookieToken);

    if (clientBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(clientBuf, cookieBuf)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token.',
      });
    }
  } catch {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token.',
    });
  }

  next();
};

module.exports = {
  generateCsrfToken,
  setCsrfCookie,
  verifyCsrf,
};
