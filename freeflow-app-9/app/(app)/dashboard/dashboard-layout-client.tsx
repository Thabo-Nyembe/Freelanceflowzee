'use client'

import { User } from '@supabase/supabase-js'
import { SidebarEnhanced } from '@/components/navigation/sidebar-enhanced'
import { MobileAdminNav } from '@/components/admin/mobile-admin-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { MockDataProvider } from '@/lib/mock-data/provider'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: User
}

export default function DashboardLayoutClient({
  children, user: _user
}: DashboardLayoutClientProps) {
  return (
    <OnboardingProvider>
      <MockDataProvider>
        <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
          <MobileAdminNav />

          <div className="hidden lg:block w-64 flex-shrink-0">
            <SidebarEnhanced />
          </div>

          <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 pb-16 lg:pb-0 scroll-smooth">
            <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-black dark:text-white kazi-headline">KAZI</h1>
              </div>
            </div>

            <div className="container mx-auto p-4 lg:p-6 max-w-[1600px]">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </MockDataProvider>
    </OnboardingProvider>
  )
}

