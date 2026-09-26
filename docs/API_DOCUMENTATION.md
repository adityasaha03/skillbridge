# 📖 SkillBridge REST API Specification

This document provides complete, production-grade documentation for the **SkillBridge** backend REST API. All endpoints are versioned and follow standardized JSON response structures, HTTP status conventions, and security patterns.

---

## 1. Overview & General Conventions

### Base URL
```text
Development: http://localhost:5000/api
Production:  https://your-domain.com/api
```

### Standard Response Structure
All responses are formatted as JSON objects with a boolean `success` flag:

**Success Response (`200 OK` / `201 Created`)**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status message"
}
```

**Error Response (`4xx` / `5xx`)**:
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### Authentication & CSRF Protection
- **Access JWT**: Supplied either via the `access_token` cookie or as a standard `Authorization: Bearer <TOKEN>` header.
- **Refresh JWT**: Stored in a secure `httpOnly` cookie (`refresh_token`) with `path: /` and `sameSite: lax`.
- **Double-Submit CSRF**: All state-modifying requests (`POST`, `PUT`, `DELETE`) require the `x-csrf-token` header matching the `_csrf` cookie value.

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Get CSRF Token
Retrieves a newly generated cryptographic CSRF token and sets the `_csrf` cookie.

- **Method**: `GET`
- **Endpoint**: `/api/auth/csrf-token`
- **Authentication**: None
- **Response (`200 OK`)**:
  ```json
  {
    "csrfToken": "b8f6c3826a798d1e4420e6a8bc8f7c9e1029384756abcdef..."
  }
  ```
- **cURL Example**:
  ```bash
  curl -X GET http://localhost:5000/api/auth/csrf-token -c cookies.txt
  ```

---

### 2.2 Register Student
Creates a new student account, establishes default skill arrays, and returns access credentials.

- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Authentication**: None
- **Headers**:
  - `Content-Type: application/json`
  - `x-csrf-token: <CSRF_TOKEN>`
- **Request Body**:
  ```json
  {
    "fullName": "Tahmid Khan",
    "email": "tahmid.khan@aust.edu",
    "password": "StrongPassword123#",
    "department": "CSE",
    "semester": 4
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "64f8a123bc456ef789012345",
      "fullName": "Tahmid Khan",
      "email": "tahmid.khan@aust.edu",
      "department": "CSE",
      "semester": 4
    }
  }
  ```
- **cURL Example**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -b cookies.txt -c cookies.txt \
    -H "Content-Type: application/json" \
    -H "x-csrf-token: <CSRF_TOKEN>" \
    -d '{
      "fullName": "Tahmid Khan",
      "email": "tahmid.khan@aust.edu",
      "password": "StrongPassword123#",
      "department": "CSE",
      "semester": 4
    }'
  ```

---

### 2.3 Login Student
Authenticates credentials and establishes session cookies.

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Authentication**: None
- **Headers**:
  - `Content-Type: application/json`
  - `x-csrf-token: <CSRF_TOKEN>`
- **Request Body**:
  ```json
  {
    "email": "tahmid.khan@aust.edu",
    "password": "StrongPassword123#"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "64f8a123bc456ef789012345",
      "fullName": "Tahmid Khan",
      "email": "tahmid.khan@aust.edu",
      "department": "CSE",
      "semester": 4
    }
  }
  ```

---

### 2.4 Refresh Access Token
Issues a new 15-minute access token utilizing the HttpOnly `refresh_token` cookie.

- **Method**: `POST`
- **Endpoint**: `/api/auth/refresh`
- **Authentication**: Requires valid `refresh_token` cookie
- **Headers**:
  - `x-csrf-token: <CSRF_TOKEN>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Access token refreshed successfully"
  }
  ```

---

### 2.5 Logout
Invalidates cookies and terminates the active session.

- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Headers**:
  - `x-csrf-token: <CSRF_TOKEN>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### 2.6 Get Active Session (`Me`)
Returns current authenticated user profile.

- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Authentication**: Protected (Valid Access Token)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "64f8a123bc456ef789012345",
      "fullName": "Tahmid Khan",
      "email": "tahmid.khan@aust.edu",
      "department": "CSE",
      "semester": 4
    }
  }
  ```

---

## 3. User & Profile Endpoints (`/api/users`)

### 3.1 Get User Profile
Retrieves user details along with populated `strongTags` and `weakTags`.

