# Google Workspace Email Configuration Runbook

**Purpose:** Complete guide to configure Gmail for `automatonicai.com` with proper MX, SPF, DKIM, and DMARC records.

**Last Updated:** 2025-12-04  
**Owner:** PrometheusFire-22  
**Related Tickets:** CHRONOS-175, CHRONOS-179

---

## 📋 Overview

This runbook walks through configuring Google Workspace email to be fully functional with optimal deliverability and security.

**Current Status:** ❌ Email NOT fully configured
- MX record points to wrong server (`smtp.google.com` instead of `aspmx.l.google.com`)
- No SPF record
- No DKIM configured
- No DMARC policy

**Target Status:** ✅ Email fully functional
- Correct MX records
- SPF configured
- DKIM enabled and verified
- DMARC policy active
- 10/10 deliverability score

---

## 🎯 Prerequisites

- ✅ Google Workspace account active (`geoff@automatonicai.com`)
- ✅ Domain registered (`automatonicai.com`)
- ✅ DNS hosted on AWS Route53
- ✅ Admin access to Google Workspace Admin Console
- ✅ AWS CLI configured with Route53 permissions

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│              automatonicai.com (Route53)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  MX Records (Priority Order)                             │
│  ├─ 1:  aspmx.l.google.com                              │
│  ├─ 5:  alt1.aspmx.l.google.com                         │
│  ├─ 5:  alt2.aspmx.l.google.com                         │
│  ├─ 10: alt3.aspmx.l.google.com                         │
│  └─ 10: alt4.aspmx.l.google.com                         │
│                                                          │
│  TXT Records (Email Authentication)                      │
│  ├─ SPF:   v=spf1 include:_spf.google.com ~all          │
│  ├─ DKIM:  google._domainkey (2048-bit RSA key)         │
│  └─ DMARC: v=DMARC1; p=quarantine; rua=...              │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Google Workspace     │
              │  Mail Servers         │
              └───────────────────────┘
```

---

## 🔧 Step-by-Step Configuration

### Step 1: Verify Current DNS Setup

**Check current MX records:**
```bash
dig automatonicai.com MX +short
```

**Expected output (WRONG):**
```
1 smtp.google.com.
```

**Check current TXT records:**
```bash
dig automatonicai.com TXT +short
```

**Expected output (EMPTY):**
```
(no output)
```

---

### Step 2: Get Google Workspace MX Records

**From Google Admin Console:**

1. Go to: https://admin.google.com
2. Sign in as `geoff@automatonicai.com`
3. Navigate to: **Apps → Google Workspace → Gmail → Setup**
4. Click: **"Set up MX records"**
5. Note the MX records (should be):

```
Priority  Mail Server
1         aspmx.l.google.com
5         alt1.aspmx.l.google.com
5         alt2.aspmx.l.google.com
10        alt3.aspmx.l.google.com
10        alt4.aspmx.l.google.com
```

---

### Step 3: Update MX Records in Route53

**Get Hosted Zone ID:**
```bash
aws route53 list-hosted-zones --query "HostedZones[?Name=='automatonicai.com.'].Id" --output text
```

**Create MX record change batch:**

Create file: `scripts/google/mx-records-update.json`

```json
{
  "Comment": "Update MX records for Google Workspace",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "automatonicai.com",
        "Type": "MX",
        "TTL": 3600,
        "ResourceRecords": [
          {"Value": "1 aspmx.l.google.com"},
          {"Value": "5 alt1.aspmx.l.google.com"},
          {"Value": "5 alt2.aspmx.l.google.com"},
          {"Value": "10 alt3.aspmx.l.google.com"},
          {"Value": "10 alt4.aspmx.l.google.com"}
        ]
      }
    }
  ]
}
```

**Apply changes:**
```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='automatonicai.com.'].Id" --output text | cut -d'/' -f3)

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/mx-records-update.json
```

**Verify changes:**
```bash
# Wait 60 seconds for propagation
sleep 60

# Check MX records
dig automatonicai.com MX +short
```

**Expected output:**
```
1 aspmx.l.google.com.
5 alt1.aspmx.l.google.com.
5 alt2.aspmx.l.google.com.
10 alt3.aspmx.l.google.com.
10 alt4.aspmx.l.google.com.
```

---

### Step 4: Configure SPF Record

**What is SPF?**
SPF (Sender Policy Framework) specifies which mail servers are authorized to send email on behalf of your domain.

**SPF Record:**
```
v=spf1 include:_spf.google.com ~all
```

**Explanation:**
- `v=spf1` - SPF version 1
- `include:_spf.google.com` - Authorize Google's mail servers
- `~all` - Soft fail for unauthorized servers (recommended for testing)

**Create SPF record change batch:**

Create file: `scripts/google/spf-record-update.json`

```json
{
  "Comment": "Add SPF record for Google Workspace",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "automatonicai.com",
        "Type": "TXT",
        "TTL": 3600,
        "ResourceRecords": [
          {"Value": "\"v=spf1 include:_spf.google.com ~all\""}
        ]
      }
    }
  ]
}
```

**Apply changes:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/spf-record-update.json
```

