import { StatsCardsSkeleton, TableSkeleton, TimelineSkeleton, ChartSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-36 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <StatsCardsSkeleton count={4} columns={4} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deployments Table */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
          <TableSkeleton rows={6} cols={5} />
        </div>

        {/* Activity Timeline */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <TimelineSkeleton items={5} />
        </div>
      </div>

      {/* Performance Chart */}
      <ChartSkeleton height="h-56" />
    </div>
  )
}
