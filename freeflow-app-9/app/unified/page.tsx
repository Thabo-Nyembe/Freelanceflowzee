"use client"

import { useState, Suspense } from "react"
import { UnifiedSidebar } from "@/components/unified-sidebar"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { MyDayToday } from "@/components/my-day-today"
import { ProjectsHub } from "@/components/hubs/projects-hub"
import { TeamHub } from "@/components/hubs/team-hub"
import { FinancialHub } from "@/components/hubs/financial-hub"
import { UniversalFeedbackHub } from "@/components/hubs/universal-feedback-hub"
import { FilesHub } from "@/components/hubs/files-hub"
import { CommunityHub } from "@/components/hubs/community-hub"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Profile } from "@/components/profile"
import { Notifications } from "@/components/notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Wifi, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for components that need it
const mockProjects = [
  {
    id: "proj-1",
    title: "E-commerce Website Redesign",
    description: "Complete redesign of the company's e-commerce platform",
    status: "in-progress",
    progress: 65,
    client: "TechCorp Inc.",
    budget: 25000,
    deadline: "2024-03-15",
    team: ["john-doe", "jane-smith", "bob-wilson"],
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-15T14:30:00Z"
  },
  {
    id: "proj-2", 
    title: "Mobile App Development",
    description: "Cross-platform mobile application for task management",
    status: "planning",
    progress: 20,
    client: "StartupXYZ",
    budget: 45000,
    deadline: "2024-04-30",
    team: ["john-doe", "alice-cooper"],
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2024-02-14T16:45:00Z"
  }
]

const mockUserId = "user-123"

// Loading component
function LoadingComponent() {
  return (
    <Card className="w-full h-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Error boundary component
function ErrorBoundary({ children, error }: { children: React.ReactNode, error?: Error }) {
  if (error) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Something went wrong loading this component. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  return <>{children}</>
}

export default function UnifiedFreeFlowApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isOnline, setIsOnline] = useState(true)

  // Component renderer with error handling and loading states
  const renderActiveComponent = () => {
    const componentProps = {
      projects: mockProjects,
      userId: mockUserId,
    }

    try {
      switch (activeTab) {
        case "dashboard":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <DashboardOverview />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "my-day":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <MyDayToday />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "projects":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <ProjectsHub {...componentProps} />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "team":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <TeamHub {...componentProps} />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "financial":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <FinancialHub {...componentProps} />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "feedback":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <UniversalFeedbackHub {...componentProps} />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "files":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <FilesHub {...componentProps} />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "community":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <CommunityHub {...componentProps} />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "analytics":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <AnalyticsDashboard />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "profile":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <Profile />
              </ErrorBoundary>
            </Suspense>
          )
        
        case "notifications":
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <Notifications />
              </ErrorBoundary>
            </Suspense>
          )
        
        default:
          return (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary>
                <DashboardOverview />
              </ErrorBoundary>
            </Suspense>
          )
      }
    } catch (error) {
      console.error('Error rendering component:', error)
      return <ErrorBoundary error={error as Error} children={null} />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <UnifiedSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Status Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-slate-500">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              FreeFlow Unified v2.0 - All components integrated
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="w-full h-full">
            {renderActiveComponent()}
          </div>
        </div>
      </main>
    </div>
  )
} 