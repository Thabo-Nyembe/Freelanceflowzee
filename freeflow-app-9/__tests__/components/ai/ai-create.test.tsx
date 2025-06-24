import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AICreate } from '@/components/ai/ai-create'
import { createClient } from '@supabase/supabase-js'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      })
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      mockResolvedValue: vi.fn().mockResolvedValue({
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

describe('AICreate', () => {
  const mockSupabase = createClient('http://localhost:54321', 'test-anon-key')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all tabs', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all asset type buttons', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Audio')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('allows switching between asset types', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const codeButton = screen.getByText('Code')
    fireEvent.click(codeButton)
    
    expect(codeButton).toHaveClass('default') // Active button should have default variant
  })

  it('handles prompt input', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const textarea = screen.getByPlaceholderText('Describe what you want to create...')
    fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    
    expect(textarea).toHaveValue('Test prompt')
  })

  it('disables generate button when prompt is empty', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const generateButton = screen.getByText('Generate')
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when prompt is not empty', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const textarea = screen.getByPlaceholderText('Describe what you want to create...')
    fireEvent.change(textarea, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByText('Generate')
    expect(generateButton).not.toBeDisabled()
  })

  it('shows loading state during generation', async () => {
    render(<AICreate supabase={mockSupabase} />)
    
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
    render(<AICreate supabase={mockSupabase} />)
    
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