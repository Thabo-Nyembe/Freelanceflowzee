'use client'

import { V1DashboardError } from '@/components/route-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <V1DashboardError error={error} reset={reset} />
}
