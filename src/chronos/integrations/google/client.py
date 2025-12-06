from googleapiclient.discovery import Resource

from chronos.integrations.google.auth import GoogleWorkspaceAuth


class GoogleClient:
    """
    High-level client for Google Workspace integration.

    Provides unified access to Gmail, Drive, Sheets, and Admin SDK services.
    Handles authentication automatically via GoogleWorkspaceAuth.
    """

    def __init__(
        self, client_secret_file: str = "client_secret.json", token_file: str = "token.pickle"
    ):
        self.auth = GoogleWorkspaceAuth(client_secret_file, token_file)
        self._services: dict[str, Resource] = {}

    def get_service(self, service_name: str, version: str = "v1") -> Resource:
        """
        Get an authenticated service client (lazy loading).

        Args:
            service_name: 'gmail', 'drive', 'sheets', 'admin', etc.
            version: API version string (e.g., 'v1', 'v3', 'directory_v1')
        """
        key = f"{service_name}_{version}"
        if key not in self._services:
            # Map common names to versions if not specified or specific defaults needed
            if service_name == "admin" and version == "v1":
                version = "directory_v1"

            self._services[key] = self.auth.get_service(service_name, version)

        return self._services[key]

    @property
    def gmail(self) -> Resource:
        return self.get_service("gmail", "v1")

    @property
    def drive(self) -> Resource:
        return self.get_service("drive", "v3")

    @property
    def sheets(self) -> Resource:
        return self.get_service("sheets", "v4")

    @property
    def admin(self) -> Resource:
        return self.get_service("admin", "directory_v1")

    def verify_connection(self) -> bool:
        """Simple verification check against the user profile."""
        try:
            # Use oauth2 v2 me endpoint to check token validity
            # We explicitly ask for this service to test the creds
            service = self.auth.get_service("oauth2", "v2")
            user_info = service.userinfo().get().execute()
            print(f"✅ Authenticated as: {user_info.get('email')}")
            return True
        except Exception as e:
            print(f"❌ Verification failed: {e}")
            return False
