from abc import ABC, abstractmethod
from dataclasses import dataclass, field


class ModelUnavailableError(RuntimeError):
    """Raised when a model cannot run (no key, no server, timeout)."""


@dataclass
class PaymentFeatures:
    amount: float
    currency: str
    description: str
    recipient_name: str
    recipient_verified: bool
    recipient_risk_category: str
    previous_tx_count: int
    user_avg_transaction: float
    user_tx_frequency: int

    def to_prompt(self) -> dict:
        return {
            "amount": self.amount,
            "currency": self.currency,
            "description": self.description,
            "recipient_name": self.recipient_name,
            "recipient_verified": self.recipient_verified,
            "recipient_risk_category": self.recipient_risk_category,
            "previous_tx_count": self.previous_tx_count,
            "user_avg_transaction": self.user_avg_transaction,
            "user_tx_frequency": self.user_tx_frequency,
        }


@dataclass
class ModelResult:
    model_name: str
    risk_score: float
    confidence: float
    verdict: str
    flags: list[str] = field(default_factory=list)
    explanation: str = ""
    latency_ms: int = 0


class BaseModelAI(ABC):
    """Port for an AI model adapter used in risk analysis."""

    @abstractmethod
    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        raise NotImplementedError