#!/usr/bin/env python3
"""
Test Google Gmail API Integration
Sends a test email to the authenticated user.
"""
import base64
import sys
from email.mime.text import MIMEText
from pathlib import Path

# Add project root to path
START_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(START_DIR / "src"))

from chronos.integrations.google.client import GoogleClient  # noqa: E402


def create_message(sender, to, subject, message_text):
    """Create a message for an email."""
    message = MIMEText(message_text)
    message["to"] = to
    message["from"] = sender
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes())
    return {"raw": raw.decode()}


def main():
    print("📧 Testing Gmail API Integration...")

    try:
        client = GoogleClient()

        # 1. Get User Profile to determine email address
        # We use oauth2 service because gmail.send scope doesn't allow gmail.getProfile
        service = client.get_service("oauth2", "v2")
        profile = service.userinfo().get().execute()
        user_email = profile["email"]

        # Switch back to gmail service for sending
        service = client.gmail
        print(f"   Authenticated as: {user_email}")

        # 2. Send Test Email
        print(f"   Sending test email to {user_email}...")

        msg = create_message(
            sender=user_email,
            to=user_email,
            subject="Chronos Integration Test: Success! 🚀",
            message_text=(
                "Hello!\n\n"
                "self.creds = pickle.load(token)  # nosecfirms that Project Chronos has successfully authorized "
                "with your Google Workspace.\n\n"
                "Integration Status: OPERATIONAL\n"
                "Scope: Gmail, Drive, Sheets, Admin\n\n"
                "Best,\nProject Chronos System"
            ),
        )

        sent = service.users().messages().send(userId="me", body=msg).execute()
        print(f"✅ Email Sent! Message ID: {sent['id']}")
        print("   Check your inbox.")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
