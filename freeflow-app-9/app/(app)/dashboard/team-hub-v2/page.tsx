export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import TeamHubClient from './team-hub-client'

function TeamHubLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:bg-gray-900 p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  )
}

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  // Suspense boundary required for useSearchParams
  return (
    <Suspense fallback={<TeamHubLoading />}>
      <TeamHubClient initialMembers={[]} />
    </Suspense>
  )
}
