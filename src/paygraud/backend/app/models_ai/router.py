from app.config import get_settings
from app.models_ai.anthropic_model import AnthropicModelAI
from app.models_ai.base import BaseModelAI
from app.models_ai.groq_model import GroqModelAI
from app.models_ai.local_model import LocalModelAI
from app.models_ai.openai_model import OpenAIModelAI
from app.models_ai.openrouter_model import OpenRouterModelAI
from app.models_ai.rule_engine import RuleEngineModel

NAME_WEIGHTS = {
    "openai/": 0.35,
    "anthropic/": 0.30,
    "groq/": 0.15,
    "openrouter/": 0.10,
    "ollama/": 0.10,
}


def get_available_models() -> list[BaseModelAI]:
    """Always include local; cloud models only when keys are configured."""
    settings = get_settings()
    models: list[BaseModelAI] = [LocalModelAI()]
    if settings.openai_api_key:
        models.append(OpenAIModelAI())
    if settings.anthropic_api_key:
        models.append(AnthropicModelAI())
    if settings.groq_api_key:
        models.append(GroqModelAI())
    if settings.openrouter_api_key:
        models.append(OpenRouterModelAI())
    return models


def make_rule_engine() -> BaseModelAI:
    return RuleEngineModel()


def weight_for(model_name: str, fallback: float = 0.25) -> float:
    for prefix, weight in NAME_WEIGHTS.items():
        if model_name.startswith(prefix):
            return weight
    return fallback