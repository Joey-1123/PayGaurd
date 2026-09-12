import json
import re
import time

import httpx

from app.config import get_settings
from app.models_ai.base import BaseModelAI, ModelResult, ModelUnavailableError, PaymentFeatures

_SYSTEM = """You are a banking fraud-detection expert. Analyze the payment for scam indicators such as
impersonation, urgency-based social engineering, and unusual recipients. Reply with ONLY valid JSON:
{"risk_score": <0-100>, "confidence": <0-1>, "verdict": "safe|suspicious|dangerous", "flags": ["..."], "explanation": "one sentence"}

Payment: {payload}"""


def _extract_json(content: str) -> str:
    """Pull the first JSON object out of a model reply (handles code fences/prose)."""
    match = re.search(r"\{.*\}", content, re.DOTALL)
    return match.group(0) if match else content


class OpenAICompatibleModelAI(BaseModelAI):
    """Adapter for any OpenAI-compatible chat-completions API (OpenAI, Groq, OpenRouter).

    Subclasses set `api_key_setting`, `model_setting`, `base_url`, and a
    `name_prefix` used for consensus weighting and trace display.
    """

    api_key_setting: str = "openai_api_key"
    model_setting: str = "openai_model"
    base_url: str = "https://api.openai.com/v1"
    name_prefix: str = "openai"
    supports_json_mode: bool = True

    def __init__(self) -> None:
        self._settings = get_settings()

    @property
    def _model_name(self) -> str:
        return f"{self.name_prefix}/{getattr(self._settings, self.model_setting)}"

    async def analyze(self, features: PaymentFeatures) -> ModelResult:
        api_key = getattr(self._settings, self.api_key_setting)
        if not api_key:
            raise ModelUnavailableError(f"{self.name_prefix} API key not configured")
        start = time.perf_counter()
        headers = {"Authorization": f"Bearer {getattr(self._settings, self.api_key_setting)}"}
        body: dict = {
            "model": getattr(self._settings, self.model_setting),
            "messages": [
                {"role": "system", "content": _SYSTEM.replace("{payload}", json.dumps(features.to_prompt()))},
                {"role": "user", "content": "Return the JSON classification."},
            ],
            "temperature": 0.1,
        }
        # Keep the request maximally compatible: only send response_format when
        # the provider advertises JSON mode support.
        if self.supports_json_mode:
            body["response_format"] = {"type": "json_object"}
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=body)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
        try:
            data = json.loads(_extract_json(content))
        except (json.JSONDecodeError, KeyError, ValueError) as exc:
            raise ModelUnavailableError(f"{self.name_prefix} returned non-JSON") from exc
        return ModelResult(
            model_name=self._model_name,
            risk_score=float(data["risk_score"]),
            confidence=float(data["confidence"]),
            verdict=data["verdict"],
            flags=list(data.get("flags", [])),
            explanation=data.get("explanation", ""),
            latency_ms=int((time.perf_counter() - start) * 1000),
        )


class OpenAIModelAI(OpenAICompatibleModelAI):
    """OpenAI chat-completions adapter (async via httpx)."""

    api_key_setting = "openai_api_key"
    model_setting = "openai_model"
    base_url = "https://api.openai.com/v1"
    name_prefix = "openai"