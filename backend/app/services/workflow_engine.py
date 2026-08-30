import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.models import Workflow, WorkflowExecution, ExecutionTimelineNode
from backend.app.providers.factory import get_llm_provider
from backend.app.services.rag_service import rag_service
from backend.app.services.tool_registry import tool_registry
from backend.app.services.approval_service import approval_service
from backend.app.services.audit_service import audit_service

class WorkflowEngine:

    async def execute_workflow(
        self,
        db: AsyncSession,
        org_id: str,
        workflow_id: str,
        trigger_payload: Dict[str, Any],
        provider_name: Optional[str] = None
    ) -> WorkflowExecution:
        # 1. Fetch Workflow
        stmt = select(Workflow).where(Workflow.id == workflow_id, Workflow.org_id == org_id)
        res = await db.execute(stmt)
        workflow = res.scalar_one_or_none()

        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found for org {org_id}")

        graph = workflow.graph_json or {"nodes": [], "edges": []}
        nodes = graph.get("nodes", [])

        # 2. Create Workflow Execution Record
        execution = WorkflowExecution(
            org_id=org_id,
            workflow_id=workflow_id,
            status="running",
            trigger_payload=trigger_payload,
            risk_level="low",
            started_at=datetime.now(timezone.utc)
        )
        db.add(execution)
        await db.flush()

        await audit_service.log_event(
            db=db,
            org_id=org_id,
            event_type="execution.start",
            target_type="WorkflowExecution",
            target_id=execution.id,
            action_details={"workflow_id": workflow_id, "trigger_payload": trigger_payload}
        )

        llm = get_llm_provider(provider_name)
        start_time_total = time.time()
        node_context: Dict[str, Any] = {"payload": trigger_payload}
        retrieved_evidence: List[Dict[str, Any]] = []

        try:
            for node in nodes:
                node_id = node.get("id", "node")
                node_type = node.get("type", "step")
                node_data = node.get("data", {})
                node_label = node_data.get("label", node_type.title())

                execution.current_node_id = node_id
                node_start_time = time.time()

                timeline_record = ExecutionTimelineNode(
                    execution_id=execution.id,
                    org_id=org_id,
                    node_id=node_id,
                    node_type=node_type,
                    node_label=node_label,
                    status="running",
                    input_data=dict(node_context)
                )
                db.add(timeline_record)
                await db.flush()

                # Process individual node types
                output_data: Dict[str, Any] = {}

                if node_type == "trigger":
                    output_data = {"status": "TRIGGER_RECEIVED", "payload": trigger_payload}

                elif node_type == "classify":
                    prompt_text = str(trigger_payload.get("request", trigger_payload.get("message", "")))
                    categories = node_data.get("categories", ["Billing & Financial", "Account & Access", "Technical Support", "General"])
                    classification = await llm.classify_intent(prompt_text, categories)
                    output_data = classification
                    node_context["classification"] = classification

                elif node_type == "extract":
                    prompt_text = str(trigger_payload.get("request", trigger_payload.get("message", "")))
                    fields = node_data.get("fields", ["email", "amount", "transaction_id", "customer_issue"])
                    entities = await llm.extract_entities(prompt_text, fields)
                    output_data = entities
                    node_context["entities"] = entities.get("extracted_entities", {})

                elif node_type == "retrieve_knowledge":
                    query = str(trigger_payload.get("request", trigger_payload.get("message", "")))
                    chunks = await rag_service.similarity_search(db=db, org_id=org_id, query=query, top_k=3)
                    retrieved_evidence = chunks
                    output_data = {"chunks_found": len(chunks), "chunks": chunks}
                    node_context["knowledge"] = chunks

                elif node_type == "ai_agent":
                    query = str(trigger_payload.get("request", trigger_payload.get("message", "")))
                    reasoning_res = await llm.generate_response_with_rag(
                        query=query,
                        retrieved_chunks=retrieved_evidence,
                        system_instructions=node_data.get("system_instructions")
                    )
                    output_data = reasoning_res
                    node_context["agent_reasoning"] = reasoning_res

                elif node_type == "condition":
                    amount = node_context.get("entities", {}).get("amount", trigger_payload.get("amount", 0.0))
                    threshold = float(node_data.get("threshold", 25.0))
                    condition_met = amount >= threshold
                    output_data = {
                        "evaluated_amount": amount,
                        "threshold": threshold,
                        "condition_met": condition_met,
                        "decision": "REQUIRES_RISK_REVIEW" if condition_met else "AUTO_PASS"
                    }
                    node_context["condition"] = output_data

                elif node_type == "human_approval":
                    target_tool = node_data.get("proposed_tool", "refund_payment_simulation")
                    tool_args = node_context.get("entities", trigger_payload)
                    risk_eval = await llm.evaluate_action_risk(
                        context=node_context,
                        proposed_tool=target_tool,
                        tool_args=tool_args
                    )
                    
                    execution.risk_level = risk_eval.get("risk_level", "high")

                    if risk_eval.get("requires_approval", True):
                        await approval_service.create_request(
                            db=db,
                            org_id=org_id,
                            execution_id=execution.id,
                            workflow_id=workflow_id,
                            risk_level=execution.risk_level,
                            proposed_action=target_tool,
                            ai_recommendation=node_context.get("agent_reasoning", {}).get("recommended_response", "Initiate duplicate charge refund"),
                            reason=risk_eval.get("reason", "High-risk financial action requiring human review"),
                            retrieved_evidence=retrieved_evidence
                        )
                        execution.status = "pending_approval"
                        timeline_record.status = "pending_approval"
                        output_data = {"status": "PAUSED_FOR_HUMAN_APPROVAL", "risk_eval": risk_eval}
                        timeline_record.output_data = output_data
                        timeline_record.duration_ms = round((time.time() - node_start_time) * 1000, 2)
                        await db.commit()
                        
                        # Eager load timeline nodes before returning
                        exec_load = await db.execute(
                            select(WorkflowExecution)
                            .options(selectinload(WorkflowExecution.timeline_nodes))
                            .where(WorkflowExecution.id == execution.id)
                        )
                        return exec_load.scalar_one()

                elif node_type == "tool_action":
                    tool_key = node_data.get("tool_key", "refund_payment_simulation")
                    tool_args = node_context.get("entities", trigger_payload)
                    res = await tool_registry.execute_tool(tool_key, tool_args, org_id)
                    output_data = res
                    node_context["tool_result"] = res

                elif node_type == "notification":
                    output_data = {
                        "status": "DISPATCHED",
                        "channel": node_data.get("channel", "Slack"),
                        "message": f"Execution {execution.id} processed successfully."
                    }

                elif node_type == "end":
                    output_data = {"status": "WORKFLOW_COMPLETED", "summary": node_context.get("agent_reasoning")}

                # Update timeline node
                node_duration = round((time.time() - node_start_time) * 1000, 2)
                timeline_record.status = "completed"
                timeline_record.output_data = output_data
                timeline_record.duration_ms = node_duration

            # Complete Execution
            total_duration = round((time.time() - start_time_total) * 1000, 2)
            execution.status = "completed"
            execution.completed_at = datetime.now(timezone.utc)
            execution.execution_time_ms = total_duration
            execution.result_data = node_context

            await db.commit()

            await audit_service.log_event(
                db=db,
                org_id=org_id,
                event_type="execution.completed",
                target_type="WorkflowExecution",
                target_id=execution.id,
                action_details={"duration_ms": total_duration, "status": "completed"}
            )
            
            # Eager load timeline nodes before returning
            exec_load = await db.execute(
                select(WorkflowExecution)
                .options(selectinload(WorkflowExecution.timeline_nodes))
                .where(WorkflowExecution.id == execution.id)
            )
            return exec_load.scalar_one()

        except Exception as e:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.completed_at = datetime.now(timezone.utc)
            await db.commit()
            await audit_service.log_event(
                db=db,
                org_id=org_id,
                event_type="execution.failed",
                target_type="WorkflowExecution",
                target_id=execution.id,
                action_details={"error": str(e)}
            )
            raise e

workflow_engine = WorkflowEngine()
