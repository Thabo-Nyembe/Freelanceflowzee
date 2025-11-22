# 📊 AI CREATE - MONITORING & ERROR TRACKING SETUP

**Version:** Phase 2C (v2.2.0)
**Last Updated:** November 22, 2025

---

## 🎯 OVERVIEW

This document provides step-by-step instructions for setting up monitoring, error tracking, and analytics for AI Create in production.

---

## 1. SENTRY ERROR TRACKING

### Installation

```bash
npm install --save @sentry/nextjs
```

### Configuration

**sentry.client.config.ts** (create in root):

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: `ai-create@${process.env.npm_package_version}`,

  // Tracing
  tracesSampleRate: 0.1, // 10% of transactions

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive data from AI prompts
    if (event.request?.data) {
      delete event.request.data.prompt
      delete event.request.data.apiKey
    }
    return event
  },

  // Ignore known errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'QuotaExceededError', // localStorage quota
  ],
})
```

**sentry.server.config.ts** (create in root):

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: `ai-create@${process.env.npm_package_version}`,
  tracesSampleRate: 0.1,
})
```

**sentry.edge.config.ts** (create in root):

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

**next.config.js** (add Sentry webpack plugin):

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // ... existing config
}

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
)
```

### Environment Variables

Add to `.env.production`:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-organization
SENTRY_PROJECT=ai-create
```

### Usage in Code

**Automatic Error Capture:**
```typescript
// Errors are automatically captured by Sentry
throw new Error('Something went wrong')
```

**Manual Error Tracking:**
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  await generateAIContent()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      feature: 'ai-create',
      model: selectedModel
    },
    extra: {
      promptLength: prompt.length,
      temperature: temperature
    }
  })
}
```

**Performance Monitoring:**
```typescript
import * as Sentry from '@sentry/nextjs'

const transaction = Sentry.startTransaction({
  name: 'AI Content Generation',
  op: 'ai.generate'
})

try {
  const result = await generateContent()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}
```

---

## 2. LOGROCKET SESSION REPLAY

### Installation

```bash
npm install --save logrocket
npm install --save logrocket-react
```

### Configuration

**lib/logrocket-init.ts** (create):

```typescript
import LogRocket from 'logrocket'

export function initLogRocket() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
    LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID, {
      // Privacy controls
      dom: {
        inputSanitizer: true, // Sanitize input values
        textSanitizer: true,  // Sanitize text content
      },

      // Network
      network: {
        requestSanitizer: (request) => {
          // Remove sensitive headers
          if (request.headers['Authorization']) {
            request.headers['Authorization'] = '[REDACTED]'
          }

          // Remove API keys from body
          if (request.body) {
            request.body = request.body.replace(/sk-[a-zA-Z0-9]+/g, '[API_KEY]')
          }

          return request
        },
      },

      // Console logs
      console: {
        shouldAggregateConsoleErrors: true,
      },

      // Performance
      shouldCaptureIP: false,
      shouldDebugLog: false,
    })
  }
}

export function identifyUser(userId: string, userData?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    LogRocket.identify(userId, userData)
  }
}
```

**app/layout.tsx** (add to root layout):

```typescript
'use client'

import { useEffect } from 'react'
import { initLogRocket } from '@/lib/logrocket-init'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initLogRocket()
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Integration with Sentry

```typescript
import LogRocket from 'logrocket'
import * as Sentry from '@sentry/nextjs'

// Link LogRocket session to Sentry
LogRocket.getSessionURL((sessionURL) => {
  Sentry.configureScope((scope) => {
    scope.setExtra('sessionURL', sessionURL)
  })
})
```

---

## 3. GOOGLE ANALYTICS

### Installation

```bash
npm install --save @next/third-parties
```

### Configuration

**app/layout.tsx**:

```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
      </body>
    </html>
  )
}
```

### Custom Events

**lib/analytics.ts** (create):

```typescript
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// AI Create specific events
export const trackAIGeneration = (model: string, tokens: number, cost: number) => {
  trackEvent('generate', 'AI Create', model, tokens)

  // Track cost separately
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `gen-${Date.now()}`,
      value: cost,
      currency: 'USD',
      items: [{
        item_name: 'AI Generation',
        item_category: model,
        quantity: 1,
        price: cost,
      }],
    })
  }
}

export const trackFeatureUsage = (feature: string) => {
  trackEvent('use_feature', 'AI Create', feature)
}

export const trackError = (error: string, fatal: boolean) => {
  trackEvent('error', 'AI Create', error, fatal ? 1 : 0)
}
```

**Usage in Components:**

```typescript
import { trackAIGeneration, trackFeatureUsage } from '@/lib/analytics'

// Track generation
const handleGenerate = async () => {
  const result = await generateContent()
  trackAIGeneration(selectedModel, result.tokens, result.cost)
}

// Track feature usage
const handleCompare = () => {
  trackFeatureUsage('model-comparison')
  // ... comparison logic
}
```

---

## 4. VERCEL ANALYTICS

### Installation

```bash
npm install --save @vercel/analytics
```

### Configuration

**app/layout.tsx**:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Speed Insights

```bash
npm install --save @vercel/speed-insights
```

**app/layout.tsx**:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 5. CUSTOM METRICS DASHBOARD

### Health Check Endpoint

