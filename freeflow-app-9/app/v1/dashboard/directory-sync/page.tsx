'use client'

import { Suspense } from 'react'
import DirectorySyncClient from './directory-sync-client'

export default function DirectorySyncPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <DirectorySyncClient />
    </Suspense>
  )
}
