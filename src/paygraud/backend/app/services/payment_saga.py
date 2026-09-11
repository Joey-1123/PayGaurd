"""Pure payment lifecycle state machine (saga) — no I/O, fully testable."""

from enum import Enum


class Status(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    AWAITING_CONFIRMATION = "awaiting_confirmation"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELED = "canceled"
    FAILED = "failed"


LEGAL_TRANSITIONS: dict[str, set[str]] = {
    Status.PENDING: {Status.ANALYZING},
    Status.ANALYZING: {Status.AWAITING_CONFIRMATION, Status.COMPLETED, Status.BLOCKED, Status.FAILED},
    Status.AWAITING_CONFIRMATION: {Status.CONFIRMED, Status.CANCELED, Status.BLOCKED},
    Status.CONFIRMED: {Status.COMPLETED, Status.FAILED},
    Status.COMPLETED: set(),
    Status.BLOCKED: set(),
    Status.CANCELED: set(),
    Status.FAILED: set(),
}


class IllegalTransitionError(ValueError):
    pass


def can_transition(current: Status, target: Status) -> bool:
    return target in LEGAL_TRANSITIONS.get(current.value, set())


def transition(current: Status, target: Status) -> Status:
    if not can_transition(current, target):
        raise IllegalTransitionError(f"Illegal payment transition {current.value} -> {target.value}")
    return target


def action_for_level(level: str) -> str:
    return {
        "low": "proceed",
        "medium": "hold",
        "high": "verification",
        "critical": "block",
    }[level]