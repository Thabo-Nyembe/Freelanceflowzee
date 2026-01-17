/**
 * Team React Hooks (TanStack Query)
 *
 * Production-ready hooks for team member management, roles, and permissions
 * Uses TanStack Query for caching, loading states, and error handling
 *
 * Caching Strategy:
 * - Team members list: 5 min staleTime (user data)
 * - Single team member: 5 min staleTime (user data)
 * - Team stats: 2 min staleTime (analytics)
 * - Invitations: 1 min staleTime (frequently changing)
 * - Departments: Infinity staleTime (static data)
 *
 * Features:
 * - Full CRUD for team members
 * - Optimistic updates for better UX
 * - Role and permission management
 * - Team invitations
 * - Performance tracking
 * - Real-time updates support
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  teamClient,
  TeamMember,
  TeamInvitation,
  TeamDepartment,
  CreateTeamMemberData,
  UpdateTeamMemberData,
  CreateInvitationData,
  TeamFilters,
  TeamStats,
  TeamRole,
  TeamPermission
} from './team-client'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, staticQueryOptions } from '@/lib/query-client'

// ============================================================================
// Query Keys
// ============================================================================

export const teamQueryKeys = {
  all: ['team'] as const,
  members: () => [...teamQueryKeys.all, 'members'] as const,
  membersList: (page: number, pageSize: number, filters?: TeamFilters) =>
    [...teamQueryKeys.members(), page, pageSize, filters] as const,
  member: (id: string) => [...teamQueryKeys.members(), id] as const,
  invitations: () => [...teamQueryKeys.all, 'invitations'] as const,
  invitationsList: (status?: string[]) => [...teamQueryKeys.invitations(), status] as const,
  departments: () => [...teamQueryKeys.all, 'departments'] as const,
  stats: () => [...teamQueryKeys.all, 'stats'] as const,
}

// ============================================================================
// Team Members Hooks
// ============================================================================

/**
 * Get all team members with pagination and filters
 */
export function useTeamMembers(
  page: number = 1,
  pageSize: number = 20,
  filters?: TeamFilters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: teamQueryKeys.membersList(page, pageSize, filters),
    queryFn: async () => {
      const response = await teamClient.getTeamMembers(page, pageSize, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch team members')
      }
      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Get team members with infinite scrolling
 */
export function useInfiniteTeamMembers(
  pageSize: number = 20,
  filters?: TeamFilters
) {
  return useInfiniteQuery({
    queryKey: [...teamQueryKeys.members(), 'infinite', pageSize, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await teamClient.getTeamMembers(pageParam, pageSize, filters)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch team members')
      }
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
    staleTime: STALE_TIMES.USER_DATA,
  })
}

/**
 * Get single team member by ID
 */
export function useTeamMember(
  id: string,
  options?: Omit<UseQueryOptions<TeamMember>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: teamQueryKeys.member(id),
    queryFn: async () => {
      const response = await teamClient.getTeamMember(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch team member')
      }
      return response.data
    },
    enabled: !!id,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Create a new team member
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberData: CreateTeamMemberData) => {
      const response = await teamClient.createTeamMember(memberData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create team member')
      }
      return response.data
    },
    onSuccess: (member) => {
      // Invalidate team members list
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      // Add to cache
      queryClient.setQueryData(teamQueryKeys.member(member.id), member)

      toast.success(`${member.name} added to the team`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update an existing team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTeamMemberData }) => {
      const response = await teamClient.updateTeamMember(id, updates)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update team member')
      }
      return response.data
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: teamQueryKeys.member(id) })

      const previousMember = queryClient.getQueryData<TeamMember>(teamQueryKeys.member(id))

      queryClient.setQueryData(teamQueryKeys.member(id), (old: TeamMember | undefined) => {
        if (!old) return old
        return { ...old, ...updates, updated_at: new Date().toISOString() }
      })

      return { previousMember }
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousMember) {
        queryClient.setQueryData(teamQueryKeys.member(id), context.previousMember)
      }
      toast.error(error.message)
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })
      queryClient.setQueryData(teamQueryKeys.member(member.id), member)

      toast.success('Team member updated')
    }
  })
}

/**
 * Delete a team member
 */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await teamClient.deleteTeamMember(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete team member')
      }
      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })
      queryClient.removeQueries({ queryKey: teamQueryKeys.member(id) })

      toast.success('Team member removed')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update team member status
 */
