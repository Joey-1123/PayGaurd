from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import business_error
from app.models.alert import Alert


async def list_alerts(db: AsyncSession, user_id, severity: str | None = None, status: str | None = None) -> list[Alert]:
    from sqlalchemy import select

    query = select(Alert).where(Alert.user_id == user_id).order_by(Alert.created_at.desc())
    if severity:
        query = query.where(Alert.severity == severity)
    if status:
        query = query.where(Alert.status == status)
    return list((await db.scalars(query)).all())


async def get_alert(db: AsyncSession, alert_id, user_id) -> Alert:
    alert = await db.get(Alert, alert_id)
    if alert is None or alert.user_id != user_id:
        raise business_error("NOT_FOUND", "Alert not found", 404)
    return alert


async def dismiss_alert(db: AsyncSession, alert: Alert, user_id) -> Alert:
    alert.status = "dismissed"
    await db.commit()
    await db.refresh(alert)
    return alert