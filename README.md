# SignalX

Signal-inspired secure messaging platform.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | FastAPI + SQLAlchemy (async) + Pydantic v2 |
| Database | SQLite (via aiosqlite) |
| Realtime | FastAPI WebSockets |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edit SECRET_KEY before running
python -m app.seed            # seed the database
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

## Demo Credentials

Any seeded phone number + OTP `123456`.

Example: `9876543210` / `123456`

## Architecture

```
frontend/          Next.js 14 App Router
backend/
  app/
    main.py        FastAPI entry point
    config.py      Pydantic BaseSettings
    database.py    SQLAlchemy async engine  (Task 2)
    models/        SQLAlchemy ORM models    (Task 2)
    schemas/       Pydantic schemas         (Task 4+)
    routers/       FastAPI APIRouters       (Task 4+)
    services/      Business logic           (Task 4+)
    repositories/  DB query layer           (Task 4+)
    websocket/     WS manager + handlers    (Task 12)
    middleware/    JWT dependency           (Task 4)
    seed.py        Seed script              (Task 3)
```
