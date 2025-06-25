import { render } from '@testing-library/react'
import { Providers } from '@/components/providers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>
        {ui}
      </Providers>
    </QueryClientProvider>
  )
}

export function createMockProject(overrides = {}) {
  return {
    id: 'test-project-id',
    title: 'Test Project',
    description: 'A test project description',
    status: 'active',
    priority: 'medium',
    budget: 1000,
    spent: 500,
    client_name: 'Test Client',
    client_email: 'client@test.com',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    progress: 50,
    team_members: [],
    attachments: [],
    comments_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

export function mockSupabaseClient() {
  return {
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  }
}

export function mockNextNavigation() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }
} 