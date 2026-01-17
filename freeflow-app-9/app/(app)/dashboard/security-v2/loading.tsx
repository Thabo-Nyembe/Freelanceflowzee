import { StatsCardsSkeleton, ChartSkeleton, TableSkeleton, ListSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Security Score & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-28 bg-muted animate-pulse rounded" />
          <div className="h-32 w-32 mx-auto bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-24 mx-auto bg-muted animate-pulse rounded" />
        </div>
        <div className="lg:col-span-3">
          <StatsCardsSkeleton count={3} columns={3} />
        </div>
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-64" />
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-6 w-36 bg-muted animate-pulse rounded" />
          <ListSkeleton items={5} showAvatar={true} showAction={false} />
        </div>
      </div>

      {/* Security Events Table */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  )
}
