"""
User model.

Represents a registered account in SignalX. All users are seeded —
no real registration flow exists. Authentication is via mock OTP (123456).
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """A SignalX user account."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    phone: Mapped[str] = mapped_column(String(15), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(64), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_online: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    sessions: Mapped[list["Session"]] = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan"
    )
    # Contacts this user owns (people they have added)
    owned_contacts: Mapped[list["Contact"]] = relationship(
        "Contact",
        foreign_keys="Contact.owner_id",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    # Contacts where this user is the contact_id (reverse side)
    contact_of: Mapped[list["Contact"]] = relationship(
        "Contact",
        foreign_keys="Contact.contact_id",
        back_populates="contact_user",
    )
    conversation_memberships: Mapped[list["ConversationMember"]] = relationship(
        "ConversationMember", back_populates="user", cascade="all, delete-orphan"
    )
    sent_messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="sender", cascade="all, delete-orphan"
    )
    message_receipts: Mapped[list["MessageReceipt"]] = relationship(
        "MessageReceipt", back_populates="user", cascade="all, delete-orphan"
    )
    created_conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="creator"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id!r} phone={self.phone!r} name={self.display_name!r}>"
