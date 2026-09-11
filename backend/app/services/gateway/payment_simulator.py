import uuid
from datetime import datetime, timedelta, timezone

from app.services.gateway.base_gateway import (
    AuthResult,
    BaseGateway,
    GatewayResponse,
    GatewayStatus,
)


class PaymentSimulator(BaseGateway):
    """Fake gateway. Holds funds on authorize, moves a demo ledger on capture."""

    def __init__(self) -> None:
        self._holds: dict[str, float] = {}
        self._ledger = {
            "acc_demo_sender": {"balance": 25000.00, "currency": "USD"},
            "acc_demo_recipient": {"balance": 0.00, "currency": "USD"},
        }

    async def authorize(self, user_id: str, amount: float, currency: str, description: str = "") -> AuthResult:
        ref = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        self._holds[ref] = amount
        return AuthResult(
            reference=ref,
            auth_reference=ref,
            status=GatewayStatus.AUTHORIZED,
            amount=amount,
            currency=currency,
            hold_expires_at=(datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
            message="Funds held (simulated). Capture required to transfer.",
        )

    async def capture(self, auth_reference: str, currency: str = "USD") -> GatewayResponse:
        if auth_reference not in self._holds:
            return GatewayResponse(reference=auth_reference, status=GatewayStatus.FAILED, message="Unknown or expired hold")
        amount = self._holds.pop(auth_reference, None) or 0.0
        self._ledger["acc_demo_sender"]["balance"] -= amount
        self._ledger["acc_demo_recipient"]["balance"] += amount
        return GatewayResponse(
            reference=auth_reference,
            status=GatewayStatus.SETTLED,
            amount=amount,
            currency=currency,
            settled_at=datetime.now(timezone.utc).isoformat(),
            message="Transfer settled (simulated).",
        )

    async def cancel(self, auth_reference: str) -> GatewayResponse:
        self._holds.pop(auth_reference, None)
        return GatewayResponse(
            reference=auth_reference,
            status=GatewayStatus.VOIDED,
            message="Authorization released — no funds moved.",
        )

    async def status(self, auth_reference: str) -> GatewayResponse:
        return GatewayResponse(
            reference=auth_reference,
            status=GatewayStatus.AUTHORIZED if auth_reference in self._holds else GatewayStatus.VOIDED,
            message="Simulated gateway status.",
        )

    def ledger(self) -> dict:
        return self._ledger