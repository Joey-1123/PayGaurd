from collections import OrderedDict

from app.agents.pipeline_graph import build_pipeline
from app.models_ai.base import BaseModelAI, PaymentFeatures


class TraceStore:
    """In-memory per-payment traces for the pipeline debug view."""

    def __init__(self, maxlen: int = 128) -> None:
        self._runs: OrderedDict[str, list] = OrderedDict()
        self._maxlen = maxlen

    def put(self, payment_id: str, trace: list) -> None:
        self._runs[payment_id] = trace
        self._runs.move_to_end(payment_id)
        while len(self._runs) > self._maxlen:
            self._runs.popitem(last=False)

    def get(self, payment_id: str) -> list | None:
        return self._runs.get(payment_id)

    def last(self) -> tuple[str, list] | None:
        if not self._runs:
            return None
        payment_id, trace = next(reversed(self._runs.items()))
        return payment_id, trace


trace_store = TraceStore()

_models_cache: list[BaseModelAI] | None = None


def default_models() -> list[BaseModelAI]:
    global _models_cache
    if _models_cache is None:
        from app.models_ai.router import get_available_models  # avoid import cycle

        _models_cache = get_available_models()
    return _models_cache


async def run_pipeline(
    features: PaymentFeatures,
    payment_id: str,
    models: list[BaseModelAI] | None = None,
    fallback: BaseModelAI | None = None,
):
    pipeline = build_pipeline(models or default_models(), fallback)
    state = await pipeline.ainvoke({"features": features, "trace": []})
    trace_store.put(payment_id, state.get("trace", []))
    return state


def draw_mermaid() -> str:
    return build_pipeline(default_models()).get_graph().draw_mermaid()


def graph_snapshot() -> dict:
    structure = build_pipeline(default_models()).get_graph()
    nodes = [{"id": node_id, "label": node.name} for node_id, node in structure.nodes.items()]
    edges = [{"source": str(e[0]), "target": str(e[1])} for e in structure.edges]
    return {"nodes": nodes, "edges": edges, "mermaid": draw_mermaid()}