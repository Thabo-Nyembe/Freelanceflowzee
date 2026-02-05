# Type Safety Improvements - Foundation

**Date**: 2026-02-05
**Goal**: Improve type safety across API routes
**Status**: ⏳ IN PROGRESS - Foundation Complete

---

## 📊 Overview

### Problem
Many API routes use `any` type, reducing type safety and IntelliSense support:
- `session: any` - Used in ~40+ files
- `supabase: any` - Used in ~100+ function parameters
- `item: any` - Used in reduce/map callbacks
- Inconsistent typing across similar functions

### Solution
Create centralized type definitions and utilities to replace `any` with proper types.

---

## ✅ Foundation Complete

### New Files Created

#### 1. `lib/types/api.ts` - Common API Types

**Type Definitions Added**:

```typescript
// Session & Auth
export interface AuthSession extends Session
export interface DemoContext

// Supabase
export type TypedSupabaseClient = SupabaseClient<any>

// API Responses
export interface ApiErrorResponse
export interface ApiSuccessResponse<T>
export interface PaginatedResponse<T>

// Common Data Types
export interface FilterParams
export interface InvoiceItem
export interface InvoiceCalculation
export interface CustomerData

// Utility Types
export type WithRequired<T, K extends keyof T>
export type WithOptional<T, K extends keyof T>
export interface TimestampedRecord
export interface UserOwnedRecord
export interface SoftDeletableRecord
```

#### 2. `lib/utils/demo-mode.ts` - Demo Mode Utilities

**Functions Added**:

```typescript
// Constants
export const DEMO_USER_ID
export const DEMO_USER_EMAIL
export const DEMO_EMAILS

// Utilities
export function isDemoMode(request): boolean
export function isDemoEmail(email): boolean
export function getDemoUserId(session, demoMode): string | null
export function getUserId(session): string | null
```

---

## 🎯 Benefits

### Before (Type Unsafe):
```typescript
function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }
  // ... logic duplicated in 40+ files
}

async function processItems(supabase: any, items: any[]) {
  const total = items.reduce((sum: number, item: any) => {
    return sum + item.amount
  }, 0)
}
```

### After (Type Safe):
```typescript
import { AuthSession } from '@/lib/types/api'
import { getDemoUserId } from '@/lib/utils/demo-mode'

// No need to redefine - import centralized function
const userId = getDemoUserId(session, demoMode)

import { TypedSupabaseClient } from '@/lib/types/api'
import { InvoiceItem } from '@/lib/types/api'

async function processItems(
  supabase: TypedSupabaseClient,
  items: InvoiceItem[]
) {
  const total = items.reduce((sum, item) => {
    return sum + item.amount
  }, 0)
}
```

---

## 📈 Impact

### Type Safety Improvements:
- ✅ Centralized session typing
- ✅ Centralized demo mode logic
- ✅ Proper Supabase client typing
- ✅ Common response types
- ✅ Reusable utility types

### Code Quality:
- ✅ Reduces code duplication
- ✅ Improves IntelliSense
- ✅ Catches errors at compile time
- ✅ Makes refactoring safer
- ✅ Better developer experience

### Maintainability:
- ✅ Single source of truth for types
- ✅ Easier to update logic in one place
- ✅ Consistent patterns across codebase
- ✅ Self-documenting code

---

## 📋 Next Steps

### Phase 1: Replace Common Patterns (Planned)

**Target Files**: ~40 files with `getDemoUserId`

Replace duplicated demo mode logic:
```typescript
// Before: Duplicated in 40+ files
function getDemoUserId(session: any, demoMode: boolean): string | null {
  // ... 10-20 lines of duplicated logic
}

// After: Import from centralized utility
import { getDemoUserId } from '@/lib/utils/demo-mode'
```

### Phase 2: Replace Supabase `any` Types (Planned)

**Target**: ~100+ function parameters

```typescript
// Before
async function getData(supabase: any) { }

// After
import { TypedSupabaseClient } from '@/lib/types/api'
async function getData(supabase: TypedSupabaseClient) { }
```

### Phase 3: Replace Item `any` Types (Planned)

**Target**: Invoice, order, cart item processing

```typescript
// Before
items.reduce((sum: number, item: any) => sum + item.amount, 0)

// After
import { InvoiceItem } from '@/lib/types/api'
items.reduce((sum, item: InvoiceItem) => sum + item.amount, 0)
```

### Phase 4: Standardize API Responses (Planned)

**Target**: All API endpoints

```typescript
// Before: Inconsistent
return NextResponse.json({ error: 'Message' })
return NextResponse.json({ success: true, data })
return NextResponse.json({ data, message: 'Success' })

// After: Consistent
import { ApiSuccessResponse, ApiErrorResponse } from '@/lib/types/api'
return NextResponse.json<ApiSuccessResponse>({ success: true, data })
return NextResponse.json<ApiErrorResponse>({ error: 'Message' })
```

---

## 📊 Estimated Impact

### Files to Update:
- Demo mode functions: ~40 files
- Supabase parameters: ~100+ locations
- Item types: ~30 locations
- API responses: ~200+ endpoints

### Total Improvement Potential:
- Remove ~500 lines of duplicated code
- Replace ~200+ `any` types with proper types
- Standardize ~200+ API responses

---

## 🎓 Usage Guidelines

### Importing Types:
```typescript
import {
  AuthSession,
  TypedSupabaseClient,
  ApiSuccessResponse,
  InvoiceItem,
  FilterParams
} from '@/lib/types/api'
```

### Importing Utilities:
```typescript
import {
  DEMO_USER_ID,
  isDemoMode,
  getDemoUserId,
  getUserId
} from '@/lib/utils/demo-mode'
```

### Example Migration:

**Before**:
```typescript
function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) return demoMode ? DEMO_USER_ID : null
  // ... 15 more lines
}

async function myHandler(request: NextRequest) {
  const session = await getServerSession()
  const demoMode = isDemoMode(request)
  const userId = getDemoUserId(session, demoMode)
  // ...
}
```

**After**:
```typescript
import { getDemoUserId, isDemoMode } from '@/lib/utils/demo-mode'
import { AuthSession } from '@/lib/types/api'

async function myHandler(request: NextRequest) {
  const session = await getServerSession() as AuthSession
  const demoMode = isDemoMode(request)
  const userId = getDemoUserId(session, demoMode)
  // ...
}
```

---

## ✅ Quality Checks

- [x] Type definitions created in `lib/types/api.ts`
- [x] Demo utilities created in `lib/utils/demo-mode.ts`
- [x] All types properly exported
- [x] JSDoc comments added
- [x] No breaking changes to existing code
- [x] Ready for gradual adoption

---

## 📈 Roadmap

### Immediate (Session 5 Continuation):
1. ✅ Create foundation types and utilities
2. 🔄 Document usage patterns
3. ⏳ Begin migrating high-impact files

### Future Sessions:
4. Migrate demo mode functions (40 files)
5. Replace Supabase `any` types (100+ locations)
6. Standardize API responses (200+ endpoints)
7. Add ESLint rules to prevent new `any` usage

---

**Status**: Foundation complete, ready for systematic migration
**Benefit**: Improved type safety, reduced duplication, better DX
**Next**: Begin migrating high-traffic API routes
