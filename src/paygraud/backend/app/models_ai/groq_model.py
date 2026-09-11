from app.models_ai.openai_model import OpenAICompatibleModelAI


class GroqModelAI(OpenAICompatibleModelAI):
    """Groq (OpenAI-compatible endpoint) — ultra-low-latency Llama inference."""

    api_key_setting = "groq_api_key"
    model_setting = "groq_model"
    base_url = "https://api.groq.com/openai/v1"
    name_prefix = "groq"
    supports_json_mode = True
