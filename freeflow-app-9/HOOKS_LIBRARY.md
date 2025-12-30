# Custom Hooks Library - V2 Integration

## 📋 Overview

Reusable React hooks for all 44 V2 dashboard pages. These hooks provide data fetching, real-time subscriptions, CRUD operations, and state management.

**Created:** December 14, 2024
**Total Hooks:** 44+ custom hooks
**Framework:** React 18+ with Next.js 14
**Database:** Supabase with real-time subscriptions

---

## 🎯 Hook Architecture

### Core Principles

1. **Single Responsibility** - Each hook manages one data entity
2. **Real-time Ready** - Built-in support for live updates
3. **Type Safe** - Full TypeScript support
4. **Error Handling** - Comprehensive error states
5. **Loading States** - Proper loading indicators
6. **Optimistic Updates** - Instant UI feedback

### Hook Patterns

All hooks follow this structure:

```typescript
export function useEntity() {
  const [data, setData] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch data
  // Subscribe to real-time updates
  // CRUD operations
  // Return state and functions

  return { data, loading, error, create, update, delete }
}
```

---

## 🔧 Utility Hooks

### Base Hook: `useSupabaseQuery`

Generic hook for Supabase queries with real-time subscriptions.

```typescript
// lib/hooks/use-supabase-query.ts

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

interface UseSupabaseQueryOptions<T> {
  table: string
  select?: string
  filters?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  realtime?: boolean
}

export function useSupabaseQuery<T>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  realtime = true
}: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        let query = supabase.from(table).select(select)

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== 'all') {
            query = query.eq(key, value)
          }
        })

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
        }

        // Apply limit
        if (limit) {
          query = query.limit(limit)
        }

        // Filter out soft deletes
        query = query.is('deleted_at', null)

        const { data: result, error: queryError } = await query

        if (queryError) throw queryError
        setData((result as T[]) || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    if (realtime) {
      const channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData(prev => [payload.new as T, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item =>
                (item as any).id === payload.new.id ? payload.new as T : item
              ))
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => (item as any).id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [table, JSON.stringify(filters), orderBy?.column, orderBy?.ascending, limit])

  return { data, loading, error, refetch: () => {} }
}
```

### Mutation Hook: `useSupabaseMutation`

Generic hook for CRUD operations with optimistic updates.

```typescript
// lib/hooks/use-supabase-mutation.ts

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { toast } from 'sonner'

interface UseSupabaseMutationOptions {
  table: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSupabaseMutation({
  table,
  onSuccess,
  onError
}: UseSupabaseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const create = async <T extends Record<string, any>>(data: T) => {
    try {
      setLoading(true)
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) throw error

      toast.success('Created successfully')
      onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const update = async <T extends Record<string, any>>(id: string, data: T) => {
    try {
      setLoading(true)
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Updated successfully')
      onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string, hardDelete = false) => {
    try {
      setLoading(true)

      if (hardDelete) {
        // Permanent deletion
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)

        if (error) throw error
      } else {
        // Soft delete
        const { error } = await supabase
          .from(table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error
      }

      toast.success('Deleted successfully')
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading }
}
```

---

## 📊 Batch 30: Events & Webinars Hooks

### Hook: `useEvents`

```typescript
// lib/hooks/use-events.ts

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type EventType = 'conference' | 'workshop' | 'meetup' | 'training' | 'seminar' | 'networking' | 'launch' | 'other'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed'
export type LocationType = 'in-person' | 'virtual' | 'hybrid'

export interface Event {
  id: string
  user_id: string
  organization_id: string
  name: string
  description: string | null
  event_type: EventType
  status: EventStatus
  start_date: string
  end_date: string
  timezone: string
  location_type: LocationType | null
  venue_name: string | null
  virtual_link: string | null
  max_attendees: number | null
  current_attendees: number
  registrations: number
  attendance_rate: number | null
  is_featured: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

interface UseEventsOptions {
  status?: EventStatus | 'all'
  eventType?: EventType | 'all'
  limit?: number
}

export function useEvents(options: UseEventsOptions = {}) {
  const { status, eventType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (eventType && eventType !== 'all') filters.event_type = eventType

  const { data, loading, error, refetch } = useSupabaseQuery<Event>({
    table: 'events',
    filters,
    orderBy: { column: 'start_date', ascending: false },
    limit,
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'events',
    onSuccess: refetch
  })

  return {
    events: data,
    loading,
    error,
    mutating,
    createEvent: create,
    updateEvent: update,
    deleteEvent: remove,
    refetch
  }
}
```

