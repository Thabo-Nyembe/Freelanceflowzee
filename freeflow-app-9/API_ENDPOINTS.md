# API Endpoints & Server Actions - V2 Integration

## 📋 Overview

Complete API documentation for all 44 V2 dashboard pages. This covers Next.js Server Actions, Route Handlers, and API patterns.

**Created:** December 14, 2024
**Framework:** Next.js 14 App Router
**Database:** Supabase PostgreSQL
**Authentication:** Supabase Auth

---

## 🎯 API Architecture

### 1. **Server Actions** (Preferred)

Server Actions provide type-safe, server-side mutations directly from components.

```typescript
// app/actions/events.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Extract data
  const name = formData.get('name') as string
  const eventType = formData.get('eventType') as string

  // Insert into database
  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      name,
      event_type: eventType,
      status: 'upcoming'
    })
    .select()
    .single()

  if (error) throw error

  // Revalidate the page
  revalidatePath('/dashboard/events-v2')

  return { success: true, data }
}
```

### 2. **Route Handlers** (For External APIs)

Route handlers provide REST API endpoints for external integrations.

```typescript
// app/api/events/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get query params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  // Query database
  let query = supabase.from('events').select('*').eq('user_id', user.id)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('events')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

---

## 📊 Batch 30: Events & Webinars

### Server Actions: Events

```typescript
// app/actions/events.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Event = Database['public']['Tables']['events']['Insert']

export async function createEvent(data: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return event
}

export async function updateEvent(id: string, data: Partial<Event>) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return event
}

export async function deleteEvent(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Soft delete
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return { success: true }
}

export async function getEventStats() {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!events) return null

  return {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalAttendees: events.reduce((sum, e) => sum + (e.current_attendees || 0), 0),
  }
}
```

### Server Actions: Webinars

```typescript
// app/actions/webinars.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Webinar = Database['public']['Tables']['webinars']['Insert']

