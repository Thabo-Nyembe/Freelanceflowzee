# KAZI Email Marketing - Backend Complete

## Overview

World-class email marketing infrastructure with multi-provider support, sophisticated automation workflows, comprehensive event tracking, A/B testing, and production-grade analytics.

## Architecture

```
lib/email/
├── email-service.ts            # Email provider abstraction
├── automation-engine.ts        # Workflow automation engine
├── event-tracking-service.ts   # Event tracking & webhooks
├── campaign-sender-service.ts  # Campaign sending infrastructure
└── email-analytics-service.ts  # Analytics & reporting

app/api/email-marketing/
├── campaigns/route.ts          # Campaign management API
├── automations/route.ts        # Automation workflow API
├── analytics/route.ts          # Analytics & reporting API
├── webhooks/route.ts           # Provider webhook handling
└── tracking/route.ts           # Open & click tracking

supabase/migrations/
└── 20251211000003_email_marketing_tables.sql  # 14+ tables
```

## Services Implemented

### 1. Email Service (`lib/email/email-service.ts`)

Multi-provider email sending with intelligent features.

**Supported Providers:**
- Resend
- SendGrid
- Mock (for testing)
- Extensible adapter pattern

**Features:**
```typescript
const emailService = new EmailService({
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY!,
  defaultFrom: { name: 'KAZI', email: 'noreply@kazi.com' },
  rateLimit: { maxPerSecond: 10, maxPerMinute: 100 },
  retryConfig: { maxRetries: 3, initialDelayMs: 1000 }
})

// Send single email
await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome to KAZI',
  html: '<h1>Welcome!</h1>',
  tags: ['welcome', 'onboarding']
})

// Send batch
await emailService.sendBatch(messages)

// Template rendering with mustache syntax
const html = emailService.renderTemplate(template, { firstName: 'John' })

// Add tracking
const trackedHtml = emailService.addTracking(html, messageId, subscriberId)
```

**Rate Limiting:**
- Token bucket algorithm
- Configurable per-second and per-minute limits
- Automatic queuing and backoff

**Retry Logic:**
- Exponential backoff
- Configurable max retries
- Error classification

### 2. Automation Engine (`lib/email/automation-engine.ts`)

Sophisticated workflow automation for email sequences.

**Trigger Types:**
- `subscriber_added` - New subscriber
- `tag_added` / `tag_removed` - Tag changes
- `field_updated` - Custom field changes
- `email_opened` / `email_clicked` - Engagement
- `link_clicked` - Specific link clicks
- `form_submitted` - Form submissions
- `purchase_made` - E-commerce
- `cart_abandoned` - Abandoned carts
- `date_based` - Birthdays, anniversaries
- `segment_entered` / `segment_exited` - Segment changes
- `custom_event` - API triggers

**Action Types:**
- `send_email` - Send email with A/B testing
- `wait` - Time delay
- `wait_until` - Wait for condition
- `condition` - If/then branching
- `split` - Random or conditional splits
- `add_tag` / `remove_tag` - Tag management
- `update_field` - Update subscriber data
- `move_to_list` - List management
- `webhook` - External webhooks
- `notify_team` - Team notifications
- `score_lead` - Lead scoring
- `goto_step` - Loops (with max iterations)
- `end_automation` - Exit workflow

**Advanced Features:**
```typescript
const engine = new AutomationEngine({
  batchSize: 100,
  processingIntervalMs: 10000,
  maxConcurrent: 10,
  maxRetries: 3
})

// Create automation
const automation = await engine.createAutomation(userId, {
  name: 'Welcome Series',
  triggers: [{
    type: 'subscriber_added',
    config: { listId: 'welcome-list' }
  }],
  steps: [
    { type: 'send_email', config: { emailId: 'welcome-1' } },
    { type: 'wait', config: { duration: 2, unit: 'days' } },
    { type: 'condition', config: { condition: { field: 'opened', operator: 'equals', value: true } } },
    // ... more steps
  ],
  settings: {
    allowReEntry: false,
    exitOnUnsubscribe: true,
    goal: { condition: { field: 'purchased', operator: 'equals', value: true } }
  }
})

// A/B Testing in automations
{
  type: 'send_email',
  config: {
    abTest: {
      enabled: true,
      variants: [
        { id: 'a', weight: 50, subject: 'Subject A' },
        { id: 'b', weight: 50, subject: 'Subject B' }
      ],
      winnerCriteria: 'open_rate',
      testDuration: 24
    }
  }
}

// Send time optimization
{
  sendTimeOptimization: {
    enabled: true,
    timezone: 'subscriber',
    optimalWindow: { start: 9, end: 18 }
  }
}
```

