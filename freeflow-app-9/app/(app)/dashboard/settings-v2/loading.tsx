import { FormSkeleton } from '@/components/ui/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-8">
        {/* Settings Sidebar */}
        <div className="w-64 shrink-0">
          <div className="space-y-6">
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg"
                >
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Page Header */}
          <div className="space-y-2 pb-6 border-b border-border">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-6">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="flex items-center gap-6">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-28 rounded-md" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <FormSkeleton fields={3} showButtons={false} />
            </div>

            {/* Notifications Section */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="h-6 w-36 bg-muted animate-pulse rounded" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
