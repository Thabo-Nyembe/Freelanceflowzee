'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { DashboardBreadcrumbs } from '@/components/dashboard-breadcrumbs'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: any
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="skip-to-content"
        tabIndex={1}
      >
        Skip to main content
      </a>
      
      <DashboardNav />
      
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
    </div>
  )
} 