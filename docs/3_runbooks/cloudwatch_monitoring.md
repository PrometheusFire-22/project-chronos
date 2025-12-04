# CloudWatch Monitoring Runbook

**Status:** ✅ Active
**Date Created:** 2025-12-02
**Jira Ticket:** CHRONOS-217
**Resources:** AWS CloudWatch, AWS SNS

---

## Overview
This runbook documents the monitoring infrastructure for the `chronos-production-database` Lightsail instance. We use AWS CloudWatch Alarms to trigger notifications via an SNS topic when critical thresholds are breached.

## 🔔 Notification Channels

**SNS Topic:** `chronos-alerts`
**ARN:** `arn:aws:sns:ca-central-1:314758835721:chronos-alerts`

**Subscribers:**
- `geoff@automatonicai.com` (Email)
- `axiologycapital@gmail.com` (Email)

### Managing Subscriptions
To subscribe a new email address:
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:ca-central-1:314758835721:chronos-alerts \
  --protocol email \
  --notification-endpoint NEW_EMAIL@EXAMPLE.COM
```
*Note: The recipient must click the "Confirm subscription" link in the email they receive.*

### 🖥️ How to View in AWS Console
1.  Log in to the **AWS Management Console** (via SSO).
2.  Navigate to **CloudWatch** (search for it in the top bar).
3.  In the left sidebar, click **All alarms**.
4.  You will see `chronos-production-db-cpu-high` and `chronos-production-db-status-failed`.
5.  Click on an alarm name to see the graph and history.

---

## 📊 Active Alarms

### 1. High CPU Utilization
- **Alarm Name:** `chronos-production-db-cpu-high`
- **Metric:** `CPUUtilization` (AWS/Lightsail)
- **Threshold:** > 80%
- **Period:** 15 minutes (3 evaluation periods of 5 minutes)
- **Action:** Send email to `chronos-alerts` topic

### 2. Instance Status Check Failure
- **Alarm Name:** `chronos-production-db-status-failed`
- **Metric:** `StatusCheckFailed` (AWS/Lightsail)
- **Threshold:** >= 1 (Failure)
- **Period:** 1 minute
- **Action:** Send email to `chronos-alerts` topic

---

## 🧪 Testing Alarms

You can manually simulate an ALARM state to verify notifications are working:

```bash
# Trigger ALARM state
aws cloudwatch set-alarm-state \
  --alarm-name "chronos-production-db-cpu-high" \
  --state-value ALARM \
  --state-reason "Testing email notifications"

# Revert to OK state
aws cloudwatch set-alarm-state \
  --alarm-name "chronos-production-db-cpu-high" \
  --state-value OK \
  --state-reason "Testing complete"
```

---

## ❓ Troubleshooting

### "I'm not receiving emails"
1. **Check Subscription Status:**
   ```bash
   aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:ca-central-1:314758835721:chronos-alerts
   ```
   If status is `PendingConfirmation`, check your inbox/spam folder and click the confirmation link.

2. **Check Alarm State:**
   ```bash
   aws cloudwatch describe-alarms --alarm-names chronos-production-db-cpu-high
   ```

### "Disk Usage Alarm is missing"
Lightsail does not report disk usage percentage to CloudWatch by default. This requires installing the CloudWatch Agent on the instance, which is a future enhancement (Phase 4+).

---

## 📚 References
- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS Lightsail Metrics](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-resource-health-metrics.html)
