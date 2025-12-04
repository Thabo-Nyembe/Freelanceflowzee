# CRM Clients - Quick Reference Guide

## Overview
All client CRUD operations now use Supabase directly. No more API routes!

---

## Files Changed

### 1. `/lib/clients-queries.ts`
**Functions Updated:**
- `updateClient(userId, clientId, updates)` - Added userId parameter + security check
- `deleteClient(userId, clientId)` - Added userId parameter + security check
- `updateClientStatus(userId, clientId, status)` - Updated signature
- `updateClientHealthScore(userId, clientId, healthScore)` - Updated signature
- `updateClientLeadScore(userId, clientId, leadScore)` - Updated signature

### 2. `/app/(app)/dashboard/clients/page.tsx`
**Functions Updated:**
- `handleAddClient()` - Fixed import (createClient → addClient)
- `handleUpdateClient()` - Now uses Supabase directly
- `handleDeleteClient()` - Now uses Supabase directly

**New Imports:**
- `import { useRouter } from 'next/navigation'`
- `const router = useRouter()`

---

## Usage Examples

### Create Client
```typescript
const { addClient } = await import('@/lib/clients-queries')
const { data, error } = await addClient(userId, {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'Acme Inc',
  status: 'lead'
})
```

### Update Client
```typescript
const { updateClient } = await import('@/lib/clients-queries')
const { data, error } = await updateClient(
  userId,
  clientId,
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    status: 'active'
  }
)
```

### Delete Client
```typescript
const { deleteClient } = await import('@/lib/clients-queries')
const { success, error } = await deleteClient(userId, clientId)
```

---

## Security

All operations check `user_id`:
```sql
.eq('user_id', userId)  -- Prevents unauthorized access
```

---

## Error Handling

```typescript
try {
  const { data, error } = await updateClient(userId, clientId, updates)
  if (error) throw new Error(error.message)
  // Success
} catch (error) {
  toast.error('Failed to update client')
  logger.error('Update failed', { error, userId, clientId })
}
```

---

## Testing

Run the app and test:
1. ✅ Create a new client
2. ✅ Edit an existing client
3. ✅ Delete a client
4. ✅ Try to edit another user's client (should fail)

---

## Status: COMPLETE ✅
