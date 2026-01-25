# Button Wiring Context - FreeFlow App

## Overview
This document tracks progress on wiring frontend button handlers to the comprehensive Supabase backend.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## Batch 1: Bugs Dashboard
**File:** `app/(app)/dashboard/bugs-v2/bugs-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleArchiveBugs | [x] | Archive selected bugs (soft delete via Supabase) |

---

## Batch 2: Products Dashboard
**File:** `app/(app)/dashboard/products-v2/products-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSyncAll | [x] | Refresh/sync all products via refetch() |
| handleCreateProduct | [x] | Opens dialog (form submit handles creation) |
| handleCreateCoupon | [x] | Opens dialog (form submit handles creation) |

---

## Batch 3: Renewals Dashboard
**File:** `app/(app)/dashboard/renewals-v2/renewals-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleGenerateReport | [x] | Generate CSV report with renewal data |
| handleArchiveOldRenewals | [x] | Archive renewals older than 2 years via Supabase |
| handleResetSettings | [x] | Reset filter and form state to defaults |

---

## Batch 4: Milestones Dashboard
**File:** `app/(app)/dashboard/milestones-v2/milestones-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleGenerateProgressReport | [x] | Generate CSV with progress and timeline data |
| handleGenerateStatusReport | [x] | Generate CSV with status and health data |
| handleGenerateBudgetReport | [x] | Generate CSV with budget/schedule data |
| handleGenerateRiskReport | [x] | Generate CSV with at-risk milestones analysis |

---

## Implementation Pattern

### Standard Button Handler Pattern
```typescript
const handleAction = async () => {
  setIsLoading(true)
  try {
    await mutation(data)
    toast.success('Action completed successfully')
    refetch()
  } catch (error) {
    toast.error('Action failed: ' + (error as Error).message)
  } finally {
    setIsLoading(false)
  }
}
```

### Soft Delete Pattern (Archive)
```typescript
const handleArchive = async (ids: string[]) => {
  setIsLoading(true)
  try {
    await Promise.all(ids.map(id => updateItem({ id, deleted_at: new Date().toISOString() })))
    toast.success(`Archived ${ids.length} items`)
    refetch()
  } catch (error) {
    toast.error('Archive failed')
  } finally {
    setIsLoading(false)
  }
}
```

### Report Generation Pattern
```typescript
const handleGenerateReport = async (type: string) => {
  setIsLoading(true)
  try {
    const report = await createReport({ type, data: items })
    toast.success('Report generated')
    // Optionally download or display report
  } catch (error) {
    toast.error('Report generation failed')
  } finally {
    setIsLoading(false)
  }
}
```

---

## Hooks Reference

| Dashboard | Hook | Mutations Available |
|-----------|------|---------------------|
| Bugs | useBugs | create, update, remove |
| Products | useProducts | create, update, remove |
| Renewals | useRenewals | create, update, remove |
| Milestones | useMilestones | create, update, remove |

---

## Production-Ready Dashboards (No Work Needed)
These dashboards already have fully wired handlers:
- CI/CD (`ci-cd-v2`)
- Deployments (`deployments-v2`)
- Logistics (`logistics-v2`)
- Shipping (`shipping-v2`)
- Sprints (`sprints-v2`)
- Warehouse (`warehouse-v2`)
- AI Design (`ai-design-v2`)

---

## Last Updated
Date: 2026-01-25
Status: **All batches complete** - Build passing with 598 pages

## Summary of Changes
- **Bugs**: `handleArchiveBugs` now soft-deletes closed bugs via Supabase
- **Products**: `handleSyncAll` now calls `refetch()` to refresh data from database
- **Renewals**: Added hook integration, report generation exports CSV, archive function soft-deletes old renewals
- **Milestones**: All 4 report handlers now generate actual CSV downloads with relevant data analysis
