import { Suspense } from 'react'
import { Metadata } from 'next'
import KaziAutomationsClient from './kazi-automations-client'

export const metadata: Metadata = {
  title: 'Kazi Automations | Business Rules & Triggers',
  description: 'Set up automated rules and triggers for your business processes'
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading Kazi Automations...</p>
      </div>
    </div>
  )
}

export default function KaziAutomationsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KaziAutomationsClient />
    </Suspense>
  )
}
