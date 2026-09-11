"""Seed the 4 demo scenarios and run them through the full risk pipeline.

Requires a live Postgres (alembic upgrade head first). Run:
    uv run python -m scripts.seed_demo_scenarios
"""

import asyncio
import json

from app.api.services import get_payment_service
from app.core.security import hash_password
from app.db.session import async_session_factory
from app.models.payment import Payment
from app.models.recipient import Recipient
from app.models.user import User
from app.schemas.payment import PaymentCreate
from app.services.payment_saga import Status

DEMO_EMAIL = "demo@payguard.io"
DEMO_PASSWORD = "Payguard@123"

SCENARIOS = [
    {
        "name": "John Carter",
        "recipient": {"bank_name": "Chase", "account_number": "1111-2222", "is_verified": True, "verification_level": "basic", "risk_score": 15.0, "risk_category": "low", "previous_transaction_count": 42},
        "payment": {"recipient_id": None, "amount": 150.0, "currency": "USD", "description": "Salary transfer"},
    },
    {
        "name": "Blue Lotus Events",
        "recipient": {"bank_name": "HDFC", "account_number": "3333-4444", "is_verified": False, "verification_level": "unverified", "risk_score": 50.0, "risk_category": "unknown", "previous_transaction_count": 0},
        "payment": {"recipient_id": None, "amount": 2500.0, "currency": "USD", "description": "Booking deposit"},
    },
    {
        "name": "Customer Care 2FA",
        "recipient": {"bank_name": "ICICI", "account_number": "5555-6666", "is_verified": False, "verification_level": "unverified", "risk_score": 82.0, "risk_category": "high", "previous_transaction_count": 1},
        "payment": {"recipient_id": None, "amount": 750.0, "currency": "USD", "description": "Card verification fee"},
    },
    {
        "name": "Invoice Desk",
        "recipient": {"bank_name": "BOB", "account_number": "7777-8888", "is_verified": False, "verification_level": "unknown", "risk_score": 95.0, "risk_category": "critical", "previous_transaction_count": 0},
        "payment": {"recipient_id": None, "amount": 12000.0, "currency": "USD", "description": "Pending invoice settlement"},
    },
]


async def _seed() -> None:
    service = get_payment_service()
    async with async_session_factory() as db:
        user = await db.scalar(__import__("sqlalchemy").select(User).where(User.email == DEMO_EMAIL))
        if user is None:
            user = User(email=DEMO_EMAIL, hashed_password=hash_password(DEMO_PASSWORD), full_name="Demo User", is_active=True)
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"Created demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        else:
            print("Demo user already exists")

        for row in SCENARIOS:
            recipient = Recipient(**row["recipient"], user_id=user.id, name=row["name"])
            db.add(recipient)
            await db.flush()
            payment = await service.create_payment(db, user, PaymentCreate(**{**row["payment"], "recipient_id": recipient.id}))
            payment = await service.analyze_and_route(db, payment, user)
            await db.refresh(payment)
            print(
                f"[{row['name']}] score={payment.risk_score} level={payment.risk_level} "
                f"action={payment.recommendation} status={payment.status} ref={payment.gateway_reference or '-':<22}"
            )
        await db.commit()

    print("\nFinished seeding scenarios.")


if __name__ == "__main__":
    asyncio.run(_seed())
    print(json.dumps({"done": True}))