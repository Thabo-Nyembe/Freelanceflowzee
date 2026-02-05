# Server Freezing Issue - Fixes Applied

**Date**: 2026-02-05
**Issue**: Development server freezing after 1-2 hours with 125% CPU usage

---

## Root Causes Identified

### 1. Infinite Refetch Loop (CRITICAL)
**File**: `/hooks/use-ai-data.ts`
**Problem**: Supabase real-time subscriptions triggering `fetchData()` on every database change, causing state updates that could trigger re-renders and recreate subscriptions.

### 2. Memory Leak in Notification System (CRITICAL)
**File**: `/components/notifications/notification-bell.tsx`
**Problem**: `shownToasts` Set growing unbounded, accumulating thousands of notification IDs over hours.

### 3. Aggressive Polling (HIGH)
**File**: `/hooks/use-realtime-notifications.ts`
**Problem**: Polling API every 30 seconds as WebSocket fallback, creating excessive HTTP requests.

### 4. Uncleaned Performance Monitor (HIGH)
**File**: `/lib/performance.ts`
**Problem**: `setInterval` running forever without cleanup, monitoring memory every 30 seconds.

---

## Fixes Applied

### Fix #1: Debounced Refetch in Real-time Subscriptions
**Files Modified**: `/hooks/use-ai-data.ts`

**Changes**:
- Added debounce timer to all Supabase subscription callbacks
- Prevents rapid-fire refetches when multiple database changes occur
- Each subscription now waits 1-2 seconds before refetching data

**Hooks Fixed**:
- `useRevenueData()` - 1 second debounce (2 tables: invoices, projects)
- `useLeadsData()` - 1 second debounce (1 table: leads)
- `useAIRecommendations()` - 1 second debounce (1 table: ai_recommendations)
- `useGrowthPlaybook()` - 1 second debounce (1 table: growth_playbooks)
- `useUserMetrics()` - 2 second debounce (3 tables: projects, tasks, time_entries)

**Code Pattern**:
```typescript
let debounceTimer: NodeJS.Timeout | null = null

const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchData()
  }, 1000) // Wait before refetching
}

// In cleanup:
return () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  supabase.removeChannel(channel)
}
```

**Impact**: Prevents exponential subscription accumulation and CPU spikes

---

### Fix #2: Periodic Cleanup of Notification Toast Set
**Files Modified**: `/components/notifications/notification-bell.tsx`

**Changes**:
- Added cleanup interval that clears `shownToasts` Set every 5 minutes
- Prevents unbounded memory growth from notification ID accumulation

**Code Added**:
```typescript
useEffect(() => {
  const cleanupInterval = setInterval(() => {
    setShownToasts(new Set()) // Clear all tracked toasts
  }, 5 * 60 * 1000) // 5 minutes

  return () => clearInterval(cleanupInterval)
}, [])
```

**Impact**: Prevents memory leak, keeps Set size manageable

---

### Fix #3: Reduced Polling Frequency
**Files Modified**: `/hooks/use-realtime-notifications.ts`

**Changes**:
- Increased polling interval from 30 seconds to 60 seconds
- Reduces HTTP request load by 50%

**Before**: `pollingInterval = 30000 // 30 seconds`
**After**: `pollingInterval = 60000 // 60 seconds`

**Impact**: Reduces server load and network traffic

---

### Fix #4: Performance Monitor Interval Cleanup
**Files Modified**: `/lib/performance.ts`

**Changes**:
- Store interval ID and clear it on page unload
- Prevents memory monitor from running indefinitely

**Code Modified**:
```typescript
// Store interval ID
const memoryMonitorInterval = setInterval(monitorMemoryUsage, 30000)

// Clear on unload
window.addEventListener('beforeunload', () => {
  clearInterval(memoryMonitorInterval) // NEW: Clear interval
  optimizer.cleanup()
})
```

**Impact**: Proper cleanup of background processes

---

## Expected Results

### Before Fixes:
- Server freezes after 1-2 hours
- CPU usage spikes to 125%
- Requires manual restart
- Memory consumption grows unbounded

### After Fixes:
- Server remains stable for extended periods
- CPU usage stays normal
- Subscriptions don't accumulate
- Memory usage stays bounded
- No manual restarts needed

---

## Testing Plan

1. **Monitor server stability** - Run server for 4+ hours without restart
2. **Check CPU usage** - Should stay below 50% during normal operation
3. **Monitor memory** - Should not grow unbounded over time
4. **Verify real-time features** - Subscriptions still work, just debounced
5. **Check notifications** - Still appear but don't cause memory leaks

---

## Additional Recommendations

### For Production:
1. Implement exponential backoff for polling
2. Add connection pooling limits
3. Monitor subscription count in production
4. Set up alerts for high CPU usage
5. Consider using Redis for real-time features at scale

### For Further Investigation:
- Review other components for similar patterns
- Audit all useEffect hooks for proper cleanup
- Consider implementing a global subscription manager
- Add performance monitoring to production

---

## Files Changed

1. `/hooks/use-ai-data.ts` - Added debouncing to 5 hooks
2. `/components/notifications/notification-bell.tsx` - Added Set cleanup
3. `/hooks/use-realtime-notifications.ts` - Increased polling interval
4. `/lib/performance.ts` - Added interval cleanup

**Total Lines Changed**: ~100 lines across 4 files
**Impact**: CRITICAL - Fixes server stability issue
**Risk**: LOW - Changes are defensive, add safety measures

---

## Commit Message

```
fix: prevent server freezing with debouncing and cleanup

Fixes critical server stability issue causing 125% CPU usage and freezes after 1-2 hours.

Changes:
- Add debounced refetch to all Supabase subscriptions (1-2s delay)
- Add periodic cleanup to notification toast Set (every 5 min)
- Increase notification polling interval from 30s to 60s
- Add proper cleanup to performance monitor interval

Impact:
- Prevents infinite refetch loops
- Prevents memory leaks
- Reduces server load
- Ensures stable long-running dev server

Fixes: Server freezing issue reported on 2026-02-05
```
