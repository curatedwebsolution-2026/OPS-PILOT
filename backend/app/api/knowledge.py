from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.db.models import Document, User
from backend.app.schemas.schemas import DocumentUploadResponse, RAGSearchRequest, RAGSearchResult
from backend.app.api.deps import get_current_user
from backend.app.services.rag_service import rag_service
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.get("", response_model=List[DocumentUploadResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).where(Document.org_id == current_user.org_id).order_by(Document.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    contents = await file.read()
    text_content = contents.decode("utf-8", errors="ignore")

    doc_title = title or file.filename or "Uploaded Document"
    file_type = file.filename.split(".")[-1] if "." in file.filename else "txt"

    doc = await rag_service.ingest_document(
        db=db,
        org_id=current_user.org_id,
        title=doc_title,
        file_type=file_type,
        content=text_content,
        doc_metadata={"filename": file.filename, "size": len(contents)}
    )

    await audit_service.log_event(
        db=db,
        org_id=current_user.org_id,
        user_id=current_user.id,
        event_type="document.upload",
        target_type="Document",
        target_id=doc.id,
        action_details={"title": doc.title, "chunk_count": doc.chunk_count}
    )

    return doc

@router.post("/search", response_model=List[RAGSearchResult])
async def search_knowledge_base(
    payload: RAGSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    results = await rag_service.similarity_search(
        db=db,
        org_id=current_user.org_id,
        query=payload.query,
        top_k=payload.top_k
    )
    return [RAGSearchResult(**r) for r in results]
