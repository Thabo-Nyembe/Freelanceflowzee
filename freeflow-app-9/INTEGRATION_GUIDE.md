# V2 Pages Integration Guide

## 📋 Overview

Step-by-step guide to integrate all 44 V2 dashboard pages with Supabase backend, replacing mock data with real database connections.

**Created:** December 14, 2024
**Estimated Time:** 4-5 weeks
**Prerequisites:** Database schemas created, hooks library built

---

## 🎯 Prerequisites Checklist

Before starting integration, ensure you have:

- [ ] Supabase project created and configured
- [ ] Database schemas deployed (from DATABASE_SCHEMAS.md)
- [ ] Environment variables set (.env.local)
- [ ] Supabase client configured
- [ ] Authentication working
- [ ] Hooks library created (from HOOKS_LIBRARY.md)
- [ ] Server actions created (from API_ENDPOINTS.md)

---

## 🔧 Setup Steps

### Step 1: Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Database Migration

```bash
# Run database migrations in Supabase SQL Editor
# Or use Supabase CLI

npx supabase db push

# Enable real-time for all tables
# Run the real-time setup from DATABASE_SCHEMAS.md
```

### Step 3: Create Hooks Library

```bash
# Create hooks directory
mkdir -p lib/hooks

# Create the base hooks
touch lib/hooks/use-supabase-query.ts
touch lib/hooks/use-supabase-mutation.ts

# Copy implementations from HOOKS_LIBRARY.md
```

### Step 4: Create Server Actions

```bash
# Create actions directory
mkdir -p app/actions

# Create action files for each batch
touch app/actions/events.ts
touch app/actions/webinars.ts
# ... etc
```

---

## 📊 Integration Pattern

Each V2 page follows this integration pattern:

### Before (Mock Data):

```typescript
// app/(app)/dashboard/events-v2/page.tsx
'use client'

const mockEvents = [
  { id: '1', name: 'Mock Event', status: 'upcoming' },
  // ... mock data
]

export default function EventsPage() {
  const [events] = useState(mockEvents)
  return <div>{/* Render events */}</div>
}
```

### After (Real Data):

```typescript
// app/(app)/dashboard/events-v2/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EventsClient from './events-client'

export default async function EventsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch real data on server
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .is('deleted_at', null)
    .order('start_date', { ascending: false })

  return <EventsClient initialEvents={events || []} />
}
```

```typescript
// app/(app)/dashboard/events-v2/events-client.tsx
'use client'

import { useEvents } from '@/lib/hooks/use-events'
import type { Event } from '@/lib/hooks/use-events'

export default function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const { events, loading, createEvent, updateEvent } = useEvents()

  // Use real-time data with initial SSR data as fallback
  const displayEvents = events.length > 0 ? events : initialEvents

  return <div>{/* Render with real data + real-time updates */}</div>
}
```

---

## 📊 Batch 30: Events & Webinars Integration

### Page 1: Events V2

**File:** `app/(app)/dashboard/events-v2/page.tsx`

**Step-by-Step:**

1. **Create the hook** (`lib/hooks/use-events.ts`)

```typescript
// Copy the useEvents hook from HOOKS_LIBRARY.md
export function useEvents(options: UseEventsOptions = {}) {
  // ... implementation
}
```

2. **Create server actions** (`app/actions/events.ts`)

```typescript
// Copy server actions from API_ENDPOINTS.md
export async function createEvent(data: EventData) {
  // ... implementation
}
```

3. **Split page into Server + Client components**

```typescript
// app/(app)/dashboard/events-v2/page.tsx (Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EventsClient from './events-client'

export default async function EventsPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .is('deleted_at', null)
    .order('start_date', { ascending: false })
    .limit(50)

  return <EventsClient initialEvents={events || []} />
}
```

4. **Create client component** (`app/(app)/dashboard/events-v2/events-client.tsx`)

