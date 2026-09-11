from dataclasses import dataclass
from typing import TypedDict

from app.models_ai.base import ModelResult, PaymentFeatures

RISK_LEVEL_BANDS = {"low": 30, "medium": 60, "high": 85}

NODE_LOCAL = "local-score"
NODE_CLOUD = "cloud-parallel"
NODE_AGGREGATE = "aggregate"
NODE_DECIDE = "decide"

DECISION_LABEL = {
    "low": "AUTO_APPROVE",
    "medium": "HUMAN_CONFIRM",
    "high": "HUMAN_VERIFY",
    "critical": "AUTO_BLOCK",
}


def level_from_score(score: float) -> str:
    if score <= RISK_LEVEL_BANDS["low"]:
        return "low"
    if score <= RISK_LEVEL_BANDS["medium"]:
        return "medium"
    if score <= RISK_LEVEL_BANDS["high"]:
        return "high"
    return "critical"


def recommend(level: str) -> str:
    return {
        "low": "auto_approve",
        "medium": "confirmation_required",
        "high": "verification_required",
        "critical": "block",
    }[level]


def explain(level: str, reasons: str, features: PaymentFeatures) -> str:
    header = {
        "low": "Payment looks safe.",
        "medium": "Some risk signals detected.",
        "high": "High risk — review before proceeding.",
        "critical": "Critical risk — payment blocked for your protection.",
    }[level]
    beneficiary = (
        ""
        if features.previous_tx_count > 0 or features.recipient_verified
        else f" '{features.recipient_name}' is new/unverified."
    )
    return f"{header}{beneficiary} {reasons}".strip() or header


@dataclass
class TracerEvent:
    node: str
    status: str
    latency_ms: int
    score: float | None
    summary: str


class PipelineState(TypedDict, total=False):
    features: PaymentFeatures
    model_results: list[ModelResult]
    skip_cloud: bool
    final_score: float
    risk_level: str
    recommendation: str
    explanation: str
    decision: str
    trace: list[TracerEvent]