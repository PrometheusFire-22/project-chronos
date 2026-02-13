"""CSV generation utility for contact extraction results."""

import csv
import io

FIELDNAMES = ["name", "role", "firm", "email", "phone", "address"]


def contacts_to_csv(contacts: list[dict]) -> str:
    """Convert contacts list to CSV string."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=FIELDNAMES, extrasaction="ignore")
    writer.writeheader()
    for contact in contacts:
        writer.writerow(contact)
    return output.getvalue()
