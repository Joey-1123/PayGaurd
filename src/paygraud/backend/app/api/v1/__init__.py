from fastapi import APIRouter

from app.api.v1 import alerts, auth, gateway, payments, recipients, signals, websockets

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(payments.router)
api_router.include_router(recipients.router)
api_router.include_router(alerts.router)
api_router.include_router(gateway.router)
api_router.include_router(signals.router)
api_router.include_router(websockets.router)