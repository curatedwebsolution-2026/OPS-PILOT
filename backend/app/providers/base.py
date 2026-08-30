from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class LLMProviderBase(ABC):
    
    @abstractmethod
    async def classify_intent(self, prompt: str, categories: List[str]) -> Dict[str, Any]:
        """Classify user request into intent category and priority."""
        pass

    @abstractmethod
    async def extract_entities(self, text: str, schema_fields: List[str]) -> Dict[str, Any]:
        """Extract structured JSON entities from request text."""
        pass

    @abstractmethod
    async def generate_response_with_rag(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        system_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response and reasoning based on query and RAG context."""
        pass

    @abstractmethod
    async def evaluate_action_risk(
        self,
        context: Dict[str, Any],
        proposed_tool: str,
        tool_args: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate risk level (low, medium, high, critical) and recommendation for tool execution."""
        pass
