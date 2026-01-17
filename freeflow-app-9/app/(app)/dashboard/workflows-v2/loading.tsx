import { KanbanSkeleton, StatsCardsSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-36 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats */}
      <StatsCardsSkeleton count={4} columns={4} />

      {/* Filters/Views */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
          <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanSkeleton columns={4} cardsPerColumn={4} />
    </div>
  )
}
