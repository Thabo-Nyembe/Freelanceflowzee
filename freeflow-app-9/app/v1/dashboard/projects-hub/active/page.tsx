// MIGRATED: Batch #29 - Verified clean, no mock data present, using database hooks
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Clock } from 'lucide-react'

// PRODUCTION LOGGER
import { createSimpleLogger } from '@/lib/simple-logger'
const logger = createSimpleLogger('ProjectsHub:Active')

// A+++ Utilities
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Shared utilities
import {
  Project,
  formatDate
} from '@/lib/projects-hub-utils'

export default function ActiveProjectsPage() {
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
        logger.info('Loading active projects', { userId })
        setLoading(true)
        setError(null)

        // Dynamic import for code splitting
        const { getProjects } = await import('@/lib/projects-hub-queries')

        // Load active projects from database
        const result = await getProjects(userId, { status: 'active' })

        if (result.error) {
          throw new Error(result.error.message || 'Failed to load projects')
        }

        const activeProjects = result.data || []

        logger.info('Active projects loaded', { count: activeProjects.length, userId })
        setProjects(activeProjects)
        setLoading(false)
        announce(`${activeProjects.length} active projects loaded successfully`, 'polite')
      } catch (err) {
        logger.error('Failed to load active projects', { error: err, userId })
        setError(err instanceof Error ? err.message : 'Failed to load active projects')
        setLoading(false)
        announce('Error loading active projects', 'assertive')
      }
    }

    loadProjects()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <ListSkeleton items={4} />
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

  if (projects.length === 0) {
    return (
      <NoDataEmptyState
        entityName="active projects"
        description="You don't have any active projects at the moment. Create a new project to get started."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {projects.map(project => (
          <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Client:</span>
                      <span className="text-sm font-medium">{project.client_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Budget:</span>
                      <span className="text-sm font-medium">${project.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Spent:</span>
                      <span className="text-sm font-medium">${project.spent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Remaining:</span>
                      <span className="text-sm font-medium text-green-600">
                        ${(project.budget - project.spent).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{project.team_members.length} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Due {formatDate(project.end_date)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Update Progress
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
