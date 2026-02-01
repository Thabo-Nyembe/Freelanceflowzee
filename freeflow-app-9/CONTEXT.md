# KAZI Platform - Development Context

> Auto-generated context documentation for AI-assisted development

## Project Overview

**Name:** KAZI Platform (FreeFlow App)
**Version:** 0.1.0
**Type:** Enterprise Freelance Management Platform
**Description:** AI-powered enterprise freelance management platform with real-time collaboration, payment systems, and comprehensive business automation tools.

---

## Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | App Router, Server Actions, Turbopack |
| React | 19.2.3 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Node.js | >=18.17.0 | Runtime |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL + Auth + Real-time + Storage |
| Prisma | ORM (via @auth/prisma-adapter) |
| Redis (Upstash) | Caching, Rate Limiting |
| AWS S3 | Cloud File Storage |

### Authentication
- **NextAuth.js v4** - Session-based auth
- **Supabase Auth** - Additional auth features
- **RBAC** - Role-based access control (admin, superadmin, user, client, freelancer, manager)

### AI & ML Services
- OpenAI (GPT models)
- Anthropic (Claude)
- Google Generative AI (Gemini)
- Replicate, Fal AI, Assembly AI

### UI Component Library
- **Radix UI** - 45+ primitive components
- **Lucide React** - Icon library
- **Tailwind CSS v4** - Utility-first CSS
- **Framer Motion** - Animations
- **Recharts** - Charts
- **React Hook Form + Zod** - Form validation
- **Sonner** - Toast notifications

### Real-time & Collaboration
- Socket.io - WebSocket communication
- TipTap + YJS - Collaborative editing
- Livekit - Video SDK

### Payments
- Stripe - Payment processing
- Plaid - Financial data aggregation

---

## Project Structure

```
/app
├── (app)/dashboard/          # Authenticated dashboard routes (v3)
├── (auth)/                   # Auth pages (login, register)
├── (marketing)/              # Public marketing pages
├── api/                      # API routes
│   ├── v1/                   # Versioned API
│   ├── notifications/        # Notification endpoints
│   └── collaboration/        # Real-time features
├── actions/                  # Server Actions
├── v1/dashboard/             # Legacy dashboard (v1)
└── v2/dashboard/             # Dashboard (v2)

/components
├── ui/                       # 152 primitive/complex UI components
├── communication/            # Messaging, notifications
└── [feature]/                # Feature-specific components

/lib
├── supabase/                 # Supabase clients (browser/server)
├── admin-overview-queries.ts # Database query functions
├── admin-overview-utils.tsx  # Types & utilities
└── auth.ts                   # Auth helpers

/hooks
├── use-notifications.ts      # Notification management
├── use-invoices.ts           # Invoice CRUD
├── use-current-user.ts       # Auth state
└── use-collaboration.ts      # Real-time features

/supabase
├── migrations/               # 320+ migration files
└── COMPLETE_DATABASE_SCHEMA.sql  # 507 tables, 37k lines
```

---

## Implementation Patterns

### 1. Client Component Architecture

```typescript
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { toast } from 'sonner'

export default function FeatureClient() {
  const { userId } = useCurrentUser()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load on mount
  useEffect(() => {
    const load = async () => {
      if (!userId) return
      try {
        const { getItems } = await import('@/lib/feature-queries')
        setItems(await getItems(userId))
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  // Actions with toast feedback
  const handleCreate = useCallback(async () => {
    try {
      const { createItem, getItems } = await import('@/lib/feature-queries')
      await createItem(userId!, { name: 'New', status: 'active' })
      setItems(await getItems(userId!))
      toast.success('Created successfully')
    } catch (err) {
      toast.error('Failed to create')
    }
  }, [userId])

  // Render with loading/error states
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />
  if (!items.length) return <EmptyState onAction={handleCreate} />

  return <ItemList items={items} />
}
```

### 2. Database Query Pattern

```typescript
// lib/feature-queries.ts
import { createClient } from '@/lib/supabase/server'

export async function getItems(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*, related_table(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createItem(userId: string, item: CreateItemInput) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .insert({ ...item, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 3. API Route Pattern

```typescript
// app/api/v1/feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, hasPermission } from '@/lib/api-helpers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { context, error } = await validateApiKey(request)
  if (error) return error

  const supabase = await createClient()
  const { data } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', context.userId)

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const { context, error } = await validateApiKey(request)
  if (error) return error

  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = await request.json()
  // Validate, process, return
  return NextResponse.json({ data }, { status: 201 })
}
```

### 4. Toast & Feedback Pattern

```typescript
import { toast } from 'sonner'

