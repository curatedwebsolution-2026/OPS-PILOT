import httpx
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings
from backend.app.providers.base import LLMProviderBase
from backend.app.providers.mock_provider import MockLLMProvider

class GeminiProvider(LLMProviderBase):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback = MockLLMProvider()

    async def classify_intent(self, prompt: str, categories: List[str]) -> Dict[str, Any]:
        if not self.api_key:
            return await self.fallback.classify_intent(prompt, categories)
        try:
            # Gemini API call implementation
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"Classify this request into one of {categories}: '{prompt}'. Return JSON with keys: intent, confidence, priority, summary."}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    import json
                    return json.loads(text)
        except Exception:
            pass
        return await self.fallback.classify_intent(prompt, categories)

    async def extract_entities(self, text: str, schema_fields: List[str]) -> Dict[str, Any]:
        return await self.fallback.extract_entities(text, schema_fields)

    async def generate_response_with_rag(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        system_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        return await self.fallback.generate_response_with_rag(query, retrieved_chunks, system_instructions)

    async def evaluate_action_risk(
        self,
        context: Dict[str, Any],
        proposed_tool: str,
        tool_args: Dict[str, Any]
    ) -> Dict[str, Any]:
        return await self.fallback.evaluate_action_risk(context, proposed_tool, tool_args)
