# Google Workspace Integration Guide

**Purpose:** Developer guide for integrating Google Workspace APIs into Project Chronos applications.

**Last Updated:** 2025-12-12

> **📍 Navigation:** This is the **developer API guide**. For initial setup and operations, see [Google Workspace Setup](../../operations/integrations/google_workspace_setup.md). For OAuth setup (legacy), see [Google Cloud Setup](google_cloud_setup.md).

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

## 📧 Gmail Integration

### Send Email

```python
from chronos.integrations.google import GoogleWorkspaceAuth, GmailClient

auth = GoogleWorkspaceAuth()
gmail = GmailClient(auth)

# Simple email
gmail.send_email(
    to='user@example.com',
    subject='Test',
    body='Hello World!'
)

# HTML email with attachments
gmail.send_email(
    to='user@example.com',
    subject='Report',
    body='<h1>Monthly Report</h1><p>Please review.</p>',
    html=True,
    attachments=['/path/to/report.pdf']
)

# Email with CC/BCC
gmail.send_email(
    to='user@example.com',
    cc=['manager@example.com'],
    bcc=['archive@example.com'],
    subject='Team Update',
    body='Weekly sync notes'
)
```

### List Messages

```python
# List unread emails
messages = gmail.list_messages(query='is:unread', max_results=5)

# List emails from specific sender
messages = gmail.list_messages(query='from:user@example.com')

# List emails with attachments
messages = gmail.list_messages(query='has:attachment')

# List emails in date range
messages = gmail.list_messages(query='after:2025/12/01 before:2025/12/31')
```

### Create Labels

```python
# Create new label
label_id = gmail.create_label('Important')

# Apply label to message
gmail.modify_message(message_id, add_labels=[label_id])
```

---

## 📁 Drive Integration

### Upload Files

```python
from chronos.integrations.google import GoogleWorkspaceAuth, DriveClient

auth = GoogleWorkspaceAuth()
drive = DriveClient(auth)

# Upload to root
file_id = drive.upload_file('/path/to/document.pdf')

# Upload to specific folder
file_id = drive.upload_file('/path/to/document.pdf', folder_id='abc123')

# Upload with specific MIME type
file_id = drive.upload_file('/path/to/data.csv', mime_type='text/csv')
```

### List Files

```python
# List all files
files = drive.list_files()

# List PDF files
files = drive.list_files(query="mimeType='application/pdf'")

# List files modified today
files = drive.list_files(query="modifiedTime > '2025-12-05'")

# List files in specific folder
files = drive.list_files(query="'abc123' in parents")

# List shared files
files = drive.list_files(query="sharedWithMe=true")
```

### Share Files

```python
# Share as reader
drive.share_file(file_id, 'user@example.com', role='reader')

# Share as writer
drive.share_file(file_id, 'user@example.com', role='writer')

# Share as commenter
drive.share_file(file_id, 'user@example.com', role='commenter')
```

### Download Files

```python
# Download file
drive.download_file(file_id, '/path/to/destination.pdf')
```

---

## 📅 Calendar Integration

### Create Events

```python
from chronos.integrations.google import GoogleWorkspaceAuth, CalendarClient

auth = GoogleWorkspaceAuth()
calendar = CalendarClient(auth)

# Simple event
event = calendar.create_event(
    summary='Team Meeting',
    start_time='2025-12-05T10:00:00-05:00',
    end_time='2025-12-05T11:00:00-05:00'
)

# Event with attendees and location
event = calendar.create_event(
    summary='Sprint Planning',
    start_time='2025-12-05T14:00:00-05:00',
    end_time='2025-12-05T15:00:00-05:00',
    description='Plan next sprint',
    location='Conference Room A',
    attendees=['user1@example.com', 'user2@example.com']
)

# All-day event
event = calendar.create_event(
    summary='Company Holiday',
    start_date='2025-12-25',
    end_date='2025-12-26',
    all_day=True
)
```

### List Events

```python
# List upcoming events
events = calendar.list_events(max_results=10)

# List events in date range
events = calendar.list_events(
    time_min='2025-12-01T00:00:00Z',
    time_max='2025-12-31T23:59:59Z'
)
```

---

## 📊 Sheets Integration

### Read Data

```python
from chronos.integrations.google import GoogleWorkspaceAuth, SheetsClient

auth = GoogleWorkspaceAuth()
sheets = SheetsClient(auth)

# Read specific range
data = sheets.read_range('spreadsheet_id', 'Sheet1!A1:C10')

# Read entire sheet
data = sheets.read_range('spreadsheet_id', 'Sheet1')

# Read specific columns
data = sheets.read_range('spreadsheet_id', 'Sheet1!A:C')
```

### Write Data

