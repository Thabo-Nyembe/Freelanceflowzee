import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AICreate } from '@/components/ai/ai-create'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabase = createClient('http://localhost:54321', 'test-anon-key')

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'test-generation-id' } })
    }))
  }))
}))

describe('AICreate Component', () => {
  it('renders all tabs correctly', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    expect(screen.getByTestId('create-tab')).toBeInTheDocument()
    expect(screen.getByTestId('library-tab')).toBeInTheDocument()
    expect(screen.getByTestId('settings-tab')).toBeInTheDocument()
  })

  it('allows text input in prompt field', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const promptInput = screen.getByTestId('prompt-input')
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    
    expect(promptInput).toHaveValue('Test prompt')
  })

  it('handles generation process correctly', async () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const promptInput = screen.getByTestId('prompt-input')
    const generateButton = screen.getByTestId('generate-btn')

    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })
    fireEvent.click(generateButton)

    expect(generateButton).toBeDisabled()
    expect(generateButton).toHaveTextContent('Generating...')

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled()
      expect(generateButton).toHaveTextContent('Generate')
    })
  })

  it('disables generate button when prompt is empty', () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const generateButton = screen.getByTestId('generate-btn')
    expect(generateButton).toBeDisabled()
  })
}) 