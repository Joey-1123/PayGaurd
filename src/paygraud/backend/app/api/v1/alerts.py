from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.services import get_payment_service
from app.core.exceptions import business_error
from app.db.session import get_db
from app.models.alert import Alert
from app.models.payment import Payment
from app.models.user import User
from app.schemas.alert import AlertOut, AlertStats
from app.schemas.payment import PaymentOut
from app.services import alert_service
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    severity: str | None = None,
    status_filter: str | None = None,
) -> list[Alert]:
    return await alert_service.list_alerts(db, user.id, severity=severity, status=status_filter)


@router.get("/stats", response_model=AlertStats)
async def alert_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> AlertStats:
    total = await db.scalar(select(func.count()).select_from(Alert).where(Alert.user_id == user.id)) or 0
    severity_rows = await db.execute(
        select(Alert.severity, func.count()).where(Alert.user_id == user.id).group_by(Alert.severity)
    )
    status_rows = await db.execute(
        select(Alert.status, func.count()).where(Alert.user_id == user.id).group_by(Alert.status)
    )
    return AlertStats(total=total, by_severity=dict(severity_rows.all()), by_status=dict(status_rows.all()))


@router.get("/{alert_id}", response_model=AlertOut)
async def get_alert(
    alert_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Alert:
    return await alert_service.get_alert(db, alert_id, user.id)


@router.put("/{alert_id}/dismiss", response_model=AlertOut)
async def dismiss_alert(
    alert_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Alert:
    alert = await alert_service.get_alert(db, alert_id, user.id)
    return await alert_service.dismiss_alert(db, alert, user.id)


@router.post("/{alert_id}/block", response_model=PaymentOut)
async def block_alert_payment(
    alert_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> Payment:
    alert = await alert_service.get_alert(db, alert_id, user.id)
    payment = await db.get(Payment, alert.payment_id) if alert.payment_id else None
    if payment is None:
        raise business_error("NOT_FOUND", "Payment for alert not found", 404)
    return await service.block(db, payment, user, block_reason="Blocked from security alert")