from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.schemas.conversation import ConversationOut
from app.schemas.message import MessageOut, SendMessageRequest
from app.services.conversation import list_conversations
from app.services.message import create_message, list_messages
from app.websocket.manager import manager

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationOut])
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await list_conversations(db, current_user.id)


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
async def get_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await list_messages(db, conversation_id, current_user.id)


@router.post("/{conversation_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def post_message(
    conversation_id: str,
    body: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await create_message(db, conversation_id, current_user.id, body.content)
    if result is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this conversation")
    await manager.broadcast(conversation_id, result.model_dump_json())
    return result
