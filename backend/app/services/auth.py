from datetime import datetime, timedelta

from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models import User
from app.repositories.auth import (
    get_user_by_phone,
    create_session,
    revoke_session,
)
from app.schemas.auth import LoginResponse, UserOut

FIXED_OTP = "123456"
ALGORITHM = "HS256"


def _make_token(user_id: str, expires_at: datetime) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": expires_at},
        settings.secret_key,
        algorithm=ALGORITHM,
    )


async def request_otp(db: AsyncSession, phone: str) -> dict:
    """Verify the phone exists; in a real app this would send an SMS."""
    user = await get_user_by_phone(db, phone)
    if user is None:
        return {"exists": False}
    return {"exists": True}


async def verify_otp(db: AsyncSession, phone: str, otp: str) -> LoginResponse | None:
    if otp != FIXED_OTP:
        return None

    user: User | None = await get_user_by_phone(db, phone)
    if user is None:
        return None

    expires_at = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    token = _make_token(user.id, expires_at)
    await create_session(db, user.id, token, expires_at)

    return LoginResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


async def logout(db: AsyncSession, token: str) -> None:
    await revoke_session(db, token)
