'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

/**
 * Session Provider Wrapper
 *
 * Wraps the application with NextAuth SessionProvider to enable
 * client-side session access via useSession() hook
 *
 * Must be used in Client Components only
 */

interface SessionProviderProps {
  children: ReactNode
  session?: any
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </NextAuthSessionProvider>
  )
}
