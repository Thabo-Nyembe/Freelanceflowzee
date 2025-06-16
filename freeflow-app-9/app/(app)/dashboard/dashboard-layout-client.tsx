'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardBreadcrumbs } from '@/components/dashboard-breadcrumbs'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    role?: string
  }
}

interface DashboardContextType {
  user: User
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayoutClient')
  }
  return context
}

interface DashboardLayoutClientProps {
  user: User
  children: ReactNode
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not available')
        return
      }
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <DashboardContext.Provider value={{ user }}>
      <div className="min-h-screen bg-background">
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="skip-to-content"
          tabIndex={0}
        >
          Skip to main content
        </a>
        
        <DashboardNav onLogout={handleLogout} user={user} />
        
        <main 
          id="main-content"
          className="dashboard-main"
          tabIndex={-1}
        >
          <div className="dashboard-content">
            <DashboardBreadcrumbs />
            {children}
          </div>
        </main>
        
        {/* Logout functionality available globally */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </DashboardContext.Provider>
  )
} 