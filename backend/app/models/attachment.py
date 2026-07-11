"""
Attachment model.

Each Attachment belongs to exactly one Message. The file is stored on the
local filesystem under UPLOAD_DIR; storage_path is the relative path within
that directory. Files are served as static assets by FastAPI.

Images (JPEG, PNG, GIF) are rendered inline in the UI. Other file types
show a download link with file name and human-readable size.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Attachment(Base):
    """A file attachment linked to a single Message."""

    __tablename__ = "attachments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    message_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Original file name as uploaded (truncated to 255 chars in the service layer)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # MIME type e.g. "image/jpeg", "application/pdf"
    mime_type: Mapped[str] = mapped_column(String(127), nullable=False)
    # File size in bytes — used for human-readable display and upload validation
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    # Relative path within UPLOAD_DIR, e.g. "abc123/photo.jpg"
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # ── Relationships ──────────────────────────────────────────────────────────
    message: Mapped["Message"] = relationship(
        "Message", back_populates="attachments"
    )

    def __repr__(self) -> str:
        return (
            f"<Attachment id={self.id!r} file={self.file_name!r} "
            f"mime={self.mime_type!r}>"
        )
