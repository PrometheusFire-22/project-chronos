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
import pickle
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import Resource, build
from googleapiclient.errors import HttpError

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


class GoogleWorkspaceAuth:
    """
    Authentication wrapper for Google Workspace APIs using OAuth 2.0 User Flow.

    Handles the 'Desktop App' flow where the user authorizes the app in the browser.
    Manages token storage and auto-refreshing.
    """

    DEFAULT_SCOPES = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/admin.directory.user.readonly",
    ]

    def __init__(
        self, client_secret_file: str = "client_secret.json", token_file: str = "token.pickle"
    ):
        """
        Initialize authentication manager.

        Args:
            client_secret_file: Path to the downloaded OAuth client ID JSON.
            token_file: Path where the user's access/refresh tokens will be saved.
        """
        self.base_path = Path(os.getcwd())
        self.client_secret_path = self.base_path / client_secret_file
        self.token_path = self.base_path / token_file
        self.creds: Credentials | None = None

        # Relax scope validation because Google adds openid and other scopes automatically
        os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

    def get_credentials(self, scopes: list[str] = None) -> Credentials:
        """
        Get valid user credentials.

        If valid tokens exist in token.pickle, use them.
        If expired, refresh them.
        If non-existent or invalid, launch the browser flow.
        """
        if scopes is None:
            scopes = self.DEFAULT_SCOPES

        # 1. Load existing token if available
        if self.token_path.exists():
            with open(self.token_path, "rb") as token:
                self.creds = pickle.load(token)  # nosec

        # 2. Check validity and refresh/login if needed
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                print("🔄 Refreshing expired Google Access Token...")
                try:
                    self.creds.refresh(Request())
                except Exception as e:
                    print(f"⚠️ Refresh failed: {e}. Starting fresh login.")
                    self.creds = None

            if not self.creds:
                print("🌐 Initiating Browser Authentication Flow...")
                if not self.client_secret_path.exists():
                    raise FileNotFoundError(
                        f"Client Secret file not found at: {self.client_secret_path}\n"
                        "Please download it from GCP Console -> APIs & Credentials -> OAuth 2.0 Client IDs"
                    )

                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.client_secret_path), scopes
                )
                self.creds = flow.run_local_server(port=0)

            # 3. Save the credential for next run
            print(f"✅ Credentials saved to {self.token_path.name}")
            with open(self.token_path, "wb") as token:
                pickle.dump(self.creds, token)

        return self.creds

    def get_service(self, api_name: str, api_version: str, scopes: list[str] = None) -> Resource:
        """Build a ready-to-use Google API Service Resource."""
        creds = self.get_credentials(scopes)
        try:
            service = build(api_name, api_version, credentials=creds)
            return service
        except HttpError as e:
            raise HttpError(
                f"Failed to build {api_name} service: {e}", resp=e.resp, content=e.content
            ) from e

    def __repr__(self):
        return f"<GoogleWorkspaceAuth client='{self.client_secret_path.name}' token='{self.token_path.name}'>"
