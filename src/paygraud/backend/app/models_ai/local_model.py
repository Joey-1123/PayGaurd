import json
import time

import httpx

from app.config import get_settings
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures
from app.models_ai.rule_engine import RuleEngineModel

_PROMPT = """You are a payment-security classifier. Analyze this payment and reply with ONLY valid JSON:
{{"risk_score": <0-100>, "confidence": <0-1>, "verdict": "safe|suspicious|dangerous", "flags": ["..."], "explanation": "one sentence"}}

Payment: {payload}"""


class LocalModelAI(BaseModelAI):
    """Ollama-backed model. Falls back to the rule engine when offline."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._fallback = RuleEngineModel()

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        start = time.perf_counter()
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(
                    f"{self._settings.ollama_base_url}/api/generate",
                    json={
                        "model": self._settings.ollama_model,
                        "prompt": _PROMPT.format(payload=json.dumps(features.to_prompt())),
                        "stream": False,
                        "format": "json",
                    },
                )
                resp.raise_for_status()
                data = json.loads(resp.json()["response"])
            return ModelResult(
                model_name=f"ollama/{self._settings.ollama_model}",
                risk_score=float(data["risk_score"]),
                confidence=float(data["confidence"]),
                verdict=data["verdict"],
                flags=list(data.get("flags", [])),
                explanation=data.get("explanation", ""),
                latency_ms=int((time.perf_counter() - start) * 1000),
            )
        except (httpx.HTTPError, KeyError, ValueError, json.JSONDecodeError) as exc:
            raise ModelUnavailableError(f"Ollama unavailable: {exc}") from exc