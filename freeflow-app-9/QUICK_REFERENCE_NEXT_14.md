# Next.js 14 Quick Reference - KAZI Platform

## 🚀 Data Fetching Utilities

### Basic Usage

```typescript
import { getUser, getProjects, getDashboardData } from '@/lib/data-fetching'

// Single resource - memoized with React.cache()
const user = await getUser('user-123')

// Multiple resources - parallel fetching
const { user, projects, notifications } = await getDashboardData('user-123')
```

### Available Functions

| Function | Caching | Use Case |
|----------|---------|----------|
| `getUser(userId)` | 60s revalidate | User profiles |
| `getProject(projectId)` | 30s revalidate | Single project |
| `getProjects(userId)` | 5min revalidate | Projects list |
| `getNotifications(userId)` | No cache (real-time) | Notifications |
| `getAppConfig()` | Static (until revalidated) | App settings |
| `getTeamMembers(teamId)` | 2min revalidate | Team data |
| `getClientProjects(clientId)` | 3min revalidate | Client projects |
| `getDashboardData(userId)` | Parallel fetch | Dashboard data |

### Preloading Pattern

```typescript
import { preloadUser, getUser } from '@/lib/data-fetching'

export default async function Page({ params }) {
  // Start fetching early (don't await)
  preloadUser(params.id)

  // Do other async work
  const settings = await getSettings()

  // Data might already be loaded!
  const user = await getUser(params.id)

  return <div>{user.name}</div>
}
```

---

## 🔄 Revalidation Utilities

### Basic Usage

```typescript
'use server'

import { revalidateUser, revalidateProject } from '@/lib/revalidation'

export async function updateProfile(userId: string, data: any) {
  await db.user.update({ where: { id: userId }, data })

  // Invalidate cache
  await revalidateUser(userId)

  return { success: true }
}
```

### Available Functions

| Function | What It Invalidates |
|----------|-------------------|
| `revalidateUser(userId)` | User data |
| `revalidateProject(projectId)` | Single project + projects list |
| `revalidateUserProjects(userId)` | All user projects |
| `revalidateClient(clientId)` | Client data + projects |
| `revalidateTeam(teamId)` | Team + members |
| `revalidateAppConfig()` | App configuration |
| `revalidateDashboard()` | Dashboard page only |
| `revalidateDashboardLayout()` | Dashboard + all nested pages |
| `revalidateProjectPage(projectId)` | Project page + data |
| `revalidateAnalytics(userId)` | Analytics data |
| `revalidateTags(['tag1', 'tag2'])` | Multiple tags |
| `revalidateAll()` | Everything (use sparingly!) |

---

## 🖼️ Image Components

### Pre-configured Variants

```typescript
import {
  HeroImage,
  ContentImage,
  AvatarImage,
  ThumbnailImage,
  BackgroundImage
} from '@/components/ui/optimized-image-v2'

// Hero/LCP image - loads immediately
<HeroImage
  src="/hero.jpg"
  alt="Welcome"
  width={1920}
  height={1080}
/>

// Content image - lazy loaded
<ContentImage
  src="/feature.jpg"
  alt="Feature"
  width={800}
  height={600}
/>

// Avatar - circular, 64x64
<AvatarImage
  src="/avatar.jpg"
  alt="User"
  width={64}
  height={64}
/>

// Thumbnail - for grids
<ThumbnailImage
  src="/thumb.jpg"
  alt="Thumbnail"
  width={300}
  height={200}
/>

// Background - fill container
<BackgroundImage
  src="/bg.jpg"
  alt="Background"
  fill
/>
```

### Custom Optimized Image

```typescript
import { OptimizedImageV2 } from '@/components/ui/optimized-image-v2'

<OptimizedImageV2
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}          // true for LCP images
  blur={true}              // blur placeholder
  fallback="/placeholder.png"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## 📝 Common Patterns

### Pattern 1: Server Component Page with Data

```typescript
// app/dashboard/page.tsx
import { getDashboardData } from '@/lib/data-fetching'
import { HeroImage } from '@/components/ui/optimized-image-v2'

