#!/usr/bin/env python3
"""
Verify Google Workspace Connection
Run this script to initiate the OAuth flow and verify connectivity.
"""
import sys
from pathlib import Path

# Add project root to path
START_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(START_DIR / "src"))

from chronos.integrations.google.client import GoogleClient  # noqa: E402


def main():
    print("🚀 Starting Google Workspace Verification...")

    # Check for client secret
    secret_path = START_DIR / "client_secret.json"
    if not secret_path.exists():
        print(f"❌ Error: client_secret.json not found at {secret_path}")
        print("   Please create it using the content from the guide.")
        sys.exit(1)

    print(f"   Using secret: {secret_path}")
    print("   Initializing Client (Browser may open)...")

    try:
        client = GoogleClient(client_secret_file="client_secret.json")

        # This triggers the auth flow if no valid token exists
        success = client.verify_connection()

        if success:
            print("\n✅ SUCCESS: Connected to Google Workspace!")
            print("   Token saved to: token.pickle")
            print("   You are ready to use the integration.")
        else:
            print("\n❌ FAUILED: Could not verify connection.")
            sys.exit(1)

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
