import React from &apos;react&apos;
import { render, screen, fireEvent, waitFor } from &apos;@testing-library/react&apos;
import { AICreate } from &apos;@/components/ai/ai-create&apos;
import { createClient } from &apos;@supabase/supabase-js&apos;

// Mock Supabase client
const mockSupabase = createClient(&apos;http://localhost:54321&apos;, &apos;test-anon-key&apos;)

jest.mock(&apos;@supabase/supabase-js&apos;, () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: &apos;test-user-id&apos; } } })
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: &apos;test-generation-id&apos; } })
    }))
  }))
}))

describe(&apos;AICreate Component&apos;, () => {
  it(&apos;renders all tabs correctly&apos;, () => {
    render(<AICreate supabase={mockSupabase} />)
    
    expect(screen.getByTestId(&apos;create-tab&apos;)).toBeInTheDocument()
    expect(screen.getByTestId(&apos;library-tab&apos;)).toBeInTheDocument()
    expect(screen.getByTestId(&apos;settings-tab&apos;)).toBeInTheDocument()
  })

  it(&apos;allows text input in prompt field&apos;, () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const promptInput = screen.getByTestId(&apos;prompt-input&apos;)
    fireEvent.change(promptInput, { target: { value: &apos;Test prompt&apos; } })
    
    expect(promptInput).toHaveValue(&apos;Test prompt&apos;)
  })

  it(&apos;handles generation process correctly&apos;, async () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const promptInput = screen.getByTestId(&apos;prompt-input&apos;)
    const generateButton = screen.getByTestId(&apos;generate-btn&apos;)

    fireEvent.change(promptInput, { target: { value: &apos;Test prompt&apos; } })
    fireEvent.click(generateButton)

    expect(generateButton).toBeDisabled()
    expect(generateButton).toHaveTextContent(&apos;Generating...&apos;)

    await waitFor(() => {
      expect(generateButton).not.toBeDisabled()
      expect(generateButton).toHaveTextContent(&apos;Generate&apos;)
    })
  })

  it(&apos;disables generate button when prompt is empty&apos;, () => {
    render(<AICreate supabase={mockSupabase} />)
    
    const generateButton = screen.getByTestId(&apos;generate-btn&apos;)
    expect(generateButton).toBeDisabled()
  })
}) 