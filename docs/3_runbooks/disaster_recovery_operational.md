# Operational Disaster Recovery (Bus Factor)

**Purpose:** Recover access to the Chronos project after losing your phone (MFA), computer (development environment), or both.

**Last Updated:** 2025-12-03  
**Owner:** PrometheusFire-22

---

## 📋 Overview

This runbook covers three scenarios:
- **Scenario A:** Phone loss (MFA/2FA codes)
- **Scenario B:** Computer loss (development environment, SSH keys)
- **Scenario C:** Total loss (phone + computer)

**Recovery Time Objectives (RTO):**
- Phone only: 1-2 hours
- Computer only: 2-4 hours (Windows), 1-2 hours (Ubuntu)
- Total loss: 4-6 hours

---

## 🔑 Prerequisites & Break Glass Kit

### What You Need Before Disaster Strikes

1. **Break Glass Kit** (physical, offline storage):
   - GitHub backup codes
   - AWS root account backup codes
   - Google Workspace backup codes
   - Jira/Atlassian backup codes
   - KeePassXC master password (written down)
   - USB stick with KeePassXC databases (`.kdbx` files)

2. **Cloud Backups** (already in place):
   - KeePassXC databases on Google Drive
   - Code on GitHub (`PrometheusFire-22/project-chronos`)
   - AWS infrastructure (Lightsail, S3)

3. **Trusted Contact** (optional but recommended):
   - Second USB stick with KeePassXC databases
   - Sealed envelope with Break Glass kit

---

## 🚨 Scenario A: Phone Loss (MFA Codes)

**Impact:** Cannot authenticate to AWS SSO, Google Workspace, or other MFA-protected services.

**Recovery Path:** Use backup codes + computer access

### Steps

1. **Immediate Actions (from your computer)**

   a. **AWS SSO Recovery:**
   ```bash
   # Use backup codes to sign in
   # Navigate to: https://chronos-sso.awsapps.com/start
   # Click "Trouble signing in?" → "Use backup code"
   ```

   b. **Google Workspace Recovery:**
   - Go to: https://accounts.google.com
   - Sign in with password
   - Use backup code when prompted for 2FA
   - Navigate to: Security → 2-Step Verification → Set up new phone

   c. **GitHub Recovery:**
   - GitHub does NOT have 2FA enabled (per your setup)
   - Sign in normally with username/password
   - **Action Item:** Consider enabling 2FA with backup codes

2. **Reconfigure MFA on New Phone**

   a. **Install Google Authenticator** on new Android phone

   b. **Re-enable AWS SSO MFA:**
   ```bash
   # From AWS Console (signed in with backup code)
   # IAM Identity Center → Users → Your user → MFA devices → Register new device
   ```

   c. **Re-enable Google Workspace MFA:**
   - Google Account → Security → 2-Step Verification
   - Add new phone → Scan QR code with Google Authenticator

   d. **Jira/Atlassian MFA:**
   - Sign in to Atlassian account
   - Account Settings → Security → Two-step verification
   - Re-register new device

3. **Verify Access**
   - Test AWS SSO login with new MFA
   - Test Google Workspace login
   - Test Jira login

**Estimated Time:** 1-2 hours

---

## 💻 Scenario B: Computer Loss (Development Environment)

**Impact:** Loss of local code, SSH keys, development tools, KeePassXC access.

**Recovery Path:** Use phone for MFA + cloud backups + borrowed/new computer

### Option B1: Ubuntu Computer (Preferred)