- **Method**: `GET`
- **Endpoint**: `/api/users/profile`
- **Authentication**: Protected
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "64f8a123bc456ef789012345",
      "fullName": "Tahmid Khan",
      "email": "tahmid.khan@aust.edu",
      "department": "CSE",
      "semester": 4,
      "bio": "Enthusiastic about web development and algorithms.",
      "contact": {
        "email": "tahmid.khan@aust.edu",
        "phone": "+8801700000000"
      },
      "strongTags": [
        { "id": "tag_01", "name": "React", "category": "Web Development" }
      ],
      "weakTags": [
        { "id": "tag_02", "name": "Python", "category": "Languages" }
      ]
    }
  }
  ```

---

### 3.2 Update Profile
Updates bio, department, semester, and skills. Automatically creates missing tags server-side.

- **Method**: `PUT`
- **Endpoint**: `/api/users/profile`
- **Authentication**: Protected
- **Headers**:
  - `Content-Type: application/json`
  - `x-csrf-token: <CSRF_TOKEN>`
- **Request Body**:
  ```json
  {
    "fullName": "Tahmid Khan",
    "department": "CSE",
    "semester": 5,
    "bio": "Updated bio focusing on full-stack engineering.",
    "strongSkills": ["React", "Node.js", "Docker"],
    "weakSkills": ["Machine Learning", "Python"]
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": { ... }
  }
  ```

---

### 3.3 Quick Update Skills
Allows instant modification of strong and weak skill arrays from the dashboard.

- **Method**: `PUT`
- **Endpoint**: `/api/users/skills`
- **Authentication**: Protected
- **Headers**:
  - `Content-Type: application/json`
  - `x-csrf-token: <CSRF_TOKEN>`
- **Request Body**:
  ```json
  {
    "strongSkills": ["React", "Express"],
    "weakSkills": ["Python", "DSA"]
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Skills updated successfully"
  }
  ```

---

## 4. Matchmaking Endpoints (`/api/matches`)

### 4.1 Get Match Suggestions
Runs the 2-cycle bipartite matching algorithm and returns ranked complementary peer suggestions.

- **Method**: `GET`
- **Endpoint**: `/api/matches/suggestions`
- **Authentication**: Protected
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "matches": [
      {
        "id": "user_peer_99",
        "name": "Nafis Sadik",
        "avatar": "N",
        "department": "CSE",
        "semester": 4,
        "teach": ["Python", "Machine Learning"],
        "learn": ["React"],
        "score": 9.5
      }
    ]
  }
  ```

---

### 4.2 Request Peer Match
Sends a connection request to a candidate peer.

- **Method**: `POST`
- **Endpoint**: `/api/matches/request`
- **Authentication**: Protected
- **Headers**:
  - `Content-Type: application/json`
  - `x-csrf-token: <CSRF_TOKEN>`
- **Request Body**:
  ```json
  {
    "targetUserId": "user_peer_99"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Connection request sent successfully",
    "matchId": "match_12345"
  }
  ```

---

### 4.3 Accept Match Request
Accepts an incoming match request and marks the status as `accepted`.

- **Method**: `POST`
- **Endpoint**: `/api/matches/:id/accept`
- **Authentication**: Protected
- **Headers**:
  - `x-csrf-token: <CSRF_TOKEN>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Match request accepted"
  }
  ```

---

### 4.4 Decline Match Request
Declines an incoming match request and marks status as `declined`.

- **Method**: `POST`
- **Endpoint**: `/api/matches/:id/decline`
- **Authentication**: Protected
- **Headers**:
  - `x-csrf-token: <CSRF_TOKEN>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Match request declined"
  }
  ```

---

### 4.5 Get Match History
Retrieves completed and active academic collaborations with mutual skill exchange records.

- **Method**: `GET`
- **Endpoint**: `/api/matches/history`
- **Authentication**: Protected
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "matches": [
      {
        "id": "match_12345",
        "peerId": "user_peer_99",
        "name": "Nafis Sadik",
        "department": "CSE",
        "semester": 4,
        "date": "Sep 20, 2026",
        "learned": ["Python", "ML"],
        "taught": ["React"],
        "status": "accepted"
      }
    ],
    "stats": {
      "totalExchanges": 1,
      "totalLearned": 2,
      "totalTaught": 1
    }
  }
  ```

---

## 5. Messages & Chat Endpoints (`/api/messages`)

### 5.1 Get Conversations
Returns a list of all peer conversations with last message previews and unread counts.

- **Method**: `GET`
- **Endpoint**: `/api/messages/conversations`
- **Authentication**: Protected
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "conversations": [
      {
        "matchId": "match_12345",
        "peerId": "user_peer_99",
        "peerName": "Nafis Sadik",
        "lastMessage": "Sounds great! See you tomorrow.",
        "lastMessageAt": "2026-09-26T16:30:00Z",
        "unreadCount": 0
      }
    ]
  }
  ```

---

### 5.2 Get Messages for Match
Fetches chat history for a specific match and automatically marks unread messages as read.

- **Method**: `GET`
- **Endpoint**: `/api/messages/:matchId`
- **Authentication**: Protected
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "messages": [
      {
        "id": "msg_001",
        "sender": "user_peer_99",
        "recipient": "64f8a123bc456ef789012345",
        "text": "Hello! When should we start discussing React?",
        "createdAt": "2026-09-26T16:20:00Z"
      }
    ]
  }
  ```

---

### 5.3 Send Message
Dispatches a new message to a peer within a match.

- **Method**: `POST`
- **Endpoint**: `/api/messages/:matchId`
- **Authentication**: Protected
- **Headers**:
  - `Content-Type: application/json`
  - `x-csrf-token: <CSRF_TOKEN>`
- **Request Body**:
  ```json
  {
    "text": "Let's begin tomorrow after the 2 PM lab!"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": {
      "id": "msg_002",
      "text": "Let's begin tomorrow after the 2 PM lab!",
      "sender": "64f8a123bc456ef789012345",
      "createdAt": "2026-09-26T16:35:00Z"
    }
  }
  ```

---

## 6. Notifications & Taxonomy Endpoints

### 6.1 Get Notifications
- **Method**: `GET` | **Endpoint**: `/api/notifications`
- Returns formatted alerts, relative time strings, and unread counters.

### 6.2 Mark Notifications Read
- **Method**: `PUT` | **Endpoint**: `/api/notifications/read-all` (All)
- **Method**: `PUT` | **Endpoint**: `/api/notifications/:id/read` (Single)

### 6.3 Skill Tags Listing
- **Method**: `GET` | **Endpoint**: `/api/tags`
- Returns list of all approved taxonomy tags with search regex filtering: `?search=react`.
