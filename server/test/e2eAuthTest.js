const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const http = require('http');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const User = require('../src/models/User');
const app = require('../src/app');

const inMemoryUsers = [];

User.prototype.save = async function () {
  const existingIdx = inMemoryUsers.findIndex(
    (u) => u._id.toString() === this._id.toString() || u.email === this.email
  );

  const plainData = {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    studentId: this.studentId,
    department: this.department,
    passwordHash: this.passwordHash,
    roles: this.roles || ['student'],
    strongTags: this.strongTags || [],
    weakTags: this.weakTags || [],
    contextBio: this.contextBio || '',
    refreshTokens: this.refreshTokens || [],
    createdAt: this.createdAt || new Date(),
    updatedAt: new Date(),
  };

  if (existingIdx !== -1) {
    inMemoryUsers[existingIdx] = plainData;
  } else {
    inMemoryUsers.push(plainData);
  }
  return this;
};

const createQueryMock = (resultFn) => {
  const queryObj = {
    _selected: [],
    select: function (fields) {
      this._selected.push(fields);
      return this;
    },
    exec: async function () {
      const plain = resultFn();
      if (!plain) return null;
      const userInstance = new User(plain);
      userInstance._id = plain._id;
      userInstance.passwordHash = plain.passwordHash;
      userInstance.refreshTokens = plain.refreshTokens || [];
      return userInstance;
    },
    then: function (resolve, reject) {
      return this.exec().then(resolve, reject);
    },
  };
  return queryObj;
};

User.findOne = function (query) {
  return createQueryMock(() => {
    if (query.$or) {
      return inMemoryUsers.find(
        (u) => u.email === query.$or[0].email || u.studentId === query.$or[1].studentId
      );
    }
    if (query.email) {
      return inMemoryUsers.find((u) => u.email === query.email);
    }
    return null;
  });
};

User.findById = function (id) {
  return createQueryMock(() => {
    return inMemoryUsers.find((u) => u._id.toString() === id.toString());
  });
};

User.findByIdAndUpdate = async function (id, update) {
  const plain = inMemoryUsers.find((u) => u._id.toString() === id.toString());
  if (!plain) return null;
  if (update.contextBio !== undefined) {
    plain.contextBio = update.contextBio;
  }
  const userInstance = new User(plain);
  userInstance._id = plain._id;
  return userInstance;
};

const extractCookies = (headers) => {
  const setCookieHeaders = headers.getSetCookie ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
  const cookies = {};
  for (const str of setCookieHeaders) {
    const parts = str.split(';').map((p) => p.trim());
    const [nameVal] = parts;
    const [name, ...val] = nameVal.split('=');
    cookies[name] = {
      value: val.join('='),
      httpOnly: parts.some((p) => p.toLowerCase() === 'httponly'),
      sameSite: parts.find((p) => p.toLowerCase().startsWith('samesite'))?.split('=')[1],
      path: parts.find((p) => p.toLowerCase().startsWith('path'))?.split('=')[1],
      maxAge: parts.find((p) => p.toLowerCase().startsWith('max-age'))?.split('=')[1],
    };
  }
  return cookies;
};

