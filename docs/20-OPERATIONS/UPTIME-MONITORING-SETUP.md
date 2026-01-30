# Uptime Monitoring Setup (UptimeRobot)

## Overview

UptimeRobot provides free uptime monitoring with email/SMS alerts when your services go down.

**Free Tier:** 50 monitors, 5-minute checks, email/SMS/Slack/webhook alerts

## Setup Instructions (5 minutes)

### 1. Create Account

1. Go to: https://uptimerobot.com/signup
2. Sign up with email or GitHub
3. Verify email

### 2. Add Monitors

#### Monitor 1: Main Website
- **Name:** Chronos Website
- **URL:** https://automatonicai.com
- **Type:** HTTP(S)
- **Interval:** 5 minutes
- **Alert Contacts:** Your email

#### Monitor 2: API
- **Name:** Chronos API  
- **URL:** https://api.automatonicai.com/health
- **Type:** HTTP(S)
- **Interval:** 5 minutes
- **Alert Contacts:** Your email

#### Monitor 3: Directus Admin
- **Name:** Directus CMS
- **URL:** https://admin.automatonicai.com
- **Type:** HTTP(S)
- **Interval:** 5 minutes
- **Alert Contacts:** Your email

### 3. Configure Alerts

**Email Alerts** (default - included in free tier)
- ✅ Down notifications
- ✅ Up notifications  
- ⏰ Alert after: 1 check (immediate)

**Optional: Slack Integration**
1. Go to: https://api.slack.com/apps
2. Create new app for Slack workspace
3. Add Incoming Webhook
4. Copy webhook URL
5. Add to UptimeRobot as alert contact

### 4. Set Up Public Status Page (Optional)

1. Go to: Status Pages → Add New
2. Create public page: `chronos-status.uptimerobot.com`
3. Add all 3 monitors
4. Enable: 
   - Show uptime percentages
   - Show response times
   - Custom domain (if desired)

**Benefits:**
- Transparent uptime reporting
- Customer trust
- Incident history

## Monitoring Best Practices

### What to Monitor

✅ **Monitor:**
- Homepage (automatonicai.com)
- API health endpoint (api.automatonicai.com/health)
- Admin interface (admin.automatonicai.com)

❌ **Don't Monitor:**
- Internal endpoints
- Development/staging (use separate account)
- Individual API routes (too many monitors)

### Alert Fatigue Prevention

1. **Set reasonable intervals:** 5 min is good balance
2. **Use alert contacts:** Different emails for different severity
3. **Maintenance windows:** Schedule known downtime
4. **Ignore known issues:** Temporarily pause monitors during deploys

### Response Time Thresholds

Configure alerts for slow responses:
- **Website:** Alert if > 3 seconds
- **API:** Alert if > 1 second
- **Admin:** Alert if > 5 seconds

## Dashboard Usage

### Key Metrics to Track

1. **Uptime %**
   - Target: 99.9% (44 min downtime/month)
   - Good: 99.0% (7.3 hours/month)
   - Alert threshold: < 99.0%

2. **Response Time**
   - Website: < 2 seconds
   - API: < 500ms
   - Alert if consistently slow

3. **Incident Frequency**
   - Track patterns (time of day, day of week)
   - Identify systematic issues

### Monthly Review

Check these monthly:
- Total uptime %
- Number of incidents
- Average response time
- Longest downtime

## Integration with Other Tools

### Slack Notifications

```json
{
  "type": "Slack",
  "webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "channel": "#alerts"
}
```

### PagerDuty (If you need on-call rotation)

1. Create PagerDuty account
2. Add integration in UptimeRobot
3. Set escalation policies

**When to use:** Team size > 3, 24/7 support needed

## Cost Projections

### Current (Free Tier)
- 3 monitors
- 5-minute checks
- Email alerts
- **Cost:** $0/month ✅

### If You Need More

| Tier | Monitors | Interval | SMS | Cost |
|------|----------|----------|-----|------|
| Free | 50 | 5 min | 10/month | $0 |
| Pro | 50 | 1 min | 1,000/month | $7/month |
| Plus | 500 | 1 min | Unlimited | $44/month |

**Recommendation:** Free tier is plenty for now.

## Troubleshooting

### False Positives

**Cause:** Temporary network blips, Cloudflare updates

**Solution:**
1. Set "Alert after X checks" to 2 (instead of 1)
2. Ignore alerts < 1 minute duration
3. Check UptimeRobot status: https://status.uptimerobot.com

### Missing Alerts

**Check:**
1. Email in spam folder
2. Alert contacts configured
3. Monitor is active (not paused)
4. UptimeRobot service status

### Slow Response Alerts

**Investigate:**
1. Check Cloudflare analytics
2. Review server logs
3. Test from different locations
4. Check database performance

## Alternative Tools

**If UptimeRobot doesn't work for you:**

1. **Pingdom** - More detailed, $10/month
2. **Better Uptime** - Beautiful UI, $10/month  
3. **Checkly** - Synthetic monitoring, $7/month
4. **StatusCake** - Free tier available

**Why UptimeRobot?**
- Most generous free tier
- Simple setup
- Reliable alerts
- Industry standard

## Next Steps

1. ✅ Sign up: https://uptimerobot.com/signup
2. ✅ Add 3 monitors (website, API, admin)
3. ✅ Configure email alerts
4. ⏳ Test alerts (pause/unpause monitor)
5. ⏳ Set up public status page (optional)

**Time Required:** 5-10 minutes

**Impact:** High - immediate downtime visibility
