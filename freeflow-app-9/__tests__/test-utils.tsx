import React from 'react'
import { render as rtlRender } from '@testing-library/react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query"
import { ThemeProvider } from '@/components/theme-provider'

function renderWithProviders(ui: React.ReactElement, { ...options } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })'
'
  function Wrapper({ children }: { children: React.ReactNode }) {"
    return ('
      <QueryClientProvider client={queryClient}>"
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react

// Export the custom render method'
export { renderWithProviders } "