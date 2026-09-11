import pytest

from app.agents.orchestrator import Orchestrator, RiskLevel, level_from_score
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures


class FakeModel(BaseModelAI):
    def __init__(self, model_name: str, score: float, confidence: float, available: bool = True) -> None:
        self._name = model_name
        self._score = score
        self._confidence = confidence
        self._available = available

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        if not self._available:
            raise ModelUnavailableError("unavailable")
        return ModelResult(
            model_name=self._name,
            risk_score=self._score,
            confidence=self._confidence,
            verdict="flagged" if self._score > 50 else "clean",
            flags=["amount-anomaly"] if self._score > 50 else [],
            explanation="fake model output",
        )


def make_features() -> PaymentFeatures:
    return PaymentFeatures(
        amount=500.0,
        currency="USD",
        description="test",
        recipient_name="John",
        recipient_verified=True,
        recipient_risk_category="low",
        previous_tx_count=5,
        user_avg_transaction=300.0,
        user_tx_frequency=10,
    )


@pytest.mark.asyncio
async def test_safe_local_skips_cloud():
    local = FakeModel("ollama/qwen", 10.0, 0.95)
    orch = Orchestrator(models=[local])
    result = await orch.analyze_payment(make_features())
    assert result.risk_level == RiskLevel.LOW
    assert result.recommendation == "auto_approve"
    assert len(result.model_results) == 1


@pytest.mark.asyncio
async def test_fallback_when_all_unavailable():
    local = FakeModel("ollama/qwen", 90.0, 0.5, available=False)
    orch = Orchestrator(models=[local])
    result = await orch.analyze_payment(make_features())
    assert result.final_score >= 0
    assert result.model_results, "fallback rule engine should produce a result"


@pytest.mark.asyncio
async def test_cloud_train_raises_uses_fallback():
    local = FakeModel("ollama/qwen", 80.0, 0.5)
    cloud = FakeModel("openai/gpt", 70.0, 0.9, available=False)
    orch = Orchestrator(models=[local, cloud])
    result = await orch.analyze_payment(make_features())
    assert len(result.model_results) == 2
    assert any(r.model_name.startswith("openai") or "rule" in r.model_name for r in result.model_results)


def test_level_from_score_bands():
    assert level_from_score(5) is RiskLevel.LOW
    assert level_from_score(45) is RiskLevel.MEDIUM
    assert level_from_score(70) is RiskLevel.HIGH
    assert level_from_score(95) is RiskLevel.CRITICAL