export function useUpdateTeamMemberStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TeamMember['status'] }) => {
      const response = await teamClient.updateStatus(id, status)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update status')
      }
      return response.data
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: teamQueryKeys.member(id) })

      const previousMember = queryClient.getQueryData<TeamMember>(teamQueryKeys.member(id))

      queryClient.setQueryData(teamQueryKeys.member(id), (old: TeamMember | undefined) => {
        if (!old) return old
        return { ...old, status, updated_at: new Date().toISOString() }
      })

      return { previousMember }
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(teamQueryKeys.member(id), context.previousMember)
      }
      toast.error(error.message)
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      const statusMessages = {
        active: 'Team member activated',
        inactive: 'Team member deactivated',
        pending: 'Team member set to pending',
        on_leave: 'Team member marked as on leave',
        suspended: 'Team member suspended'
      }

      toast.success(statusMessages[member.status] || 'Status updated')
    }
  })
}

/**
 * Update team member role
 */
export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      role,
      permissions
    }: {
      id: string
      role: TeamRole
      permissions?: TeamPermission[]
    }) => {
      const response = await teamClient.updateRole(id, role, permissions)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update role')
      }
      return response.data
    },
    onMutate: async ({ id, role }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: teamQueryKeys.member(id) })

      const previousMember = queryClient.getQueryData<TeamMember>(teamQueryKeys.member(id))

      queryClient.setQueryData(teamQueryKeys.member(id), (old: TeamMember | undefined) => {
        if (!old) return old
        return { ...old, role, updated_at: new Date().toISOString() }
      })

      return { previousMember }
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(teamQueryKeys.member(id), context.previousMember)
      }
      toast.error(error.message)
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      toast.success(`Role updated to ${member.role}`)
    }
  })
}

/**
 * Update team member performance score
 */
export function useUpdatePerformance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, score }: { id: string; score: number }) => {
      const response = await teamClient.updatePerformance(id, score)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update performance')
      }
      return response.data
    },
    onMutate: async ({ id, score }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: teamQueryKeys.member(id) })

      const previousMember = queryClient.getQueryData<TeamMember>(teamQueryKeys.member(id))

      queryClient.setQueryData(teamQueryKeys.member(id), (old: TeamMember | undefined) => {
        if (!old) return old
        return {
          ...old,
          performance_score: Math.min(100, Math.max(0, score)),
          updated_at: new Date().toISOString()
        }
      })

      return { previousMember }
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(teamQueryKeys.member(id), context.previousMember)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      toast.success('Performance score updated')
    }
  })
}

/**
 * Toggle lead status
 */
export function useToggleTeamLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await teamClient.toggleLead(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to toggle lead status')
      }
      return response.data
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: teamQueryKeys.member(id) })

      const previousMember = queryClient.getQueryData<TeamMember>(teamQueryKeys.member(id))

      queryClient.setQueryData(teamQueryKeys.member(id), (old: TeamMember | undefined) => {
        if (!old) return old
        return { ...old, is_lead: !old.is_lead, updated_at: new Date().toISOString() }
      })

      return { previousMember }
    },
    onError: (error: Error, id, context) => {
      if (context?.previousMember) {
        queryClient.setQueryData(teamQueryKeys.member(id), context.previousMember)
      }
      toast.error(error.message)
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      toast.success(member.is_lead ? 'Promoted to team lead' : 'Removed from team lead')
    }
  })
}

// ============================================================================
// Invitations Hooks
// ============================================================================

/**
 * Get team invitations
 */
export function useTeamInvitations(
  status?: ('pending' | 'accepted' | 'declined' | 'expired')[],
  options?: Omit<UseQueryOptions<TeamInvitation[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: teamQueryKeys.invitationsList(status),
    queryFn: async () => {
      const response = await teamClient.getInvitations(status)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch invitations')
      }
      return response.data
    },
    staleTime: STALE_TIMES.SEMI_FRESH,
    ...options
  })
}

/**
 * Send team invitation
 */
