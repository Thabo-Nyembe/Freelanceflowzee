'use client'

import React, { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { createQueryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient with useState to ensure it's only created once per client
  // This prevents hydration mismatches and ensures proper caching behavior
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <OnboardingProvider>
            {children}
            <Toaster />
          </OnboardingProvider>
        </TooltipProvider>
      </ThemeProvider>
      {/* React Query Devtools now in sidebar Code Builders section */}
    </QueryClientProvider>
  )
} 