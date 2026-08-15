# SkillBridge - Peer-to-Peer Academic Reciprocity Network

**University:** Ahsanullah University of Science and Technology (AUST)  
**Semester:** 2.2 Project Proposal  
**Team Members:** Shirsha Chowdhury, Aditya Saha, [Third Member Name]  
**Tech Stack:** MongoDB, Express.js, React, Node.js (MERN)

---
hello 
## 1. Project Overview

### The Problem
In rigorous engineering programs, the curriculum moves fast. Students frequently hit roadblocks on highly specific topics—for example, struggling to grasp graph traversal cycles or articulation points in C++, while simultaneously excelling at building UI layouts. 
* Office hours are limited and often clash with schedules.
* Broadcasting questions to massive university group chats rarely yields a dedicated, one-on-one teaching session.
* Existing study groups often form by social proximity rather than complementary academic skills.

### The Gap
There is no localized, real-time marketplace for *knowledge exchange*. There is no system that analyzes what one student lacks and pairs them with a peer who specifically excels at that exact topic. Current solutions rely on one-way tutoring rather than mutual exchange.

### The Solution: SkillBridge
SkillBridge creates a system of **academic reciprocity**. It removes the social friction of asking for free tutoring by ensuring a mutual trade of expertise. The platform uses a taxonomy-based matching algorithm to pair students based on their complementary strengths and weaknesses.

---

## 2. Technical Architecture

### Tech Stack
* **Database:** MongoDB (NoSQL schema optimized for fast querying of tag arrays)
* **Backend:** Node.js with Express.js (REST API & Matching Engine)
* **Frontend:** React.js (Interactive UI, Match Cards, and Autocomplete Tagging)
* **Authentication:** JSON Web Tokens (JWT) for secure user sessions

---

## 3. Database Schema Design (MongoDB)

To ensure the matching algorithm is mathematically sound and fast, the system avoids free-text inputs for skills and instead relies on a strict **Taxonomy Collection** using standardized ObjectIds.

#### A. The `Tag` Model (Taxonomy)
Stores standardized academic topics to prevent string mismatches (e.g., "C++" vs "cpp").

JSON
{
  "_id": "ObjectId('tag_101')",
  "name": "C++ Graph Algorithms",
  "category": "Data Structures"
}
#### B. The User Model
Stores references to the Tags. The contextBio field allows human-readable context for the match.

JSON
{
  "_id": "ObjectId('user_001')",
  "name": "User Name",
  "semester": "2.2",
  "department": "CSE",
  "strongTags": ["ObjectId('tag_101')", "ObjectId('tag_102')"], 
  "weakTags": ["ObjectId('tag_201')", "ObjectId('tag_202')"],
  "contextBio": "I am comfortable with C++ memory management and graphs, but I need someone to explain React state for my web project."
}
#### C. The Match Model
Records when a reciprocal connection is found and tracks the status of the study session.

JSON
{
  "userA": "ObjectId('user_001')",
  "userB": "ObjectId('user_002')",
  "matchedOnTags": {
     "A_teaches_B": ["ObjectId('tag_101')"],
     "B_teaches_A": ["ObjectId('tag_201')"]
  },
  "status": "pending" 
}
## 4. The Matching Algorithm (Core Engine)
The system models students as nodes and knowledge transfers as directed edges. The algorithm searches for a cycle of length 2 (a mutual connection) using fast array intersections.

The Trigger: When a user updates their profile, the backend retrieves their weakTags array.

The Query: The database queries for all active users whose strongTags contain at least one of the initial user's weakTags.

The Reciprocity Check (Inverse Match): For every potential tutor found, the algorithm checks the reverse: Does the initial user's strongTags array contain at least one of the potential tutor's weakTags?

The Bridge: If a mutual exchange is verified, the system generates a "Match Object" and pushes a notification to the frontend. Users view each other's contextBio and specific matched tags before accepting the study session.

## 5. Team Responsibilities
To ensure parallel development and maximum efficiency, the MERN stack is divided into three distinct roles:

Member 1 (Backend & Algorithm):

Design MongoDB schemas using Mongoose.

Build the Reciprocal Matchmaking Algorithm.

Implement JWT authentication and protected API routes.

Member 2 (Frontend UI):

Build the React component architecture.

Design the dynamic "Match Cards" displaying mutual tags and bios.

Create the user profile dashboard and the Bridge Accept/Reject workflow.

Member 3 (Integrator & Taxonomy):

Implement the Autocomplete Tag Input (connecting React frontend to Node backend in real-time).

Build the dynamic tag creation system (allowing users to submit new academic tags).

Manage REST API endpoints and data fetching states.