# Google Workspace CLI - Man Page

**NAME**
    google_cli - Command-line interface for Google Workspace operations

**SYNOPSIS**
    `google_cli [COMMAND] [SUBCOMMAND] [OPTIONS]`

**DESCRIPTION**
    The Google Workspace CLI provides command-line access to Google Workspace APIs including Gmail, Drive, Calendar, Sheets, and Admin SDK.

**PREREQUISITES**
    - Service account JSON key file
    - Domain-wide delegation configured
    - Environment variables set:
      - `GOOGLE_SERVICE_ACCOUNT_FILE` - Path to service account JSON key
      - `GOOGLE_DELEGATED_USER` - Email of user to impersonate

---

## COMMANDS

### gmail - Email Operations

**gmail send** - Send an email
```bash
google_cli gmail send \
  --to user@example.com \
  --subject "Meeting Tomorrow" \
  --body "Let's meet at 10am" \
  [--cc email@example.com] \
  [--bcc email@example.com] \
  [--html] \
  [--attachment /path/to/file.pdf]
```

**Options:**
- `--to TEXT` - Recipient email address (required)
- `--subject TEXT` - Email subject (required)
- `--body TEXT` - Email body (required)
- `--cc TEXT` - CC recipients (multiple allowed)
- `--bcc TEXT` - BCC recipients (multiple allowed)
- `--html` - Send as HTML email
- `--attachment PATH` - File attachments (multiple allowed)

**Examples:**
```bash
# Simple email
google_cli gmail send --to user@example.com --subject "Test" --body "Hello"

# Email with CC and attachment
google_cli gmail send \
  --to user@example.com \
  --cc manager@example.com \
  --subject "Report" \
  --body "Please review" \
  --attachment report.pdf

# HTML email
google_cli gmail send \
  --to user@example.com \
  --subject "Newsletter" \
  --body "<h1>Hello</h1><p>Welcome!</p>" \
  --html
```

---

**gmail list** - List emails
```bash
google_cli gmail list \
  [--query "is:unread"] \
  [--max-results 10]
```

**Options:**
- `--query TEXT` - Gmail search query (default: empty)
- `--max-results INTEGER` - Maximum messages to return (default: 10)

**Query Examples:**
```bash
# Unread emails
google_cli gmail list --query "is:unread"

# Emails from specific sender
google_cli gmail list --query "from:user@example.com"

# Emails with attachment
google_cli gmail list --query "has:attachment"

# Emails in date range
google_cli gmail list --query "after:2025/12/01 before:2025/12/31"
```

---

**gmail create-label** - Create a new label
```bash
google_cli gmail create-label "Important"
```

---

### drive - File Management

**drive upload** - Upload a file
```bash
google_cli drive upload /path/to/file.pdf \
  [--folder-id abc123] \
  [--mime-type application/pdf]
```

**Options:**
- `FILE_PATH` - Path to file to upload (required)
- `--folder-id TEXT` - ID of folder to upload to
- `--mime-type TEXT` - MIME type (auto-detected if not specified)

**Examples:**
```bash
# Upload to root
google_cli drive upload document.pdf

# Upload to specific folder
google_cli drive upload document.pdf --folder-id 1a2b3c4d5e

# Specify MIME type
google_cli drive upload data.csv --mime-type text/csv
```

---

**drive list** - List files
```bash
google_cli drive list \
  [--query "name contains 'report'"] \
  [--max-results 10]
```

**Options:**
- `--query TEXT` - Drive search query (default: empty)
- `--max-results INTEGER` - Maximum files to return (default: 10)

**Query Examples:**
```bash
# PDF files
google_cli drive list --query "mimeType='application/pdf'"

# Files modified today
google_cli drive list --query "modifiedTime > '2025-12-04'"

# Files in specific folder
google_cli drive list --query "'1a2b3c4d5e' in parents"

# Shared with me
google_cli drive list --query "sharedWithMe=true"
```

---

