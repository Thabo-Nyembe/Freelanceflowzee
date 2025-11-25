# Kazi AI - Comprehensive Testing Guide

## 🧪 Testing Checklist

### Environment Setup
- [ ] `ANTHROPIC_API_KEY` added to `.env.local`
- [ ] `OPENAI_API_KEY` verified
- [ ] `GOOGLE_AI_API_KEY` verified
- [ ] Dev server running on port 9323

### 1. AI Assistant (Multi-Model Chat)
**URL:** `http://localhost:9323/dashboard/ai-assistant`

#### Test Cases:
- [ ] Page loads without errors
- [ ] Can select Claude model
- [ ] Can select GPT-4 model
- [ ] Can select Gemini model
- [ ] Chat input works
- [ ] Send button is enabled with text
- [ ] **Real AI Response Test:**
  - Type: "What are 3 ways to grow my freelance business?"
  - Expected: Real AI response (not mock)
  - Verify: Toast shows provider name and token count
- [ ] Response shows in chat history
- [ ] Can rate messages (thumbs up/down)
- [ ] Can copy messages
- [ ] Insights tab shows data
- [ ] Projects tab shows analysis
- [ ] Analytics tab shows metrics

### 2. AI Business Advisor
**URL:** `http://localhost:9323/dashboard/ai-business-advisor`

#### Project Intelligence Test:
- [ ] Page loads without errors
- [ ] Form displays all fields
- [ ] **Real Analysis Test:**
  - Project Name: "Website Redesign"
  - Budget: 10000
  - Timeline: 30 days
  - Client Type: startup
  - Scope: "Complete website redesign with modern UI"
  - Click "Analyze Project"
  - Expected: AI analysis with profitability score
- [ ] Profitability score displays
- [ ] Risk score displays
- [ ] Insights cards show recommendations
- [ ] Can re-analyze project

#### Pricing Intelligence Test:
- [ ] Switch to Pricing tab
- [ ] Form displays all fields
- [ ] **Real Pricing Test:**
  - Skills: "Web Development, React, Node.js"
  - Experience: 5 years
  - Market: "US"
  - Current Rate: 75 (optional)
  - Click "Generate Pricing Strategy"
  - Expected: 3 pricing tiers with recommendations
- [ ] Basic tier displays
- [ ] Standard tier displays
- [ ] Premium tier displays
- [ ] Market analysis shows
- [ ] Rate increase strategy shows

### 3. AI Content Studio
**URL:** `http://localhost:9323/dashboard/ai-content-studio`

#### Email Templates Test:
- [ ] Page loads without errors
- [ ] 5 email templates show
- [ ] Can select template
- [ ] Form appears after selection
- [ ] **Real Email Generation Test:**
  - Template: "Project Proposal"
  - Recipient: "John Smith"
  - Tone: Professional
  - Context: "Following up on our discussion about the website project. Budget is $10k, 30-day timeline."
  - Click "Generate Email"
  - Expected: Professional email with subject line
- [ ] Generated email displays
- [ ] Can copy email
- [ ] Can send email (placeholder)

#### Proposal Generator Test:
- [ ] Switch to Proposals tab
- [ ] Form displays all fields
- [ ] **Real Proposal Test:**
  - Client: "Acme Corp"
  - Project Type: "E-commerce Website"
  - Budget: 15000
  - Timeline: "6 weeks"
  - Scope: Add 2-3 scope items
  - Deliverables: Add 2-3 deliverables
  - Click "Generate Proposal"
  - Expected: Full professional proposal
- [ ] Generated proposal displays
- [ ] Can copy proposal
- [ ] Can download as .md file

### 4. Investor Metrics Dashboard
**URL:** `http://localhost:9323/dashboard/investor-metrics`

#### Dashboard Test:
- [ ] Page loads without errors
- [ ] Platform health score displays
- [ ] Total users metric shows
- [ ] MRR metric shows
- [ ] AI engagement metric shows
- [ ] LTV:CAC ratio shows
- [ ] **Metrics API Test:**
  - Click "Refresh" button
  - Expected: Metrics update with toast notification
- [ ] Retention tab works
- [ ] Revenue tab works
- [ ] AI Performance tab shows AI metrics
- [ ] Forecasts tab shows projections
- [ ] **Board Deck Test:**
  - Click "Download Board Deck"
  - Expected: JSON file downloads
- [ ] Board deck file is valid JSON

### 5. API Endpoints Testing

