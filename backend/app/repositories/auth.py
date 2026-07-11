import hashlib
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, Session


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def get_user_by_phone(db: AsyncSession, phone: str) -> User | None:
    result = await db.execute(select(User).where(User.phone == phone))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def create_session(db: AsyncSession, user_id: str, token: str, expires_at: datetime) -> Session:
    session = Session(
        user_id=user_id,
        token_hash=_hash(token),
        expires_at=expires_at,
    )
    db.add(session)
    await db.flush()
    return session


async def get_session_by_token(db: AsyncSession, token: str) -> Session | None:
    result = await db.execute(
        select(Session).where(
            Session.token_hash == _hash(token),
            Session.revoked == False,  # noqa: E712
            Session.expires_at > datetime.utcnow(),
        )
    )
    return result.scalars().first()


async def revoke_session(db: AsyncSession, token: str) -> None:
    session = await get_session_by_token(db, token)
    if session:
        session.revoked = True
        await db.flush()
