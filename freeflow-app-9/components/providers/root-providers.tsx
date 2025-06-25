'use client'

import React from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export function RootProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [supabaseClient] = useState(() => {
    if (typeof window !== 'undefined') {
      return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return null
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        storageKey="freeflowzee-ui-theme"
        defaultSystemTheme="light"
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
} 