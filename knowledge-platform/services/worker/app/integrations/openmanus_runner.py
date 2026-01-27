import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


def parse_output(raw_output: dict[str, Any]) -> dict[str, Any]:
    return raw_output


def run(evidence_pack: dict[str, Any], query: str, options: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    Stub implementation for OpenManus runner. Replace with real subprocess/API calls later.
    """
    _ = os.getenv("OPENMANUS_LLM_MODEL")
    _ = os.getenv("OPENMANUS_BASE_URL")
    _ = os.getenv("OPENMANUS_API_KEY")

    documents = evidence_pack.get("documents", [])
    first_doc = documents[0]
    second_doc = documents[1] if len(documents) > 1 else documents[0]

    report_markdown = """
# 深度检索证据包示例报告

本报告基于检索证据包生成，包含可追溯引用。[^CIT_1]

## 关键发现

- 证据包显示该领域的核心概念具有清晰定义。[^CIT_2]
- 多个来源支持统一的研究方向与验证路径。[^CIT_1]

## 建议

后续可在真实 OpenManus 调用中替换此 stub 输出，保持引用格式不变。[^CIT_2]
""".strip()

    citations = [
        {
            "citation_key": "CIT_1",
            "source_id": first_doc.get("source_id"),
            "chunk_id": first_doc.get("chunks", [])[0].get("chunk_id"),
            "quote_span": first_doc.get("chunks", [])[0].get("text"),
            "snapshot_uri": "s3://evidence/snapshots/demo.pdf",
        },
        {
            "citation_key": "CIT_2",
            "source_id": second_doc.get("source_id"),
            "chunk_id": second_doc.get("chunks", [])[1].get("chunk_id"),
            "quote_span": second_doc.get("chunks", [])[1].get("text"),
            "snapshot_uri": "s3://evidence/snapshots/demo.pdf",
        },
    ]

    raw_output = {
        "title": "深度检索证据包报告（Stub）",
        "report_markdown": report_markdown,
        "citations": citations,
    }

    logger.info("Generated stub OpenManus report for query: %s", query)
    return parse_output(raw_output)
