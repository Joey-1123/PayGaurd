import pytest

from app.agents.orchestrator import Orchestrator
from app.services.payment_saga import (
    IllegalTransitionError,
    Status,
    action_for_level,
    can_transition,
    transition,
)


def test_pending_to_analyzing():
    assert can_transition(Status.PENDING, Status.ANALYZING)
    assert transition(Status.PENDING, Status.ANALYZING) == Status.ANALYZING


def test_analyzing_terminals():
    assert can_transition(Status.ANALYZING, Status.AWAITING_CONFIRMATION)
    assert can_transition(Status.ANALYZING, Status.COMPLETED)
    assert can_transition(Status.ANALYZING, Status.BLOCKED)
    assert can_transition(Status.ANALYZING, Status.FAILED)


def test_awaiting_confirmation_paths():
    assert can_transition(Status.AWAITING_CONFIRMATION, Status.CONFIRMED)
    assert can_transition(Status.AWAITING_CONFIRMATION, Status.CANCELED)
    assert can_transition(Status.AWAITING_CONFIRMATION, Status.BLOCKED)


def test_terminal_states_reject_all():
    for final in (Status.COMPLETED, Status.BLOCKED, Status.CANCELED, Status.FAILED):
        assert not can_transition(final, Status.PENDING)
        with pytest.raises(IllegalTransitionError):
            transition(final, Status.ANALYZING)


def test_no_skip_to_completed():
    assert not can_transition(Status.PENDING, Status.COMPLETED)
    assert not can_transition(Status.AWAITING_CONFIRMATION, Status.COMPLETED)


def test_action_for_level():
    assert action_for_level("low") == "proceed"
    assert action_for_level("medium") == "hold"
    assert action_for_level("high") == "verification"
    assert action_for_level("critical") == "block"