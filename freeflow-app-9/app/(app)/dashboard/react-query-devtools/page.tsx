'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { Code, Activity, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamically import ReactQueryDevtools to prevent blocking page load
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => ({ default: mod.ReactQueryDevtools })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-muted-foreground">Loading devtools...</span>
      </div>
    )
  }
)

export default function ReactQueryDevtoolsPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">React Query Devtools</h1>
          <p className="text-sm text-muted-foreground">
            Debug and inspect your React Query cache, queries, and mutations
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant={isOpen ? 'default' : 'outline'}
        >
          {isOpen ? 'Hide' : 'Show'} Devtools
        </Button>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-full relative">
          {isOpen && (
            <Suspense fallback={
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            }>
              <ReactQueryDevtools initialIsOpen={true} position="bottom-right" />
            </Suspense>
          )}

          <div className="p-8 text-center text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {!isOpen ? (
              <>
                <p className="text-sm mb-4">
                  Click the "Show Devtools" button above to open the React Query Devtools panel.
                </p>
                <p className="text-xs">
                  You can explore queries, mutations, and cache data for debugging.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm mb-4">
                  The React Query Devtools panel is now open at the bottom-right of this page.
                </p>
                <p className="text-xs">
                  Explore queries, mutations, and cache data. Click "Hide Devtools" to close.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
