// import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../../__mocks__/supabase-provider'
import { ThemeProvider } from '../../__mocks__/theme-provider'
import Chat from '../../components/messaging/chat'

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

describe('Chat', () => {
  it('renders without crashing', () => {
    render(
      <Providers>
        <Chat />
      </Providers>
    )
    expect(screen.getByText('Messages')).toBeInTheDocument()
  })

  it('displays chat list', () => {
    render(
      <Providers>
        <Chat />
      </Providers>
    )
    expect(screen.getByTestId('chat-list')).toBeInTheDocument()
  })

  it('opens chat when clicking on a chat item', async () => {
    render(
      <Providers>
        <Chat />
      </Providers>
    )
    
    const chatItem = screen.getByTestId('chat-item-1')
    fireEvent.click(chatItem)
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-messages')).toBeInTheDocument()
      expect(screen.getByTestId('message-input')).toBeInTheDocument()
    })
  })

  it('sends a message', async () => {
    render(
      <Providers>
        <Chat />
      </Providers>
    )
    
    const chatItem = screen.getByTestId('chat-item-1')
    fireEvent.click(chatItem)
    
    const messageInput = screen.getByTestId('message-input')
    fireEvent.change(messageInput, { target: { value: 'Hello!' } })
    
    const sendButton = screen.getByTestId('send-button')
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument()
    })
  })

  it('filters chats by search', async () => {
    render(
      <Providers>
        <Chat />
      </Providers>
    )
    
    const searchInput = screen.getByTestId('chat-search')
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-list')).toHaveAttribute('data-filter', 'John')
    })
  })

  it('shows typing indicator', async () => {
    render(
      <Providers>
        <Chat />
      </Providers>
    )
    
    const chatItem = screen.getByTestId('chat-item-1')
    fireEvent.click(chatItem)
    
    const messageInput = screen.getByTestId('message-input')
    fireEvent.change(messageInput, { target: { value: 'H' } })
    
    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    })
  })
}) 