/**
 * BEFORE MIGRATION: Projects Page with manual fetch() calls
 *
 * Problems with this approach:
 * - 150+ lines of boilerplate code
 * - Manual state management (isLoading, error, projects)
 * - Manual error handling with try/catch everywhere
 * - Manual refetching after mutations
 * - No caching - data lost on navigation
 * - No optimistic updates
 * - No background refetching
 * - No request deduplication
 */

'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: string
  progress: number
  budget: number
  due_date: string
}

export default function ProjectsPageBefore() {
  // Manual state management - 4 separate states!
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Manual data fetching with useEffect
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setProjects(data.projects || [])
      } else {
        throw new Error(data.error || 'Failed to load projects')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load projects'
      setError(errorMessage)
      toast.error('Failed to load projects', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Manual create mutation with fetch()
  const handleCreateProject = async (projectData: Partial<Project>) => {
    if (!projectData.name?.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          status: 'planning',
          budget: projectData.budget || 0,
          priority: 'medium',
          visibility: 'private'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create project')
      }

      const data = await response.json()

      // Manually refetch ALL data (inefficient!)
      await fetchProjects()

      toast.success(`Project "${projectData.name}" created successfully`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  // Manual update mutation
  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      // Manually refetch ALL data again!
      await fetchProjects()

      toast.success('Project updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update project')
    }
  }

  // Manual delete mutation
  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      // Manually refetch ALL data yet again!
      await fetchProjects()

      toast.success('Project deleted successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project')
    }
  }

  // Manual loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Loading projects...</p>
      </div>
    )
  }

  // Manual error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={fetchProjects} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  // Manual empty state
  if (projects.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No projects found</p>
        <Button onClick={() => handleCreateProject({ name: 'New Project' })} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Create First Project
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button
          onClick={() => handleCreateProject({ name: 'New Project' })}
          disabled={isCreating}
        >
          {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Card key={project.id} className="p-6">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateProject(project.id, { status: 'active' })}
              >
                Update
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteProject(project.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/**
 * PROBLEMS WITH THIS CODE:
 *
 * 1. **Too much boilerplate** (150+ lines for basic CRUD)
 * 2. **No caching** - data lost when navigating away
 * 3. **No optimistic updates** - UI waits for server
 * 4. **Inefficient refetching** - refetches ALL data after every mutation
 * 5. **Manual error handling** - try/catch everywhere
 * 6. **Manual loading states** - separate state for each operation
 * 7. **No background refetching** - stale data
 * 8. **No request deduplication** - duplicate API calls
 * 9. **Poor DX** - repetitive code, hard to maintain
 * 10. **No TypeScript safety** - any type responses
 */
