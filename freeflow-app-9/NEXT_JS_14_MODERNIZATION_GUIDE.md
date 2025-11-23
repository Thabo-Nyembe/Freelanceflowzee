# Next.js 14 Modernization Guide

## Overview

This guide documents the modern Next.js 14 patterns implemented in the KAZI platform, based on the latest official Next.js 14.3.0 documentation retrieved via Context7 MCP.

## What's New

### 1. Modern Data Fetching Utilities (`lib/data-fetching.ts`)

**Key Features:**
- ✅ React.cache() for request memoization
- ✅ server-only imports to prevent client-side usage
- ✅ Preload pattern for early data fetching
- ✅ Proper caching strategies (force-cache, no-store, revalidate)
- ✅ Cache tags for selective revalidation

**Usage Example:**

```typescript
import { getUser, preloadUser } from '@/lib/data-fetching'

export default async function Page({ params }: { params: { id: string } }) {
  // Start loading early
  preloadUser(params.id)

  // Do other async work
  const settings = await checkSettings()

  // User data may already be loaded
  const user = await getUser(params.id)

  return <div>{user.name}</div>
}
```

**Benefits:**
- **Deduplication**: Multiple components can call `getUser(id)` - only fetches once
- **Performance**: Preload starts fetching before component needs it
- **Type Safety**: Full TypeScript support
- **Server-Only**: Prevented from running on client via 'server-only'

### 2. Revalidation Utilities (`lib/revalidation.ts`)

**Server Actions for on-demand cache invalidation:**

```typescript
'use server'

import { revalidateUser, revalidateProject } from '@/lib/revalidation'

export async function updateProfile(userId: string, data: ProfileData) {
  // Update in database
  await db.user.update({ where: { id: userId }, data })

  // Invalidate cache
  await revalidateUser(userId)

  return { success: true }
}
```

**Available Functions:**
- `revalidateUser(userId)` - Invalidate user data
- `revalidateProject(projectId)` - Invalidate single project
- `revalidateUserProjects(userId)` - Invalidate all user projects
- `revalidateClient(clientId)` - Invalidate client data
- `revalidateTeam(teamId)` - Invalidate team data
- `revalidateDashboard()` - Invalidate dashboard page
- `revalidateAll()` - Nuclear option (use sparingly!)

### 3. Optimized Image Components (`components/ui/optimized-image-v2.tsx`)

**Latest Next.js 14 image optimization patterns:**

```typescript
import { HeroImage, ContentImage, AvatarImage } from '@/components/ui/optimized-image-v2'

// LCP Hero Image - loads with priority
<HeroImage
  src="/hero.jpg"
  alt="Hero banner"
  width={1920}
  height={1080}
/>

// Regular content image - lazy loaded
<ContentImage
  src="/product.jpg"
  alt="Product"
  width={800}
  height={600}
/>

// Avatar - circular, fixed size
<AvatarImage
  src="/avatar.jpg"
  alt="User avatar"
  width={64}
  height={64}
/>
```

**Features:**
- ✅ Priority prop for LCP images
- ✅ Automatic lazy loading for non-priority images
- ✅ Blur placeholders for better UX
- ✅ Error handling with fallback
- ✅ Loading states
- ✅ Responsive sizes configuration
- ✅ Pre-configured variants (Hero, Avatar, Thumbnail, Content)

### 4. Modern Server Component Patterns (`app/(app)/dashboard/example-modern/page.tsx`)

**Complete example demonstrating:**

```typescript
import { Suspense } from 'react'
import { getDashboardData, preloadUser } from '@/lib/data-fetching'

export default async function Page() {
  const userId = 'user-123'

  // Preload to start fetching early
  preloadUser(userId)

  // Parallel data fetching
  const { user, projects, notifications } = await getDashboardData(userId)

  return (
    <div>
      <HeroImage src="/hero.jpg" alt="Hero" width={1920} height={400} priority />

      {/* Streaming with Suspense */}
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList userId={userId} />
      </Suspense>
    </div>
  )
}

// Metadata API
export const metadata = {
  title: 'Dashboard',
  description: 'Your dashboard'
}

// Page-level revalidation
export const revalidate = 60 // seconds
```

## Caching Strategies

### 1. Static Data (Cached until manual invalidation)

```typescript
const res = await fetch('https://api.example.com/config', {
  cache: 'force-cache',
  next: { tags: ['config'] }
})
```

**Use for:** App config, static content, rarely changing data

### 2. Time-Based Revalidation (ISR)

```typescript
const res = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 } // 1 hour
})
```

**Use for:** Blog posts, product listings, public content

### 3. Dynamic Data (No caching)

```typescript
const res = await fetch('https://api.example.com/notifications', {
  cache: 'no-store'
})
```

**Use for:** Real-time data, user-specific content, notifications

### 4. Tagged Caching (Selective revalidation)

```typescript
// Fetch with tags
const res = await fetch('https://api.example.com/user/123', {
  next: {
    revalidate: 60,
    tags: ['user-123', 'users']
  }
})

// Later, revalidate specific tags
revalidateTag('user-123')
```

**Use for:** Related data that needs to be invalidated together

## Server vs Client Components

### ✅ Use Server Components (default) for:

