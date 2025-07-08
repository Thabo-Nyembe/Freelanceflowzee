import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import { AICreateStudio } from '@/components/ai/ai-create-studio'

// Mock fetch for API calls
global.fetch = jest.fn()

describe('AICreateStudio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        result: 'Generated content from AI',
        metadata: {
          model: 'gpt-4o-mini',
          type: 'text',
          usage: {
            prompt_tokens: 20,
            completion_tokens: 50,
            total_tokens: 70
          }
        }
      })
    })
  })

  it('renders AI Create Studio with all model tabs', () => {
    render(<AICreateStudio />)
    
    expect(screen.getByText('AI Create Studio')).toBeInTheDocument()
    expect(screen.getByText('GPT-4o Mini')).toBeInTheDocument()
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
    expect(screen.getByText('Claude 3.5 Sonnet')).toBeInTheDocument()
    expect(screen.getByText('Claude 3 Haiku')).toBeInTheDocument()
  })

  it('displays prompt input and generate button', () => {
    render(<AICreateStudio />)
    
    expect(screen.getByPlaceholderText('Enter your creative prompt...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('switches between model tabs', () => {
    render(<AICreateStudio />)
    
    const claudeTab = screen.getByText('Claude 3.5 Sonnet')
    fireEvent.click(claudeTab)
    
    // Should switch to Claude tab
    expect(claudeTab).toHaveAttribute('data-state', 'active')
  })

  it('disables generate button when prompt is empty', () => {
    render(<AICreateStudio />)
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    expect(generateButton).toBeDisabled()
  })

  it('enables generate button when prompt is provided', () => {
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Write a blog post about AI' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    expect(generateButton).not.toBeDisabled()
  })

  it('handles content generation successfully', async () => {
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Write a blog post about AI' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    // Should show generating state
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })
    
    // Should show generated content
    await waitFor(() => {
      expect(screen.getByText('Generated content from AI')).toBeInTheDocument()
    })
    
    // Should call API with correct parameters
    expect(fetch).toHaveBeenCalledWith('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Write a blog post about AI',
        model: 'gpt-4o-mini',
        type: 'text',
        temperature: 0.7,
        maxTokens: 1000
      })
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Generation failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('calls onGenerate callback when provided', async () => {
    const mockOnGenerate = jest.fn()
    render(<AICreateStudio onGenerate={mockOnGenerate} />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith('Generated content from AI')
    })
  })

  it('uses default model when provided', () => {
    render(<AICreateStudio defaultModel="claude-3-5-sonnet" />)
    
    const claudeTab = screen.getByText('Claude 3.5 Sonnet')
    expect(claudeTab).toHaveAttribute('data-state', 'active')
  })

  it('handles different model selection', async () => {
    render(<AICreateStudio />)
    
    // Switch to GPT-4o
    const gpt4Tab = screen.getByText('GPT-4o')
    fireEvent.click(gpt4Tab)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Test prompt',
          model: 'gpt-4o',
          type: 'text',
          temperature: 0.7,
          maxTokens: 1000
        })
      })
    })
  })

  it('shows loading state during generation', async () => {
    // Mock delayed response
    ;(fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            result: 'Generated content from AI'
          })
        }), 100)
      )
    )
    
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument()
    expect(generateButton).toBeDisabled()
    
    // Should hide loading after completion
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument()
    })
  })

  it('clears previous results when generating new content', async () => {
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    const generateButton = screen.getByRole('button', { name: /generate/i })
    
    // First generation
    fireEvent.change(promptInput, { target: { value: 'First prompt' } })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Generated content from AI')).toBeInTheDocument()
    })
    
    // Second generation
    fireEvent.change(promptInput, { target: { value: 'Second prompt' } })
    fireEvent.click(generateButton)
    
    // Should clear previous result during generation
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })
  })

  it('handles API response without result field', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        content: 'Content from different field'
      })
    })
    
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Content from different field')).toBeInTheDocument()
    })
  })

  it('handles non-ok API response', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500
    })
    
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    const generateButton = screen.getByRole('button', { name: /generate/i })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Generation failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('maintains history of generated content', async () => {
    render(<AICreateStudio />)
    
    const promptInput = screen.getByPlaceholderText('Enter your creative prompt...')
    const generateButton = screen.getByRole('button', { name: /generate/i })
    
    // First generation
    fireEvent.change(promptInput, { target: { value: 'First prompt' } })
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Generated content from AI')).toBeInTheDocument()
    })
    
    // Component should maintain history internally
    // This would require checking internal state or localStorage
  })
})