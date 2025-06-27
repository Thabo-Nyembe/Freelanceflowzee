import React from &apos;react&apos;
import { render, screen, fireEvent, waitFor } from &apos;@testing-library/react&apos;
import &apos;@testing-library/jest-dom&apos;
import { QueryClient, QueryClientProvider } from &apos;@tanstack/react-query&apos;
import AIAssistantPage from &apos;@/app/(app)/dashboard/ai-assistant/page&apos;
import AICreatePage from &apos;@/app/(app)/dashboard/ai-create/page&apos;
import { AIAssistant } from &apos;@/components/ai/ai-assistant&apos;
import { AICreate } from &apos;@/components/ai/ai-create&apos;

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

describe(&apos;AI Components Integration&apos;, () => {
  beforeEach(() => {
    // Reset QueryClient cache before each test
    queryClient.clear()
  })

  describe(&apos;AI Assistant Page&apos;, () => {
    it(&apos;should display analyze form&apos;, () => {
      render(<AIAssistant />)
      
      expect(screen.getByTestId(&apos;analyze-tab&apos;)).toBeInTheDocument()
      expect(screen.getByTestId(&apos;analyze-input&apos;)).toBeInTheDocument()
      expect(screen.getByTestId(&apos;analyze-button&apos;)).toBeInTheDocument()
    })

    it(&apos;should handle content analysis&apos;, async () => {
      render(<AIAssistant />)

      // Fill in analysis form
      fireEvent.change(screen.getByTestId(&apos;analyze-input&apos;), {
        target: { value: &apos;Test content&apos; }
      })

      // Click analyze button
      fireEvent.click(screen.getByTestId(&apos;analyze-button&apos;))

      // Wait for analysis results
      await waitFor(() => {
        expect(screen.getByTestId(&apos;analysis-results&apos;)).toBeInTheDocument()
      })
    })

    it(&apos;should display history&apos;, async () => {
      render(<AIAssistant />)

      // Click history tab
      fireEvent.click(screen.getByTestId(&apos;history-tab&apos;))

      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByTestId(&apos;history-list&apos;)).toBeInTheDocument()
      })
    })
  })

  describe(&apos;AI Create Page&apos;, () => {
    it(&apos;should handle asset generation&apos;, async () => {
      render(<AICreate />)

      // Fill in generation form
      fireEvent.change(screen.getByTestId(&apos;asset-prompt-input&apos;), {
        target: { value: &apos;Test asset prompt&apos; }
      })

      // Click generate button
      fireEvent.click(screen.getByTestId(&apos;generate-asset-btn&apos;))

      // Wait for generation results
      await waitFor(() => {
        expect(screen.getByTestId(&apos;generation-results&apos;)).toBeInTheDocument()
      })
    })

    it(&apos;should handle file upload&apos;, async () => {
      render(<AICreate />)

      const file = new File([&apos;test&apos;], &apos;test.png&apos;, { type: &apos;image/png&apos; })

      // Trigger file upload
      const input = screen.getByTestId(&apos;asset-upload-input&apos;)
      fireEvent.change(input, { target: { files: [file] } })

      // Wait for upload completion
      await waitFor(() => {
        expect(screen.getByTestId(&apos;upload-success&apos;)).toBeInTheDocument()
      })
    })

    it(&apos;should handle settings changes&apos;, async () => {
      render(<AICreate />)

      // Go to settings tab
      fireEvent.click(screen.getByTestId(&apos;settings-tab&apos;))

      // Change settings
      fireEvent.click(screen.getByTestId(&apos;realtime-toggle&apos;))
      fireEvent.click(screen.getByTestId(&apos;save-settings-btn&apos;))

      // Wait for save confirmation
      await waitFor(() => {
        expect(screen.getByTestId(&apos;settings-saved&apos;)).toBeInTheDocument()
      })
    })
  })
}) 