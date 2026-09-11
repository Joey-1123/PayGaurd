import pytest

from app.services.gateway.payment_simulator import PaymentSimulator
from app.services.payment_saga import IllegalTransitionError, Status, can_transition, transition


@pytest.fixture
def gateway() -> PaymentSimulator:
    return PaymentSimulator()


@pytest.mark.asyncio
async def test_authorize_capture_cycle(gateway: PaymentSimulator):
    auth = await gateway.authorize(user_id="u1", amount=100.0, currency="USD")
    assert auth.status == "authorized"
    assert gateway.ledger()["acc_demo_sender"]["balance"] == 25000.0

    cap = await gateway.capture(auth.auth_reference, "USD")
    assert cap.status == "settled"
    ledger = gateway.ledger()
    assert ledger["acc_demo_sender"]["balance"] == 24900.0
    assert ledger["acc_demo_recipient"]["balance"] == 100.0


@pytest.mark.asyncio
async def test_capture_unknown_hold(gateway: PaymentSimulator):
    cap = await gateway.capture("TXN-NOPE", "USD")
    assert cap.status == "failed"


@pytest.mark.asyncio
async def test_cancel_releases_hold(gateway: PaymentSimulator):
    auth = await gateway.authorize(user_id="u1", amount=50.0, currency="USD")
    cancel = await gateway.cancel(auth.auth_reference)
    assert cancel.status == "voided"
    cap = await gateway.capture(auth.auth_reference, "USD")
    assert cap.status == "failed"


def test_block_is_terminal():
    assert can_transition(Status.ANALYZING, Status.BLOCKED)
    assert not can_transition(Status.BLOCKED, Status.CANCELED)
    with pytest.raises(IllegalTransitionError):
        transition(Status.BLOCKED, Status.CANCELED)