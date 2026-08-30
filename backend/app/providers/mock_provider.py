from typing import Dict, Any, List, Optional
import re
from backend.app.providers.base import LLMProviderBase

class MockLLMProvider(LLMProviderBase):

    async def classify_intent(self, prompt: str, categories: List[str]) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        if "charge" in prompt_lower or "refund" in prompt_lower or "bill" in prompt_lower or "paid" in prompt_lower or "double" in prompt_lower:
            intent = "Billing & Financial"
            confidence = 0.96
            priority = "High"
        elif "cancel" in prompt_lower or "subscription" in prompt_lower or "downgrade" in prompt_lower:
            intent = "Subscription Lifecycle"
            confidence = 0.92
            priority = "High"
        elif "login" in prompt_lower or "password" in prompt_lower or "auth" in prompt_lower or "access" in prompt_lower:
            intent = "Account & Access"
            confidence = 0.94
            priority = "Medium"
        else:
            intent = categories[0] if categories else "General Query"
            confidence = 0.85
            priority = "Normal"

        return {
            "intent": intent,
            "confidence": confidence,
            "priority": priority,
            "summary": f"Detected {intent} request from customer prompt."
        }

    async def extract_entities(self, text: str, schema_fields: List[str]) -> Dict[str, Any]:
        entities = {}
        
        # Simple extraction heuristics for mock
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
        if email_match and "email" in schema_fields:
            entities["email"] = email_match.group(0)
            
        amount_match = re.search(r'\$?(\d+(\.\d{2})?)', text)
        if amount_match and "amount" in schema_fields:
            entities["amount"] = float(amount_match.group(1))
            
        tx_match = re.search(r'(TXN-\d+|INV-\d+|#\d+)', text)
        if tx_match and "transaction_id" in schema_fields:
            entities["transaction_id"] = tx_match.group(0)
            
        if "customer_issue" in schema_fields:
            entities["customer_issue"] = text[:120]

        return {
            "extracted_entities": entities,
            "field_coverage": len(entities) / max(len(schema_fields), 1)
        }

    async def generate_response_with_rag(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        system_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        context_str = "\n\n".join([c.get("text_content", "") for c in retrieved_chunks]) if retrieved_chunks else "No policy documents found."
        
        reasoning = (
            f"Based on retrieved evidence ({len(retrieved_chunks)} relevant policy chunks), "
            "the user request aligns with duplicate billing policy section 4.2. "
            "A duplicate charge refund is authorized subject to risk review and human approval if monetary value > $25."
        )

        recommended_response = (
            "Hello! We identified duplicate charges on your account. "
            "Per our billing policy, a full refund for the duplicate transaction of $49.00 has been initiated for manager approval. "
            "You should see the credit reflected on your statement within 3-5 business days once processed."
        )

        return {
            "reasoning": reasoning,
            "recommended_response": recommended_response,
            "confidence_score": 0.95,
            "evidence_count": len(retrieved_chunks)
        }

    async def evaluate_action_risk(
        self,
        context: Dict[str, Any],
        proposed_tool: str,
        tool_args: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Evaluate risk level based on tool safety rules
        if proposed_tool == "refund_payment_simulation":
            amount = tool_args.get("amount", 0.0)
            if amount > 100.0:
                risk_level = "critical"
                requires_approval = True
                reason = f"Refund amount (${amount:.2f}) exceeds high-value threshold ($100.00)."
            else:
                risk_level = "high"
                requires_approval = True
                reason = "Financial transaction refund always requires human verification."
        elif proposed_tool in ["update_customer", "cancel_subscription"]:
            risk_level = "medium"
            requires_approval = False
            reason = "Account lifecycle change requires audit log record."
        else:
            risk_level = "low"
            requires_approval = False
            reason = "Standard read or low-impact notification tool."

        return {
            "proposed_tool": proposed_tool,
            "tool_args": tool_args,
            "risk_level": risk_level,
            "requires_approval": requires_approval,
            "reason": reason,
            "ai_confidence": 0.98
        }
