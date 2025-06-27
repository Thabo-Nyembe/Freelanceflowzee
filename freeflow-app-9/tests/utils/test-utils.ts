import { render } from &apos;@testing-library/react&apos;
import { Providers } from &apos;@/components/providers&apos;
import { QueryClient, QueryClientProvider } from &apos;@tanstack/react-query&apos;

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
    id: &apos;test-project-id&apos;,
    title: &apos;Test Project&apos;,
    description: &apos;A test project description&apos;,
    status: &apos;active&apos;,
    priority: &apos;medium&apos;,
    budget: 1000,
    spent: 500,
    client_name: &apos;Test Client&apos;,
    client_email: &apos;client@test.com&apos;,
    start_date: &apos;2024-01-01&apos;,
    end_date: &apos;2024-12-31&apos;,
    progress: 50,
    team_members: [],
    attachments: [],
    comments_count: 0,
    created_at: &apos;2024-01-01T00:00:00Z&apos;,
    updated_at: &apos;2024-01-01T00:00:00Z&apos;,
    ...overrides
  }
}

export function createMockUser(overrides = {}) {
  return {
    id: &apos;test-user-id&apos;,
    email: &apos;test@example.com&apos;,
    name: &apos;Test User&apos;,
    avatar_url: null,
    created_at: &apos;2024-01-01T00:00:00Z&apos;,
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