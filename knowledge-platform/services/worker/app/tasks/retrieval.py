import logging
import uuid
from datetime import datetime

from celery import shared_task

from db import models
from db.session import SessionLocal
from store.object_store import get_object_store

logger = logging.getLogger(__name__)


def _fake_documents(report_id: str) -> list[dict]:
    doc1_source_id = f"source-{uuid.uuid4()}"
    doc2_source_id = f"source-{uuid.uuid4()}"

    doc1_chunks = [
        {
            "chunk_id": f"chunk-{uuid.uuid4()}",
            "text": "示例文档一：该研究提出了关键术语的标准化定义。",
            "section_path": "摘要",
            "offset_start": 0,
            "offset_end": 20,
        },
        {
            "chunk_id": f"chunk-{uuid.uuid4()}",
            "text": "示例文档一：实验结果显示指标显著提升。",
            "section_path": "实验",
            "offset_start": 21,
            "offset_end": 40,
        },
    ]

    doc2_chunks = [
        {
            "chunk_id": f"chunk-{uuid.uuid4()}",
            "text": "示例文档二：研究综述了该领域的历史演进。",
            "section_path": "引言",
            "offset_start": 0,
            "offset_end": 24,
        },
        {
            "chunk_id": f"chunk-{uuid.uuid4()}",
            "text": "示例文档二：提出了未来研究方向与挑战。",
            "section_path": "结论",
            "offset_start": 25,
            "offset_end": 50,
        },
    ]

    return [
        {
            "source_id": doc1_source_id,
            "title": "示例文献一",
            "url": "https://example.com/doc1",
            "doi": "10.0000/example1",
            "authors": "Alice; Bob",
            "year": 2023,
            "venue": "DemoConf",
            "chunks": doc1_chunks,
        },
        {
            "source_id": doc2_source_id,
            "title": "示例文献二",
            "url": "https://example.com/doc2",
            "doi": "10.0000/example2",
            "authors": "Carol; Dave",
            "year": 2022,
            "venue": "DemoJournal",
            "chunks": doc2_chunks,
        },
    ]


@shared_task(name="retrieval.build_evidence_pack")
def build_evidence_pack(report_id: str) -> str:
    logger.info("Building evidence pack for report %s", report_id)

    documents = _fake_documents(report_id)
    evidence_pack = {
        "report_id": report_id,
        "generated_at": datetime.utcnow().isoformat(),
        "documents": documents,
    }

    db = SessionLocal()
    try:
        for doc in documents:
            source = models.Source(
                id=doc["source_id"],
                title=doc["title"],
                url=doc["url"],
                doi=doc["doi"],
                authors=doc["authors"],
                year=doc["year"],
                venue=doc["venue"],
            )
            db.merge(source)

            for chunk in doc["chunks"]:
                db.merge(
                    models.Chunk(
                        id=chunk["chunk_id"],
                        source_id=doc["source_id"],
                        section_path=chunk.get("section_path"),
                        text=chunk["text"],
                        offset_start=chunk.get("offset_start"),
                        offset_end=chunk.get("offset_end"),
                    )
                )

        db.commit()
    finally:
        db.close()

    store = get_object_store()
    key = f"evidence_packs/{report_id}.json"
    evidence_uri = store.put_json(key, evidence_pack)

    logger.info("Stored evidence pack at %s", evidence_uri)
    return evidence_uri