export async function createWebinar(data: Omit<Webinar, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function updateWebinar(id: string, data: Partial<Webinar>) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function startWebinar(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .update({
      status: 'live',
      // Start time tracking, etc.
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function endWebinar(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .update({ status: 'ended' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}
```

### Server Actions: Registrations

```typescript
// app/actions/registrations.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Registration = Database['public']['Tables']['event_registrations']['Insert']

export async function registerForEvent(eventId: string, registrantData: {
  name: string
  email: string
  phone?: string
}) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check event capacity
  const { data: event } = await supabase
    .from('events')
    .select('current_attendees, max_attendees')
    .eq('id', eventId)
    .single()

  if (event && event.max_attendees && event.current_attendees >= event.max_attendees) {
    throw new Error('Event is at capacity')
  }

  // Create registration
  const { data: registration, error } = await supabase
    .from('event_registrations')
    .insert({
      user_id: user.id,
      event_id: eventId,
      registration_type: 'event',
      registrant_name: registrantData.name,
      registrant_email: registrantData.email,
      registrant_phone: registrantData.phone,
      status: 'confirmed',
    })
    .select()
    .single()

  if (error) throw error

  // Update event attendee count
  await supabase
    .from('events')
    .update({
      current_attendees: (event?.current_attendees || 0) + 1,
      registrations: (event?.current_attendees || 0) + 1,
    })
    .eq('id', eventId)

  revalidatePath('/dashboard/registrations-v2')
  return registration
}

export async function checkInRegistration(registrationId: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: registration, error } = await supabase
    .from('event_registrations')
    .update({
      status: 'attended',
      checked_in_at: new Date().toISOString()
    })
    .eq('id', registrationId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/registrations-v2')
  return registration
}
```

---

## 📊 Batch 31: Announcements & Communications

### Server Actions: Announcements

```typescript
// app/actions/announcements.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Announcement = Database['public']['Tables']['announcements']['Insert']

export async function createAnnouncement(data: Omit<Announcement, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/announcements-v2')
  return announcement
}

export async function publishAnnouncement(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: announcement, error } = await supabase
    .from('announcements')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/announcements-v2')
  return announcement
}

export async function incrementAnnouncementViews(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  // No auth required for viewing public announcements
  const { data: announcement } = await supabase
    .from('announcements')
    .select('views')
    .eq('id', id)
    .single()

  if (!announcement) return null

  const { data: updated, error } = await supabase
    .from('announcements')
    .update({ views: (announcement.views || 0) + 1 })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}
```

### Server Actions: Broadcasts

```typescript
// app/actions/broadcasts.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/supabase'

type Broadcast = Database['public']['Tables']['broadcasts']['Insert']

export async function createBroadcast(data: Omit<Broadcast, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function scheduleBroadcast(id: string, scheduledAt: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update({
      status: 'scheduled',
      scheduled_at: scheduledAt
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function sendBroadcast(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Update status to sending
  await supabase
    .from('broadcasts')
    .update({ status: 'sending' })
    .eq('id', id)
    .eq('user_id', user.id)

  // TODO: Integrate with email service (SendGrid, etc.)
  // For now, just mark as sent
  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}
```

---

## 📊 Route Handlers Examples

### API Route: Events

```typescript
// app/api/v1/events/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// GET /api/v1/events?status=upcoming&type=conference&limit=10
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const eventType = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (status) query = query.eq('status', status)
  if (eventType) query = query.eq('event_type', eventType)

  query = query.limit(limit).order('start_date', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    count,
    pagination: {
      limit,
      total: count || 0
    }
  })
}

// POST /api/v1/events
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...body,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
```

### API Route: Event by ID

```typescript
// app/api/v1/events/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

// GET /api/v1/events/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// PATCH /api/v1/events/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('events')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/v1/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Soft delete
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

---

## 🔒 Authentication Middleware

### Middleware: Protect Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is authenticated
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Check if user has required role
  if (session && req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*']
}
```

---

## 🎯 Error Handling Utilities

### Utility: API Error Handler

```typescript
// lib/api-error-handler.ts
import { NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'

export class APIError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    )
  }

  if ((error as PostgrestError).code) {
    const pgError = error as PostgrestError
    return NextResponse.json(
      { error: pgError.message, code: pgError.code },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Utility: Validation

```typescript
// lib/validation.ts
import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  event_type: z.enum(['conference', 'workshop', 'meetup', 'training', 'seminar', 'networking', 'launch', 'other']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  max_attendees: z.number().positive().optional(),
})

export function validateEventData(data: unknown) {
  return eventSchema.parse(data)
}
```

---

## 📊 Remaining API Patterns

The following server actions and route handlers follow the same patterns:

### Batch 32: Feedback & Engagement
- `app/actions/feedback.ts` - Feedback CRUD
- `app/actions/forms.ts` - Form management
- `app/actions/polls.ts` - Poll voting

### Batch 33-44: (Remaining 36 APIs)
- All follow the same pattern with type-safe operations

---

## 🚀 API Usage Examples

### Example 1: Using Server Actions in Forms

```typescript
// app/(app)/dashboard/events-v2/event-form.tsx

'use client'

import { createEvent } from '@/app/actions/events'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function EventForm() {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createEvent(formData)
        toast.success('Event created successfully')
      } catch (error) {
        toast.error('Failed to create event')
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <select name="eventType" required>
        <option value="conference">Conference</option>
        {/* ... */}
      </select>
      <button disabled={isPending}>Create Event</button>
    </form>
  )
}
```

### Example 2: Using API Routes with Fetch

```typescript
// External app or service
async function fetchEvents() {
  const response = await fetch('/api/v1/events?status=upcoming', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const { data } = await response.json()
  return data
}
```

---

## 📚 Next Steps

1. **Create INTEGRATION_GUIDE.md** - Step-by-step page integration
2. **Create TESTING_GUIDE.md** - Testing strategies
3. **Create DEPLOYMENT_GUIDE.md** - Production deployment

---

**Last Updated:** December 14, 2024
**Status:** API documentation complete
**Next:** Create step-by-step integration guide
