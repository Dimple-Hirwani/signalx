from datetime import datetime
from pydantic import BaseModel, field_validator


class SendMessageRequest(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Message cannot be empty")
        if len(v) > 2000:
            raise ValueError("Message cannot exceed 2000 characters")
        return v


class AttachmentOut(BaseModel):
    id: str
    file_name: str
    mime_type: str
    file_size_bytes: int

    model_config = {"from_attributes": True}


class ReplySnippet(BaseModel):
    message_id: str
    sender_name: str
    content_preview: str  # first 200 chars of original message


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: str  # "text" | "image" | "file"
    reply_to: ReplySnippet | None
    attachments: list[AttachmentOut]
    created_at: datetime
    # Aggregate receipt status from the sender's perspective.
    # "sending" is frontend-only (optimistic); backend never returns it.
    # "sent"      → persisted, but at least one recipient has no receipt row
    # "delivered" → all recipients have a receipt row (any status)
    # "read"      → all recipients have status='read'
    receipt_status: str  # "sent" | "delivered" | "read"
