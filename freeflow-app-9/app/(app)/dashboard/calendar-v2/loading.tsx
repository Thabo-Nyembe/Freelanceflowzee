import { CalendarSkeleton, ListSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
      </div>

      {/* Calendar with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CalendarSkeleton />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <ListSkeleton items={4} showAvatar={false} showAction={false} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="h-5 w-28 bg-muted animate-pulse rounded" />
            <ListSkeleton items={3} showAvatar={true} showAction={false} />
          </div>
        </div>
      </div>
    </div>
  )
}
