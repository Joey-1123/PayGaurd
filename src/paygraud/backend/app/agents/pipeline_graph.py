import asyncio
import time

from langgraph.graph import END, START, StateGraph

from app.agents.pipeline_state import (DECISION_LABEL, NODE_AGGREGATE, NODE_CLOUD, NODE_DECIDE,
                                       NODE_LOCAL, PipelineState, TracerEvent, explain,
                                       level_from_score, recommend)
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures
from app.models_ai.router import make_rule_engine, weight_for


def build_pipeline(models: list[BaseModelAI], fallback: BaseModelAI | None = None):
    """Compile the detection StateGraph: local → (cloud) → aggregate → decide."""
    fallback = fallback or make_rule_engine()

    async def local_score(state: PipelineState) -> PipelineState:
        started = time.perf_counter()
        try:
            result = await models[0].analyze(state["features"])
        except ModelUnavailableError:
            result = await fallback.analyze(state["features"])
        latency = int((time.perf_counter() - started) * 1000)
        skip = len(models) == 1 or (result.risk_score <= 30 and result.confidence > 0.9)
        trace = state.get("trace", []) + [
            _event(NODE_LOCAL, latency, result.risk_score,
                   f"{result.model_name} → {result.risk_score} conf {result.confidence:.2f}")
        ]
        return {"model_results": [result], "skip_cloud": skip, "trace": trace}

    async def cloud_parallel(state: PipelineState) -> PipelineState:
        started = time.perf_counter()
        outcomes = await asyncio.gather(
            *[m.analyze(state["features"]) for m in models[1:]], return_exceptions=True
        )
        latency = int((time.perf_counter() - started) * 1000)
        results, summaries = [], []
        for index, outcome in enumerate(outcomes):
            if isinstance(outcome, ModelResult):
                results.append(outcome)
                summaries.append(f"{outcome.model_name} → {outcome.risk_score:.1f}")
            else:
                results.append(await fallback.analyze(state["features"]))
                summaries.append(f"cloud[{index}] unavailable → fallback")
        trace = state.get("trace", []) + [
            _event(NODE_CLOUD, latency, None, "; ".join(summaries))
        ]
        return {"model_results": state["model_results"] + results, "trace": trace}

    def route_local(state: PipelineState) -> str:
        return NODE_AGGREGATE if state.get("skip_cloud") else NODE_CLOUD

    def aggregate(state: PipelineState) -> PipelineState:
        results: list[ModelResult] = state["model_results"]
        total = sum(r.confidence * weight_for(r.model_name) for r in results) or 1.0
        score = min(100.0, sum(r.risk_score * r.confidence * weight_for(r.model_name)
                               for r in results) / total)
        level = level_from_score(score)
        reasons = " ".join(r.explanation for r in results if r.explanation).strip()
        trace = state.get("trace", []) + [
            _event(NODE_AGGREGATE, 0, None, f"weighted consensus → {level}")
        ]
        return {
            "final_score": round(score, 1),
            "risk_level": level,
            "recommendation": recommend(level),
            "explanation": explain(level, reasons, state["features"]),
            "trace": trace,
        }

    def decide(state: PipelineState) -> PipelineState:
        trace = state.get("trace", []) + [
            _event(NODE_DECIDE, 0, state["final_score"],
                   f"{state['risk_level']} → {DECISION_LABEL[state['risk_level']]}")
        ]
        return {"decision": DECISION_LABEL[state["risk_level"]], "trace": trace}

    graph = StateGraph(PipelineState)
    graph.add_node(NODE_LOCAL, local_score)
    graph.add_node(NODE_CLOUD, cloud_parallel)
    graph.add_node(NODE_AGGREGATE, aggregate)
    graph.add_node(NODE_DECIDE, decide)
    graph.add_edge(START, NODE_LOCAL)
    graph.add_conditional_edges(
        NODE_LOCAL, route_local, {NODE_CLOUD: NODE_CLOUD, NODE_AGGREGATE: NODE_AGGREGATE}
    )
    graph.add_edge(NODE_CLOUD, NODE_AGGREGATE)
    graph.add_edge(NODE_AGGREGATE, NODE_DECIDE)
    graph.add_edge(NODE_DECIDE, END)
    return graph.compile()


def _event(node: str, latency_ms: int, score: float | None, summary: str) -> TracerEvent:
    return TracerEvent(node=node, status="ok", latency_ms=latency_ms, score=score, summary=summary)