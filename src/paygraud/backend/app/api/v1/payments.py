from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.services import get_payment_service
from app.config import get_settings
from app.core.exceptions import business_error
from app.db.session import get_db
from app.models.model_result import ModelResult
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentOut, RiskReport
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=list[PaymentOut])
async def list_payments(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    status_filter: str | None = None,
    limit: int = 20,
) -> list[Payment]:
    query = select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc()).limit(min(limit, 100))
    if status_filter:
        query = query.where(Payment.status == status_filter)
    result = await db.scalars(query)
    return list(result.all())


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> Payment:
    return await service.create_payment(db, user, data)


@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(
    payment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Payment:
    payment = await db.get(Payment, payment_id)
    if payment is None or payment.user_id != user.id:
        raise business_error("NOT_FOUND", "Payment not found", 404)
    return payment


@router.post("/{payment_id}/analyze", response_model=PaymentOut)
async def analyze_payment(
    payment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> Payment:
    payment = await db.get(Payment, payment_id)
    if payment is None or payment.user_id != user.id:
        raise business_error("NOT_FOUND", "Payment not found", 404)
    if get_settings().async_analysis:
        from app.services.payment_saga import Status
        from app.worker import payment_analyze

        payment.status = Status.ANALYZING.value
        await db.commit()
        payment_analyze.delay(str(payment.id))
        await db.refresh(payment)
        return payment
    return await service.analyze_and_route(db, payment, user)


@router.get("/{payment_id}/risk", response_model=RiskReport)
async def risk_report(
    payment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> RiskReport:
    payment = await db.get(Payment, payment_id)
    if payment is None or payment.user_id != user.id:
        raise business_error("NOT_FOUND", "Payment not found", 404)
    results = (await db.scalars(select(ModelResult).where(ModelResult.payment_id == payment.id))).all()
    return RiskReport(
        payment_id=payment.id,
        risk_score=payment.risk_score or 0.0,
        risk_level=payment.risk_level or "unknown",
        confidence=payment.confidence or 0.0,
        recommendation=payment.recommendation or "",
        explanation=payment.description or "",
        models=[{"model": r.model_name, "risk_score": r.risk_score, "verdict": r.verdict, "flags": r.flags} for r in results],
    )


@router.post("/{payment_id}/confirm", response_model=PaymentOut)
async def confirm_payment(
    payment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> Payment:
    payment = await db.get(Payment, payment_id)
    if payment is None or payment.user_id != user.id:
        raise business_error("NOT_FOUND", "Payment not found", 404)
    return await service.confirm(db, payment, user)


@router.post("/{payment_id}/block", response_model=PaymentOut)
async def block_payment(
    payment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[PaymentService, Depends(get_payment_service)],
) -> Payment:
    payment = await db.get(Payment, payment_id)
    if payment is None or payment.user_id != user.id:
        raise business_error("NOT_FOUND", "Payment not found", 404)
    return await service.block(db, payment, user, block_reason="User-initiated block")