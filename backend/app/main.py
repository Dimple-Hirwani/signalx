from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine
from app.seed import main as seed_db
from app.routers.auth import router as auth_router
from app.routers.conversation import router as conversation_router
from app.websocket.router import router as ws_router

import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_db()
    yield
    await engine.dispose()


app = FastAPI(
    title="SignalX API",
    description="Signal-inspired secure messaging platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth_router)
app.include_router(conversation_router)
app.include_router(ws_router)

# Serve uploaded files (avatars, attachments) as static assets
_uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(_uploads_dir, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=_uploads_dir), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "signalx-api"}
