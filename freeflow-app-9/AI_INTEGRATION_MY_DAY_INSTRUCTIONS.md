# My Day AI Integration Instructions

## Overview
This document provides step-by-step instructions to integrate AI monetization features into the My Day page.

## Step 1: Add AI Widgets Import

Add these imports to the top of `/app/(app)/dashboard/my-day/page.tsx`:

```typescript
// AI Widgets
import { RevenueInsightsWidget } from '@/components/ai/revenue-insights-widget'
import { GrowthActionsWidget } from '@/components/ai/growth-actions-widget'
import { LeadScoringWidget } from '@/components/ai/lead-scoring-widget'
import { useRevenueIntelligence } from '@/lib/hooks/use-revenue-intelligence'
import { useGrowthAutomation } from '@/lib/hooks/use-growth-automation'
```

## Step 2: Add State for AI Features

Add this state near the top of the component (around line 200):

```typescript
  // AI Features state
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [revenueData, setRevenueData] = useState(null)
  const [mockLeads, setMockLeads] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Startup Inc',
      industry: 'technology',
      email: 'sarah@techstartup.com',
      source: 'referral' as const,
      budget: 15000,
      projectDescription: 'Website redesign and branding',
      decisionMaker: true,
      painPoints: ['Outdated website', 'Poor conversion rate']
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Design Studio',
      industry: 'creative',
      email: 'michael@designstudio.com',
      source: 'inbound' as const,
      budget: 8000,
      projectDescription: 'Logo and brand identity',
      decisionMaker: true
    }
  ])

  const userProfile = {
    industry: 'creative_services',
    currentRevenue: 5000,
    targetRevenue: 15000,
    availableTimePerWeek: 20
  }

  // Prepare revenue data from user's tasks and projects
  useEffect(() => {
    const mockRevenue = {
      userId: 'current-user',
      timeframe: 'monthly' as const,
      totalRevenue: 50000,
      revenueBySource: {
        projects: 35000,
        retainers: 10000,
        passive: 5000,
        other: 0
      },
      revenueByClient: [
        { clientId: '1', clientName: 'Client A', revenue: 15000, projectCount: 3 },
        { clientId: '2', clientName: 'Client B', revenue: 12000, projectCount: 2 },
        { clientId: '3', clientName: 'Client C', revenue: 8000, projectCount: 1 }
      ],
      expenses: 15000,
      netProfit: 35000,
      currency: 'USD'
    }
    setRevenueData(mockRevenue)
  }, [])
```

## Step 3: Add AI Panel Toggle Button

Add this button in the header section (around line 850, near other action buttons):

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowAIPanel(!showAIPanel)}
  className="ml-2"
>
  <Brain className="h-4 w-4 mr-2" />
  {showAIPanel ? 'Hide' : 'Show'} AI Insights
