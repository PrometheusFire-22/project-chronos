"""
Gmail API Client

Provides high-level interface for Gmail operations:
- Send emails
- Read emails
- Search emails
- Manage labels
- Handle attachments

Example:
    auth = GoogleWorkspaceAuth()
    gmail = GmailClient(auth)
    gmail.send_email(
        to='user@example.com',
        subject='Hello',
        body='Test email'
    )
"""

import base64
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from googleapiclient.errors import HttpError

from .auth import GoogleWorkspaceAuth


class GmailClient:
    """
    Gmail API client for email operations

    Handles sending, reading, and managing emails via Gmail API.
    """

    # Required OAuth scopes
    SCOPES = [
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.send",
    ]

    def __init__(self, auth: GoogleWorkspaceAuth):
        """
        Initialize Gmail client

        Args:
            auth: GoogleWorkspaceAuth instance
        """
        self.auth = auth
        self.service = auth.get_service("gmail", "v1", self.SCOPES)

    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        from_email: str | None = None,
        cc: list[str] | None = None,
        bcc: list[str] | None = None,
        html: bool = False,
        attachments: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Send an email

        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body (plain text or HTML)
            from_email: Sender email (defaults to delegated user)
            cc: List of CC recipients
            bcc: List of BCC recipients
            html: If True, body is treated as HTML
            attachments: List of file paths to attach

        Returns:
            Dict containing sent message details

        Raises:
            HttpError: If send fails

        Example:
            gmail.send_email(
                to='user@example.com',
                subject='Test',
                body='Hello World!',
                cc=['cc@example.com'],
                html=True
            )
        """
        try:
            # Create message
            if html or attachments:
                message = MIMEMultipart()
                message.attach(MIMEText(body, "html" if html else "plain"))

                # Add attachments
                if attachments:
                    for filepath in attachments:
                        self._add_attachment(message, filepath)
            else:
                message = MIMEText(body)

            # Set headers
            message["to"] = to
            message["subject"] = subject
            if from_email:
                message["from"] = from_email
            if cc:
                message["cc"] = ", ".join(cc)
            if bcc:
                message["bcc"] = ", ".join(bcc)

            # Encode and send
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            send_message = {"raw": raw}

            result = self.service.users().messages().send(userId="me", body=send_message).execute()

            return result

        except HttpError as e:
            raise HttpError(f"Failed to send email: {e}", resp=e.resp, content=e.content) from e

    def _add_attachment(self, message: MIMEMultipart, filepath: str):
        """Add file attachment to message"""
        import os

        filename = os.path.basename(filepath)
        with open(filepath, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())

        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f"attachment; filename={filename}")
        message.attach(part)

    def list_messages(
        self, query: str = "", max_results: int = 10, label_ids: list[str] | None = None
    ) -> list[dict[str, Any]]:
        """
        List messages matching query

        Args:
            query: Gmail search query (e.g., 'from:user@example.com')
            max_results: Maximum number of messages to return
            label_ids: List of label IDs to filter by

        Returns:
            List of message dictionaries

        Example:
            messages = gmail.list_messages(
                query='is:unread',
                max_results=5
            )
        """
        try:
            params = {
                "userId": "me",
                "maxResults": max_results,
            }
            if query:
                params["q"] = query
            if label_ids:
                params["labelIds"] = label_ids

            results = self.service.users().messages().list(**params).execute()
            messages = results.get("messages", [])

            # Get full message details
            detailed_messages = []
            for msg in messages:
                full_msg = self.get_message(msg["id"])
                detailed_messages.append(full_msg)

            return detailed_messages

        except HttpError as e:
            raise HttpError(f"Failed to list messages: {e}", resp=e.resp, content=e.content) from e

    def get_message(self, message_id: str) -> dict[str, Any]:
        """
        Get full message details

        Args:
            message_id: Message ID

        Returns:
            Message dictionary with full details
        """
        try:
            message = (
                self.service.users()
                .messages()
                .get(userId="me", id=message_id, format="full")
                .execute()
            )

            return message

        except HttpError as e:
            raise HttpError(f"Failed to get message: {e}", resp=e.resp, content=e.content) from e

    def create_label(self, label_name: str) -> dict[str, Any]:
        """
        Create a new label

        Args:
            label_name: Name of the label to create

        Returns:
            Label dictionary

        Example:
            label = gmail.create_label('Important')
        """
        try:
            label = {
                "name": label_name,
                "labelListVisibility": "labelShow",
                "messageListVisibility": "show",
            }

            result = self.service.users().labels().create(userId="me", body=label).execute()

            return result

        except HttpError as e:
            raise HttpError(f"Failed to create label: {e}", resp=e.resp, content=e.content) from e

    def __repr__(self) -> str:
        """String representation"""
        return f"GmailClient(delegated_user='{self.auth.delegated_user}')"
