# Testing Guide - V2 Integration

## 📋 Overview

Comprehensive testing strategy for all 44 V2 dashboard pages with real backend integrations.

**Created:** December 14, 2024
**Test Framework:** Playwright + Jest + React Testing Library
**Coverage Goal:** >80% for all integrated pages

---

## 🎯 Testing Strategy

### 1. **Unit Tests** (Jest + React Testing Library)

Test individual components and hooks in isolation.

### 2. **Integration Tests** (Playwright)

Test full user workflows with real database connections.

### 3. **End-to-End Tests** (Playwright)

Test complete user journeys across multiple pages.

### 4. **Real-time Tests**

Test WebSocket subscriptions and live updates.

### 5. **Performance Tests**

Test load times, query performance, and rendering speed.

---

## 🧪 Unit Testing

### Testing Custom Hooks

```typescript
// lib/hooks/__tests__/use-events.test.ts

import { renderHook, waitFor } from '@testing-library/react'
import { useEvents } from '../use-events'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
jest.mock('@supabase/supabase-js')

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch events on mount', async () => {
    const mockEvents = [
      { id: '1', name: 'Test Event', status: 'upcoming' }
    ]

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockEvents, error: null })
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

    const { result } = renderHook(() => useEvents())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.events).toEqual(mockEvents)
    })
  })

  it('should handle errors', async () => {
    const mockError = new Error('Failed to fetch')

    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: null, error: mockError })
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

    const { result } = renderHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should filter events by status', async () => {
    const { result, rerender } = renderHook(
      ({ status }) => useEvents({ status }),
      { initialProps: { status: 'upcoming' as const } }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verify filter is applied
    // ... test implementation
  })
})
```

### Testing Server Actions

```typescript
// app/actions/__tests__/events.test.ts

import { createEvent, updateEvent, deleteEvent } from '../events'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('next/headers')

describe('Event Actions', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  beforeEach(() => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: '1', name: 'New Event' },
        error: null
      })
    }

    ;(createServerActionClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('should create an event', async () => {
    const eventData = {
      name: 'Test Event',
      event_type: 'conference' as const,
      start_date: '2024-12-20',
      end_date: '2024-12-21'
    }

    const result = await createEvent(eventData)

    expect(result).toHaveProperty('id')
    expect(result.name).toBe('Test Event')
  })

  it('should throw error if not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null
        })
      }
    }

    ;(createServerActionClient as jest.Mock).mockReturnValue(mockSupabase)

    await expect(createEvent({} as any)).rejects.toThrow('Unauthorized')
  })
})
```

### Testing Components

```typescript
// app/(app)/dashboard/events-v2/__tests__/events-client.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EventsClient from '../events-client'
import { useEvents } from '@/lib/hooks/use-events'

jest.mock('@/lib/hooks/use-events')

describe('EventsClient', () => {
  const mockEvents = [
    {
      id: '1',
      name: 'Conference 2024',
      status: 'upcoming',
      event_type: 'conference',
      start_date: '2024-12-20',
      current_attendees: 50
    }
  ]

  beforeEach(() => {
    ;(useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      createEvent: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn()
    })
  })

  it('should render events list', () => {
    render(<EventsClient initialEvents={[]} />)

    expect(screen.getByText('Conference 2024')).toBeInTheDocument()
  })

  it('should filter events by status', async () => {
    render(<EventsClient initialEvents={[]} />)

    const upcomingFilter = screen.getByRole('button', { name: /upcoming/i })
    fireEvent.click(upcomingFilter)

    await waitFor(() => {
      // Verify only upcoming events are shown
      expect(screen.queryByText('Conference 2024')).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    ;(useEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true,
      error: null
    })

    render(<EventsClient initialEvents={[]} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display error state', () => {
    ;(useEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: new Error('Failed to load')
    })

    render(<EventsClient initialEvents={[]} />)

    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## 🎭 Integration Testing (Playwright)

### Setup Playwright

```bash
# Install Playwright
npm install -D @playwright/test