**Verify SPF:**
```bash
dig automatonicai.com TXT +short | grep spf
```

**Expected output:**
```
"v=spf1 include:_spf.google.com ~all"
```

---

### Step 5: Configure DKIM

**What is DKIM?**
DKIM (DomainKeys Identified Mail) adds a digital signature to outgoing emails to verify they haven't been tampered with.

**Generate DKIM key in Google Admin Console:**

1. Go to: https://admin.google.com
2. Navigate to: **Apps → Google Workspace → Gmail → Authenticate email**
3. Click: **"Generate new record"**
4. Select: **2048-bit key** (recommended)
5. Click: **"Generate"**
6. Copy the DKIM TXT record value

**Example DKIM record:**
```
Selector: google._domainkey
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
```

**Create DKIM record change batch:**

Create file: `scripts/google/dkim-record-update.json`

```json
{
  "Comment": "Add DKIM record for Google Workspace",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "google._domainkey.automatonicai.com",
        "Type": "TXT",
        "TTL": 3600,
        "ResourceRecords": [
          {"Value": "\"v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY_HERE\""}
        ]
      }
    }
  ]
}
```

**⚠️ IMPORTANT:** Replace `YOUR_DKIM_PUBLIC_KEY_HERE` with the actual DKIM key from Google Admin Console.

