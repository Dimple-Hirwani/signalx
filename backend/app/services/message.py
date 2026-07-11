from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.message import get_messages, send_message
from app.schemas.message import MessageOut


async def list_messages(
    db: AsyncSession, conversation_id: str, user_id: str
) -> list[MessageOut]:
    return await get_messages(db, conversation_id, user_id)


async def create_message(
    db: AsyncSession, conversation_id: str, sender_id: str, content: str
) -> MessageOut | None:
    return await send_message(db, conversation_id, sender_id, content)
