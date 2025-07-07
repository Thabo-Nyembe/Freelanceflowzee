// import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../../__mocks__/supabase-provider'
import { ThemeProvider } from '../../__mocks__/theme-provider'
import ClientDashboard from '../../components/client/client-dashboard'

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

describe('ClientDashboard', () => {
  it('renders without crashing', () => {
    render(
      <Providers>
        <ClientDashboard />
      </Providers>
    )
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('displays project list', () => {
    render(
      <Providers>
        <ClientDashboard />
      </Providers>
    )
    expect(screen.getByTestId('project-list')).toBeInTheDocument()
  })

  it('filters projects by status', async () => {
    render(
      <Providers>
        <ClientDashboard />
      </Providers>
    )
    
    const statusFilter = screen.getByTestId('status-filter')
    fireEvent.click(statusFilter)
    fireEvent.click(screen.getByText('In Progress'))
    
    await waitFor(() => {
      expect(screen.getByTestId('project-list')).toHaveAttribute('data-filter', 'in-progress')
    })
  })

  it('creates a new project', async () => {
    render(
      <Providers>
        <ClientDashboard />
      </Providers>
    )
    
    const newProjectButton = screen.getByTestId('new-project-button')
    fireEvent.click(newProjectButton)
    
    const projectTitleInput = screen.getByTestId('project-title-input')
    const projectDescriptionInput = screen.getByTestId('project-description-input')
    const projectBudgetInput = screen.getByTestId('project-budget-input')
    
    fireEvent.change(projectTitleInput, { target: { value: 'Test Project' } })
    fireEvent.change(projectDescriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(projectBudgetInput, { target: { value: '1000' } })
    
    const submitButton = screen.getByTestId('submit-project-button')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Project created successfully')).toBeInTheDocument()
    })
  })

  it('displays project details', async () => {
    render(
      <Providers>
        <ClientDashboard />
      </Providers>
    )
    
    const projectCard = screen.getByTestId('project-card-1')
    fireEvent.click(projectCard)
    
    await waitFor(() => {
      expect(screen.getByTestId('project-details')).toBeInTheDocument()
      expect(screen.getByText('Project Timeline')).toBeInTheDocument()
      expect(screen.getByText('Budget Overview')).toBeInTheDocument()
    })
  })

  it('updates project status', async () => {
    render(
      <Providers>
        <ClientDashboard />
      </Providers>
    )
    
    const projectCard = screen.getByTestId('project-card-1')
    fireEvent.click(projectCard)
    
    const statusButton = screen.getByTestId('project-status-button')
    fireEvent.click(statusButton)
    fireEvent.click(screen.getByText('Completed'))
    
    await waitFor(() => {
      expect(screen.getByTestId('project-status-1')).toHaveTextContent('completed')
    })
  })
}) 