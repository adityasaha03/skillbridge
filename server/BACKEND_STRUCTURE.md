# SkillBridge Backend Architecture & Viva Preparation Guide

This document provides a comprehensive, production-grade breakdown of the SkillBridge backend architecture, database models, matchmaking algorithm, request-response flows, and an exhaustive viva question-and-answer guide.

---

## 1. Directory Structure Overview

```
server/
├── .env                       # Environment variables (PORT, MONGODB_URI, JWT secrets, CLIENT_URL)
├── .env.example               # Template for environment configuration
├── package.json               # Dependencies and scripts (Express, Mongoose, nodemon, etc.)
├── test/                      # Test suites
│   ├── matchingAlgorithmTest.js # Unit test suite for 2-cycle matchmaking algorithm
│   ├── unitTest.js            # Unit tests for JWT, hashing, cookie, and CSRF utils
│   ├── authTest.js            # Auth smoke test
│   └── e2eAuthTest.js         # End-to-end integration test
└── src/
    ├── index.js               # Entry point: loads .env, connects to DB, starts HTTP listener
    ├── app.js                 # Express application setup, middleware pipeline, route registration, error handlers
    ├── config/
    │   ├── db.js              # MongoDB connection via Mongoose with connection logging & exit on failure
    │   └── cookieConfig.js    # Cookie security attributes (httpOnly, sameSite, secure, maxAge)
    ├── models/
    │   ├── User.js            # User schema: profile info, strongTags, weakTags, auth credentials
    │   ├── Tag.js             # Tag taxonomy: name (unique), category, text indexes
    │   ├── Match.js           # Match connection: userA, userB, matchedOnTags, status, timestamps
    │   ├── Message.js         # Chat message: matchId, sender, recipient, text, read status
    │   └── Notification.js    # Notification event: recipient, sender, match, type, message, read
    ├── controllers/
    │   ├── matchController.js # Core matchmaking algorithm, requests, accept/decline, match history
    │   ├── userController.js  # Profile view/edit, skill tag resolution (resolveTagIds)
    │   ├── tagController.js   # Tag queries, search regex, categories via distinct, custom tag creation
    │   ├── messageController.js # 1-to-1 chat messaging, conversation list, unread counters, mark as read
    │   ├── notificationController.js # In-app notifications, relative timestamp formatting, mark read
    │   └── authController.js  # Partner portion: registration, login, token refresh, logout, CSRF
    ├── routes/
    │   ├── matchRoutes.js     # /api/v1/matches (suggestions, request, accept, decline, history)
    │   ├── userRoutes.js      # /api/v1/users (profile, skills)
    │   ├── tagRoutes.js       # /api/v1/tags (listing, search, categories, create)
    │   ├── messageRoutes.js   # /api/v1/messages (conversations, chat history, send)
    │   ├── notificationRoutes.js # /api/v1/notifications (list, read, read-all)
    │   └── authRoutes.js      # Partner portion: auth endpoints
    ├── middleware/
    │   ├── authMiddleware.js  # requireAuth: validates access JWT from cookie or Bearer header
    │   ├── csrfMiddleware.js  # Double-submit CSRF protection
    │   └── validateAuth.js    # Input sanitization and validation
    └── utils/
        ├── seedData.js        # Database seeder: standard academic taxonomy + sample student peers
        ├── jwt.js             # Token signing and verification
        └── cookieHelper.js    # Set and clear authentication cookies
```

---

## 2. Server Boot Lifecycle (`index.js` & `app.js`)

