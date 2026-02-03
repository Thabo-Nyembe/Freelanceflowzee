# Rate Limiting Policy

KAZI Platform implements rate limiting to ensure fair usage and platform stability.

## Overview

Rate limits are applied per user account and API endpoint. Limits are calculated using a sliding window algorithm.

## Rate Limit Tiers

### Free Tier
- **Requests**: 1,000 requests/hour
- **Burst**: 100 requests/minute
- **Applies to**: All standard API endpoints

### Pro Tier
- **Requests**: 10,000 requests/hour
- **Burst**: 500 requests/minute
- **Applies to**: All API endpoints

### Enterprise Tier
- **Requests**: Custom (negotiated)
- **Burst**: Custom (negotiated)
- **Applies to**: All endpoints with dedicated infrastructure

## Endpoint-Specific Limits

### High-Impact Endpoints
Stricter limits apply to resource-intensive operations:

| Endpoint | Free Tier | Pro Tier | Enterprise |
|----------|-----------|----------|------------|
| `/api/video-studio` (rendering) | 10/hour | 100/hour | Custom |
| `/api/ai/*` (AI operations) | 50/hour | 500/hour | Custom |
| `/api/mobile-app` (builds) | 20/hour | 200/hour | Custom |

### Standard Endpoints
Normal limits for CRUD operations:

| Endpoint Category | Free Tier | Pro Tier | Enterprise |
|-------------------|-----------|----------|------------|
| Invoices | 1000/hour | 10000/hour | Custom |
| Projects | 1000/hour | 10000/hour | Custom |
| Collaboration | 2000/hour | 20000/hour | Custom |
| Settings | 500/hour | 5000/hour | Custom |

## Rate Limit Headers

Every API response includes rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1709740800
```

### Header Descriptions

- **X-RateLimit-Limit**: Maximum requests allowed in the current window
- **X-RateLimit-Remaining**: Requests remaining in current window
- **X-RateLimit-Reset**: Unix timestamp when the limit resets

## Rate Limit Exceeded

When you exceed the rate limit, the API returns:

**Status Code**: `429 Too Many Requests`

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit. Please try again in 3600 seconds.",
  "retry_after": 3600
}
```

### Example Response Headers
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1709740800
Retry-After: 3600
```

## Best Practices

### 1. Check Rate Limit Headers

Always check rate limit headers in your responses:

```typescript
const response = await fetch('/api/v1/invoices', {
  headers: { 'Authorization': `Bearer ${token}` },
})

const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'))
const reset = parseInt(response.headers.get('X-RateLimit-Reset'))

if (remaining < 10) {
  console.warn(`Only ${remaining} requests left until ${new Date(reset * 1000)}`)
}
```

### 2. Implement Exponential Backoff

When you hit rate limits, implement exponential backoff:

```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options)
    
    if (response.status !== 429) {
      return response
    }
    
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
    const delay = Math.min(1000 * Math.pow(2, i), retryAfter * 1000)
    
    console.log(`Rate limited. Retrying in ${delay}ms...`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  throw new Error('Max retries exceeded')
}
```

### 3. Batch Requests

Combine multiple operations into batch requests where possible:

```typescript
// Instead of multiple individual requests
// ❌ Bad
for (const invoice of invoices) {
  await fetch('/api/v1/invoices', {
    method: 'PATCH',
    body: JSON.stringify({ id: invoice.id, status: 'sent' }),
  })
}

// ✅ Good - Use batch endpoint
await fetch('/api/v1/invoices/batch', {
  method: 'PATCH',
  body: JSON.stringify({
    updates: invoices.map(inv => ({ id: inv.id, status: 'sent' })),
  }),
})
```

### 4. Cache Responses

Cache GET responses when appropriate:

```typescript
const cache = new Map()

async function fetchWithCache(url, ttl = 60000) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  const data = await response.json()
  
  cache.set(url, { data, timestamp: Date.now() })
  return data
}
```

### 5. Use Webhooks

For real-time updates, use webhooks instead of polling:

```typescript
// ❌ Bad - Polling every second
setInterval(async () => {
  const response = await fetch('/api/projects/status')
  // Check for updates
}, 1000)

// ✅ Good - Use webhooks
// Configure webhook in dashboard to receive updates
```

## Monitoring Your Usage

View your current rate limit usage in the dashboard:

1. Navigate to **Settings** → **API Usage**
2. View real-time metrics and historical data
3. Set up alerts for when you approach limits

## Increasing Limits

### Temporary Increases

For short-term events (launches, campaigns), request temporary limit increases:

1. Contact support@kaziplatform.com
2. Provide event details and expected traffic
3. Limits can be increased for 24-72 hours

### Permanent Increases

Upgrade your plan or request custom Enterprise limits:

- **Pro Plan**: [Upgrade in Dashboard]
- **Enterprise**: Contact sales@kaziplatform.com

## IP-Based Limits

In addition to user-based limits, IP-based limits prevent abuse:

- **Per IP**: 10,000 requests/hour
- **Applies to**: All unauthenticated endpoints

## Mitigation Strategies

If you frequently hit rate limits:

1. **Optimize API calls**: Reduce unnecessary requests
2. **Implement caching**: Cache frequently accessed data
3. **Use batch endpoints**: Combine multiple operations
4. **Upgrade tier**: Move to Pro or Enterprise
5. **Use webhooks**: Replace polling with event-driven updates
6. **Request custom limits**: Contact support for custom quotas

## Support

For questions about rate limits:

- **Email**: support@kaziplatform.com
- **Documentation**: https://docs.kaziplatform.com/rate-limiting
- **Status Page**: https://status.kaziplatform.com
