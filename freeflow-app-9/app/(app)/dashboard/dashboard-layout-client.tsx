'use client'

import React from 'react'
import { SidebarEnhanced } from '@/components/navigation/sidebar-enhanced'
import { MobileAdminNav } from '@/components/admin/mobile-admin-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { EngagementProvider } from '@/components/engagement/engagement-provider'
import { AnnouncementsBanner } from '@/components/dashboard/announcements-banner'
import { OnlinePeopleToggle } from '@/components/realtime/online-people-toggle'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context'
import { cn } from '@/lib/utils'

interface UserData {
  id: string
  email: string
  user_metadata: { name: string }
}

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: UserData
}

function DashboardLayoutInner({
  children, user
}: DashboardLayoutClientProps) {
  const { isCollapsed } = useSidebar()

  return (
    <OnboardingProvider>
      <EngagementProvider userId={user.id}>
        <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
          <MobileAdminNav />

          <div className={cn(
            "hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-16" : "w-64"
          )}>
            <SidebarEnhanced />
          </div>

          <main role="main" className="flex-1 overflow-y-auto">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-black dark:text-white kazi-headline">KAZI</h1>
                <OnlinePeopleToggle position="header" />
              </div>
            </div>

            {/* Desktop Header - Full Dashboard Header */}
            <div className="hidden lg:block">
              <DashboardHeader user={user} />
            </div>

            <div className="p-4 lg:p-6 container mx-auto max-w-[1600px]">
              <AnnouncementsBanner />
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </EngagementProvider>
    </OnboardingProvider>
  )
}

export default function DashboardLayoutClient(props: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner {...props} />
    </SidebarProvider>
  )
}
