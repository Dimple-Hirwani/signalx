"""
Async SQLAlchemy engine, session factory, and declarative Base.

All models import Base from here. The engine targets the DATABASE_URL
from settings (defaults to sqlite+aiosqlite:///./signalx.db).
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


engine = create_async_engine(
    settings.database_url,
    # echo=True logs all SQL — useful for development, disable in production
    echo=False,
    # SQLite requires connect_args for async multi-threaded use
    connect_args={"check_same_thread": False},
)

# Reusable async session factory — used by FastAPI dependencies in later tasks
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields a database session and closes it after the
    request completes.  Usage: db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        yield session
