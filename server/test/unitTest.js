const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} = require('../src/utils/jwt');
const {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
} = require('../src/config/cookieConfig');
const {
  generateCsrfToken,
  verifyCsrf,
} = require('../src/middleware/csrfMiddleware');
const {
  validateRegister,
  validateLogin,
} = require('../src/middleware/validateAuth');

console.log('\n--- Running Fast Unit Tests for SkillBridge Auth Utilities ---\n');

let passed = 0;
let failed = 0;

const assert = (condition, message) => {
  if (condition) {
    console.log(` \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passed++;
  } else {
    console.error(` \x1b[31m✖ FAIL\x1b[0m: ${message}`);
    failed++;
  }
};

const testPayload = { userId: 'user_12345', email: 'test@aust.edu', roles: ['student'] };
const accessToken = signAccessToken(testPayload);
assert(typeof accessToken === 'string' && accessToken.split('.').length === 3, 'signAccessToken generates a 3-part JWT');

const decodedAccess = verifyAccessToken(accessToken);
assert(decodedAccess.userId === 'user_12345' && decodedAccess.email === 'test@aust.edu', 'verifyAccessToken correctly decodes payload');
assert(decodedAccess.exp - decodedAccess.iat === 15 * 60, 'Access token expiration is exactly 15 minutes (900 seconds)');

const refreshToken = signRefreshToken(testPayload);
const decodedRefresh = verifyRefreshToken(refreshToken);
assert(decodedRefresh.userId === 'user_12345', 'verifyRefreshToken correctly decodes refresh payload');
assert(decodedRefresh.exp - decodedRefresh.iat === 7 * 24 * 60 * 60, 'Refresh token expiration is 7 days (604800 seconds)');
assert(Boolean(decodedRefresh.jti), 'Refresh token includes unique jti identifier');

const hash1 = hashToken('secret-token-123');
const hash2 = hashToken('secret-token-123');
const hash3 = hashToken('different-token');
assert(hash1 === hash2, 'hashToken produces consistent deterministic SHA-256 hash');
assert(hash1 !== hash3, 'hashToken produces unique hashes for distinct inputs');
assert(hash1.length === 64, 'hashToken produces 64-character hex string');

const accessOpts = getAccessTokenCookieOptions();
assert(accessOpts.httpOnly === true, 'Access cookie has httpOnly: true');
assert(accessOpts.path === '/', 'Access cookie path is /');
assert(accessOpts.maxAge === 15 * 60 * 1000, 'Access cookie maxAge is 15 minutes in ms');

const refreshOpts = getRefreshTokenCookieOptions();
assert(refreshOpts.httpOnly === true, 'Refresh cookie has httpOnly: true');
assert(refreshOpts.path === '/', 'Refresh cookie path is /');
assert(refreshOpts.maxAge === 7 * 24 * 60 * 60 * 1000, 'Refresh cookie maxAge is 7 days in ms');

const clearOpts = getClearCookieOptions();
assert(clearOpts.httpOnly === true && clearOpts.path === '/', 'Clear cookie options match httpOnly and path');

const csrf1 = generateCsrfToken();
const csrf2 = generateCsrfToken();
assert(csrf1.length === 64, 'generateCsrfToken creates 64-character hex token');
assert(csrf1 !== csrf2, 'generateCsrfToken creates unique tokens');

let csrfPassed = false;
verifyCsrf({ method: 'GET' }, {}, () => { csrfPassed = true; });
assert(csrfPassed, 'verifyCsrf allows GET requests through without token');

let postPassed = false;
verifyCsrf(
  {
    method: 'POST',
    cookies: { accessToken: 'dummy', _csrf: csrf1 },
    headers: { 'x-csrf-token': csrf1 },
  },
  {},
  () => { postPassed = true; }
);
assert(postPassed, 'verifyCsrf allows POST when x-csrf-token matches _csrf cookie');

let rejectStatus = 0;
let rejectBody = null;
const mockRes = {
  status: (code) => {
    rejectStatus = code;
    return {
      json: (data) => { rejectBody = data; },
    };
  },
};
verifyCsrf(
  {
    method: 'POST',
    cookies: { accessToken: 'dummy', _csrf: csrf1 },
    headers: { 'x-csrf-token': 'wrong-token' },
  },
  mockRes,
  () => {}
);
assert(rejectStatus === 403, 'verifyCsrf returns 403 when x-csrf-token does not match');

let validationCalled = false;
const validReq = {
  body: {
    fullName: '   Shirsha Chowdhury   ',
    email: 'Shirsha@aust.edu',
    studentId: '20240104002',
    department: 'CSE',
    password: 'Password123!',
  },
};
validateRegister(validReq, {}, () => { validationCalled = true; });
assert(validationCalled, 'validateRegister accepts valid input');
assert(validReq.body.fullName === 'Shirsha Chowdhury', 'validateRegister trims fullName');
assert(validReq.body.email === 'shirsha@aust.edu', 'validateRegister lowercases email');

let invalidRejectStatus = 0;
validateRegister(
  { body: { fullName: '', email: 'not-an-email', studentId: '1', department: '', password: 'weak' } },
  { status: (s) => ({ json: (d) => { invalidRejectStatus = s; } }) },
  () => {}
);
assert(invalidRejectStatus === 400, 'validateRegister rejects malformed inputs with 400');

console.log(`\n==================================================`);
console.log(` Unit Test Results: ${passed} passed, ${failed} failed`);
console.log(`==================================================\n`);

process.exit(failed > 0 ? 1 : 0);
