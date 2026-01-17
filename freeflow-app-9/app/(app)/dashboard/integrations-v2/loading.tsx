import { CardGridSkeleton, StatsCardsSkeleton } from '@/components/ui/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <StatsCardsSkeleton count={3} columns={3} />

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-80 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-8 rounded-md" />
        </div>
      </div>

      {/* Integrations Grid */}
      <CardGridSkeleton count={9} cardHeight="h-28" />
    </div>
  )
}
