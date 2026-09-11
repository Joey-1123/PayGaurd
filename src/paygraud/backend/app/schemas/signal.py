from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SignalInbound(BaseModel):
    sender: str = Field(min_length=1, max_length=100)
    body: str = Field(min_length=1, max_length=2000)
    channel: str = Field(default="sms", max_length=20)
    received_at: datetime | None = None


class SignalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    channel: str
    sender: str
    body: str
    extracted_link: str | None
    link_domain: str | None
    flags: list | None
    risk_score: float | None
    risk_level: str | None
    action: str | None
    status: str
    created_at: datetime