# Kazi AI Implementation Guide
## Step-by-Step Setup for World-Class AI Integration

---

## Prerequisites

### 1. API Keys Required
- **Anthropic (Claude)**: Get from https://console.anthropic.com/
- **OpenAI (GPT-4)**: Get from https://platform.openai.com/
- **Google AI (Gemini)**: Get from https://makersuite.google.com/app/apikey

### 2. Environment Variables

Create or update your `.env.local` file:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI GPT-4 API
OPENAI_API_KEY=sk-xxxxx

# Google Gemini API
GOOGLE_AI_API_KEY=xxxxx

# Optional: Rate limiting and caching
UPSTASH_REDIS_REST_URL=xxxxx
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

### 3. Install Dependencies (if needed)

```bash
npm install @anthropic-ai/sdk openai @google/generative-ai
```

---

## Implementation Steps

### Phase 1: Core Infrastructure (Week 1)

#### Step 1: Verify Installation

```bash
# Test that all files are created
ls -la lib/ai/
# Should show:
# - kazi-ai-router.ts
# - investor-analytics.ts

ls -la app/api/kazi-ai/
# Should show:
# - chat/route.ts
# - analytics/route.ts
# - metrics/route.ts
```

#### Step 2: Test AI Router

Create a test file: `lib/ai/__tests__/kazi-ai-router.test.ts`

```typescript
import { kaziAI } from '../kazi-ai-router'

async function testAIRouter() {
  console.log('Testing Kazi AI Router...')

  // Test chat task
  const response = await kaziAI.routeRequest({
    type: 'chat',
    prompt: 'What are the top 3 strategies for growing a freelance business?',
    userId: 'test-user-123'
  })

  console.log('Response:', response.content)
  console.log('Provider:', response.provider)
  console.log('Tokens:', response.tokens)
  console.log('Cost:', `$${response.cost.toFixed(4)}`)

  // Test metrics
  const metrics = kaziAI.getMetrics()
  console.log('Metrics:', metrics)
}

testAIRouter()
```

Run the test:
```bash
npx ts-node lib/ai/__tests__/kazi-ai-router.test.ts
```

#### Step 3: Test API Endpoints

Start your dev server:
```bash
npm run dev
```

Test the chat endpoint:
```bash
curl -X POST http://localhost:9323/api/kazi-ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve my freelance pricing strategy?",
    "taskType": "strategic",
    "userId": "test-user-123"
  }'
```

Test the analytics endpoint:
```bash
curl http://localhost:9323/api/kazi-ai/analytics?report=health
```

Test the metrics endpoint:
```bash
curl http://localhost:9323/api/kazi-ai/metrics
```

---

### Phase 2: Frontend Integration (Week 2)

#### Step 4: Create AI Chat Hook

Create `lib/hooks/use-kazi-ai.ts`:

```typescript
import { useState } from 'react'
import { AITaskType } from '@/lib/ai/kazi-ai-router'

export function useKaziAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chat = async (
    message: string,
    taskType: AITaskType = 'chat',
    context?: Record<string, any>
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kazi-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          taskType,
          context,
          userId: 'current-user-id' // Replace with actual user ID
        })
      })

      if (!response.ok) {
        throw new Error('AI request failed')
      }

      const data = await response.json()
      setLoading(false)
      return data

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err
    }
  }

  return { chat, loading, error }
}
```

#### Step 5: Update AI Assistant Page

Update `app/(app)/dashboard/ai-assistant/page.tsx`:

```typescript
import { useKaziAI } from '@/lib/hooks/use-kazi-ai'

// In your component:
const { chat, loading, error } = useKaziAI()

const handleSendMessage = async () => {
  if (!inputMessage.trim() || loading) return

  const userMessage: Message = {
    id: Date.now().toString(),
    content: inputMessage,
    type: 'user',
    timestamp: new Date()
  }

  setMessages(prev => [...prev, userMessage])
  setInputMessage('')

  try {
    // Call real AI instead of mock
    const response = await chat(inputMessage, selectedModel as any)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response.response,
      type: 'assistant',
      timestamp: new Date(),
      suggestions: generateSuggestions(inputMessage)
    }

    setMessages(prev => [...prev, assistantMessage])
  } catch (error) {
    console.error('AI chat error:', error)
    toast.error('Failed to get AI response')
  }
}
```

---

### Phase 3: Advanced Features (Weeks 3-4)

#### Step 6: Implement Business Intelligence Features

Create `lib/ai/business-intelligence.ts`:

```typescript
import { kaziAI } from './kazi-ai-router'

export async function analyzeProject(projectData: any) {
  const prompt = `Analyze this project and provide insights:

  Project: ${projectData.name}
  Budget: $${projectData.budget}
  Timeline: ${projectData.timeline} days
  Client Type: ${projectData.clientType}

  Provide:
  1. Profitability assessment
  2. Risk factors
  3. Optimization opportunities
  4. Pricing recommendations
  `

  return await kaziAI.routeRequest({
    type: 'analysis',
    prompt,
    context: projectData
  })
}

export async function generatePricingStrategy(userData: any) {
  const prompt = `Generate a pricing strategy for this freelancer:

  Skills: ${userData.skills.join(', ')}
  Experience: ${userData.experience} years
  Market: ${userData.market}
  Current Rate: $${userData.currentRate}/hour

  Provide:
  1. Market analysis
  2. Recommended pricing tiers
  3. Value-based pricing suggestions
  4. Negotiation strategies
  `

  return await kaziAI.routeRequest({
    type: 'strategic',
    prompt,
    context: userData
  })
}

export async function optimizeWorkflow(workflowData: any) {
  const prompt = `Analyze this workflow and suggest optimizations:

  ${JSON.stringify(workflowData, null, 2)}

  Provide:
  1. Bottleneck identification
  2. Automation opportunities
  3. Time-saving strategies
  4. Tool recommendations
  `

  return await kaziAI.routeRequest({
    type: 'operational',
    prompt,
    context: workflowData
  })
}
```

