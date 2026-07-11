from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        # conversation_id -> set of active WebSocket connections
        self._rooms: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, conversation_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._rooms[conversation_id].add(ws)

    def disconnect(self, conversation_id: str, ws: WebSocket) -> None:
        self._rooms[conversation_id].discard(ws)
        if not self._rooms[conversation_id]:
            del self._rooms[conversation_id]

    async def broadcast(self, conversation_id: str, payload: str) -> None:
        dead: list[WebSocket] = []
        for ws in list(self._rooms.get(conversation_id, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(conversation_id, ws)


manager = ConnectionManager()
