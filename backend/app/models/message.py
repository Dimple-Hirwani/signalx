"""
Message and MessageReceipt models.

Messages belong to a Conversation and are sent by a User. The `reply_to_id`
self-referencing FK enables threaded replies without duplicating content.

Read/delivery status is intentionally NOT stored on the Message row. Instead,
MessageReceipt holds one row per (message, recipient). This design correctly
handles group messages where each member tracks their own receipt state.

Aggregate status computation (sent/delivered/read) is done at query time
in the repository layer.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Message(Base):
    """
    A single message within a Conversation.

    message_type discriminates between text content and attachment messages:
      - 'text':  content holds the message text
      - 'image': content is empty or a caption; see attachments relationship
      - 'file':  content is empty or a caption; see attachments relationship

    reply_to_id is a self-referencing FK: when set, this message is a reply
    to the referenced message. The original content is NOT duplicated here —
    it is fetched at query time from the referenced message.
    """

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    # 'text' | 'image' | 'file'
    message_type: Mapped[str] = mapped_column(
        String(16), nullable=False, default="text"
    )
    # Self-referencing FK — null means this is not a reply
    reply_to_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("messages.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )
    sender: Mapped["User"] = relationship(
        "User", back_populates="sent_messages"
    )
    # The message this is a reply to (nullable)
    reply_to: Mapped["Message | None"] = relationship(
        "Message",
        remote_side="Message.id",
        foreign_keys=[reply_to_id],
        back_populates="replies",
    )
    # All replies to this message
    replies: Mapped[list["Message"]] = relationship(
        "Message",
        foreign_keys=[reply_to_id],
        back_populates="reply_to",
    )
    receipts: Mapped[list["MessageReceipt"]] = relationship(
        "MessageReceipt",
        back_populates="message",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment",
        back_populates="message",
        cascade="all, delete-orphan",
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        # Primary query pattern: paginated messages within a conversation
        Index("idx_messages_conversation_created", "conversation_id", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<Message id={self.id!r} conv={self.conversation_id!r} "
            f"type={self.message_type!r}>"
        )


class MessageReceipt(Base):
    """
    Per-user delivery/read receipt for a message.

    One row exists per (message_id, user_id) pair, representing the
    delivery/read state of that message for that specific recipient.

    status values:
      - 'delivered': the client received the message
      - 'read':      the user opened the conversation containing the message

    A message's aggregate status (sent/delivered/read) is computed at query
    time from the set of receipt rows for all non-sender conversation members:
      - 'sent':      at least one recipient has no receipt row
      - 'delivered': all recipients have a row; none is 'read'
      - 'read':      all recipients have a row with status='read'
    """

    __tablename__ = "message_receipts"

    message_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("messages.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    # 'delivered' | 'read'
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    message: Mapped["Message"] = relationship(
        "Message", back_populates="receipts"
    )
    user: Mapped["User"] = relationship(
        "User", back_populates="message_receipts"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        # Fast lookup: all receipts for a given message
        Index("idx_message_receipts_message", "message_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<MessageReceipt msg={self.message_id!r} "
            f"user={self.user_id!r} status={self.status!r}>"
        )