#### Step 7: Create Investor Dashboard

Create `app/(app)/dashboard/investor/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlatformHealth } from '@/lib/ai/investor-analytics'

export default function InvestorDashboard() {
  const [health, setHealth] = useState<PlatformHealth | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlatformHealth()
  }, [])

  const fetchPlatformHealth = async () => {
    try {
      const response = await fetch('/api/kazi-ai/analytics?report=health')
      const data = await response.json()
      setHealth(data.data)
    } catch (error) {
      console.error('Failed to fetch platform health:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Investor Dashboard</h1>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {health?.score}/100
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-2xl font-bold">
              {health?.userMetrics.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">
              +{health?.userMetrics.userGrowthRate.toFixed(1)}% MoM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">MRR</div>
            <div className="text-2xl font-bold">
              ${(health?.revenueMetrics.mrr || 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">
              +{health?.revenueMetrics.revenueGrowth.toFixed(1)}% MoM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">AI Engagement</div>
            <div className="text-2xl font-bold">
              {health?.aiMetrics.aiEngagementRate.toFixed(1)}%
            </div>
            <div className="text-sm text-purple-600">
              {health?.aiMetrics.totalAIInteractions.toLocaleString()} interactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">LTV:CAC Ratio</div>
            <div className="text-2xl font-bold">
              {health?.retentionMetrics.ltvCacRatio.toFixed(1)}x
            </div>
            <div className="text-sm text-green-600">
              {health?.retentionMetrics.paybackPeriod} month payback
            </div>
          </CardContent>
        </Card>
      </div>

      {/* More sections... */}
    </div>
  )
}
```

---

### Phase 4: Production Optimization (Week 4)

#### Step 8: Implement Rate Limiting

Update `app/api/kazi-ai/chat/route.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // ... rest of the handler
}
```

#### Step 9: Add Error Monitoring

Install Sentry or similar:
```bash
npm install @sentry/nextjs
```

Update error handling:
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // AI request
} catch (error) {
  Sentry.captureException(error)
  logger.error('AI error', { error })
  // ... handle error
}
```

#### Step 10: Performance Monitoring

Add performance tracking:
```typescript
const startTime = performance.now()
const response = await kaziAI.routeRequest(task)
const duration = performance.now() - startTime

logger.info('AI performance', {
  duration,
  tokens: response.tokens.total,
  cached: response.cached
})
```

---

## Testing Checklist

### Unit Tests
- [ ] AI Router routing logic
- [ ] Cost calculation accuracy
- [ ] Cache functionality
- [ ] Failover mechanisms

### Integration Tests
- [ ] API endpoints respond correctly
- [ ] Database writes succeed
- [ ] Analytics tracking works

### E2E Tests
- [ ] User can chat with AI
- [ ] Metrics update in real-time
- [ ] Investor dashboard loads

### Performance Tests
- [ ] Response time < 2 seconds
- [ ] Cache hit rate > 40%
- [ ] Cost per user < $0.50/month

---

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **AI Performance**
   - Average response time
   - Cache hit rate
   - Error rate per provider
   - Cost per user

2. **Business Metrics**
   - AI engagement rate
   - Feature adoption
   - User satisfaction (NPS)
   - Revenue impact

3. **Technical Metrics**
   - API uptime
   - Database performance
   - Cache efficiency
   - Error rates

### Daily Tasks
- [ ] Check error logs
- [ ] Review cost metrics
- [ ] Monitor user feedback
- [ ] Update investor dashboard

### Weekly Tasks
- [ ] Analyze AI usage patterns
- [ ] Optimize prompts
- [ ] Review and adjust rate limits
- [ ] Update documentation

### Monthly Tasks
- [ ] Generate board deck
- [ ] Review and optimize costs
- [ ] Analyze feature adoption
- [ ] Plan new AI features

---

## Troubleshooting

### Common Issues

#### 1. "AI Provider Error"
- **Solution:** Check API keys in `.env.local`
- **Verify:** `echo $ANTHROPIC_API_KEY`

#### 2. "Rate Limit Exceeded"
- **Solution:** Adjust rate limits or upgrade API plan
- **Check:** Provider dashboard for usage

#### 3. "High Costs"
- **Solution:** Increase cache TTL, optimize prompts
- **Monitor:** `/api/kazi-ai/metrics`

#### 4. "Slow Response Times"
- **Solution:** Enable caching, use faster models
- **Test:** Add performance logging

---

## Next Steps

### Immediate (This Week)
1. ✅ Set up API keys
2. ✅ Test all endpoints
3. ✅ Integrate with frontend
4. ✅ Deploy to staging

### Short-term (Next Month)
1. Launch to beta users (50-100)
2. Gather feedback and iterate
3. Optimize costs and performance
4. Add more AI features

### Long-term (3-6 Months)
1. Scale to 1,000+ users
2. Achieve $75K MRR
3. Prepare for Series A
4. Expand team and features

---

## Support & Resources

### Documentation
- **Anthropic Docs:** https://docs.anthropic.com/
- **OpenAI Docs:** https://platform.openai.com/docs
- **Google AI Docs:** https://ai.google.dev/docs

### Community
- **Discord:** Join Kazi AI developers
- **GitHub:** Issues and discussions
- **Email:** support@kaziplatform.com

### Emergency Contacts
- **Technical Issues:** dev@kaziplatform.com
- **Billing Questions:** billing@kaziplatform.com
- **Investor Relations:** investors@kaziplatform.com

---

**Last Updated:** November 25, 2025
**Version:** 1.0
**Status:** Ready for Implementation
