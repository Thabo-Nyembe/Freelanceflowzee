import { Suspense } from 'react'
import PaymentClient from './payment-client'

// Ensure this page is dynamically rendered
export const dynamic = 'force-dynamic'

// Fallback component for Suspense boundary
function PaymentFallback() {
  return (
    <div className="container mx-auto p-6 max-w-md" data-testid="payment-container">
      <div className="border rounded-lg shadow-sm bg-white">
        <div className="p-6 pb-0">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <PaymentClient />
    </Suspense>
  )
}
