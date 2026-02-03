# API Usage Examples

Complete code examples for all KAZI Platform API endpoints.

## Authentication

All API endpoints require authentication via Bearer token.

```bash
# Get authentication token
curl -X POST https://api.kaziplatform.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

---

## Invoices API

### Create Invoice
```bash
curl -X POST https://api.kaziplatform.com/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client-123",
    "items": [
      {
        "description": "Web Development Services",
        "quantity": 40,
        "rate": 100
      }
    ],
    "due_date": "2026-03-01"
  }'
```

```typescript
// JavaScript/TypeScript
const response = await fetch('/api/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    client_id: 'client-123',
    items: [{
      description: 'Web Development Services',
      quantity: 40,
      rate: 100,
    }],
  }),
})

const { invoice } = await response.json()
```

### Update Invoice (PATCH)
```bash
curl -X PATCH https://api.kaziplatform.com/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "inv-123",
    "status": "paid"
  }'
```

```typescript
const response = await fetch('/api/v1/invoices', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'inv-123',
    status: 'paid',
  }),
})
```

### Delete Invoice
```bash
curl -X DELETE "https://api.kaziplatform.com/api/v1/invoices?id=inv-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript
await fetch(`/api/v1/invoices?id=inv-123`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
})
```

---

## Music API

### Update Track
```bash
curl -X PATCH https://api.kaziplatform.com/api/music \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trackId": "track-123",
    "name": "Updated Track Name",
    "genre": "electronic"
  }'
```

```typescript
await fetch('/api/music', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    trackId: 'track-123',
    name: 'Updated Track Name',
  }),
})
```

### Delete Track
```bash
curl -X DELETE "https://api.kaziplatform.com/api/music?trackId=track-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Collaboration API

### Update Comment
```bash
curl -X PATCH https://api.kaziplatform.com/api/collaboration/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "commentId": "comment-123",
    "content": "Updated comment text"
  }'
```

```typescript
await fetch('/api/collaboration/comments', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    commentId: 'comment-123',
    content: 'Updated comment',
  }),
})
```

### Delete Comment
```bash
curl -X DELETE "https://api.kaziplatform.com/api/collaboration/comments?commentId=comment-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Mobile App API

### Update Device
```bash
curl -X PATCH https://api.kaziplatform.com/api/mobile-app \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "device",
    "id": "device-123",
    "name": "iPhone 15 Pro"
  }'
```

```typescript
await fetch('/api/mobile-app', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'device',
    id: 'device-123',
    name: 'iPhone 15 Pro',
  }),
})
```

### Delete Device
```bash
curl -X DELETE "https://api.kaziplatform.com/api/mobile-app?type=device&id=device-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Settings API

### Update Settings (PATCH)
```bash
curl -X PATCH https://api.kaziplatform.com/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category": "notifications",
    "updates": {
      "email_notifications": false,
      "push_notifications": true
    }
  }'
```

```typescript
await fetch('/api/settings', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    category: 'notifications',
    updates: {
      email_notifications: false,
    },
  }),
})
```

### Delete API Key
```bash
curl -X DELETE "https://api.kaziplatform.com/api/settings?category=api-key&id=key-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

All API endpoints return standardized error responses:

```typescript
try {
  const response = await fetch('/api/v1/invoices', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: 'inv-123', status: 'paid' }),
  })

  if (!response.ok) {
    const error = await response.json()
    
    switch (response.status) {
      case 400:
        console.error('Bad Request:', error.message)
        break
      case 401:
        console.error('Unauthorized - token may be expired')
        // Redirect to login
        break
      case 403:
        console.error('Forbidden - you do not own this resource')
        break
      case 404:
        console.error('Not Found')
        break
      case 500:
        console.error('Server Error:', error.message)
        break
    }
    return
  }

  const data = await response.json()
  // Success
} catch (error) {
  console.error('Network error:', error)
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (not resource owner)
- `404` - Not Found
- `500` - Internal Server Error

## Batch Operations

For efficiency, use batch operations where available:

```typescript
// Update multiple invoices
const invoices = ['inv-1', 'inv-2', 'inv-3']

await Promise.all(
  invoices.map(id =>
    fetch('/api/v1/invoices', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status: 'sent' }),
    })
  )
)
```

## Pagination

For list endpoints, use pagination parameters:

```bash
curl "https://api.kaziplatform.com/api/v1/invoices?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript
const response = await fetch(
  `/api/v1/invoices?page=${page}&limit=20`,
  {
    headers: { 'Authorization': `Bearer ${token}` },
  }
)

const { data, pagination } = await response.json()
// pagination: { page, limit, total, hasMore }
```
