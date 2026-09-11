from fastapi import APIRouter

from app.agents.pipeline_trace import graph_snapshot, trace_store
from app.config import get_settings
from app.models_ai.router import NAME_WEIGHTS, get_available_models, make_rule_engine

router = APIRouter(tags=["debug"])

# provider → (settings key attr, settings model attr, base_url, free-tier?)
_PROVIDER_META = {
    "openai": ("openai_api_key", "openai_model", "https://api.openai.com/v1", False),
    "anthropic": ("anthropic_api_key", "anthropic_model", "https://api.anthropic.com", False),
    "groq": ("groq_api_key", "groq_model", "https://api.groq.com/openai/v1", True),
    "openrouter": ("openrouter_api_key", "openrouter_model", "https://openrouter.ai/api/v1", True),
    "ollama": (None, "ollama_model", None, True),  # local, no key needed
}


@router.get("/debug/models")
async def models_overview() -> dict:
    """Which AI providers are wired into the consensus pipeline and their weights."""
    settings = get_settings()
    live_classes = {type(m).__name__ for m in get_available_models()}
    _class_for = {
        "openai": "OpenAIModelAI",
        "anthropic": "AnthropicModelAI",
        "groq": "GroqModelAI",
        "openrouter": "OpenRouterModelAI",
        "ollama": "LocalModelAI",
    }

    providers = []
    for prefix, (key_attr, model_attr, base_url, free_tier) in _PROVIDER_META.items():
        configured = key_attr is None or bool(getattr(settings, key_attr))
        providers.append({
            "provider": prefix,
            "model": getattr(settings, model_attr),
            "configured": configured,
            "live": _class_for[prefix] in live_classes,
            "weight": NAME_WEIGHTS.get(f"{prefix}/", 0.25),
            "base_url": base_url,
            "free_tier": free_tier,
        })

    return {
        "providers": providers,
        "always_on": {
            "provider": "rule_engine",
            "model": "deterministic-v1",
            "live": True,
            "role": "per-slot fallback when a cloud model is unavailable",
        },
        "consensus": {
            "method": "confidence × weight, normalized at aggregation",
            "unknown_model_weight": 0.25,
        },
    }


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