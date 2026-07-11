from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        # conversation_id -> {user_id: WebSocket}
        self._user_sockets: dict[str, dict[str, WebSocket]] = defaultdict(dict)
        # user_id -> WebSocket  (most-recent socket for this user, any conversation)
        # Used to deliver receipt frames even when the user has navigated away
        # from the specific conversation.
        self._global_user_sockets: dict[str, WebSocket] = {}

    async def connect(self, conversation_id: str, user_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._user_sockets[conversation_id][user_id] = ws
        self._global_user_sockets[user_id] = ws

    def disconnect(self, conversation_id: str, user_id: str, ws: WebSocket) -> None:
        if self._user_sockets[conversation_id].get(user_id) is ws:
            del self._user_sockets[conversation_id][user_id]
        if not self._user_sockets[conversation_id]:
            del self._user_sockets[conversation_id]
        # Only clear the global entry if it still points to this socket
        if self._global_user_sockets.get(user_id) is ws:
            del self._global_user_sockets[user_id]

    async def broadcast(self, conversation_id: str, payload: str) -> None:
        """Send payload to every socket currently in the conversation room."""
        dead: list[tuple[str, WebSocket]] = []
        for uid, ws in list(self._user_sockets.get(conversation_id, {}).items()):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append((uid, ws))
        for uid, ws in dead:
            self.disconnect(conversation_id, uid, ws)

    async def send_to_user(
        self, conversation_id: str, user_id: str, payload: str
    ) -> None:
        """
        Send payload to a specific user.
        First tries the conversation-specific socket (user is viewing that conversation).
        Falls back to the global socket (user is connected but viewing a different conversation).
        """
        # Try conversation-specific socket first
        ws = self._user_sockets.get(conversation_id, {}).get(user_id)
        if ws is None:
            # Fall back to global socket — user is connected elsewhere
            ws = self._global_user_sockets.get(user_id)
        if ws is None:
            return
        try:
            await ws.send_text(payload)
        except Exception:
            # Clean up whichever registry entry we used
            self._global_user_sockets.pop(user_id, None)
            conv_ws = self._user_sockets.get(conversation_id, {})
            if conv_ws.get(user_id) is ws:
                del conv_ws[user_id]


manager = ConnectionManager()