# Initialize Playwright
npx playwright install

# Create test directory
mkdir -p tests/e2e
```

### Example: Events Page Integration Test

```typescript
// tests/e2e/events-v2.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Events V2 Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for redirect
    await page.waitForURL('/dashboard')

    // Navigate to events page
    await page.goto('/dashboard/events-v2')
  })

  test('should display events from database', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="events-list"]')

    // Verify events are displayed
    const events = await page.$$('[data-testid="event-card"]')
    expect(events.length).toBeGreaterThan(0)
  })

  test('should create a new event', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("Create Event")')

    // Fill form
    await page.fill('input[name="name"]', 'New Test Event')
    await page.selectOption('select[name="event_type"]', 'conference')
    await page.fill('input[name="start_date"]', '2024-12-20')
    await page.fill('input[name="end_date"]', '2024-12-21')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator('text=Event created successfully')).toBeVisible()

    // Verify event appears in list
    await expect(page.locator('text=New Test Event')).toBeVisible()
  })

  test('should filter events by status', async ({ page }) => {
    // Click upcoming filter
    await page.click('button:has-text("Upcoming")')

    // Verify only upcoming events are shown
    const statusBadges = await page.$$('[data-testid="event-status"]')
    for (const badge of statusBadges) {
      const text = await badge.textContent()
      expect(text?.toLowerCase()).toContain('upcoming')
    }
  })

  test('should update an event', async ({ page }) => {
    // Click first event
    await page.click('[data-testid="event-card"]:first-child')

    // Click edit button
    await page.click('button:has-text("Edit")')

    // Update name
    await page.fill('input[name="name"]', 'Updated Event Name')

    // Save changes
    await page.click('button:has-text("Save")')

    // Verify update
    await expect(page.locator('text=Event updated successfully')).toBeVisible()
    await expect(page.locator('text=Updated Event Name')).toBeVisible()
  })

  test('should delete an event', async ({ page }) => {
    // Get initial count
    const initialCount = await page.$$('[data-testid="event-card"]')

    // Click first event
    await page.click('[data-testid="event-card"]:first-child')

    // Click delete button
    await page.click('button:has-text("Delete")')

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Verify deletion
    await expect(page.locator('text=Event deleted successfully')).toBeVisible()

    // Verify count decreased
    const newCount = await page.$$('[data-testid="event-card"]')
    expect(newCount.length).toBe(initialCount.length - 1)
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Simulate error by disconnecting network
    await page.route('**/api/**', route => route.abort())

    // Try to create event
    await page.click('button:has-text("Create Event")')
    await page.fill('input[name="name"]', 'Test Event')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('text=Failed to create event')).toBeVisible()
  })
})
```

### Real-time Update Test

```typescript
// tests/e2e/realtime.spec.ts

import { test, expect } from '@playwright/test'

test('should show real-time updates', async ({ browser }) => {
  // Create two browser contexts (two users)
  const context1 = await browser.newContext()
  const context2 = await browser.newContext()

  const page1 = await context1.newPage()
  const page2 = await context2.newPage()

  // Login both users
  // ... login logic

  // Both navigate to events page
  await page1.goto('/dashboard/events-v2')
  await page2.goto('/dashboard/events-v2')

  // User 1 creates an event
  await page1.click('button:has-text("Create Event")')
  await page1.fill('input[name="name"]', 'Real-time Test Event')
  await page1.click('button[type="submit"]')

  // User 2 should see the new event appear automatically
  await expect(page2.locator('text=Real-time Test Event')).toBeVisible({
    timeout: 5000
  })

  // Cleanup
  await context1.close()
  await context2.close()
})
```

---

## 🚀 Performance Testing

### Lighthouse Testing

```typescript
// tests/performance/lighthouse.spec.ts

import { test } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

