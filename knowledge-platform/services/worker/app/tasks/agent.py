import logging

from celery import shared_task

from store.object_store import get_object_store
from integrations.openmanus_runner import run as run_openmanus

logger = logging.getLogger(__name__)


@shared_task(name="agent.run_openmanus")
def run_openmanus_task(report_id: str, evidence_pack_uri: str, query: str, options: dict | None = None) -> dict:
    logger.info("Running OpenManus stub for report %s", report_id)
    key = evidence_pack_uri.replace("s3://evidence/", "")
    store = get_object_store()
    evidence_pack = store.get_json(key)

    result = run_openmanus(evidence_pack=evidence_pack, query=query, options=options or {})
    return result
