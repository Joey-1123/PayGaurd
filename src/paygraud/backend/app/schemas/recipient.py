import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class RecipientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    account_number: str = Field(min_length=1, max_length=50)
    bank_name: str | None = None
    ifsc_code: str | None = None
    phone: str | None = None
    email: str | None = None
    # Optional risk override — lets a scanner flag a payee as high-risk on creation.
    risk_hint: Literal["low", "medium", "high", "critical"] | None = None


class RecipientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    account_number: str
    bank_name: str | None
    is_verified: bool
    verification_level: str
    risk_score: float
    risk_category: str
    previous_transaction_count: int