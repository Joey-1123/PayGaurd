import json
import time

import httpx

from app.config import get_settings
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures

_SYSTEM = """You are a cautious payment-safety reviewer. Inspect for social engineering, impersonation, or
fraudulent intent. Reply with ONLY valid JSON:
{"risk_score": <0-100>, "confidence": <0-1>, "verdict": "safe|suspicious|dangerous", "flags": ["..."], "explanation": "one sentence"}

Payment: {payload}"""


class AnthropicModelAI(BaseModelAI):
    """Anthropic Messages API adapter (async via httpx)."""

    def __init__(self) -> None:
        self._settings = get_settings()

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        if not self._settings.anthropic_api_key:
            raise ModelUnavailableError("Anthropic API key not configured")
        start = time.perf_counter()
        headers = {
            "x-api-key": self._settings.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        body = {
            "model": self._settings.anthropic_model,
            "max_tokens": 500,
            "system": _SYSTEM.format(payload=json.dumps(features.to_prompt())),
            "messages": [{"role": "user", "content": "Return the JSON classification."}],
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=body)
            resp.raise_for_status()
            content = resp.json()["content"][0]["text"]
        try:
            data = json.loads(content)
        except json.JSONDecodeError as exc:
            raise ModelUnavailableError("Anthropic returned non-JSON") from exc
        return ModelResult(
            model_name=f"anthropic/{self._settings.anthropic_model}",
            risk_score=float(data["risk_score"]),
            confidence=float(data["confidence"]),
            verdict=data["verdict"],
            flags=list(data.get("flags", [])),
            explanation=data.get("explanation", ""),
            latency_ms=int((time.perf_counter() - start) * 1000),
        )