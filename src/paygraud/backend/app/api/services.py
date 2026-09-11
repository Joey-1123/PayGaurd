from functools import lru_cache

from app.agents.orchestrator import Orchestrator
from app.services.connection_manager import manager
from app.services.gateway.payment_simulator import PaymentSimulator
from app.services.payment_service import PaymentService


@lru_cache
def get_gateway() -> PaymentSimulator:
    return PaymentSimulator()


@lru_cache
def get_orchestrator() -> Orchestrator:
    return Orchestrator()


@lru_cache
def get_payment_service() -> PaymentService:
    return PaymentService(gateway=get_gateway(), orchestrator=get_orchestrator(), publisher=manager.publish_remote)