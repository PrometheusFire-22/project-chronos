# AWS CLI v2 + SSO Configuration Guide

**Date:** 2025-11-27
**Ticket:** CHRONOS-219
**Status:** ✅ Complete

---

## 🎯 What Was Configured

### **AWS CLI v2**
- **Version:** 2.32.6
- **Installation:** System-wide (`/usr/local/bin/aws`)
- **Authentication:** IAM Identity Center (SSO)

### **IAM Identity Center (SSO)**
- **SSO Region:** us-east-2 (Ohio)
- **SSO Start URL:** https://d-9a670b0130.awsapps.com/start
- **AWS Account ID:** 314758835721
- **Role:** AdministratorAccess

### **Default AWS Region**
- **Region:** ca-central-1 (Canada Central - Montreal)
- **Why:** Data sovereignty - all data stays in Canada 🇨🇦

---

## 🔐 How SSO Authentication Works

### **What is IAM Identity Center (SSO)?**

IAM Identity Center provides **temporary credentials** instead of long-term access keys:

- ✅ **Secure:** Credentials expire automatically (8-12 hours)
- ✅ **Modern:** AWS-recommended best practice (2024+)
- ✅ **Convenient:** Browser-based authentication
- ✅ **No secrets:** No access keys to manage or leak

### **Authentication Flow**

```
1. You run: aws sso login
2. Browser opens → Sign in with IAM Identity Center credentials
3. Click "Allow" to grant CLI access
4. AWS CLI receives temporary credentials
5. Credentials valid for ~8-12 hours
6. When expired, run `aws sso login` again
```

---

## 🚀 Daily Usage

### **Start of Day (or when credentials expire)**

```bash
# Login to AWS SSO (opens browser)
aws sso login

# Browser opens → Sign in → Click "Allow" → Done!
```

### **Work Normally**

```bash
# All commands work without --profile
aws sts get-caller-identity
aws lightsail get-instances --region ca-central-1
aws s3 ls
aws cloudwatch describe-alarms --region ca-central-1
```

### **When Credentials Expire**

You'll see an error like:
```
Error: The SSO session associated with this profile has expired
```

**Solution:** Just run `aws sso login` again!

---

## 📂 Configuration Files

### **~/.aws/config**

Your AWS CLI configuration:

```ini
[default]
sso_session = chronos-sso
sso_account_id = 314758835721
sso_role_name = AdministratorAccess
region = ca-central-1
output = json

[sso-session chronos-sso]
sso_start_url = https://d-9a670b0130.awsapps.com/start
sso_region = us-east-2
sso_registration_scopes = sso:account:access
```

**What this means:**
- `[default]` - Your default profile (no need for --profile flag)
- `sso_session = chronos-sso` - Links to your SSO session
- `sso_account_id` - Your AWS account ID
- `sso_role_name = AdministratorAccess` - Permission level
- `region = ca-central-1` - Default region for all commands
- `output = json` - Response format

### **~/.aws/sso/cache/**

Temporary credentials stored here (auto-managed by AWS CLI)

---

## 🇨🇦 Data Sovereignty Strategy

### **IAM Identity Center Location**
- **Region:** us-east-2 (Ohio)
- **Purpose:** Authentication only (metadata)
- **Data:** User credentials, login sessions

### **Actual Data Location**
- **Region:** ca-central-1 (Canada)
- **Purpose:** All your application data
- **Services:** Lightsail, S3, CloudWatch

**Result:** Your data stays in Canada! 🇨🇦

---

## 🔧 Common Commands

### **Verify Identity**

```bash
aws sts get-caller-identity
```

**Expected output:**
```json
{
    "UserId": "AROAXXXXXXXXX:your-username",
    "Account": "314758835721",
    "Arn": "arn:aws:sts::314758835721:assumed-role/AWSReservedSSO_AdministratorAccess_xxxxx/your-username"
}
```

### **Check Available Regions**

```bash
aws ec2 describe-regions --output table
```

### **List Lightsail Regions**

```bash
aws lightsail get-regions --region ca-central-1
```

### **Test S3 Access**

```bash
aws s3 ls --region ca-central-1
```

---

## 🆘 Troubleshooting

### **Error: "Unable to locate credentials"**

**Problem:** SSO session expired or never logged in

**Solution:**
```bash
aws sso login
```

---

### **Error: "The SSO session associated with this profile has expired"**

**Problem:** Credentials expired (usually after 8-12 hours)

**Solution:**
```bash
aws sso login
```

---

### **Error: "Access Denied" or "UnauthorizedOperation"**

**Problem:** Your IAM Identity Center user doesn't have permissions for this action

