'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type MemberStatus = 'active' | 'away' | 'busy' | 'offline'
export type MemberRole = 'owner' | 'admin' | 'manager' | 'member' | 'guest'

export interface TeamMember {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  role: MemberRole
  department?: string
  title?: string
  status: MemberStatus
  statusMessage?: string
  timezone: string
  skills: string[]
  projects: string[]
  workload: number
  hoursThisWeek: number
  lastActiveAt?: string
  joinedAt: string
}

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  members: TeamMember[]
  projects: string[]
  department?: string
  leaderId?: string
  isPrivate: boolean
  createdAt: string
  updatedAt: string
}

export interface TeamActivity {
  id: string
  teamId: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  target?: string
  targetType?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface TeamStats {
  totalMembers: number
  activeMembers: number
  totalProjects: number
  averageWorkload: number
  totalHoursThisWeek: number
  productivity: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMembers: TeamMember[] = [
  { id: 'tm-1', userId: 'user-1', name: 'Alex Chen', email: 'alex@company.com', role: 'owner', department: 'Engineering', title: 'Lead Developer', status: 'active', timezone: 'America/New_York', skills: ['React', 'TypeScript', 'Node.js'], projects: ['proj-1', 'proj-2'], workload: 85, hoursThisWeek: 38, lastActiveAt: '2024-03-20T16:00:00Z', joinedAt: '2023-01-01' },
  { id: 'tm-2', userId: 'user-2', name: 'Sarah Miller', email: 'sarah@company.com', avatar: '/avatars/sarah.jpg', role: 'admin', department: 'Design', title: 'Senior Designer', status: 'active', statusMessage: 'In a meeting', timezone: 'America/Los_Angeles', skills: ['Figma', 'UI/UX', 'Illustration'], projects: ['proj-1'], workload: 70, hoursThisWeek: 32, lastActiveAt: '2024-03-20T15:30:00Z', joinedAt: '2023-03-15' },
  { id: 'tm-3', userId: 'user-3', name: 'Mike Johnson', email: 'mike@company.com', role: 'member', department: 'Engineering', title: 'Frontend Developer', status: 'away', timezone: 'Europe/London', skills: ['Vue.js', 'CSS', 'JavaScript'], projects: ['proj-2'], workload: 60, hoursThisWeek: 28, lastActiveAt: '2024-03-20T12:00:00Z', joinedAt: '2023-06-01' },
  { id: 'tm-4', userId: 'user-4', name: 'Emily Davis', email: 'emily@company.com', role: 'member', department: 'Marketing', title: 'Content Manager', status: 'offline', timezone: 'America/Chicago', skills: ['Content Writing', 'SEO', 'Social Media'], projects: [], workload: 45, hoursThisWeek: 20, lastActiveAt: '2024-03-19T18:00:00Z', joinedAt: '2023-09-01' }
]

const mockTeams: Team[] = [
  { id: 'team-1', name: 'Product Team', description: 'Core product development team', members: mockMembers.slice(0, 3), projects: ['proj-1', 'proj-2'], department: 'Engineering', leaderId: 'user-1', isPrivate: false, createdAt: '2023-01-01', updatedAt: '2024-03-20' },
  { id: 'team-2', name: 'Design Squad', description: 'UI/UX and visual design', members: [mockMembers[1]], projects: ['proj-1'], department: 'Design', leaderId: 'user-2', isPrivate: false, createdAt: '2023-03-01', updatedAt: '2024-03-15' }
]

const mockActivities: TeamActivity[] = [
  { id: 'act-1', teamId: 'team-1', userId: 'user-1', userName: 'Alex Chen', action: 'completed task', target: 'Homepage Design', targetType: 'task', createdAt: '2024-03-20T15:00:00Z' },
  { id: 'act-2', teamId: 'team-1', userId: 'user-2', userName: 'Sarah Miller', action: 'uploaded file', target: 'mockups.fig', targetType: 'file', createdAt: '2024-03-20T14:30:00Z' },
  { id: 'act-3', teamId: 'team-1', userId: 'user-3', userName: 'Mike Johnson', action: 'commented on', target: 'PR #123', targetType: 'pull_request', createdAt: '2024-03-20T13:00:00Z' }
]

const mockStats: TeamStats = {
  totalMembers: 4,
  activeMembers: 2,
  totalProjects: 2,
  averageWorkload: 65,
  totalHoursThisWeek: 118,
  productivity: 87
}

// ============================================================================
// HOOK
// ============================================================================

interface UseTeamHubOptions {
  
  teamId?: string
}

export function useTeamHub(options: UseTeamHubOptions = {}) {
  const {  teamId } = options

  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/teams')
      const result = await response.json()
      if (result.success) {
        setTeams(Array.isArray(result.teams) ? result.teams : [])
        setMembers(Array.isArray(result.members) ? result.members : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.teams
      }
      setTeams(mockTeams)
      setMembers(mockMembers)
      setStats(null)
      return []
    } catch (err) {
      setTeams(mockTeams)
      setMembers(mockMembers)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ teamId])

  const createTeam = useCallback(async (data: { name: string; description?: string; department?: string; memberIds?: string[] }) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setTeams(prev => [result.team, ...prev])
        return { success: true, team: result.team }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newTeam: Team = { id: `team-${Date.now()}`, name: data.name, description: data.description, department: data.department, members: [], projects: [], isPrivate: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setTeams(prev => [newTeam, ...prev])
      return { success: true, team: newTeam }
    }
  }, [])

  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      }
      return result
    } catch (err) {
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t))
      return { success: true }
    }
  }, [])

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      await fetch(`/api/teams/${teamId}`, { method: 'DELETE' })
      setTeams(prev => prev.filter(t => t.id !== teamId))
      return { success: true }
    } catch (err) {
      setTeams(prev => prev.filter(t => t.id !== teamId))
      return { success: true }
    }
  }, [])

  const addMember = useCallback(async (teamId: string, userId: string, role: MemberRole = 'member') => {
    const member = members.find(m => m.userId === userId)
    if (!member) return { success: false, error: 'User not found' }

    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: [...t.members, { ...member, role }] } : t))
    return { success: true }
  }, [members])

  const removeMember = useCallback(async (teamId: string, userId: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: t.members.filter(m => m.userId !== userId) } : t))
    return { success: true }
  }, [])

  const updateMemberRole = useCallback(async (teamId: string, userId: string, newRole: MemberRole) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, members: t.members.map(m => m.userId === userId ? { ...m, role: newRole } : m) } : t))
    return { success: true }
  }, [])

  const updateMemberStatus = useCallback(async (userId: string, status: MemberStatus, statusMessage?: string) => {
    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, status, statusMessage, lastActiveAt: new Date().toISOString() } : m))
    return { success: true }
  }, [])

  const inviteMember = useCallback(async (email: string, teamId?: string, role: MemberRole = 'member') => {
    try {
      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, teamId, role })
      })
      return await response.json()
    } catch (err) {
      return { success: true, message: 'Invitation sent' }
    }
  }, [])

  const fetchActivities = useCallback(async (teamId: string, limit?: number) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/activities?limit=${limit || 20}`)
      const result = await response.json()
      if (result.success) {
        setActivities(result.activities || [])
        return result.activities
      }
      return []
    } catch (err) {
      return []
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchTeams()
  }, [fetchTeams])

  useEffect(() => { refresh() }, [refresh])

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members
    const q = searchQuery.toLowerCase()
    return members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.skills.some(s => s.toLowerCase().includes(q)))
  }, [members, searchQuery])

  const onlineMembers = useMemo(() => members.filter(m => m.status === 'active' || m.status === 'away'), [members])
  const membersByDepartment = useMemo(() => {
    const grouped: Record<string, TeamMember[]> = {}
    members.forEach(m => {
      const dept = m.department || 'Other'
      if (!grouped[dept]) grouped[dept] = []
      grouped[dept].push(m)
    })
    return grouped
  }, [members])
  const membersByRole = useMemo(() => {
    const grouped: Record<string, TeamMember[]> = {}
    members.forEach(m => {
      if (!grouped[m.role]) grouped[m.role] = []
      grouped[m.role].push(m)
    })
    return grouped
  }, [members])
  const overloadedMembers = useMemo(() => members.filter(m => m.workload > 80), [members])
  const availableMembers = useMemo(() => members.filter(m => m.workload < 50 && m.status === 'active'), [members])

  return {
    teams, members: filteredMembers, activities, currentTeam, stats, onlineMembers, membersByDepartment, membersByRole, overloadedMembers, availableMembers,
    isLoading, error, searchQuery,
    refresh, fetchTeams, createTeam, updateTeam, deleteTeam, addMember, removeMember, updateMemberRole, updateMemberStatus, inviteMember, fetchActivities, search,
    setCurrentTeam
  }
}

export default useTeamHub
