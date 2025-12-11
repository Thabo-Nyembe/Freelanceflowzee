# 🔌 Component Wiring Guide - Systematic Implementation

**Date:** December 12, 2025
**Purpose:** Wire groundbreaking components to all features systematically
**Status:** Implementation Guide

---

## 📋 Wiring Strategy

### Phase 1: Core Dashboard Pages (Priority 1)
1. **Dashboard Overview** - Main landing page
2. **My Day** - Daily productivity view
3. **Projects Hub** - Project management
4. **AI Create** - AI content generation
5. **Analytics** - Data visualization

### Phase 2: Feature Pages (Priority 2)
6. **Video Studio** - Video editing
7. **Canvas Studio** - Design tools
8. **Files Hub** - File management
9. **Messages** - Communication
10. **Team Hub** - Team management

### Phase 3: Specialized Pages (Priority 3)
11. **Bookings** - Scheduling
12. **Invoicing** - Financial
13. **Gallery** - Portfolio
14. **Clients** - CRM
15. **Settings** - Configuration

---

## 🎨 Component Mapping

### For Dashboard/Overview Pages
**Use:**
- `BentoGrid` - Main layout container
- `BentoHero` - Welcome section
- `BentoStat` - KPI cards (4-6 stats)
- `BentoChart` - Analytics charts
- `BentoList` - Recent activity
- `BentoQuickAction` - Quick actions
- `StatGrid` - Metrics overview

**Example:**
```tsx
import { BentoGrid, BentoHero, BentoStat, BentoChart } from '@/components/ui/bento-grid-advanced'
import { KPICard, StatGrid } from '@/components/ui/results-display'
import { GradientButton } from '@/components/ui/modern-buttons'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <BentoGrid columns={3}>
        <BentoHero
          title="Welcome back, User!"
          description="Here's what's happening with your projects"
          action={
            <GradientButton onClick={() => {}}>
              Start New Project
            </GradientButton>
          }
        />

        {/* KPI Stats */}
        <BentoStat
          icon={<DollarSign />}
          label="Revenue"
          value="$45,231"
          trend="up"
          trendValue="+12.5%"
        />

        <BentoStat
          icon={<Users />}
          label="Active Clients"
          value="127"
          trend="up"
          trendValue="+8"
        />
      </BentoGrid>

      {/* Charts & Lists */}
      <BentoGrid columns={2}>
        <BentoChart title="Revenue Trend" subtitle="Last 30 days">
          <ChartComponent data={data} />
        </BentoChart>

        <BentoList
          title="Recent Projects"
          items={recentProjects}
        />
      </BentoGrid>
    </div>
  )
}
```

### For AI Features (AI Create, AI Content Studio)
**Use:**
- `AISandbox` - Code/content playground
- `AIThinking` - Processing indicators
- `AIResult` - Result displays
- `AIStreamingText` - Typewriter effects
- `AIResultCard` - Result cards
- `ModernButton` with loading states

**Example:**
```tsx
import { AISandbox, AIThinking, AIResult } from '@/components/ui/ai-components'
import { ModernButton } from '@/components/ui/modern-buttons'

export default function AICreatePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  return (
    <div className="p-6 space-y-6">
      {/* AI Sandbox */}
      <AISandbox
        title="AI Content Generator"
        description="Write a prompt to generate content"
        code={prompt}
        language="markdown"
        onRun={async (code) => {
          setIsProcessing(true)
          const result = await generateContent(code)
          setResult(result)
          setIsProcessing(false)
          return result
        }}
      />

      {/* Processing State */}
      {isProcessing && (
        <AIThinking
          variant="brain"
          message="AI is crafting your content..."
        />
      )}

      {/* Result Display */}
      {result && (
        <AIResult
          status="success"
          title="Content Generated!"
          message="Your AI-generated content is ready"
          action={{
            label: "Copy to Clipboard",
            onClick: () => navigator.clipboard.writeText(result)
          }}
        />
      )}
    </div>
  )
}
```

### For Analytics/Reporting Pages
**Use:**
- `KPICard` - Key metrics
- `StatGrid` - Multiple KPIs
- `ProgressCard` - Goal tracking
- `CircularProgress` - Circular metrics
- `ComparisonCard` - Comparisons
- `RankingList` - Leaderboards
- `ActivityFeed` - Recent events

**Example:**
```tsx
import {
  KPICard,
  StatGrid,
  ProgressCard,
  RankingList,
  ActivityFeed
} from '@/components/ui/results-display'

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* KPI Overview */}
      <StatGrid
        columns={4}
        stats={[
          { label: "Total Revenue", value: "$124.5K", change: 12.5, icon: <DollarSign /> },
          { label: "Active Projects", value: "34", change: 5, icon: <FolderOpen /> },
          { label: "Client Satisfaction", value: "98%", change: 2, icon: <Star /> },
          { label: "Task Completion", value: "87%", change: -3, icon: <CheckCircle /> },
        ]}
      />

      {/* Progress Tracking */}
      <div className="grid grid-cols-2 gap-6">
        <ProgressCard
          title="Monthly Revenue Goal"
          current={87500}
          goal={100000}
          unit="$"
          icon={<Target />}
        />

        <ProgressCard
          title="Projects Delivered"
          current={28}
          goal={35}
          unit=""
          icon={<CheckCircle />}
        />
      </div>

      {/* Leaderboard & Activity */}
      <div className="grid grid-cols-2 gap-6">
        <RankingList
          title="Top Performers"
          items={topPerformers}
        />

        <ActivityFeed
          title="Recent Activity"
          activities={recentActivity}
        />
      </div>
    </div>
  )
}
```

