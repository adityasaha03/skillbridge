const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwt');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookieHelper');
const { generateCsrfToken, setCsrfCookie } = require('../middleware/csrfMiddleware');

const register = async (req, res) => {
  try {
    const { fullName, email, studentId, department, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'An account with this student ID already exists.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      fullName,
      email,
      studentId,
      department,
      passwordHash,
      roles: ['student'],
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens = [
      {
        tokenHash: refreshTokenHash,
        createdAt: new Date(),
        expiresAt: refreshTokenExpiresAt,
      },
    ];

    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: user.toJSON(),
      csrfToken,
    });
  } catch (error) {
    console.error('[Register Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const refreshTokenHash = hashToken(refreshToken);
    const now = new Date();
    const validTokens = (user.refreshTokens || []).filter(
      (t) => t.expiresAt && new Date(t.expiresAt) > now
    );

    validTokens.push({
      tokenHash: refreshTokenHash,
      createdAt: now,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    user.refreshTokens = validTokens;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: user.toJSON(),
      csrfToken,
    });
  } catch (error) {
    console.error('[Login Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token cookie is missing.',
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    const incomingHash = hashToken(incomingRefreshToken);
    const existingIndex = (user.refreshTokens || []).findIndex(
      (t) => t.tokenHash === incomingHash
    );

    if (existingIndex === -1) {
      user.refreshTokens = [];
      await user.save();
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        code: 'TOKEN_REUSE_DETECTED',
        message: 'Compromised or reused session token detected. All active sessions have been terminated.',
      });
    }

    user.refreshTokens.splice(existingIndex, 1);

    const now = new Date();
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.expiresAt && new Date(t.expiresAt) > now
    );

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    };

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    user.refreshTokens.push({
      tokenHash: hashToken(newRefreshToken),
      createdAt: now,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Tokens rotated and refreshed successfully.',
    });
  } catch (error) {
    console.error('[Refresh Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh.',
    });
  }
};

const logout = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (incomingRefreshToken) {
      try {
        const decoded = verifyRefreshToken(incomingRefreshToken);
        if (decoded?.userId) {
          const user = await User.findById(decoded.userId).select('+refreshTokens');
          if (user) {
            const incomingHash = hashToken(incomingRefreshToken);
            user.refreshTokens = (user.refreshTokens || []).filter(
              (t) => t.tokenHash !== incomingHash
            );
            await user.save();
          }
        }
      } catch {
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('[Logout Error]:', error.message);
    clearAuthCookies(res);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout.',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching user profile.',
    });
  }
};

const getCsrfToken = (req, res) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  return res.status(200).json({
    success: true,
    csrfToken,
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  getCsrfToken,
};
