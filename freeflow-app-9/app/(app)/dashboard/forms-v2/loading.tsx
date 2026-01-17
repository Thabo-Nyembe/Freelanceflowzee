import { StatsCardsSkeleton, CardGridSkeleton, TableSkeleton } from '@/components/ui/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-28 bg-muted animate-pulse rounded" />
          <div className="h-4 w-52 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <StatsCardsSkeleton count={4} columns={4} />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Forms Grid */}
      <CardGridSkeleton count={6} cardHeight="h-36" />

      {/* Recent Submissions */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  )
}
