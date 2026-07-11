from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.middleware.auth import ALGORITHM
from app.models import ConversationMember, Session, User
from app.repositories.auth import get_session_by_token, get_user_by_id
from app.websocket.manager import manager

router = APIRouter(tags=["websocket"])


async def _authenticate(token: str) -> User | None:
    """Validate JWT + live session, return User or None."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None

    async with AsyncSessionLocal() as db:
        session = await get_session_by_token(db, token)
        if session is None:
            return None
        return await get_user_by_id(db, user_id)


async def _is_member(user_id: str, conversation_id: str) -> bool:
    async with AsyncSessionLocal() as db:
        row = await db.execute(
            select(ConversationMember).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
        )
        return row.scalars().first() is not None


@router.websocket("/ws/conversations/{conversation_id}")
async def ws_conversation(conversation_id: str, websocket: WebSocket):
    token = websocket.query_params.get("token", "")

    user = await _authenticate(token)
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if not await _is_member(user.id, conversation_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(conversation_id, websocket)
    try:
        while True:
            # Keep the connection alive; we only send, never receive application data
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(conversation_id, websocket)
