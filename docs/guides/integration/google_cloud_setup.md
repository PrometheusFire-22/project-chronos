# Google Cloud Project Setup Guide

This guide details how to configure your new GCP Project **"Chronos Connect"** to authorize our Python application.

## 1. OAuth Consent Screen
Since you are using a personal Gmail account (`axiologycapital@gmail.com`) to allow access to your Workspace account (`geoff@automatonicai.com`), we will use **External** user type with **Testing** status.

1.  Go to **[APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)**.
2.  **User Type:** Select **External**.
3.  Click **Create**.
4.  **App Information:**
    *   **App name:** `Chronos Connect`
    *   **User support email:** Choose your email.
    *   **Developer contact information:** Choose your email.
5.  Click **Save and Continue**.
6.  **Scopes:**
    *   Click **Add or Remove Scopes**.
    *   Filter by "API" or manually add these (you may need to Enable APIs first, see Section 2):
        *   `.../auth/gmail.send`
        *   `.../auth/drive`
        *   `.../auth/spreadsheets`
        *   `.../auth/admin.directory.user` (if available, otherwise skip for now)
    *   *Note: For now, you can just click "Save and Continue" without adding specific scopes; the code will request them dynamically, but listing them here is good practice.*
7.  **Test Users:** (CRITICAL)
    *   Click **Add Users**.
    *   **Add:** `geoff@automatonicai.com` (Your Workspace Admin)
    *   **Add:** `axiologycapital@gmail.com` (Your Personal Account / Developer)
    *   *Without this, you will get a 403 Access Denied error.*
8.  Click **Save and Continue**.

## 2. Enable APIs
You must explicitly turn on the services we want to use.

1.  Go to **[APIs & Services > Library](https://console.cloud.google.com/apis/library)**.
2.  Search for and **Enable** each of the following:
    *   **Gmail API**
    *   **Google Drive API**
    *   **Google Sheets API**
    *   **Admin SDK API** (This allows us to manage Workspace users)

## 3. Create Credentials
1.  Go to **[APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)**.
2.  Click **+ Create Credentials** > **OAuth client ID**.
3.  **Application type:** Select **Desktop app**.
4.  **Name:** `Chronos Local Client` (or default).
5.  Click **Create**.
6.  **Download JSON:**
    *   Click the **Download JSON** button (icon with down arrow).
    *   Save this file as `client_secret.json`.
    *   **Move** this file to your project root: `/home/prometheus/coding/finance/project-chronos/client_secret.json`.

## 4. Housekeeping (Old Projects)
You listed several legacy projects. To avoid confusion/billing risks, I recommend **shutting down** the following if you confirm they have no active resources:

*   `neural-service-443119-b1` (My First Project) -> **Delete**
*   `n8n-project-438003` -> **Delete** (unless you have a specific n8n instance running)
*   `rclone-438219` -> **Delete** (we use pgBackRest now)
*   `flowise-437817` -> **Delete** (assuming Flowise is not active)
*   `postgres-backups-472403` -> **Check first** (ensure no buckets with critical data exist), then Delete.

**To Delete a Project:**
1.  Go to [Cloud Resource Manager](https://console.cloud.google.com/cloud-resource-manager).
2.  Select the project.
3.  Click **Delete**.
