import { Suspense } from 'react'
import { Metadata } from 'next'
import KaziWorkflowsClient from './kazi-workflows-client'

export const metadata: Metadata = {
  title: 'Kazi Workflows | Automate Your Business',
  description: 'Create and manage automated workflows for your business processes'
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Kazi Workflows...</p>
      </div>
    </div>
  )
}

export default function KaziWorkflowsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KaziWorkflowsClient />
    </Suspense>
  )
}
