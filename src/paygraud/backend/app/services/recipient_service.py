import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import business_error
from app.models.recipient import Recipient
from app.models.user import User
from app.schemas.recipient import RecipientCreate


RISK_HINT_SCORE = {"low": 10.0, "medium": 50.0, "high": 80.0, "critical": 95.0}
RISK_HINT_CATEGORY = {"low": "low", "medium": "medium", "high": "high", "critical": "critical"}


def _automated_review(recipient: Recipient, risk_hint: str | None = None) -> None:
    if risk_hint in RISK_HINT_SCORE:
        recipient.verification_level = "flagged" if risk_hint in ("high", "critical") else "automated_review"
        recipient.risk_score = RISK_HINT_SCORE[risk_hint]
        recipient.risk_category = RISK_HINT_CATEGORY[risk_hint]
        return
    complete_profile = bool(recipient.bank_name and recipient.ifsc_code and (recipient.phone or recipient.email))
    recipient.verification_level = "automated_review"
    recipient.risk_score = 25.0 if complete_profile else 50.0
    recipient.risk_category = "low" if complete_profile else "medium"


async def create_recipient(db: AsyncSession, user: User, data: RecipientCreate) -> Recipient:
    existing = await db.scalar(
        select(Recipient).where(
            Recipient.user_id == user.id,
            Recipient.account_number == data.account_number,
        )
    )
    if existing:
        raise business_error("DUPLICATE_RECIPIENT", "Account already added", 409)
    recipient = Recipient(**data.model_dump(exclude={"risk_hint"}), user_id=user.id)
    _automated_review(recipient, data.risk_hint)
    db.add(recipient)
    await db.commit()
    await db.refresh(recipient)
    return recipient


async def verify_recipient(db: AsyncSession, recipient: Recipient, user: User) -> Recipient:
    if recipient.user_id != user.id:
        raise business_error("NOT_FOUND", "Recipient not found", 404)
    recipient.is_verified = True
    recipient.verification_level = recipient.verification_level if recipient.verification_level != "unverified" else "basic"
    recipient.risk_category = "low"
    recipient.risk_score = min(recipient.risk_score, 25.0)
    recipient.repeat_verification_count += 1
    await db.commit()
    await db.refresh(recipient)
    return recipient


def record_completed_payment(recipient: Recipient) -> None:
    recipient.previous_transaction_count += 1
    if recipient.previous_transaction_count >= 3:
        recipient.is_verified = True
        recipient.verification_level = "history_verified"
        recipient.risk_score = min(recipient.risk_score, 25.0)
        recipient.risk_category = "low"
