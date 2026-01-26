# API Reference

Quick reference for KAZI REST API endpoints. For Server Actions documentation, see `API_ENDPOINTS.md`.

**Base URL:** `/api`
**Authentication:** Supabase Auth (session cookies) or API Key (Bearer token)
**Content-Type:** `application/json`

---

## Authentication

### NextAuth Session Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | GET/POST | Sign in page |
| `/api/auth/signout` | GET/POST | Sign out |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/csrf` | GET | Get CSRF token |
| `/api/auth/providers` | GET | List available OAuth providers |
| `/api/auth/callback/:provider` | POST | OAuth callback handler |

### User Registration

**POST** `/api/auth/signup`

Creates a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "user"  // optional: "user" | "freelancer" | "client"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**GET** `/api/auth/signup`

Returns signup configuration and available options.

**Response:**
```json
{
  "availableRoles": ["user", "freelancer", "client"],
  "passwordRequirements": {
    "minLength": 8
  },
  "emailVerificationRequired": true,
  "oauthProviders": ["google", "github"]
}
```

### Email Verification

**POST** `/api/auth/verify-email`

Verifies user email with token.

### Passkeys (WebAuthn)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/passkeys` | GET | List user's passkeys | Required |
| `/api/auth/passkeys` | POST | Generate backup codes | Required |
| `/api/auth/passkeys/register` | POST | Register new passkey | Required |
| `/api/auth/passkeys/authenticate` | POST | Authenticate with passkey | None |
| `/api/auth/passkeys/[id]` | DELETE | Remove passkey | Required |

**GET** `/api/auth/passkeys`

**Response:**
```json
{
  "success": true,
  "passkeys": [
    {
      "id": "passkey-id",
      "name": "MacBook Pro",
      "deviceType": "platform",
      "backedUp": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "lastUsedAt": "2024-01-20T14:30:00Z"
    }
  ],
  "count": 1
}
```

### SSO Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sso/saml` | POST | SAML SSO login |
| `/api/auth/sso/oidc` | POST | OpenID Connect login |
| `/api/auth/sso/callback/[provider]` | GET/POST | SSO callback |

### Permissions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/permissions/check` | POST | Check user permissions |
| `/api/auth/permissions/grant` | POST | Grant permission (admin) |
| `/api/auth/permissions/revoke` | POST | Revoke permission (admin) |

---

## Payments (Stripe)

### Create Payment Intent

**POST** `/api/payments/create-intent`

Creates a Stripe payment intent for processing payments.

**Request:**
```json
{
  "amount": 5000,        // Amount in cents
  "currency": "usd",     // Optional, defaults to "usd"
  "metadata": {          // Optional
    "projectId": "proj-123",
    "type": "service"
  },
  "customerId": "cus_xxx", // Optional Stripe customer ID
  "description": "Project payment"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 5000,
  "currency": "usd"
}
```

**GET** `/api/payments/create-intent?id=pi_xxx`

Retrieves payment intent status.

**Response:**
```json
{
  "id": "pi_xxx",
  "status": "succeeded",
  "amount": 5000,
  "currency": "usd",
  "metadata": {}
}
```

### Enhanced Payment Intent

**POST** `/api/payments/create-intent-enhanced`

Extended payment intent creation with additional features.

### Process Payment

**POST** `/api/payments/process`

Process a payment with additional business logic.

### Guest Payment

**POST** `/api/payments/guest-payment`

Process payment for unauthenticated users.

### Retry Failed Invoice

**POST** `/api/payments/retry-invoice`

Retry a failed invoice payment.

### Stripe Webhooks

**POST** `/api/payments/webhooks`

Handles Stripe webhook events. Configure in Stripe dashboard.

**Supported Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `checkout.session.completed`

**Headers Required:**
- `stripe-signature`: Webhook signature from Stripe

---

## V1 API (API Key Authentication)

The V1 API uses API key authentication for external integrations.

**Authentication:**
```
Authorization: Bearer your-api-key
```

**Rate Limiting:** Rate limit headers included in responses.

