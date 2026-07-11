"""
Seed script for SignalX demo data.

Run with:  python -m app.seed

Idempotent — skips seeding if the users table is already populated.
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select, text

from app.database import AsyncSessionLocal, engine, Base
import app.models  # noqa: F401 — populate Base.metadata
from app.models import (
    User, Contact, Conversation, ConversationMember,
    Message, MessageReceipt, Attachment,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

# ── Helpers ────────────────────────────────────────────────────────────────────

def uid() -> str:
    return str(uuid.uuid4())


def avatar(name: str) -> str:
    encoded = name.replace(" ", "+")
    return f"https://ui-avatars.com/api/?name={encoded}&background=random&size=128"


def dt(days_ago: float = 0, hours_ago: float = 0, minutes_ago: float = 0) -> datetime:
    return datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)


# ── Seed data definitions ──────────────────────────────────────────────────────

def build_users() -> list[User]:
    profiles = [
        ("alice",   "9876543210", "Alice Johnson",  "Hey there! I'm using SignalX."),
        ("bob",     "9876543211", "Bob Smith",       "Available"),
        ("charlie", "9876543212", "Charlie Brown",   "At work 🏢"),
        ("diana",   "9876543213", "Diana Wilson",    "Do not disturb 🔕"),
        ("ethan",   "9876543214", "Ethan Davis",     "Living the dream ✨"),
    ]
    users = {}
    for key, phone, name, _ in profiles:
        users[key] = User(
            id=uid(),
            phone=phone,
            display_name=name,
            avatar_url=avatar(name),
            is_online=False,
            last_seen_at=dt(hours_ago=1),
            created_at=dt(days_ago=30),
        )
    return users


async def seed(session) -> None:
    # ── Users ──────────────────────────────────────────────────────────────────
    log.info("Seeding users…")
    u = build_users()
    alice, bob, charlie, diana, ethan = (
        u["alice"], u["bob"], u["charlie"], u["diana"], u["ethan"]
    )
    session.add_all([alice, bob, charlie, diana, ethan])
    await session.flush()
    log.info("  ✓ 5 users")

    # ── Contacts ───────────────────────────────────────────────────────────────
    log.info("Seeding contacts…")
    contact_pairs = [
        (alice, bob), (bob, alice),
        (alice, charlie), (charlie, alice),
        (alice, diana), (diana, alice),
        (bob, charlie), (charlie, bob),
        (bob, ethan), (ethan, bob),
        (diana, ethan), (ethan, diana),
    ]
    for owner, contact in contact_pairs:
        session.add(Contact(owner_id=owner.id, contact_id=contact.id, created_at=dt(days_ago=25)))
    await session.flush()
    log.info("  ✓ %d contact relationships", len(contact_pairs))

    # ── Conversations ──────────────────────────────────────────────────────────
    log.info("Seeding conversations…")

    def direct(u1: User, u2: User, days_ago: float = 10) -> Conversation:
        c = Conversation(id=uid(), type="DIRECT", created_by=u1.id,
                         created_at=dt(days_ago=days_ago), updated_at=dt(hours_ago=2))
        return c

    def group(name: str, creator: User, days_ago: float = 20) -> Conversation:
        return Conversation(id=uid(), type="GROUP", name=name,
                            avatar_url=avatar(name), created_by=creator.id,
                            created_at=dt(days_ago=days_ago), updated_at=dt(hours_ago=1))

    conv_ab = direct(alice, bob, days_ago=15)
    conv_ac = direct(alice, charlie, days_ago=12)
    conv_bd = direct(bob, diana, days_ago=8)
    conv_family = group("Family", alice, days_ago=25)
    conv_team   = group("SignalX Team", bob, days_ago=20)

    session.add_all([conv_ab, conv_ac, conv_bd, conv_family, conv_team])
    await session.flush()
    log.info("  ✓ 3 direct + 2 group conversations")

    # ── Members ────────────────────────────────────────────────────────────────
    def member(conv: Conversation, user: User, is_admin: bool = False) -> ConversationMember:
        return ConversationMember(conversation_id=conv.id, user_id=user.id,
                                  is_admin=is_admin, joined_at=conv.created_at)

    members = [
        member(conv_ab, alice), member(conv_ab, bob),
        member(conv_ac, alice), member(conv_ac, charlie),
        member(conv_bd, bob),   member(conv_bd, diana),
        member(conv_family, alice, is_admin=True), member(conv_family, bob),
        member(conv_family, charlie), member(conv_family, diana),
        member(conv_team, bob, is_admin=True), member(conv_team, alice),
        member(conv_team, charlie), member(conv_team, ethan),
    ]
    session.add_all(members)
    await session.flush()
    log.info("  ✓ %d memberships", len(members))

    # ── Messages ───────────────────────────────────────────────────────────────
    log.info("Seeding messages…")

    def msg(conv: Conversation, sender: User, content: str,
            minutes_ago: float, reply_to: "Message | None" = None,
            mtype: str = "text") -> Message:
        return Message(
            id=uid(), conversation_id=conv.id, sender_id=sender.id,
            content=content, message_type=mtype,
            reply_to_id=reply_to.id if reply_to else None,
            created_at=dt(minutes_ago=minutes_ago),
        )

    # Alice ↔ Bob
    m_ab = [
        msg(conv_ab, alice,   "Hey Bob! How's it going?",                        120),
        msg(conv_ab, bob,     "Alice! All good, just finished a meeting 😅",      118),
        msg(conv_ab, alice,   "Haha, those never end do they",                    116),
        msg(conv_ab, bob,     "Tell me about it. What's up?",                     114),
        msg(conv_ab, alice,   "Did you see the new SignalX build?",               112),
        msg(conv_ab, bob,     "Not yet — is it live?",                            110),
        msg(conv_ab, alice,   "Just deployed! Check it out",                      108),
        msg(conv_ab, bob,     "Nice, will do after lunch 🍕",                     106),
        msg(conv_ab, alice,   "Enjoy! Ping me if you find bugs",                  104),
        msg(conv_ab, bob,     "Always do 😄",                                     102),
    ]
    session.add_all(m_ab)
    await session.flush()

    # Alice ↔ Charlie
    m_ac = [
        msg(conv_ac, charlie, "Alice, are you free this weekend?",                200),
        msg(conv_ac, alice,   "Should be! What's the plan?",                      198),
        msg(conv_ac, charlie, "Thinking of a hike up the north trail",            196),
        msg(conv_ac, alice,   "Oh that sounds amazing 🏔️",                        194),
        msg(conv_ac, charlie, "Right? Weather looks perfect too",                 192),
        msg(conv_ac, alice,   "Count me in. What time?",                          190),
        msg(conv_ac, charlie, "7am start — early bird gets the summit 😂",        188),
        msg(conv_ac, alice,   "Deal. I'll bring snacks",                          186),
        msg(conv_ac, charlie, "Perfect. See you Saturday!",                       184),
        msg(conv_ac, alice,   "Can't wait! 🎒",                                   182),
    ]
    session.add_all(m_ac)
    await session.flush()

    # Bob ↔ Diana
    m_bd = [
        msg(conv_bd, bob,   "Diana, did you get the report I sent?",              300),
        msg(conv_bd, diana, "Yes, reviewing it now",                              298),
        msg(conv_bd, bob,   "Let me know if anything looks off",                  296),
        msg(conv_bd, diana, "The Q3 numbers seem a bit high",                     294),
        msg(conv_bd, bob,   "Yeah I noticed that too — double-checking",          292),
        msg(conv_bd, diana, "Take your time, no rush",                            290),
        msg(conv_bd, bob,   "Confirmed — it was a data entry error, fixing now",  288),
        msg(conv_bd, diana, "Great catch 👍",                                     286),
        msg(conv_bd, bob,   "Updated report coming in 5",                         284),
        msg(conv_bd, diana, "Perfect, thanks Bob",                                282),
    ]
    session.add_all(m_bd)
    await session.flush()

    # Family group
    m_fam = [
        msg(conv_family, alice,   "Good morning everyone! ☀️",                   480),
        msg(conv_family, bob,     "Morning! Hope everyone slept well",            478),
        msg(conv_family, charlie, "Morning 😴 coffee first",                      476),
        msg(conv_family, diana,   "Haha same Charlie",                            474),
        msg(conv_family, alice,   "Reminder: family dinner Sunday 6pm",           470),
        msg(conv_family, bob,     "I'll be there!",                               468),
        msg(conv_family, charlie, "Wouldn't miss it",                             466),
        msg(conv_family, diana,   "Same! Should I bring dessert?",                464),
        msg(conv_family, alice,   "Yes please! Your cheesecake 🎂",               462),
        msg(conv_family, diana,   "Done deal 😊",                                 460),
        msg(conv_family, bob,     "This is going to be great",                    458),
        msg(conv_family, charlie, "Can't wait!",                                  456),
    ]
    session.add_all(m_fam)
    await session.flush()

    # SignalX Team group
    m_team = [
        msg(conv_team, bob,     "Team standup in 10 mins 🚀",                     60),
        msg(conv_team, alice,   "On it, just finishing a PR",                     58),
        msg(conv_team, charlie, "Ready here",                                     57),
        msg(conv_team, ethan,   "Joining from mobile, might be a sec",            56),
        msg(conv_team, bob,     "No worries Ethan",                               55),
        msg(conv_team, alice,   "PR merged! Now fully ready",                     53),
        msg(conv_team, charlie, "Nice work Alice 🎉",                             52),
        msg(conv_team, bob,     "Great. Today's focus: auth + websocket",         50),
        msg(conv_team, ethan,   "I'll take websocket",                            48),
        msg(conv_team, alice,   "I'll handle auth then",                          46),
        msg(conv_team, charlie, "I can help with testing",                        44),
        msg(conv_team, bob,     "Perfect split. Let's ship it 💪",                42),
    ]
    session.add_all(m_team)
    await session.flush()

    # Replies
    reply1 = msg(conv_ab, bob, "Actually found one already 😅", 100, reply_to=m_ab[8])
    reply2 = msg(conv_fam := conv_family, alice, "Diana your cheesecake is legendary 🏆", 450, reply_to=m_fam[7])
    reply3 = msg(conv_team, ethan, "Websocket handler is up, check it out!", 30, reply_to=m_team[8])
    session.add_all([reply1, reply2, reply3])
    await session.flush()

    all_messages = m_ab + m_ac + m_bd + m_fam + m_team + [reply1, reply2, reply3]
    log.info("  ✓ %d messages (%d replies)", len(all_messages), 3)

    # ── Receipts ───────────────────────────────────────────────────────────────
    log.info("Seeding receipts…")
    receipts = []

    def add_receipts(messages: list[Message], recipients: list[User],
                     status: str, base_minutes_ago: float) -> None:
        for i, m in enumerate(messages):
            for j, r in enumerate(recipients):
                if r.id == m.sender_id:
                    continue
                receipts.append(MessageReceipt(
                    message_id=m.id, user_id=r.id, status=status,
                    updated_at=dt(minutes_ago=base_minutes_ago - i * 0.5 - j * 0.2),
                ))

    # Alice ↔ Bob: all read
    add_receipts(m_ab[:8], [bob],   "read",      100)
    add_receipts(m_ab[:8], [alice], "read",      100)
    # last 2 delivered only
    add_receipts(m_ab[8:], [bob],   "delivered", 101)
    add_receipts(m_ab[8:], [alice], "delivered", 101)

    # Alice ↔ Charlie: all read
    add_receipts(m_ac, [alice, charlie], "read", 180)

    # Bob ↔ Diana: mix
    add_receipts(m_bd[:7], [bob, diana], "read",      280)
    add_receipts(m_bd[7:], [bob, diana], "delivered", 283)

    # Family: mix of delivered/read
    add_receipts(m_fam[:8], [alice, bob, charlie, diana], "read",      455)
    add_receipts(m_fam[8:], [alice, bob, charlie, diana], "delivered", 458)

    # Team: mostly delivered
    add_receipts(m_team, [bob, alice, charlie, ethan], "delivered", 40)

    session.add_all(receipts)
    await session.flush()
    log.info("  ✓ %d receipts", len(receipts))

    # ── Attachments ────────────────────────────────────────────────────────────
    log.info("Seeding attachments…")

    # Create attachment messages first
    att_msgs = [
        msg(conv_ab,     alice,   "Check out this screenshot",  80, mtype="image"),
        msg(conv_ac,     charlie, "Here's the trail map 🗺️",    170, mtype="image"),
        msg(conv_bd,     bob,     "Updated report attached",    280, mtype="file"),
        msg(conv_family, diana,   "Recipe for the cheesecake!", 440, mtype="file"),
        msg(conv_team,   ethan,   "WS handler notes",           25,  mtype="file"),
    ]
    session.add_all(att_msgs)
    await session.flush()

    attachments = [
        Attachment(id=uid(), message_id=att_msgs[0].id,
                   file_name="screenshot.png", mime_type="image/png",
                   file_size_bytes=204_800, storage_path="demo/screenshot.png",
                   created_at=att_msgs[0].created_at),
        Attachment(id=uid(), message_id=att_msgs[1].id,
                   file_name="trail_map.jpg", mime_type="image/jpeg",
                   file_size_bytes=512_000, storage_path="demo/trail_map.jpg",
                   created_at=att_msgs[1].created_at),
        Attachment(id=uid(), message_id=att_msgs[2].id,
                   file_name="q3_report.pdf", mime_type="application/pdf",
                   file_size_bytes=1_048_576, storage_path="demo/q3_report.pdf",
                   created_at=att_msgs[2].created_at),
        Attachment(id=uid(), message_id=att_msgs[3].id,
                   file_name="cheesecake_recipe.txt", mime_type="text/plain",
                   file_size_bytes=4_096, storage_path="demo/cheesecake_recipe.txt",
                   created_at=att_msgs[3].created_at),
        Attachment(id=uid(), message_id=att_msgs[4].id,
                   file_name="ws_notes.txt", mime_type="text/plain",
                   file_size_bytes=8_192, storage_path="demo/ws_notes.txt",
                   created_at=att_msgs[4].created_at),
    ]
    session.add_all(attachments)
    await session.flush()
    log.info("  ✓ %d attachments", len(attachments))


# ── Entry point ────────────────────────────────────────────────────────────────

async def main() -> None:
    log.info("Initialising database tables…")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        async with session.begin():
            # Idempotency check
            result = await session.execute(select(User).limit(1))
            if result.scalars().first() is not None:
                log.info("Database already seeded — skipping.")
                return

            log.info("Starting seed…")
            await seed(session)

    log.info("✅  Seed complete.")


if __name__ == "__main__":
    asyncio.run(main())
