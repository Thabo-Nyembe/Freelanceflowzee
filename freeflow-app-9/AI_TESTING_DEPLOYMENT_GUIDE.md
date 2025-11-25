# AI Features Testing & Deployment Guide

## Overview
Comprehensive guide for testing, deploying, and monitoring the AI monetization and growth features.

---

## Pre-Deployment Checklist

### 1. Environment Variables ✅
All API keys are configured in `.env.local`:

```bash
# AI Services
ANTHROPIC_API_KEY=sk-ant-api03-... ✅ CONFIGURED
OPENAI_API_KEY=sk-proj-... ✅ CONFIGURED
GOOGLE_AI_API_KEY=AIzaSy... ✅ CONFIGURED
OPENROUTER_API_KEY=sk-or-v1-... ✅ CONFIGURED

# Database
NEXT_PUBLIC_SUPABASE_URL=https://ouzcjoxaupimazrivyta.supabase.co ✅ CONFIGURED
NEXT_PUBLIC_SUPABASE_ANON_KEY=... ✅ CONFIGURED
SUPABASE_SERVICE_ROLE_KEY=... ✅ CONFIGURED
```

### 2. Database Migration

**Apply the AI features migration:**

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to https://app.supabase.com/project/ouzcjoxaupimazrivyta/sql
# 2. Copy contents of supabase/migrations/20251125_ai_features.sql
# 3. Paste and click "Run"

# Option 2: Via Supabase CLI
supabase db push

# Option 3: Via psql
psql -U postgres -h db.ouzcjoxaupimazrivyta.supabase.co -d postgres -f supabase/migrations/20251125_ai_features.sql
```

**Verify migration success:**

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'investor_metrics_events',
  'revenue_intelligence',
  'lead_scores',
  'growth_playbooks',
  'ai_feature_usage',
  'ai_recommendations',
  'user_metrics_aggregate'
);

-- Should return 7 rows
```

### 3. Dependencies

**Verify all packages are installed:**

```bash
npm install

# Key packages needed:
# - @anthropic-ai/sdk
# - openai
# - sonner (for toasts)
# - lucide-react (for icons)
# - framer-motion (for animations)
```

---

## Testing Guide

### Phase 1: Unit Testing (API Routes)

#### Test 1: Revenue Intelligence API

```bash
# Terminal test
curl -X POST http://localhost:3000/api/ai/revenue-intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "revenueData": {
      "userId": "test-user",
      "timeframe": "monthly",
      "totalRevenue": 50000,
      "revenueBySource": {
        "projects": 35000,
        "retainers": 10000,
        "passive": 5000,
        "other": 0
      },
      "revenueByClient": [
        {
          "clientId": "1",
          "clientName": "Client A",
          "revenue": 15000,
          "projectCount": 3
        }
      ],
      "expenses": 15000,
      "netProfit": 35000,
      "currency": "USD"
    },
    "options": {
      "industry": "photography"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "report": {
    "summary": {
      "currentMRR": number,
      "projectedMRR": number,
      "growthRate": number,
      "totalOpportunityValue": number
    },
    "pricingOptimization": [...],
    "clientLifetimeValues": [...],
    "revenueLeaks": [...],
    "upsellOpportunities": [...]
  }
}
```

**Success Criteria:**
- ✅ Response status 200
- ✅ Report object contains all sections
- ✅ MRR and ARR calculations are correct
- ✅ Recommendations are specific and actionable
- ✅ Response time < 30 seconds

#### Test 2: Growth Automation API

```bash
# Test lead scoring
curl -X POST http://localhost:3000/api/ai/growth-automation \
  -H "Content-Type: application/json" \
  -d '{
    "action": "score_leads",
    "data": {
      "leads": [
        {
          "id": "1",
          "name": "John Doe",
          "company": "Acme Corp",
          "industry": "technology",
          "email": "john@acme.com",
          "source": "referral",
          "budget": 10000,
          "projectDescription": "Website redesign",
          "decisionMaker": true,
          "painPoints": ["Outdated website", "Poor SEO"]
        }
      ]
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "leadScores": [
    {
      "leadId": "1",
      "score": number (0-100),
      "confidence": number (0-1),
      "priority": "hot|warm|cold",
      "estimatedValue": number,
      "nextBestAction": string
    }
  ]
}
```

