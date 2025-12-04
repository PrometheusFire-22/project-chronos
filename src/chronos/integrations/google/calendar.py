"""
from datetime import timezone
Google Calendar API Client

Provides high-level interface for Calendar operations:
- Create events
- List events
- Update events
- Delete events

Example:
    auth = GoogleWorkspaceAuth()
    calendar = CalendarClient(auth)
    event = calendar.create_event(
        summary='Team Meeting',
        start_time='2025-12-05T10:00:00',
        end_time='2025-12-05T11:00:00'
    )
"""

from datetime import UTC, datetime
from typing import Any

from googleapiclient.errors import HttpError

from .auth import GoogleWorkspaceAuth


class CalendarClient:
    """
    Google Calendar API client for event operations

    Handles event creation, listing, and management via Calendar API.
    """

    # Required OAuth scopes
    SCOPES = ["https://www.googleapis.com/auth/calendar"]

    def __init__(self, auth: GoogleWorkspaceAuth):
        """
        Initialize Calendar client

        Args:
            auth: GoogleWorkspaceAuth instance
        """
        self.auth = auth
        self.service = auth.get_service("calendar", "v3", self.SCOPES)

    def create_event(
        self,
        summary: str,
        start_time: str,
        end_time: str,
        description: str | None = None,
        location: str | None = None,
        attendees: list[str] | None = None,
        calendar_id: str = "primary",
    ) -> dict[str, Any]:
        """
        Create a calendar event

        Args:
            summary: Event title
            start_time: Start time (ISO 8601 format)
            end_time: End time (ISO 8601 format)
            description: Event description
            location: Event location
            attendees: List of attendee emails
            calendar_id: Calendar ID ('primary' for main calendar)

        Returns:
            Event dictionary

        Example:
            event = calendar.create_event(
                summary='Team Meeting',
                start_time='2025-12-05T10:00:00-05:00',
                end_time='2025-12-05T11:00:00-05:00',
                description='Weekly sync',
                attendees=['user@example.com']
            )
        """
        try:
            event = {
                "summary": summary,
                "start": {"dateTime": start_time, "timeZone": "America/New_York"},
                "end": {"dateTime": end_time, "timeZone": "America/New_York"},
            }

            if description:
                event["description"] = description
            if location:
                event["location"] = location
            if attendees:
                event["attendees"] = [{"email": email} for email in attendees]

            result = self.service.events().insert(calendarId=calendar_id, body=event).execute()

            return result

        except HttpError as e:
            raise HttpError(f"Failed to create event: {e}", resp=e.resp, content=e.content) from e

    def list_events(
        self, time_min: str | None = None, max_results: int = 10, calendar_id: str = "primary"
    ) -> list[dict[str, Any]]:
        """
        List upcoming events

        Args:
            time_min: Minimum time (ISO 8601 format, defaults to now)
            max_results: Maximum number of events
            calendar_id: Calendar ID

        Returns:
            List of event dictionaries

        Example:
            events = calendar.list_events(max_results=5)
        """
        try:
            if not time_min:
                time_min = datetime.now(tz=UTC).isoformat() + "Z"

            events_result = (
                self.service.events()
                .list(
                    calendarId=calendar_id,
                    timeMin=time_min,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            events = events_result.get("items", [])
            return events

        except HttpError as e:
            raise HttpError(f"Failed to list events: {e}", resp=e.resp, content=e.content) from e

    def update_event(self, event_id: str, calendar_id: str = "primary", **kwargs) -> dict[str, Any]:
        """
        Update an existing event

        Args:
            event_id: Event ID
            calendar_id: Calendar ID
            **kwargs: Fields to update (summary, start, end, etc.)

        Returns:
            Updated event dictionary

        Example:
            calendar.update_event(
                event_id='abc123',
                summary='Updated Meeting Title'
            )
        """
        try:
            # Get current event
            event = self.service.events().get(calendarId=calendar_id, eventId=event_id).execute()

            # Update fields
            event.update(kwargs)

            # Save changes
            updated_event = (
                self.service.events()
                .update(calendarId=calendar_id, eventId=event_id, body=event)
                .execute()
            )

            return updated_event

        except HttpError as e:
            raise HttpError(f"Failed to update event: {e}", resp=e.resp, content=e.content) from e

    def __repr__(self) -> str:
        """String representation"""
        return f"CalendarClient(delegated_user='{self.auth.delegated_user}')"
