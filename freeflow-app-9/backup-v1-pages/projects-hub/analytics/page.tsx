'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// PRODUCTION LOGGER
import { createSimpleLogger } from '@/lib/simple-logger'
const logger = createSimpleLogger('ProjectsHub:Analytics')

// A+++ Utilities
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { toast } from 'sonner'

// Shared utilities
import {
  Project
} from '@/lib/projects-hub-utils'

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // A+++ Accessibility
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  useEffect(() => {
    const loadProjects = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        logger.info('Loading projects analytics', { userId })

        // Dynamic import for code splitting
        const { getProjects } = await import('@/lib/projects-hub-queries')

        // Load all projects for analytics
        const { data, error: projectsError } = await getProjects(userId)

        if (projectsError) {
          throw new Error(projectsError.message || 'Failed to load projects')
        }

        setProjects(data || [])
        setLoading(false)
        announce('Analytics data loaded successfully', 'polite')
        toast.success(`${data?.length || 0} projects loaded for analytics`)
        logger.info('Projects analytics loaded', { count: data?.length || 0, userId })
      } catch (err) {
        logger.error('Failed to load projects analytics', { error: err, userId })
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
        setLoading(false)
        announce('Error loading analytics', 'assertive')
        toast.error('Failed to load analytics')
      }
    }

    loadProjects()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        action={{
          label: 'Retry',
          onClick: () => window.location.reload()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['active', 'completed', 'paused', 'draft', 'cancelled'].map(status => {
                const count = projects.filter(p => p.status === status).length
                const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full",
                        status === 'active' ? 'bg-green-500' :
                        status === 'completed' ? 'bg-blue-500' :
                        status === 'paused' ? 'bg-yellow-500' :
                        status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                      )}></div>
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="font-medium">${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Earned</span>
                <span className="font-medium">${projects.reduce((sum, p) => sum + p.spent, 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="font-medium">${(projects.reduce((sum, p) => sum + p.budget, 0) - projects.reduce((sum, p) => sum + p.spent, 0)).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Completion Rate</span>
                  <span className="font-bold text-lg">
                    {Math.round((projects.reduce((sum, p) => sum + p.spent, 0) / projects.reduce((sum, p) => sum + p.budget, 0)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['urgent', 'high', 'medium', 'low'].map(priority => {
                const count = projects.filter(p => p.priority === priority).length
                const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
                return (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full",
                        priority === 'urgent' ? 'bg-red-500' :
                        priority === 'high' ? 'bg-orange-500' :
                        priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      )}></div>
                      <span className="text-sm capitalize">{priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients by Revenue */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle>Top Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects
                .sort((a, b) => b.spent - a.spent)
                .slice(0, 5)
                .map(project => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{project.client_name}</p>
                      <p className="text-xs text-gray-500">{project.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${project.spent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{project.progress}% complete</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle>Projects by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(projects.map(p => p.category))).map(category => {
              const count = projects.filter(p => p.category === category).length
              const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
              return (
                <div key={category} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600">{category}</p>
                  <p className="text-xs text-gray-500">{percentage}%</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