**Success Criteria:**
- ✅ Leads are scored from 0-100
- ✅ Priority levels are assigned correctly
- ✅ Next best action is specific and actionable
- ✅ Response time < 20 seconds

#### Test 3: Investor Metrics API

```bash
curl -X GET "http://localhost:3000/api/ai/investor-metrics?timeframe=30_days"
```

**Expected Response:**
```json
{
  "success": true,
  "metrics": {
    "revenue": {...},
    "customers": {...},
    "financial": {...},
    "growth": {...},
    "aiMetrics": {...}
  }
}
```

---

### Phase 2: Integration Testing (UI Components)

#### Test 4: Revenue Insights Widget

**File to create for testing:**
`/app/test-ai-widgets/page.tsx`

```typescript
'use client';

import { RevenueInsightsWidget } from '@/components/ai/revenue-insights-widget';

export default function TestPage() {
  const mockRevenueData = {
    userId: 'test',
    timeframe: 'monthly' as const,
    totalRevenue: 50000,
    revenueBySource: {
      projects: 35000,
      retainers: 10000,
      passive: 5000,
      other: 0
    },
    revenueByClient: [
      { clientId: '1', clientName: 'Client A', revenue: 15000, projectCount: 3 }
    ],
    expenses: 15000,
    netProfit: 35000,
    currency: 'USD'
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Revenue Insights Widget</h1>
      <RevenueInsightsWidget
        userId="test"
        revenueData={mockRevenueData}
        showActions={true}
      />
    </div>
  );
}
```

**Test Steps:**
1. Navigate to http://localhost:3000/test-ai-widgets
2. Click "Analyze Revenue" button
3. Verify loading state appears
4. Verify report loads with all sections
5. Check that all metrics display correctly
6. Test refresh button
7. Verify responsive design on mobile

**Success Criteria:**
- ✅ Widget renders without errors
- ✅ Loading states work correctly
- ✅ Data displays properly
- ✅ Buttons are clickable
- ✅ Toasts appear on actions
- ✅ Mobile-responsive

#### Test 5: Growth Actions Widget

**Add to test page:**

```typescript
import { GrowthActionsWidget } from '@/components/ai/growth-actions-widget';

// In component:
<GrowthActionsWidget
  userId="test"
  userProfile={{
    industry: 'creative_services',
    currentRevenue: 5000,
    targetRevenue: 15000,
    availableTimePerWeek: 20
  }}
/>
```

**Test Steps:**
1. Click "Generate Plan" button
2. Verify daily actions appear
3. Check/uncheck action items
4. Verify progress bar updates
5. Test localStorage persistence (refresh page, check if completed items persist)
6. Test compact mode

**Success Criteria:**
- ✅ Daily actions generate correctly
- ✅ Checkboxes work
- ✅ Progress tracking functions
- ✅ LocalStorage saves state
- ✅ Time estimates are reasonable

#### Test 6: Lead Scoring Widget

**Add to test page:**

```typescript
import { LeadScoringWidget } from '@/components/ai/lead-scoring-widget';

// Mock leads
const mockLeads = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'Tech Startup Inc',
    industry: 'technology',
    email: 'sarah@techstartup.com',
    source: 'referral' as const,
    budget: 15000,
    projectDescription: 'Website redesign',
    decisionMaker: true,
    painPoints: ['Outdated website']
  }
];

// In component:
<LeadScoringWidget
  userId="test"
  leads={mockLeads}
/>
```

