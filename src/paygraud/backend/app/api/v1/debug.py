from fastapi import APIRouter

from app.agents.pipeline_trace import graph_snapshot, trace_store

router = APIRouter(tags=["debug"])


@router.get("/debug/pipeline")
async def pipeline_overview() -> dict:
    snapshot = graph_snapshot()
    last = trace_store.last()
    return {
        **snapshot,
        "last_run": {
            "payment_id": last[0],
            "trace": [t.__dict__ for t in last[1]],
        }
        if last
        else None,
    }


@router.get("/debug/pipeline/run/{payment_id}")
async def pipeline_run(payment_id: str) -> dict:
    trace = trace_store.get(payment_id)
    if trace is None:
        return {"payment_id": payment_id, "trace": [], "found": False}
    return {
        "payment_id": payment_id,
        "trace": [t.__dict__ for t in trace],
        "found": True,
    }