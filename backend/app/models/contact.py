"""
Contact model.

Represents a directional relationship: owner_id has added contact_id
to their contact list. The relationship is NOT automatically mutual —
if Alice adds Bob, Bob does not automatically have Alice as a contact.

PK: (owner_id, contact_id) — prevents duplicate contact entries.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Contact(Base):
    """A contact relationship between two users."""

    __tablename__ = "contacts"

    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    contact_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    owner: Mapped["User"] = relationship(
        "User", foreign_keys=[owner_id], back_populates="owned_contacts"
    )
    contact_user: Mapped["User"] = relationship(
        "User", foreign_keys=[contact_id], back_populates="contact_of"
    )

    def __repr__(self) -> str:
        return f"<Contact owner={self.owner_id!r} contact={self.contact_id!r}>"
