from backend.app.core.config import settings
from backend.app.providers.base import LLMProviderBase
from backend.app.providers.mock_provider import MockLLMProvider
from backend.app.providers.gemini_provider import GeminiProvider

def get_llm_provider(provider_name: str = None) -> LLMProviderBase:
    target_provider = (provider_name or settings.DEFAULT_LLM_PROVIDER).lower()
    
    if target_provider == "gemini":
        return GeminiProvider()
    elif target_provider == "mock":
        return MockLLMProvider()
    else:
        # Default fallback
        return MockLLMProvider()