**drive download** - Download a file
```bash
google_cli drive download FILE_ID /path/to/destination.pdf
```

**drive share** - Share a file
```bash
google_cli drive share FILE_ID user@example.com \
  [--role reader|writer|commenter]
```

**Options:**
- `FILE_ID` - ID of file to share (required)
- `EMAIL` - Email address to share with (required)
- `--role TEXT` - Permission role (default: reader)

**Examples:**
```bash
# Share as reader
google_cli drive share 1a2b3c4d5e user@example.com

# Share as writer
google_cli drive share 1a2b3c4d5e user@example.com --role writer

# Share as commenter
google_cli drive share 1a2b3c4d5e user@example.com --role commenter
```

---

### calendar - Event Management

**calendar create** - Create an event
```bash
google_cli calendar create \
  --summary "Team Meeting" \
  --start "2025-12-05T10:00:00-05:00" \
  --end "2025-12-05T11:00:00-05:00" \
  [--description "Weekly sync"] \
  [--location "Conference Room A"] \
  [--attendee user@example.com]
```

**Options:**
- `--summary TEXT` - Event title (required)
- `--start TEXT` - Start time in ISO 8601 format (required)
- `--end TEXT` - End time in ISO 8601 format (required)
- `--description TEXT` - Event description
- `--location TEXT` - Event location
- `--attendee TEXT` - Attendee emails (multiple allowed)

**Examples:**
```bash
# Simple event
google_cli calendar create \
  --summary "Lunch" \
  --start "2025-12-05T12:00:00-05:00" \
  --end "2025-12-05T13:00:00-05:00"

# Event with attendees
google_cli calendar create \
  --summary "Sprint Planning" \
  --start "2025-12-05T14:00:00-05:00" \
  --end "2025-12-05T15:00:00-05:00" \
  --attendee user1@example.com \
  --attendee user2@example.com \
  --location "Zoom"
```

---

**calendar list** - List upcoming events
```bash
google_cli calendar list [--max-results 10]
```

---

### sheets - Spreadsheet Operations

**sheets read** - Read data from a spreadsheet
```bash
google_cli sheets read SPREADSHEET_ID "Sheet1!A1:C10"
```

**Arguments:**
- `SPREADSHEET_ID` - Spreadsheet ID (from URL)
- `RANGE_NAME` - Range in A1 notation (e.g., "Sheet1!A1:C10")

**Examples:**
```bash
# Read specific range
google_cli sheets read 1a2b3c4d5e "Sheet1!A1:C10"

# Read entire sheet
google_cli sheets read 1a2b3c4d5e "Sheet1"

# Read specific columns
google_cli sheets read 1a2b3c4d5e "Sheet1!A:C"
```

---

**sheets write** - Write data to a spreadsheet
```bash
google_cli sheets write SPREADSHEET_ID "Sheet1!A1:C2" '[["A1","B1","C1"],["A2","B2","C2"]]'
```

**Arguments:**
- `SPREADSHEET_ID` - Spreadsheet ID
- `RANGE_NAME` - Range in A1 notation
- `VALUES` - Data in JSON format (2D array)

**Examples:**
```bash
# Write 2x3 table
google_cli sheets write 1a2b3c4d5e "Sheet1!A1:C2" \
  '[["Name","Email","Phone"],["John","john@example.com","555-1234"]]'

# Write single row
google_cli sheets write 1a2b3c4d5e "Sheet1!A1:C1" \
  '[["Header1","Header2","Header3"]]'
```

---

**sheets create** - Create a new spreadsheet
```bash
google_cli sheets create "My Spreadsheet" \
  [--sheet "Data"] \
  [--sheet "Analysis"]
```

**Options:**
- `TITLE` - Spreadsheet title (required)
- `--sheet TEXT` - Sheet names (multiple allowed)

