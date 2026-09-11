from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[user_id].add(ws)
        await self.send_to_user(user_id, {"type": "connected", "data": {"user_id": user_id}})

    def disconnect(self, user_id: str, ws: WebSocket) -> None:
        self._connections[user_id].discard(ws)
        if not self._connections[user_id]:
            self._connections.pop(user_id, None)

    async def send_to_user(self, user_id: str, message: dict) -> None:
        for ws in list(self._connections.get(user_id, ())):
            try:
                await ws.send_json(message)
            except RuntimeError:
                self.disconnect(user_id, ws)

    async def publish(self, event_type: str, payload: dict) -> None:
        user_id = payload.pop("user_id", None)
        if user_id is not None:
            await self.send_to_user(user_id, {"type": event_type, "data": payload})


manager = ConnectionManager()