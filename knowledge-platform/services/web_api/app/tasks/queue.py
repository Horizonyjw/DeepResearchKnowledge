import logging
from celery import Celery
from core.config import settings

logger = logging.getLogger(__name__)

celery_client = Celery(
    "web_api",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)


def enqueue_report(report_id: str) -> None:
    logger.info("Enqueuing report generation for %s", report_id)
    celery_client.send_task("pipeline.generate_report", args=[report_id])
