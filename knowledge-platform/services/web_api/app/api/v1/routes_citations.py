import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_session
from db import models
from schemas.citation import CitationDetailResponse, SourceInfo, ChunkInfo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/citations", tags=["citations"])


@router.get("/{citation_id}", response_model=CitationDetailResponse)
def get_citation(citation_id: str, db: Session = Depends(get_session)):
    citation = db.query(models.Citation).filter(models.Citation.id == citation_id).first()
    if not citation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Citation not found")

    source = db.query(models.Source).filter(models.Source.id == citation.source_id).first()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    chunk = None
    if citation.chunk_id:
        chunk = db.query(models.Chunk).filter(models.Chunk.id == citation.chunk_id).first()

    return CitationDetailResponse(
        citation_id=citation.id,
        citation_key=citation.citation_key,
        source=SourceInfo(
            source_id=source.id,
            title=source.title,
            url=source.url,
            doi=source.doi,
        ),
        chunk=ChunkInfo(
            chunk_id=chunk.id,
            section_path=chunk.section_path,
            text=chunk.text,
            offset_start=chunk.offset_start,
            offset_end=chunk.offset_end,
        )
        if chunk
        else None,
        snapshot_uri=citation.snapshot_uri,
    )