### 3. Event Tracking Service (`lib/email/event-tracking-service.ts`)

Comprehensive event tracking with webhook processing.

**Tracked Events:**
- `sent` - Email sent to provider
- `delivered` - Confirmed delivery
- `deferred` - Temporary failure
- `bounced` - Permanent/temporary bounce
- `dropped` - Rejected by provider
- `opened` - Email opened
- `clicked` - Link clicked
- `unsubscribed` - Unsubscribe action
- `complained` - Spam complaint
- `converted` - Conversion tracked
- `replied` - Reply received

**Webhook Support:**
- Resend
- SendGrid
- Postmark
- Mailgun
- AWS SES
- Custom webhooks

**Features:**
```typescript
// Record events
await eventTrackingService.recordOpen({
  messageId: 'msg_123',
  subscriberId: 'sub_456',
  campaignId: 'cmp_789',
  userId: 'user_abc',
  ipAddress: '1.2.3.4',
  userAgent: 'Mozilla/5.0...'
})

// Process provider webhooks
await eventTrackingService.processWebhook({
  provider: 'sendgrid',
  signature: 'xxx',
  events: [...]
})

// Query events
const events = await eventTrackingService.getEventsBySubscriber(subscriberId, {
  types: ['opened', 'clicked'],
  since: new Date('2024-01-01'),
  limit: 100
})

// Campaign stats
const stats = await eventTrackingService.getCampaignStats(campaignId)
```

### 4. Campaign Sender Service (`lib/email/campaign-sender-service.ts`)

Production-grade campaign sending infrastructure.

**Features:**
- Recipient list building with filters
- List/segment/tag targeting
- Exclusion rules
- Email deduplication
- Batch sending with throttling
- A/B testing
- Send time optimization
- Progress tracking
- Pause/resume capability
- Automatic retries

**Usage:**
```typescript
// Create campaign
const campaign = await campaignSenderService.createCampaign(userId, {
  name: 'Summer Sale',
  subject: 'Exclusive Summer Deals!',
  fromName: 'KAZI Store',
  fromEmail: 'sales@kazi.com',
  content: { htmlBody: '<h1>Summer Sale!</h1>...' },
  recipients: {
    type: 'segment',
    segmentIds: ['active-customers'],
    suppressUnsubscribed: true,
    suppressBounced: true
  },
  sendOptions: {
    trackOpens: true,
    trackClicks: true,
    throttling: { enabled: true, emailsPerHour: 5000 },
    googleAnalytics: {
      enabled: true,
      utmSource: 'email',
      utmMedium: 'campaign',
      utmCampaign: 'summer-sale-2024'
    }
  }
})

// Build recipient list
const { count, estimatedTime } = await campaignSenderService.buildRecipientList(campaign)

// Send campaign
const progress = await campaignSenderService.sendCampaign(campaignId)

// Track progress
const currentProgress = campaignSenderService.getSendProgress(campaignId)
// { status: 'sending', total: 10000, sent: 5432, progress: 54.32 }

// A/B Testing
await campaignSenderService.getVariantStats(campaignId)
await campaignSenderService.selectABTestWinner(campaignId, 'variant_a')
```

### 5. Analytics Service (`lib/email/email-analytics-service.ts`)

Comprehensive analytics and reporting.

**Metrics:**
- Overview metrics with trends
- Time series data (hourly/daily/weekly/monthly)
- Campaign performance
- Link performance
- Device breakdown
- Geographic distribution
- Hourly heatmaps
- Subscriber metrics
- Engagement cohorts
- Deliverability metrics
- Automation performance

**Usage:**
```typescript
// Overview metrics
const metrics = await emailAnalyticsService.getOverviewMetrics(userId, {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
})
// {
//   totalSent: 50000,
//   openRate: 24.5,
//   clickRate: 3.2,
//   deliverabilityScore: 95,
//   engagementScore: 72,
//   openRateTrend: +2.3,
//   ...
// }

// Time series
const timeSeries = await emailAnalyticsService.getTimeSeriesData(userId, dateRange, 'day')

// Campaign details
const details = await emailAnalyticsService.getCampaignDetails(campaignId)
// { performance, links, devices, geo, hourlyActivity }

// Subscriber cohorts
const cohorts = await emailAnalyticsService.getEngagementCohorts(userId)
// [
//   { cohortName: 'Highly Engaged', count: 5000, percentage: 25 },
//   { cohortName: 'At Risk', count: 2000, percentage: 10 },
//   ...
// ]

// Generate report
const report = await emailAnalyticsService.generateReport(userId, {
  name: 'Q4 Email Performance',
  type: 'overview',
  dateRange: { start, end },
  granularity: 'week',
  metrics: ['sent', 'opened', 'clicked', 'converted']
})
```

