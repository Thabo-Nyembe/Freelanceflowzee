'use client'
import { useState, useMemo } from 'react'
import {
  Users, UserPlus, Building2, Target, Award, MessageSquare, Calendar, BarChart3,
  TrendingUp, Star, Heart, ThumbsUp, ChevronRight, ChevronDown, Search, Plus,
  MoreHorizontal, Download, Settings, RefreshCw, Clock,
  CheckCircle, AlertCircle, GitBranch, Send, Eye,
  Bell, Globe, Link2, Database, Shield, Mail,
  Smartphone, Slack, Video, UserCog, DollarSign
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTeamManagement, type Team, type TeamType, type TeamStatus } from '@/lib/hooks/use-team-management'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  teamManagementAIInsights,
  teamManagementCollaborators,
  teamManagementPredictions,
  teamManagementActivities,
  teamManagementQuickActions,
} from '@/lib/mock-data/adapters'

interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  email: string
  avatar?: string
  reportingTo?: string
  performance?: number
  goals?: number
  goalsCompleted?: number
  lastReview?: string
  nextReview?: string
  skills?: string[]
  tenure?: string
}

interface OKR {
  id: string
  title: string
  type: 'company' | 'team' | 'individual'
  owner: string
  progress: number
  status: 'on-track' | 'at-risk' | 'behind' | 'completed'
  keyResults: { title: string; progress: number; target: string }[]
  dueDate: string
}

interface OneOnOne {
  id: string
  participant: string
  manager: string
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'cancelled'
  topics?: string[]
  notes?: string
}

interface Recognition {
  id: string
  from: string
  to: string
  message: string
  value: string
  timestamp: string
  reactions: number
}

interface Review {
  id: string
  employee: string
  type: '360' | 'self' | 'manager' | 'peer'
  status: 'pending' | 'in-progress' | 'completed'
  cycle: string
  dueDate: string
  score?: number
}