#### Chat API Test:
```bash
curl -X POST http://localhost:9323/api/kazi-ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me price my services as a web developer with 5 years experience",
    "taskType": "strategic",
    "userId": "test-user-123"
  }'
```
- [ ] Returns 200 status
- [ ] Response has `success: true`
- [ ] Response has `response` field with AI content
- [ ] Response has `metadata` with provider, model, tokens, cost

#### Analytics API Test:
```bash
curl http://localhost:9323/api/kazi-ai/analytics?report=health
```
- [ ] Returns 200 status
- [ ] Response has platform health data
- [ ] Score is between 0-100
- [ ] All metrics present

#### Metrics API Test:
```bash
curl http://localhost:9323/api/kazi-ai/metrics
```
- [ ] Returns 200 status
- [ ] Shows total requests
- [ ] Shows total cost
- [ ] Shows breakdown by provider

### 6. Integration Points

#### Projects Integration Test:
- [ ] Go to Projects Hub page
- [ ] Select a project
- [ ] AI Project Optimizer component should be available
- [ ] Can analyze project with AI
- [ ] Recommendations display

### 7. Performance Tests

#### Response Time:
- [ ] AI chat responds in < 5 seconds
- [ ] Project analysis completes in < 10 seconds
- [ ] Pricing generation completes in < 10 seconds
- [ ] Metrics dashboard loads in < 2 seconds

#### Caching:
- [ ] Send same message twice
- [ ] Second response should be cached (faster)
- [ ] Toast should show "Cached" indicator

### 8. Error Handling

#### API Error Test:
- [ ] Send empty message
- [ ] Expected: Error toast shows
- [ ] Send very long message (10,000+ chars)
- [ ] Expected: Handles gracefully

#### Network Error Test:
- [ ] Disconnect internet
- [ ] Try to send AI message
- [ ] Expected: Error message shows
- [ ] Reconnect internet
- [ ] Try again - should work

### 9. Cost Tracking

#### Verify Cost Metrics:
- [ ] Check `/api/kazi-ai/metrics`
- [ ] Total cost is tracked
- [ ] Cost per provider is tracked
- [ ] Cost per task type is tracked
- [ ] Costs are reasonable (< $1 for testing)

### 10. Documentation

#### Verify Docs:
- [ ] `KAZI_AI_COMPREHENSIVE_STRATEGY.md` exists
- [ ] `KAZI_AI_IMPLEMENTATION_GUIDE.md` exists
- [ ] `KAZI_AI_PROJECT_SUMMARY.md` exists
- [ ] `KAZI_AI_QUICK_START.md` exists
- [ ] `KAZI_AI_IMPLEMENTATION_COMPLETE.md` exists
- [ ] All docs are readable and complete

---

## 🎯 Success Criteria

### Must Pass (Critical):
- ✅ All API endpoints return 200 status
- ✅ Real AI responses (not mocks)
- ✅ No console errors on any page
- ✅ Chat interface works smoothly
- ✅ Project analysis generates insights
- ✅ Pricing intelligence generates recommendations
- ✅ Investor dashboard loads metrics

### Should Pass (Important):
- ✅ Response times under 5 seconds
- ✅ Caching works correctly
- ✅ Error messages are user-friendly
- ✅ All forms validate inputs
- ✅ Copy/download functions work

### Nice to Have:
- ✅ Animations are smooth
- ✅ UI is polished
- ✅ Mobile responsive
- ✅ Toast notifications are helpful

---

## 🐛 Bug Report Template

If you find issues, document them:

```markdown
### Bug: [Short description]

**Page:** [URL or component name]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Error Message:** [If any]
**Screenshot:** [If helpful]
```

---

## 📊 Test Results Summary

After testing, fill this out:

```
Total Tests: ___
Passed: ___
Failed: ___
Skipped: ___

Pass Rate: ___%

Critical Issues: ___
Minor Issues: ___

Status: [ ] Ready for Production [ ] Needs Fixes
```

---

## 🚀 Production Readiness Checklist

Before deploying:
- [ ] All critical tests pass
- [ ] No console errors
- [ ] API keys are secure (not in code)
- [ ] Environment variables set in production
- [ ] Build completes without errors
- [ ] All pages load successfully
- [ ] AI responses are real (not mocks)
- [ ] Cost tracking is working
- [ ] Error handling is robust
- [ ] Documentation is complete

---

## 📞 Support

If you encounter issues:
1. Check the documentation
2. Review error logs
3. Test API keys are valid
4. Verify environment variables
5. Check network connectivity

---

**Testing Date:** _______________
**Tester:** _______________
**Version:** 1.0
**Status:** Ready for Testing ✅