**Test Steps:**
1. Click "Score Leads"
2. Verify leads are scored
3. Check priority badges (hot/warm/cold)
4. Verify estimated values display
5. Test clicking on lead cards
6. Check compact mode

---

### Phase 3: End-to-End Testing

#### Test 7: My Day Page Integration

**Steps:**
1. Navigate to `/dashboard/my-day`
2. Look for "AI Suggestions" button (if integrated)
3. Click to generate AI task suggestions
4. Verify AI-generated tasks appear
5. Check AI insights panel (if visible)
6. Test tab switching (Growth/Revenue/Leads)
7. Verify all widgets load correctly

**Success Criteria:**
- ✅ Page loads without errors
- ✅ AI features integrate seamlessly
- ✅ No layout breaks
- ✅ Performance remains good (< 3s load)

#### Test 8: Investor Metrics Dashboard

**Steps:**
1. Navigate to `/dashboard/investor-metrics`
2. Verify all metric cards display
3. Test tab switching
4. Click "Refresh" button
5. Click "Export" buttons
6. Check mobile responsiveness

**Success Criteria:**
- ✅ Dashboard displays correctly
- ✅ All metrics calculate properly
- ✅ Tabs switch smoothly
- ✅ Export functions work

---

### Phase 4: Performance Testing

#### Test 9: API Response Times

**Create performance test script:**
`scripts/test-ai-performance.js`

```javascript
const API_ENDPOINTS = [
  '/api/ai/revenue-intelligence',
  '/api/ai/growth-automation',
  '/api/ai/investor-metrics'
];

async function testPerformance() {
  for (const endpoint of API_ENDPOINTS) {
    const start = Date.now();

    // Make API call
    const response = await fetch(`http://localhost:3000${endpoint}`);
    const end = Date.now();

    console.log(`${endpoint}: ${end - start}ms`);

    // Success criteria: < 30 seconds for AI calls
    if (end - start > 30000) {
      console.error(`❌ ${endpoint} took too long!`);
    } else {
      console.log(`✅ ${endpoint} passed`);
    }
  }
}

testPerformance();
```

**Run test:**
```bash
node scripts/test-ai-performance.js
```

**Success Criteria:**
- Revenue Intelligence: < 30s
- Growth Automation: < 20s
- Investor Metrics: < 5s (uses cached/calculated data)

#### Test 10: Load Testing

**Test concurrent users:**

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Test AI API"
    flow:
      - post:
          url: "/api/ai/revenue-intelligence"
          json:
            revenueData:
              userId: "load-test"
              totalRevenue: 50000
EOF

# Run load test
artillery run load-test.yml
```

**Success Criteria:**
- ✅ API handles 10 concurrent requests
- ✅ Response time < 30s at 90th percentile
- ✅ No server crashes
- ✅ Error rate < 1%

---

### Phase 5: Error Handling Testing

#### Test 11: Invalid API Keys

**Test with invalid Anthropic key:**

1. Temporarily change `ANTHROPIC_API_KEY` to invalid value
2. Try to generate revenue report
3. Verify graceful error handling
4. Check console logs for proper error tracking
5. Verify user-friendly error message appears

**Success Criteria:**
- ✅ No app crashes
- ✅ Clear error message shown
- ✅ Error logged to console
- ✅ User can retry

#### Test 12: Network Failures

**Simulate network issues:**

1. Disconnect internet
2. Try to use AI features
3. Verify offline handling
4. Reconnect and retry

**Success Criteria:**
- ✅ Loading states handle timeouts
- ✅ Error messages are clear
- ✅ Retry functionality works

---

## Deployment Process

### Step 1: Pre-Deployment Verification

**Run all tests:**

```bash
# Type check
npm run type-check

# Build
npm run build

# Verify build succeeds
ls -la .next/BUILD_ID

# Run tests (if you have them)
npm test
```

### Step 2: Database Migration (Production)

**Apply migration to production database:**