**Solution:**
1. Go to: https://us-east-2.console.aws.amazon.com/singlesignon
2. Click "AWS accounts" → Select your account
3. Verify your user has "AdministratorAccess" permission set
4. Or assign additional permissions

---

### **Browser Doesn't Open for SSO Login**

**Problem:** CLI can't auto-open browser

**Solution:** Copy the URL from terminal and paste into browser manually

---

### **Wrong Region / Want to Use Different Region**

**For one command:**
```bash
aws lightsail get-instances --region us-east-1
```

**Change default region:**
```bash
aws configure set region ca-central-1
```

---

## 📋 Profile Management

### **List All Profiles**

```bash
aws configure list-profiles
```

**Output:**
```
default
AdministratorAccess-314758835721
```

### **Use Specific Profile**

```bash
aws sts get-caller-identity --profile AdministratorAccess-314758835721
```

### **Set Default Profile (if needed)**

```bash
export AWS_PROFILE=default
```

Make permanent (add to ~/.bashrc or ~/.zshrc):
```bash
echo 'export AWS_PROFILE=default' >> ~/.bashrc
```

---

## 🔒 Security Best Practices

### ✅ **What We Did Right**

1. **SSO instead of access keys** - No long-term credentials
2. **AdministratorAccess via SSO** - Can be revoked instantly
3. **ca-central-1 for data** - Canadian data sovereignty
4. **MFA on IAM Identity Center user** - (You should enable this!)

### 🛡️ **Recommended: Enable MFA**

1. Go to: https://us-east-2.console.aws.amazon.com/singlesignon
2. Click "Users" → Select your user
3. Under "Multi-factor authentication" → "Register MFA device"
4. Follow wizard (use phone authenticator app)

**Benefits:**
- ✅ Extra security layer
- ✅ Required for production best practices
- ✅ Prevents unauthorized access even if password leaked

---

## 🎓 Understanding AWS Regions

### **Why Two Regions?**

| Service | Region | Purpose |
|---------|--------|---------|
| IAM Identity Center | us-east-2 (Ohio) | Authentication/Login |
| Lightsail | ca-central-1 (Montreal) | Database |
| S3 | ca-central-1 (Montreal) | Backups |
| CloudWatch | ca-central-1 (Montreal) | Monitoring |

**Key Point:** IAM Identity Center location doesn't affect where your data is stored!

### **Available Canadian Regions**

- `ca-central-1` (Montreal) - Only Canadian region
- `ca-west-1` (Calgary) - NEW! (Not all services available yet)

**Recommendation:** Use `ca-central-1` for everything (mature, all services available)

---

## 📊 Sprint 7 Integration

### **CHRONOS-213: Lightsail Setup**

```bash
# Provision Lightsail instance in Canada
aws lightsail create-instances \
  --instance-names chronos-db \
  --availability-zone ca-central-1a \
  --blueprint-id ubuntu_22_04 \
  --bundle-id medium_2_0
```

### **CHRONOS-214: S3 Backups**

```bash
# Create S3 bucket in Canada
aws s3api create-bucket \
  --bucket chronos-backups-314758835721 \
  --region ca-central-1 \
  --create-bucket-configuration LocationConstraint=ca-central-1
```

### **CHRONOS-217: CloudWatch Monitoring**

```bash
# Get CloudWatch metrics from Canada
aws cloudwatch get-metric-statistics \
  --region ca-central-1 \
  --namespace AWS/Lightsail \
  --metric-name CPUUtilization \
  ...
```

---

## 🔗 References

### **AWS Documentation**
- IAM Identity Center: https://docs.aws.amazon.com/singlesignon/latest/userguide/
- AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/
- SSO Configuration: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html

### **Project Chronos Documentation**
- Sprint 7 Planning: https://automatonicai.atlassian.net/wiki/spaces/PC/pages/6586374
- CHRONOS-219: https://automatonicai.atlassian.net/browse/CHRONOS-219

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `aws --version` shows `aws-cli/2.32.6` or higher
- [ ] `aws sts get-caller-identity` returns your account info
- [ ] `aws lightsail get-regions --region ca-central-1` works
- [ ] `cat ~/.aws/config` shows `[default]` profile with ca-central-1 region
- [ ] `aws sso login` opens browser and authenticates successfully

---

**🤖 Generated with Claude Code (Anthropic)**
**Session:** 2025-11-27
**Ticket:** CHRONOS-219

---

**Next Steps:**
- Add AWS CLI to dev container (Dockerfile.timescaledb)
- Create Confluence page with this documentation
- Update CHRONOS-219 to Done
- Begin CHRONOS-213 (Lightsail setup)