test('should meet performance benchmarks', async ({ page }) => {
  await page.goto('/dashboard/events-v2')

  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 85
    }
  })
})
```

### Query Performance Testing

```typescript
// tests/performance/queries.spec.ts

import { test, expect } from '@playwright/test'

test('should load events within 2 seconds', async ({ page }) => {
  const startTime = Date.now()

  await page.goto('/dashboard/events-v2')
  await page.waitForSelector('[data-testid="events-list"]')

  const loadTime = Date.now() - startTime

  expect(loadTime).toBeLessThan(2000) // 2 seconds
})

test('should handle large datasets efficiently', async ({ page }) => {
  // Navigate to page with 1000+ events
  await page.goto('/dashboard/events-v2?limit=1000')

  const startTime = Date.now()
  await page.waitForSelector('[data-testid="events-list"]')
  const renderTime = Date.now() - startTime

  expect(renderTime).toBeLessThan(3000) // 3 seconds for large dataset
})
```

---

## 📊 Test Coverage

### Generate Coverage Reports

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Goals

```json
// package.json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## 🎯 Test Checklist (Per Page)

For each V2 page integration, verify:

### Data Loading
- [ ] Initial SSR data loads correctly
- [ ] Client-side data fetching works
- [ ] Loading states display properly
- [ ] Error states handle failures
- [ ] Empty states show when no data

### Real-time Functionality
- [ ] New records appear automatically
- [ ] Updates reflect in real-time
- [ ] Deletes remove records instantly
- [ ] Subscriptions clean up properly
- [ ] No duplicate subscriptions

### CRUD Operations
- [ ] Create operation works
- [ ] Read displays correct data
- [ ] Update saves changes
- [ ] Delete removes records
- [ ] Optimistic updates work

### Filtering & Search
- [ ] Status filters work
- [ ] Category filters work
- [ ] Search filters data
- [ ] Multiple filters combine
- [ ] Filter state persists

### UI/UX
- [ ] Stats display correctly
- [ ] Quick actions work
- [ ] Pill buttons toggle
- [ ] Forms validate input
- [ ] Toasts show feedback

### Performance
- [ ] Page loads in <2s
- [ ] No unnecessary re-renders
- [ ] Queries are optimized
- [ ] Real-time doesn't lag
- [ ] Memory doesn't leak

### Authentication
- [ ] Requires login
- [ ] Shows user's data only
- [ ] RLS policies enforced
- [ ] Unauthorized handled

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] ARIA labels present
- [ ] Color contrast sufficient

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test V2 Integrations

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test

      - name: Run integration tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Run Lighthouse
        run: npm run test:lighthouse
```

---

## 📚 Testing Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:lighthouse": "lighthouse http://localhost:3000/dashboard/events-v2"
  }
}
```

---

## 🐛 Common Testing Issues

### Issue: Tests timing out

```typescript
// Increase timeout for slow queries
test('should load events', async ({ page }) => {
  await page.goto('/dashboard/events-v2', {
    timeout: 30000 // 30 seconds
  })
})
```

### Issue: Real-time tests flaky

```typescript
// Add explicit waits for real-time updates
await page.waitForFunction(
  (eventName) => {
    const events = document.querySelectorAll('[data-testid="event-card"]')
    return Array.from(events).some(e => e.textContent?.includes(eventName))
  },
  'Real-time Test Event',
  { timeout: 10000 }
)
```

### Issue: Database state pollution

```typescript
// Clean up after each test
test.afterEach(async () => {
  // Delete test data
  await supabase
    .from('events')
    .delete()
    .like('name', '%Test%')
})
```

---

## 📚 Next Steps

1. **Set up test database** - Separate Supabase project for testing
2. **Write tests for each batch** - Follow checklist for all 44 pages
3. **Set up CI/CD** - Automate testing on every commit
4. **Monitor test coverage** - Maintain >80% coverage

---

**Last Updated:** December 14, 2024
**Status:** Testing guide complete
**Next:** Create DEPLOYMENT_GUIDE.md
