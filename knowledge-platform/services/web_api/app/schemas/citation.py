from pydantic import BaseModel


class SourceInfo(BaseModel):
    source_id: str
    title: str | None
    url: str | None
    doi: str | None


class ChunkInfo(BaseModel):
    chunk_id: str
    section_path: str | None
    text: str
    offset_start: int | None
    offset_end: int | None


class CitationDetailResponse(BaseModel):
    citation_id: str
    citation_key: str
    source: SourceInfo
    chunk: ChunkInfo | None
    snapshot_uri: str | None