1. **Install Required Software**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Git
   sudo apt install git -y

   # Install Python 3.11+
   sudo apt install python3 python3-pip python3-venv -y

   # Install AWS CLI v2
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install

   # Install KeePassXC
   sudo apt install keepassxc -y

   # Install VS Code (optional)
   sudo snap install code --classic
   ```

2. **Recover KeePassXC Database**

   ```bash
   # Download from Google Drive (via browser)
   # Or from USB stick if available
   
   # Open KeePassXC
   keepassxc
   
   # File → Open Database → Select your .kdbx file
   # Enter master password from Break Glass kit
   ```

3. **Configure AWS CLI**

   ```bash
   # Configure SSO
   aws configure sso
   # SSO session name: chronos-sso
   # SSO start URL: https://chronos-sso.awsapps.com/start
   # SSO region: ca-central-1
   # SSO registration scopes: sso:account:access
   
   # Select account: 314758835721
   # Select role: AdministratorAccess
   # CLI default region: ca-central-1
   # CLI output format: json
   
   # Test login (will use phone for MFA)
   aws sso login --profile chronos-sso
   ```

4. **Recover SSH Keys for GitHub**

   ```bash
   # Generate new SSH key
   ssh-keygen -t ed25519 -C "axiologycapital@gmail.com"
   # Save to: /home/prometheus/.ssh/id_ed25519
   # Passphrase: (leave empty or use new one)
   
   # Start SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Copy public key
   cat ~/.ssh/id_ed25519.pub
   ```

5. **Add New SSH Key to GitHub**

   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Title: `prometheus-recovery-[date]`
   - Paste public key
   - Click "Add SSH key"

6. **Clone Project Repository**

   ```bash
   # Create workspace
   mkdir -p ~/coding/finance
   cd ~/coding/finance
   
   # Clone repo
   git clone git@github.com:PrometheusFire-22/project-chronos.git
   cd project-chronos
   
   # Configure Git
   git config user.name "PrometheusFire-22"
   git config user.email "axiologycapital@gmail.com"
   ```

7. **Set Up Python Environment**

   ```bash
   # Create virtual environment
   python3 -m venv .venv
   source .venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy .env from KeePassXC
   # (Jira credentials, etc.)
   ```

8. **Recover AWS Lightsail SSH Key**

   ```bash
   # Download from AWS Console
   # Lightsail → Account → SSH keys → chronos-prod-db → Download
   
   # Move to correct location
   mkdir -p ~/.ssh/aws-lightsail
   mv ~/Downloads/chronos-prod-db.pem ~/.ssh/aws-lightsail/chronos-prod-db
   chmod 400 ~/.ssh/aws-lightsail/chronos-prod-db
   
   # Test connection
   ssh -i ~/.ssh/aws-lightsail/chronos-prod-db ubuntu@16.52.210.100
   ```

**Estimated Time:** 1-2 hours

### Option B2: Windows Computer (Interim)

1. **Install Required Software**

   a. **Git for Windows:**
   - Download: https://git-scm.com/download/win
   - Install with default options (includes Git Bash)

   b. **Python 3.11+:**
   - Download: https://www.python.org/downloads/
   - **Important:** Check "Add Python to PATH" during installation

   c. **AWS CLI v2:**
   - Download: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Run installer

   d. **KeePassXC:**
   - Download: https://keepassxc.org/download/#windows
   - Install

   e. **VS Code (optional):**
   - Download: https://code.visualstudio.com/

2. **Recover KeePassXC Database**

   - Download `.kdbx` file from Google Drive
   - Open with KeePassXC
   - Enter master password

3. **Configure AWS CLI (PowerShell or Git Bash)**

   ```powershell
   # Open PowerShell or Git Bash
   aws configure sso
   # Follow same prompts as Ubuntu version
   
   # Test login
   aws sso login --profile chronos-sso
   ```

4. **Generate SSH Key (Git Bash)**

   ```bash
   # Open Git Bash
   ssh-keygen -t ed25519 -C "axiologycapital@gmail.com"
   # Save to: C:\Users\[YourName]\.ssh\id_ed25519
   
   # Copy public key
   cat ~/.ssh/id_ed25519.pub
   ```

5. **Add SSH Key to GitHub** (same as Ubuntu)

6. **Clone Repository (Git Bash)**

   ```bash
   # Create directory
   mkdir -p ~/coding/finance
   cd ~/coding/finance
   
   # Clone
   git clone git@github.com:PrometheusFire-22/project-chronos.git
   cd project-chronos
   ```

7. **Set Up Python Environment (PowerShell or Git Bash)**

   ```bash
   # Create virtual environment
   python -m venv .venv
   
   # Activate (Git Bash)
   source .venv/Scripts/activate
   
   # OR Activate (PowerShell)
   .venv\Scripts\Activate.ps1
   
   # Install dependencies
   pip install -r requirements.txt
   ```

8. **Download Lightsail SSH Key**

   - Download from AWS Console
   - Move to: `C:\Users\[YourName]\.ssh\aws-lightsail\chronos-prod-db.pem`
   - **Note:** Windows doesn't need `chmod`, but keep file secure

   ```bash
   # Test connection (Git Bash)
   ssh -i ~/.ssh/aws-lightsail/chronos-prod-db.pem ubuntu@16.52.210.100
   ```

**Estimated Time:** 2-4 hours (due to Windows-specific setup)

---

## 🔥 Scenario C: Total Loss (Phone + Computer)

**Impact:** Loss of MFA codes AND development environment.

**Recovery Path:** Break Glass kit + borrowed computer + cloud resources

### Critical Dependencies

1. **Break Glass Kit** (physical access required)
2. **Borrowed computer** (Windows or Ubuntu)
3. **Internet access**
4. **AI assistance** (browser-based: ChatGPT, Claude, Gemini)

### Steps

1. **Immediate Actions (Borrowed Computer)**

   a. **Access Break Glass Kit:**
   - Retrieve physical kit from safe location
   - Locate backup codes for all services

   b. **Sign In to Google Workspace (with backup code):**
   - Go to: https://accounts.google.com
   - Email: `geoff@automatonicai.com`
   - Password: (from Break Glass kit or KeePassXC master password)
   - Use backup code for 2FA

   c. **Download KeePassXC Database from Google Drive:**
   - Navigate to Google Drive
   - Download `Chronos.kdbx` (or your database name)
   - Save to safe location on borrowed computer

2. **Install KeePassXC and Open Database**

   - **Windows:** Download from https://keepassxc.org/download/#windows
   - **Ubuntu:** `sudo apt install keepassxc`
   - Open database with master password from Break Glass kit

3. **Sign In to AWS (with backup code)**

   - Go to: https://314758835721.signin.aws.amazon.com/console
   - Username: Root account email (`axiologycapital@gmail.com`)
   - Password: (from KeePassXC)
   - Use backup code for MFA

   **Alternative:** Use SSO with backup code
   - Go to: https://chronos-sso.awsapps.com/start
   - Use backup code

4. **Sign In to GitHub**

   - Go to: https://github.com/login
   - Username: `PrometheusFire-22`
   - Password: `^WXc:dAemEEroa80` (from your notes, but **recommend changing**)
   - **Note:** No 2FA currently enabled

5. **Follow Scenario B Steps**

   - Install required software (see Option B1 or B2 above)
   - Configure AWS CLI
   - Generate new SSH key
   - Clone repository
   - Set up development environment

6. **Reconfigure MFA on New Phone**

   - Order/acquire new Android phone
   - Install Google Authenticator
   - Follow Scenario A steps to re-enable MFA

**Estimated Time:** 4-6 hours

---

## 🤖 Using AI Assistance During Recovery

**Key Insight:** You can use browser-based AI even without your development environment.

### Recommended AI Tools (No Installation Required)

1. **ChatGPT:** https://chat.openai.com
2. **Claude:** https://claude.ai
3. **Google Gemini:** https://gemini.google.com

### How to Get Help

1. **Copy This Runbook to AI:**
   ```
   "I've lost my [phone/computer/both] and need to recover access to my development environment. Here's my disaster recovery runbook: [paste this document]"
   ```

2. **Ask Specific Questions:**
   - "How do I install AWS CLI on Windows?"
   - "I'm getting this error when cloning from GitHub: [paste error]"
   - "How do I configure AWS SSO on a borrowed computer?"

3. **Share Error Messages:**
   - Copy/paste full error messages
   - Include context (what you were trying to do)

4. **Request Step-by-Step Guidance:**
   - "Walk me through setting up Python virtual environment on Windows"
   - "I need to restore my database from S3 backup, guide me through it"

### What to Share with AI

**Safe to share:**
- Error messages
- Command outputs (redact sensitive info)
- This runbook
- General setup questions

**DO NOT share:**
- Passwords
- API keys
- AWS credentials
- SSH private keys
- KeePassXC master password

---

## 📦 Break Glass Kit Setup Guide

### What to Include

Create a physical package containing:

1. **Printed Document (this page):**
   - Print this entire runbook
   - Include URLs for software downloads
   - Include your GitHub username

2. **Backup Codes (printed):**
   - GitHub backup codes (if you enable 2FA)
   - AWS root account backup codes
   - Google Workspace backup codes
   - Jira/Atlassian backup codes

3. **KeePassXC Master Password:**
   - Written on paper (not typed)
   - Sealed in envelope

4. **USB Stick #1 (for you):**
   - `Chronos.kdbx` (KeePassXC database)
   - `Personal.kdbx` (if separate)
   - Label: "Chronos DR Backup - [Date]"

5. **USB Stick #2 (for trusted contact):**
   - Same contents as USB #1
   - Sealed envelope with instructions
   - Label: "Emergency Access Only"

### How to Generate Backup Codes

#### AWS Root Account

1. Sign in to AWS Console as root
2. Go to: IAM → My Security Credentials
3. Multi-factor authentication (MFA) → Manage MFA device
4. Click "Show backup codes" or "Generate new codes"
5. Print and add to Break Glass kit

#### Google Workspace

1. Go to: https://myaccount.google.com/security
2. 2-Step Verification → Backup codes
3. Click "Generate" or "Show codes"
4. Print and add to Break Glass kit

#### GitHub (if you enable 2FA)

1. Go to: https://github.com/settings/security
2. Two-factor authentication → Recovery codes
3. Click "Generate new recovery codes"
4. Print and add to Break Glass kit

#### Jira/Atlassian

1. Go to: https://id.atlassian.com/manage-profile/security
2. Two-step verification → Backup codes
3. Generate and print

### Where to Store Break Glass Kit

**Option 1: Home Safe**
- Fireproof safe
- Combination lock (not digital)
- Keep combination in KeePassXC

**Option 2: Bank Safe Deposit Box**
- Most secure option
- Requires physical visit to access
- Annual fee (~$50-100)

**Option 3: Trusted Family Member**
- Sealed envelope
- Clear instructions: "Open only in emergency"
- Keep second copy for yourself

**Recommended:** Combination of Option 1 (home safe) + Option 3 (trusted contact with USB #2)

---

## ✅ Pre-Disaster Checklist

Complete these tasks NOW to ensure smooth recovery:

### Immediate Actions

- [ ] Enable 2FA on GitHub and generate backup codes
- [ ] Generate AWS root account backup codes
- [ ] Generate Google Workspace backup codes
- [ ] Generate Jira/Atlassian backup codes
- [ ] Create USB stick #1 with KeePassXC databases
- [ ] Create USB stick #2 for trusted contact
- [ ] Print this runbook
- [ ] Assemble Break Glass kit
- [ ] Store kit in secure location
- [ ] Test KeePassXC database opens from USB stick
- [ ] Verify Google Drive has latest KeePassXC backup

### Monthly Maintenance

- [ ] Update KeePassXC databases on USB sticks
- [ ] Verify Google Drive sync is working
- [ ] Review backup codes (regenerate if needed)
- [ ] Test AWS SSO login
- [ ] Verify GitHub SSH key is still active

### Quarterly Testing

- [ ] Simulate Scenario A (phone loss) - use backup code to sign in
- [ ] Simulate Scenario B (computer loss) - clone repo on different machine
- [ ] Verify Break Glass kit is accessible

---

## 🔐 Security Recommendations

### Immediate Security Improvements

1. **Enable GitHub 2FA:**
   - Currently disabled (high risk)
   - Use Google Authenticator
   - Generate and store backup codes

2. **Rotate GitHub Password:**
   - Current password is exposed in notes
   - Use KeePassXC to generate strong password
   - Update in GitHub settings

3. **Review AWS IAM Users:**
   - Deprecate `Prometheus_Lightsail` user (per CHRONOS-240)
   - Use AWS SSO exclusively
   - Delete long-lived access keys

4. **Secure Personal Access Tokens:**
   - Rotate old GitHub PATs (stored in KeePassXC)
   - Use fine-grained tokens with minimal scope
   - Set expiration dates

5. **KeePassXC Database Security:**
   - Use strong master password (20+ characters)
   - Enable key file (additional security layer)
   - Regular backups to Google Drive + USB

### Long-Term Improvements

1. **Hardware Security Key (Optional):**
   - YubiKey or similar
   - Use for AWS, GitHub, Google
   - More secure than phone-based MFA

2. **Password Manager Sharing:**
   - KeePassXC supports shared databases
   - Consider for trusted contact

3. **Automated Backup Verification:**
   - Script to verify Google Drive sync
   - Alert if backup is stale (>7 days)

---

## 📞 Emergency Contacts

**AWS Support:**
- Phone: 1-866-947-7829
- Email: aws-verification@amazon.com
- Use for: Account recovery, MFA issues

**GitHub Support:**
- Email: support@github.com
- Use for: Account recovery, SSH key issues

**Google Workspace Support:**
- Phone: 1-877-355-5787
- Use for: Account recovery, MFA issues

**Atlassian Support:**
- https://support.atlassian.com
- Use for: Jira/Confluence access issues

---

## 🧪 Testing Scenarios

### Test 1: Phone Loss (Simulated)

1. **Without using your phone:**
   - Sign in to AWS SSO using backup code
   - Sign in to Google Workspace using backup code
   - Verify you can access all critical services

2. **Expected outcome:**
   - Successful login to all services
   - Ability to re-register new MFA device

3. **Time limit:** 30 minutes

### Test 2: Computer Loss (Simulated)

1. **Use a different computer or VM:**
   - Install required software (Git, Python, AWS CLI, KeePassXC)
   - Download KeePassXC database from Google Drive
   - Clone project repository
   - Set up development environment

2. **Expected outcome:**
   - Fully functional development environment
   - Ability to run scripts and access AWS

3. **Time limit:** 2 hours (Ubuntu) or 3 hours (Windows)

### Test 3: Total Loss (Simulated)

1. **Use borrowed computer + Break Glass kit:**
   - Access Break Glass kit
   - Use backup codes to sign in to all services
   - Download KeePassXC database
   - Set up complete development environment

2. **Expected outcome:**
   - Full recovery of access and environment
   - Ability to deploy code and manage infrastructure

3. **Time limit:** 4 hours

---

## 📚 Additional Resources

- [AWS SSO Documentation](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [GitHub SSH Key Setup](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [KeePassXC User Guide](https://keepassxc.org/docs/)
- [Google Authenticator Setup](https://support.google.com/accounts/answer/1066447)
- [pgBackRest Restore Guide](./pgbackrest_backup_restore.md)
- [Technical DR Runbook](./disaster_recovery_technical.md)