```python
# Write 2D array
sheets.write_range('spreadsheet_id', 'Sheet1!A1:C2', [
    ['Name', 'Email', 'Phone'],
    ['John', 'john@example.com', '555-1234']
])

# Write single row
sheets.write_range('spreadsheet_id', 'Sheet1!A1:C1', [
    ['Header1', 'Header2', 'Header3']
])

# Append data
sheets.append_range('spreadsheet_id', 'Sheet1!A:C', [
    ['Jane', 'jane@example.com', '555-5678']
])
```

### Create Spreadsheets

```python
# Simple spreadsheet
spreadsheet_id = sheets.create_spreadsheet('My Report')

# Spreadsheet with multiple sheets
spreadsheet_id = sheets.create_spreadsheet(
    'Annual Report',
    sheets=['Revenue', 'Expenses', 'Summary']
)
```

---

## 👥 Admin SDK Integration

### User Management

```python
from chronos.integrations.google import GoogleWorkspaceAuth, AdminClient

auth = GoogleWorkspaceAuth()
admin = AdminClient(auth)

# List all users
users = admin.list_users(max_results=100)

# List users in specific OU
users = admin.list_users(query="orgUnitPath='/Engineering'")

# Get user details
user = admin.get_user('user@example.com')

# Get admin users
admins = admin.list_users(query="isAdmin=true")
```

### Group Management

```python
# List all groups
groups = admin.list_groups()

# Get group details
group = admin.get_group('group@example.com')

# List group members
members = admin.list_group_members('group@example.com')
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

### File Backup Workflow

```python
import os

# Upload all PDFs in directory
backup_folder_id = 'abc123'
for filename in os.listdir('/reports'):
    if filename.endswith('.pdf'):
        file_id = drive.upload_file(
            f'/reports/{filename}',
            folder_id=backup_folder_id
        )
        print(f"Uploaded: {filename} → {file_id}")
```

### Calendar from Jira

```python
# Create calendar event from Jira ticket
from chronos.integrations.jira import JiraClient

jira = JiraClient()
ticket = jira.get_ticket('CHRONOS-123')

calendar.create_event(
    summary=f"[{ticket['key']}] {ticket['summary']}",
    start_time=ticket['due_date'],
    end_time=ticket['due_date'],
    description=f"Jira: {ticket['url']}"
)
```

### Spreadsheet Reporting

```python
# Generate weekly report
data = [
    ['Date', 'Metric', 'Value'],
    ['2025-12-01', 'Users', '1000'],
    ['2025-12-01', 'Revenue', '$50000']
]

spreadsheet_id = sheets.create_spreadsheet('Weekly Report')
sheets.write_range(spreadsheet_id, 'Sheet1!A1:C3', data)

# Share with team
drive.share_file(spreadsheet_id, 'team@example.com', role='reader')
```

---

## 🚨 Error Handling

### Basic Error Handling

```python
from googleapiclient.errors import HttpError

try:
    gmail.send_email(to='user@example.com', subject='Test', body='Hello')
except HttpError as e:
    if e.resp.status == 403:
        print("❌ Insufficient permissions")
    elif e.resp.status == 404:
        print("❌ Resource not found")
    elif e.resp.status == 429:
        print("❌ Rate limit exceeded")
    else:
        print(f"❌ HTTP Error: {e.resp.status}")
except FileNotFoundError:
    print("❌ Service account file not found")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
```

### Retry Logic

```python
import time
from googleapiclient.errors import HttpError

def send_email_with_retry(gmail, **kwargs):
    max_retries = 3
    for attempt in range(max_retries):
        try:
            return gmail.send_email(**kwargs)
        except HttpError as e:
            if e.resp.status == 429 and attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limited, waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
```

---

## 🔐 Security Best Practices

### Service Account Key Management

```python
# ✅ Good: Load from secure location
import os
key_path = os.path.expanduser('~/.config/chronos/google-service-account.json')

# ❌ Bad: Hardcode path or commit to git
key_path = '/path/to/key.json'  # Don't do this
```

### Scope Minimization

```python
# Only request scopes you need
SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',  # Only sending
    # Don't request 'gmail.modify' if you don't need it
]
```

### Credential Rotation

```python
# Set reminder to rotate service account key every 90 days
# Store rotation date in KeePassXC
# Document rotation procedure in runbook
```

---

## 📚 Related Documentation

- [Google Workspace Setup Runbook](../../operations/integrations/google_workspace_setup.md)
- [Google CLI Reference](../../reference/cli/google_cli.md)
- [KeePassXC Organization Guide](../organization/keepassxc_organization.md)

---

## 🔗 External Resources

- [Google Workspace API Documentation](https://developers.google.com/workspace)
- [Python Client Library](https://github.com/googleapis/google-api-python-client)
- [OAuth 2.0 for Service Accounts](https://developers.google.com/identity/protocols/oauth2/service-account)
- [API Rate Limits](https://developers.google.com/gmail/api/reference/quota)

---

**Version:** 2.0.0  
**Last Updated:** 2025-12-05  
**Consolidated from:** 2 guides (api_guide, integration patterns)
