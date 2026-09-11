import asyncio
import json
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

    async def publish_remote(self, event_type: str, payload: dict) -> None:
        """Local fan-out plus a Redis broadcast so other API/worker processes can relay it."""
        user_id = payload.get("user_id")
        await self.publish(event_type, payload)
        try:
            from app.core.redis import get_redis

            client = get_redis()
            frame = {"type": event_type, "user_id": user_id, "data": {k: v for k, v in payload.items() if k != "user_id"}}
            await client.publish("payguard:ws", json.dumps(frame))
        except Exception:
            pass

    async def start_subscriber(self) -> None:
        """Relay Redis pub/sub events from any publisher into local WebSocket connections."""
        from app.core.redis import get_redis

        while True:
            try:
                client = get_redis()
                pubsub = client.pubsub()
                await pubsub.subscribe("payguard:ws")
                async for message in pubsub.listen():
                    if message is None or message.get("type") != "message":
                        continue
                    event = json.loads(message["data"])
                    await self.send_to_user(event.get("user_id"), {"type": event.get("type", "event"), "data": event.get("data", {})})
            except asyncio.CancelledError:
                raise
            except Exception:
                await asyncio.sleep(2)


manager = ConnectionManager()