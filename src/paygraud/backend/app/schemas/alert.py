import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    payment_id: uuid.UUID | None
    alert_type: str
    severity: str
    risk_score: float
    title: str | None
    description: str | None
    status: str
    created_at: datetime


class AlertStats(BaseModel):
    total: int
    by_severity: dict[str, int]
    by_status: dict[str, int]