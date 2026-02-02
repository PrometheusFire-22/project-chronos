import logging
import os
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

DIRECTUS_URL = os.getenv(
    "DIRECTUS_URL", "https://chronos.automatonicai.com"
)  # Default specific to user context from previous logs if any, or generic
DIRECTUS_TOKEN = os.getenv("DIRECTUS_TOKEN", "")


class DirectusClient:
    def __init__(self, base_url: str = DIRECTUS_URL, token: str = DIRECTUS_TOKEN):
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}

    async def download_file(self, file_id: str, dest_path: Path) -> Path | None:
        url = f"{self.base_url}/assets/{file_id}"
        logger.info(f"Downloading file from {url}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, follow_redirects=True)
                response.raise_for_status()

                with open(dest_path, "wb") as f:
                    for chunk in response.iter_bytes():
                        f.write(chunk)

            logger.info(f"File saved to {dest_path}")
            return dest_path
        except Exception as e:
            logger.error(f"Failed to download file {file_id}: {e}")
            raise
