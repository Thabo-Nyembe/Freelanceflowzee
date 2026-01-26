/**
 * React hooks for Projects API
 *
 * Uses TanStack Query for caching, loading states, and error handling
 * Replaces useEffect + setTimeout patterns
 *
 * Caching Strategy:
 * - Projects list: 5 min staleTime (user data)
 * - Single project: 5 min staleTime (user data)
 * - Project stats: 2 min staleTime (analytics)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { projectsClient, type CreateProjectData, type UpdateProjectData, type ProjectFilters } from './projects-client'
import { toast } from 'sonner'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, invalidationPatterns } from '@/lib/query-client'

/**
 * Get all projects with pagination and filters
 */
export function useProjects(
  page: number = 1,
  pageSize: number = 10,
  filters?: ProjectFilters,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['projects', page, pageSize, filters],
    queryFn: async () => {
      const response = await projectsClient.getProjects(page, pageSize, filters)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch projects')
      }

      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Get single project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await projectsClient.getProject(id)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch project')
      }

      return response.data
    },
    enabled: !!id,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions
  })
}

/**
 * Create new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await projectsClient.createProject(data)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create project')
      }

      return response.data
    },
    onSuccess: (project) => {
      // Use centralized invalidation pattern
      invalidationPatterns.projects(queryClient)

      // Optimistically update cache
      queryClient.setQueryData(['project', project.id], project)

      toast.success('Project created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: UpdateProjectData }) => {
      const response = await projectsClient.updateProject(id, updates)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update project')
      }

      return response.data
    },
    onSuccess: (project) => {
      // Use centralized invalidation pattern
      invalidationPatterns.projects(queryClient)
      queryClient.setQueryData(['project', project.id], project)

      toast.success('Project updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await projectsClient.deleteProject(id)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete project')
      }

      return id
    },
    onSuccess: (deletedId) => {
      // Use centralized invalidation pattern
      invalidationPatterns.projects(queryClient)
      // Remove the specific project from cache
      queryClient.removeQueries({ queryKey: ['project', deletedId] })
      toast.success('Project deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get project statistics
 */
export function useProjectStats() {
  return useQuery({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const response = await projectsClient.getProjectStats()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch project stats')
      }

      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 60000 // Refetch every minute
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function ProjectsList() {
 *   const { data, isLoading, error } = useProjects(1, 10, { status: ['active'] })
 *   const createProject = useCreateProject()
 *   const updateProject = useUpdateProject()
 *   const deleteProject = useDeleteProject()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {data.data.map(project => (
 *         <ProjectCard
 *           key={project.id}
 *           project={project}
 *           onUpdate={(updates) => updateProject.mutate({ id: project.id, updates })}
 *           onDelete={() => deleteProject.mutate(project.id)}
 *         />
 *       ))}
 *
 *       <Button onClick={() => createProject.mutate({ title: 'New Project' })}>
 *         Create Project
 *       </Button>
 *     </div>
 *   )
 * }
 * ```
 */
