// import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../../__mocks__/supabase-provider'
import { ThemeProvider } from '../../__mocks__/theme-provider'
import FreelancerAnalytics from '../../components/freelancer/freelancer-analytics'

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

describe('FreelancerAnalytics', () => {
  it('renders without crashing', () => {
    render(
      <Providers>
        <FreelancerAnalytics />
      </Providers>
    )
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('displays earnings chart', () => {
    render(
      <Providers>
        <FreelancerAnalytics />
      </Providers>
    )
    expect(screen.getByTestId('earnings-chart')).toBeInTheDocument()
  })

  it('displays project metrics', () => {
    render(
      <Providers>
        <FreelancerAnalytics />
      </Providers>
    )
    expect(screen.getByTestId('total-projects')).toHaveTextContent('25')
    expect(screen.getByTestId('completed-projects')).toHaveTextContent('20')
    expect(screen.getByTestId('active-projects')).toHaveTextContent('5')
  })

  it('filters data by date range', async () => {
    render(
      <Providers>
        <FreelancerAnalytics />
      </Providers>
    )
    
    const dateFilter = screen.getByTestId('date-filter')
    fireEvent.click(dateFilter)
    fireEvent.click(screen.getByText('Last Month'))
    
    await waitFor(() => {
      expect(screen.getByTestId('earnings-chart')).toHaveAttribute('data-filter', 'last-month')
    })
  })

  it('exports analytics data', async () => {
    render(
      <Providers>
        <FreelancerAnalytics />
      </Providers>
    )
    
    const exportButton = screen.getByTestId('export-button')
    fireEvent.click(exportButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('export-message')).toHaveTextContent('Export successful')
    })
  })
}) 