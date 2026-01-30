'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode, useEffect, useState, createContext, useContext } from 'react'

/**
 * Session Provider Wrapper
 *
 * Wraps the application with NextAuth SessionProvider to enable
 * client-side session access via useSession() hook
 *
 * In demo mode, completely bypasses NextAuth to prevent console errors
 *
 * Must be used in Client Components only
 */

interface SessionProviderProps {
  children: ReactNode
  session?: any
}

// Demo session for demo mode - prevents CLIENT_FETCH_ERROR
const DEMO_SESSION = {
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alex@freeflow.io',
    name: 'Alexandra Chen',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

// Demo context for bypassing NextAuth entirely
const DemoSessionContext = createContext<{
  data: typeof DEMO_SESSION | null
  status: 'authenticated' | 'loading' | 'unauthenticated'
}>({
  data: DEMO_SESSION,
  status: 'authenticated',
})

function checkIsDemo(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('demo') === 'true' || document.cookie.includes('demo_mode=true')
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  const [isDemo, setIsDemo] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Check for demo mode on client side
    setIsDemo(checkIsDemo())
    setIsHydrated(true)
  }, [])

  // Before hydration, render without provider to avoid mismatch
  if (!isHydrated) {
    return <>{children}</>
  }

  // Always use NextAuthSessionProvider to ensure useSession() works
  // In demo mode, pass the demo session; in normal mode, pass the real session
  const sessionToUse = isDemo ? DEMO_SESSION : session

  return (
    <DemoSessionContext.Provider value={{ data: isDemo ? DEMO_SESSION : null, status: isDemo ? 'authenticated' : 'loading' }}>
      <NextAuthSessionProvider
        session={sessionToUse}
        refetchInterval={isDemo ? 0 : 5 * 60}
        refetchOnWindowFocus={!isDemo}
      >
        {children}
      </NextAuthSessionProvider>
    </DemoSessionContext.Provider>
  )
}

// Export hook for demo mode compatibility
export function useDemoSession() {
  return useContext(DemoSessionContext)
}
