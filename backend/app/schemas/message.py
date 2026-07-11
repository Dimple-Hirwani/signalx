from datetime import datetime
from pydantic import BaseModel


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
