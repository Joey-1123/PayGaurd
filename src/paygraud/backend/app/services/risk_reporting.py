from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import RiskLevel
from app.models.alert import Alert
from app.models.payment import Payment
from app.models.recipient import Recipient
from app.models.signal import InboundSignal
from app.models.user import User
from app.models_ai.base import PaymentFeatures
from app.core.redis import is_rate_limited

SEVERITY_BY_LEVEL = {
    RiskLevel.LOW: "low",
    RiskLevel.MEDIUM: "medium",
    RiskLevel.HIGH: "high",
    RiskLevel.CRITICAL: "critical",
}


async def _recent_signal(db: AsyncSession, user: User, recipient: Recipient | None) -> InboundSignal | None:
    if recipient is None:
        return None
    name = recipient.name.strip().lower()
    statement = select(InboundSignal).where(
        InboundSignal.user_id == user.id,
        InboundSignal.risk_level.in_(("high", "critical")),
        or_(func.lower(InboundSignal.payee_name) == name, func.lower(InboundSignal.body).contains(name)),
    ).order_by(InboundSignal.created_at.desc()).limit(1)
    return await db.scalar(statement)


async def build_features(db: AsyncSession, user: User, payment: Payment, recipient: Recipient | None) -> PaymentFeatures:
    count = await db.scalar(select(func.count()).select_from(Payment).where(Payment.user_id == user.id)) or 0
    avg_query = select(func.avg(Payment.amount)).where(Payment.user_id == user.id)
    if payment.recipient_id is not None:
        avg_query = avg_query.where(Payment.recipient_id == payment.recipient_id)
    avg = await db.scalar(avg_query) or 0.0
    signal = await _recent_signal(db, user, recipient)
    high_velocity = await is_rate_limited(f"payment_velocity:{user.id}", limit=3)
    return PaymentFeatures(
        amount=float(payment.amount),
        currency=payment.currency,
        description=payment.description or "",
        recipient_name=recipient.name if recipient else "unknown",
        recipient_verified=recipient.is_verified if recipient else False,
        recipient_risk_category=recipient.risk_category if recipient else "unknown",
        previous_tx_count=recipient.previous_transaction_count if recipient else 0,
        user_avg_transaction=float(avg),
        user_tx_frequency=int(count),
        high_velocity=high_velocity,
        recent_signal_risk=signal.risk_level if signal else None,
        recent_signal_context=signal.body[:300] if signal else "",
    )


async def emit_alert(db: AsyncSession, publisher, payment: Payment, user: User, assessment) -> None:
    if assessment.risk_level.value not in ("medium", "high", "critical"):
        return
    alert = Alert(
        payment_id=payment.id,
        user_id=user.id,
        recipient_id=payment.recipient_id,
        alert_type="risk_flagged",
        severity=SEVERITY_BY_LEVEL[assessment.risk_level],
        risk_score=assessment.final_score,
        title=f"{assessment.risk_level.value.title()} risk payment",
        description=assessment.explanation,
        lead_reason=assessment.model_results[0].model_name if assessment.model_results else None,
        recommendations={"action": assessment.recommendation},
    )
    db.add(alert)
    await db.flush()
    await publisher("alert_new", {"user_id": str(user.id), "alert_id": str(alert.id), "severity": alert.severity})
