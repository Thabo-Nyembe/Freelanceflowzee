# Quick AI Integration Snippet - My Day Page

## Copy-Paste Ready Code

### Step 1: Add Import at Top of File

Add this to the imports section of `app/(app)/dashboard/my-day/page.tsx`:

```typescript
// AI Features - ADD THESE IMPORTS
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'
```

### Step 2: Add State (if needed)

Add this state variable around line 200-250 (after other useState declarations):

```typescript
// AI Panel state
const [showAIPanel, setShowAIPanel] = useState(true)
```

### Step 3: Add Toggle Button in Header

Find the header section (around line 850) and add this button:

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => setShowAIPanel(!showAIPanel)}
  className="gap-2"
>
  <Brain className="h-4 w-4" />
  {showAIPanel ? 'Hide' : 'Show'} AI Insights
</Button>
```

### Step 4: Add AI Panel Component

Add this right after the dashboard stats cards (around line 1200):

```typescript
{/* AI INSIGHTS PANEL - NEW */}
{showAIPanel && (
  <AIInsightsPanel
    userId="current-user-id" // Replace with actual user ID
    defaultExpanded={true}
    showHeader={true}
  />
)}
```

## Complete Integration Example

Here's how it should look in context:

```typescript
'use client'

import { useState } from 'react'
// ... other imports ...
import { AIInsightsPanel } from '@/components/ai/ai-insights-panel' // ADD THIS

export default function MyDayPage() {
  // ... existing state ...
  const [showAIPanel, setShowAIPanel] = useState(true) // ADD THIS

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Day</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* ADD THIS BUTTON */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
          >
            <Brain className="h-4 w-4 mr-2" />
            {showAIPanel ? 'Hide' : 'Show'} AI Insights
          </Button>
          {/* ... other buttons ... */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... existing stats cards ... */}
      </div>

      {/* ADD THIS SECTION */}
      {showAIPanel && (
        <AIInsightsPanel
          userId="current-user-id"
          defaultExpanded={true}
          showHeader={true}
        />
      )}

      {/* Existing Tasks Section */}
      <div>
        {/* ... existing task list ... */}
      </div>
    </div>
  )
}
```

## Even Simpler: Compact Mode

If you want a smaller widget, use compact mode:

```typescript
{/* Compact AI Insights - Sidebar or Quick View */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    {/* Your existing content */}
  </Card>

  {/* ADD THIS */}
  <Card className="md:col-span-1">
    <AIInsightsPanel
      userId="current-user-id"
      defaultExpanded={false}  // Collapsed by default
      showHeader={false}       // No header in compact mode
      className="h-full"
    />
  </Card>
</div>
```

## Testing

After adding the code:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit My Day page:**
   ```
   http://localhost:3000/dashboard/my-day
   ```

3. **You should see:**
   - "Show/Hide AI Insights" button in header
   - AI Insights Panel with 3 tabs (Growth, Revenue, Leads)
   - Ability to generate AI insights

4. **Test functionality:**
   - Click "Generate Plan" in Growth tab
   - Click "Analyze Revenue" in Revenue tab
   - Click "Score Leads" in Leads tab

## Troubleshooting

### Import Error
```
Module not found: Can't resolve '@/components/ai/ai-insights-panel'
```
**Fix:** Make sure the file exists at `components/ai/ai-insights-panel.tsx`

### TypeScript Error
```
Property 'userId' does not exist
```
**Fix:** Replace "current-user-id" with actual user ID from your auth system

### Nothing Renders
**Fix:** Check browser console for errors, verify all dependencies installed

### API Calls Fail
**Fix:**
- Verify API routes exist
- Check `.env.local` has AI API keys
- Check network tab in browser DevTools

## Alternative: Standalone AI Page

If you prefer a dedicated AI page instead of embedding in My Day:

**Create:** `app/(app)/dashboard/ai-insights/page.tsx`

```typescript
'use client'

import { AIInsightsPanel } from '@/components/ai/ai-insights-panel'

export default function AIInsightsPage() {
  return (
    <div className="container mx-auto p-6">
      <AIInsightsPanel
        userId="current-user-id"
        defaultExpanded={true}
        showHeader={true}
      />
    </div>
  )
}
```

Then add to navigation menu!

---

## Next Steps

After integrating into My Day:

1. ✅ Apply database migration (if not done)
2. ✅ Test the AI features work
3. [ ] Integrate into Projects Hub page
4. [ ] Integrate into Clients page
5. [ ] Add to navigation menu
6. [ ] Deploy to production

---

**Estimated Time:** 15-30 minutes for basic integration
**Difficulty:** Easy (copy-paste)
**Dependencies:** All AI components already created ✅