const buildCookieHeader = (cookies) => {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v.value}`)
    .join('; ');
};

async function runE2ETests() {
  console.log('\n=============================================================');
  console.log(' Starting End-to-End SkillBridge Auth System Verification');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(` \x1b[32m✔ PASS\x1b[0m: ${testName}`);
      passed++;
    } else {
      console.error(` \x1b[31m✖ FAIL\x1b[0m: ${testName}`);
      failed++;
    }
  };

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    console.log('\n--- Step 1: Input Validation & Sanitization ---');
    const badReg = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'A',
        email: 'invalid-email',
        studentId: '',
        department: '',
        password: 'short',
      }),
    });
    const badRegBody = await badReg.json();
    assert(badReg.status === 400, 'Rejects invalid input with HTTP 400');
    assert(badRegBody.success === false, 'Returns success: false');
    assert(Array.isArray(badRegBody.errors) && badRegBody.errors.length >= 3, 'Returns specific field validation errors');

    console.log('\n--- Step 2: User Registration & HTTP-only Cookie Generation ---');
    const regRes = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Aditya Saha',
        email: 'aditya.cse@aust.edu',
        studentId: '20240104001',
        department: 'CSE',
        password: 'Password123!',
      }),
    });

    assert(regRes.status === 201, 'POST /register returns HTTP 201 Created');
    const regBody = await regRes.json();
    assert(regBody.user && regBody.user.email === 'aditya.cse@aust.edu', 'Returns registered user profile');
    assert(regBody.accessToken === undefined, 'CRITICAL: accessToken is NOT returned in response body');
    assert(regBody.refreshToken === undefined, 'CRITICAL: refreshToken is NOT returned in response body');
    assert(regBody.user.passwordHash === undefined, 'CRITICAL: passwordHash is NOT returned in response body');

    const regCookies = extractCookies(regRes.headers);
    assert(Boolean(regCookies.accessToken), 'accessToken cookie is set');
    assert(regCookies.accessToken?.httpOnly === true, 'accessToken cookie has httpOnly: true (prevents XSS)');
    assert(Boolean(regCookies.refreshToken), 'refreshToken cookie is set');
    assert(regCookies.refreshToken?.httpOnly === true, 'refreshToken cookie has httpOnly: true');
    assert(Boolean(regCookies._csrf), 'CSRF cookie _csrf is set for double-submit protection');
    assert(regCookies._csrf?.httpOnly === false, 'CSRF cookie is readable by client JS to set x-csrf-token header');

    console.log('\n--- Step 3: User Login ---');
    const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aditya.cse@aust.edu',
        password: 'Password123!',
      }),
    });

    assert(loginRes.status === 200, 'POST /login returns HTTP 200 OK');
    const loginBody = await loginRes.json();
    assert(loginBody.accessToken === undefined, 'accessToken is NOT in login response body');
    assert(loginBody.refreshToken === undefined, 'refreshToken is NOT in login response body');
    assert(Boolean(loginBody.csrfToken), 'Returns CSRF token in response payload');

    let sessionCookies = extractCookies(loginRes.headers);
    assert(sessionCookies.accessToken?.httpOnly === true, 'Login response sets httpOnly accessToken cookie');
    assert(sessionCookies.refreshToken?.httpOnly === true, 'Login response sets httpOnly refreshToken cookie');

    console.log('\n--- Step 4: Auth Middleware (requireAuth) ---');
    const noAuth = await fetch(`${baseUrl}/api/v1/protected/dashboard-data`);
    assert(noAuth.status === 401, 'Request with missing cookie returns 401 Unauthorized');

    const badAuth = await fetch(`${baseUrl}/api/v1/protected/dashboard-data`, {
      headers: { Cookie: 'accessToken=tampered.token.here' },
    });
    assert(badAuth.status === 401, 'Request with invalid cookie returns 401 Unauthorized');

    const goodAuth = await fetch(`${baseUrl}/api/v1/protected/dashboard-data`, {
      headers: { Cookie: `accessToken=${sessionCookies.accessToken.value}` },
    });
    assert(goodAuth.status === 200, 'Request with valid HTTP-only accessToken cookie returns 200 OK');
    const goodAuthBody = await goodAuth.json();
    assert(goodAuthBody.authenticatedUser?.email === 'aditya.cse@aust.edu', 'User context attached to req.user');

    console.log('\n--- Step 5: CSRF Protection on Mutating Requests ---');
    const csrfMissing = await fetch(`${baseUrl}/api/v1/protected/update-bio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: buildCookieHeader(sessionCookies),
      },
      body: JSON.stringify({ contextBio: 'Updated without CSRF' }),
    });
    assert(csrfMissing.status === 403, 'Mutating POST without x-csrf-token header is rejected with 403 Forbidden');

    const csrfInvalid = await fetch(`${baseUrl}/api/v1/protected/update-bio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'attacker-forged-token',
        Cookie: buildCookieHeader(sessionCookies),
      },
      body: JSON.stringify({ contextBio: 'Updated with forged CSRF' }),
    });
    assert(csrfInvalid.status === 403, 'Mutating POST with mismatched x-csrf-token is rejected with 403 Forbidden');

    const csrfValid = await fetch(`${baseUrl}/api/v1/protected/update-bio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': sessionCookies._csrf.value,
        Cookie: buildCookieHeader(sessionCookies),
      },
      body: JSON.stringify({ contextBio: 'Expert in Graph Algorithms & Node.js' }),
    });
    assert(csrfValid.status === 200, 'Mutating POST with matching x-csrf-token succeeds with 200 OK');
    const csrfValidBody = await csrfValid.json();
    assert(csrfValidBody.contextBio === 'Expert in Graph Algorithms & Node.js', 'State modification was committed');

    console.log('\n--- Step 6: Refresh Token Flow & Rotation ---');
    const oldRefreshToken = sessionCookies.refreshToken.value;

    const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${oldRefreshToken}`,
      },
    });

    assert(refreshRes.status === 200, 'POST /refresh returns 200 OK');
    const rotatedCookies = extractCookies(refreshRes.headers);
    assert(Boolean(rotatedCookies.accessToken), 'Rotated new accessToken cookie was issued');
    assert(Boolean(rotatedCookies.refreshToken), 'Rotated new refreshToken cookie was issued');
    assert(rotatedCookies.refreshToken.value !== oldRefreshToken, 'Refresh token was rotated to a new distinct value');

    console.log('\n--- Step 7: Refresh Token Reuse Detection ---');
    const reuseRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${oldRefreshToken}`,
      },
    });

    assert(reuseRes.status === 401, 'Reusing rotated refresh token is rejected with 401');
    const reuseBody = await reuseRes.json();
    assert(reuseBody.code === 'TOKEN_REUSE_DETECTED', 'Triggers TOKEN_REUSE_DETECTED error code');

    const userInStorage = inMemoryUsers.find((u) => u.email === 'aditya.cse@aust.edu');
    assert(userInStorage.refreshTokens.length === 0, 'All refresh tokens revoked from database upon reuse detection');

    console.log('\n--- Step 8: User Logout & Cookie Clearance ---');
    const loginAgain = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aditya.cse@aust.edu',
        password: 'Password123!',
      }),
    });
    const freshCookies = extractCookies(loginAgain.headers);

    const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'x-csrf-token': freshCookies._csrf.value,
        Cookie: buildCookieHeader(freshCookies),
      },
    });

    assert(logoutRes.status === 200, 'POST /logout returns 200 OK');
    const clearedCookies = extractCookies(logoutRes.headers);
    assert(
      clearedCookies.accessToken?.maxAge === '0' || clearedCookies.accessToken?.value === '',
      'accessToken cookie properly cleared with Max-Age=0'
    );
    assert(
      clearedCookies.refreshToken?.maxAge === '0' || clearedCookies.refreshToken?.value === '',
      'refreshToken cookie properly cleared with Max-Age=0'
    );

    console.log('\n=============================================================');
    console.log(` End-to-End Test Results: ${passed} passed, ${failed} failed`);
    console.log('=============================================================\n');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
}

runE2ETests();
