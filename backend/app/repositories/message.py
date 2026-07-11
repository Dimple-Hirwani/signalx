from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Attachment, Conversation, ConversationMember, Message, MessageReceipt, User
from app.schemas.message import AttachmentOut, MessageOut, ReplySnippet


async def get_messages(
    db: AsyncSession, conversation_id: str, user_id: str
) -> list[MessageOut]:
    # Verify the requesting user is a member of this conversation
    membership = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id,
        )
    )
    if membership.scalars().first() is None:
        return []

    # Fetch all messages with sender, ordered oldest → newest
    rows = await db.execute(
        select(Message, User.display_name.label("sender_name"))
        .join(User, User.id == Message.sender_id)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    message_rows = rows.all()

    if not message_rows:
        return []

    message_ids = [row.Message.id for row in message_rows]

    reply_ids = [
        row.Message.reply_to_id
        for row in message_rows
        if row.Message.reply_to_id is not None
    ]
    reply_map: dict[str, tuple[str, str]] = {}
    if reply_ids:
        reply_rows = await db.execute(
            select(Message, User.display_name.label("sender_name"))
            .join(User, User.id == Message.sender_id)
            .where(Message.id.in_(reply_ids))
        )
        for rrow in reply_rows.all():
            reply_map[rrow.Message.id] = (rrow.sender_name, rrow.Message.content)

    att_rows = await db.execute(
        select(Attachment).where(Attachment.message_id.in_(message_ids))
    )
    att_map: dict[str, list[AttachmentOut]] = {}
    for att in att_rows.scalars().all():
        att_map.setdefault(att.message_id, []).append(
            AttachmentOut(
                id=att.id,
                file_name=att.file_name,
                mime_type=att.mime_type,
                file_size_bytes=att.file_size_bytes,
            )
        )

    results: list[MessageOut] = []
    for row in message_rows:
        msg = row.Message
        reply_snippet: ReplySnippet | None = None
        if msg.reply_to_id and msg.reply_to_id in reply_map:
            orig_sender, orig_content = reply_map[msg.reply_to_id]
            reply_snippet = ReplySnippet(
                message_id=msg.reply_to_id,
                sender_name=orig_sender,
                content_preview=orig_content[:200],
            )

        results.append(
            MessageOut(
                id=msg.id,
                conversation_id=msg.conversation_id,
                sender_id=msg.sender_id,
                sender_name=row.sender_name,
                content=msg.content,
                message_type=msg.message_type,
                reply_to=reply_snippet,
                attachments=att_map.get(msg.id, []),
                created_at=msg.created_at,
            )
        )

    return results


async def send_message(
    db: AsyncSession, conversation_id: str, sender_id: str, content: str
) -> MessageOut | None:
    # Verify sender is a member
    membership = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == sender_id,
        )
    )
    if membership.scalars().first() is None:
        return None

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Persist the message
    msg = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content,
        message_type="text",
        created_at=now,
    )
    db.add(msg)
    await db.flush()  # populate msg.id

    # Create 'delivered' receipts for every other member
    other_members = await db.execute(
        select(ConversationMember.user_id).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id != sender_id,
        )
    )
    for (member_id,) in other_members.all():
        db.add(MessageReceipt(
            message_id=msg.id,
            user_id=member_id,
            status="delivered",
            updated_at=now,
        ))

    # Bump conversation.updated_at so the sidebar re-orders correctly
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(updated_at=now)
    )

    await db.flush()

    # Fetch sender display_name for the response
    sender_row = await db.execute(
        select(User.display_name).where(User.id == sender_id)
    )
    sender_name = sender_row.scalar_one()

    return MessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender_name=sender_name,
        content=msg.content,
        message_type=msg.message_type,
        reply_to=None,
        attachments=[],
        created_at=msg.created_at,
    )