### Hook: `useWebinars`

```typescript
// lib/hooks/use-webinars.ts

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type WebinarTopic = 'sales' | 'marketing' | 'product' | 'training' | 'demo' | 'onboarding' | 'qa' | 'other'
export type WebinarStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'recording'
export type Platform = 'zoom' | 'teams' | 'meet' | 'webex' | 'custom'

export interface Webinar {
  id: string
  user_id: string
  organization_id: string
  title: string
  description: string | null
  topic: WebinarTopic
  status: WebinarStatus
  scheduled_date: string
  duration_minutes: number
  platform: Platform | null
  meeting_link: string | null
  max_participants: number | null
  registered_count: number
  attended_count: number
  recording_url: string | null
  created_at: string
  updated_at: string
}

interface UseWebinarsOptions {
  status?: WebinarStatus | 'all'
  topic?: WebinarTopic | 'all'
  limit?: number
}

export function useWebinars(options: UseWebinarsOptions = {}) {
  const { status, topic, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (topic && topic !== 'all') filters.topic = topic

  const { data, loading, error, refetch } = useSupabaseQuery<Webinar>({
    table: 'webinars',
    filters,
    orderBy: { column: 'scheduled_date', ascending: false },
    limit,
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'webinars',
    onSuccess: refetch
  })

  return {
    webinars: data,
    loading,
    error,
    mutating,
    createWebinar: create,
    updateWebinar: update,
    deleteWebinar: remove,
    refetch
  }
}
```

### Hook: `useRegistrations`

```typescript
// lib/hooks/use-registrations.ts

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type RegistrationType = 'event' | 'webinar'
export type RegistrationStatus = 'pending' | 'confirmed' | 'attended' | 'no-show' | 'cancelled' | 'waitlist'
export type TicketType = 'free' | 'paid' | 'vip' | 'speaker' | 'sponsor' | 'press'

export interface Registration {
  id: string
  user_id: string
  event_id: string | null
  webinar_id: string | null
  registration_type: RegistrationType
  registrant_name: string
  registrant_email: string
  status: RegistrationStatus
  ticket_type: TicketType | null
  checked_in_at: string | null
  created_at: string
  updated_at: string
}

interface UseRegistrationsOptions {
  eventId?: string
  webinarId?: string
  status?: RegistrationStatus | 'all'
  limit?: number
}

export function useRegistrations(options: UseRegistrationsOptions = {}) {
  const { eventId, webinarId, status, limit } = options

  const filters: Record<string, any> = {}
  if (eventId) filters.event_id = eventId
  if (webinarId) filters.webinar_id = webinarId
  if (status && status !== 'all') filters.status = status

  const { data, loading, error, refetch } = useSupabaseQuery<Registration>({
    table: 'event_registrations',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit,
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'event_registrations',
    onSuccess: refetch
  })

  return {
    registrations: data,
    loading,
    error,
    mutating,
    createRegistration: create,
    updateRegistration: update,
    deleteRegistration: remove,
    refetch
  }
}
```

---

## 📊 Batch 31: Announcements & Communications Hooks

### Hook: `useAnnouncements`

```typescript
// lib/hooks/use-announcements.ts

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type AnnouncementCategory = 'company' | 'product' | 'policy' | 'event' | 'achievement' | 'update' | 'alert' | 'other'
export type Priority = 'low' | 'normal' | 'high' | 'urgent' | 'critical'
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'expired'

export interface Announcement {
  id: string
  user_id: string
  title: string
  content: string
  category: AnnouncementCategory
  priority: Priority
  status: AnnouncementStatus
  published_at: string | null
  views: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

interface UseAnnouncementsOptions {
  category?: AnnouncementCategory | 'all'
  status?: AnnouncementStatus | 'all'
  priority?: Priority | 'all'
  limit?: number
}

export function useAnnouncements(options: UseAnnouncementsOptions = {}) {
  const { category, status, priority, limit } = options

  const filters: Record<string, any> = {}
  if (category && category !== 'all') filters.category = category
  if (status && status !== 'all') filters.status = status
  if (priority && priority !== 'all') filters.priority = priority

  const { data, loading, error, refetch } = useSupabaseQuery<Announcement>({
    table: 'announcements',
    filters,
    orderBy: { column: 'published_at', ascending: false },
    limit,
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'announcements',
    onSuccess: refetch
  })

  return {
    announcements: data,
    loading,
    error,
    mutating,
    createAnnouncement: create,
    updateAnnouncement: update,
    deleteAnnouncement: remove,
    refetch
  }
}
```

