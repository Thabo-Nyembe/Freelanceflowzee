import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface HubSkeletonProps {
  title: string
}

export function HubSkeleton({ title }: HubSkeletonProps) {
  return (
    <Card className="w-full animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 