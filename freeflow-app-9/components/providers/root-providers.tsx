'use client'

import React from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export function RootProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState<any>(() => new QueryClient())
  const [_supabaseClient] = useState<any>(() => {
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
        storageKey="kazi-ui-theme"
        enableSystem
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
} 