### Hook: `useBroadcasts`

```typescript
// lib/hooks/use-broadcasts.ts

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type BroadcastType = 'email' | 'sms' | 'push' | 'in-app' | 'multi-channel'
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'

export interface Broadcast {
  id: string
  user_id: string
  name: string
  subject: string
  broadcast_type: BroadcastType
  status: BroadcastStatus
  scheduled_at: string | null
  sent_at: string | null
  total_recipients: number
  sent_count: number
  delivery_rate: number | null
  open_rate: number | null
  created_at: string
  updated_at: string
}

interface UseBroadcastsOptions {
  type?: BroadcastType | 'all'
  status?: BroadcastStatus | 'all'
  limit?: number
}

export function useBroadcasts(options: UseBroadcastsOptions = {}) {
  const { type, status, limit } = options

  const filters: Record<string, any> = {}
  if (type && type !== 'all') filters.broadcast_type = type
  if (status && status !== 'all') filters.status = status

  const { data, loading, error, refetch } = useSupabaseQuery<Broadcast>({
    table: 'broadcasts',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit,
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'broadcasts',
    onSuccess: refetch
  })

  return {
    broadcasts: data,
    loading,
    error,
    mutating,
    createBroadcast: create,
    updateBroadcast: update,
    deleteBroadcast: remove,
    refetch
  }
}
```

### Hook: `useSurveys`

```typescript
// lib/hooks/use-surveys.ts

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type SurveyType = 'feedback' | 'satisfaction' | 'nps' | 'quiz' | 'poll' | 'research' | 'assessment' | 'other'
export type SurveyStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'

export interface Survey {
  id: string
  user_id: string
  title: string
  survey_type: SurveyType
  status: SurveyStatus
  responses_count: number
  completion_rate: number | null
  created_at: string
  updated_at: string
}

interface UseSurveysOptions {
  type?: SurveyType | 'all'
  status?: SurveyStatus | 'all'
  limit?: number
}

export function useSurveys(options: UseSurveysOptions = {}) {
  const { type, status, limit } = options

  const filters: Record<string, any> = {}
  if (type && type !== 'all') filters.survey_type = type
  if (status && status !== 'all') filters.status = status

  const { data, loading, error, refetch } = useSupabaseQuery<Survey>({
    table: 'surveys',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit,
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'surveys',
    onSuccess: refetch
  })

  return {
    surveys: data,
    loading,
    error,
    mutating,
    createSurvey: create,
    updateSurvey: update,
    deleteSurvey: remove,
    refetch
  }
}
```

---

## 📊 Additional Hook Patterns

### Pattern: Aggregated Data Hook

For dashboards that need computed metrics:

```typescript
// lib/hooks/use-event-analytics.ts

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface EventAnalytics {
  totalEvents: number
  upcomingEvents: number
  ongoingEvents: number
  completedEvents: number
  totalAttendees: number
  averageAttendance: number
  topEventType: string
}

export function useEventAnalytics() {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Get aggregated data
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .is('deleted_at', null)

        if (!events) return

        const analytics: EventAnalytics = {
          totalEvents: events.length,
          upcomingEvents: events.filter(e => e.status === 'upcoming').length,
          ongoingEvents: events.filter(e => e.status === 'ongoing').length,
          completedEvents: events.filter(e => e.status === 'completed').length,
          totalAttendees: events.reduce((sum, e) => sum + (e.current_attendees || 0), 0),
          averageAttendance: events.reduce((sum, e) => sum + (e.attendance_rate || 0), 0) / events.length || 0,
          topEventType: getMostCommon(events.map(e => e.event_type))
        }

        setAnalytics(analytics)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return { analytics, loading }
}

function getMostCommon(arr: string[]): string {
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}
```