```typescript
'use client'

import { useEvents, type Event } from '@/lib/hooks/use-events'
import { useState } from 'react'
import { StatGrid, BentoQuickAction, PillButton } from '@/components/ui'
import { createEvent, updateEvent } from '@/app/actions/events'

interface EventsClientProps {
  initialEvents: Event[]
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all')

  const { events, loading, error } = useEvents({
    status: statusFilter,
    eventType: typeFilter
  })

  // Use real-time data or fallback to initial SSR data
  const displayEvents = events.length > 0 ? events : initialEvents

  const filteredEvents = displayEvents.filter(event => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false
    return true
  })

  // Calculate stats
  const stats = {
    total: displayEvents.length,
    upcoming: displayEvents.filter(e => e.status === 'upcoming').length,
    ongoing: displayEvents.filter(e => e.status === 'ongoing').length,
    completed: displayEvents.filter(e => e.status === 'completed').length,
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Events</h1>
        <p className="text-muted-foreground">Manage your events and conferences</p>
      </div>

      {/* Stats */}
      <StatGrid
        stats={[
          { label: 'Total Events', value: stats.total.toString(), trend: '+12%' },
          { label: 'Upcoming', value: stats.upcoming.toString() },
          { label: 'Ongoing', value: stats.ongoing.toString() },
          { label: 'Completed', value: stats.completed.toString() },
        ]}
      />

      {/* Quick Actions */}
      <BentoQuickAction
        actions={[
          { label: 'Create Event', icon: 'Plus', onClick: () => {} },
          { label: 'View Calendar', icon: 'Calendar' },
          // ... more actions
        ]}
      />

      {/* Filters */}
      <div className="flex gap-2">
        <PillButton
          label="All"
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
        />
        <PillButton
          label="Upcoming"
          active={statusFilter === 'upcoming'}
          onClick={() => setStatusFilter('upcoming')}
        />
        {/* ... more filters */}
      </div>

      {/* Events List */}
      {loading && <div>Loading events...</div>}
      {error && <div>Error loading events: {error.message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="p-6 bg-white rounded-xl border hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>

              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* MiniKPI, ActivityFeed, etc. */}
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'upcoming': return 'bg-blue-100 text-blue-700'
    case 'ongoing': return 'bg-green-100 text-green-700'
    case 'completed': return 'bg-gray-100 text-gray-700'
    case 'cancelled': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
```

5. **Test the integration**

```bash
# Start dev server
npm run dev

# Navigate to /dashboard/events-v2
# Verify:
# - Data loads from Supabase
# - Filters work
# - Real-time updates appear when data changes
# - No TypeScript errors
```

### Page 2: Webinars V2

**File:** `app/(app)/dashboard/webinars-v2/page.tsx`

Follow the same pattern as Events:

1. Create hook: `lib/hooks/use-webinars.ts`
2. Create actions: `app/actions/webinars.ts`
3. Split into server + client components
4. Test integration

### Page 3: Registrations V2

**File:** `app/(app)/dashboard/registrations-v2/page.tsx`

Follow the same pattern with registration-specific logic.

---

## 📊 Batch 31: Announcements & Communications Integration

### Page 4: Announcements V2

**Unique Features:**
- Publishing workflow (draft → published)
- View tracking
- Reactions and comments

```typescript
// app/(app)/dashboard/announcements-v2/events-client.tsx

import { useAnnouncements } from '@/lib/hooks/use-announcements'
import { publishAnnouncement, incrementViews } from '@/app/actions/announcements'

export default function AnnouncementsClient({ initialAnnouncements }) {
  const { announcements } = useAnnouncements({ status: 'published' })

  async function handlePublish(id: string) {
    await publishAnnouncement(id)
    // Real-time updates will automatically reflect the change
  }

  return (
    // ... component implementation
  )
}
```

### Page 5: Broadcasts V2

**Unique Features:**
- Scheduling
- Send status tracking
- Delivery metrics

```typescript
// Integration includes scheduled send functionality
import { scheduleBroadcast, sendBroadcast } from '@/app/actions/broadcasts'
```

### Page 6: Surveys V2

**Unique Features:**
- Dynamic question handling (JSONB field)
- Response aggregation
- NPS calculation

---

## 🔄 Real-time Integration Example

### Enable Real-time Subscriptions

```typescript
// lib/hooks/use-events.ts

useEffect(() => {
  const channel = supabase
    .channel('events-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Change received!', payload)

        if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as Event, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev =>
            prev.map(event =>
              event.id === payload.new.id ? payload.new as Event : event
            )
          )
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(event => event.id !== payload.old.id))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user.id])
```

---

## 🎯 Common Integration Patterns

### Pattern 1: Filtering

```typescript
const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')

const { data } = useEntity({
  status: statusFilter === 'all' ? undefined : statusFilter
})
```

### Pattern 2: Pagination

```typescript
const [page, setPage] = useState(1)
const pageSize = 20

const { data } = useEntity({
  limit: pageSize,
  offset: (page - 1) * pageSize
})
```

### Pattern 3: Search

```typescript
const [searchQuery, setSearchQuery] = useState('')

const filteredData = data.filter(item =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
)
```

### Pattern 4: Optimistic Updates

```typescript
async function handleUpdate(id: string, changes: Partial<Entity>) {
  // Update UI immediately
  setData(prev =>
    prev.map(item => (item.id === id ? { ...item, ...changes } : item))
  )

  try {
    // Send to server
    await updateEntity(id, changes)
    // Real-time subscription will sync if needed
  } catch (error) {
    // Revert on error
    toast.error('Update failed')
    // Refetch to restore correct state
    refetch()
  }
}
```

---

## 🧪 Testing Checklist

For each integrated page, verify:

### Data Loading
- [ ] Initial data loads from Supabase on server
- [ ] Loading states display correctly
- [ ] Error states handle failures gracefully
- [ ] Empty states show when no data

### Real-time Updates
- [ ] New records appear automatically
- [ ] Updated records reflect changes
- [ ] Deleted records are removed
- [ ] No duplicate subscriptions

