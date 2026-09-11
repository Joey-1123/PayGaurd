from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import business_error
from app.db.session import get_db
from app.models.payment import Payment
from app.models.recipient import Recipient
from app.models.user import User
from app.schemas.payment import PaymentOut
from app.schemas.recipient import RecipientCreate, RecipientOut
from app.services import recipient_service

router = APIRouter(prefix="/recipients", tags=["recipients"])


@router.get("", response_model=list[RecipientOut])
async def list_recipients(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[Recipient]:
    result = await db.scalars(select(Recipient).where(Recipient.user_id == user.id).order_by(Recipient.created_at.desc()))
    return list(result.all())


@router.post("", response_model=RecipientOut, status_code=status.HTTP_201_CREATED)
async def create_recipient(
    data: RecipientCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Recipient:
    return await recipient_service.create_recipient(db, user, data)


@router.get("/{recipient_id}", response_model=RecipientOut)
async def get_recipient(
    recipient_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Recipient:
    recipient = await db.get(Recipient, recipient_id)
    if recipient is None or recipient.user_id != user.id:
        raise business_error("NOT_FOUND", "Recipient not found", 404)
    return recipient


@router.get("/{recipient_id}/history", response_model=list[PaymentOut])
async def recipient_history(
    recipient_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> list[Payment]:
    recipient = await db.get(Recipient, recipient_id)
    if recipient is None or recipient.user_id != user.id:
        raise business_error("NOT_FOUND", "Recipient not found", 404)
    result = await db.scalars(
        select(Payment).where(Payment.recipient_id == recipient.id).order_by(Payment.created_at.desc())
    )
    return list(result.all())


@router.post("/{recipient_id}/verify", response_model=RecipientOut)
async def verify_recipient(
    recipient_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Recipient:
    recipient = await db.get(Recipient, recipient_id)
    if recipient is None or recipient.user_id != user.id:
        raise business_error("NOT_FOUND", "Recipient not found", 404)
    return await recipient_service.verify_recipient(db, recipient, user)