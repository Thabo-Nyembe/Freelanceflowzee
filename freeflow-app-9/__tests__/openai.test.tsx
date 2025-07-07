// import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider } from '../__mocks__/supabase-provider'
import { ThemeProvider } from '../__mocks__/theme-provider'
import { OpenAI } from 'openai'

const TestComponent = () => {
  const [response, setResponse] = React.useState('')
  const openai = new OpenAI({ apiKey: 'test-key' })

  const handleClick = async () => {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello!' }],
      model: 'gpt-3.5-turbo',
    })
    setResponse(completion.choices[0].message.content)
  }

  return (
    <div>
      <h1>OpenAI Test</h1>
      <button onClick={handleClick}>Get Response</button>
      {response && <p>Response: {response}</p>}
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

describe('OpenAI Component Test', () => {
  it('renders without crashing', () => {
    render(<TestComponent />, { wrapper: Providers })
    expect(screen.getByText('OpenAI Test')).toBeInTheDocument()
  })

  it('shows mocked response when button is clicked', async () => {
    render(<TestComponent />, { wrapper: Providers })
    fireEvent.click(screen.getByText('Get Response'))
    expect(await screen.findByText('Response: Mocked OpenAI response')).toBeInTheDocument()
  })
}) 