import React, { createContext, useContext } from 'react'

const SupabaseContext = createContext<any>(null)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const mockSupabase = {
    from: (table: string) => ({
      insert: (data) => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { id: 'mock-id', content: data[0].content },
            error: null
          })
        })
      }),
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'mock-id', content: 'Mocked content' },
          error: null
        })
      })
    }),
    auth: {
      getSession: () => Promise.resolve(null),
      getUser: () => Promise.resolve(null),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }

  const value = {
    supabase: mockSupabase,
    session: null,
    user: null
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
} 