```
[npm run dev / start]
       │
       ▼
   index.js
       │── 1. dotenv.config() loads environment variables from .env
       │── 2. connectDB() connects to MongoDB via Mongoose
       │── 3. app.listen(PORT) starts listening for incoming HTTP connections
       ▼
    app.js Middleware Pipeline (Executed on every incoming HTTP Request):
       │
       ├── CORS Middleware: Configured with credentials: true, dynamic origin whitelist
       ├── express.json({ limit: '10kb' }): Parses incoming JSON bodies (prevents payload flood DoS)
       ├── express.urlencoded({ extended: true, limit: '10kb' }): Parses URL-encoded form data
       ├── cookieParser(): Parses cookies attached to req.headers.cookie into req.cookies
       ├── Request Logger: Logs HTTP Method and Path (sanitizes tokens in memory)
       │
       ▼
    Route Dispatchers:
       ├── /api/v1/auth          ──> authRoutes
       ├── /api/v1/users         ──> userRoutes        [requireAuth]
       ├── /api/v1/tags          ──> tagRoutes         [Public read / requireAuth write]
       ├── /api/v1/matches       ──> matchRoutes       [requireAuth]
       ├── /api/v1/messages      ──> messageRoutes     [requireAuth]
       ├── /api/v1/notifications ──> notificationRoutes[requireAuth]
       ├── /api/v1/health        ──> Health check endpoint (200 OK)
       │
       ▼
    Error Handling Pipeline:
       ├── 404 Handler: Catches all unmapped routes and returns JSON { success: false, message }
       └── Global 500 Error Handler: Catches unhandled exceptions/errors passed to next(err)
```

---

## 3. Database Schema & MongoDB Architecture

SkillBridge uses MongoDB via Mongoose ODM. Below is the relational structure and design rationale:

### 3.1 `User` Model (`models/User.js`)
* **Role**: Stores student identity, academic metadata, and skill references.
* **Fields**:
  * `fullName`: String, required, trimmed (2 to 100 characters).
  * `email`: String, unique, lowercase, regex-validated for email format.
  * `studentId`: String, unique, trimmed (e.g., `22.01.04.001`).
  * `department`: String, required (e.g., `CSE`, `EEE`).
  * `passwordHash`: String, `select: false` (hidden by default to prevent credential leakage).
  * `roles`: Array of String, enum: `['student', 'tutor', 'admin']`.
  * `strongTags`: Array of `mongoose.Schema.Types.ObjectId` referencing `Tag` (Skills I can teach).
  * `weakTags`: Array of `mongoose.Schema.Types.ObjectId` referencing `Tag` (Skills I want to learn).
  * `contextBio`: String, max 500 characters.
  * `semester`: String, e.g., `2.2`.
  * `institution`: String (default: `Ahsanullah University of Science and Technology`).
  * `avatar`: String (stores initials or image URL).
* **Mongoose Methods**:
  * `comparePassword(candidatePassword)`: Uses `bcrypt.compare` against `passwordHash`.
  * `toJSON()`: Strips `passwordHash`, `refreshTokens`, and `__v` before serialization.

### 3.2 `Tag` Model (`models/Tag.js`)
* **Role**: Academic and technical skills taxonomy.
* **Fields**:
  * `name`: String, unique, required, trimmed (e.g., `C++ Graph Algorithms`).
  * `category`: String, required (e.g., `Programming`, `Web Development`, `Databases`).
  * `createdBy`: `ObjectId` referencing `User` (null if seeded by system).
* **Indexes**:
  * Compound text index: `tagSchema.index({ name: 'text', category: 'text' })` for full-text search capability.

### 3.3 `Match` Model (`models/Match.js`)
* **Role**: Represents a bilateral exchange relationship between two students.
* **Fields**:
  * `userA`: `ObjectId` referencing `User` (Initiator/Requester, indexed).
  * `userB`: `ObjectId` referencing `User` (Recipient, indexed).
  * `matchedOnTags`:
    * `A_teaches_B`: `[ObjectId]` ref `Tag` (Intersections of A's strongTags and B's weakTags).
    * `B_teaches_A`: `[ObjectId]` ref `Tag` (Intersections of B's strongTags and A's weakTags).
  * `status`: Enum `['pending', 'accepted', 'declined', 'completed']` (default `'pending'`, indexed).
  * `initiatedAt`, `respondedAt`, `completedAt`: Date fields for audit and analytics.
* **Indexes**:
  * Compound index: `{ userA: 1, userB: 1, status: 1 }` to enforce query efficiency and prevent duplicate pending requests.

### 3.4 `Message` Model (`models/Message.js`)
* **Role**: 1-to-1 real-time direct messages between matched peers.
* **Fields**:
  * `matchId`: `ObjectId` referencing `Match` (indexed).
  * `sender`: `ObjectId` referencing `User` (indexed).
  * `recipient`: `ObjectId` referencing `User` (indexed).
  * `text`: String, required, trimmed, max 2000 characters.
  * `read`: Boolean (default `false`).
* **Indexes**:
  * Compound index: `{ matchId: 1, createdAt: 1 }` for rapid chronological chat retrieval.

