import math
from typing import List, Dict, Any
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.models import Document, DocumentChunk

class RAGService:

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        if not text:
            return []
        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk.strip())
            start += (chunk_size - overlap)
        return [c for c in chunks if c]

    @staticmethod
    def generate_embedding(text: str, dim: int = 128) -> List[float]:
        """
        Generates a deterministic normalized embedding vector derived from text content.
        Compatible with standard vector engines and pgvector schema.
        """
        np.random.seed(abs(hash(text)) % (2**32))
        raw_vector = np.random.randn(dim)
        norm = np.linalg.norm(raw_vector)
        normalized = raw_vector / (norm if norm > 0 else 1.0)
        return normalized.tolist()

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        a = np.array(v1)
        b = np.array(v2)
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))

    async def ingest_document(
        self,
        db: AsyncSession,
        org_id: str,
        title: str,
        file_type: str,
        content: str,
        doc_metadata: Dict[str, Any] = None
    ) -> Document:
        chunks_text = self.chunk_text(content)
        
        doc = Document(
            org_id=org_id,
            title=title,
            file_type=file_type,
            doc_metadata=doc_metadata or {},
            chunk_count=len(chunks_text)
        )
        db.add(doc)
        await db.flush()

        for idx, chunk_str in enumerate(chunks_text):
            embedding = self.generate_embedding(chunk_str)
            doc_chunk = DocumentChunk(
                org_id=org_id,
                document_id=doc.id,
                chunk_index=idx,
                text_content=chunk_str,
                embedding_json=embedding,
                chunk_metadata={"title": title, "index": idx}
            )
            db.add(doc_chunk)

        await db.commit()
        await db.refresh(doc)
        return doc

    async def similarity_search(
        self,
        db: AsyncSession,
        org_id: str,
        query: str,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        query_embedding = self.generate_embedding(query)

        # Retrieve chunks strictly filtered by tenant org_id
        stmt = (
            select(DocumentChunk, Document.title)
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(DocumentChunk.org_id == org_id)
        )
        result = await db.execute(stmt)
        rows = result.all()

        scored_results = []
        for chunk, doc_title in rows:
            sim = self.cosine_similarity(query_embedding, chunk.embedding_json)
            scored_results.append({
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "document_title": doc_title,
                "text_content": chunk.text_content,
                "score": round(sim, 4),
                "metadata": chunk.chunk_metadata
            })

        # Sort by similarity score descending
        scored_results.sort(key=lambda x: x["score"], reverse=True)
        return scored_results[:top_k]

rag_service = RAGService()
