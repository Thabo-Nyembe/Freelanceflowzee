# 📊 MONITORING VERIFICATION CHECKLIST

**Purpose:** Verify all monitoring services are properly configured and receiving data from production.

**When to use:** After Phase 1 deployment, verify monitoring is working correctly.

---

## 🎯 PRE-DEPLOYMENT SETUP

### 1. Sentry Error Tracking

**Account Setup:**
- [ ] Sentry account created at https://sentry.io
- [ ] Organization created
- [ ] Project created (name: "ai-create" or "kazi-platform")
- [ ] DSN obtained

**Configuration:**
- [ ] `NEXT_PUBLIC_SENTRY_DSN` added to `.env.production`
- [ ] `SENTRY_ORG` added to `.env.production`
- [ ] `SENTRY_PROJECT` added to `.env.production`
- [ ] `SENTRY_AUTH_TOKEN` added to `.env.production` (for source maps)

**Files to Create:**
- [ ] `sentry.client.config.ts` in root
- [ ] `sentry.server.config.ts` in root
- [ ] `sentry.edge.config.ts` in root

**Verification:**
```bash
# Test error capture
curl -X POST http://localhost:9323/api/test-sentry

# Check Sentry dashboard
# Should see test error within 1 minute
```

**Success Criteria:**
- [ ] Test error appears in Sentry dashboard
- [ ] Source maps uploaded (code snippets visible)
- [ ] Release tag correct
- [ ] Environment set to "production"

---

### 2. LogRocket Session Replay

**Account Setup:**
- [ ] LogRocket account created at https://logrocket.com
- [ ] App created (name: "AI Create")
- [ ] App ID obtained

**Configuration:**
- [ ] `NEXT_PUBLIC_LOGROCKET_APP_ID` added to `.env.production`

**Files to Create:**
- [ ] `lib/logrocket-init.ts` (initialization file)

**Code Integration:**
- [ ] LogRocket.init() called in app layout
- [ ] Sentry integration configured
- [ ] Privacy settings configured (input sanitization)

**Verification:**
```bash
# After deployment, visit your site
# Open browser console and check for:
# "LogRocket initialized"

# Then check LogRocket dashboard
```

**Success Criteria:**
- [ ] Sessions appearing in LogRocket dashboard
- [ ] Session recordings playable
- [ ] Sensitive data masked
- [ ] Sentry errors linked to sessions

---

### 3. Google Analytics

**Account Setup:**
- [ ] Google Analytics account created
- [ ] Property created (name: "KAZI Platform")
- [ ] Data stream created (Web)
- [ ] Measurement ID obtained (format: G-XXXXXXXXXX)

**Configuration:**
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` added to `.env.production`

**Code Integration:**
- [ ] GoogleAnalytics component added to layout
- [ ] Custom events configured (lib/analytics.ts)

**Verification:**
```bash
# After deployment, visit your site
# Open Google Analytics Real-Time view
# Should see active user within 30 seconds
```

**Success Criteria:**
- [ ] Real-time user appears
- [ ] Page views tracked
- [ ] Custom events firing (AI generation, feature usage)
- [ ] User demographics visible

---

### 4. Vercel Analytics (if using Vercel)

**Setup:**
- [ ] Vercel project linked
- [ ] Analytics enabled in Vercel dashboard

**Configuration:**
- [ ] `@vercel/analytics` package installed
- [ ] Analytics component added to layout

**Verification:**
```bash
# Visit site after deployment
# Check Vercel dashboard -> Analytics
```

**Success Criteria:**
- [ ] Page views appearing
- [ ] Core Web Vitals tracking
- [ ] Performance metrics visible

---

### 5. Uptime Monitoring

**UptimeRobot Setup:**
- [ ] Account created at https://uptimerobot.com
- [ ] HTTP(s) monitor created
- [ ] URL: https://yourdomain.com/api/health
- [ ] Check interval: 5 minutes
- [ ] Alert contacts: Email, SMS, Slack

**Pingdom Setup (Alternative):**
- [ ] Account created at https://www.pingdom.com
- [ ] Uptime check created
- [ ] URL: https://yourdomain.com
- [ ] Check interval: 1 minute

**Verification:**
```bash
# Manually check health endpoint
curl https://yourdomain.com/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":...}
```

**Success Criteria:**
- [ ] Monitor status: UP
- [ ] Response time < 1000ms
- [ ] Alerts configured
- [ ] Test alert sent successfully

---

## 📋 POST-DEPLOYMENT VERIFICATION

### Immediate Checks (First 5 Minutes)

**1. Error Tracking (Sentry)**
```bash
# Check Sentry dashboard
# Navigate to: Issues -> [Your Project]
```

- [ ] No critical errors
- [ ] Error rate < 0.1%
- [ ] Source maps working (code visible)
- [ ] Releases tagged correctly

**2. Session Replay (LogRocket)**
```bash
# Check LogRocket dashboard
# Navigate to: Sessions
```

- [ ] At least 1 session recorded (yours)
- [ ] Session playback works
- [ ] Console logs visible
- [ ] Network requests visible

**3. Analytics (Google Analytics)**
```bash
# Check GA Real-Time
# Navigate to: Reports -> Realtime
```

- [ ] Active users showing
- [ ] Page views incrementing
- [ ] Events firing (if you trigger any)

**4. Uptime (UptimeRobot/Pingdom)**
```bash
# Check monitor dashboard
```

- [ ] Status: UP
- [ ] Last check: < 5 minutes ago
- [ ] Response time: < 1000ms

---

### First Hour Checks

**Error Rate:**
- [ ] Check Sentry: Issues count
- [ ] Target: < 10 errors in first hour
- [ ] No critical errors

**Performance:**
- [ ] Check Vercel/GA: Page load times
- [ ] LCP: < 2.5s (75th percentile)
- [ ] FID: < 100ms
- [ ] CLS: < 0.1

**User Activity:**
- [ ] Check GA: Real-time users
- [ ] Check LogRocket: Session count
- [ ] At least some organic traffic (if not private beta)

---

### First Day Checks

**Error Trends:**
- [ ] Sentry: Review all errors
- [ ] Categorize by severity
- [ ] Create tickets for critical/high
- [ ] Document known issues

**Performance Trends:**
- [ ] GA: Average page load time
- [ ] Vercel: Core Web Vitals
- [ ] Any degradation from staging?

**User Behavior:**
- [ ] GA: Top pages visited
- [ ] LogRocket: Common user flows
- [ ] AI Create usage: Generation count
- [ ] Feature adoption: Which features used most

**Uptime:**
- [ ] Check uptime %
- [ ] Target: > 99.9%
- [ ] Review any downtime incidents

---

## 🚨 ALERT VERIFICATION

### Trigger Test Alerts

**1. Sentry Error Alert**
```bash
# Trigger test error
curl -X POST http://localhost:9323/api/trigger-test-error