### Clients

**GET** `/api/v1/clients`

List all clients.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `search` | string | Search by name, email, company |
| `limit` | number | Max results (default: 50, max: 100) |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+1234567890",
      "company": "Acme Corporation",
      "status": "active",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**POST** `/api/v1/clients`

Create a new client.

**Request:**
```json
{
  "name": "Acme Corp",       // Required
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "company": "Acme Corporation",
  "address": "123 Main St",
  "website": "https://acme.com",
  "status": "active",
  "notes": "Important client",
  "tags": ["enterprise", "priority"]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    ...
  }
}
```

### Projects

**GET** `/api/v1/projects`

List all projects.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `limit` | number | Max results (default: 50, max: 100) |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Website Redesign",
      "description": "Complete website overhaul",
      "status": "in_progress",
      "client_id": "uuid",
      "budget": 10000,
      "deadline": "2024-03-01",
      "priority": "high",
      "tags": ["web", "design"]
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**POST** `/api/v1/projects`

Create a new project.

**Request:**
```json
{
  "name": "Website Redesign",  // Required
  "description": "Complete website overhaul",
  "status": "planning",        // planning | in_progress | completed | on_hold
  "client_id": "uuid",
  "budget": 10000,
  "deadline": "2024-03-01",
  "priority": "high",          // low | medium | high
  "tags": ["web", "design"]
}
```

### Invoices

**GET** `/api/v1/invoices`

List all invoices.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status (draft, sent, paid, overdue) |
| `client_id` | string | Filter by client |
| `limit` | number | Max results (default: 50, max: 100) |
| `offset` | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-000001",
      "client_id": "uuid",
      "status": "sent",
      "items": [...],
      "subtotal": 1000,
      "tax_rate": 10,
      "tax_amount": 100,
      "discount": 0,
      "total": 1100,
      "due_date": "2024-02-15",
      "clients": {
        "name": "Acme Corp",
        "email": "billing@acme.com"
      }
    }
  ],
  "pagination": {...}
}
```

**POST** `/api/v1/invoices`

Create a new invoice.

**Request:**
```json
{
  "client_id": "uuid",        // Required
  "project_id": "uuid",       // Optional
  "items": [                   // Required, at least one
    {
      "description": "Web Design",
      "quantity": 1,
      "rate": 500
    },
    {
      "description": "Development",
      "quantity": 10,
      "rate": 100
    }
  ],
  "tax_rate": 10,             // Percentage
  "discount": 50,             // Amount to subtract
  "notes": "Payment due within 30 days",
  "due_date": "2024-02-15",
  "status": "draft"           // draft | sent
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "invoice_number": "INV-000042",
    "subtotal": 1500,
    "tax_amount": 150,
    "total": 1600,
    ...
  }
}
```

---

## Webhooks Management

**GET** `/api/webhooks`

List configured webhooks.

**POST** `/api/webhooks`

Create a new webhook subscription.

**GET/PATCH/DELETE** `/api/webhooks/[webhookId]`

Manage specific webhook.

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",       // Optional
  "details": [...]            // Optional validation errors
}
```

**Common Status Codes:**

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Rate Limiting

V1 API endpoints include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705330800
```

---

## Additional API Endpoints

The application includes many more API endpoints for specific features:

| Category | Endpoints |
|----------|-----------|
| Account | `/api/account`, `/api/account/delete`, `/api/account/deactivate` |
| Settings | `/api/settings`, `/api/settings/profile`, `/api/settings/reset` |
| Collaboration | `/api/collaboration/*` (comments, presence, documents) |
| Crypto Payments | `/api/crypto/create-payment`, `/api/crypto/exchange-rates` |
| Admin | `/api/admin/*` (analytics, automation, CRM, invoicing) |
| SCIM | `/api/scim/v2/*` (enterprise user provisioning) |
| Video Studio | `/api/video-studio/*` |
| Calendar | `/api/calendar-scheduling/*` |

For complete endpoint documentation, explore the `/app/api` directory.

---

**Last Updated:** January 2026
