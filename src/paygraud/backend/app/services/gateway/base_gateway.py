from abc import ABC, abstractmethod
from datetime import datetime

from pydantic import BaseModel


class GatewayStatus(str):
    PENDING = "pending"
    AUTHORIZED = "authorized"
    SETTLED = "settled"
    VOIDED = "voided"
    FAILED = "failed"


class GatewayResponse(BaseModel):
    reference: str
    status: str
    amount: float = 0.0
    currency: str = "USD"
    settled_at: str | None = None
    message: str = ""


class AuthResult(GatewayResponse):
    auth_reference: str
    hold_expires_at: str | None = None


class BaseGateway(ABC):
    """Port for the simulated payment gateway (no real money)."""

    @abstractmethod
    async def authorize(self, user_id: str, amount: float, currency: str, description: str = "") -> AuthResult:
        raise NotImplementedError

    @abstractmethod
    async def capture(self, auth_reference: str, currency: str = "USD") -> GatewayResponse:
        raise NotImplementedError

    @abstractmethod
    async def cancel(self, auth_reference: str) -> GatewayResponse:
        raise NotImplementedError

    @abstractmethod
    async def status(self, auth_reference: str) -> GatewayResponse:
        raise NotImplementedError

    @abstractmethod
    def ledger(self) -> dict:
        raise NotImplementedError