**app/api/health/route.ts** (create):

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
    },
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  }

  return NextResponse.json(health)
}
```

### Metrics Endpoint

**app/api/metrics/route.ts** (create):

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  // Collect metrics from various sources
  const metrics = {
    timestamp: new Date().toISOString(),

    // AI Create specific metrics
    aiCreate: {
      totalGenerations: await getTotalGenerations(),
      activeUsers: await getActiveUsers(),
      averageResponseTime: await getAverageResponseTime(),
      errorRate: await getErrorRate(),
    },

    // System metrics
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
  }

  return NextResponse.json(metrics)
}

// Helper functions (implement based on your data source)
async function getTotalGenerations() {
  // Query your analytics database
  return 0
}

async function getActiveUsers() {
  // Query your analytics database
  return 0
}

async function getAverageResponseTime() {
  // Calculate from recent generations
  return 0
}

async function getErrorRate() {
  // Calculate from error logs
  return 0
}
```

---

## 6. UPTIME MONITORING

### UptimeRobot Configuration

1. Sign up at https://uptimerobot.com
2. Create HTTP(S) monitor
3. Configure:
   - Monitor Type: HTTP(S)
   - URL: https://yourdomain.com/api/health
   - Interval: 5 minutes
   - Alert Contacts: email, SMS, Slack

### Pingdom Configuration

1. Sign up at https://www.pingdom.com
2. Create uptime check
3. Configure:
   - Check Type: HTTP
   - URL: https://yourdomain.com
   - Check Interval: 1 minute
   - Alert Channels: email, SMS, PagerDuty

---

## 7. ALERT CONFIGURATION

### Sentry Alerts

**Critical Errors:**
- Trigger: Error rate > 1%
- Notification: Email + Slack
- Frequency: Immediate

**Performance Degradation:**
- Trigger: P75 response time > 2s
- Notification: Email
- Frequency: 15 minutes

**High Error Volume:**
- Trigger: >100 errors in 1 hour
- Notification: Slack
- Frequency: 1 hour

### Custom Alerts

**lib/alert-system.ts** (create):

```typescript
export async function sendAlert(
  severity: 'critical' | 'high' | 'medium' | 'low',
  message: string,
  metadata?: Record<string, any>
) {
  const alert = {
    severity,
    message,
    timestamp: new Date().toISOString(),
    metadata,
  }

  // Send to multiple channels
  await Promise.all([
    sendToSlack(alert),
    sendToEmail(alert),
    logToDashboard(alert),
  ])
}

async function sendToSlack(alert: any) {
  // Implement Slack webhook
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `[${alert.severity.toUpperCase()}] ${alert.message}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: Object.entries(alert.metadata || {}).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true,
        })),
      }],
    }),
  })
}

async function sendToEmail(alert: any) {
  // Implement email notification (SendGrid, Resend, etc.)
}

async function logToDashboard(alert: any) {
  // Store in database for dashboard display
}
```

---

## 8. DEPLOYMENT CHECKLIST

Before going live, verify:

- [ ] Sentry DSN configured
- [ ] LogRocket App ID configured
- [ ] Google Analytics ID configured
- [ ] Vercel Analytics enabled
- [ ] Health check endpoint responding
- [ ] Uptime monitoring active
- [ ] Alert channels tested
- [ ] Error tracking tested (trigger test error)
- [ ] Performance monitoring tested
- [ ] Session replay tested

---

## 9. MONITORING DASHBOARD

### Key Metrics to Monitor

**Technical Metrics:**
- Error rate (target: <0.1%)
- Response time P50/P75/P95 (target: <500ms/1s/2s)
- Uptime (target: 99.9%)
- Memory usage (target: <80%)
- CPU usage (target: <70%)

**User Metrics:**
- Active users (daily/weekly/monthly)
- Generation volume
- Feature adoption rate
- Session duration
- Bounce rate

**Business Metrics:**
- Cost per generation
- Revenue per user
- Conversion rate
- Retention rate

### Sample Dashboard Queries

**Sentry - Error Rate:**
```
rate(sentry_errors_total[5m])
```

**LogRocket - Session Count:**
```
logrocket_sessions_total{app="ai-create"}
```

**Custom - Generation Volume:**
```sql
SELECT
  DATE(timestamp) as date,
  COUNT(*) as generations,
  AVG(cost) as avg_cost
FROM ai_generations
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC
```

---

## 10. INCIDENT RESPONSE

### When Alerts Fire

1. **Acknowledge Alert** (1 min)
   - Click alert link
   - Assess severity
   - Notify team

2. **Triage** (5 min)
   - Check Sentry for errors
   - Check LogRocket for user impact
   - Check health endpoint
   - Determine root cause

3. **Mitigate** (15 min)
   - If critical: Rollback immediately
   - If high: Apply hot-fix
   - If medium: Schedule fix

4. **Communicate** (ongoing)
   - Update status page
   - Notify affected users
   - Keep team informed

5. **Post-Mortem** (24-48 hours)
   - Document incident
   - Identify root cause
   - Prevent recurrence

---

## 📞 SUPPORT CONTACTS

**Monitoring Tools:**
- Sentry Support: support@sentry.io
- LogRocket Support: support@logrocket.com
- Vercel Support: support@vercel.com

**Internal Team:**
- Engineering: engineering-oncall@kazi.com
- DevOps: devops-oncall@kazi.com
- Support: support@kazi.com

---

**END OF MONITORING SETUP GUIDE**
