import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AICreate from '@/components/collaboration/ai-create'
import { createClient } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext } from 'react'
import { ThemeProvider } from 'next-themes'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// Create a test SupabaseContext
const TestSupabaseContext = createContext<SupabaseClient<Database> | null>(null)

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      mockResolvedValue: jest.fn().mockResolvedValue({
        data: {
          id: 'test-generation-id',
          user_id: 'test-user-id',
          type: 'text',
          prompt: 'test prompt',
          settings: {
            creativity: 0.7,
            quality: 'standard',
            model: 'default'
          },
          status: 'complete',
          output: 'Generated content',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      })
    }))
  }))
}))

const mockSupabase = createClient('http://localhost:54321', 'test-anon-key')
const queryClient = new QueryClient()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TestSupabaseContext.Provider value={mockSupabase}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  </TestSupabaseContext.Provider>
)

describe('AICreate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all tabs', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all asset type buttons', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Audio')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('allows switching between asset types', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    
    expect(codeButton).toHaveClass('default') // Active button should have default variant
  })

  it('handles prompt input', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    const textarea = screen.getByPlaceholderText('Describe what you want to create...')
    fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    
    expect(textarea).toHaveValue('Test prompt')
  })

  it('disables generate button when prompt is empty', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    const generateButton = screen.getByText('Generate')
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when prompt is not empty', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    const textarea = screen.getByPlaceholderText('Describe what you want to create...')
    fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByText('Generate')
    expect(generateButton).not.toBeDisabled()
  })

  it('shows loading state during generation', async () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    const textarea = screen.getByPlaceholderText('Describe what you want to create...')
    fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByText('Generate')
    fireEvent.click(generateButton)
    
    expect(screen.getByText('Generating')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Generating')).not.toBeInTheDocument()
    })
  })

  it('allows changing settings', () => {
    render(<AICreate />, { wrapper: TestWrapper })
    
    // Switch to settings tab
    const settingsTab = screen.getByText('Settings')
    fireEvent.click(settingsTab)
    
    // Change quality
    const qualitySelect = screen.getByText('Select quality')
    fireEvent.click(qualitySelect)
    const premiumOption = screen.getByText('Premium')
    fireEvent.click(premiumOption)
    
    // Change model
    const modelSelect = screen.getByText('Select model')
    fireEvent.click(modelSelect)
    const gpt4Option = screen.getByText('GPT-4')
    fireEvent.click(gpt4Option)
    
    // Verify settings were updated
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('GPT-4')).toBeInTheDocument()
  })
}) 