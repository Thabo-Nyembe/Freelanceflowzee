// import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseProvider, useSupabase } from '../__mocks__/supabase-provider'
import { ThemeProvider } from '../__mocks__/theme-provider'
import { OpenAI } from 'openai'

const TestComponent = () => {
  const { supabase } = useSupabase()
  const [response, setResponse] = React.useState('')
  const [savedResponse, setSavedResponse] = React.useState('')
  const openai = new OpenAI({ apiKey: 'test-key' })

  const handleGetAndSaveResponse = async () => {
    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello!' }],
      model: 'gpt-3.5-turbo',
    })
    const aiResponse = completion.choices[0].message.content
    setResponse(aiResponse)

    // Save response to Supabase
    const { data, error } = await supabase
      .from('responses')
      .insert([{ content: aiResponse }])
      .select()
      .single()

    if (data) {
      setSavedResponse(data.content)
    }
  }

  return (
    <div>
      <h1>Integration Test</h1>
      <button onClick={handleGetAndSaveResponse}>Get and Save Response</button>
      {response && <p data-testid="openai-response">OpenAI Response: {response}</p>}
      {savedResponse && <p data-testid="saved-response">Saved Response: {savedResponse}</p>}
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

describe('Integration Test', () => {
  it('renders without crashing', () => {
    render(<TestComponent />, { wrapper: Providers })
    expect(screen.getByText('Integration Test')).toBeInTheDocument()
  })

  it('gets response from OpenAI and saves to Supabase', async () => {
    render(<TestComponent />, { wrapper: Providers })
    
    fireEvent.click(screen.getByText('Get and Save Response'))
    
    await waitFor(() => {
      expect(screen.getByTestId('openai-response')).toHaveTextContent('Mocked OpenAI response')
      expect(screen.getByTestId('saved-response')).toHaveTextContent('Mocked OpenAI response')
    })
  })
}) 