'use client'

export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import ProjectsHubClient from './projects-hub-client'

function ProjectsHubLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  )
}

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  // Suspense boundary required for useSearchParams
  return (
    <Suspense fallback={<ProjectsHubLoading />}>
      <ProjectsHubClient initialData={[]} />
    </Suspense>
  )
}
