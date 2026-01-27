import logging

from celery import shared_task

from db import models
from db.session import SessionLocal
from tasks.retrieval import build_evidence_pack
from tasks.agent import run_openmanus_task

logger = logging.getLogger(__name__)


@shared_task(name="pipeline.generate_report")
def generate_report(report_id: str) -> None:
    db = SessionLocal()
    report = None
    try:
        report = db.query(models.Report).filter(models.Report.id == report_id).first()
        if not report:
            logger.error("Report %s not found", report_id)
            return

        report.status = models.ReportStatus.RUNNING
        db.commit()

        evidence_pack_uri = build_evidence_pack(report_id)
        report.evidence_pack_uri = evidence_pack_uri
        db.commit()

        result = run_openmanus_task(
            report_id=report_id,
            evidence_pack_uri=evidence_pack_uri,
            query=report.query,
            options={},
        )

        report.title = result.get("title")
        report.report_markdown = result.get("report_markdown")

        for citation in result.get("citations", []):
            db.add(
                models.Citation(
                    report_id=report_id,
                    citation_key=citation["citation_key"],
                    source_id=citation["source_id"],
                    chunk_id=citation.get("chunk_id"),
                    quote_span=citation.get("quote_span"),
                    snapshot_uri=citation.get("snapshot_uri"),
                )
            )

        report.status = models.ReportStatus.SUCCEEDED
        db.commit()
        logger.info("Report %s succeeded", report_id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Report %s failed", report_id)
        if report:
            report.status = models.ReportStatus.FAILED
            report.error = str(exc)
            db.commit()
    finally:
        db.close()
