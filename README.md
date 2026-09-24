# 🔍 KhojMitra (खोज-मित्र) - Production Lost & Found Portal
### *Enterprise Office & Global Smart Lost-and-Found Management Network*

---

## 🌟 Executive Summary & Problem Statement

In corporate campuses, multi-floor enterprise offices, universities, and smart cities, thousands of valuable personal belongings (smartphones, employee ID badges, laptops, car keys, wallets, specs) are misplaced daily. Existing solutions rely on noisy WhatsApp/Slack groups or unmoderated physical notice boards, leading to:
1. **Zero Ownership Verification**: Anyone can fraudulently claim high-value items.
2. **No Custody Tracking**: No central logging of where the found item is physically stored.
3. **Unrewarded Honesty**: Honest finders receive no recognition or incentives.
4. **No Real-Time Coordination**: No secure, private communication channel between finder and owner.

**KhojMitra** solves this through a zero-trust, automated 5-question verification engine, central helpdesk custody management, real-time secure communication, and an integrated gratitude reward system.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite + Tailwind)            │
│  - Modern Dashboard         - 5-Question Interactive Quiz   │
│  - Explore & City/Office Filter - Real-Time Chat (WebSocket)│
│  - Admin Moderation Suite   - Rewards & Gratitude Modal     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / WebSocket (STOMP)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot 3.3.x Backend (Java 21)             │
│  - Spring Security (Stateless JWT Authentication)           │
│  - Role-Based Access Control (ROLE_USER, ROLE_ADMIN)        │
│  - Ownership Verification Engine (3/5 passing score)        │
│  - WebSocket Message Broker (SockJS + STOMP)                │
│  - Central Desk Custody State Machine                       │
│  - Automated Reward Split Calculation Engine                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Database (Collections)                 │
│  - users        - items         - claims                    │
│  - messages     - rewards       - audit_logs                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Business Logic & End-to-End User Flow

### 1. Item Submission & Custody Assignment
* **Lost Item**: A user posts details of their missing article (Title, Category, Description, City/Locality or Office Tower/Floor, Date Misplaced, Image, Contact Preference). Status: `LOST_POSTED`.
* **Found Item**: 
  - A user who finds an item posts its visible details.
  - **Ownership Challenge**: The finder must provide **5 specific verification questions** with correct answers/clues (e.g. *What wallpaper is on the lockscreen?*, *What keychains are attached?*, *What sticker is on the laptop?*).
  - **Drop-off Point**: Finder selects the Central Custody location (e.g., *Tower B - Ground Floor Security Desk*).
  - Initial Status: `PENDING_APPROVAL` (Hidden from public listings to eliminate spam/false posts).

### 2. Admin Moderation Gate
* Admin reviews the reported Found item.
* Upon validation, Admin approves it -> Status transitions to `APPROVED` and appears on the Explore feed.
* If deemed duplicate or fraudulent, Admin rejects/deletes the item.

### 3. Claim Attempt & 5-Question Challenge (Security Gate)
* A potential owner finds the item on the feed and clicks **"Claim This Item"**.
* The claimant must answer the **5 verification questions** set by the finder.
* **Pass Threshold**: Claimant must score at least **3 out of 5** (>= 60%).
* If failed (< 3): Claim is blocked to protect the finder from brute-force claims.
* If passed (>= 3): A claim record is created with status `QUIZ_PASSED`, and a **private real-time chat** is unlocked.

### 4. Direct Finder-Owner Interaction & Finder Sign-off
* Both parties communicate in real-time via WebSocket-powered secure chat.
* They verify edge-case details and confirm drop-off tracking.
* Once the finder is convinced: Finder clicks **"Confirm Genuine Owner"** -> Status moves to `CONFIRMED_BY_FINDER`.

### 5. Central Desk Handover & Final Delivery
* Admin / Security Desk at the central drop location inspects claimant's identity and approves physical handover.
* Status moves to `READY_FOR_PICKUP` -> `RETURNED`.

### 6. Gratitude & Fair Reward Engine
* Upon successful return, the claimant has the option to tip the finder (e.g., ₹50, ₹100, ₹200, ₹500).
* **Reward Split Rule**:
  - **50%** transferred to the Finder.
  - **50%** retained as Platform Convenience/Maintenance Fee.
* **Goodwill Clause**:
  - If the claimant gives **₹0** (no tip), the platform automatically grants a **10% goodwill bonus / 10 Karma Points** to the finder from the platform reserve to reward and encourage honesty!

---

## 📊 Database Schema Design (MongoDB)

### 1. `User` Collection
```json
{
  "_id": "ObjectId",
  "fullName": "Rohit Kumar",
  "email": "rohit@company.com",
  "password": "hashed_bcrypt_password",
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "department": "Engineering",
  "officeLocation": "Gurugram Tower 3",
  "karmaPoints": 50,
  "walletBalance": 250.00,
  "createdAt": "2026-09-24T12:00:00Z"
}
```

