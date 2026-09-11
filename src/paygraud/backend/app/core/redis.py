"""Async Redis client + lightweight guards. Redis is optional at runtime —
every call degrades gracefully when the cache/broker is down."""

from functools import lru_cache

from redis.asyncio import Redis

from app.config import get_settings


@lru_cache
def get_redis() -> Redis:
    settings = get_settings()
    return Redis.from_url(settings.redis_url, decode_responses=True)


async def is_rate_limited(key: str, limit: int, window_seconds: int = 60) -> bool:
    """Sliding counter guard. Returns True when the caller is over the limit."""
    if limit <= 0:
        return False
    try:
        client = get_redis()
        current = await client.incr(key)
        if current == 1:
            await client.expire(key, window_seconds)
        return current > int(limit)
    except Exception:
        return False


async def close_redis() -> None:
    try:
        await get_redis().aclose()
    except Exception:
        pass