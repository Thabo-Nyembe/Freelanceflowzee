'use client'

import React, { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { createQueryClient } from '@/lib/query-client'

export function RootProviders({ children }: { children: React.ReactNode }) {
  // Create QueryClient with optimized caching configuration
  const [queryClient] = useState(() => createQueryClient())

  const [_supabaseClient] = useState(() => {
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
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  )
} 