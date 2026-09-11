from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.alert import Alert
from app.models.user import User
from app.schemas.alert import AlertOut
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
async def list_alerts(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    severity: str | None = None,
    status_filter: str | None = None,
) -> list[Alert]:
    return await alert_service.list_alerts(db, user.id, severity=severity, status=status_filter)


@router.put("/{alert_id}/dismiss", response_model=AlertOut)
async def dismiss_alert(
    alert_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Alert:
    alert = await alert_service.get_alert(db, alert_id, user.id)
    return await alert_service.dismiss_alert(db, alert, user.id)