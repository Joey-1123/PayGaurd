import time

from app.models_ai.base import BaseModelAI, ModelResult, PaymentFeatures

SUSPICIOUS_KEYWORDS = [
    "urgent", "asap", "immediately", "emergency", "verify now",
    "gift card", "it support", "tech support", "refund", "security deposit",
    "prize", "lottery", "inheritance", "western union", "quick fix",
]

IMPERSONATION_PATTERNS = [
    "support", "customer care", "2fa", "verification", "irs", "bank ",
    "hr department", "ceo", "manager", "invoice desk",
]


class RuleEngineModel(BaseModelAI):
    """Deterministic fetchless scorer — always available, never fails."""

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        start = time.perf_counter()
        score = 0.0
        flags: list[str] = []

        if features.amount >= 100000:
            score += 40
            flags.append("high_amount")
        elif features.amount >= 25000:
            score += 25
            flags.append("elevated_amount")

        ratio = features.amount / features.user_avg_transaction if features.user_avg_transaction else 0.0
        if ratio > 10 and features.amount >= 25000:
            score += 20
            flags.append("unusual_amount_ratio")

        if not features.recipient_verified:
            score += 20
            flags.append("unverified_recipient")
        if features.previous_tx_count == 0:
            score += 15
            flags.append("new_recipient")

        if features.recipient_risk_category in ("high", "critical"):
            score += 20
            flags.append("flagged_recipient")

        text = features.description.lower()
        hit = [k for k in SUSPICIOUS_KEYWORDS if k in text]
        if hit:
            score += min(35, 12 * len(hit))
            flags.append("urgency_social_engineering")
        imp = [p for p in IMPERSONATION_PATTERNS if p in text]
        if imp and (features.previous_tx_count == 0 or not features.recipient_verified):
            score += 25
            flags.append("possible_impersonation")

        score = min(100.0, score)
        verdict = "safe" if score <= 30 else ("suspicious" if score <= 60 else "dangerous")
        explanation = (
            f"Rule engine flagged: {', '.join(flags) or 'no risk signals'}."
            if flags
            else "No deterministic risk signals detected."
        )
        return ModelResult(
            model_name="rule_engine",
            risk_score=score,
            confidence=0.95,
            verdict=verdict,
            flags=flags,
            explanation=explanation,
            latency_ms=int((time.perf_counter() - start) * 1000),
        )