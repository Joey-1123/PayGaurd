from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from enum import Enum

from app.agents.pipeline_graph import build_pipeline
from app.agents.pipeline_trace import trace_store
from app.agents.pipeline_state import NODE_AGGREGATE, TracerEvent
from app.models_ai.base import BaseModelAI, ModelResult, PaymentFeatures
from app.models_ai.router import get_available_models, make_rule_engine

NodeCallback = Callable[[str, dict], Awaitable[None]]


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
    from app.agents.pipeline_state import level_from_score as _level

    return RiskLevel(_level(score))


def recommend(level: RiskLevel) -> str:
    return {
        RiskLevel.LOW: "auto_approve",
        RiskLevel.MEDIUM: "confirmation_required",
        RiskLevel.HIGH: "verification_required",
        RiskLevel.CRITICAL: "block",
    }[level]


def _node_status(event: TracerEvent, state: dict) -> str:
    """Score/level → ok | warn | danger for the live pipeline canvas."""
    score = event.score
    if score is not None:
        if score <= 30:
            return "ok"
        if score <= 60:
            return "warn"
        return "danger"
    if event.node == NODE_AGGREGATE:
        level = state.get("risk_level")
        return {"low": "ok", "medium": "warn", "high": "danger", "critical": "danger"}.get(level, "ok")
    return "ok"


class Orchestrator:
    """Facade over the compiled LangGraph pipeline (keeps existing call sites + tests)."""

    def __init__(self, models: list[BaseModelAI] | None = None) -> None:
        self._models = models if models is not None else get_available_models()
        self._fallback = make_rule_engine()
        self._pipeline = build_pipeline(self._models, self._fallback)

    async def analyze_payment(
        self,
        features: PaymentFeatures,
        payment_id: str | None = None,
        on_node: NodeCallback | None = None,
    ) -> RiskAssessment:
        state: dict = {"features": features, "trace": []}
        async for update in self._pipeline.astream(state, stream_mode="updates"):
            for node_id, payload in update.items():
                if node_id.startswith("__") or not isinstance(payload, dict):
                    continue
                state.update(payload)
                if on_node is not None and payload.get("trace"):
                    event: TracerEvent = payload["trace"][-1]
                    await on_node(
                        node_id,
                        {
                            "node": event.node,
                            "status": _node_status(event, state),
                            "score": event.score,
                            "latency_ms": event.latency_ms,
                            "summary": event.summary,
                        },
                    )
        if payment_id is not None:
            trace_store.put(str(payment_id), state.get("trace", []))
        return RiskAssessment(
            final_score=state["final_score"],
            risk_level=RiskLevel(state["risk_level"]),
            recommendation=state["recommendation"],
            explanation=state["explanation"],
            model_results=state["model_results"],
        )