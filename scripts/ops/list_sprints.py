import os
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load env from parent directories
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

JIRA_URL = os.getenv("JIRA_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

auth = (JIRA_EMAIL, JIRA_API_TOKEN)
headers = {"Accept": "application/json"}

print(f"Fetching sprints for board 1 from {JIRA_URL}...")
url = f"{JIRA_URL}/rest/agile/1.0/board/1/sprint"
r = requests.get(url, auth=auth, headers=headers)

if r.status_code == 200:
    data = r.json()
    for sprint in data.get("values", []):
        state = sprint.get("state", "unknown")
        print(f"Sprint ID: {sprint['id']} | Name: {sprint['name']} | State: {state}")
else:
    print(f"Error: {r.status_code} - {r.text}")
