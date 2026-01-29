'use client'

import { V2DashboardError } from '@/components/route-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <V2DashboardError error={error} reset={reset} />
}
