// import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider, useSupabase } from '../__mocks__/supabase-provider'
import { ThemeProvider } from '../__mocks__/theme-provider'

const TestComponent = () => {
  const { supabase, session, user } = useSupabase()

  const handleClick = async () => {
    await supabase.from('test_table').insert([{ name: 'test' }])
  }

  return (
    <div>
      <h1>Supabase Test</h1>
      <p>Session: {session ? 'Active' : 'None'}</p>
      <p>User: {user ? user.email : 'Not logged in'}</p>
      <button onClick={handleClick}>Insert Data</button>
    </div>
  )
}

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

describe('Supabase Component Test', () => {
  it('renders without crashing', () => {
    render(<TestComponent />, { wrapper: Providers })
    expect(screen.getByText('Supabase Test')).toBeInTheDocument()
    expect(screen.getByText('Session: None')).toBeInTheDocument()
    expect(screen.getByText('User: Not logged in')).toBeInTheDocument()
  })
}) 