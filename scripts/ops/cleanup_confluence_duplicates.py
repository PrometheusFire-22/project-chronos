import os
from pathlib import Path

from atlassian import Confluence
from dotenv import load_dotenv

# Load env from parent directories
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

CONFLUENCE_URL = os.getenv("CONFLUENCE_URL", "https://automatonicai.atlassian.net")
CONFLUENCE_EMAIL = os.getenv("CONFLUENCE_EMAIL", "axiologycapital@gmail.com")
CONFLUENCE_API_TOKEN = os.getenv("CONFLUENCE_API_TOKEN")


def main():
    print("Initialize Confluence...")
    confluence = Confluence(
        url=CONFLUENCE_URL, username=CONFLUENCE_EMAIL, password=CONFLUENCE_API_TOKEN
    )

    print("Fetching all pages from space PC...")
    pages = confluence.get_all_pages_from_space("PC", start=0, limit=500)

    deleted_count = 0

    print(f"Found {len(pages)} pages. Scanning for legacy artifacts...")

    for page in pages:
        title = page["title"]
        page_id = page["id"]

        # Criteria for deletion:
        # 1. Ends with .md (Legacy filename upload)
        # 2. Starts with folder emoji (Legacy manual folders)
        if title.endswith(".md") or title.startswith(("📂", "📁")):
            print(f"🗑️  Deleting legacy page: {title} (ID: {page_id})")
            try:
                confluence.remove_page(page_id)
                deleted_count += 1
            except Exception as e:
                print(f"❌ Failed to delete {title}: {e}")

    print(f"\n✅ Cleanup complete. Deleted {deleted_count} pages.")


if __name__ == "__main__":
    main()
