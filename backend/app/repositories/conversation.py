from sqlalchemy import func, select, and_, literal
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Conversation, ConversationMember, Message, MessageReceipt, User
from app.schemas.conversation import ConversationOut


async def get_conversations_for_user(
    db: AsyncSession, user_id: str
) -> list[ConversationOut]:
    # ── subquery: latest message timestamp per conversation ───────────────────
    latest_sq = (
        select(
            Message.conversation_id,
            func.max(Message.created_at).label("latest_at"),
        )
        .group_by(Message.conversation_id)
        .subquery()
    )

    # ── subquery: last message content (join on conv_id + timestamp) ──────────
    last_msg_sq = (
        select(
            Message.conversation_id,
            Message.content,
            Message.created_at,
        )
        .join(
            latest_sq,
            and_(
                Message.conversation_id == latest_sq.c.conversation_id,
                Message.created_at == latest_sq.c.latest_at,
            ),
        )
        .subquery()
    )

    # ── subquery: unread count per conversation for this user ─────────────────
    # Unread = messages not sent by me that have no 'read' receipt from me
    unread_sq = (
        select(
            Message.conversation_id,
            func.count(Message.id).label("unread_count"),
        )
        .outerjoin(
            MessageReceipt,
            and_(
                MessageReceipt.message_id == Message.id,
                MessageReceipt.user_id == user_id,
                MessageReceipt.status == "read",
            ),
        )
        .where(
            Message.sender_id != user_id,
            MessageReceipt.message_id.is_(None),
        )
        .group_by(Message.conversation_id)
        .subquery()
    )

    # ── subquery: the OTHER member in a DIRECT conversation ───────────────────
    # Strictly one row per DIRECT conversation (the peer, not the current user).
    # We use a subquery with LIMIT 1 per conversation to be safe.
    other_sq = (
        select(
            ConversationMember.conversation_id,
            User.display_name.label("other_name"),
            User.avatar_url.label("other_avatar"),
        )
        .join(User, User.id == ConversationMember.user_id)
        .where(ConversationMember.user_id != user_id)
        .subquery()
    )

    # ── main query: one row per conversation the user belongs to ──────────────
    # We join ConversationMember once (for the current user's membership),
    # then left-join the other subqueries.
    stmt = (
        select(
            Conversation.id,
            Conversation.type,
            Conversation.name,
            Conversation.avatar_url,
            last_msg_sq.c.content.label("last_message"),
            last_msg_sq.c.created_at.label("last_message_at"),
            func.coalesce(unread_sq.c.unread_count, 0).label("unread_count"),
            other_sq.c.other_name,
            other_sq.c.other_avatar,
        )
        .join(
            ConversationMember,
            and_(
                ConversationMember.conversation_id == Conversation.id,
                ConversationMember.user_id == user_id,
            ),
        )
        .outerjoin(last_msg_sq, last_msg_sq.c.conversation_id == Conversation.id)
        .outerjoin(unread_sq, unread_sq.c.conversation_id == Conversation.id)
        # Only join other_sq for DIRECT conversations — GROUP rows have no match
        # so other_name/other_avatar will be NULL for groups (correct behaviour).
        .outerjoin(
            other_sq,
            and_(
                other_sq.c.conversation_id == Conversation.id,
                Conversation.type == "DIRECT",
            ),
        )
        .order_by(last_msg_sq.c.created_at.desc().nulls_last())
    )

    rows = await db.execute(stmt)

    results = []
    for row in rows.mappings():
        is_direct = row["type"] == "DIRECT"
        results.append(
            ConversationOut(
                id=row["id"],
                type=row["type"],
                name=row["other_name"] if is_direct else (row["name"] or "Group"),
                avatar_url=row["other_avatar"] if is_direct else row["avatar_url"],
                last_message=row["last_message"],
                last_message_at=row["last_message_at"],
                unread_count=row["unread_count"],
            )
        )
    return results


async def get_members_for_conversation(
    db: AsyncSession, conversation_id: str, requesting_user_id: str
) -> list | None:
    """
    Return members of a conversation.
    Returns None if the requesting user is not a member.
    """
    from app.models import User, ConversationMember
    from app.schemas.conversation import MemberOut

    # Verify requester is a member
    check = await db.execute(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == requesting_user_id,
        )
    )
    if check.scalars().first() is None:
        return None

    rows = await db.execute(
        select(
            ConversationMember.user_id,
            ConversationMember.is_admin,
            User.display_name,
            User.avatar_url,
            User.is_online,
            User.last_seen_at,
        )
        .join(User, User.id == ConversationMember.user_id)
        .where(ConversationMember.conversation_id == conversation_id)
        .order_by(ConversationMember.is_admin.desc(), User.display_name.asc())
    )

    return [
        MemberOut(
            user_id=r.user_id,
            display_name=r.display_name,
            avatar_url=r.avatar_url,
            is_admin=r.is_admin,
            is_online=r.is_online,
            last_seen_at=r.last_seen_at,
        )
        for r in rows.all()
    ]
