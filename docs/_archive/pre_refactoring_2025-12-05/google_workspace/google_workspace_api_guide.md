# Google Workspace Python API Integration Guide

**Purpose:** Developer guide for using the Google Workspace Python integration module.

**Last Updated:** 2025-12-04

---

## 📋 Quick Start

### Installation
```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### Configuration
```bash
export GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
export GOOGLE_DELEGATED_USER=admin@example.com
```

### Basic Usage
```python
from chronos.integrations.google import GoogleWorkspaceAuth, GmailClient

auth = GoogleWorkspaceAuth()
gmail = GmailClient(auth)
gmail.send_email(to='user@example.com', subject='Hello', body='Test')
```

---

## 📧 Gmail Examples

```python
from chronos.integrations.google import GoogleWorkspaceAuth, GmailClient

auth = GoogleWorkspaceAuth()
gmail = GmailClient(auth)

# Send email
gmail.send_email(
    to='user@example.com',
    subject='Test',
    body='Hello World!',
    html=True,
    attachments=['/path/to/file.pdf']
)

# List unread emails
messages = gmail.list_messages(query='is:unread', max_results=5)
```

---

## 📁 Drive Examples

```python
from chronos.integrations.google import GoogleWorkspaceAuth, DriveClient

auth = GoogleWorkspaceAuth()
drive = DriveClient(auth)

# Upload file
file_id = drive.upload_file('/path/to/document.pdf', folder_id='abc123')

# Share file
drive.share_file(file_id, 'user@example.com', role='writer')

# List files
files = drive.list_files(query="mimeType='application/pdf'")
```

---

## 📅 Calendar Examples

```python
from chronos.integrations.google import GoogleWorkspaceAuth, CalendarClient

auth = GoogleWorkspaceAuth()
calendar = CalendarClient(auth)

# Create event
event = calendar.create_event(
    summary='Team Meeting',
    start_time='2025-12-05T10:00:00-05:00',
    end_time='2025-12-05T11:00:00-05:00',
    attendees=['user@example.com']
)

# List upcoming events
events = calendar.list_events(max_results=10)
```

---

## 📊 Sheets Examples

```python
from chronos.integrations.google import GoogleWorkspaceAuth, SheetsClient

auth = GoogleWorkspaceAuth()
sheets = SheetsClient(auth)

# Read data
data = sheets.read_range('spreadsheet_id', 'Sheet1!A1:C10')

# Write data
sheets.write_range('spreadsheet_id', 'Sheet1!A1:C2', [
    ['Name', 'Email', 'Phone'],
    ['John', 'john@example.com', '555-1234']
])

# Create spreadsheet
spreadsheet_id = sheets.create_spreadsheet('My Report')
```

---

## 👥 Admin Examples

```python
from chronos.integrations.google import GoogleWorkspaceAuth, AdminClient

auth = GoogleWorkspaceAuth()
admin = AdminClient(auth)

# List users
users = admin.list_users(max_results=10)

# Get user details
user = admin.get_user('user@example.com')

# List groups
groups = admin.list_groups()
```

---

## 🔄 Complete Workflows

### Email Automation
```python
# Auto-reply to unread emails
messages = gmail.list_messages(query='is:unread')
for msg in messages:
    headers = {h['name']: h['value'] for h in msg['payload']['headers']}
    gmail.send_email(
        to=headers['From'],
        subject=f"Re: {headers['Subject']}",
        body="Thank you, I'll respond shortly."
    )
```

### File Backup
```python
# Upload all PDFs in directory
for filename in os.listdir('/reports'):
    if filename.endswith('.pdf'):
        drive.upload_file(f'/reports/{filename}', folder_id='backup_folder')
```

### Calendar from Jira
```python
# Create calendar event from Jira ticket
ticket = get_jira_ticket('CHRONOS-123')
calendar.create_event(
    summary=f"[{ticket['key']}] {ticket['summary']}",
    start_time=ticket['due_date'],
    end_time=ticket['due_date']
)
```

---

## 🚨 Error Handling

```python
from googleapiclient.errors import HttpError

try:
    gmail.send_email(to='user@example.com', subject='Test', body='Hello')
except HttpError as e:
    if e.resp.status == 403:
        print("❌ Insufficient permissions")
    elif e.resp.status == 404:
        print("❌ Resource not found")
except FileNotFoundError:
    print("❌ Service account file not found")
```

---

## 📚 Related Documentation

- [CLI Man Page](../3_runbooks/google_workspace_cli.md)
- [API Setup Runbook](../3_runbooks/google_workspace_api_setup.md)
- [KeePassXC Security Guide](./google_workspace_keepassxc_security_guide.md)

---

**Version:** 0.1.0
