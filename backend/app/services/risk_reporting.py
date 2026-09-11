from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import RiskLevel
from app.models.alert import Alert
from app.models.payment import Payment
from app.models.recipient import Recipient
from app.models.user import User
from app.models_ai.base import PaymentFeatures

SEVERITY_BY_LEVEL = {
    RiskLevel.LOW: "low",
    RiskLevel.MEDIUM: "medium",
    RiskLevel.HIGH: "high",
    RiskLevel.CRITICAL: "critical",
}


async def build_features(db: AsyncSession, user: User, payment: Payment, recipient: Recipient | None) -> PaymentFeatures:
    avg = await db.scalar(select(func.avg(Payment.amount)).where(Payment.user_id == user.id)) or 0.0
    count = await db.scalar(select(func.count()).select_from(Payment).where(Payment.user_id == user.id)) or 0
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