## Database Schema

### Tables Created (14 tables):

1. **email_subscribers** - Subscriber management
2. **email_lists** - List management
3. **subscriber_lists** - List memberships
4. **email_tags** - Tag management
5. **subscriber_tags** - Tag assignments
6. **email_templates** - Email templates
7. **email_campaigns** - Campaign data
8. **email_automations** - Automation workflows
9. **subscriber_automation_states** - Automation progress
10. **email_send_queue** - Sending queue
11. **email_events** - Event tracking
12. **email_daily_aggregates** - Daily stats
13. **email_reports** - Generated reports
14. **email_provider_configs** - Provider settings

### Helper Functions:
- `increment_campaign_stat()`
- `update_subscriber_engagement()`
- `upsert_daily_event_aggregate()`
- `increment_automation_stat()`
- `decrement_automation_stat()`
- `update_automation_average_time()`

## API Endpoints

### Campaigns API
```
GET  /api/email-marketing/campaigns
POST /api/email-marketing/campaigns
  - action: create | schedule | send | pause | resume | cancel | build_recipients | select_winner | get_variant_stats
PUT  /api/email-marketing/campaigns
```

### Automations API
```
GET  /api/email-marketing/automations
POST /api/email-marketing/automations
  - action: create | activate | pause | archive | trigger | enter
PUT  /api/email-marketing/automations
```

### Analytics API
```
GET  /api/email-marketing/analytics?type=overview|timeseries|campaigns|campaign_details|links|devices|geo|hourly|subscribers|cohorts|deliverability|automations
POST /api/email-marketing/analytics
  - action: generate_report | get_report_history
```

### Webhooks API
```
GET  /api/email-marketing/webhooks?provider=sendgrid|postmark|mailgun|resend|ses
POST /api/email-marketing/webhooks?provider=sendgrid|postmark|mailgun|resend|ses
```

### Tracking API
```
GET /api/email-marketing/tracking?t=o&d=<encoded_data>  # Open tracking pixel
GET /api/email-marketing/tracking?t=c&d=<encoded_data>&u=<url>  # Click tracking
```

## Key Features Summary

| Feature | Status |
|---------|--------|
| Multi-provider support | ✅ Implemented |
| Rate limiting | ✅ Implemented |
| Retry logic | ✅ Implemented |
| Template rendering | ✅ Implemented |
| Open tracking | ✅ Implemented |
| Click tracking | ✅ Implemented |
| Automation workflows | ✅ Implemented |
| Conditional logic | ✅ Implemented |
| A/B testing | ✅ Implemented |
| Send time optimization | ✅ Implemented |
| Subscriber segmentation | ✅ Implemented |
| Tag management | ✅ Implemented |
| List management | ✅ Implemented |
| Webhook processing | ✅ Implemented |
| Deliverability monitoring | ✅ Implemented |
| Engagement scoring | ✅ Implemented |
| Cohort analysis | ✅ Implemented |
| Report generation | ✅ Implemented |
| Real-time analytics | ✅ Implemented |

## Integration with Existing KAZI Features

The email marketing system integrates with:
- **Client Management**: Send personalized emails to clients
- **Project Management**: Automated project status updates
- **Invoicing**: Payment reminder emails
- **Team Hub**: Team notification emails
- **Bookings**: Appointment confirmation emails
- **Escrow**: Transaction notification emails

## Environment Variables Required

```env
# Email Providers
RESEND_API_KEY=
SENDGRID_API_KEY=
POSTMARK_API_KEY=
MAILGUN_API_KEY=

# Webhook Secrets
RESEND_WEBHOOK_SECRET=
SENDGRID_WEBHOOK_SECRET=
POSTMARK_WEBHOOK_SECRET=
MAILGUN_WEBHOOK_SECRET=

# Tracking Domain (optional)
EMAIL_TRACKING_DOMAIN=https://track.yourdomain.com
```

## Build Status

✅ **All services compile without errors**
