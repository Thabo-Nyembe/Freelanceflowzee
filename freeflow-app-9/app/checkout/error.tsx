'use client'

import { CheckoutError } from '@/components/route-error'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <CheckoutError error={error} reset={reset} />
}
