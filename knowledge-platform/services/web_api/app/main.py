import logging
from fastapi import FastAPI

from api.v1.routes_reports import router as reports_router
from api.v1.routes_citations import router as citations_router
from db.models import Base
from db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Knowledge Platform API", openapi_url="/api/v1/openapi.json")

app.include_router(reports_router, prefix="/api/v1")
app.include_router(citations_router, prefix="/api/v1")


@app.on_event("startup")
def startup_event() -> None:
    logger.info("Creating database tables if they do not exist.")
    Base.metadata.create_all(bind=engine)