export default async function DashboardPage() {
  const { user, projects, notifications } = await getDashboardData('user-123')

  return (
    <div>
      <HeroImage src="/hero.jpg" alt="Dashboard" width={1920} height={400} />
      <UserSection user={user} />
      <ProjectsList projects={projects} />
      <Notifications items={notifications} />
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | KAZI',
  description: 'Your dashboard'
}

export const revalidate = 60 // Revalidate every 60 seconds
```

### Pattern 2: Streaming with Suspense

```typescript
import { Suspense } from 'react'
import { preloadProject } from '@/lib/data-fetching'

export default async function ProjectPage({ params }) {
  // Start loading early
  preloadProject(params.id)

  return (
    <div>
      <ProjectHeader projectId={params.id} />

      {/* These sections stream independently */}
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
import { SettingsForm } from './form'
import { updateSettings } from './actions'

export default async function SettingsPage() {
  const settings = await getSettings()

  return <SettingsForm settings={settings} action={updateSettings} />
}

// app/settings/form.tsx
'use client'

export function SettingsForm({ settings, action }) {
  return (
    <form action={action}>
      <input name="theme" defaultValue={settings.theme} />
      <button type="submit">Save</button>
    </form>
  )
}

// app/settings/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
  const data = {
    theme: formData.get('theme'),
    language: formData.get('language')
  }

  await db.settings.update({ data })
  revalidatePath('/settings')

  return { success: true }
}
```

### Pattern 4: Parallel Data Fetching

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

---

## 🎯 Caching Strategies

### 1. Static (Cached until manual revalidation)

```typescript
const res = await fetch('https://api.example.com/config', {
  cache: 'force-cache',
  next: { tags: ['config'] }
})
```

**Use for:** App config, static content, rarely changing data

### 2. ISR (Time-based revalidation)

```typescript
const res = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 } // 1 hour
})
```

**Use for:** Blog posts, product listings, public content

### 3. Dynamic (No caching)

```typescript
const res = await fetch('https://api.example.com/notifications', {
  cache: 'no-store'
})
```

**Use for:** Real-time data, user-specific content, notifications

### 4. Tagged (Selective revalidation)

```typescript
// Fetch with tags
const res = await fetch('https://api.example.com/user/123', {
  next: {
    revalidate: 60,
    tags: ['user-123', 'users']
  }
})

// Later, revalidate specific tags
import { revalidateTag } from 'next/cache'
revalidateTag('user-123')
```

**Use for:** Related data that needs to be invalidated together

---

## 🔀 Server vs Client Components

### ✅ Server Components (default)

```typescript
// No 'use client' directive
export default async function Page() {
  const data = await fetch('...')
  return <div>{data.title}</div>
}
```

**Use for:**
- Data fetching
- Backend resources
- Sensitive info (API keys)
- Large dependencies
- SEO content

### ✅ Client Components

```typescript
'use client'

import { useState } from 'react'

export default function Form() {
  const [value, setValue] = useState('')
  return <input value={value} onChange={e => setValue(e.target.value)} />
}
```

**Use for:**
- Interactivity (onClick, onChange)
- State (useState, useReducer)
- Effects (useEffect)
- Browser APIs
- Event listeners

### 🔀 Composition Pattern

```typescript
// ✅ Recommended: Pass Server Component as children
import ClientComponent from './client'
import ServerComponent from './server'

export default function Page() {
  return (
    <ClientComponent>
      <ServerComponent />
    </ClientComponent>
  )
}
```

---

## ⚡ Performance Checklist

- [ ] LCP images marked with `priority` prop
- [ ] Non-LCP images lazy loaded (default)
- [ ] Data fetched in parallel where possible
- [ ] React.cache() used for deduplication
- [ ] Appropriate caching strategy selected
- [ ] Cache tags added for revalidation
- [ ] Suspense boundaries for streaming
- [ ] Server Components used by default
- [ ] Client Components only when needed
- [ ] Metadata API for SEO

---

## 📚 Additional Resources

- **Full Guide:** [NEXT_JS_14_MODERNIZATION_GUIDE.md](./NEXT_JS_14_MODERNIZATION_GUIDE.md)
- **Example Page:** [app/(app)/dashboard/example-modern/page.tsx](./app/(app)/dashboard/example-modern/page.tsx)
- **Data Fetching:** [lib/data-fetching.ts](./lib/data-fetching.ts)
- **Revalidation:** [lib/revalidation.ts](./lib/revalidation.ts)
- **Images:** [components/ui/optimized-image-v2.tsx](./components/ui/optimized-image-v2.tsx)

---

## 🆘 Common Issues

### Issue: "useState is not a function"
**Solution:** Add `'use client'` to the top of the file

### Issue: Data not updating after mutation
**Solution:** Call appropriate revalidation function after updating

### Issue: Slow page loads
**Solution:** Check if you're fetching data sequentially instead of in parallel

### Issue: Too many cache misses
**Solution:** Verify React.cache() is being used and check revalidation times

---

**Context7 MCP Status:** ✅ Connected (`npx -y @upstash/context7-mcp`)

**Last Updated:** 2025-01-23
