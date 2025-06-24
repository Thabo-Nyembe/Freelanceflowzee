import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AIAssistantPage from '@/app/(app)/dashboard/ai-assistant/page'
import AICreatePage from '@/app/(app)/dashboard/ai-create/page'
import { AIAssistant } from '@/components/ai/ai-assistant'
import { AICreate } from '@/components/ai/ai-create'

// Create a new QueryClient instance for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

// Wrapper component with QueryClientProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('AI Components Integration', () => {
  beforeEach(() => {
    // Reset QueryClient cache before each test
    queryClient.clear()
  })

  describe('AI Assistant Page', () => {
    it('should display analyze form', () => {
      render(<AIAssistant />)
      
      expect(screen.getByTestId('analyze-tab')).toBeInTheDocument()
      expect(screen.getByTestId('analyze-input')).toBeInTheDocument()
      expect(screen.getByTestId('analyze-button')).toBeInTheDocument()
    })

    it('should handle content analysis', async () => {
      render(<AIAssistant />)

      // Fill in analysis form
      fireEvent.change(screen.getByTestId('analyze-input'), {
        target: { value: 'Test content' }
      })

      // Click analyze button
      fireEvent.click(screen.getByTestId('analyze-button'))

      // Wait for analysis results
      await waitFor(() => {
        expect(screen.getByTestId('analysis-results')).toBeInTheDocument()
      })
    })

    it('should display history', async () => {
      render(<AIAssistant />)

      // Click history tab
      fireEvent.click(screen.getByTestId('history-tab'))

      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByTestId('history-list')).toBeInTheDocument()
      })
    })
  })

  describe('AI Create Page', () => {
    it('should handle asset generation', async () => {
      render(<AICreate />)

      // Fill in generation form
      fireEvent.change(screen.getByTestId('asset-prompt-input'), {
        target: { value: 'Test asset prompt' }
      })

      // Click generate button
      fireEvent.click(screen.getByTestId('generate-asset-btn'))

      // Wait for generation results
      await waitFor(() => {
        expect(screen.getByTestId('generation-results')).toBeInTheDocument()
      })
    })

    it('should handle file upload', async () => {
      render(<AICreate />)

      const file = new File(['test'], 'test.png', { type: 'image/png' })

      // Trigger file upload
      const input = screen.getByTestId('asset-upload-input')
      fireEvent.change(input, { target: { files: [file] } })

      // Wait for upload completion
      await waitFor(() => {
        expect(screen.getByTestId('upload-success')).toBeInTheDocument()
      })
    })

    it('should handle settings changes', async () => {
      render(<AICreate />)

      // Go to settings tab
      fireEvent.click(screen.getByTestId('settings-tab'))

      // Change settings
      fireEvent.click(screen.getByTestId('realtime-toggle'))
      fireEvent.click(screen.getByTestId('save-settings-btn'))

      // Wait for save confirmation
      await waitFor(() => {
        expect(screen.getByTestId('settings-saved')).toBeInTheDocument()
      })
    })
  })
}) 