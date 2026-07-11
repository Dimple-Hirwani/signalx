import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from sqlalchemy import select, update

from app.config import settings
from app.database import AsyncSessionLocal
from app.middleware.auth import ALGORITHM
from app.models import ConversationMember, Message, MessageReceipt, User
from app.repositories.auth import get_session_by_token, get_user_by_id
from app.websocket.manager import manager

router = APIRouter(tags=["websocket"])


async def _authenticate(token: str) -> User | None:
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


async def _mark_read_and_notify(conversation_id: str, reader_id: str) -> None:
    """
    Mark all delivered receipts for this reader as 'read', then for each
    affected message send a receipt-update frame to the original sender
    (if they are currently connected to this conversation).
    """
    async with AsyncSessionLocal() as db:
        # Find all delivered receipts for this reader in this conversation
        rows = await db.execute(
            select(MessageReceipt.message_id, Message.sender_id)
            .join(Message, Message.id == MessageReceipt.message_id)
            .where(
                Message.conversation_id == conversation_id,
                MessageReceipt.user_id == reader_id,
                MessageReceipt.status == "delivered",
            )
        )
        affected = rows.all()  # list of (message_id, sender_id)

        if not affected:
            return

        message_ids = [r.message_id for r in affected]

        # Bulk-update to 'read'
        await db.execute(
            update(MessageReceipt)
            .where(
                MessageReceipt.message_id.in_(message_ids),
                MessageReceipt.user_id == reader_id,
            )
            .values(status="read")
        )
        await db.commit()

    # Notify each sender with a receipt frame
    for message_id, sender_id in affected:
        frame = json.dumps({
            "type": "receipt",
            "message_id": message_id,
            "receipt_status": "read",
        })
        await manager.send_to_user(conversation_id, sender_id, frame)


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

    await manager.connect(conversation_id, user.id, websocket)

    # Opening the conversation counts as reading all delivered messages
    await _mark_read_and_notify(conversation_id, user.id)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(conversation_id, user.id, websocket)
