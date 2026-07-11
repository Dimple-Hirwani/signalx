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