- Data fetching
- Backend resources access
- Sensitive information (API keys, tokens)
- Large dependencies (keep on server)
- SEO content

### ✅ Use Client Components ('use client') for:

- Interactivity (onClick, onChange, etc.)
- State management (useState, useReducer)
- Effects (useEffect)
- Browser APIs (localStorage, window)
- Custom hooks
- Event listeners

### 🔀 Composition Pattern

**Recommended:** Pass Server Components as children to Client Components

```typescript
// page.tsx (Server Component)
import ClientComponent from './client'
import ServerComponent from './server'

export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  )
}

// client.tsx
'use client'

export default function ClientComponent({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState()

  return (
    <div>
      <button onClick={() => setState(...)}>Click</button>
      {children}
    </div>
  )
}
```

**❌ Don't:** Import Server Components into Client Components directly

```typescript
'use client'

import ServerComponent from './server' // ❌ Not supported!
```

## Performance Best Practices

### 1. Parallel Data Fetching

```typescript
// ❌ Sequential (slow)
const user = await getUser(id)
const projects = await getProjects(id)
const notifications = await getNotifications(id)

// ✅ Parallel (fast)
const [user, projects, notifications] = await Promise.all([
  getUser(id),
  getProjects(id),
  getNotifications(id)
])
```

### 2. Preloading Pattern

```typescript
export const preload = (id: string) => {
  void getData(id) // Start fetching without awaiting
}

export default async function Page({ params }: { params: { id: string } }) {
  preload(params.id) // Start loading early

  const settings = await getSettings() // Other async work

  const data = await getData(params.id) // May already be loaded!

  return <div>{data.name}</div>
}
```

### 3. Streaming with Suspense

```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Page Title</h1>

      {/* This section streams independently */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>

      {/* Page shows immediately, SlowComponent loads later */}
    </div>
  )
}
```

### 4. Image Optimization

```typescript
// ✅ Priority for LCP images
<HeroImage src="/hero.jpg" alt="Hero" width={1920} height={1080} priority />

// ✅ Lazy loading for below-fold images
<ContentImage src="/content.jpg" alt="Content" width={800} height={600} />

// ✅ Responsive sizes for different viewports
<ContentImage
  src="/banner.jpg"
  alt="Banner"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## Migration Checklist

### Phase 1: Foundation (Completed ✅)
- [x] Create data fetching utilities with React.cache()
- [x] Create revalidation utilities with Server Actions
- [x] Create optimized image components
- [x] Create example modern page

### Phase 2: Gradual Migration (Next Steps)
- [ ] Identify LCP images and add priority prop
- [ ] Convert client-side data fetching to Server Components
- [ ] Add proper caching strategies to fetch calls
- [ ] Implement Suspense boundaries for streaming
- [ ] Add proper error boundaries
- [ ] Update metadata using Metadata API

### Phase 3: Optimization
- [ ] Audit and optimize Server/Client component boundaries
- [ ] Implement preloading where beneficial
- [ ] Add parallel data fetching
- [ ] Configure revalidation times appropriately
- [ ] Measure and optimize Core Web Vitals

## Common Patterns

### Pattern 1: Dashboard Page with Multiple Data Sources

```typescript
// app/dashboard/page.tsx
import { getDashboardData } from '@/lib/data-fetching'

export default async function DashboardPage() {
  const { user, stats, activities } = await getDashboardData()

  return (
    <div>
      <UserSection user={user} />
      <StatsSection stats={stats} />
      <ActivitiesSection activities={activities} />
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | KAZI',
  description: 'Your personal dashboard'
}

export const revalidate = 300 // 5 minutes
```

### Pattern 2: Dynamic Page with Streaming

```typescript
// app/projects/[id]/page.tsx
import { Suspense } from 'react'
import { getProject, preloadProject } from '@/lib/data-fetching'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  preloadProject(params.id)

  const project = await getProject(params.id)

  return (
    <div>
      <ProjectHeader project={project} />

      <Suspense fallback={<TimelineSkeleton />}>
        <ProjectTimeline projectId={params.id} />
      </Suspense>

      <Suspense fallback={<TeamSkeleton />}>
        <ProjectTeam projectId={params.id} />
      </Suspense>
    </div>
  )
}
```

### Pattern 3: Form with Server Action

```typescript
// app/settings/page.tsx
import { updateSettings } from './actions'

export default async function SettingsPage() {
  const settings = await getSettings()

  return <SettingsForm settings={settings} action={updateSettings} />
}

// app/settings/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
  const settings = {
    theme: formData.get('theme'),
    language: formData.get('language')
  }

  await db.settings.update({ data: settings })

  revalidatePath('/settings')

  return { success: true }
}
```

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Data Fetching Guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Caching Guide](https://nextjs.org/docs/app/building-your-application/caching)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## Support

For questions or issues:
1. Check this guide first
2. Review the example files (`app/(app)/dashboard/example-modern/page.tsx`)
3. Consult the official Next.js documentation
4. Check the implementation in `lib/data-fetching.ts` and `lib/revalidation.ts`

---

**Last Updated:** 2025-01-23
**Next.js Version:** 14.2.30 → targeting 14.3.0 patterns
**Documentation Source:** Context7 MCP (Official Next.js 14.3.0-canary.87)
