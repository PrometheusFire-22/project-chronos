"""
Google Workspace Integration Module

Provides programmatic access to Google Workspace APIs:
- Gmail: Email operations
- Drive: File management
- Calendar: Event scheduling
- Sheets: Spreadsheet manipulation
- Admin: User/group management
- People: Contact management

Usage:
    from chronos.integrations.google import GoogleWorkspaceAuth, GmailClient

    auth = GoogleWorkspaceAuth()
    gmail = GmailClient(auth)
    gmail.send_email(to='user@example.com', subject='Test', body='Hello!')
"""

from .admin import AdminClient
from .auth import GoogleWorkspaceAuth
from .calendar import CalendarClient
from .drive import DriveClient
from .gmail import GmailClient
from .sheets import SheetsClient

__all__ = [
    "GoogleWorkspaceAuth",
    "GmailClient",
    "DriveClient",
    "CalendarClient",
    "SheetsClient",
    "AdminClient",
]

__version__ = "0.1.0"
