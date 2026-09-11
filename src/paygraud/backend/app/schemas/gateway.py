from pydantic import BaseModel, Field


class AuthorizeRequest(BaseModel):
    amount: float = Field(gt=0, le=1_000_000)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: str = ""


class GatewayTradeOut(BaseModel):
    reference: str
    status: str
    amount: float
    currency: str
    message: str