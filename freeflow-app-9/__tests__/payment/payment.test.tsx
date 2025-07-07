// import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../../__mocks__/supabase-provider'
import { ThemeProvider } from '../../__mocks__/theme-provider'
import Payment from '../../components/payment/payment'

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

describe('Payment', () => {
  it('renders without crashing', () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    expect(screen.getByText('Payment Details')).toBeInTheDocument()
  })

  it('displays payment amount', () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
  })

  it('shows payment methods', () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    expect(screen.getByTestId('payment-methods')).toBeInTheDocument()
  })

  it('validates billing details', async () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    
    const nameInput = screen.getByTestId('billing-name')
    const emailInput = screen.getByTestId('billing-email')
    const addressInput = screen.getByTestId('billing-address')
    
    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(addressInput, { target: { value: '' } })
    
    const submitButton = screen.getByTestId('submit-payment')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      expect(screen.getByText('Address is required')).toBeInTheDocument()
    })
  })

  it('handles successful payment', async () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    
    const nameInput = screen.getByTestId('billing-name')
    const emailInput = screen.getByTestId('billing-email')
    const addressInput = screen.getByTestId('billing-address')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(addressInput, { target: { value: '123 Main St' } })
    
    const methodSelect = screen.getByTestId('payment-method-select')
    fireEvent.click(methodSelect)
    fireEvent.click(screen.getByText('Credit Card'))
    
    const submitButton = screen.getByTestId('submit-payment')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Payment successful!')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('shows payment history', async () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    
    const historyButton = screen.getByTestId('payment-history-button')
    fireEvent.click(historyButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('payment-history')).toBeInTheDocument()
      expect(screen.getByText('Previous Payments')).toBeInTheDocument()
    })
  })

  it('allows payment method selection', async () => {
    render(
      <Providers>
        <Payment amount={1000} projectId="123" />
      </Providers>
    )
    
    const methodSelect = screen.getByTestId('payment-method-select')
    fireEvent.click(methodSelect)
    fireEvent.click(screen.getByText('Credit Card'))
    
    await waitFor(() => {
      expect(screen.getByTestId('card-element')).toBeInTheDocument()
    })
  })
}) 