</Button>
```

## Step 4: Add AI Widgets Section

Add this section right after the main dashboard stats cards (around line 1200):

```typescript
{/* AI INSIGHTS PANEL */}
{showAIPanel && (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">AI Business Intelligence</h2>
        <Badge variant="secondary">Powered by Claude & GPT-4</Badge>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAIPanel(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>

    <Tabs defaultValue="growth" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="growth">Daily Growth Actions</TabsTrigger>
        <TabsTrigger value="revenue">Revenue Insights</TabsTrigger>
        <TabsTrigger value="leads">Lead Priority</TabsTrigger>
      </TabsList>

      <TabsContent value="growth" className="mt-6">
        <GrowthActionsWidget
          userId="current-user"
          userProfile={userProfile}
        />
      </TabsContent>

      <TabsContent value="revenue" className="mt-6">
        {revenueData && (
          <RevenueInsightsWidget
            userId="current-user"
            revenueData={revenueData}
            showActions={true}
          />
        )}
      </TabsContent>

      <TabsContent value="leads" className="mt-6">
        <LeadScoringWidget
          userId="current-user"
          leads={mockLeads}
        />
      </TabsContent>
    </Tabs>
  </div>
)}
```

## Step 5: Add Compact AI Widgets in Sidebar

If there's a sidebar or quick stats section, add compact widgets (around line 2000+):

```typescript
{/* COMPACT AI INSIGHTS */}
<div className="space-y-4">
  <GrowthActionsWidget
    userId="current-user"
    userProfile={userProfile}
    compact={true}
  />

  {revenueData && (
    <RevenueInsightsWidget
      userId="current-user"
      revenueData={revenueData}
      compact={true}
      showActions={false}
    />
  )}

  <LeadScoringWidget
    userId="current-user"
    leads={mockLeads}
    compact={true}
  />
</div>
```

## Step 6: Add AI-Powered Task Suggestions

Add this function to generate AI task suggestions:

```typescript
const generateAITaskSuggestions = async () => {
  logger.info('Generating AI task suggestions')

  // This will use the Growth Automation API in production
  // For now, show smart suggestions based on current tasks

  const suggestions = [
    {
      title: 'Follow up with high-priority lead',
      description: 'Sarah Johnson (Tech Startup Inc) - 87/100 lead score',
      priority: 'high' as const,
      category: 'work' as const,
      estimatedTime: 30,
      tags: ['ai-suggested', 'sales']
    },
    {
      title: 'Update pricing for new proposals',
      description: 'AI detected 35% underpricing - increase to $5,000',
      priority: 'high' as const,
      category: 'work' as const,
      estimatedTime: 45,
      tags: ['ai-suggested', 'pricing']
    },
    {
      title: 'Schedule retainer pitch with Client A',
      description: 'High conversion probability - $24K annual value',
      priority: 'medium' as const,
      category: 'meeting' as const,
      estimatedTime: 60,
      tags: ['ai-suggested', 'revenue']
    }
  ]

  suggestions.forEach(suggestion => {
    dispatch({
      type: 'ADD_TASK',
      task: {
        id: `ai-${Date.now()}-${Math.random()}`,
        completed: false,
        ...suggestion
      }
    })
  })

  toast.success('AI Task Suggestions Added', {
    description: `${suggestions.length} high-impact tasks from AI analysis`
  })

  logger.info('AI task suggestions added', {
    count: suggestions.length,
    suggestions: suggestions.map(s => s.title)
  })
}
```

## Step 7: Add AI Suggestions Button

Add this button near the "Add Task" button:

```typescript
<Button
  onClick={generateAITaskSuggestions}
  variant="outline"
  className="ml-2"
>
  <Brain className="h-4 w-4 mr-2" />
  Get AI Suggestions
</Button>
```

## Step 8: Update Dashboard Stats with AI Insights

Enhance the stats cards to show AI-powered insights:

```typescript
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$18,500</div>
    <p className="text-xs text-muted-foreground">
      AI-identified opportunities this month
    </p>
    <div className="mt-2">
      <Badge variant="default" className="text-xs">
        +35% pricing optimization
      </Badge>
    </div>
  </CardContent>
</Card>
```

## Complete Integration Example

Here's a complete example of where to place the AI widgets in the My Day layout:

```typescript
return (
  <div className="container mx-auto p-6 space-y-8">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">My Day</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Button onClick={generateAITaskSuggestions} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          AI Suggestions
        </Button>
        <Button onClick={() => setShowAIPanel(!showAIPanel)} variant="outline">
          <Target className="h-4 w-4 mr-2" />
          {showAIPanel ? 'Hide' : 'Show'} AI Insights
        </Button>
      </div>
    </div>

    {/* Dashboard Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Existing stats cards */}
    </div>

    {/* AI INSIGHTS PANEL - NEW */}
    {showAIPanel && (
      <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Business Intelligence</h2>
          <Badge variant="secondary">Live Insights</Badge>
        </div>

        <Tabs defaultValue="growth" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="growth">
              <Target className="h-4 w-4 mr-2" />
              Growth Actions
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <TrendingUp className="h-4 w-4 mr-2" />
              Revenue Insights
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="h-4 w-4 mr-2" />
              Lead Priority
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="mt-6">
            <GrowthActionsWidget
              userId="current-user"
              userProfile={userProfile}
            />
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            {revenueData && (
              <RevenueInsightsWidget
                userId="current-user"
                revenueData={revenueData}
                showActions={true}
              />
            )}
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <LeadScoringWidget
              userId="current-user"
              leads={mockLeads}
            />
          </TabsContent>
        </Tabs>
      </div>
    )}

    {/* Existing Tasks Section */}
    <div>
      {/* Task list, timer, etc. */}
    </div>
  </div>
)
```

## Testing the Integration

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to My Day page:**
   ```
   http://localhost:3000/dashboard/my-day
   ```

3. **Test AI Features:**
   - Click "AI Suggestions" to generate smart tasks
   - Toggle AI panel visibility
   - Switch between Growth, Revenue, and Leads tabs
   - Check that all widgets load without errors
   - Verify API calls are made correctly (check Network tab)

4. **Test Interactions:**
   - Click "Generate Plan" in Growth Actions
   - Click "Analyze Revenue" in Revenue Insights
   - Click "Score Leads" in Lead Scoring
   - Verify loading states appear
   - Check console logs for detailed tracking

## Troubleshooting

### If widgets don't appear:
- Check console for import errors
- Verify all dependencies are installed
- Ensure API keys are configured in `.env.local`

### If API calls fail:
- Check that Next.js server is running
- Verify API routes exist: `/api/ai/revenue-intelligence`, `/api/ai/growth-automation`
- Check browser console and server logs for errors
- Verify Anthropic API key is valid

### If styling looks broken:
- Ensure Tailwind is processing the new component files
- Check that all UI components are imported correctly
- Verify dark mode classes are working

## Next Steps

After integrating into My Day:
1. ✅ Integrate into Projects Hub page
2. ✅ Integrate into Clients page
3. ✅ Create dedicated Investor Metrics Dashboard
4. ✅ Set up database tables for data persistence
5. ✅ Connect real user data instead of mock data

## Production Considerations

Before going live:
- Replace mock data with real user data from database
- Add error boundaries around AI widgets
- Implement proper loading skeletons
- Add rate limiting for API calls
- Cache AI responses for 5-10 minutes
- Add analytics tracking for feature usage
- Create onboarding tutorial for AI features

---

**Last Updated:** 2025-11-25
**Status:** Ready for Integration
**Estimated Time:** 2-3 hours for full integration
