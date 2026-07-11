from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.conversation import get_conversations_for_user
from app.schemas.conversation import ConversationOut


async def list_conversations(db: AsyncSession, user_id: str) -> list[ConversationOut]:
    return await get_conversations_for_user(db, user_id)
