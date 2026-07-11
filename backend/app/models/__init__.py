"""
ORM model registry.

Import all models here so that:
1. Base.metadata has the complete schema when create_all() is called.
2. SQLAlchemy can resolve all relationship back-references at startup.

Import order matters for foreign key resolution — import tables with no
dependencies first, then tables that reference them.
"""

from app.models.user import User
from app.models.session import Session
from app.models.contact import Contact
from app.models.conversation import Conversation, ConversationMember
from app.models.message import Message, MessageReceipt
from app.models.attachment import Attachment

__all__ = [
    "User",
    "Session",
    "Contact",
    "Conversation",
    "ConversationMember",
    "Message",
    "MessageReceipt",
    "Attachment",
]
