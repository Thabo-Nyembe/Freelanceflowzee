# API Client Migration Guide

## Overview

This guide provides a systematic approach for migrating pages from manual `fetch()` calls and hardcoded mock data to production-ready TanStack Query hooks from our API client library.

## Table of Contents

1. [Before & After Comparison](#before--after-comparison)
2. [Migration Checklist](#migration-checklist)
3. [Step-by-Step Migration Process](#step-by-step-migration-process)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

---

## Before & After Comparison

### ❌ Before: Manual fetch() with setState

```typescript
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Manual data fetching
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/projects')
        if (!response.ok) throw new Error('Failed to fetch')

        const data = await response.json()
        setProjects(data.projects || [])
      } catch (err) {
        setError(err.message)
        toast.error('Failed to load projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Manual create mutation
  const handleCreate = async (projectData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })

      if (!response.ok) throw new Error('Failed to create')

      // Manually refetch all data
      fetchProjects()
      toast.success('Project created')
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

### ✅ After: TanStack Query Hooks

```typescript
'use client'

import { useProjects, useCreateProject } from '@/lib/api-clients'
import { toast } from 'sonner'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'

export default function ProjectsPage() {
  // Automatic data fetching with caching, background refetching, etc.
  const { data, isLoading, error } = useProjects(1, 20)

  // Automatic mutation with optimistic updates
  const createProject = useCreateProject()

  const handleCreate = (projectData) => {
    createProject.mutate(projectData)
    // No need to manually refetch - TanStack Query handles it!
  }

  if (isLoading) return <CardSkeleton count={3} />
  if (error) return <ErrorEmptyState message={error.message} />

  return (
    <div>
      {data?.items.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

**Benefits:**
- ✅ **90% less boilerplate code**
- ✅ **Automatic caching** - data persists across route changes
- ✅ **Background refetching** - always fresh data
- ✅ **Optimistic updates** - instant UI feedback
- ✅ **Error recovery** - automatic retry on failure
- ✅ **Request deduplication** - no duplicate API calls
- ✅ **TypeScript type safety** - full intellisense support

---

## Migration Checklist

### Phase 1: Preparation
- [ ] Identify which API client to use (Projects, Invoices, Tasks, etc.)
- [ ] Review available hooks for that client (see [API Clients Documentation](./API_CLIENTS_IMPLEMENTATION_PROGRESS.md))
- [ ] Understand current data flow in the component
- [ ] Identify all CRUD operations (Create, Read, Update, Delete)

### Phase 2: Replace Data Fetching
- [ ] Remove `useState` for data array
- [ ] Remove `useState` for `isLoading`
- [ ] Remove `useState` for `error`
- [ ] Remove `useEffect` with `fetch()` call
- [ ] Import appropriate hook (e.g., `useProjects`)
- [ ] Add hook with pagination parameters
- [ ] Update JSX to use `data` from hook

### Phase 3: Replace Mutations
- [ ] Identify all create/update/delete handlers
- [ ] Import mutation hooks (`useCreateX`, `useUpdateX`, `useDeleteX`)
- [ ] Replace manual `fetch()` calls with mutations
- [ ] Remove manual `refetch()` calls (handled automatically)
- [ ] Remove `try/catch` blocks (handled by hooks)

### Phase 4: Testing & Cleanup
- [ ] Test data loading
- [ ] Test create operations
- [ ] Test update operations
- [ ] Test delete operations
- [ ] Test error states
- [ ] Test loading states
- [ ] Remove unused imports
- [ ] Remove dead code

---

## Step-by-Step Migration Process

### Step 1: Import API Client Hooks

```typescript
// Add to imports
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectStats
} from '@/lib/api-clients'
```

### Step 2: Replace Data Fetching

**Before:**
```typescript
const [projects, setProjects] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetchProjects()
}, [])

const fetchProjects = async () => {
  try {
    setIsLoading(true)
    const response = await fetch('/api/projects')
    const data = await response.json()
    setProjects(data.projects)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}
```

**After:**
```typescript
const { data, isLoading, error } = useProjects(1, 20)
// That's it! No useState, useEffect, or try/catch needed
```

### Step 3: Replace Create Mutations

**Before:**
```typescript
const handleCreate = async (projectData) => {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })

    if (!response.ok) throw new Error('Failed')

    fetchProjects() // Manual refetch
    toast.success('Created')
  } catch (err) {
    toast.error(err.message)
  }
}
```

**After:**
```typescript
const createProject = useCreateProject()

const handleCreate = (projectData) => {
  createProject.mutate(projectData)
  // Automatic refetch, toast notifications, and error handling!
}
```

### Step 4: Replace Update Mutations

**Before:**
```typescript
const handleUpdate = async (id, updates) => {
  try {
    const response = await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })

    if (!response.ok) throw new Error('Failed')

    fetchProjects()
    toast.success('Updated')
  } catch (err) {
    toast.error(err.message)
  }
}
```

**After:**
```typescript
const updateProject = useUpdateProject()

const handleUpdate = (id, updates) => {
  updateProject.mutate({ id, updates })
  // Optimistic update + automatic cache invalidation!
}
```

### Step 5: Replace Delete Mutations

**Before:**
```typescript
const handleDelete = async (id) => {
  try {
    const response = await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed')

    fetchProjects()
    toast.success('Deleted')
  } catch (err) {
    toast.error(err.message)
  }
}
```

**After:**
```typescript
const deleteProject = useDeleteProject()

const handleDelete = (id) => {
  deleteProject.mutate(id)
  // Automatic cache update + toast notifications!
}
```

### Step 6: Update JSX

**Before:**
```typescript
{projects.map(project => (
  <div key={project.id}>{project.name}</div>
))}
```

**After:**
```typescript
{data?.items.map(project => (
  <div key={project.id}>{project.name}</div>
))}
```

---

## Common Patterns

### Pattern 1: Pagination

```typescript
const [page, setPage] = useState(1)
const { data, isLoading } = useProjects(page, 20)

const handleNextPage = () => setPage(p => p + 1)
const handlePrevPage = () => setPage(p => Math.max(1, p - 1))

// Automatic refetch when page changes!
```

### Pattern 2: Filters

```typescript
const [statusFilter, setStatusFilter] = useState('all')

const { data } = useProjects(1, 20, {
  status: statusFilter === 'all' ? undefined : [statusFilter]
})

// Automatic refetch when filter changes!
```

### Pattern 3: Search

```typescript
const [searchQuery, setSearchQuery] = useState('')

const { data } = useProjects(1, 20, {
  search: searchQuery
})

// Debounce search queries for better UX
```

### Pattern 4: Optimistic Updates

```typescript
const updateProject = useUpdateProject()

const handleToggleStatus = (id, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'completed' : 'active'

  updateProject.mutate({
    id,
    updates: { status: newStatus }
  })

  // UI updates INSTANTLY (optimistic)
  // Automatically rolls back if API fails
}
```

### Pattern 5: Loading States

```typescript
const { data, isLoading, isFetching } = useProjects(1, 20)

if (isLoading) {
  // First load
  return <CardSkeleton count={5} />
}

return (
  <>
    {isFetching && <RefreshIndicator />}
    {/* Show data with background refresh indicator */}
  </>
)
```

### Pattern 6: Error Handling

```typescript
const { data, error, refetch } = useProjects(1, 20)

if (error) {
  return (
    <ErrorEmptyState
      title="Failed to load projects"
      message={error.message}
      action={<Button onClick={() => refetch()}>Retry</Button>}
    />
  )
}
```

### Pattern 7: Dependent Queries

```typescript
const { data: project } = useProject(projectId)

// Only fetch tasks when we have a project
const { data: tasks } = useTasks(1, 20, {
  project_id: project?.id
}, {
  enabled: !!project // Conditional fetching
})
```

---

## Troubleshooting

### Issue: Data not updating after mutation

**Problem:** Created/updated items don't appear in the list

**Solution:** The hooks automatically invalidate queries. If you have custom query keys, ensure they match:

```typescript
// Custom query - won't auto-invalidate
const { data } = useQuery({
  queryKey: ['my-custom-projects'], // ❌ Won't invalidate
  queryFn: () => projectsClient.getProjects(1, 20)
})

// Use the provided hook - auto-invalidates
const { data } = useProjects(1, 20) // ✅ Auto-invalidates
```

### Issue: Type errors with API responses

**Problem:** TypeScript complains about property access

**Solution:** The API client returns `{ items, total, page, pageSize }`:

```typescript
const { data } = useProjects(1, 20)

// ❌ Wrong
data.map(project => ...)

// ✅ Correct
data?.items.map(project => ...)
```

### Issue: Filters not working

**Problem:** Changing filters doesn't refetch data

**Solution:** Ensure filters are in the hook dependency:

```typescript
// ❌ Wrong - filter not in dependency
const [status, setStatus] = useState('active')
const { data } = useProjects(1, 20) // Won't refetch on status change

// ✅ Correct - filter in dependency
const { data } = useProjects(1, 20, {
  status: status === 'all' ? undefined : [status]
}) // Auto-refetches when status changes
```

### Issue: Too many API calls

**Problem:** Seeing duplicate requests in network tab

**Solution:** TanStack Query deduplicates by default, but check:

1. Are you using the same query keys?
2. Is `staleTime` set too low?
3. Are you calling `refetch()` manually?

```typescript
// Reduce refetch frequency
const { data } = useProjects(1, 20, undefined, {
  staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
  refetchOnWindowFocus: false // Don't refetch on window focus
})
```

---

## Available API Clients

| API Client | Hook Prefix | Example Hooks |
|------------|-------------|---------------|
| **Projects** | `useProject*` | `useProjects`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useProjectStats` |
| **Clients** | `useClient*` | `useClients`, `useCreateClient`, `useUpdateClient`, `useDeleteClient`, `useClientStats` |
| **Invoices** | `useInvoice*` | `useInvoices`, `useCreateInvoice`, `useUpdateInvoice`, `useSendInvoice`, `useMarkInvoiceAsPaid` |
| **Tasks** | `useTask*` | `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useAssignTask`, `useUpdateTaskProgress` |
| **Analytics** | `use*Metrics` | `useDashboardMetrics`, `useRevenueAnalytics`, `useEngagementMetrics`, `usePerformanceMetrics` |
| **Messages** | `useMessage*` / `useConversation*` | `useConversations`, `useMessages`, `useSendMessage`, `useMarkAsRead`, `useDeleteMessage` |
| **Files** | `useFile*` | `useFiles`, `useUploadFile`, `useUpdateFile`, `useDeleteFile`, `useDownloadFile`, `useMoveFile` |
| **Calendar** | `useEvent*` / `useBooking*` | `useEvents`, `useCreateEvent`, `useUpdateEvent`, `useBookings`, `useCreateBooking` |
| **Notifications** | `useNotification*` | `useNotifications`, `useCreateNotification`, `useMarkAsRead`, `useMarkAllAsRead`, `useArchiveNotification` |

For complete documentation, see [API_CLIENTS_IMPLEMENTATION_PROGRESS.md](./API_CLIENTS_IMPLEMENTATION_PROGRESS.md)

---

## Migration Priority Order

### Tier 1: Core Business Features (HIGHEST PRIORITY)
1. ✅ Projects
2. ✅ Invoices
3. ✅ Tasks
4. ✅ Files
5. ✅ Messages
6. ✅ Calendar/Bookings

### Tier 2: Business Operations
7. CRM (use `useClients`)
8. Analytics (use `useAnalytics`, `useDashboardMetrics`)
9. Time Tracking (need custom API)
10. Financial (use `useInvoices`)

### Tier 3: Team & Collaboration
11. Team Management
12. Collaboration
13. User Management

### Tier 4: Content & Creative
14. Video Studio
15. Audio Studio
16. Gallery

---

## Success Metrics

After migration, verify:
- [ ] **Code reduction**: 50-90% less boilerplate
- [ ] **No manual refetching**: All mutations auto-invalidate
- [ ] **TypeScript safety**: Full type inference
- [ ] **Loading states**: Automatic with `isLoading`, `isFetching`
- [ ] **Error handling**: Automatic with `error` object
- [ ] **Caching**: Data persists across navigation
- [ ] **Optimistic updates**: Instant UI feedback

---

## Next Steps

1. Review this guide
2. Choose a page to migrate (start with simpler ones)
3. Follow the step-by-step process
4. Test thoroughly
5. Commit and document changes
6. Move to next page

For questions or issues, refer to:
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [API Clients Implementation Progress](./API_CLIENTS_IMPLEMENTATION_PROGRESS.md)