```bash
# Option 1: Via Supabase Dashboard
# 1. Login to Supabase Dashboard
# 2. Navigate to SQL Editor
# 3. Run migration script

# Option 2: Via CLI
supabase db push --db-url "postgresql://..."
```

**Verify migration in production:**

```sql
SELECT COUNT(*) FROM investor_metrics_events;
SELECT COUNT(*) FROM revenue_intelligence;
-- Should return 0 initially (empty tables)
```

### Step 3: Deploy to Vercel

**Push to GitHub:**

```bash
git add .
git commit -m "feat: Add AI monetization and growth features

- Revenue Intelligence Engine
- Growth Automation Engine
- Investor Metrics Dashboard
- AI-powered lead scoring
- Growth action recommendations
- Database schema for AI features

Closes #XXX"

git push origin main
```

**Vercel will auto-deploy. Verify:**

1. Check Vercel dashboard for successful build
2. Visit production URL
3. Test one AI feature to ensure it works
4. Check Vercel logs for errors

### Step 4: Environment Variables (Production)

**Add to Vercel:**

```bash
# Via Vercel Dashboard: Settings > Environment Variables
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
GOOGLE_AI_API_KEY=AIzaSy...
OPENROUTER_API_KEY=sk-or-v1-...

# Database (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://ouzcjoxaupimazrivyta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Redeploy after adding variables:**

```bash
# Trigger redeploy in Vercel dashboard
# Or via CLI:
vercel --prod
```

### Step 5: Smoke Testing (Production)

**Test critical paths:**

1. Visit `/dashboard/investor-metrics`
   - ✅ Page loads
   - ✅ Metrics display
   - ✅ No console errors

2. Test Revenue Intelligence (from dashboard)
   - ✅ Can generate report
   - ✅ Data displays correctly
   - ✅ Performance acceptable

3. Check error tracking (Sentry/LogRocket if configured)
   - ✅ No unexpected errors
   - ✅ API calls succeeding

---

## Monitoring & Maintenance

### Daily Checks

**Monitor these metrics:**

1. **API Usage (Anthropic/OpenAI dashboards)**
   - Tokens used per day
   - Cost per day
   - API errors

2. **Database Growth**
   ```sql
   -- Check table sizes
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE tablename LIKE '%ai%' OR tablename LIKE '%investor%'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Error Rates**
   - Check Vercel logs
   - Monitor console errors
   - Track user reports

### Weekly Tasks

1. **Review AI Recommendations Quality**
   ```sql
   SELECT
     recommendation_type,
     status,
     AVG(user_rating) as avg_rating,
     COUNT(*) as count
   FROM ai_recommendations
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY recommendation_type, status;
   ```

2. **Check Lead Scoring Accuracy**
   ```sql
   SELECT
     priority,
     AVG(score) as avg_score,
     COUNT(*) as count,
     COUNT(*) FILTER (WHERE converted = true) as converted_count,
     ROUND(COUNT(*) FILTER (WHERE converted = true)::NUMERIC / COUNT(*) * 100, 2) as conversion_rate
   FROM lead_scores
   WHERE scored_at >= NOW() - INTERVAL '7 days'
   GROUP BY priority;
   ```

3. **Clean Up Old Data**
   ```sql
   -- Delete old revenue intelligence reports (already automated via trigger)
   DELETE FROM revenue_intelligence WHERE expires_at < NOW();

   -- Archive old events (optional)
   -- Move events older than 6 months to archive table
   ```

### Monthly Tasks

1. **Cost Analysis**
   - Calculate AI API costs
   - Compare to value generated
   - Optimize prompts if needed

2. **Feature Usage Report**
   ```sql
   SELECT
     feature_name,
     COUNT(DISTINCT user_id) as unique_users,
     SUM(usage_count) as total_uses,
     AVG(satisfaction_score) as avg_satisfaction,
     SUM(estimated_value_generated) as total_value
   FROM ai_feature_usage
   WHERE last_used_at >= NOW() - INTERVAL '30 days'
   GROUP BY feature_name
   ORDER BY unique_users DESC;
   ```

