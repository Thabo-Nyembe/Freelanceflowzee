import { DetailPageSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <DetailPageSkeleton showBreadcrumb={true} showTabs={true} />
    </div>
  )
}
