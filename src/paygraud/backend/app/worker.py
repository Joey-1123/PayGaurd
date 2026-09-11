"""Celery worker: offline payment analysis + cross-process alert broadcast.

Run with: uv run celery -A app.worker.celery worker -l info --pool=solo
"""

from celery import Celery

from app.config import get_settings

settings = get_settings()

celery = Celery("payguard", broker=settings.celery_broker_url, backend=settings.celery_result_backend)
celery.conf.update(task_track_started=True, broker_connection_retry_on_startup=True)


@celery.task(name="payguard.payment_analyze")
def payment_analyze(payment_id: str) -> None:
    """Run full risk analysis + routing for a payment outside the request cycle."""
    import asyncio

    from app.api.services import get_payment_service
    from app.db.session import async_session_factory

    async def _run() -> None:
        from app.models.payment import Payment
        from app.models.user import User

        async with async_session_factory() as db:
            payment = await db.get(Payment, payment_id)
            if payment is None:
                return
            user = await db.get(User, payment.user_id)
            if user is None:
                return
            await get_payment_service().analyze_and_route(db, payment, user)

    asyncio.run(_run())


@celery.task(name="payguard.alert_broadcast")
def alert_broadcast(event: dict) -> None:
    """Publish an alert event onto the WS bridge channel for any API process."""
    import json

    import redis as redis_sync

    try:
        client = redis_sync.from_url(settings.redis_url, decode_responses=True)
        client.publish("payguard:ws", json.dumps(event))
    except Exception:
        pass