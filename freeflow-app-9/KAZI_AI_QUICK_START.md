# Kazi AI - Quick Start Guide
## Get Up and Running in 30 Minutes

---

## ⚡ Super Fast Setup

### Step 1: Add API Keys (5 minutes)

Add these to your `.env.local` file:

```bash
# Get these keys:
# Anthropic: https://console.anthropic.com/
# OpenAI: https://platform.openai.com/
# Google: https://makersuite.google.com/app/apikey

ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
GOOGLE_AI_API_KEY=your-key-here
```

### Step 2: Test API Endpoints (5 minutes)

```bash
# Start your dev server
npm run dev

# Test AI chat (in another terminal)
curl -X POST http://localhost:9323/api/kazi-ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are 3 ways to grow my freelance business?",
    "taskType": "strategic",
    "userId": "test-123"
  }'

# Should return AI response with metrics!
```

### Step 3: Add to Your Frontend (10 minutes)

Create `lib/hooks/use-kazi-ai.ts`:

```typescript
import { useState } from 'react'

export function useKaziAI() {
  const [loading, setLoading] = useState(false)

  const chat = async (message: string, taskType = 'chat') => {
    setLoading(true)
    try {
      const res = await fetch('/api/kazi-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, taskType, userId: 'current-user' })
      })
      const data = await res.json()
      setLoading(false)
      return data.response
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  return { chat, loading }
}
```

Use in any component:

```typescript
const { chat, loading } = useKaziAI()

const handleAsk = async () => {
  const response = await chat(userMessage, 'strategic')
  console.log('AI says:', response)
}
```

### Step 4: View Analytics (5 minutes)

```bash
# Check platform health
curl http://localhost:9323/api/kazi-ai/analytics?report=health

# Check AI metrics
curl http://localhost:9323/api/kazi-ai/metrics
```

### Step 5: Update AI Assistant Page (5 minutes)

In `app/(app)/dashboard/ai-assistant/page.tsx`, replace the mock AI call:

```typescript
// BEFORE (mock):
setTimeout(() => {
  const response = generateAIResponse(inputMessage)
  // ...
}, 1500)

// AFTER (real AI):
const { chat } = useKaziAI()
const response = await chat(inputMessage, selectedModel)
```

---

## 🎯 What You Get

### 1. Multi-Model AI Router
- Automatically selects best model for task
- Claude for analysis, GPT-4 for creativity, Gemini for speed
- Built-in failover and caching

### 2. Investment Analytics
- Real-time platform health metrics
- User growth tracking
- Revenue analytics
- AI performance monitoring

### 3. Production-Ready APIs
- `/api/kazi-ai/chat` - Main AI endpoint
- `/api/kazi-ai/analytics` - Metrics and reports
- `/api/kazi-ai/metrics` - AI usage stats

---

## 📊 Task Types

Use these task types for intelligent routing:

```typescript
'chat'       // General conversation → Gemini (fast & cheap)
'analysis'   // Data/document analysis → Claude (smart)
'creative'   // Content generation → GPT-4 (creative)
'legal'      // Contracts/compliance → Claude (safe)
'strategic'  // Business strategy → Claude (reasoning)
'operational' // Quick tasks/emails → Gemini (efficient)
'coding'     // Code generation → GPT-4 (technical)
```

Example:
```typescript
// For business strategy
await chat('How should I price my services?', 'strategic')

// For content creation
await chat('Write a marketing email', 'creative')

// For quick questions
await chat('What time is the meeting?', 'operational')
```

---

## 💰 Cost Optimization

### Built-in Optimizations
- **Caching:** Responses cached for 15 minutes
- **Smart Routing:** Uses cheapest model when possible
- **Rate Limiting:** Prevents cost overruns

### Expected Costs
- **Chat:** $0.001 - $0.01 per message
- **Analysis:** $0.01 - $0.05 per analysis
- **Target:** $0.33 per user per month

### Monitor Costs
```bash
curl http://localhost:9323/api/kazi-ai/metrics
# Shows: total cost, cost by provider, cost by task type
```

---

## 🔥 Common Use Cases

### 1. Business Advisor
```typescript
const advice = await chat(
  'Should I take this $5K project that takes 2 weeks?',
  'strategic'
)
```

### 2. Content Generator
```typescript
const email = await chat(
  'Write a professional follow-up email to a client',
  'creative'
)
```

### 3. Project Analysis
```typescript
const analysis = await chat(
  `Analyze this project: Budget $10K, Timeline 1 month, Client Type: Startup`,
  'analysis'
)
```

### 4. Pricing Help
```typescript
const pricing = await chat(
  'I have 5 years experience in web design. What should I charge?',
  'strategic'
)
```

---

## 🐛 Troubleshooting

### "API Key Invalid"
Check your `.env.local` file and restart dev server:
```bash
npm run dev
```

### "Rate Limit Exceeded"
Wait a minute or upgrade your API plan with the provider.

### "Slow Responses"
- Check internet connection
- Enable caching
- Use faster models (Gemini for quick tasks)

### "High Costs"
- Increase cache TTL
- Use operational/chat tasks for simple queries
- Monitor with `/api/kazi-ai/metrics`

---

## 📈 What's Next?

### Immediate (Today)
1. ✅ Test all API endpoints
2. ✅ Integrate with one page
3. ✅ Monitor costs and performance

### This Week
1. 🔄 Update AI Assistant page
2. 🔄 Add investor dashboard
3. 🔄 Create business intelligence features
4. 🔄 Test with real users

### This Month
1. 📋 Beta launch to 50 users
2. 📋 Gather feedback
3. 📋 Optimize prompts
4. 📋 Scale infrastructure

---

## 📚 Full Documentation

- **Strategy:** `KAZI_AI_COMPREHENSIVE_STRATEGY.md`
- **Implementation:** `KAZI_AI_IMPLEMENTATION_GUIDE.md`
- **Summary:** `KAZI_AI_PROJECT_SUMMARY.md`
- **Quick Start:** This file!

---

## 🎊 You're Ready!

In just 30 minutes, you have:
- ✅ Multi-model AI system
- ✅ Investment-grade analytics
- ✅ Production-ready APIs
- ✅ Cost optimization
- ✅ Monitoring and metrics

**Now go build the future of business AI! 🚀**

---

**Questions?** Check the full documentation or reach out to dev@kaziplatform.com