# Verify:
# - Email received within 5 minutes
# - Slack notification (if configured)
```

**2. Performance Alert (if configured)**
```bash
# Simulate slow response
# Check if alert fires for response time > threshold
```

**3. Uptime Alert**
```bash
# Temporarily break health endpoint
# Or pause server
# Verify alert received
```

---

## 📊 MONITORING DASHBOARD SETUP

### Create Custom Dashboard

**Sentry Dashboard:**
- [ ] Add "Error Rate" widget
- [ ] Add "Response Time" widget
- [ ] Add "Top Errors" widget
- [ ] Add "Affected Users" widget

**Google Analytics Dashboard:**
- [ ] Add "Active Users" card
- [ ] Add "Page Views" chart
- [ ] Add "AI Generations" event chart
- [ ] Add "Feature Usage" breakdown

**Custom Monitoring Dashboard:**
```bash
# Create simple HTML dashboard
# Display metrics from all sources
# Update every 5 minutes
```

Components to display:
- [ ] Error rate (Sentry)
- [ ] Active users (GA)
- [ ] Response time (Uptime monitor)
- [ ] AI generation count (Custom)
- [ ] Storage usage (Custom)

---

## ✅ FINAL MONITORING CHECKLIST

### All Systems Operational

- [ ] Sentry: Receiving errors
- [ ] LogRocket: Recording sessions
- [ ] Google Analytics: Tracking pageviews
- [ ] Vercel Analytics: Showing metrics
- [ ] Uptime Monitor: Status UP
- [ ] Alerts: All tested and working
- [ ] Dashboard: Created and accessible
- [ ] Team: Has access to all tools

### Documentation

- [ ] Monitoring URLs documented
- [ ] Login credentials shared (securely)
- [ ] Alert thresholds documented
- [ ] Escalation procedures defined
- [ ] Dashboard access granted to team

### Ongoing Monitoring Plan

- [ ] Daily: Check dashboard for anomalies
- [ ] Weekly: Review error trends
- [ ] Monthly: Analyze performance trends
- [ ] Quarterly: Audit monitoring coverage

---

## 📞 MONITORING TOOL CONTACTS

**Sentry:**
- Dashboard: https://sentry.io
- Support: support@sentry.io
- Docs: https://docs.sentry.io

**LogRocket:**
- Dashboard: https://app.logrocket.com
- Support: support@logrocket.com
- Docs: https://docs.logrocket.com

**Google Analytics:**
- Dashboard: https://analytics.google.com
- Support: https://support.google.com/analytics
- Docs: https://developers.google.com/analytics

**UptimeRobot:**
- Dashboard: https://uptimerobot.com
- Support: contact@uptimerobot.com
- Docs: https://blog.uptimerobot.com

---

## 🎯 SUCCESS CRITERIA

### Monitoring is Fully Operational When:

✅ All 5 monitoring services configured and receiving data
✅ Test alerts successfully delivered
✅ Dashboard created and accessible
✅ Team trained on monitoring tools
✅ Error rate < 0.1% in first 24 hours
✅ Uptime > 99.9% in first week
✅ No blind spots in monitoring coverage

---

**Last Updated:** November 22, 2025
**Next Review:** After Phase 1 Day 1

---

**END OF MONITORING VERIFICATION CHECKLIST**