export function useSendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationData: CreateInvitationData) => {
      const response = await teamClient.sendInvitation(invitationData)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to send invitation')
      }
      return response.data
    },
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      toast.success(`Invitation sent to ${invitation.email}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Cancel team invitation
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await teamClient.cancelInvitation(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel invitation')
      }
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      toast.success('Invitation cancelled')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Resend team invitation
 */
export function useResendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await teamClient.resendInvitation(id)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to resend invitation')
      }
      return response.data
    },
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations() })

      toast.success(`Invitation resent to ${invitation.email}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// ============================================================================
// Departments Hooks
// ============================================================================

/**
 * Get all departments
 */
export function useTeamDepartments(
  options?: Omit<UseQueryOptions<TeamDepartment[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: teamQueryKeys.departments(),
    queryFn: async () => {
      const response = await teamClient.getDepartments()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch departments')
      }
      return response.data
    },
    staleTime: STALE_TIMES.STATIC,
    ...staticQueryOptions,
    ...options
  })
}

// ============================================================================
// Stats Hooks
// ============================================================================

/**
 * Get team statistics
 */
export function useTeamStats(
  options?: Omit<UseQueryOptions<TeamStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: teamQueryKeys.stats(),
    queryFn: async () => {
      const response = await teamClient.getTeamStats()
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch team stats')
      }
      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 60000, // Refetch every minute
    ...options
  })
}

// ============================================================================
// Bulk Operations Hooks
// ============================================================================

/**
 * Bulk update team member status
 */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      status
    }: {
      ids: string[]
      status: TeamMember['status']
    }) => {
      const results = await Promise.allSettled(
        ids.map(id => teamClient.updateStatus(id, status))
      )

      const successful = results.filter(
        (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success
      ).length

      const failed = ids.length - successful

      return { successful, failed, total: ids.length }
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      if (results.failed > 0) {
        toast.warning(
          `Updated ${results.successful}/${results.total} members. ${results.failed} failed.`
        )
      } else {
        toast.success(`Updated ${results.successful} team members`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Bulk delete team members
 */
export function useBulkDeleteTeamMembers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(id => teamClient.deleteTeamMember(id))
      )

      const successful = results.filter(
        (r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.success
      ).length

      const failed = ids.length - successful

      return { successful, failed, total: ids.length }
    },
    onSuccess: (results, ids) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members() })
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.stats() })

      // Remove individual member queries
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: teamQueryKeys.member(id) })
      })

      if (results.failed > 0) {
        toast.warning(
          `Removed ${results.successful}/${results.total} members. ${results.failed} failed.`
        )
      } else {
        toast.success(`Removed ${results.successful} team members`)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function TeamPage() {
 *   const { data: membersData, isLoading } = useTeamMembers(1, 20, { status: ['active'] })
 *   const { data: stats } = useTeamStats()
 *   const { data: invitations } = useTeamInvitations(['pending'])
 *
 *   const createMember = useCreateTeamMember()
 *   const updateStatus = useUpdateTeamMemberStatus()
 *   const sendInvitation = useSendInvitation()
 *   const toggleLead = useToggleTeamLead()
 *
 *   if (isLoading) return <Skeleton />
 *
 *   return (
 *     <div>
 *       {/* Stats Overview *\/}
 *       <div className="grid grid-cols-4 gap-4">
 *         <StatCard title="Total Members" value={stats?.total_members} />
 *         <StatCard title="Active" value={stats?.active_members} />
 *         <StatCard title="Pending Invites" value={stats?.pending_invitations} />
 *         <StatCard title="Avg Performance" value={`${stats?.avg_performance_score}%`} />
 *       </div>
 *
 *       {/* Pending Invitations *\/}
 *       {invitations && invitations.length > 0 && (
 *         <InvitationsList invitations={invitations} />
 *       )}
 *
 *       {/* Team Members List *\/}
 *       {membersData?.data.map(member => (
 *         <TeamMemberCard
 *           key={member.id}
 *           member={member}
 *           onToggleLead={() => toggleLead.mutate(member.id)}
 *           onDeactivate={() => updateStatus.mutate({
 *             id: member.id,
 *             status: 'inactive'
 *           })}
 *         />
 *       ))}
 *
 *       {/* Invite Button *\/}
 *       <Button onClick={() => sendInvitation.mutate({
 *         email: 'newmember@example.com',
 *         role: 'member'
 *       })}>
 *         Invite Team Member
 *       </Button>
 *     </div>
 *   )
 * }
 * ```
 */
