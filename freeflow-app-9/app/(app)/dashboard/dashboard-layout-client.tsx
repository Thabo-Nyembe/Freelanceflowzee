'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardBreadcrumbs } from '@/components/dashboard-breadcrumbs'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, X } from 'lucide-react'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <DashboardContext.Provider value={{ user }}>
      <div className="dashboard-layout">
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="skip-to-content"
          tabIndex={0}
        >
          Skip to main content
        </a>
        
        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-gray-900 ml-3">
              FreeflowZee
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 hidden sm:block">
              {user.user_metadata?.full_name || user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="dashboard-nav-mobile-overlay active"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
        
        {/* Dashboard Navigation Sidebar */}
        <div className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <DashboardNav 
            onLogout={handleLogout} 
            user={user}
            setOpen={setIsMobileMenuOpen}
          />
        </div>
        
        {/* Main Dashboard Content */}
        <main 
          id="main-content"
          className="dashboard-main"
          tabIndex={-1}
        >
          {/* Dashboard Header/Breadcrumbs */}
          <div className="dashboard-header">
            <DashboardBreadcrumbs />
          </div>
          
          {/* Scrollable Content Area */}
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  )
} 