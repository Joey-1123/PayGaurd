"""Persist inbound signals, score them, and route to alert/reject actions."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.signal import InboundSignal
from app.models.user import User
from app.models_ai.signal_scorer import score_signal
from app.schemas.signal import SignalInbound
from app.services import audit_service
from app.services.ingest.extractor import extract_features

STATUS_BY_ACTION = {"ignore": "clean", "alert": "flagged", "reject": "quarantined"}


async def ingest_signal(db: AsyncSession, user: User, payload: SignalInbound) -> InboundSignal:
    features = extract_features(payload.sender, payload.body)
    result = score_signal(features)

    signal = InboundSignal(
        user_id=user.id,
        channel=payload.channel,
        sender=payload.sender,
        body=payload.body,
        extracted_link=features.link,
        link_domain=features.link_domain,
        payee_name=features.payee_name,
        amount=features.amount,
        flags=result.flags,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        action=result.action,
        status=STATUS_BY_ACTION[result.action],
    )
    db.add(signal)
    await db.flush()

    if result.action != "ignore":
        db.add(
            Alert(
                user_id=user.id,
                alert_type="inbound_scam",
                severity=result.risk_level,
                risk_score=result.risk_score,
                title=f"{result.risk_level.title()} risk inbound {payload.channel}",
                description=result.explanation,
                lead_reason="signal_scorer",
                recommendations={"action": result.action, "signal_id": str(signal.id)},
            )
        )
        from app.services.connection_manager import manager

        await manager.publish_remote(
            "alert_new",
            {"user_id": str(user.id), "alert_id": None, "severity": result.risk_level, "signal_id": str(signal.id), "action": result.action},
        )

    await audit_service.log(
        db, "signal_scored", user.id, None, "signal", signal.id,
        {"channel": payload.channel, "risk_level": result.risk_level, "action": result.action, "flags": result.flags},
    )
    await db.commit()
    await db.refresh(signal)
    return signal