### 3.5 `Notification` Model (`models/Notification.js`)
* **Role**: Async activity notifications (e.g., match invite, match accepted, system notices).
* **Fields**:
  * `recipient`: `ObjectId` referencing `User` (indexed).
  * `sender`: `ObjectId` referencing `User`.
  * `match`: `ObjectId` referencing `Match`.
  * `type`: Enum `['invite', 'accepted', 'declined', 'system']`.
  * `message`: String description.
  * `read`: Boolean (default `false`, indexed).

---

## 4. The Core Matchmaking Algorithm (Deep Dive)

### 4.1 Theoretical Foundation: Directed Cycles of Length 2
In standard tutoring platforms, matching is **unilateral** (Student pays Tutor).
In SkillBridge, matching is **bilateral / reciprocal**:
* A match is ONLY valid if there exists a **directed cycle of length 2**:
  1. $A \xrightarrow{\text{teaches}} B$ (User A has a skill in `strongTags` that User B has in `weakTags`).
  2. $B \xrightarrow{\text{teaches}} A$ (User B has a skill in `strongTags` that User A has in `weakTags`).
* If student A wants Python and student B knows Python, but student A knows C++ and student B wants React, they are **NOT** a reciprocal match.

### 4.2 Algorithm Code Walkthrough (`findReciprocalMatches`)
Located in `src/controllers/matchController.js`:

```javascript
const findReciprocalMatches = (currentUser, candidateUsers) => {
  // Step 1: Convert current user's tags to Sets for O(1) membership lookups
  const userWeakSet = new Set((currentUser.weakTags || []).map((t) => (t._id || t).toString()));
  const userStrongSet = new Set((currentUser.strongTags || []).map((t) => (t._id || t).toString()));

  // If user hasn't defined what they want to learn or what they can teach, no cycle can exist
  if (userWeakSet.size === 0 || userStrongSet.size === 0) {
    return [];
  }

  const matches = [];

  for (const peer of candidateUsers) {
    // Prevent self-matching
    if (peer._id.toString() === currentUser._id.toString()) continue;

    const peerStrongTags = peer.strongTags || [];
    const peerWeakTags = peer.weakTags || [];

    // Direction 1: B teaches A (Intersection: Peer's strongTags ∩ Current User's weakTags)
    const bTeachesA = peerStrongTags.filter((tag) =>
      userWeakSet.has((tag._id || tag).toString())
    );

    // Direction 2: A teaches B (Intersection: Current User's strongTags ∩ Peer's weakTags)
    const aTeachesB = (currentUser.strongTags || []).filter((tag) => {
      const tagId = (tag._id || tag).toString();
      return peerWeakTags.some((pt) => (pt._id || pt).toString() === tagId);
    });

    // Enforce 2-cycle reciprocity: BOTH directions must be non-empty
    if (bTeachesA.length > 0 && aTeachesB.length > 0) {
      matches.push({
        peer,
        aTeachesB,
        bTeachesA,
      });
    }
  }

  return matches;
};
```

### 4.3 Complexity Analysis
* **Time Complexity**:
  * Set creation for Current User: $O(W_A + S_A)$ where $W_A = |\text{weakTags}|$, $S_A = |\text{strongTags}|$.
  * For each candidate $N$:
    * Filtering `bTeachesA`: $O(S_B \times 1)$ because `userWeakSet.has(...)` is $O(1)$.
    * Filtering `aTeachesB`: $O(S_A \times W_B)$.
  * Total algorithm time: $O(N \cdot (S_B + S_A \cdot W_B))$.
  * Given $S, W \le 15$, this executes in sub-millisecond time.
* **Database Optimization (Pruning candidates before running the algorithm)**:
  ```javascript
  const candidatePeers = await User.find({
    _id: { $ne: currentUserId },
    strongTags: { $in: weakTagIds }, // MongoDB index query: Only inspect peers who have at least one skill I need
  });
  ```
  Instead of loading all thousands of users into memory ($O(U)$), MongoDB uses a multikey index on `strongTags` to only return relevant peers ($N \ll U$).

---

## 5. Endpoints & Controllers Reference

