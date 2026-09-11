from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import business_error
from app.db.session import get_db
from app.models.signal import InboundSignal
from app.models.user import User
from app.schemas.signal import SignalInbound, SignalOut
from app.services import signal_service

router = APIRouter(prefix="/signals", tags=["signals"])


@router.post("/sms", response_model=SignalOut, status_code=status.HTTP_201_CREATED)
async def ingest_sms(
    data: SignalInbound,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> InboundSignal:
    return await signal_service.ingest_signal(db, user, data)


@router.get("", response_model=list[SignalOut])
async def list_signals(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    status_filter: str | None = None,
    limit: int = 20,
) -> list[InboundSignal]:
    query = select(InboundSignal).where(InboundSignal.user_id == user.id).order_by(InboundSignal.created_at.desc()).limit(min(limit, 100))
    if status_filter:
        query = query.where(InboundSignal.status == status_filter)
    result = await db.scalars(query)
    return list(result.all())


@router.get("/{signal_id}", response_model=SignalOut)
async def get_signal(
    signal_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> InboundSignal:
    signal = await db.get(InboundSignal, signal_id)
    if signal is None or signal.user_id != user.id:
        raise business_error("NOT_FOUND", "Signal not found", 404)
    return signal