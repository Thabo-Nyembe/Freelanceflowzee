'use client'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Code, Activity } from 'lucide-react'

export default function ReactQueryDevtoolsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">React Query Devtools</h1>
          <p className="text-sm text-muted-foreground">
            Debug and inspect your React Query cache, queries, and mutations
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-full relative">
          {/* Embedded devtools - always open on this page */}
          <ReactQueryDevtools initialIsOpen={true} position="bottom-left" />

          <div className="p-8 text-center text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              The React Query Devtools panel will appear at the bottom-left of this page.
            </p>
            <p className="text-xs mt-2">
              You can explore queries, mutations, and cache data for debugging.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
