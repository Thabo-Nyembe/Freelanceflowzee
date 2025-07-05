import { Skeleton } from "@/components/ui/skeleton"

export function VideoPageSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Skeleton for ShareHeader */}
      <div className="flex w-full items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Skeleton for Video Player */}
      <Skeleton className="w-full aspect-video" />

      {/* Skeleton for Metadata and Comments */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
} 