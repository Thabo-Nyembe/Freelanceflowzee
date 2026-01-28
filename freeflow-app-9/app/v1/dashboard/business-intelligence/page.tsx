import { Suspense } from 'react'
import { BusinessIntelligenceClient } from './business-intelligence-client'

export const metadata = {
  title: 'Business Intelligence | FreeFlow',
  description: 'Comprehensive business analytics to maximize your freelance, agency, or enterprise performance'
}

export default function BusinessIntelligencePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <BusinessIntelligenceClient />
    </Suspense>
  )
}
