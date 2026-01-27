import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_session
from db import models
from schemas.report import (
    ReportCreateRequest,
    ReportCreateResponse,
    ReportDetailResponse,
    CitationSummary,
)
from tasks.queue import enqueue_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportCreateResponse, status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreateRequest, db: Session = Depends(get_session)):
    report = models.Report(query=payload.query, user_id=payload.user_id)
    db.add(report)
    db.commit()
    db.refresh(report)

    enqueue_report(report.id)

    return ReportCreateResponse(report_id=report.id, status=models.ReportStatus.PENDING.value)


@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report(report_id: str, db: Session = Depends(get_session)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    citations = (
        db.query(models.Citation, models.Source)
        .join(models.Source, models.Citation.source_id == models.Source.id)
        .filter(models.Citation.report_id == report_id)
        .all()
    )

    citation_summaries = [
        CitationSummary(
            citation_id=citation.id,
            citation_key=citation.citation_key,
            title=source.title,
            url=source.url,
            doi=source.doi,
            snapshot_uri=citation.snapshot_uri,
        )
        for citation, source in citations
    ]

    return ReportDetailResponse(
        report_id=report.id,
        status=report.status.value,
        query=report.query,
        title=report.title,
        report_markdown=report.report_markdown,
        citations=citation_summaries,
        error=report.error,
    )
