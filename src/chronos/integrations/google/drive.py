"""
Google Drive API Client

Provides high-level interface for Drive operations:
- Upload files
- Download files
- List files
- Share files
- Manage permissions

Example:
    auth = GoogleWorkspaceAuth()
    drive = DriveClient(auth)
    file_id = drive.upload_file('document.pdf', folder_id='abc123')
"""

import io
from typing import Any

from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

from .auth import GoogleWorkspaceAuth


class DriveClient:
    """
    Google Drive API client for file operations

    Handles file upload, download, and management via Drive API.
    """

    # Required OAuth scopes
    SCOPES = ["https://www.googleapis.com/auth/drive"]

    def __init__(self, auth: GoogleWorkspaceAuth):
        """
        Initialize Drive client

        Args:
            auth: GoogleWorkspaceAuth instance
        """
        self.auth = auth
        self.service = auth.get_service("drive", "v3", self.SCOPES)

    def upload_file(
        self, file_path: str, folder_id: str | None = None, mime_type: str | None = None
    ) -> str:
        """
        Upload a file to Drive

        Args:
            file_path: Path to file to upload
            folder_id: ID of folder to upload to (None = root)
            mime_type: MIME type (auto-detected if None)

        Returns:
            File ID of uploaded file

        Example:
            file_id = drive.upload_file('report.pdf', folder_id='abc123')
        """
        try:
            import os

            filename = os.path.basename(file_path)

            file_metadata = {"name": filename}
            if folder_id:
                file_metadata["parents"] = [folder_id]

            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)

            file = (
                self.service.files()
                .create(body=file_metadata, media_body=media, fields="id")
                .execute()
            )

            return file.get("id")

        except HttpError as e:
            raise HttpError(f"Failed to upload file: {e}", resp=e.resp, content=e.content) from e

    def list_files(
        self, query: str = "", max_results: int = 10, order_by: str = "modifiedTime desc"
    ) -> list[dict[str, Any]]:
        """
        List files matching query

        Args:
            query: Drive search query (e.g., "name contains 'report'")
            max_results: Maximum number of files to return
            order_by: Sort order

        Returns:
            List of file dictionaries

        Example:
            files = drive.list_files(query="mimeType='application/pdf'")
        """
        try:
            params = {
                "pageSize": max_results,
                "fields": "files(id, name, mimeType, createdTime, modifiedTime, size)",
                "orderBy": order_by,
            }
            if query:
                params["q"] = query

            results = self.service.files().list(**params).execute()
            files = results.get("files", [])

            return files

        except HttpError as e:
            raise HttpError(f"Failed to list files: {e}", resp=e.resp, content=e.content) from e

    def download_file(self, file_id: str, destination_path: str):
        """
        Download a file from Drive

        Args:
            file_id: ID of file to download
            destination_path: Local path to save file

        Example:
            drive.download_file('abc123', '/tmp/report.pdf')
        """
        try:
            request = self.service.files().get_media(fileId=file_id)

            with io.FileIO(destination_path, "wb") as fh:
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()

        except HttpError as e:
            raise HttpError(f"Failed to download file: {e}", resp=e.resp, content=e.content) from e

    def share_file(
        self, file_id: str, email: str, role: str = "reader", send_notification: bool = True
    ) -> dict[str, Any]:
        """
        Share a file with someone

        Args:
            file_id: ID of file to share
            email: Email address to share with
            role: Permission role ('reader', 'writer', 'commenter')
            send_notification: Send email notification

        Returns:
            Permission dictionary

        Example:
            drive.share_file('abc123', 'user@example.com', role='writer')
        """
        try:
            permission = {"type": "user", "role": role, "emailAddress": email}

            result = (
                self.service.permissions()
                .create(
                    fileId=file_id,
                    body=permission,
                    sendNotificationEmail=send_notification,
                    fields="id",
                )
                .execute()
            )

            return result

        except HttpError as e:
            raise HttpError(f"Failed to share file: {e}", resp=e.resp, content=e.content) from e

    def __repr__(self) -> str:
        """String representation"""
        return f"DriveClient(delegated_user='{self.auth.delegated_user}')"
