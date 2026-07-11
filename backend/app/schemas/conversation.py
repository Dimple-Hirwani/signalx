from datetime import datetime
from pydantic import BaseModel


class ConversationOut(BaseModel):
    id: str
    type: str  # "DIRECT" | "GROUP"
    name: str
    avatar_url: str | None
    last_message: str | None
    last_message_at: datetime | None
    unread_count: int

    model_config = {"from_attributes": True}


class MemberOut(BaseModel):
    """A member of a conversation, returned by the members endpoint."""
    user_id: str
    display_name: str
    avatar_url: str | None
    is_admin: bool
    is_online: bool
    last_seen_at: datetime | None
