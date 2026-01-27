from typing import Any, Literal
from pydantic import BaseModel, Field


class ReportCreateOptions(BaseModel):
    depth: str | None = None
    language: str | None = None
    max_sources: int | None = None


class ReportCreateRequest(BaseModel):
    query: str
    user_id: str | None = None
    options: ReportCreateOptions | None = None


class ReportCreateResponse(BaseModel):
    report_id: str
    status: Literal["PENDING"]


class CitationSummary(BaseModel):
    citation_id: str
    citation_key: str
    title: str | None
    url: str | None
    doi: str | None
    snapshot_uri: str | None


class ReportDetailResponse(BaseModel):
    report_id: str
    status: str
    query: str
    title: str | None
    report_markdown: str | None
    citations: list[CitationSummary] = Field(default_factory=list)
    error: str | None
    options: dict[str, Any] | None = None
