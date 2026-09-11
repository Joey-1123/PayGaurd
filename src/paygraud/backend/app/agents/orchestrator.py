import asyncio
from dataclasses import dataclass, field
from enum import Enum

from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures
from app.models_ai.router import get_available_models, make_rule_engine, weight_for

RISK_LEVEL_BANDS = {"low": 30, "medium": 60, "high": 85}


class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class RiskAssessment:
    final_score: float
    risk_level: RiskLevel
    recommendation: str
    explanation: str
    model_results: list[ModelResult] = field(default_factory=list)


def level_from_score(score: float) -> RiskLevel:
    if score <= RISK_LEVEL_BANDS["low"]:
        return RiskLevel.LOW
    if score <= RISK_LEVEL_BANDS["medium"]:
        return RiskLevel.MEDIUM
    if score <= RISK_LEVEL_BANDS["high"]:
        return RiskLevel.HIGH
    return RiskLevel.CRITICAL


def recommend(level: RiskLevel) -> str:
    return {
        RiskLevel.LOW: "auto_approve",
        RiskLevel.MEDIUM: "confirmation_required",
        RiskLevel.HIGH: "verification_required",
        RiskLevel.CRITICAL: "block",
    }[level]


class Orchestrator:
    """Runs fast local scoring first, then cloud models in parallel; aggregates weighted."""

    def __init__(self, models: list[BaseModelAI] | None = None) -> None:
        self._models = models if models is not None else get_available_models()
        self._fallback = make_rule_engine()

    async def analyze_payment(self, features: PaymentFeatures) -> RiskAssessment:
        results: list[ModelResult] = []

        try:
            local = await self._models[0].analyze(features)
            results.append(local)
        except ModelUnavailableError:
            local = await self._fallback.analyze(features)
            results.append(local)

        cloud = self._models[1:]
        if local.risk_score <= 30 and local.confidence > 0.9 or not cloud:
            return self._build_assessment(results, features)

        outcomes = await asyncio.gather(*[m.analyze(features) for m in cloud], return_exceptions=True)
        for outcome in outcomes:
            if isinstance(outcome, ModelResult):
                results.append(outcome)
            else:
                results.append(await self._fallback.analyze(features))
        return self._build_assessment(results, features)

    def _build_assessment(self, results: list[ModelResult], features: PaymentFeatures) -> RiskAssessment:
        total_weight = sum(r.confidence * weight_for(r.model_name) for r in results) or 1.0
        final_score = min(100.0, sum(r.risk_score * r.confidence * weight_for(r.model_name) for r in results) / total_weight)
        level = level_from_score(final_score)
        flags = [f for r in results for f in r.flags]
        reasons = " ".join(r.explanation for r in results if r.explanation).strip()
        explanation = self._explain(level, reasons, features)
        return RiskAssessment(
            final_score=round(final_score, 1),
            risk_level=level,
            recommendation=recommend(level),
            explanation=explanation,
            model_results=results,
        )

    def _explain(self, level: RiskLevel, reasons: str, features: PaymentFeatures) -> str:
        header = {
            RiskLevel.LOW: "Payment looks safe.",
            RiskLevel.MEDIUM: "Some risk signals detected.",
            RiskLevel.HIGH: "High risk — review before proceeding.",
            RiskLevel.CRITICAL: "Critical risk — payment blocked for your protection.",
        }[level]
        recipient = features.recipient_name
        beneficiary = "" if features.previous_tx_count > 0 or features.recipient_verified else f" '{recipient}' is new/unverified."
        return f"{header}{beneficiary} {reasons}".strip() or header