### Filtering & Search
- [ ] Status filters work correctly
- [ ] Category filters work correctly
- [ ] Search filters data properly
- [ ] Multiple filters combine correctly

### CRUD Operations
- [ ] Create works and updates UI
- [ ] Read displays current data
- [ ] Update saves changes
- [ ] Delete removes records (soft delete)

### Performance
- [ ] No unnecessary re-renders
- [ ] Queries are optimized with indexes
- [ ] Real-time subscriptions clean up properly
- [ ] No memory leaks

### Authentication
- [ ] Only authenticated users can access
- [ ] Users see only their own data
- [ ] RLS policies enforce security
- [ ] Proper error handling for auth failures

---

## 📊 Batch-by-Batch Integration Order

### Week 1: Foundation + Batch 30-31 (6 pages)
- [x] Setup hooks library
- [x] Create server actions
- [ ] Integrate events-v2
- [ ] Integrate webinars-v2
- [ ] Integrate registrations-v2
- [ ] Integrate announcements-v2
- [ ] Integrate broadcasts-v2
- [ ] Integrate surveys-v2

### Week 2: Batch 32-34 (9 pages)
- [ ] Integrate feedback-v2
- [ ] Integrate forms-v2
- [ ] Integrate polls-v2
- [ ] Integrate shipping-v2
- [ ] Integrate logistics-v2
- [ ] Integrate social-media-v2
- [ ] Integrate learning-v2
- [ ] Integrate certifications-v2
- [ ] Integrate compliance-v2

### Week 3: Batch 35-37 (9 pages)
- [ ] Integrate backups-v2
- [ ] Integrate maintenance-v2
- [ ] Integrate alerts-v2
- [ ] Integrate automations-v2
- [ ] Integrate workflows-v2
- [ ] Integrate data-export-v2
- [ ] Integrate ci-cd-v2
- [ ] Integrate security-audit-v2
- [ ] Integrate vulnerability-scan-v2

### Week 4: Batch 38-40 (9 pages)
- [ ] Integrate access-logs-v2
- [ ] Integrate activity-logs-v2
- [ ] Integrate changelog-v2
- [ ] Integrate release-notes-v2
- [ ] Integrate support-tickets-v2
- [ ] Integrate customer-support-v2
- [ ] Integrate documentation-v2
- [ ] Integrate tutorials-v2
- [ ] Integrate help-docs-v2

### Week 5: Batch 41-44 (11 pages) + Testing
- [ ] Integrate faq-v2
- [ ] Integrate knowledge-articles-v2
- [ ] Integrate widget-library-v2
- [ ] Integrate plugins-v2
- [ ] Integrate extensions-v2
- [ ] Integrate add-ons-v2
- [ ] Integrate integrations-marketplace-v2
- [ ] Integrate app-store-v2
- [ ] Integrate third-party-integrations-v2
- [ ] Integrate component-library-v2
- [ ] Integrate theme-store-v2
- [ ] Comprehensive testing

---

## 🚀 Quick Integration Template

Use this template for rapid integration:

```typescript
// 1. Create hook: lib/hooks/use-[entity].ts
export function use[Entity](options = {}) {
  const { data, loading, error } = useSupabaseQuery<[Entity]>({
    table: '[table_name]',
    filters: options,
    realtime: true
  })

  const { create, update, remove } = useSupabaseMutation({
    table: '[table_name]'
  })

  return { data, loading, error, create, update, remove }
}

// 2. Create actions: app/actions/[entity].ts
'use server'

export async function create[Entity](data) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: result, error } = await supabase
    .from('[table_name]')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/[page]-v2')
  return result
}

// 3. Split page: app/(app)/dashboard/[page]-v2/page.tsx
export default async function [Entity]Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase.from('[table_name]').select('*')
  return <[Entity]Client initialData={data || []} />
}

// 4. Client component: app/(app)/dashboard/[page]-v2/client.tsx
'use client'

export default function [Entity]Client({ initialData }) {
  const { data } = use[Entity]()
  const displayData = data.length > 0 ? data : initialData
  return <div>{/* Render with displayData */}</div>
}
```

---

## 📚 Troubleshooting

### Issue: Data not loading

**Solution:**
```typescript
// Check Supabase client configuration
// Verify RLS policies allow access
// Check browser console for errors
// Verify user is authenticated
```

### Issue: Real-time not working

**Solution:**
```typescript
// Enable real-time in Supabase dashboard
// Check real-time configuration
ALTER PUBLICATION supabase_realtime ADD TABLE [table_name];

// Verify subscription cleanup
useEffect(() => {
  // ... subscription
  return () => supabase.removeChannel(channel)
}, [])
```

### Issue: TypeScript errors

**Solution:**
```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

---

## 📚 Next Steps

1. **Create TESTING_GUIDE.md** - Testing strategies
2. **Create DEPLOYMENT_GUIDE.md** - Production deployment
3. **Start integration** - Begin with Batch 30

---

**Last Updated:** December 14, 2024
**Status:** Integration guide complete
**Next:** Begin systematic integration starting with Batch 30