**Examples:**
```bash
# Simple spreadsheet
google_cli sheets create "Q4 Report"

# Spreadsheet with multiple sheets
google_cli sheets create "Annual Report" \
  --sheet "Revenue" \
  --sheet "Expenses" \
  --sheet "Summary"
```

---

### admin - User/Group Management

**admin list-users** - List users in the domain
```bash
google_cli admin list-users \
  [--max-results 100] \
  [--query "orgUnitPath='/Engineering'"]
```

**Options:**
- `--max-results INTEGER` - Maximum users to return (default: 100)
- `--query TEXT` - Search query

**Examples:**
```bash
# List all users
google_cli admin list-users

# List first 10 users
google_cli admin list-users --max-results 10

# List users in specific OU
google_cli admin list-users --query "orgUnitPath='/Engineering'"

# List admin users
google_cli admin list-users --query "isAdmin=true"
```

---

**admin get-user** - Get user details
```bash
google_cli admin get-user user@example.com
```

---

**admin list-groups** - List groups in the domain
```bash
google_cli admin list-groups [--max-results 100]
```

---

## ENVIRONMENT VARIABLES

**GOOGLE_SERVICE_ACCOUNT_FILE**
- Path to service account JSON key file
- Required for authentication
- Example: `/home/user/.config/chronos/google-service-account.json`

**GOOGLE_DELEGATED_USER**
- Email of user to impersonate
- Required for domain-wide delegation
- Example: `admin@example.com`

**Setup:**
```bash
# Add to .env file
echo "GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json" >> .env
echo "GOOGLE_DELEGATED_USER=admin@example.com" >> .env

# Load environment
source .env

# Or export directly
export GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
export GOOGLE_DELEGATED_USER=admin@example.com
```

---

## EXIT CODES

- `0` - Success
- `1` - Error (authentication, API, or other failure)

---

## EXAMPLES

### Daily Workflow Examples

**Morning Email Check:**
```bash
# Check unread emails
google_cli gmail list --query "is:unread" --max-results 5

# Send quick reply
google_cli gmail send \
  --to user@example.com \
  --subject "Re: Meeting" \
  --body "Sounds good, see you at 2pm"
```

**File Management:**
```bash
# Upload today's report
google_cli drive upload daily-report.pdf --folder-id 1a2b3c4d5e

# Share with team
google_cli drive share 1a2b3c4d5e team@example.com --role reader
```

**Calendar Management:**
```bash
# Check today's schedule
google_cli calendar list --max-results 5

# Schedule meeting
google_cli calendar create \
  --summary "1:1 with Manager" \
  --start "2025-12-05T15:00:00-05:00" \
  --end "2025-12-05T15:30:00-05:00" \
  --attendee manager@example.com
```

**Data Analysis:**
```bash
# Read sales data
google_cli sheets read 1a2b3c4d5e "Sales!A1:E100" > sales.json

# Update summary
google_cli sheets write 1a2b3c4d5e "Summary!A1:B2" \
  '[["Total Sales","$50,000"],["Growth","+15%"]]'
```

---

## TROUBLESHOOTING

**"Service account file not found"**
- Check `GOOGLE_SERVICE_ACCOUNT_FILE` path
- Verify file exists and has correct permissions (600)

**"Insufficient permissions"**
- Verify domain-wide delegation is configured
- Check scopes in Admin Console match required scopes
- Ensure `GOOGLE_DELEGATED_USER` is correct

**"API not enabled"**
- Enable required APIs in Google Cloud Console
- Wait a few minutes for propagation

**"Invalid grant"**
- Check service account key is not expired
- Verify delegated user exists and is active

---

## SEE ALSO

- Google Workspace API Setup Runbook: `docs/3_runbooks/google_workspace_api_setup.md`
- Python Integration Guide: `docs/4_guides/google_workspace_api_guide.md`
- KeePassXC Security Guide: `docs/4_guides/google_workspace_keepassxc_security_guide.md`

---

## AUTHOR

Project Chronos Development Team

## VERSION

0.1.0 (2025-12-04)
