'use client'

import { Suspense } from 'react'
import AgentDashboard from '@/components/admin/agent-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Loading component
function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function AgentsPage() {
  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agent Management</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and control automated agents that keep KAZI platform optimized and secure
        </p>
      </div>

      <Suspense fallback={<DashboardLoading />}>
        <AgentDashboard />
      </Suspense>
    </div>
  )
}