### 2. `Item` Collection
```json
{
  "_id": "ObjectId",
  "title": "Noise ColorFit Smartwatch",
  "description": "Black strap smartwatch found near cafeteria coffee machine",
  "category": "ELECTRONICS",
  "type": "FOUND",
  "location": {
    "city": "Gurugram",
    "locality": "Cyber City",
    "officeBuilding": "Tower B",
    "floor": "4th Floor Cafeteria"
  },
  "imageUrl": "data:image/png;base64,...",
  "status": "APPROVED",
  "centralDropLocation": "Tower B Ground Floor Reception Desk",
  "finderUserId": "user_id_123",
  "verificationQuestions": [
    { "id": 1, "question": "What color is the strap buckle?", "answer": "Silver" },
    { "id": 2, "question": "What is the watch face theme?", "answer": "Spiderman" },
    { "id": 3, "question": "Is there any scratch on the screen?", "answer": "Small scratch top right" },
    { "id": 4, "question": "What is the initial letter in the Bluetooth name?", "answer": "R" },
    { "id": 5, "question": "What brand logo is on the charger connector?", "answer": "Noise" }
  ],
  "createdAt": "2026-09-24T12:30:00Z"
}
```

### 3. `Claim` Collection
```json
{
  "_id": "ObjectId",
  "itemId": "item_id_456",
  "claimantUserId": "user_id_789",
  "finderUserId": "user_id_123",
  "score": 4,
  "submittedAnswers": [
    { "questionId": 1, "userAnswer": "Silver", "isCorrect": true },
    { "questionId": 2, "userAnswer": "Spiderman", "isCorrect": true },
    { "questionId": 3, "userAnswer": "Scratch on top right corner", "isCorrect": true },
    { "questionId": 4, "userAnswer": "R", "isCorrect": true },
    { "questionId": 5, "userAnswer": "Boat", "isCorrect": false }
  ],
  "status": "FINDER_VERIFIED",
  "createdAt": "2026-09-24T13:00:00Z"
}
```

### 4. `ChatMessage` Collection
```json
{
  "_id": "ObjectId",
  "claimId": "claim_id_789",
  "senderId": "user_id_789",
  "receiverId": "user_id_123",
  "message": "Hey! Thanks for finding it. I'll collect it from Tower B reception at 4 PM.",
  "timestamp": "2026-09-24T13:05:00Z"
}
```

### 5. `Reward` Collection
```json
{
  "_id": "ObjectId",
  "claimId": "claim_id_789",
  "claimantId": "user_id_789",
  "finderId": "user_id_123",
  "totalTip": 200.00,
  "finderReward": 100.00,
  "platformFee": 100.00,
  "isPlatformGoodwillBonus": false,
  "createdAt": "2026-09-24T13:10:00Z"
}
```

---

## 🛠️ Tech Stack & Tooling

| Layer | Technology |
|---|---|
| **Backend** | Spring Boot 3.3.x, Java 21, Spring Security 6, Spring Data MongoDB, WebSocket (STOMP) |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router 6, StompJS |
| **Database** | MongoDB 8.x (Compatible with MongoDB Community & MongoDB Atlas) |
| **Build Tools** | Apache Maven 3.9+, Node.js 24+, npm 11+ |
| **Container & Ops**| Dockerfile, Docker Compose, Nginx, Environment Configuration |

---

## 🗺️ Step-by-Step Implementation Roadmap

- [x] **Phase 1: Environment & Tooling Verification**
  - Java 21, Maven 3.9, Node.js 24, npm 11, MongoDB Server 8.3 verified and configured.
- [ ] **Phase 2: Spring Boot Backend Architecture**
  - Maven project structure with clean tiered architecture (`config`, `controller`, `service`, `repository`, `model`, `dto`, `security`, `websocket`).
  - JWT Authentication (Register, Login, Google OAuth profile payload support, Role guards).
  - Item Management API (Post Lost, Post Found with 5 Questions & Central Desk, Moderation endpoints).
  - Claim & Verification Quiz Engine (Evaluating 3/5 answers, unlocking chat).
  - Real-time WebSocket Chat (STOMP broker for private communication).
  - Rewards & Admin Delivery Finalization.
- [ ] **Phase 3: Modern React Frontend Development**
  - Responsive Tailwind UI with navigation, badge counts, and notifications.
  - Auth Modals / Pages (Login, Register, Role switch).
  - Feed / Explore with City/Locality & Office Floor filters.
  - Post Lost / Post Found Form with 5 Question Builder.
  - Interactive 5-Question Claim Modal with instant validation feedback.
  - Live Chat Box (WebSocket integration).
  - Admin Moderation & Handover Dashboard.
  - Finder Tip & Gratitude Modal.
- [ ] **Phase 4: Full Stack Integration & Testing**
  - Automated seeding of demo accounts (Admin & Users) and sample items.
  - End-to-end user testing (Post -> Admin Approve -> Claim -> Quiz 3/5 -> Chat -> Verify -> Admin Handover -> Reward).
- [ ] **Phase 5: Production Deployment Guide & Dockerization**
  - Production `Dockerfile`, `docker-compose.yml`, and cloud deployment configs.
