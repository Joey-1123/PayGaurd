import json
import time

import httpx

from app.config import get_settings
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures

_SYSTEM = """You are a banking fraud-detection expert. Analyze the payment for scam indicators such as
impersonation, urgency-based social engineering, and unusual recipients. Reply with ONLY valid JSON:
{"risk_score": <0-100>, "confidence": <0-1>, "verdict": "safe|suspicious|dangerous", "flags": ["..."], "explanation": "one sentence"}

Payment: {payload}"""


class OpenAIModelAI(BaseModelAI):
    """OpenAI chat-completions adapter (async via httpx)."""

    def __init__(self) -> None:
        self._settings = get_settings()

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        if not self._settings.openai_api_key:
            raise ModelUnavailableError("OpenAI API key not configured")
        start = time.perf_counter()
        headers = {"Authorization": f"Bearer {self._settings.openai_api_key}"}
        body = {
            "model": self._settings.openai_model,
            "messages": [
                {"role": "system", "content": _SYSTEM.format(payload=json.dumps(features.to_prompt()))},
                {"role": "user", "content": "Return the JSON classification."},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
        try:
            data = json.loads(content)
        except json.JSONDecodeError as exc:
            raise ModelUnavailableError("OpenAI returned non-JSON") from exc
        return ModelResult(
            model_name=f"openai/{self._settings.openai_model}",
            risk_score=float(data["risk_score"]),
            confidence=float(data["confidence"]),
            verdict=data["verdict"],
            flags=list(data.get("flags", [])),
            explanation=data.get("explanation", ""),
            latency_ms=int((time.perf_counter() - start) * 1000),
        )