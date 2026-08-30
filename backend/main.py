from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import async_engine, Base
from backend.app.db.seed import seed_database
from backend.app.api.auth import router as auth_router
from backend.app.api.workflows import router as workflows_router
from backend.app.api.executions import router as executions_router
from backend.app.api.approvals import router as approvals_router
from backend.app.api.knowledge import router as knowledge_router
from backend.app.api.audit_logs import router as audit_logs_router
from backend.app.api.integrations import router as integrations_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.metrics import router as metrics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema exists and seed initial demo tenant data
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OPS PILOT - AI-Powered Business Operations & Workflow Automation Platform",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(workflows_router, prefix=api_v1_prefix)
app.include_router(executions_router, prefix=api_v1_prefix)
app.include_router(approvals_router, prefix=api_v1_prefix)
app.include_router(knowledge_router, prefix=api_v1_prefix)
app.include_router(audit_logs_router, prefix=api_v1_prefix)
app.include_router(integrations_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(metrics_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "version": "1.0.0"}

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
