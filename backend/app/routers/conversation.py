from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User
from app.schemas.conversation import ConversationOut
from app.schemas.message import MessageOut
from app.services.conversation import list_conversations
from app.services.message import list_messages

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
    messages = await list_messages(db, conversation_id, current_user.id)
    if messages == [] :
        # Could be empty conversation OR user not a member — both return 200 []
        # The repository returns [] for non-members too, which is safe.
        pass
    return messages
