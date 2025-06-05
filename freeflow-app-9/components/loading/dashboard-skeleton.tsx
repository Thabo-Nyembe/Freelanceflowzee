import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Metrics Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions Skeleton */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 