export default function TeamManagementClient({ initialTeams }: { initialTeams: Team[] }) {
  const [activeView, setActiveView] = useState<'teams' | 'people' | 'goals' | 'reviews' | 'oneOnOnes' | 'recognition' | 'settings'>('teams')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TeamType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TeamStatus | 'all'>('all')
  const [showOrgChart, setShowOrgChart] = useState(false)
  const [expandedTeams, setExpandedTeams] = useState<string[]>([])
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)
  const [showRecognitionModal, setShowRecognitionModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [settingsTab, setSettingsTab] = useState('organization')

  const { teams, loading, error, createTeam, updateTeam, deleteTeam, refetch } = useTeamManagement({ teamType: typeFilter, status: statusFilter })
  const displayTeams = teams.length > 0 ? teams : initialTeams
  const supabase = createClient()

  // Form state for new team member
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Engineering'
  })
  const [addingMember, setAddingMember] = useState(false)

  // Form state for recognition
  const [recognitionForm, setRecognitionForm] = useState({
    recipientId: '',
    value: 'Excellence',
    message: ''
  })
  const [sendingRecognition, setSendingRecognition] = useState(false)

  // Form state for 1:1 scheduling
  const [showSchedule1on1Modal, setShowSchedule1on1Modal] = useState(false)
  const [schedule1on1Form, setSchedule1on1Form] = useState({
    participantId: '',
    scheduledDate: '',
    topics: ''
  })
  const [scheduling1on1, setScheduling1on1] = useState(false)

  // Form state for review cycle
  const [showReviewCycleModal, setShowReviewCycleModal] = useState(false)
  const [reviewCycleForm, setReviewCycleForm] = useState({
    cycleName: '',
    reviewType: '360',
    dueDate: ''
  })
  const [startingReviewCycle, setStartingReviewCycle] = useState(false)

  // Operation states
  const [archivingTeam, setArchivingTeam] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Form state for new OKR/Goal
  const [newGoalForm, setNewGoalForm] = useState({
    objective: '',
    type: 'team',
    keyResults: ['', '', ''],
    dueDate: ''
  })
  const [creatingGoal, setCreatingGoal] = useState(false)

  const handleCreateGoal = async () => {
    if (!newGoalForm.objective) {
      toast.error('Please enter an objective')
      return
    }
    setCreatingGoal(true)
    try {
      // Create as a team with goals/objectives
      await createTeam({
        team_name: newGoalForm.objective,
        team_type: 'functional' as TeamType,
        status: 'active' as TeamStatus,
        description: `OKR: ${newGoalForm.objective}`,
        visibility: 'public',
        join_policy: 'open',
        member_count: 0,
        budget_used: 0,
        can_invite_members: true,
        can_remove_members: true,
        can_manage_projects: true,
        chat_enabled: true,
        access_level: 'standard',
        objectives: { objective: newGoalForm.objective, type: newGoalForm.type },
        key_results: newGoalForm.keyResults.filter(kr => kr.trim()),
        milestones: [],
        settings: {},
        preferences: {},
        metadata: { dueDate: newGoalForm.dueDate }
      } as any)
      toast.success('OKR created successfully!')
      setShowNewGoalModal(false)
      setNewGoalForm({ objective: '', type: 'team', keyResults: ['', '', ''], dueDate: '' })
      refetch()
    } catch (error) {
      toast.error('Failed to create OKR')
      console.error(error)
    } finally {
      setCreatingGoal(false)
    }
  }

  // Mock team members data
  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Johnson', role: 'Engineering Manager', department: 'Engineering', email: 'sarah@company.com', performance: 92, goals: 5, goalsCompleted: 3, lastReview: '2024-09-15', nextReview: '2025-03-15', skills: ['Leadership', 'React', 'System Design'], tenure: '3 years' },
    { id: '2', name: 'Michael Chen', role: 'Senior Developer', department: 'Engineering', email: 'michael@company.com', reportingTo: '1', performance: 88, goals: 4, goalsCompleted: 2, lastReview: '2024-09-15', nextReview: '2025-03-15', skills: ['TypeScript', 'Node.js', 'AWS'], tenure: '2 years' },
    { id: '3', name: 'Emily Davis', role: 'Product Designer', department: 'Design', email: 'emily@company.com', performance: 95, goals: 4, goalsCompleted: 4, lastReview: '2024-10-01', nextReview: '2025-04-01', skills: ['Figma', 'User Research', 'Prototyping'], tenure: '1.5 years' },
    { id: '4', name: 'Alex Thompson', role: 'Marketing Lead', department: 'Marketing', email: 'alex@company.com', performance: 85, goals: 6, goalsCompleted: 4, lastReview: '2024-08-20', nextReview: '2025-02-20', skills: ['SEO', 'Content Strategy', 'Analytics'], tenure: '4 years' },
    { id: '5', name: 'Jessica Brown', role: 'HR Manager', department: 'People Ops', email: 'jessica@company.com', performance: 90, goals: 3, goalsCompleted: 2, lastReview: '2024-09-01', nextReview: '2025-03-01', skills: ['Talent Acquisition', 'Employee Relations', 'Compliance'], tenure: '2.5 years' },
    { id: '6', name: 'David Wilson', role: 'Junior Developer', department: 'Engineering', email: 'david@company.com', reportingTo: '1', performance: 78, goals: 3, goalsCompleted: 1, lastReview: '2024-11-01', nextReview: '2025-05-01', skills: ['JavaScript', 'React', 'CSS'], tenure: '6 months' },
  ])

  // Mock OKRs data
  const [okrs] = useState<OKR[]>([
    { id: '1', title: 'Increase Platform Revenue by 40%', type: 'company', owner: 'Leadership', progress: 65, status: 'on-track', keyResults: [{ title: 'Launch 3 new pricing tiers', progress: 100, target: '3 tiers' }, { title: 'Increase ARPU to $150', progress: 55, target: '$150' }, { title: 'Reduce churn to <2%', progress: 40, target: '2%' }], dueDate: '2025-03-31' },
    { id: '2', title: 'Improve Product Quality Score', type: 'team', owner: 'Engineering', progress: 72, status: 'on-track', keyResults: [{ title: 'Reduce bugs by 50%', progress: 80, target: '50%' }, { title: 'Achieve 99.9% uptime', progress: 95, target: '99.9%' }, { title: 'Improve NPS to 60+', progress: 42, target: '60+' }], dueDate: '2025-03-31' },
    { id: '3', title: 'Build World-Class Design System', type: 'team', owner: 'Design', progress: 45, status: 'at-risk', keyResults: [{ title: 'Document 100 components', progress: 60, target: '100' }, { title: 'Achieve design consistency 95%', progress: 35, target: '95%' }, { title: 'Reduce design handoff time 40%', progress: 40, target: '40%' }], dueDate: '2025-02-28' },
    { id: '4', title: 'Master Advanced TypeScript Patterns', type: 'individual', owner: 'Michael Chen', progress: 80, status: 'on-track', keyResults: [{ title: 'Complete advanced course', progress: 100, target: 'Done' }, { title: 'Refactor 5 legacy modules', progress: 60, target: '5 modules' }], dueDate: '2025-01-31' },
    { id: '5', title: 'Grow Organic Traffic 100%', type: 'team', owner: 'Marketing', progress: 35, status: 'behind', keyResults: [{ title: 'Publish 50 blog posts', progress: 40, target: '50 posts' }, { title: 'Improve DA to 60', progress: 30, target: '60' }], dueDate: '2025-03-31' },
  ])

  // Mock 1:1s data
  const [oneOnOnes] = useState<OneOnOne[]>([
    { id: '1', participant: 'Michael Chen', manager: 'Sarah Johnson', scheduledDate: '2024-12-26T10:00:00', status: 'scheduled', topics: ['Q1 Goals', 'Career Development', 'Project Updates'] },
    { id: '2', participant: 'David Wilson', manager: 'Sarah Johnson', scheduledDate: '2024-12-24T14:00:00', status: 'scheduled', topics: ['Onboarding Progress', 'Learning Goals'] },
    { id: '3', participant: 'Emily Davis', manager: 'Alex Thompson', scheduledDate: '2024-12-20T11:00:00', status: 'completed', topics: ['Design System Progress'], notes: 'Great progress on component library.' },
    { id: '4', participant: 'Jessica Brown', manager: 'Leadership', scheduledDate: '2024-12-18T15:00:00', status: 'completed', topics: ['Hiring Pipeline', 'Culture Initiatives'] },
  ])

  // Mock recognition data
  const [recognitions] = useState<Recognition[]>([
    { id: '1', from: 'Sarah Johnson', to: 'Michael Chen', message: 'Amazing work on the new authentication system! Your attention to security details was exceptional.', value: 'Excellence', timestamp: '2024-12-22T09:30:00', reactions: 12 },
    { id: '2', from: 'Alex Thompson', to: 'Emily Davis', message: 'The new dashboard designs are stunning! Clients loved them in the demo.', value: 'Innovation', timestamp: '2024-12-21T16:45:00', reactions: 8 },
    { id: '3', from: 'Michael Chen', to: 'David Wilson', message: 'Great job debugging that tricky CSS issue. Your persistence paid off!', value: 'Teamwork', timestamp: '2024-12-20T11:20:00', reactions: 5 },
    { id: '4', from: 'Jessica Brown', to: 'Sarah Johnson', message: 'Thank you for mentoring the new team members. Your leadership made a huge difference.', value: 'Leadership', timestamp: '2024-12-19T14:00:00', reactions: 15 },
  ])

  // Mock reviews data
  const [reviews] = useState<Review[]>([
    { id: '1', employee: 'Michael Chen', type: '360', status: 'in-progress', cycle: 'Q4 2024', dueDate: '2024-12-31' },
    { id: '2', employee: 'Emily Davis', type: 'self', status: 'completed', cycle: 'Q4 2024', dueDate: '2024-12-31', score: 4.5 },
    { id: '3', employee: 'David Wilson', type: 'manager', status: 'pending', cycle: 'Q4 2024', dueDate: '2025-01-15' },
    { id: '4', employee: 'Alex Thompson', type: '360', status: 'completed', cycle: 'Q4 2024', dueDate: '2024-12-31', score: 4.2 },
  ])

  const stats = useMemo(() => ({
    totalTeams: displayTeams.length,
    activeTeams: displayTeams.filter(t => t.status === 'active').length,
    totalMembers: teamMembers.length,
    avgPerformance: Math.round(teamMembers.reduce((sum, m) => sum + (m.performance || 0), 0) / teamMembers.length),
    goalsOnTrack: okrs.filter(o => o.status === 'on-track').length,
    goalsAtRisk: okrs.filter(o => o.status === 'at-risk' || o.status === 'behind').length,
    pendingReviews: reviews.filter(r => r.status === 'pending' || r.status === 'in-progress').length,
    upcoming1on1s: oneOnOnes.filter(o => o.status === 'scheduled').length,
  }), [displayTeams, teamMembers, okrs, reviews, oneOnOnes])

  const views = [
    { id: 'teams' as const, name: 'Teams', icon: Building2, count: stats.totalTeams },
    { id: 'people' as const, name: 'People', icon: Users, count: teamMembers.length },
    { id: 'goals' as const, name: 'Goals & OKRs', icon: Target, count: okrs.length },
    { id: 'reviews' as const, name: 'Reviews', icon: BarChart3, count: reviews.length },
    { id: 'oneOnOnes' as const, name: '1:1s', icon: MessageSquare, count: oneOnOnes.length },
    { id: 'recognition' as const, name: 'Recognition', icon: Award, count: recognitions.length },
    { id: 'settings' as const, name: 'Settings', icon: Settings, count: null },
  ]

  const valueColors: Record<string, string> = {
    'Excellence': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Innovation': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Teamwork': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Leadership': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }

  const getStatusColor = (status: OKR['status']) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'behind': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    )
  }

  // Handlers - Real Supabase Operations
  const handleExportTeams = async () => {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch all team data for export
      const { data: teamsData, error: teamsError } = await supabase
        .from('team_management')
        .select('*')
        .eq('user_id', user.id)

      if (teamsError) throw teamsError

      // Create CSV content
      const headers = ['Team Name', 'Type', 'Status', 'Member Count', 'Description', 'Created At']
      const rows = (teamsData || []).map(t => [
        t.team_name,
        t.team_type,
        t.status,
        t.member_count,
        t.description || '',
        new Date(t.created_at).toLocaleDateString()
      ])
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `team-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Export completed', {
        description: `Exported ${teamsData?.length || 0} teams`
      })
    } catch (error: any) {
      toast.error('Export failed', {
        description: error.message || 'Could not export team data'
      })
    } finally {
      setExporting(false)
    }
  }

  const handleAddTeamMember = async () => {
    if (!newMemberForm.name || !newMemberForm.email) {
      toast.error('Please fill in required fields')
      return
    }
    setAddingMember(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          name: newMemberForm.name,
          email: newMemberForm.email,
          role: newMemberForm.role,
          department: newMemberForm.department,
          status: 'active',
          is_lead: false,
          projects_count: 0,
          tasks_completed: 0,
          performance_score: 0,
          skills: [],
          metadata: {}
        })

      if (error) throw error

      toast.success('Team member added', {
        description: `${newMemberForm.name} has been added to the team`
      })
      setShowAddMemberModal(false)
      setNewMemberForm({ name: '', email: '', role: '', department: 'Engineering' })
    } catch (error: any) {
      toast.error('Failed to add member', {
        description: error.message || 'Could not add team member'
      })
    } finally {
      setAddingMember(false)
    }
  }

  const handleArchiveTeam = async (team: Team) => {
    setArchivingTeam(team.id)
    try {
      await updateTeam({ id: team.id, status: 'archived' as TeamStatus })
      toast.success('Team archived', {
        description: `"${team.team_name}" has been archived`
      })
      refetch()
    } catch (error: any) {
      toast.error('Failed to archive team', {
        description: error.message || 'Could not archive the team'
      })
    } finally {
      setArchivingTeam(null)
    }
  }

  const handleSendRecognition = async () => {
    if (!recognitionForm.recipientId || !recognitionForm.message) {
      toast.error('Please select a recipient and enter a message')
      return
    }
    setSendingRecognition(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const recipient = teamMembers.find(m => m.id === recognitionForm.recipientId)

      const { error } = await supabase
        .from('team_recognitions')
        .insert({
          user_id: user.id,
          from_user: user.email || 'Anonymous',
          to_user: recipient?.name || 'Team Member',
          message: recognitionForm.message,
          value: recognitionForm.value,
          reactions: 0,
          metadata: {}
        })

      if (error) throw error

      toast.success('Recognition sent!', {
        description: `Your recognition for ${recipient?.name} has been posted`
      })
      setShowRecognitionModal(false)
      setRecognitionForm({ recipientId: '', value: 'Excellence', message: '' })
    } catch (error: any) {
      toast.error('Failed to send recognition', {
        description: error.message || 'Could not send recognition'
      })
    } finally {
      setSendingRecognition(false)
    }
  }

  const handleSchedule1on1 = async () => {
    if (!schedule1on1Form.participantId || !schedule1on1Form.scheduledDate) {
      toast.error('Please select a participant and date')
      return
    }
    setScheduling1on1(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const participant = teamMembers.find(m => m.id === schedule1on1Form.participantId)

      const { error } = await supabase
        .from('team_meetings')
        .insert({
          user_id: user.id,
          participant_name: participant?.name || 'Team Member',
          manager_name: user.email || 'Manager',
          scheduled_date: schedule1on1Form.scheduledDate,
          status: 'scheduled',
          topics: schedule1on1Form.topics.split(',').map(t => t.trim()).filter(Boolean),
          notes: '',
          metadata: {}
        })

      if (error) throw error

      toast.success('1:1 scheduled', {
        description: `Meeting scheduled with ${participant?.name}`
      })
      setShowSchedule1on1Modal(false)
      setSchedule1on1Form({ participantId: '', scheduledDate: '', topics: '' })
    } catch (error: any) {
      toast.error('Failed to schedule 1:1', {
        description: error.message || 'Could not schedule meeting'
      })
    } finally {
      setScheduling1on1(false)
    }
  }

  const handleStartReviewCycle = async () => {
    if (!reviewCycleForm.cycleName || !reviewCycleForm.dueDate) {
      toast.error('Please fill in cycle name and due date')
      return
    }
    setStartingReviewCycle(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create review entries for all team members
      const reviewInserts = teamMembers.map(member => ({
        user_id: user.id,
        employee_name: member.name,
        review_type: reviewCycleForm.reviewType,
        status: 'pending',
        cycle_name: reviewCycleForm.cycleName,
        due_date: reviewCycleForm.dueDate,
        score: null,
        metadata: {}
      }))

      const { error } = await supabase
        .from('team_reviews')
        .insert(reviewInserts)

      if (error) throw error

      toast.success('Review cycle started', {
        description: `Created ${teamMembers.length} review entries`
      })
      setShowReviewCycleModal(false)
      setReviewCycleForm({ cycleName: '', reviewType: '360', dueDate: '' })
    } catch (error: any) {
      toast.error('Failed to start review cycle', {
        description: error.message || 'Could not start review cycle'
      })
    } finally {
      setStartingReviewCycle(false)
    }
  }

  const handleResetOKRs = async () => {
    if (!confirm('Are you sure you want to reset all OKRs? This action cannot be undone.')) {
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('team_management')
        .update({
          objectives: {},
          key_results: [],
          milestones: []
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('OKRs reset', {
        description: 'All goals and OKRs have been cleared'
      })
      refetch()
    } catch (error: any) {
      toast.error('Failed to reset OKRs', {
        description: error.message || 'Could not reset OKRs'
      })
    }
  }

  const handleArchiveAllReviews = async () => {
    if (!confirm('Are you sure you want to archive all reviews? This action cannot be undone.')) {
      return
    }
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('team_reviews')
        .update({ status: 'archived' })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Reviews archived', {
        description: 'All reviews have been moved to archive'
      })
    } catch (error: any) {
      toast.error('Failed to archive reviews', {
        description: error.message || 'Could not archive reviews'
      })
    }
  }

  const handleExportAllData = async () => {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch all HR data
      const [teamsRes, membersRes, meetingsRes, reviewsRes] = await Promise.all([
        supabase.from('team_management').select('*').eq('user_id', user.id),
        supabase.from('team_members').select('*').eq('user_id', user.id),
        supabase.from('team_meetings').select('*').eq('user_id', user.id),
        supabase.from('team_reviews').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        teams: teamsRes.data || [],
        members: membersRes.data || [],
        meetings: meetingsRes.data || [],
        reviews: reviewsRes.data || [],
        exportedAt: new Date().toISOString()
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hr-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Export completed', {
        description: 'All HR data has been exported'
      })
    } catch (error: any) {
      toast.error('Export failed', {
        description: error.message || 'Could not export data'
      })
    } finally {
      setExporting(false)
    }
  }

  const handleSyncNow = async () => {
    toast.info('Syncing...', { description: 'Refreshing data from all sources' })
    try {
      await refetch()
      toast.success('Sync complete', { description: 'All data is up to date' })
    } catch (error: any) {
      toast.error('Sync failed', { description: error.message })
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                Lattice Level
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Performance management, goals, and team development</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowOrgChart(!showOrgChart)} className="gap-2">
              <GitBranch className="w-4 h-4" />
              Org Chart
            </Button>
            <Dialog open={showRecognitionModal} onOpenChange={setShowRecognitionModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Star className="w-4 h-4" />
                  Give Recognition
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Recognition</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Who are you recognizing?</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      value={recognitionForm.recipientId}
                      onChange={(e) => setRecognitionForm(prev => ({ ...prev, recipientId: e.target.value }))}
                    >
                      <option value="">Select a person...</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Value</label>
                    <div className="flex flex-wrap gap-2">
                      {['Excellence', 'Innovation', 'Teamwork', 'Leadership'].map(value => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRecognitionForm(prev => ({ ...prev, value }))}
                          className={`px-3 py-1.5 rounded-full border transition-colors ${
                            recognitionForm.value === value
                              ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                              : 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg min-h-[100px] dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Share what they did and why it matters..."
                      value={recognitionForm.message}
                      onChange={(e) => setRecognitionForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRecognitionModal(false)}>Cancel</Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 gap-2"
                    onClick={handleSendRecognition}
                    disabled={sendingRecognition || !recognitionForm.recipientId || !recognitionForm.message}
                  >
                    <Send className="w-4 h-4" />
                    {sendingRecognition ? 'Sending...' : 'Send Recognition'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <UserPlus className="w-4 h-4" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Full name"
                      value={newMemberForm.name}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      placeholder="Job title"
                      value={newMemberForm.role}
                      onChange={(e) => setNewMemberForm(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={newMemberForm.department}
                      onValueChange={(value) => setNewMemberForm(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="People Ops">People Ops</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMemberModal(false)}>Cancel</Button>
                  <Button onClick={handleAddTeamMember} disabled={addingMember || !newMemberForm.name || !newMemberForm.email}>
                    {addingMember ? 'Adding...' : 'Add Member'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Building2 className="w-4 h-4" />
              Teams
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTeams}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Users className="w-4 h-4" />
              People
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <TrendingUp className="w-4 h-4" />
              Avg Perf
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.avgPerformance}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Target className="w-4 h-4 text-green-500" />
              On Track
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.goalsOnTrack}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              At Risk
            </div>
            <div className="text-2xl font-bold text-yellow-600">{stats.goalsAtRisk}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <BarChart3 className="w-4 h-4" />
              Reviews
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <MessageSquare className="w-4 h-4" />
              1:1s
            </div>
            <div className="text-2xl font-bold text-indigo-600">{stats.upcoming1on1s}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Award className="w-4 h-4" />
              Recognition
            </div>
            <div className="text-2xl font-bold text-pink-600">{recognitions.length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-1 p-2 overflow-x-auto">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeView === view.id
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.name}
                  {view.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeView === view.id
                        ? 'bg-purple-200 dark:bg-purple-800'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {view.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Teams View */}
          {activeView === 'teams' && (
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Types</option>
                  <option value="department">Department</option>
                  <option value="project">Project</option>
                  <option value="cross_functional">Cross-Functional</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="forming">Forming</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayTeams
                    .filter(t =>
                      (typeFilter === 'all' || t.team_type === typeFilter) &&
                      (statusFilter === 'all' || t.status === statusFilter) &&
                      (!searchQuery || t.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(team => (
                      <div key={team.id} className="border rounded-xl dark:border-gray-700 overflow-hidden">
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          onClick={() => toggleTeamExpand(team.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button className="p-1">
                                {expandedTeams.includes(team.id) ? (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                {team.team_name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">{team.team_name}</h3>
                                  <Badge className={
                                    team.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                  }>
                                    {team.status}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">{team.team_type}</Badge>
                                </div>
                                {team.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{team.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{team.member_count}</div>
                                <div className="text-xs text-gray-500">members</div>
                              </div>
                              {team.health_score && (
                                <div className="text-center">
                                  <div className={`text-2xl font-bold ${team.health_score >= 80 ? 'text-green-600' : team.health_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {team.health_score.toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-gray-500">health</div>
                                </div>
                              )}
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {expandedTeams.includes(team.id) && (
                          <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Team Members
                                </h4>
                                {teamMembers.slice(0, 3).map(member => (
                                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                                      {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{member.name}</div>
                                      <div className="text-xs text-gray-500">{member.role}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Active Goals
                                </h4>
                                {okrs.filter(o => o.type === 'team').slice(0, 2).map(okr => (
                                  <div key={okr.id} className="p-2 rounded-lg bg-white dark:bg-gray-700">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium truncate">{okr.title}</span>
                                      <Badge className={getStatusColor(okr.status)} variant="secondary">{okr.progress}%</Badge>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                      <div className={`h-full ${getProgressColor(okr.progress)} rounded-full`} style={{ width: `${okr.progress}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4" />
                                  Performance
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-700">
                                    <span className="text-sm">Avg Performance</span>
                                    <span className="font-bold text-green-600">87%</span>
                                  </div>
                                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-700">
                                    <span className="text-sm">Goal Completion</span>
                                    <span className="font-bold text-blue-600">72%</span>
                                  </div>
                                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-700">
                                    <span className="text-sm">Engagement Score</span>
                                    <span className="font-bold text-purple-600">8.2</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* People View */}
          {activeView === 'people' && (
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search people..." className="pl-10" />
                </div>
                <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="people-ops">People Ops</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Department</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Performance</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Goals</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Next Review</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map(member => (
                      <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{member.department}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className={`h-full ${getProgressColor(member.performance || 0)} rounded-full`} style={{ width: `${member.performance}%` }} />
                            </div>
                            <span className="text-sm font-medium">{member.performance}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{member.goalsCompleted}/{member.goals}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {member.nextReview ? new Date(member.nextReview).toLocaleDateString() : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedMember(member)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Goals & OKRs View */}
          {activeView === 'goals' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">All Goals</option>
                    <option value="company">Company</option>
                    <option value="team">Team</option>
                    <option value="individual">Individual</option>
                  </select>
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">All Status</option>
                    <option value="on-track">On Track</option>
                    <option value="at-risk">At Risk</option>
                    <option value="behind">Behind</option>
                  </select>
                </div>
                <Dialog open={showNewGoalModal} onOpenChange={setShowNewGoalModal}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create OKR
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New OKR</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Objective</label>
                        <Input
                          placeholder="What do you want to achieve?"
                          value={newGoalForm.objective}
                          onChange={(e) => setNewGoalForm(prev => ({ ...prev, objective: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                          value={newGoalForm.type}
                          onChange={(e) => setNewGoalForm(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                          <option value="company">Company</option>
                          <option value="team">Team</option>
                          <option value="individual">Individual</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Key Results</label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Key Result 1"
                            value={newGoalForm.keyResults[0]}
                            onChange={(e) => setNewGoalForm(prev => ({ ...prev, keyResults: [e.target.value, prev.keyResults[1], prev.keyResults[2]] }))}
                          />
                          <Input
                            placeholder="Key Result 2"
                            value={newGoalForm.keyResults[1]}
                            onChange={(e) => setNewGoalForm(prev => ({ ...prev, keyResults: [prev.keyResults[0], e.target.value, prev.keyResults[2]] }))}
                          />
                          <Input
                            placeholder="Key Result 3"
                            value={newGoalForm.keyResults[2]}
                            onChange={(e) => setNewGoalForm(prev => ({ ...prev, keyResults: [prev.keyResults[0], prev.keyResults[1], e.target.value] }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="date"
                          value={newGoalForm.dueDate}
                          onChange={(e) => setNewGoalForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewGoalModal(false)}>Cancel</Button>
                      <Button onClick={handleCreateGoal} disabled={creatingGoal || !newGoalForm.objective}>
                        {creatingGoal ? 'Creating...' : 'Create OKR'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {okrs.map(okr => (
                  <div key={okr.id} className="p-4 border rounded-xl dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(okr.status)}>{okr.status.replace('-', ' ')}</Badge>
                          <Badge variant="outline" className="capitalize">{okr.type}</Badge>
                          <span className="text-sm text-gray-500">Owner: {okr.owner}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{okr.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600">{okr.progress}%</div>
                        <div className="text-xs text-gray-500">Due: {new Date(okr.dueDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-4">
                      <div className={`h-full ${getProgressColor(okr.progress)} rounded-full transition-all`} style={{ width: `${okr.progress}%` }} />
                    </div>
                    <div className="space-y-3">
                      {okr.keyResults.map((kr, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{kr.title}</span>
                              <span className="text-sm text-gray-500">{kr.progress}% / {kr.target}</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className={`h-full ${getProgressColor(kr.progress)} rounded-full`} style={{ width: `${kr.progress}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews View */}
          {activeView === 'reviews' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Reviews</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Q4 2024 Review Cycle</p>
                </div>
                <Dialog open={showReviewCycleModal} onOpenChange={setShowReviewCycleModal}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Start Review Cycle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Review Cycle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Cycle Name *</Label>
                        <Input
                          placeholder="e.g., Q1 2025 Reviews"
                          value={reviewCycleForm.cycleName}
                          onChange={(e) => setReviewCycleForm(prev => ({ ...prev, cycleName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Review Type</Label>
                        <Select
                          value={reviewCycleForm.reviewType}
                          onValueChange={(value) => setReviewCycleForm(prev => ({ ...prev, reviewType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="360">360 Feedback</SelectItem>
                            <SelectItem value="manager">Manager Only</SelectItem>
                            <SelectItem value="self">Self Assessment</SelectItem>
                            <SelectItem value="peer">Peer Reviews</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date *</Label>
                        <Input
                          type="date"
                          value={reviewCycleForm.dueDate}
                          onChange={(e) => setReviewCycleForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        This will create review entries for {teamMembers.length} team members.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowReviewCycleModal(false)}>Cancel</Button>
                      <Button
                        onClick={handleStartReviewCycle}
                        disabled={startingReviewCycle || !reviewCycleForm.cycleName || !reviewCycleForm.dueDate}
                      >
                        {startingReviewCycle ? 'Starting...' : 'Start Cycle'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-xl dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Pending</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                    {reviews.filter(r => r.status === 'pending').length}
                  </div>
                </div>
                <div className="p-4 border rounded-xl dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
                    <RefreshCw className="w-4 h-4" />
                    <span className="font-medium">In Progress</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {reviews.filter(r => r.status === 'in-progress').length}
                  </div>
                </div>
                <div className="p-4 border rounded-xl dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Completed</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {reviews.filter(r => r.status === 'completed').length}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review.id} className="p-4 border rounded-xl dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {review.employee.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{review.employee}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">{review.type} Review</Badge>
                            <span className="text-sm text-gray-500">{review.cycle}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {review.score && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{review.score}</div>
                            <div className="text-xs text-gray-500">/ 5.0</div>
                          </div>
                        )}
                        <Badge className={
                          review.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          review.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }>
                          {review.status.replace('-', ' ')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {review.status === 'completed' ? 'View' : 'Continue'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1:1s View */}
          {activeView === 'oneOnOnes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1:1 Meetings</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Schedule and track one-on-one meetings</p>
                </div>
                <Dialog open={showSchedule1on1Modal} onOpenChange={setShowSchedule1on1Modal}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Schedule 1:1
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule 1:1 Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Participant *</Label>
                        <Select
                          value={schedule1on1Form.participantId}
                          onValueChange={(value) => setSchedule1on1Form(prev => ({ ...prev, participantId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date & Time *</Label>
                        <Input
                          type="datetime-local"
                          value={schedule1on1Form.scheduledDate}
                          onChange={(e) => setSchedule1on1Form(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Topics (comma-separated)</Label>
                        <Input
                          placeholder="Career goals, Project updates, Feedback..."
                          value={schedule1on1Form.topics}
                          onChange={(e) => setSchedule1on1Form(prev => ({ ...prev, topics: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSchedule1on1Modal(false)}>Cancel</Button>
                      <Button
                        onClick={handleSchedule1on1}
                        disabled={scheduling1on1 || !schedule1on1Form.participantId || !schedule1on1Form.scheduledDate}
                      >
                        {scheduling1on1 ? 'Scheduling...' : 'Schedule Meeting'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {oneOnOnes.map(meeting => (
                  <div key={meeting.id} className="p-4 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${meeting.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          <MessageSquare className={`w-5 h-5 ${meeting.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{meeting.participant} & {meeting.manager}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.scheduledDate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={
                          meeting.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          meeting.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }>
                          {meeting.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {meeting.status === 'completed' ? 'View Notes' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                    {meeting.topics && meeting.topics.length > 0 && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        <div className="flex flex-wrap gap-2">
                          {meeting.topics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {meeting.notes && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{meeting.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recognition View */}
          {activeView === 'recognition' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recognition Wall</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Celebrate team achievements and appreciate colleagues</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {['Excellence', 'Innovation', 'Teamwork', 'Leadership'].map((value, idx) => (
                      <div key={value} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-purple-100 text-purple-700' :
                        idx === 1 ? 'bg-blue-100 text-blue-700' :
                        idx === 2 ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`} title={value}>
                        {value.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => setShowRecognitionModal(true)} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                    <Star className="w-4 h-4" />
                    Give Recognition
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {recognitions.map(recognition => (
                  <div key={recognition.id} className="p-4 border rounded-xl dark:border-gray-700 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {recognition.from.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">{recognition.from}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-purple-600">{recognition.to}</span>
                        </div>
                        <Badge className={valueColors[recognition.value] || 'bg-gray-100 text-gray-700'}>
                          <Star className="w-3 h-3 mr-1" />
                          {recognition.value}
                        </Badge>
                        <p className="mt-3 text-gray-700 dark:text-gray-300">{recognition.message}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t dark:border-gray-700">
                          <span className="text-xs text-gray-500">{new Date(recognition.timestamp).toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-8 gap-1 text-gray-500">
                              <Heart className="w-4 h-4" />
                              {recognition.reactions}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 gap-1 text-gray-500">
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings View - BambooHR Level */}
          {activeView === 'settings' && (
            <div className="p-6">
              <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                <TabsList className="grid w-full grid-cols-6 mb-6">
                  <TabsTrigger value="organization" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Organization
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="gap-2">
                    <Target className="w-4 h-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="compensation" className="gap-2">
                    <DollarSign className="w-4 h-4" />
                    Compensation
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="gap-2">
                    <Link2 className="w-4 h-4" />
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Organization Settings */}
                <TabsContent value="organization" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Company Structure</h3>
                          <p className="text-sm text-gray-500">Configure organization hierarchy</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Organization Name</Label>
                          <Input defaultValue="FreeFlow Inc." />
                        </div>
                        <div className="space-y-2">
                          <Label>Fiscal Year Start</Label>
                          <Select defaultValue="january">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="january">January</SelectItem>
                              <SelectItem value="april">April</SelectItem>
                              <SelectItem value="july">July</SelectItem>
                              <SelectItem value="october">October</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Departments</Label>
                            <p className="text-xs text-gray-500">Structure teams by department</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Org Chart</Label>
                            <p className="text-xs text-gray-500">Visual hierarchy view</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Employee Settings</h3>
                          <p className="text-sm text-gray-500">Default employee configurations</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Work Schedule</Label>
                          <Select defaultValue="full-time">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-Time (40 hrs/week)</SelectItem>
                              <SelectItem value="part-time">Part-Time (20 hrs/week)</SelectItem>
                              <SelectItem value="contractor">Contractor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Probation Period</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="60">60 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Self-Service</Label>
                            <p className="text-xs text-gray-500">Let employees update profiles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Manager Approval</Label>
                            <p className="text-xs text-gray-500">Require approval for changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Time Off Policies</h3>
                        <p className="text-sm text-gray-500">Configure leave and time off</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Annual Leave</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="text-2xl font-bold text-green-600">20 days</div>
                        <p className="text-xs text-gray-500 mt-1">Per year, accrued monthly</p>
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Sick Leave</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">10 days</div>
                        <p className="text-xs text-gray-500 mt-1">Per year, no accrual</p>
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Personal Days</span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">5 days</div>
                        <p className="text-xs text-gray-500 mt-1">Per year, flexible use</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Performance Settings */}
                <TabsContent value="performance" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Goal Settings</h3>
                          <p className="text-sm text-gray-500">Configure OKR and goal framework</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Goal Framework</Label>
                          <Select defaultValue="okr">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="okr">OKRs (Objectives & Key Results)</SelectItem>
                              <SelectItem value="smart">SMART Goals</SelectItem>
                              <SelectItem value="kpi">KPIs</SelectItem>
                              <SelectItem value="custom">Custom Framework</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Goal Cycle</Label>
                          <Select defaultValue="quarterly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Goal Alignment</Label>
                            <p className="text-xs text-gray-500">Link goals to company objectives</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Public Goals</Label>
                            <p className="text-xs text-gray-500">Allow team to see all goals</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Review Settings</h3>
                          <p className="text-sm text-gray-500">Performance review configuration</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Review Frequency</Label>
                          <Select defaultValue="quarterly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly Check-ins</SelectItem>
                              <SelectItem value="quarterly">Quarterly Reviews</SelectItem>
                              <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                              <SelectItem value="annual">Annual Reviews</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Review Type</Label>
                          <Select defaultValue="360">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="360">360° Feedback</SelectItem>
                              <SelectItem value="manager">Manager Only</SelectItem>
                              <SelectItem value="self">Self Assessment</SelectItem>
                              <SelectItem value="peer">Peer Reviews</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Anonymous Feedback</Label>
                            <p className="text-xs text-gray-500">Hide reviewer identities</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Calibration Sessions</Label>
                            <p className="text-xs text-gray-500">Enable manager calibration</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">1:1 Meeting Settings</h3>
                        <p className="text-sm text-gray-500">Configure one-on-one meetings</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Default Frequency</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Default Duration</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                        <div>
                          <Label>Require Agenda</Label>
                          <p className="text-xs text-gray-500">Agenda before meeting</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Compensation Settings */}
                <TabsContent value="compensation" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Salary Configuration</h3>
                          <p className="text-sm text-gray-500">Compensation structure settings</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Currency</Label>
                          <Select defaultValue="usd">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="usd">USD ($)</SelectItem>
                              <SelectItem value="eur">EUR (€)</SelectItem>
                              <SelectItem value="gbp">GBP (£)</SelectItem>
                              <SelectItem value="zar">ZAR (R)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Pay Frequency</Label>
                          <Select defaultValue="monthly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Salary Bands</Label>
                            <p className="text-xs text-gray-500">Enable compensation bands</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Salary Transparency</Label>
                            <p className="text-xs text-gray-500">Show salary ranges to employees</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Recognition & Bonuses</h3>
                          <p className="text-sm text-gray-500">Rewards and recognition settings</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Recognition Program</Label>
                          <Select defaultValue="values">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="values">Values-Based Recognition</SelectItem>
                              <SelectItem value="peer">Peer-to-Peer</SelectItem>
                              <SelectItem value="manager">Manager Recognition</SelectItem>
                              <SelectItem value="all">All Types</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Bonus Cycle</Label>
                          <Select defaultValue="annual">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                              <SelectItem value="annual">Annual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Spot Bonuses</Label>
                            <p className="text-xs text-gray-500">Enable ad-hoc bonuses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Public Recognition</Label>
                            <p className="text-xs text-gray-500">Show recognition wall</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Merit Increase Settings</h3>
                        <p className="text-sm text-gray-500">Configure salary review cycles</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 mb-1">Review Cycle</div>
                        <div className="text-lg font-semibold">Annual</div>
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 mb-1">Budget Pool</div>
                        <div className="text-lg font-semibold text-green-600">4%</div>
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 mb-1">Next Review</div>
                        <div className="text-lg font-semibold text-purple-600">March 2025</div>
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <div className="text-sm text-gray-500 mb-1">Approval Required</div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">Yes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Manager Notifications</h3>
                          <p className="text-sm text-gray-500">Alerts for people managers</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'New Team Member Onboarding', desc: 'When new hire joins team', enabled: true },
                          { label: 'Review Reminders', desc: 'Upcoming performance reviews', enabled: true },
                          { label: '1:1 Scheduling', desc: 'Meeting reminders', enabled: true },
                          { label: 'Goal Updates', desc: 'Team goal progress', enabled: true },
                          { label: 'Time Off Requests', desc: 'Leave approvals needed', enabled: true },
                          { label: 'Recognition Given', desc: 'When team is recognized', enabled: false },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div>
                              <Label className="font-medium">{item.label}</Label>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={item.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <UserCog className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Employee Notifications</h3>
                          <p className="text-sm text-gray-500">Alerts for all employees</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Goal Deadlines', desc: 'Upcoming goal due dates', enabled: true },
                          { label: 'Review Invitations', desc: 'When assigned reviews', enabled: true },
                          { label: '1:1 Reminders', desc: 'Upcoming meetings', enabled: true },
                          { label: 'Recognition Received', desc: 'When you receive kudos', enabled: true },
                          { label: 'Team Announcements', desc: 'Company updates', enabled: true },
                          { label: 'Birthday Reminders', desc: 'Team member birthdays', enabled: false },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div>
                              <Label className="font-medium">{item.label}</Label>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={item.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Delivery Channels</h3>
                        <p className="text-sm text-gray-500">How notifications are delivered</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      {[
                        { icon: Mail, label: 'Email', desc: 'Daily digest', enabled: true },
                        { icon: Bell, label: 'Push', desc: 'Real-time alerts', enabled: true },
                        { icon: Slack, label: 'Slack', desc: 'Slack integration', enabled: true },
                        { icon: Smartphone, label: 'Mobile', desc: 'App notifications', enabled: false },
                      ].map((channel, idx) => (
                        <div key={idx} className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between mb-3">
                            <channel.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <Switch defaultChecked={channel.enabled} />
                          </div>
                          <div className="font-medium">{channel.label}</div>
                          <p className="text-xs text-gray-500">{channel.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Integrations Settings */}
                <TabsContent value="integrations" className="space-y-6">
                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Link2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Connected Services</h3>
                        <p className="text-sm text-gray-500">Third-party integrations</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { name: 'Slack', desc: 'Team communication', status: 'connected', icon: '💬' },
                        { name: 'Google Workspace', desc: 'Calendar & directory sync', status: 'connected', icon: '📅' },
                        { name: 'Payroll System', desc: 'ADP / Gusto integration', status: 'connected', icon: '💰' },
                        { name: 'Greenhouse', desc: 'Recruiting & ATS', status: 'available', icon: '🌱' },
                        { name: 'Workday', desc: 'HRIS sync', status: 'available', icon: '📊' },
                        { name: 'Okta', desc: 'SSO & identity', status: 'connected', icon: '🔐' },
                      ].map((integration, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{integration.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{integration.name}</div>
                              <p className="text-sm text-gray-500">{integration.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              integration.status === 'connected'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }>
                              {integration.status === 'connected' ? 'Connected' : 'Available'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              {integration.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Video className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Video Conferencing</h3>
                          <p className="text-sm text-gray-500">1:1 meeting links</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Default Platform</Label>
                        <Select defaultValue="zoom">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="zoom">Zoom</SelectItem>
                            <SelectItem value="meet">Google Meet</SelectItem>
                            <SelectItem value="teams">Microsoft Teams</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Generate Links</Label>
                          <p className="text-xs text-gray-500">Add video link to 1:1s</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Database className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Data Sync</h3>
                          <p className="text-sm text-gray-500">Sync frequency & settings</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Sync Frequency</Label>
                        <Select defaultValue="hourly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="w-full gap-2" onClick={handleSyncNow}>
                        <RefreshCw className="w-4 h-4" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Security & Privacy</h3>
                          <p className="text-sm text-gray-500">Data protection settings</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-xs text-gray-500">Require 2FA for managers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SSO Only</Label>
                            <p className="text-xs text-gray-500">Disable password login</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Data Export</Label>
                            <p className="text-xs text-gray-500">Allow GDPR data exports</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Audit Logs</Label>
                            <p className="text-xs text-gray-500">Track all changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Localization</h3>
                          <p className="text-sm text-gray-500">Regional settings</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date Format</Label>
                          <Select defaultValue="mdy">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                              <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                              <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <Select defaultValue="utc">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">Eastern Time</SelectItem>
                              <SelectItem value="pst">Pacific Time</SelectItem>
                              <SelectItem value="sast">South Africa (SAST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Reset All OKRs</div>
                          <p className="text-sm text-gray-500">Clear all goals and progress</p>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={handleResetOKRs}
                        >
                          Reset OKRs
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Archive Review History</div>
                          <p className="text-sm text-gray-500">Move all reviews to archive</p>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={handleArchiveAllReviews}
                        >
                          Archive All
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Export All Data</div>
                          <p className="text-sm text-gray-500">Download complete HR data</p>
                        </div>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={handleExportAllData}
                          disabled={exporting}
                        >
                          <Download className="w-4 h-4" />
                          {exporting ? 'Exporting...' : 'Export'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={teamManagementAIInsights}
              title="Team Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamManagementCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={teamManagementPredictions}
              title="Team Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={teamManagementActivities}
            title="Team Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={teamManagementQuickActions}
            variant="grid"
          />
        </div>

        {/* Member Detail Modal */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedMember && (
              <>
                <DialogHeader>
                  <DialogTitle>Employee Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedMember.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedMember.role}</p>
                      <Badge variant="outline" className="mt-1">{selectedMember.department}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg dark:border-gray-700 text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedMember.performance}%</div>
                      <div className="text-xs text-gray-500">Performance</div>
                    </div>
                    <div className="p-3 border rounded-lg dark:border-gray-700 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedMember.goalsCompleted}/{selectedMember.goals}</div>
                      <div className="text-xs text-gray-500">Goals</div>
                    </div>
                    <div className="p-3 border rounded-lg dark:border-gray-700 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedMember.tenure}</div>
                      <div className="text-xs text-gray-500">Tenure</div>
                    </div>
                  </div>

                  {selectedMember.skills && (
                    <div>
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map(skill => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => {
                        if (selectedMember) {
                          setSchedule1on1Form(prev => ({ ...prev, participantId: selectedMember.id }))
                          setShowSchedule1on1Modal(true)
                          setSelectedMember(null)
                        }
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Schedule 1:1
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        if (selectedMember) {
                          setRecognitionForm(prev => ({ ...prev, recipientId: selectedMember.id }))
                          setShowRecognitionModal(true)
                          setSelectedMember(null)
                        }
                      }}
                    >
                      <Star className="w-4 h-4" />
                      Give Recognition
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Helper component for recognition
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