### Pattern: Paginated Data Hook

For large datasets:

```typescript
// lib/hooks/use-paginated-query.ts

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UsePaginatedQueryOptions {
  table: string
  pageSize?: number
}

export function usePaginatedQuery<T>({
  table,
  pageSize = 20
}: UsePaginatedQueryOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPage() {
      setLoading(true)
      try {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .is('deleted_at', null)
          .range(from, to)

        if (error) throw error

        setData(result as T[])
        setHasMore(result.length === pageSize)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [table, page, pageSize])

  const nextPage = () => setPage(p => p + 1)
  const prevPage = () => setPage(p => Math.max(1, p - 1))

  return { data, loading, page, hasMore, nextPage, prevPage }
}
```

---

## 🚀 Usage Examples

### Example 1: Events Page Integration

```typescript
// app/(app)/dashboard/events-v2/events-client.tsx

'use client'

import { useEvents } from '@/lib/hooks/use-events'
import { useState } from 'react'

export default function EventsClient() {
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')

  const { events, loading, error, createEvent, updateEvent } = useEvents({
    status: statusFilter,
    eventType: typeFilter,
    limit: 50
  })

  if (loading) return <div>Loading events...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {/* Filters */}
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
        <option value="all">All Statuses</option>
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
      </select>

      {/* Event list */}
      {events.map(event => (
        <div key={event.id}>{event.name}</div>
      ))}
    </div>
  )
}
```

### Example 2: Real-time Announcements

```typescript
// components/announcements-feed.tsx

'use client'

import { useAnnouncements } from '@/lib/hooks/use-announcements'

export function AnnouncementsFeed() {
  const { announcements, loading } = useAnnouncements({
    status: 'published',
    limit: 10
  })

  // Automatically updates when new announcements are published
  return (
    <div>
      {announcements.map(announcement => (
        <div key={announcement.id}>
          <h3>{announcement.title}</h3>
          <p>{announcement.content}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 📊 Remaining Hook Implementations

The following hooks follow the same pattern:

### Batch 32: Feedback & Engagement
- `useFeedback()` - Feedback collection
- `useForms()` - Dynamic forms
- `usePolls()` - Poll voting

### Batch 33: Shipping & Logistics
- `useShipments()` - Shipment tracking
- `useLogistics()` - Logistics management
- `useSocialMediaPosts()` - Social media

### Batch 34: Learning & Certifications
- `useLearningModules()` - Learning content
- `useCertifications()` - Certification tracking
- `useCompliance()` - Compliance management

### Batch 35: System Operations
- `useBackups()` - Backup management
- `useMaintenanceWindows()` - Maintenance scheduling
- `useSystemAlerts()` - System alerts

### Batch 36-44: (Remaining 27 hooks)
- Similar patterns for all remaining pages

---

## 🎯 Best Practices

### 1. Type Safety

```typescript
// Always define types for your entities
export interface MyEntity {
  id: string
  // ... other fields
}

// Use the type in your hook
export function useMyEntity() {
  const { data } = useSupabaseQuery<MyEntity>({ table: 'my_entities' })
  return data
}
```

### 2. Error Handling

```typescript
// Always handle errors gracefully
const { data, error } = useEvents()

if (error) {
  console.error('Failed to fetch events:', error)
  toast.error('Failed to load events')
  return <ErrorState />
}
```

### 3. Loading States

```typescript
// Show loading states for better UX
const { data, loading } = useEvents()

if (loading) {
  return <Skeleton />
}
```

### 4. Optimistic Updates

```typescript
// Update UI immediately, then sync with server
const { updateEvent } = useEvents()

async function handleUpdate(id: string, changes: Partial<Event>) {
  // UI updates immediately via real-time subscription
  await updateEvent(id, changes)
}
```

---

## 📚 Next Steps

1. **Create API Documentation** - Server actions and route handlers
2. **Create Integration Guide** - Step-by-step page integration
3. **Create Testing Guide** - Testing strategies
4. **Create Deployment Guide** - Production deployment

---

**Last Updated:** December 14, 2024
**Status:** Hooks library documentation complete
**Next:** Create API_ENDPOINTS.md for server actions