### For Project/Task Management Pages
**Use:**
- `BentoGrid` - Layout
- `BentoList` - Project/task lists
- `BentoProgress` - Project progress
- `ProgressCard` - Milestones
- `ModernButton` - CTAs
- `PillButton` - Quick filters

**Example:**
```tsx
import { BentoGrid, BentoList, BentoProgress } from '@/components/ui/bento-grid-advanced'
import { ModernButton, PillButton } from '@/components/ui/modern-buttons'

export default function ProjectsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Filter Pills */}
      <div className="flex gap-3">
        <PillButton variant="primary">All Projects</PillButton>
        <PillButton variant="ghost">Active</PillButton>
        <PillButton variant="ghost">Completed</PillButton>
        <PillButton variant="ghost">Archived</PillButton>
      </div>

      {/* Projects Grid */}
      <BentoGrid columns={2}>
        <BentoList
          title="Active Projects"
          items={activeProjects}
        />

        <BentoProgress
          title="Project Milestones"
          items={milestones}
        />
      </BentoGrid>

      {/* CTA */}
      <ModernButton
        variant="gradient"
        size="lg"
        icon={<Plus />}
        onClick={() => createProject()}
      >
        Create New Project
      </ModernButton>
    </div>
  )
}
```

### For All Button Replacements
**Replace:**
- Old `<Button>` → `<ModernButton>`
- Primary CTAs → `<GradientButton>`
- Pill-shaped → `<PillButton>`
- Icon buttons → `<IconButton>`
- Loading buttons → `<ModernButton loading={true}>`

**Example:**
```tsx
// OLD
<Button variant="default">Submit</Button>

// NEW
<ModernButton variant="primary" size="md">
  Submit
</ModernButton>

// PRIMARY CTA
<GradientButton from="violet" to="purple">
  Get Started
</GradientButton>

// ICON BUTTON
<IconButton
  icon={<Settings />}
  ariaLabel="Open settings"
  variant="ghost"
/>

// LOADING STATE
<ModernButton
  variant="primary"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</ModernButton>
```

---

## 🎯 Priority Pages to Wire

### High Priority (Do First)
1. **Dashboard Overview** (`/dashboard/page.tsx`)
   - Replace with bento grid layout
   - Add KPI stats
   - Wire modern buttons

2. **AI Create** (`/dashboard/ai-create/page.tsx`)
   - Add AI sandbox
   - Implement thinking states
   - Wire result displays

3. **Analytics** (`/dashboard/analytics/**`)
   - Wire stat grids
   - Add progress cards
   - Implement ranking lists

4. **Projects Hub** (`/dashboard/projects-hub/page.tsx`)
   - Bento grid layout
   - Progress tracking
   - Modern buttons

5. **My Day** (`/dashboard/my-day/page.tsx`)
   - Bento stat cards
   - Quick actions
   - Activity feed

### Medium Priority
6. **Video Studio** - AI thinking states, results
7. **Canvas Studio** - Bento gallery, modern buttons
8. **Files Hub** - Bento list, progress cards
9. **Team Hub** - Ranking list, stat grid
10. **Bookings** - Calendar with bento cards

### Low Priority (Nice to Have)
11. **Settings pages** - Modern buttons, forms
12. **Admin pages** - Stat grids, KPIs
13. **Marketing pages** - Gradient buttons
14. **Client Zone** - Custom bento layouts

---

## 📦 Import Cheat Sheet

```tsx
// Bento Grids
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoHero,
  BentoChart,
  BentoList,
  BentoGallery,
  BentoQuickAction,
  BentoProgress,
  BentoDashboardLayout
} from '@/components/ui/bento-grid-advanced'

// AI Components
import {
  AISandbox,
  AIThinking,
  AIResult,
  AIResultCard,
  AIStreamingText
} from '@/components/ui/ai-components'

// Modern Buttons
import {
  ModernButton,
  GradientButton,
  PillButton,
  GlowButton,
  ExpandButton,
  IconButton,
  ButtonGroup,
  SplitButton
} from '@/components/ui/modern-buttons'

// Results Display
import {
  KPICard,
  MiniKPI,
  StatGrid,
  ProgressCard,
  CircularProgress,
  ComparisonCard,
  RankingList,
  ActivityFeed
} from '@/components/ui/results-display'
```

---

## ✅ Implementation Checklist

For each page:
- [ ] Import new components
- [ ] Replace layout with BentoGrid (if applicable)
- [ ] Wire KPI/stat cards
- [ ] Update all buttons to modern variants
- [ ] Add AI components (if AI feature)
- [ ] Add loading states
- [ ] Add empty states
- [ ] Test responsiveness
- [ ] Test accessibility
- [ ] Test dark mode
- [ ] Commit changes

---

## 🚀 Next Steps

1. Start with Dashboard Overview
2. Move to AI Create
3. Wire Analytics pages
4. Update all buttons platform-wide
5. Add AI components to AI features
6. Test consistency across all pages
7. Deploy to production

---

**Document Created:** December 12, 2025
**Purpose:** Systematic component wiring guide
**Status:** Ready for implementation
