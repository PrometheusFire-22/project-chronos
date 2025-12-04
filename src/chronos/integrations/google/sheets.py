"""
Google Sheets API Client

Provides high-level interface for Sheets operations:
- Read data from sheets
- Write data to sheets
- Create spreadsheets
- Format cells

Example:
    auth = GoogleWorkspaceAuth()
    sheets = SheetsClient(auth)
    data = sheets.read_range('spreadsheet_id', 'Sheet1!A1:C10')
"""

from typing import Any

from googleapiclient.errors import HttpError

from .auth import GoogleWorkspaceAuth


class SheetsClient:
    """
    Google Sheets API client for spreadsheet operations

    Handles reading, writing, and managing spreadsheets via Sheets API.
    """

    # Required OAuth scopes
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

    def __init__(self, auth: GoogleWorkspaceAuth):
        """
        Initialize Sheets client

        Args:
            auth: GoogleWorkspaceAuth instance
        """
        self.auth = auth
        self.service = auth.get_service("sheets", "v4", self.SCOPES)

    def read_range(self, spreadsheet_id: str, range_name: str) -> list[list[Any]]:
        """
        Read data from a range

        Args:
            spreadsheet_id: Spreadsheet ID
            range_name: Range in A1 notation (e.g., 'Sheet1!A1:C10')

        Returns:
            2D list of cell values

        Example:
            data = sheets.read_range('abc123', 'Sheet1!A1:C10')
            # Returns: [['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ...]
        """
        try:
            result = (
                self.service.spreadsheets()
                .values()
                .get(spreadsheetId=spreadsheet_id, range=range_name)
                .execute()
            )

            values = result.get("values", [])
            return values

        except HttpError as e:
            raise HttpError(f"Failed to read range: {e}", resp=e.resp, content=e.content) from e

    def write_range(
        self,
        spreadsheet_id: str,
        range_name: str,
        values: list[list[Any]],
        value_input_option: str = "RAW",
    ) -> dict[str, Any]:
        """
        Write data to a range

        Args:
            spreadsheet_id: Spreadsheet ID
            range_name: Range in A1 notation
            values: 2D list of values to write
            value_input_option: 'RAW' or 'USER_ENTERED'

        Returns:
            Update response dictionary

        Example:
            sheets.write_range(
                'abc123',
                'Sheet1!A1:C2',
                [['A1', 'B1', 'C1'], ['A2', 'B2', 'C2']]
            )
        """
        try:
            body = {"values": values}

            result = (
                self.service.spreadsheets()
                .values()
                .update(
                    spreadsheetId=spreadsheet_id,
                    range=range_name,
                    valueInputOption=value_input_option,
                    body=body,
                )
                .execute()
            )

            return result

        except HttpError as e:
            raise HttpError(f"Failed to write range: {e}", resp=e.resp, content=e.content) from e

    def create_spreadsheet(self, title: str, sheet_titles: list[str] | None = None) -> str:
        """
        Create a new spreadsheet

        Args:
            title: Spreadsheet title
            sheet_titles: List of sheet names (default: ['Sheet1'])

        Returns:
            Spreadsheet ID

        Example:
            spreadsheet_id = sheets.create_spreadsheet(
                'My Report',
                sheet_titles=['Data', 'Analysis', 'Summary']
            )
        """
        try:
            spreadsheet = {"properties": {"title": title}}

            if sheet_titles:
                spreadsheet["sheets"] = [
                    {"properties": {"title": sheet_title}} for sheet_title in sheet_titles
                ]

            result = (
                self.service.spreadsheets()
                .create(body=spreadsheet, fields="spreadsheetId")
                .execute()
            )

            return result.get("spreadsheetId")

        except HttpError as e:
            raise HttpError(
                f"Failed to create spreadsheet: {e}", resp=e.resp, content=e.content
            ) from e

    def __repr__(self) -> str:
        """String representation"""
        return f"SheetsClient(delegated_user='{self.auth.delegated_user}')"
