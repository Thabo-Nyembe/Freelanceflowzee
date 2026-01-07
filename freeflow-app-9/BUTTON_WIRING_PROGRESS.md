# Button Wiring Progress

**Created:** 2026-01-07
**Status:** IN PROGRESS

## Summary

This document tracks the progress of wiring up buttons that currently only show toast notifications without performing real actions.

---

## Issue Categories Found

### Category 1: QuickActions Toast-Only Patterns
**Pattern:** `action: () => toast.success('Title', { description: '...' })`
**Problem:** Buttons show toast but don't execute real functionality
**Count:** 173 occurrences across 50 files
**Priority:** HIGH

### Category 2: Inline onClick Toast-Only Handlers
**Pattern:** `onClick={() => { toast.success(...) }}`
**Problem:** Single-action toast without real operation
**Count:** 169 occurrences across 36 files
**Priority:** HIGH

### Category 3: Placeholder Messages
**Pattern:** Contains "not implemented", "coming soon", "feature unavailable"
**Problem:** Features advertised but not functional
**Count:** 71 occurrences across 30 files
**Priority:** MEDIUM

---

## Fix Strategy

### Real Action Patterns (from Context7 Best Practices)

**1. Server Action Pattern (Next.js):**
```typescript
'use server'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const data = { title: formData.get('title') }
  await db.items.create({ data })
  revalidatePath('/items')
}
```

**2. Supabase CRUD Pattern:**
```typescript
const handleCreate = async () => {
  const { data, error } = await supabase
    .from('items')
    .insert({ name: 'New Item', user_id: userId })
    .select()
    .single()

  if (error) toast.error('Failed to create')
  else toast.success('Item created')
}
```

**3. Client-Side State Pattern:**
```typescript
const handleToggle = () => {
  setEnabled(!enabled)
  toast.success(enabled ? 'Disabled' : 'Enabled')
}
```

**4. Real Clipboard Pattern:**
```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard')
}
```

**5. API Route Pattern:**
```typescript
const handleExport = async () => {
  const response = await fetch('/api/export', { method: 'POST' })
  const blob = await response.blob()
  // Download logic...
  toast.success('Exported successfully')
}
```

---

## Files to Fix (Sorted by Priority)

### High Priority - v2 Dashboard (Most Used)
| File | Patterns | Category |
|------|----------|----------|
| marketplace-v2 | 16 | QuickActions |
| social-media-v2 | 15 | QuickActions |
| my-day-v2 | 15 | QuickActions |
| products-v2 | 14 | QuickActions |
| alerts-v2 | 13 | QuickActions |
| tutorials-v2 | 12 | QuickActions |
| settings-v2 | 12 | QuickActions |
| media-library-v2 | 10 | QuickActions |
| plugins-v2 | 8 | QuickActions |
| sales-v2 | 7 | QuickActions |

### Medium Priority - v1 Dashboard
| File | Patterns | Category |
|------|----------|----------|
| webinars | 42 | QuickActions |
| customers | 11 | Inline Toast |
| settings | 12 | Inline Toast |
| onboarding | 11 | Inline Toast |
| upgrades-showcase | 8 | QuickActions |

### Lower Priority - Component Library
| File | Patterns | Category |
|------|----------|----------|
| coming-soon-system | 3 | Placeholder |
| enhanced-ai-chat | 1 | Placeholder |
| storage-connection-dialog | 1 | Placeholder |

---

## Progress Tracker

### Completed
- [x] Audited all toast-only patterns (639 total found)
- [x] Created documentation
- [x] Batch 1: Fixed 25 files (6,607 lines added)
- [x] Batch 2: Fixed 58 files (6,911 lines added)
- [x] Batch 3: Fixing 25 more files (in progress)
- [ ] Fix remaining patterns
- [ ] Push to git

### Stats
| Metric | Count |
|--------|-------|
| Original patterns | 639 |
| Fixed in Batch 1 | ~150 |
| Fixed in Batch 2 | ~60 |
| Remaining | ~428 |

---

## API Routes Available

These existing routes can be connected to buttons:

| Route | Methods | Purpose |
|-------|---------|---------|
| /api/projects | GET, POST | Project CRUD |
| /api/tasks | GET, POST, PUT, DELETE | Task management |
| /api/invoices | GET, POST, PUT | Invoice operations |
| /api/clients | GET, POST, PUT, DELETE | Client management |
| /api/messages | GET, POST | Messaging |
| /api/calendar | GET, POST | Calendar events |
| /api/kazi/automations | GET, POST | Automations |
| /api/kazi/workflows | GET, POST | Workflows |
| /api/video/* | Various | Video operations |

---

## Hooks Available

These hooks can be used to wire up functionality:

- `useClients` - Client data operations
- `useCollaboration` - Real-time collaboration
- `useDashboardOverview` - Dashboard stats
- `useAnalyticsDashboard` - Analytics data
- `useVideoExport` - Video export operations
- `useKaziAutomations` - Automation operations
- `useKaziWorkflows` - Workflow operations

---

*Document updated: 2026-01-07*
