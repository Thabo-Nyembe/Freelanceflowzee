'use client'

import React from 'react'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
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
    </QueryClientProvider>
  )
} 