**Apply changes:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/dkim-record-update.json
```

**Verify DKIM:**
```bash
dig google._domainkey.automatonicai.com TXT +short
```

**Expected output:**
```
"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
```

**Activate DKIM in Google Admin Console:**

1. Return to: **Apps → Google Workspace → Gmail → Authenticate email**
2. Click: **"Start authentication"**
3. Wait for Google to verify the DNS record (can take up to 48 hours, usually <1 hour)
4. Status should change to: **"Authenticating email"**

---

### Step 6: Configure DMARC

**What is DMARC?**
DMARC (Domain-based Message Authentication, Reporting and Conformance) tells receiving mail servers what to do with emails that fail SPF or DKIM checks.

**DMARC Record:**
```
v=DMARC1; p=quarantine; rua=mailto:geoff@automatonicai.com; pct=100; adkim=s; aspf=s
```

**Explanation:**
- `v=DMARC1` - DMARC version 1
- `p=quarantine` - Quarantine emails that fail (recommended for production)
- `rua=mailto:geoff@automatonicai.com` - Send aggregate reports here
- `pct=100` - Apply policy to 100% of emails
- `adkim=s` - Strict DKIM alignment
- `aspf=s` - Strict SPF alignment

**Create DMARC record change batch:**

Create file: `scripts/google/dmarc-record-update.json`

```json
{
  "Comment": "Add DMARC record for Google Workspace",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "_dmarc.automatonicai.com",
        "Type": "TXT",
        "TTL": 3600,
        "ResourceRecords": [
          {"Value": "\"v=DMARC1; p=quarantine; rua=mailto:geoff@automatonicai.com; pct=100; adkim=s; aspf=s\""}
        ]
      }
    }
  ]
}
```

**Apply changes:**
```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://scripts/google/dmarc-record-update.json
```

**Verify DMARC:**
```bash
dig _dmarc.automatonicai.com TXT +short
```

**Expected output:**
```
"v=DMARC1; p=quarantine; rua=mailto:geoff@automatonicai.com; pct=100; adkim=s; aspf=s"
```

---

### Step 7: Test Email Sending

**Send test email from Gmail:**

1. Go to: https://mail.google.com
2. Sign in as: `geoff@automatonicai.com`
3. Compose new email
4. To: Your personal email (e.g., `axiologycapital@gmail.com`)
5. Subject: `Test Email from Google Workspace`
6. Body: `Testing email deliverability for automatonicai.com`
7. Send

**Check if email arrives:**
- Check inbox (should arrive within seconds)
- Check spam folder (should NOT be there)
- View email headers to verify SPF/DKIM/DMARC pass

---

### Step 8: Test Email Receiving

**Send test email to Gmail:**

1. From your personal email
2. To: `geoff@automatonicai.com`
3. Subject: `Test Inbound Email`
4. Send

**Check if email arrives:**
- Go to: https://mail.google.com
- Sign in as: `geoff@automatonicai.com`
- Check inbox (should arrive within seconds)

---

### Step 9: Verify Email Deliverability

**Use mail-tester.com:**

1. Go to: https://www.mail-tester.com
2. Note the unique email address provided (e.g., `test-abc123@mail-tester.com`)
3. Send email from `geoff@automatonicai.com` to that address
4. Return to mail-tester.com
5. Click: **"Then check your score"**
6. Review results

**Target Score:** 10/10

**Common Issues:**
- **SPF not configured:** Add SPF record
- **DKIM not configured:** Enable DKIM in Admin Console
- **DMARC not configured:** Add DMARC record
- **Reverse DNS missing:** Contact Google Support (usually auto-configured)
- **IP reputation low:** Send more legitimate emails to build reputation

---

### Step 10: Configure Email Aliases (Optional)

**Create email aliases:**

1. Go to: https://admin.google.com
2. Navigate to: **Directory → Users**
3. Click on: `geoff@automatonicai.com`
4. Click: **"User information"**
5. Scroll to: **"Email aliases"**
6. Click: **"Add alternate email"**
7. Add aliases:
   - `admin@automatonicai.com`
   - `support@automatonicai.com`
   - `noreply@automatonicai.com`

**Test aliases:**
- Send email to alias
- Verify it arrives in main inbox

---

## ✅ Verification Checklist

### DNS Records
- [ ] MX records point to Google Workspace servers
- [ ] SPF record configured (`v=spf1 include:_spf.google.com ~all`)
- [ ] DKIM record added and verified
- [ ] DMARC record configured (`p=quarantine`)

### Email Functionality
- [ ] Can send emails from `geoff@automatonicai.com`
- [ ] Can receive emails at `geoff@automatonicai.com`
- [ ] Emails not marked as spam
- [ ] Email headers show SPF: PASS
- [ ] Email headers show DKIM: PASS
- [ ] Email headers show DMARC: PASS

### Deliverability
- [ ] mail-tester.com score: 10/10
- [ ] Emails arrive in inbox (not spam)
- [ ] Reply-to works correctly
- [ ] Attachments work

### Security
- [ ] DKIM key length: 2048-bit
- [ ] DMARC policy: quarantine (or reject)
- [ ] SPF policy: ~all (soft fail)
- [ ] All DNS records documented in KeePassXC

---

## 🔍 Troubleshooting

### Email Not Sending

**Check MX records:**
```bash
dig automatonicai.com MX +short
```

**Check SPF:**
```bash
dig automatonicai.com TXT +short | grep spf
```

**Check DKIM:**
```bash
dig google._domainkey.automatonicai.com TXT +short
```

**Check Google Admin Console:**
- Apps → Google Workspace → Gmail → Setup
- Verify MX records are correct
- Verify DKIM is "Authenticating email"

### Email Going to Spam

**Check mail-tester.com score:**
- Should be 10/10
- Review specific issues listed

**Check email headers:**
- SPF should show: PASS
- DKIM should show: PASS
- DMARC should show: PASS

**Build IP reputation:**
- Send legitimate emails regularly
- Avoid spam-like content
- Use proper email formatting

### DKIM Not Verifying

**Wait for DNS propagation:**
- Can take up to 48 hours
- Usually completes in <1 hour

**Verify DNS record:**
```bash
dig google._domainkey.automatonicai.com TXT +short
```

**Check Google Admin Console:**
- Apps → Google Workspace → Gmail → Authenticate email
- Status should be: "Authenticating email"
- If "Waiting to authenticate", wait longer or click "Start authentication" again

---

## 📊 Monitoring

### Daily Checks
- Check inbox for delivery issues
- Monitor spam folder for false positives

### Weekly Checks
- Review DMARC reports (sent to `geoff@automatonicai.com`)
- Check for failed deliveries

### Monthly Checks
- Run mail-tester.com test
- Verify DNS records still correct
- Review email usage and quotas

---

## 🔐 Security Best Practices

### DNS Security
- Use DNSSEC (if supported by Route53)
- Set appropriate TTL values (3600 seconds recommended)
- Monitor DNS changes

### Email Security
- Enable 2FA on Google Workspace account
- Use strong, unique password
- Store credentials in KeePassXC
- Rotate passwords every 180 days

### DMARC Policy Progression
1. **Start:** `p=none` (monitoring only)
2. **After 1 week:** `p=quarantine` (quarantine suspicious emails)
3. **After 1 month:** `p=reject` (reject unauthorized emails)

---

## 📚 Related Documentation

- [Google Workspace KeePassXC Security Guide](../4_guides/google_workspace_keepassxc_security_guide.md)
- [Google Workspace API Setup](../3_runbooks/google_workspace_api_setup.md)
- [Google Workspace CLI Guide](../3_runbooks/google_workspace_cli.md)
- [Disaster Recovery - Operational](../3_runbooks/disaster_recovery_operational.md)

---

## 🎯 Success Criteria

- ✅ Email fully functional (send/receive)
- ✅ mail-tester.com score: 10/10
- ✅ SPF/DKIM/DMARC all configured
- ✅ Emails arrive in inbox (not spam)
- ✅ All DNS records documented
- ✅ Email aliases configured
- ✅ Monitoring in place

---

## 📞 Support

**Google Workspace Support:**
- Phone: 1-877-355-5787
- Email: workspace-support@google.com
- Admin Console: https://admin.google.com/support

**DNS/Route53 Support:**
- AWS Support Console: https://console.aws.amazon.com/support
- Documentation: https://docs.aws.amazon.com/route53/

---

## 🚀 Next Steps

After email is fully configured:
1. Proceed to Phase 2: API Setup (CHRONOS-179)
2. Enable Google Workspace APIs
3. Create service account
4. Configure domain-wide delegation
5. Build Python integration module