// Simple notifications
toast.success('Operation completed')
toast.error('Something went wrong')
toast.info('Information message')

// With description
toast.success('Invoice created', {
  description: 'Invoice #INV-001 sent to client'
})

// With action
toast.success('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => handleUndo()
  }
})

// Promise-based (loading state)
toast.promise(asyncOperation(), {
  loading: 'Processing...',
  success: 'Done!',
  error: 'Failed'
})
```

### 5. Form Handling Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

function MyForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    try {
      await saveData(data)
      toast.success('Saved!')
    } catch (err) {
      toast.error('Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

---

## UI Components Reference

### Core Components (`/components/ui/`)

| Component | Usage |
|-----------|-------|
| `button.tsx` | Variants: default, destructive, outline, ghost, link |
| `card.tsx` | Container with header, content, footer |
| `dialog.tsx` | Modal dialogs |
| `alert-dialog.tsx` | Confirmation dialogs |
| `tabs.tsx` | Tab navigation |
| `dropdown-menu.tsx` | Dropdown menus |
| `input.tsx`, `textarea.tsx` | Form inputs |
| `select.tsx`, `combobox.tsx` | Selection inputs |
| `badge.tsx` | Status badges |
| `skeleton.tsx` | Loading skeletons |
| `empty-state.tsx` | Empty/error states |
| `toast.tsx` | Toast notifications (via Sonner) |

### Feedback Components

```typescript
// Loading skeleton
<CardSkeleton />
<ListSkeleton count={5} />
<DashboardSkeleton />

// Empty states
<NoDataEmptyState
  title="No items"
  description="Create your first item"
  action={{ label: 'Create', onClick: handleCreate }}
/>

// Error state
<ErrorEmptyState
  title="Error loading"
  onRetry={handleRetry}
/>
```

---

## Database Schema Highlights

### Core Tables (507 total)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `projects` | Project management |
| `invoices` / `invoice_items` | Billing system |
| `clients` / `customers` | Client management |
| `notifications` | Notification system |
| `messages` / `conversations` | Messaging |
| `files` / `folders` | File management |
| `transactions` | Financial transactions |
| `automations` | Workflow automation |

### Notification Tables

```sql
-- Main notifications table
notifications (
  id, user_id, title, message, type, priority, status,
  category, action_url, metadata JSONB, read_at, archived_at,
  created_at, updated_at
)

-- Supporting tables
notification_preferences
notification_deliveries
notification_groups
snoozed_notifications
notification_bulk_actions
```

---

## Environment Variables

```env
# Core
NEXT_PUBLIC_APP_URL=http://localhost:9323
NEXT_PUBLIC_APP_NAME="FreeFlow KAZI"

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## Development Commands

```bash
npm run dev          # Start dev server (port 9323)
npm run dev:turbo    # With Turbopack
npm run build        # Production build
npm run test         # Unit tests (Jest)
npm run test:e2e     # E2E tests (Playwright)
npm run lint         # ESLint
```

---

## Implementation Checklist

When creating new features:

- [ ] Create types in `lib/feature-utils.tsx`
- [ ] Create CRUD queries in `lib/feature-queries.ts`
- [ ] Build client component with useState/useEffect/useCallback
- [ ] Handle loading (skeleton), error (EmptyState), empty (NoDataEmptyState)
- [ ] Add create/edit/delete actions with toast feedback
- [ ] Create page.tsx wrapper
- [ ] Optional: Create API routes for external access
- [ ] Test with demo mode first

---

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Database queries | `/lib/*-queries.ts` |
| Types & utilities | `/lib/*-utils.tsx` |
| Client components | `/app/*/dashboard/[feature]/*-client.tsx` |
| Page wrappers | `/app/*/dashboard/[feature]/page.tsx` |
| API routes | `/app/api/v1/[feature]/route.ts` |
| Shared UI | `/components/ui/` |
| Custom hooks | `/hooks/use-*.ts` |

---

*Last updated: Auto-generated during development session*
