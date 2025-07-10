'use client'

import React, { createContext, useContext, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '../theme-provider'
import { Toaster } from '../ui/toaster'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const SupabaseContext = createContext<SupabaseClient<Database> | null>(null)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState<any>(() => new QueryClient())
  const [supabase] = useState<any>(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables are not set, using fallback')
      return null
    }

    try {
      return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    } catch (error) {
      console.warn('Failed to create Supabase client:', error)
      return null
    }
  })

  return (
    <SupabaseContext.Provider value={supabase}>
      <QueryClientProvider client={queryClient}>
        <NextThemeProvider attribute= "class" defaultTheme= "system" enableSystem>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </NextThemeProvider>
      </QueryClientProvider>
    </SupabaseContext.Provider>
  )
} 