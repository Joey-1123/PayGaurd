import pytest

from app.agents.orchestrator import Orchestrator, RiskLevel
from app.agents.pipeline_state import NODE_AGGREGATE, NODE_CLOUD, NODE_DECIDE, NODE_LOCAL
from app.agents.pipeline_trace import graph_snapshot, trace_store
from app.models_ai.base import BaseModelAI, ModelResult, PaymentFeatures


class FakeModel(BaseModelAI):
    def __init__(self, model_name: str, score: float, confidence: float) -> None:
        self._name = model_name
        self._score = score
        self._confidence = confidence

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        return ModelResult(
            model_name=self._name,
            risk_score=self._score,
            confidence=self._confidence,
            verdict="flagged" if self._score > 50 else "clean",
            flags=[],
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
async def test_trace_records_all_nodes_for_risky_payment():
    orch = Orchestrator(models=[FakeModel("ollama/qwen", 80.0, 0.7)])
    result = await orch.analyze_payment(make_features(), payment_id="trace-risky")
    assert result.risk_level is RiskLevel.HIGH
    names = [t.node for t in trace_store.get("trace-risky")]
    assert names == [NODE_LOCAL, NODE_AGGREGATE, NODE_DECIDE]
    assert trace_store.get("trace-risky")[-1].summary.endswith("HUMAN_VERIFY")


@pytest.mark.asyncio
async def test_trace_skips_cloud_when_short_circuit():
    orch = Orchestrator(models=[FakeModel("ollama/qwen", 10.0, 0.95)])
    await orch.analyze_payment(make_features(), payment_id="trace-safe")
    assert [t.node for t in trace_store.get("trace-safe")] == [
        NODE_LOCAL,
        NODE_AGGREGATE,
        NODE_DECIDE,
    ]


def test_graph_snapshot_contains_pipeline_nodes():
    snapshot = graph_snapshot()
    node_ids = {n["id"] for n in snapshot["nodes"]}
    assert {NODE_LOCAL, NODE_CLOUD, NODE_AGGREGATE, NODE_DECIDE} <= node_ids
    assert "graph TD" in snapshot["mermaid"]