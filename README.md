# SignalX

Site Deployed on Render - https://signalx-1-front.onrender.com/
API-Docs - https://signalx-u4k3.onrender.com/docs
A full-stack Signal Messenger clone built as an SDE Fullstack take-home assignment. Replicates Signal's design, user experience, and core messaging workflows using a modern Python + TypeScript stack.

---

## Features

### ✅ Authentication
- Mock OTP login — any seeded phone number + OTP `123456`
- JWT-based session with 24-hour expiry
- Session persistence via `localStorage` — survives page refresh
- Logout with server-side token revocation
- Session restoration on app load via `GET /api/auth/me`

### ✅ Profile
- Edit display name
- Upload profile photo (file picker, stored on server, max 5 MB)
- Choose from A–Z letter avatars (26 options, each a unique colour)
- Avatar displayed consistently in sidebar, header, and conversation details

### ✅ Contacts
- Seeded contact relationships between users
- Contact list stored in the database with directional ownership

### ✅ Conversation List
- Sidebar showing all conversations sorted by most recent activity
- Last message preview (truncated to 60 characters)
- Unread message count badge
- Online / last-seen indicator
- Search / filter conversations by name
- Real-time reordering when a new message arrives

### ✅ One-on-One Messaging
- Send and receive text messages in real time
- Messages persist in SQLite — full history on reload
- Delivery status with Signal-style tick icons:
  - 🕐 Sending (optimistic, client-side only)
  - ✓ Sent (persisted on server)
  - ✓✓ Delivered (grey — recipient's client received it)
  - ✓✓ Read (blue — recipient opened the conversation)
- Typing indicators (not yet wired end-to-end)
- Optimistic UI — message appears instantly, replaced with confirmed server response

### ✅ Group Messaging
- Support for GROUP and DIRECT conversations via a single `conversations` table
- Groups have a name, avatar, creator, and admin role
- Messages delivered to all active group members via WebSocket broadcast
- Per-member receipt tracking (each recipient has an independent receipt row)

### ✅ Reply to Messages
- Reply to any message in a conversation
- Quoted snippet shown above the reply text in the message bubble
- `reply_to_id` self-referencing FK — original content never duplicated

### ✅ File / Image Attachments
- Attachment records stored in the database linked to their message
- Attachment previews rendered in message bubbles (image vs file distinguished by MIME type)
- Seeded demo attachments included

### ✅ Conversation Details
- Click the info icon (ⓘ) in any conversation header to open the details page
- **Group conversations** — real member list fetched from the API, showing:
  - Member avatar, display name
  - Admin badge
  - Online status indicator
  - Last seen timestamp (e.g. "Last seen 2h ago", "Online")
- **Direct conversations** — peer's last-seen status and contact info
- Placeholder cards for Media, Mute Notifications, Block, Leave Group

### ✅ Dark Mode
- Toggle between light and dark themes
- Preference persisted in `localStorage`
- Applied before first paint — no flash of wrong theme

### ✅ Responsive Layout
- Full split-pane layout on desktop (sidebar + chat)
- Mobile: sidebar and chat pane toggle — only one visible at a time
- Back button in conversation header on mobile

### ✅ Placeholder Sections
- Voice Call — "Coming Soon"
- Video Call — "Coming Soon"
- Stories — "Coming Soon"
- Linked Devices — "Coming Soon"
- Settings (Privacy, Notifications, Appearance) — placeholder pages

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Frontend state | Zustand (auth + UI) + React Query (server state) |
| Real-time (client) | Native WebSocket API |
| Backend | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 async (aiosqlite) |
| Validation | Pydantic v2 |
| Real-time (server) | FastAPI WebSockets |
| Auth | JWT via python-jose, stored in localStorage |
| Database | SQLite |
| File storage | Local filesystem (`/uploads`) |

---

## Architecture

```
Browser (Next.js)
    │
    ├── REST (HTTP)  ──────────────────► FastAPI
    │                                       │
    └── WebSocket ──────────────────────►   │
                                        Service Layer
                                            │
                                        Repository Layer
                                            │
                                        SQLite (signalx.db)
```

WebSockets are used **only** for real-time push events. REST is the source of truth for all data.

### Backend structure

```
backend/app/
├── main.py           FastAPI app, routers, CORS, static file mount
├── config.py         Pydantic BaseSettings (reads .env)
├── database.py       Async SQLAlchemy engine + session factory
├── seed.py           Idempotent seed script (runs on startup)
├── models/           SQLAlchemy ORM models
├── schemas/          Pydantic request/response schemas
├── routers/          FastAPI APIRouters (auth, conversations)
├── services/         Business logic layer
├── repositories/     Database query layer
├── websocket/        ConnectionManager + WS router
└── middleware/       JWT Bearer dependency
```

### Frontend structure

```
frontend/
├── app/
│   ├── (auth)/login/     Login page (phone step + OTP step)
│   ├── chat/             Main chat layout
│   │   └── details/      Conversation / contact info page
│   ├── settings/         Settings placeholder pages
│   ├── voice/            Voice call placeholder
│   ├── video/            Video call placeholder
│   ├── stories/          Stories placeholder
│   └── devices/          Linked devices placeholder
├── components/
│   ├── auth/             PhoneStep, OTPStep, AuthProvider
│   ├── conversation/     Header, MessageList, MessageBubble, Composer
│   ├── sidebar/          Sidebar, ConversationList, ConversationItem, UserProfile
│   └── shared/           Avatar, ProfileModal
├── hooks/                useConversations, useMessages, useWebSocket
├── lib/                  api.ts (typed fetch wrapper), avatarApi
├── store/                Zustand: auth, conversation, ui
└── types/                TypeScript interfaces for all domain types
```

---

## Database Schema

Eight tables. No NoSQL, no ORMs with magic — plain SQLAlchemy 2.0 mapped columns.

```
users               id, phone (UNIQUE), display_name, avatar_url,
                    is_online, last_seen_at, created_at

sessions            id, user_id → users, token_hash (SHA-256 of JWT),
                    expires_at, revoked, created_at

contacts            owner_id → users, contact_id → users
                    PK: (owner_id, contact_id)

conversations       id, type (DIRECT|GROUP), name, avatar_url,
                    created_by → users, created_at, updated_at

conversation_members conversation_id → conversations, user_id → users,
                    is_admin, joined_at
                    PK: (conversation_id, user_id)

messages            id, conversation_id → conversations,
                    sender_id → users, content, message_type (text|image|file),
                    reply_to_id → messages (self-ref, SET NULL),
                    created_at

message_receipts    message_id → messages, user_id → users,
                    status (delivered|read), updated_at
                    PK: (message_id, user_id)

attachments         id, message_id → messages, file_name, mime_type,
                    file_size_bytes, storage_path, created_at
```

**Key design decisions:**
- One `conversations` table for both DIRECT and GROUP — `type` column discriminates. No separate DirectChat/GroupChat tables.
- `message_receipts` instead of `messages.status` — per-user receipts correctly model group delivery (each member has an independent row). Aggregate status (sent/delivered/read) is computed at query time.
- `reply_to_id` self-referencing FK — quoted content is never duplicated; the original message is fetched by ID at render time.

---

## API Reference

All endpoints require `Authorization: Bearer <token>` except `/api/auth/request-otp` and `/api/auth/verify-otp`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/request-otp` | Validate phone, return OTP challenge |
| POST | `/api/auth/verify-otp` | Verify OTP (always `123456`), return JWT |
| GET  | `/api/auth/me` | Return current user profile |
| PATCH | `/api/auth/profile` | Update display name or avatar URL |
| POST | `/api/auth/avatar` | Upload profile photo (multipart, max 5 MB) |
| POST | `/api/auth/logout` | Revoke session server-side |

### Conversations
| Method | Path | Description |
|---|---|---|
| GET | `/api/conversations` | List all conversations for the current user |
| GET | `/api/conversations/{id}/messages` | Fetch message history |
| POST | `/api/conversations/{id}/messages` | Send a message |
| GET | `/api/conversations/{id}/members` | List members with online status |

### WebSocket
```
ws://localhost:8000/ws/conversations/{conversation_id}?token=<JWT>
```

Server → client frames:
```json
{ "type": "message",  ...MessageOut }
{ "type": "receipt",  "message_id": "...", "receipt_status": "delivered" | "read" }
```

---

## Seed Data

The seed script runs automatically on backend startup (idempotent — skips if data exists).

| User | Phone | OTP |
|---|---|---|
| Alice Johnson | 9876543210 | 123456 |
| Bob Smith | 9876543211 | 123456 |
| Charlie Brown | 9876543212 | 123456 |
| Diana Wilson | 9876543213 | 123456 |
| Ethan Davis | 9876543214 | 123456 |

Seeded conversations:
- Alice ↔ Bob (direct, 11 messages + 1 reply, 2 image attachments)
- Alice ↔ Charlie (direct, 10 messages)
- Bob ↔ Diana (direct, 10 messages + 1 file attachment)
- Family (group, Alice admin, 4 members, 13 messages + 1 reply, 1 file attachment)
- SignalX Team (group, Bob admin, 4 members, 13 messages + 1 reply + 1 file attachment)

---

## Local Setup

### Requirements
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set SECRET_KEY to a random string
uvicorn app.main:app --reload --port 8000
```

The database is created and seeded automatically on first startup.

### Frontend

```bash
cd frontend
npm install
npm run dev                     # http://localhost:3000
```

### Environment variables (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | *(required)* | JWT signing key — use `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | `sqlite+aiosqlite:///./signalx.db` | SQLAlchemy async DB URL |
| `UPLOAD_DIR` | `./uploads` | Directory for uploaded files |
| `MAX_UPLOAD_SIZE_BYTES` | `26214400` | 25 MB |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24 hours |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

---

## Deployment

Frontend → **Vercel** (Next.js, set root directory to `frontend`)

Backend → **Render** (Python web service, root directory `backend`)

Set these environment variables on Vercel:
```
NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
NEXT_PUBLIC_WS_URL  = wss://your-backend.onrender.com
```

Set `CORS_ORIGINS` on Render to your Vercel URL after deployment.

---

## Assumptions

- No real cryptography. The "🔒 End-to-end encrypted" label is cosmetic — messages are stored as plaintext. This is intentional and in line with the assignment brief.
- No real OTP delivery. The fixed OTP `123456` is accepted for any seeded phone number.
- Online/last-seen is seeded data, not computed from live socket activity.
- SQLite is used for simplicity. Switching to PostgreSQL requires only changing `DATABASE_URL`.
- File uploads are stored on the local filesystem. On Render free tier, the disk resets on redeploy — the seed script repopulates the database, but uploaded avatars would be lost. Acceptable for a demo.
