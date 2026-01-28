import { StatsCardsSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <StatsCardsSkeleton count={4} columns={4} />

      {/* Table */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  )
}
