import pytest

from app.agents.orchestrator import Orchestrator, RiskLevel
from app.agents.pipeline_graph import build_pipeline
from app.agents.pipeline_state import NODE_AGGREGATE, NODE_DECIDE, NODE_LOCAL
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures
from app.models_ai.rule_engine import RuleEngineModel


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


def _run_fake(model: FakeModel, payment_id: str = "p-1"):
    orch = Orchestrator(models=[model])
    return orch.analyze_payment(make_features(), payment_id=payment_id)


@pytest.mark.asyncio
async def test_graph_safe_local_skips_cloud():
    result = await _run_fake(FakeModel("ollama/qwen", 10.0, 0.95))
    assert result.risk_level is RiskLevel.LOW
    assert result.recommendation == "auto_approve"
    assert len(result.model_results) == 1


@pytest.mark.asyncio
async def test_graph_fallback_when_all_unavailable():
    result = await _run_fake(FakeModel("ollama/qwen", 90.0, 0.5, available=False))
    assert result.final_score >= 0
    assert result.model_results


@pytest.mark.asyncio
async def test_graph_cloud_fail_uses_fallback():
    local = FakeModel("ollama/qwen", 80.0, 0.5)
    cloud = FakeModel("openai/gpt", 70.0, 0.9, available=False)
    orch = Orchestrator(models=[local, cloud])
    result = await orch.analyze_payment(make_features(), payment_id="p-2")
    assert len(result.model_results) == 2


@pytest.mark.asyncio
async def test_graph_stream_emits_on_node_in_order():
    events: list[dict] = []

    async def on_node(node_id: str, event: dict) -> None:
        events.append({"node": node_id, **event})

    orch = Orchestrator(models=[FakeModel("ollama/qwen", 70.0, 0.5)])
    result = await orch.analyze_payment(make_features(), on_node=on_node)
    assert [e["node"] for e in events] == [NODE_LOCAL, NODE_AGGREGATE, NODE_DECIDE]
    assert events[0]["status"] == "danger"
    assert events[1]["status"] == "danger"
    assert events[2]["score"] == result.final_score
    assert all("summary" in e and "latency_ms" in e for e in events)


@pytest.mark.asyncio
async def test_graph_stream_includes_cloud_and_warn():
    events: list[dict] = []

    async def on_node(node_id: str, event: dict) -> None:
        events.append({"node": node_id, **event})

    orch = Orchestrator(models=[FakeModel("ollama/qwen", 50.0, 0.5), FakeModel("openai/gpt", 40.0, 0.9)])
    await orch.analyze_payment(make_features(), on_node=on_node)
    assert "cloud-parallel" in [e["node"] for e in events]
    assert events[0]["status"] in ("warn", "ok")


@pytest.mark.asyncio
async def test_graph_ladder_matches_narrative():
    pipeline = build_pipeline([RuleEngineModel()])
    scenarios = [
        (PaymentFeatures(amount=8000.0, currency="INR", description="Salary transfer", recipient_name="John Carter",
                         recipient_verified=True, recipient_risk_category="low", previous_tx_count=42,
                         user_avg_transaction=8000.0, user_tx_frequency=10), "low", "AUTO_APPROVE"),
        (PaymentFeatures(amount=25000.0, currency="INR", description="Booking deposit", recipient_name="Blue Lotus Events",
                         recipient_verified=False, recipient_risk_category="unknown", previous_tx_count=0,
                         user_avg_transaction=0.0, user_tx_frequency=10), "medium", "HUMAN_CONFIRM"),
        (PaymentFeatures(amount=1800.0, currency="INR", description="Card verification fee", recipient_name="Customer Care 2FA",
                         recipient_verified=False, recipient_risk_category="high", previous_tx_count=1,
                         user_avg_transaction=1800.0, user_tx_frequency=10), "high", "HUMAN_VERIFY"),
        (PaymentFeatures(amount=200000.0, currency="INR", description="Pending invoice settlement", recipient_name="Invoice Desk",
                         recipient_verified=False, recipient_risk_category="critical", previous_tx_count=0,
                         user_avg_transaction=200000.0, user_tx_frequency=10), "critical", "AUTO_BLOCK"),
    ]
    for features, expected_level, expected_decision in scenarios:
        state = await pipeline.ainvoke({"features": features, "trace": []})
        assert state["risk_level"] == expected_level
        assert state["decision"] == expected_decision