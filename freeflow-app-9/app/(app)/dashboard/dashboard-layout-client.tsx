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
import { AIPanels } from '@/components/dashboard/ai-panels'
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context'
import { AIPanelsProvider } from '@/lib/ai-panels-context'
import { Button } from '@/components/ui/button'
import { Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

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
  const { isCollapsed, isFullscreen, toggleFullscreen } = useSidebar()

  // Enable global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <OnboardingProvider>
      <EngagementProvider userId={user.id}>
        <AIPanelsProvider>
          <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
            {!isFullscreen && <MobileAdminNav />}

            {!isFullscreen && (
              <div className={cn(
                "hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-16" : "w-64"
              )}>
                <SidebarEnhanced />
              </div>
            )}

            <main role="main" className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* Mobile Header */}
              {!isFullscreen && (
                <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-black dark:text-white kazi-headline">KAZI</h1>
                    <OnlinePeopleToggle position="header" />
                  </div>
                </div>
              )}

              {/* Desktop Header - Full Dashboard Header */}
              {!isFullscreen && (
                <div className="hidden lg:block">
                  <DashboardHeader user={user} />
                </div>
              )}

              <div className={cn(
                "container mx-auto",
                isFullscreen ? "max-w-full p-0" : "max-w-[1400px] p-4 lg:p-6"
              )}>
                {!isFullscreen && <AnnouncementsBanner />}
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>

            {/* Fullscreen Exit Button - Floating */}
            {isFullscreen && (
              <Button
                variant="default"
                size="sm"
                onClick={toggleFullscreen}
                className="fixed top-4 right-4 z-50 shadow-lg gap-2"
                title="Exit fullscreen"
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </Button>
            )}

            {/* AI Panels - Global sidebars */}
            <AIPanels userId={user.id} />
          </div>
        </AIPanelsProvider>
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
