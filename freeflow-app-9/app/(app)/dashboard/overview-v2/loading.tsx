import { DashboardSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <DashboardSkeleton
        showStats={true}
        showChart={true}
        showTable={true}
        showSidebar={true}
      />
    </div>
  )
}
