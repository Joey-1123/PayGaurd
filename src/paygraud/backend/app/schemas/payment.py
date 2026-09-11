import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    recipient_id: uuid.UUID | None = None
    amount: float = Field(gt=0, le=1_000_000)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    description: str = Field(default="", max_length=500)


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    recipient_id: uuid.UUID | None
    amount: float
    currency: str
    description: str | None
    status: str
    risk_score: float | None
    risk_level: str | None
    confidence: float | None
    recommendation: str | None
    human_confirmed: bool
    gateway_reference: str | None
    created_at: datetime


class RiskReport(BaseModel):
    payment_id: uuid.UUID
    risk_score: float
    risk_level: str
    confidence: float
    recommendation: str
    explanation: str
    models: list[dict]