'use client'

import { User } from '@supabase/supabase-js'
import { Sidebar } from '@/components/navigation/sidebar'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: User
}

export default function DashboardLayoutClient({
  children,
  user
}: DashboardLayoutClientProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

