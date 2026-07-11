from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.message import get_messages
from app.schemas.message import MessageOut


async def list_messages(
    db: AsyncSession, conversation_id: str, user_id: str
) -> list[MessageOut]:
    return await get_messages(db, conversation_id, user_id)
