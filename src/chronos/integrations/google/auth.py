"""
Google Workspace Authentication Module

Handles authentication for Google Workspace APIs using service account
with domain-wide delegation.

Features:
- Service account authentication
- Domain-wide delegation support
- Automatic credential refresh
- Scope management
- Error handling

Example:
    auth = GoogleWorkspaceAuth()
    service = auth.get_service('gmail', 'v1', GmailClient.SCOPES)
"""

import os

from googleapiclient.discovery import Resource, build
from googleapiclient.errors import HttpError

from google.oauth2 import service_account


class GoogleWorkspaceAuth:
    """
    Authentication wrapper for Google Workspace APIs

    Manages service account credentials and domain-wide delegation.
    """

    def __init__(self, service_account_file: str | None = None, delegated_user: str | None = None):
        """
        Initialize authentication

        Args:
            service_account_file: Path to service account JSON key file
                                 Defaults to GOOGLE_SERVICE_ACCOUNT_FILE env var
            delegated_user: Email of user to impersonate
                           Defaults to GOOGLE_DELEGATED_USER env var

        Raises:
            FileNotFoundError: If service account file doesn't exist
            ValueError: If required environment variables not set
        """
        self.service_account_file = service_account_file or os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
        self.delegated_user = delegated_user or os.getenv("GOOGLE_DELEGATED_USER")

        if not self.service_account_file:
            raise ValueError(
                "Service account file not specified. Set GOOGLE_SERVICE_ACCOUNT_FILE "
                "environment variable or pass service_account_file parameter."
            )

        if not self.delegated_user:
            raise ValueError(
                "Delegated user not specified. Set GOOGLE_DELEGATED_USER "
                "environment variable or pass delegated_user parameter."
            )

        if not os.path.exists(self.service_account_file):
            raise FileNotFoundError(f"Service account file not found: {self.service_account_file}")

    def get_credentials(self, scopes: list[str]) -> service_account.Credentials:
        """
        Get service account credentials with specified scopes

        Args:
            scopes: List of OAuth 2.0 scopes

        Returns:
            Credentials object with domain-wide delegation

        Raises:
            Exception: If credential creation fails
        """
        try:
            credentials = service_account.Credentials.from_service_account_file(
                self.service_account_file, scopes=scopes
            )

            # Delegate to user if specified
            if self.delegated_user:
                credentials = credentials.with_subject(self.delegated_user)

            return credentials

        except Exception as e:
            raise Exception(f"Failed to create credentials: {e}") from e

    def get_service(self, api_name: str, api_version: str, scopes: list[str]) -> Resource:
        """
        Build Google API service object

        Args:
            api_name: Name of the API (e.g., 'gmail', 'drive')
            api_version: API version (e.g., 'v1', 'v3')
            scopes: List of OAuth 2.0 scopes required

        Returns:
            Google API service object

        Raises:
            HttpError: If API service creation fails
        """
        try:
            credentials = self.get_credentials(scopes)
            service = build(api_name, api_version, credentials=credentials)
            return service

        except HttpError as e:
            raise HttpError(
                f"Failed to build {api_name} service: {e}", resp=e.resp, content=e.content
            ) from e

    def test_connection(self) -> bool:
        """
        Test if authentication is working

        Returns:
            True if authentication successful, False otherwise
        """
        try:
            # Try to build Admin SDK service (minimal permissions)
            scopes = ["https://www.googleapis.com/auth/admin.directory.user.readonly"]
            service = self.get_service("admin", "directory_v1", scopes)

            # Try to list users (will fail if delegation not configured)
            service.users().list(customer="my_customer", maxResults=1).execute()

            return True

        except Exception:
            return False

    def __repr__(self) -> str:
        """String representation"""
        return (
            f"GoogleWorkspaceAuth("
            f"service_account_file='{self.service_account_file}', "
            f"delegated_user='{self.delegated_user}')"
        )