3. **Investor Metrics Export**
   ```bash
   # Generate monthly investor report
   curl https://your-domain.com/api/ai/investor-metrics?timeframe=30_days > monthly-report.json
   ```

---

## Troubleshooting

### Issue: AI API timeouts

**Symptoms:** Requests taking > 30 seconds or timing out

**Solutions:**
1. Check API key validity
2. Verify rate limits not exceeded
3. Reduce prompt complexity
4. Implement caching for repeat requests
5. Add retry logic with exponential backoff

### Issue: High API costs

**Symptoms:** Anthropic/OpenAI bills higher than expected

**Solutions:**
1. Implement request caching (5-10 min TTL)
2. Use cheaper models for simpler tasks
3. Reduce token usage in prompts
4. Add rate limiting per user
5. Monitor token usage per request

### Issue: Database performance slow

**Symptoms:** Queries taking > 1 second

**Solutions:**
```sql
-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_custom ON table_name(column);

-- Vacuum tables
VACUUM ANALYZE investor_metrics_events;

-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 10;
```

### Issue: Widget not loading

**Symptoms:** Blank screen or spinner forever

**Solutions:**
1. Check browser console for errors
2. Verify API routes are accessible
3. Check network tab for failed requests
4. Verify environment variables loaded
5. Check Supabase RLS policies

---

## Success Metrics

### Week 1 Goals
- ✅ 0 crashes or critical bugs
- ✅ AI features used by 10% of active users
- ✅ Average AI API response time < 25s
- ✅ User satisfaction > 7/10

### Month 1 Goals
- ✅ AI features used by 30% of active users
- ✅ 5+ positive user testimonials
- ✅ Measurable revenue increase for users (track in database)
- ✅ 50+ AI recommendations accepted
- ✅ Investor metrics dashboard viewed 100+ times

### Quarter 1 Goals
- ✅ AI features used by 60% of active users
- ✅ Users report 30%+ revenue increase
- ✅ Platform ready for investor demo
- ✅ AI features generate measurable ROI
- ✅ 1000+ successful AI interactions

---

## Rollback Plan

### If critical issues arise:

**Step 1: Disable AI features immediately**

```typescript
// In app/layout.tsx or global config
export const AI_FEATURES_ENABLED = false;

// Conditionally render AI components
{AI_FEATURES_ENABLED && <RevenueInsightsWidget />}
```

**Step 2: Revert database migration (if needed)**

```sql
-- Run rollback script
-- This drops all AI feature tables
-- WARNING: This will delete all AI data!

DROP TABLE IF EXISTS investor_metrics_events CASCADE;
DROP TABLE IF EXISTS revenue_intelligence CASCADE;
DROP TABLE IF EXISTS lead_scores CASCADE;
DROP TABLE IF EXISTS growth_playbooks CASCADE;
DROP TABLE IF EXISTS ai_feature_usage CASCADE;
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS user_metrics_aggregate CASCADE;
```

**Step 3: Redeploy previous version**

```bash
# Via Vercel dashboard: Deployments > Click previous deployment > Promote to Production
```

---

## Next Steps

After successful deployment:

1. **User Onboarding**
   - Create tutorial for AI features
   - Add tooltips and help text
   - Create demo video

2. **Documentation**
   - Update user docs with AI features
   - Create investor pitch deck
   - Document API usage patterns

3. **Optimization**
   - Fine-tune prompts based on feedback
   - Implement caching strategies
   - Optimize database queries

4. **Expansion**
   - Add more AI features based on usage
   - Integrate with more data sources
   - Build mobile app support

---

**Last Updated:** 2025-11-25
**Status:** Ready for Testing & Deployment
**Estimated Testing Time:** 4-6 hours
**Estimated Deployment Time:** 2-3 hours
