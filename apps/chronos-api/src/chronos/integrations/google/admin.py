"""
Google Admin SDK API Client

Provides high-level interface for Admin operations:
- Manage users
- Manage groups
- View organization info

Example:
    auth = GoogleWorkspaceAuth()
    admin = AdminClient(auth)
    users = admin.list_users()
"""

from typing import Any

from googleapiclient.errors import HttpError

from .auth import GoogleWorkspaceAuth


class AdminClient:
    """
    Google Admin SDK API client for user/group management

    Handles user and group operations via Admin SDK API.
    """

    # Required OAuth scopes
    SCOPES = [
        "https://www.googleapis.com/auth/admin.directory.user",
        "https://www.googleapis.com/auth/admin.directory.group",
    ]

    def __init__(self, auth: GoogleWorkspaceAuth):
        """
        Initialize Admin client

        Args:
            auth: GoogleWorkspaceAuth instance
        """
        self.auth = auth
        self.service = auth.get_service("admin", "directory_v1", self.SCOPES)

    def list_users(self, max_results: int = 100, query: str | None = None) -> list[dict[str, Any]]:
        """
        List users in the domain

        Args:
            max_results: Maximum number of users to return
            query: Search query

        Returns:
            List of user dictionaries

        Example:
            users = admin.list_users(max_results=10)
        """
        try:
            params = {
                "customer": "my_customer",
                "maxResults": max_results,
            }
            if query:
                params["query"] = query

            results = self.service.users().list(**params).execute()
            users = results.get("users", [])

            return users

        except HttpError as e:
            raise HttpError(f"Failed to list users: {e}", resp=e.resp, content=e.content) from e

    def get_user(self, user_email: str) -> dict[str, Any]:
        """
        Get user details

        Args:
            user_email: User's email address

        Returns:
            User dictionary

        Example:
            user = admin.get_user('user@example.com')
        """
        try:
            user = self.service.users().get(userKey=user_email).execute()
            return user

        except HttpError as e:
            raise HttpError(f"Failed to get user: {e}", resp=e.resp, content=e.content) from e

    def list_groups(self, max_results: int = 100) -> list[dict[str, Any]]:
        """
        List groups in the domain

        Args:
            max_results: Maximum number of groups to return

        Returns:
            List of group dictionaries

        Example:
            groups = admin.list_groups()
        """
        try:
            results = (
                self.service.groups().list(customer="my_customer", maxResults=max_results).execute()
            )

            groups = results.get("groups", [])
            return groups

        except HttpError as e:
            raise HttpError(f"Failed to list groups: {e}", resp=e.resp, content=e.content) from e

    def __repr__(self) -> str:
        """String representation"""
        return f"AdminClient(delegated_user='{self.auth.delegated_user}')"