### 5.1 Match Controller (`controllers/matchController.js`)
| HTTP Method | Route | Controller Function | Description |
|---|---|---|---|
| `GET` | `/api/v1/matches/suggestions` | `getSuggestions` | Queries candidates via MongoDB `$in`, executes reciprocal cycle detection, joins existing match status (`pending`/`accepted`), returns formatted cards. |
| `POST` | `/api/v1/matches/request` | `sendMatchRequest` | Validates peer, ensures no duplicate pending match via `$or`, calculates exact exchange tags, saves `Match`, triggers `Notification` to recipient. |
| `PATCH` | `/api/v1/matches/:id/accept` | `acceptMatch` | Verifies caller is recipient (`userB`) with 403 authorization check. Updates status to `'accepted'`, sets `respondedAt`, fires acceptance notification to requester. |
| `PATCH` | `/api/v1/matches/:id/decline` | `declineMatch` | Verifies caller is participant (`userA` or `userB`). Sets status to `'declined'`. |
| `GET` | `/api/v1/matches/history` | `getMatchHistory` | Queries matches with status `accepted` or `completed`. Calculates aggregates: `totalPeople`, `totalLearned`, `totalTaught`. |

### 5.2 User & Skills Controller (`controllers/userController.js`)
| HTTP Method | Route | Controller Function | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/profile` | `getProfile` | Fetches authenticated user's document, populates `strongTags` & `weakTags`, serializes with `.toJSON()`. |
| `PUT` | `/api/v1/users/profile` | `updateProfile` | Updates editable profile fields (`fullName`, `department`, `semester`, `phone`, `avatar`, `institution`, `contextBio`) with strict field whitelisting. |
| `PUT` | `/api/v1/users/skills` | `updateSkills` | Invokes `resolveTagIds` for `wantToLearn` and `canTeach`. Atomically updates user's `weakTags` and `strongTags`. |

#### Dynamic Tag Resolution (`resolveTagIds`):
Handles mixed inputs when updating skills:
* If input is an existing `ObjectId` $\rightarrow$ keeps it.
* If input is an object with `_id` $\rightarrow$ extracts ID.
* If input is a new text string (e.g. `"GraphQL"`) $\rightarrow$ searches `Tag` collection with case-insensitive regex `^name$`. If it does not exist, dynamically creates the `Tag` on the fly and returns the new `_id`.

### 5.3 Tag Controller (`controllers/tagController.js`)
| HTTP Method | Route | Controller Function | Description |
|---|---|---|---|
| `GET` | `/api/v1/tags` | `getAllTags` | Returns all tags. Supports query parameters `?category=...` and `?search=...` (case-insensitive regex search). |
| `GET` | `/api/v1/tags/categories` | `getCategories` | Executes `Tag.distinct('category')` for high-performance extraction of unique categories. |
| `POST` | `/api/v1/tags` | `createTag` | Creates a new taxonomy tag with duplicate check. |

### 5.4 Messaging Controller (`controllers/messageController.js`)
| HTTP Method | Route | Controller Function | Description |
|---|---|---|---|
| `GET` | `/api/v1/messages/conversations` | `getConversations` | Finds all accepted matches. For each match, retrieves the most recent message (`sort({ createdAt: -1 }).lean()`) and counts unread messages for the logged-in user. |
| `GET` | `/api/v1/messages/:matchId` | `getMessages` | Validates participation in match (returns 403 if unauthorized). Automatically marks all unread messages for current user as `read: true` via `updateMany()`, returns message history. |
| `POST` | `/api/v1/messages/:matchId` | `sendMessage` | Validates text and match membership, determines recipient dynamically, saves message, updates `match.updatedAt`. |

### 5.5 Notification Controller (`controllers/notificationController.js`)
| HTTP Method | Route | Controller Function | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | `getNotifications` | Retrieves top 50 notifications for user, populates sender information, counts unread, computes human-friendly relative time (`Just now`, `X mins ago`, `Yesterday`, `X days ago`). |
| `PATCH` | `/api/v1/notifications/:id/read` | `markNotificationRead` | Marks single notification as read, ensuring ownership (`recipient: currentUserId`). |
| `PATCH` | `/api/v1/notifications/read-all` | `markAllRead` | Batch updates all unread notifications to read for current user. |

---

## 6. Comprehensive Viva Q&A Guide

### Section A: Architecture, Node.js & Express

**Q1: Why is Express.js structured into Routes, Controllers, Models, and Middleware?**
> **Answer**: This follows the **Separation of Concerns (SoC)** architectural pattern:
> * **Routes**: Pure endpoint routing and HTTP method mapping.
> * **Middleware**: Pre-processing (authentication verification, CORS headers, input parsing, error capturing).
> * **Controllers**: Pure business logic (orchestrating database queries, executing the matching algorithm, formatting HTTP responses).
> * **Models**: Schema definition, database validations, indexes, and data access methods.
> This makes the code modular, independently testable, maintainable, and prevents bloated route files.

**Q2: What is the purpose of `app.use(express.json({ limit: '10kb' }))`?**
> **Answer**: It parses incoming HTTP request bodies with JSON payloads into `req.body`. The `limit: '10kb'` restriction is a crucial security defense against **Denial of Service (DoS)** attacks, preventing malicious clients from exhausting server memory by sending massive JSON payloads.

**Q3: How does your global error handling middleware work?**
> **Answer**: In `app.js`, it is placed at the very end of the pipeline with 4 arguments `(err, req, res, next)`. Whenever a controller encounters an exception or calls `next(error)`, Express skips all remaining middlewares and jumps directly to this handler. It logs the error and returns a clean JSON response `{ success: false, message }` with appropriate status code (defaulting to 500), omitting stack traces in production to prevent information disclosure.

**Q4: How does authentication state reach your controllers if your colleague handled auth?**
> **Answer**: Through the `requireAuth` middleware (`src/middleware/authMiddleware.js`). When a client makes an authenticated request, `requireAuth` extracts and verifies the JWT token, decodes the payload, and attaches `req.user = { userId, email, roles }`. In my controllers (`matchController`, `userController`, `messageController`), I retrieve the authenticated student ID simply using `req.user.userId`.

---

### Section B: MongoDB, Mongoose & Database Design

**Q5: Why did you use referencing (`ObjectId` + `ref`) instead of embedding for Tags and Users in Matches?**
> **Answer**: In MongoDB, you choose between **Embedding** and **Referencing**:
> * We used **Referencing** for `strongTags` and `weakTags` because skills are a shared taxonomy across all university students. If a tag name changes or is queried for global analytics, referencing prevents data duplication and update anomalies.
> * For `Match` and `Message`, referencing `User` via `ObjectId` prevents storing duplicate large user objects inside every match record and keeps document size minimal.

**Q6: What is the difference between `.populate()` and an SQL `JOIN`?**
> **Answer**: An SQL `JOIN` happens inside the relational database engine in a single query planner pass. In Mongoose, `.populate('strongTags')` performs an initial query to fetch the parent document, extracts the referenced `ObjectId`s, and executes a second `$in` query under the hood to fetch the child documents, merging them in Node.js memory.

**Q7: Explain the compound index you added on the `Match` schema.**
> **Answer**: `matchSchema.index({ userA: 1, userB: 1, status: 1 })`.
> When searching for existing requests between two users:
> ```javascript
> Match.findOne({
>   $or: [{ userA, userB }, { userA: peerId, userB: currentUserId }],
>   status: { $in: ['pending', 'accepted'] }
> })
> ```
> Without an index, MongoDB would perform a **Collection Scan (COLLSCAN)**, reading every single match document in the database ($O(M)$). With this compound index, MongoDB does an **Index Scan (IXSCAN)** with $O(\log M)$ B-tree lookup time.

**Q8: What is `.lean()` and why did you use it in `getConversations`?**
> **Answer**: In `messageController.js`, we use `Message.findOne(...).sort({ createdAt: -1 }).lean()`.
> By default, Mongoose wraps query results in full Mongoose Document instances with change tracking, getters, setters, and internal methods. Adding `.lean()` instructs Mongoose to return a plain JavaScript object (POJO), which skips Mongoose instantiation overhead and is up to 5x faster and significantly more memory-efficient.

**Q9: What does `Tag.distinct('category')` do and why is it preferred over `Tag.find()`?**
> **Answer**: `Tag.distinct('category')` executes an aggregation operation inside the MongoDB server engine that scans the index and returns an array of unique category strings. If there are 1,000 tags across 6 categories, `distinct` returns 6 strings directly without transferring 1,000 tag documents over the network.

---

### Section C: Matchmaking Algorithm & Business Logic

**Q10: Explain your matchmaking algorithm in plain English.**
> **Answer**: "SkillBridge implements a reciprocal 2-cycle matching algorithm. Rather than matching a student with anyone who teaches what they want, we only suggest peers where an exchange of knowledge is mutual.
> 1. We fetch the current student's learning targets (`weakTags`) and teaching strengths (`strongTags`).
> 2. We query MongoDB for candidate peers whose `strongTags` intersect with our `weakTags`.
> 3. We check for a directed 2-cycle: Does Peer teach Current User ($B \cap A_{weak} \neq \emptyset$) AND does Current User teach Peer ($A \cap B_{weak} \neq \emptyset$)?
> 4. If both directions have at least one overlapping skill, they are returned as a reciprocal match, with the specific exchange skills highlighted."

**Q11: How do you prevent a user from sending multiple connection requests to the same peer?**
> **Answer**: In `matchController.js` $\rightarrow$ `sendMatchRequest`:
> We execute a preliminary query using MongoDB's `$or` operator:
> ```javascript
> const existing = await Match.findOne({
>   $or: [
>     { userA: currentUserId, userB: peerId },
>     { userA: peerId, userB: currentUserId },
>   ],
>   status: { $in: ['pending', 'accepted'] },
> });
> ```
> If a match is found, the server immediately rejects the request with HTTP `409 Conflict`.

**Q12: How do you ensure that only the recipient can accept a match request?**
> **Answer**: In `acceptMatch`:
> ```javascript
> if (match.userB.toString() !== currentUserId) {
>   return res.status(403).json({ success: false, message: 'Only the recipient of this request can accept it.' });
> }
> ```
> `userA` is the requester and `userB` is the recipient. If `userA` tries to call `/api/v1/matches/:id/accept`, the ID comparison fails and the server returns HTTP `403 Forbidden`.

**Q13: How does the messaging system authorize chat participants?**
> **Answer**: In `getMessages` and `sendMessage`:
> Before returning or saving messages for a `matchId`, the server fetches the `Match` document and checks:
> ```javascript
> if (match.userA.toString() !== currentUserId && match.userB.toString() !== currentUserId) {
>   return res.status(403).json({ success: false, message: 'Unauthorized' });
> }
> ```
> If an arbitrary student knows the `matchId` of two other students, they cannot spy on the messages or inject messages into their chat.

**Q14: How does `resolveTagIds` work when a user types custom skills?**
> **Answer**: Users can select predefined tags or type new tags. `resolveTagIds` receives an array of tag strings or IDs. For every item:
> 1. If it is already a valid MongoDB `ObjectId`, it keeps it.
> 2. If it is a string name (e.g. `"Three.js"`), it queries `Tag.findOne` using a case-insensitive regular expression `^Three.js$`.
> 3. If the tag already exists, its `_id` is re-used.
> 4. If it doesn't exist, it creates a new `Tag` record dynamically in the database and returns its new `_id`.
> This prevents duplicate tags (e.g., preventing `"python"` and `"Python"` from creating two records) while allowing the academic taxonomy to grow organically.

---

### Section D: HTTP Status Codes & REST Conventions

| Status Code | Meaning | Where used in SkillBridge |
|---|---|---|
| `200 OK` | Successful retrieval/update | `getProfile`, `getSuggestions`, `getMessages`, `getConversations`, `getNotifications`, `acceptMatch` |
| `201 Created` | Successful resource creation | `sendMatchRequest`, `sendMessage`, `createTag` |
| `400 Bad Request` | Client validation failure / missing fields | Missing message text, connecting with self, missing peer ID |
| `401 Unauthorized` | Missing or invalid auth token | Handled by `requireAuth` middleware |
| `403 Forbidden` | Authenticated but not authorized | Trying to accept someone else's match or read someone else's chat |
| `404 Not Found` | Resource does not exist | User not found, Match ID not found, unmapped endpoint |
| `409 Conflict` | Duplicate state conflict | Match request already exists, Tag name already exists |
| `500 Internal Error`| Unhandled server exception | Database down, unexpected runtime errors caught in `try...catch` |

---

## 7. How to Run Tests to Verify Server Functionality

To run the automated tests before your viva:
```bash
# Run both unit tests and matching algorithm tests
npm test

# Run matching algorithm tests specifically
node test/matchingAlgorithmTest.js

# Seed database with sample students and academic topics
npm run seed
```
