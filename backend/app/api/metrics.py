from fastapi import APIRouter, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Histogram

REQUEST_COUNT = Counter('opspilot_http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'http_status'])
WORKFLOW_EXEC_TIME = Histogram('opspilot_workflow_execution_duration_seconds', 'Workflow execution duration in seconds')

router = APIRouter(tags=["Metrics"])

@router.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
