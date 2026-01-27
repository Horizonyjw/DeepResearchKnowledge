FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/services/worker/app:/app/services/web_api/app

COPY services/worker/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY services/worker/app /app/services/worker/app
COPY services/web_api/app /app/services/web_api/app

CMD ["celery", "-A", "celery_app", "worker", "--loglevel=info"]
