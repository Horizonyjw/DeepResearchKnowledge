import json
import logging
from typing import Any

import boto3
from botocore.exceptions import ClientError

from core.config import settings

logger = logging.getLogger(__name__)


class ObjectStore:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.minio_endpoint,
            aws_access_key_id=settings.minio_access_key,
            aws_secret_access_key=settings.minio_secret_key,
        )
        self.bucket = settings.minio_bucket
        self._ensure_bucket()

    def _ensure_bucket(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket)
        except ClientError:
            logger.info("Creating bucket %s", self.bucket)
            self.client.create_bucket(Bucket=self.bucket)

    def put_json(self, key: str, data: dict[str, Any]) -> str:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.client.put_object(Bucket=self.bucket, Key=key, Body=body)
        return f"s3://{self.bucket}/{key}"

    def get_json(self, key: str) -> dict[str, Any]:
        response = self.client.get_object(Bucket=self.bucket, Key=key)
        raw = response["Body"].read().decode("utf-8")
        return json.loads(raw)


def get_object_store() -> ObjectStore:
    return ObjectStore()
