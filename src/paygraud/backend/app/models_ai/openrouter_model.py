from app.models_ai.openai_model import OpenAICompatibleModelAI


class OpenRouterModelAI(OpenAICompatibleModelAI):
    """OpenRouter (OpenAI-compatible endpoint) — access to many hosted models."""

    api_key_setting = "openrouter_api_key"
    model_setting = "openrouter_model"
    base_url = "https://openrouter.ai/api/v1"
    name_prefix = "openrouter"
    supports_json_mode = True
