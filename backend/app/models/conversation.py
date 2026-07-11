"""
Conversation and ConversationMember models.

One Conversation table handles both DIRECT (1:1) and GROUP conversations.
The `type` column discriminates between them — there are no separate tables
for direct chats and groups.

ConversationMember tracks every participant in every conversation, for both
DIRECT and GROUP types. `is_admin` is only meaningful for GROUP conversations.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Conversation(Base):
    """
    A messaging thread — either a 1:1 DIRECT chat or a GROUP conversation.

    - DIRECT: name and avatar_url are null; participants are in conversation_members.
    - GROUP:  name is required; avatar_url is optional; created_by is the admin.
    """

    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # 'DIRECT' | 'GROUP'
    type: Mapped[str] = mapped_column(String(16), nullable=False)
    # Group name — null for DIRECT conversations
    name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # Group avatar — null for DIRECT conversations
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    # User who created this conversation (SET NULL on user delete)
    created_by: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    # Updated every time a new message is sent — drives conversation list ordering
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    creator: Mapped["User | None"] = relationship(
        "User", back_populates="created_conversations"
    )
    members: Mapped[list["ConversationMember"]] = relationship(
        "ConversationMember",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id!r} type={self.type!r} name={self.name!r}>"


class ConversationMember(Base):
    """
    Membership record linking a User to a Conversation.

    Exists for both DIRECT and GROUP conversations.
    `is_admin` is only meaningful for GROUP type — in a DIRECT conversation
    both members have is_admin=False.
    """

    __tablename__ = "conversation_members"

    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="members"
    )
    user: Mapped["User"] = relationship(
        "User", back_populates="conversation_memberships"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        # Fast lookup: "all conversations this user belongs to"
        Index("idx_conversation_members_user", "user_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<ConversationMember conv={self.conversation_id!r} "
            f"user={self.user_id!r} admin={self.is_admin}>"
        )
