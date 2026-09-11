from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.services import get_gateway
from app.schemas.gateway import AuthorizeRequest
from app.services.gateway.payment_simulator import PaymentSimulator

router = APIRouter(prefix="/gateway", tags=["gateway"])


@router.post("/authorize", status_code=status.HTTP_201_CREATED)
async def authorize(data: AuthorizeRequest, gateway: Annotated[PaymentSimulator, Depends(get_gateway)]):
    return await gateway.authorize(user_id="demo", amount=data.amount, currency=data.currency, description=data.description)


@router.post("/capture")
async def capture(reference: str, gateway: Annotated[PaymentSimulator, Depends(get_gateway)]):
    return await gateway.capture(reference)


@router.post("/cancel")
async def cancel(reference: str, gateway: Annotated[PaymentSimulator, Depends(get_gateway)]):
    return await gateway.cancel(reference)


@router.get("/status/{reference}")
async def status(reference: str, gateway: Annotated[PaymentSimulator, Depends(get_gateway)]):
    return await gateway.status(reference)


@router.get("/ledger")
async def ledger(gateway: Annotated[PaymentSimulator, Depends(get_gateway)]):
    return gateway.ledger()