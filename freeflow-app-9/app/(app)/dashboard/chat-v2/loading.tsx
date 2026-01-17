import { ListSkeleton } from '@/components/ui/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex h-[calc(100vh-180px)] rounded-lg border border-border overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className="w-80 border-r border-border bg-card p-4 space-y-4">
          {/* Search */}
          <Skeleton className="h-10 w-full rounded-md" />

          {/* Filters */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>

          {/* Chat List */}
          <ListSkeleton items={10} showAvatar={true} showAction={false} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {Array.from({ length: 6 }).map((_, i) => {
              const isOwn = i % 2 === 1
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className={`space-y-1 ${isOwn ? 'items-end' : ''}`}>
                    <Skeleton
                      className={`h-16 rounded-2xl ${isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                      style={{ width: `${Math.random() * 120 + 120}px` }}
                    />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2 items-end">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
