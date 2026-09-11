from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import Orchestrator
from app.models.model_result import ModelResult
from app.models.payment import Payment
from app.models.recipient import Recipient
from app.models.user import User
from app.schemas.payment import PaymentCreate
from app.services import audit_service
from app.services.gateway.base_gateway import BaseGateway
from app.services.payment_saga import Status, action_for_level, transition
from app.services.risk_reporting import build_features, emit_alert


async def _noop() -> None:
    return None


class PaymentService:
    def __init__(self, gateway: BaseGateway, orchestrator: Orchestrator, publisher=None) -> None:
        self.gateway = gateway
        self.orchestrator = orchestrator
        self.publisher = publisher or (lambda _e, _p: _noop())

    async def create_payment(self, db: AsyncSession, user: User, data: PaymentCreate, source: str = "web") -> Payment:
        payment = Payment(user_id=user.id, recipient_id=data.recipient_id, amount=data.amount, currency=data.currency, description=data.description, status=Status.PENDING, source=source)
        db.add(payment)
        await db.flush()
        await audit_service.log(db, "created_payment", user.id, payment.id, "payment", payment.id, {"amount": data.amount})
        await db.commit()
        await db.refresh(payment)
        return payment

    async def analyze_and_route(self, db: AsyncSession, payment: Payment, user: User) -> Payment:
        recipient = await db.get(Recipient, payment.recipient_id) if payment.recipient_id else None
        features = await build_features(db, user, payment, recipient)
        assessment = await self.orchestrator.analyze_payment(features)
        payment.status = transition(Status(payment.status), Status.ANALYZING)
        payment.risk_score = assessment.final_score
        payment.risk_level = assessment.risk_level.value
        payment.confidence = round(sum(r.confidence for r in assessment.model_results) / max(1, len(assessment.model_results)), 2)
        payment.recommendation = assessment.recommendation
        for r in assessment.model_results:
            db.add(ModelResult(payment_id=payment.id, model_name=r.model_name, model_type="llm", risk_score=r.risk_score, confidence=r.confidence, verdict=r.verdict, flags=r.flags or None, explanation=r.explanation))
        await emit_alert(db, self.publisher, payment, user, assessment)
        await audit_service.log(db, "risk_analyzed", user.id, payment.id, "payment", payment.id, {"risk_level": assessment.risk_level.value, "score": assessment.final_score})
        action = action_for_level(assessment.risk_level.value)
        if action == "block":
            return await self.block(db, payment, user, block_reason=assessment.explanation)
        if action == "proceed":
            return await self._complete(db, payment, user)
        payment.status = transition(payment.status, Status.AWAITING_CONFIRMATION)
        await db.commit()
        await db.refresh(payment)
        return payment

    async def confirm(self, db: AsyncSession, payment: Payment, user: User) -> Payment:
        payment.status = transition(Status(payment.status), Status.CONFIRMED)
        payment.human_confirmed = True
        return await self._capture(db, payment, user)

    async def block(self, db: AsyncSession, payment: Payment, user: User, block_reason: str = "") -> Payment:
        if payment.gateway_reference:
            await self.gateway.cancel(payment.gateway_reference)
        payment.status = transition(Status(payment.status), Status.BLOCKED)
        await audit_service.log(db, "blocked_payment", user.id, payment.id, "payment", payment.id, {"reason": block_reason})
        await db.commit()
        await db.refresh(payment)
        return payment

    async def _complete(self, db: AsyncSession, payment: Payment, user: User) -> Payment:
        auth = await self.gateway.authorize(user_id=str(user.id), amount=float(payment.amount), currency=payment.currency)
        payment.gateway_reference = auth.auth_reference
        payment.human_confirmed = True
        return await self._capture(db, payment, user)

    async def _capture(self, db: AsyncSession, payment: Payment, user: User) -> Payment:
        settled = await self.gateway.capture(payment.gateway_reference, payment.currency)
        if settled.status == "settled":
            payment.status = transition(Status(payment.status), Status.COMPLETED)
            payment.confirmed_at = datetime.now(timezone.utc)
            action = "payment_settled"
        else:
            payment.status = transition(Status(payment.status), Status.FAILED)
            action = "payment_failed"
        await audit_service.log(db, action, user.id, payment.id, "payment", payment.id, {"gateway_status": settled.status})
        await db.commit()
        await db.refresh(payment)
        return payment