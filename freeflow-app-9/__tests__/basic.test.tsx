// import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../__mocks__/supabase-provider'
import { ThemeProvider } from '../__mocks__/theme-provider'

const TestComponent = () => (
  <div>
    <h1>Test Component</h1>
    <p>Hello World</p>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <SupabaseProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SupabaseProvider>
  </QueryClientProvider>
)

describe('Basic Component Test', () => {
  it('renders without crashing', () => {
    render(<TestComponent />, { wrapper: Providers })
    expect(screen.getByText('Test Component')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
}) 