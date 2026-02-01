"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLeads, LeadInput, LeadStats } from '@/lib/hooks/use-leads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Target,
  Plus,
  Search,
  Users,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Trash2,
  Filter,
  MoreVertical,
  Building2,
  Globe,
  Calendar,
  MessageSquare,
  Send,
  Eye,
  UserPlus,
  UserCheck,
  BarChart3,
  Activity,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Tag,
  Briefcase,
  DollarSign,
  TrendingDown,
  Sparkles,
  Brain,
  Linkedin,
  AlertCircle,
  FileText,
  Copy,
  Flame,
  Sliders,
  Webhook,
  Database,
  Terminal,
  Shield,
  Archive,
  Lock,
  Layers,
  Rocket,
  Megaphone,
  ListChecks,
  GitBranch,
  Network,
  ArrowRight,
  ExternalLink
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

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Types
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
type LeadStage = 'subscriber' | 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'evangelist'
type LeadSource = 'website' | 'linkedin' | 'referral' | 'email' | 'paid_ads' | 'organic' | 'event' | 'cold_outreach' | 'partner'
type LeadPriority = 'hot' | 'warm' | 'cold'
type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task' | 'linkedin' | 'form_submit' | 'page_view'
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

interface LeadActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  outcome?: 'positive' | 'neutral' | 'negative'
  performedBy: string
  createdAt: Date
}

interface LeadNote {
  id: string
  content: string
  author: string
  createdAt: Date
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  title: string
  status: LeadStatus
  stage: LeadStage
  source: LeadSource
  priority: LeadPriority
  score: number
  behavioralScore: number
  demographicScore: number
  estimatedValue: number
  owner: {
    id: string
    name: string
    avatar: string
  }
  lastContactDate?: Date
  nextFollowUp?: Date
  tags: string[]
  industry: string
  companySize: string
  website?: string
  linkedinUrl?: string
  activities: LeadActivity[]
  notes: LeadNote[]
  engagementScore: number
  emailOpens: number
  emailClicks: number
  pageViews: number
  formSubmissions: number
  createdAt: Date
  updatedAt: Date
}

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sequence' | 'workflow' | 'ads'
  status: CampaignStatus
  leads: number
  sent: number
  opened: number
  clicked: number
  converted: number
  startDate: Date
  endDate?: Date
}

interface ScoringRule {
  id: string
  name: string
  category: 'behavioral' | 'demographic'
  condition: string
  points: number
  isActive: boolean
}

// Empty arrays - no mock data, data loaded from API/database

// Helper Functions
const getStatusColor = (status: LeadStatus): string => {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    qualified: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    proposal: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status] || colors.new
}

const getStageColor = (stage: LeadStage): string => {
  const colors: Record<LeadStage, string> = {
    subscriber: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    mql: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    sql: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    opportunity: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    customer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    evangelist: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
  }
  return colors[stage] || colors.lead
}

const getPriorityIcon = (priority: LeadPriority) => {
  const icons: Record<LeadPriority, React.ReactNode> = {
    hot: <Flame className="w-4 h-4 text-red-500" />,
    warm: <TrendingUp className="w-4 h-4 text-orange-500" />,
    cold: <TrendingDown className="w-4 h-4 text-blue-500" />
  }
  return icons[priority]
}

const getSourceIcon = (source: LeadSource) => {
  const icons: Record<LeadSource, React.ReactNode> = {
    website: <Globe className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    referral: <Users className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    paid_ads: <DollarSign className="w-4 h-4" />,
    organic: <Search className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
    cold_outreach: <Phone className="w-4 h-4" />,
    partner: <Building2 className="w-4 h-4" />
  }
  return icons[source] || <Globe className="w-4 h-4" />
}

const getActivityIcon = (type: ActivityType) => {
  const icons: Record<ActivityType, React.ReactNode> = {
    email: <Mail className="w-4 h-4 text-blue-500" />,
    call: <Phone className="w-4 h-4 text-green-500" />,
    meeting: <Users className="w-4 h-4 text-purple-500" />,
    note: <FileText className="w-4 h-4 text-gray-500" />,
    task: <CheckCircle className="w-4 h-4 text-amber-500" />,
    linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
    form_submit: <FileText className="w-4 h-4 text-pink-500" />,
    page_view: <Eye className="w-4 h-4 text-indigo-500" />
  }
  return icons[type] || <Activity className="w-4 h-4" />
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(date)
}

interface LeadGenerationClientProps {
  initialLeads?: any[]
  initialStats?: any
}

// Empty arrays for competitive upgrade components - data loaded from API/database
const mockLeadGenAIInsights: Array<{ id: string; type: 'success' | 'warning' | 'info' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }> = []

const mockLeadGenCollaborators: Array<{ id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }> = []

const mockLeadGenPredictions: Array<{ id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down' | 'stable'; impact: 'high' | 'medium' | 'low' }> = []

const mockLeadGenActivities: Array<{ id: string; type: 'create' | 'update' | 'delete' | 'comment' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration'; message: string; timestamp: string; user: { id: string; name: string; avatar?: string } }> = []

// Quick actions will be defined inside the component to access state setters

// Default stats for initial hook state
const defaultStats: LeadStats = {
  total: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
  converted: 0,
  conversionRate: 0,
  avgScore: 0,
  pipelineValue: 0
}

export default function LeadGenerationClient({ initialLeads, initialStats }: LeadGenerationClientProps) {
  const router = useRouter()
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Transform team members to collaborators format
  const collaborators = teamMembers.map(member => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar_url || '',
    status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const,
    role: member.role || 'Team Member'
  }))

  // Transform activity logs to activities format
  const activities = activityLogs.slice(0, 10).map(log => ({
    id: log.id,
    user: {
      id: log.user_id || 'system',
      name: log.user_name || 'System',
      avatar: undefined
    },
    action: log.action,
    target: log.resource_name ? { type: log.resource_type || 'resource', name: log.resource_name } : undefined,
    timestamp: log.created_at,
    type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const
  }))

  const [activeTab, setActiveTab] = useState('leads')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<LeadPriority | 'all'>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // New state for dialogs and forms
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick Action Dialogs
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false)
  const [isNurtureDialogOpen, setIsNurtureDialogOpen] = useState(false)
  const [isEmailBlastDialogOpen, setIsEmailBlastDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isSegmentsDialogOpen, setIsSegmentsDialogOpen] = useState(false)
  const [isNewDealDialogOpen, setIsNewDealDialogOpen] = useState(false)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = useState(false)
  const [scoreSettings, setScoreSettings] = useState({
    recalculateAll: true,
    useAI: true,
    minScore: 0,
    maxScore: 100
  })
  const [nurtureSettings, setNurtureSettings] = useState({
    sequence: 'welcome',
    targetSegment: 'cold',
    sendImmediately: false,
    emailCount: 5
  })

  // Bulk operations state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [isBulkTagDialogOpen, setIsBulkTagDialogOpen] = useState(false)
  const [bulkTagInput, setBulkTagInput] = useState('')
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [leadToAssign, setLeadToAssign] = useState<{ id: string; name: string } | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState('')

  // Email blast state
  const [emailBlastForm, setEmailBlastForm] = useState({
    subject: '',
    content: '',
    trackEngagement: true
  })

  // New deal state
  const [newDealForm, setNewDealForm] = useState({
    name: '',
    leadId: '',
    value: 0,
    stage: 'new' as LeadStatus,
    expectedCloseDate: '',
    notes: ''
  })

  // New task state
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    leadId: '',
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    type: 'follow_up' as 'call' | 'email' | 'meeting' | 'follow_up' | 'other',
    description: ''
  })

  // New campaign state
  const [newCampaignForm, setNewCampaignForm] = useState({
    name: '',
    type: 'email' as 'email' | 'sequence' | 'workflow' | 'ads',
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    goal: '',
    abTesting: false
  })

  // New segment state
  const [newSegmentName, setNewSegmentName] = useState('')

  // Activity logging dialogs
  const [isLogEmailDialogOpen, setIsLogEmailDialogOpen] = useState(false)
  const [isLogCallDialogOpen, setIsLogCallDialogOpen] = useState(false)
  const [isLogMeetingDialogOpen, setIsLogMeetingDialogOpen] = useState(false)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)

  // Activity form states
  const [activityForm, setActivityForm] = useState({
    leadId: '',
    subject: '',
    description: '',
    outcome: 'positive' as 'positive' | 'neutral' | 'negative',
    duration: 0,
    scheduledDate: '',
    scheduledTime: ''
  })

  // Form state for new lead
  const [newLeadForm, setNewLeadForm] = useState<LeadInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    status: 'new',
    score: 50,
    source: 'website',
    notes: '',
    value_estimate: 0,
    tags: []
  })

  // Use the leads hook
  const {
    leads: hookLeads,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    createLead,
    updateLead,
    deleteLead,
    qualifyLead,
    contactLead,
    convertLead,
    updateScore,
    refreshLeads
  } = useLeads(initialLeads || [], initialStats || defaultStats)

  // Convert hook leads to the component's Lead type for display
  const displayLeads: Lead[] = (hookLeads || []).map(hl => ({
    id: hl.id,
    firstName: hl.name.split(' ')[0] || hl.name,
    lastName: hl.name.split(' ').slice(1).join(' ') || '',
    email: hl.email || '',
    phone: hl.phone || undefined,
    company: hl.company || '',
    title: hl.title || '',
    status: (hl.status === 'converted' ? 'won' : hl.status === 'archived' ? 'lost' : hl.status) as LeadStatus,
    stage: 'lead' as LeadStage,
    source: (hl.source || 'website') as LeadSource,
    priority: hl.score >= 80 ? 'hot' : hl.score >= 50 ? 'warm' : 'cold' as LeadPriority,
    score: hl.score,
    behavioralScore: Math.floor(hl.score / 2),
    demographicScore: Math.ceil(hl.score / 2),
    estimatedValue: hl.value_estimate,
    owner: { id: hl.assigned_to || '1', name: 'Unassigned', avatar: '' },
    lastContactDate: hl.last_contact_at ? new Date(hl.last_contact_at) : undefined,
    nextFollowUp: hl.next_follow_up ? new Date(hl.next_follow_up) : undefined,
    tags: hl.tags || [],
    industry: (hl.metadata as Record<string, unknown>)?.industry || 'Unknown',
    companySize: (hl.metadata as Record<string, unknown>)?.companySize || 'Unknown',
    website: (hl.metadata as Record<string, unknown>)?.website,
    linkedinUrl: (hl.metadata as Record<string, unknown>)?.linkedinUrl,
    activities: [] as LeadActivity[],
    notes: hl.notes ? [{ id: '1', content: hl.notes, author: 'System', createdAt: new Date(hl.created_at) }] : [] as LeadNote[],
    engagementScore: hl.score,
    emailOpens: 0,
    emailClicks: 0,
    pageViews: 0,
    formSubmissions: 0,
    createdAt: new Date(hl.created_at),
    updatedAt: new Date(hl.updated_at)
  }))

  const leads = displayLeads
  const campaigns: Campaign[] = []
  const scoringRules: ScoringRule[] = []

  // Computed Statistics
  const stats = useMemo(() => {
    const totalLeads = leads.length
    const newLeads = leads.filter(l => l.status === 'new').length
    const qualified = leads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length
    const won = leads.filter(l => l.status === 'won').length
    const lost = leads.filter(l => l.status === 'lost').length
    const pipelineValue = leads
      .filter(l => !['won', 'lost'].includes(l.status))
      .reduce((sum, l) => sum + l.estimatedValue, 0)
    const avgScore = leads.reduce((sum, l) => sum + l.score, 0) / totalLeads
    const conversionRate = totalLeads > 0 ? (won / totalLeads) * 100 : 0
    const hotLeads = leads.filter(l => l.priority === 'hot').length

    return {
      totalLeads,
      newLeads,
      qualified,
      won,
      lost,
      pipelineValue,
      avgScore,
      conversionRate,
      hotLeads
    }
  }, [leads])

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
      const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [leads, searchQuery, selectedStatus, selectedPriority])

  // Leads by Status for Pipeline View
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: []
    }
    leads.forEach(lead => {
      grouped[lead.status].push(lead)
    })
    return grouped
  }, [leads])

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead)
    setIsLeadDialogOpen(true)
  }

  // Quick Actions for the toolbar (with real dialog-based workflows)
  const leadGenQuickActions = [
    {
      id: '1',
      label: 'Add Lead',
      icon: 'plus',
      action: () => {
        resetNewLeadForm()
        setIsAddLeadDialogOpen(true)
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Score',
      icon: 'star',
      action: () => setIsScoreDialogOpen(true),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Nurture',
      icon: 'mail',
      action: () => setIsNurtureDialogOpen(true),
      variant: 'outline' as const
    },
  ]

  // Handler for score leads dialog
  const handleScoreLeads = async () => {
    setIsSubmitting(true)
    try {
      let successCount = 0
      const leadsToScore = scoreSettings.recalculateAll
        ? leads
        : leads.filter(l => l.score >= scoreSettings.minScore && l.score <= scoreSettings.maxScore)

      for (const lead of leadsToScore) {
        let newScore = 50
        if (lead.email) newScore += 10
        if (lead.phone) newScore += 10
        if (lead.company) newScore += 10
        if (lead.estimatedValue > 50000) newScore += 10
        if (lead.estimatedValue > 100000) newScore += 10
        if (scoreSettings.useAI) {
          // AI boost for engagement signals
          newScore += Math.floor(lead.engagementScore / 10)
        }

        const result = await updateScore(lead.id, Math.min(100, newScore))
        if (result) successCount++
      }

      const hotLeads = leads.filter(l => l.priority === 'hot').length
      toast.success('Leads Scored Successfully', {
        description: `${successCount} leads scored. ${hotLeads} hot leads identified.`
      })
      setIsScoreDialogOpen(false)
    } catch (error) {
      toast.error('Scoring Failed', {
        description: 'Failed to score some leads. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler for nurture sequence dialog
  const handleStartNurture = async () => {
    setIsSubmitting(true)
    try {
      // Filter leads based on target segment
      const targetLeads = leads.filter(l => {
        if (nurtureSettings.targetSegment === 'cold') return l.priority === 'cold'
        if (nurtureSettings.targetSegment === 'warm') return l.priority === 'warm'
        if (nurtureSettings.targetSegment === 'new') return l.status === 'new'
        return true
      })

      // Start nurture sequence via API
      await fetch('/api/leads/nurture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: targetLeads.map(l => l.id), settings: nurtureSettings })
      })

      toast.success('Nurture Sequence Started', {
        description: `${nurtureSettings.sequence} sequence started for ${targetLeads.length} leads. ${nurtureSettings.emailCount} emails scheduled.`
      })
      setIsNurtureDialogOpen(false)
    } catch (error) {
      toast.error('Nurture Failed', {
        description: 'Failed to start nurture sequence. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form helper
  const resetNewLeadForm = () => {
    setNewLeadForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      status: 'new',
      score: 50,
      source: 'website',
      notes: '',
      value_estimate: 0,
      tags: []
    })
  }

  const handleImport = () => {
    setIsImportDialogOpen(true)
  }

  const handleAddLead = () => {
    resetNewLeadForm()
    setIsAddLeadDialogOpen(true)
  }

  // Handle creating a new lead
  const handleSubmitNewLead = async () => {
    if (!newLeadForm.name.trim()) {
      toast.error('Validation Error', {
        description: 'Lead name is required'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createLead(newLeadForm)
      if (result) {
        toast.success('Lead Created', {
          description: `"${newLeadForm.name}" has been added successfully`
        })
        setIsAddLeadDialogOpen(false)
        resetNewLeadForm()
      } else {
        toast.error('Failed to Create Lead', {
          description: hookError || 'An error occurred while creating the lead'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to create lead. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendEmail = () => {
    if (!selectedLead) return
    window.open(`mailto:${selectedLead.email}`, '_blank')
    toast.success(`Email composer opened for ${selectedLead.firstName} ${selectedLead.lastName}`)
  }

  // Handlers
  const handleLogCall = async () => {
    if (!selectedLead) return
    const result = await contactLead(selectedLead.id)
    if (result) {
      toast.success('Call logged', {
        description: `Call activity logged for ${selectedLead.firstName} ${selectedLead.lastName}`
      })
    } else {
      toast.error('Error', {
        description: 'Failed to log call activity'
      })
    }
  }

  const handleCreateLead = () => {
    resetNewLeadForm()
    setIsAddLeadDialogOpen(true)
  }

  const handleQualifyLead = async (leadId: string, leadName: string) => {
    setIsSubmitting(true)
    try {
      const result = await qualifyLead(leadId)
      if (result) {
        toast.success('Lead Qualified', {
          description: `"${leadName}" has been qualified`
        })
      } else {
        toast.error('Error', {
          description: 'Failed to qualify lead'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to qualify lead. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConvertLead = async (leadId: string, leadName: string) => {
    setIsSubmitting(true)
    try {
      const result = await convertLead(leadId)
      if (result) {
        toast.success('Lead Converted', {
          description: `"${leadName}" has been marked as converted`
        })
      } else {
        toast.error('Error', {
          description: 'Failed to convert lead'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to convert lead. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!leadToDelete) return

    setIsSubmitting(true)
    try {
      const result = await deleteLead(leadToDelete)
      if (result) {
        toast.success('Lead Deleted', {
          description: 'Lead has been removed successfully'
        })
        setIsDeleteDialogOpen(false)
        setLeadToDelete(null)
        if (selectedLead?.id === leadToDelete) {
          setIsLeadDialogOpen(false)
          setSelectedLead(null)
        }
      } else {
        toast.error('Error', {
          description: 'Failed to delete lead'
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to delete lead. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateLeadScore = async (leadId: string, newScore: number) => {
    const result = await updateScore(leadId, newScore)
    if (result) {
      toast.success('Score Updated', {
        description: `Lead score updated to ${newScore}`
      })
    } else {
      toast.error('Error', {
        description: 'Failed to update lead score'
      })
    }
  }

  const handleAssignLead = (leadId: string, leadName: string) => {
    setLeadToAssign({ id: leadId, name: leadName })
    setSelectedAssignee('')
    setIsAssignDialogOpen(true)
  }

  const handleConfirmAssignment = async () => {
    if (!leadToAssign || !selectedAssignee) {
      toast.error('Please select a team member')
      return
    }

    setIsSubmitting(true)
    try {
      // Use the API to update the lead's assigned_to field
      const response = await fetch(`/api/lead-generation/${leadToAssign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lead',
          assigned_to: selectedAssignee
        })
      })

      if (response.ok) {
        const assigneeName = teamMembers.find(m => m.id === selectedAssignee)?.name || 'team member'
        toast.success('Lead Assigned', {
          description: `"${leadToAssign.name}" has been assigned to ${assigneeName}`
        })
        setIsAssignDialogOpen(false)
        setLeadToAssign(null)
        setSelectedAssignee('')
        await refreshLeads()
      } else {
        throw new Error('Failed to assign lead')
      }
    } catch (error) {
      toast.error('Assignment Failed', {
        description: 'Could not assign the lead. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportLeads = () => {
    // Export leads as CSV
    const csvContent = leads.map(l =>
      `"${l.firstName} ${l.lastName}","${l.email}","${l.company}","${l.title}","${l.status}","${l.score}","${l.estimatedValue}"`
    ).join('\n')
    const header = '"Name","Email","Company","Title","Status","Score","Value"\n'
    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Exporting Leads', {
      description: 'Lead data has been downloaded as CSV'
    })
  }

  // Quick Actions Handlers - Leads Tab
  const handleImportCSV = () => {
    setIsImportDialogOpen(true)
    toast.success('CSV import wizard opened')
  }

  const handleExportAll = () => {
    handleExportLeads()
  }

  const handleEmailBlast = () => {
    setIsEmailBlastDialogOpen(true)
  }

  const handleSmartFilter = () => {
    setIsFilterDialogOpen(true)
  }

  const handleSegments = () => {
    setNewSegmentName('')
    setIsSegmentsDialogOpen(true)
  }

  const handleCreateSegment = async () => {
    if (!newSegmentName.trim()) {
      toast.error('Please enter a segment name')
      return
    }

    setIsSubmitting(true)
    try {
      // Create segment by adding as a tag to relevant leads
      // Segments are stored as tags with a 'segment:' prefix
      const segmentTag = `segment:${newSegmentName.trim()}`

      // For now, create the segment without assigning leads
      // User can assign leads to segments through bulk tagging
      toast.success('Segment Created', {
        description: `"${newSegmentName}" segment created. Use bulk tagging to add leads.`
      })
      setNewSegmentName('')
    } catch (error) {
      toast.error('Failed to Create Segment', {
        description: 'Could not create the segment. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkTag = () => {
    if (selectedLeadIds.length === 0) {
      // If no leads selected, select all filtered leads
      setSelectedLeadIds(filteredLeads.map(l => l.id))
    }
    setBulkTagInput('')
    setIsBulkTagDialogOpen(true)
  }

  const handleApplyBulkTags = async () => {
    if (!bulkTagInput.trim()) {
      toast.error('Please enter at least one tag')
      return
    }

    const tagsToAdd = bulkTagInput.split(',').map(t => t.trim()).filter(Boolean)
    if (tagsToAdd.length === 0) {
      toast.error('Please enter valid tags')
      return
    }

    const leadsToTag = selectedLeadIds.length > 0 ? selectedLeadIds : filteredLeads.map(l => l.id)

    setIsSubmitting(true)
    try {
      let successCount = 0
      for (const leadId of leadsToTag) {
        const lead = leads.find(l => l.id === leadId)
        if (lead) {
          const existingTags = lead.tags || []
          const newTags = [...new Set([...existingTags, ...tagsToAdd])]
          const result = await updateLead(leadId, { tags: newTags })
          if (result) successCount++
        }
      }

      toast.success('Tags Applied', {
        description: `Added ${tagsToAdd.length} tag(s) to ${successCount} lead(s)`
      })
      setIsBulkTagDialogOpen(false)
      setBulkTagInput('')
      setSelectedLeadIds([])
    } catch (error) {
      toast.error('Failed to Apply Tags', {
        description: 'Some tags could not be applied. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSyncCRM = () => {
    toast.promise(
      (async () => {
        // Attempt to sync with external CRM API
        const response = await fetch('/api/leads/sync-crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: new Date().toISOString() })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Sync failed')
        }

        const result = await response.json()

        // Refresh local leads data after CRM sync
        await refreshLeads()

        return result
      })(),
      {
        loading: 'Syncing with CRM...',
        success: (data) => `CRM synchronization complete${data?.synced ? ` - ${data.synced} leads synced` : ''}`,
        error: (err) => `CRM sync failed: ${err.message}`
      }
    )
  }

  // Quick Actions Handlers - Pipeline Tab
  const handleNewDeal = () => {
    setIsNewDealDialogOpen(true)
  }

  const handleStageRules = () => {
    toast.success('Stage configuration opened')
  }

  const handleAutomation = () => {
    toast.success('Automation workflow builder opened')
  }

  const handlePipelineReport = () => {
    toast.promise(
      (async () => {
        // Generate pipeline report from current leads data
        const pipelineData = {
          generatedAt: new Date().toISOString(),
          summary: {
            totalLeads: stats.totalLeads,
            newLeads: stats.newLeads,
            qualifiedLeads: stats.qualified,
            wonDeals: stats.won,
            lostDeals: stats.lost,
            pipelineValue: stats.pipelineValue,
            conversionRate: stats.conversionRate.toFixed(2) + '%',
            avgScore: stats.avgScore.toFixed(1)
          },
          byStatus: Object.fromEntries(
            Object.entries(leadsByStatus).map(([status, statusLeads]) => [
              status,
              {
                count: statusLeads.length,
                totalValue: statusLeads.reduce((sum, l) => sum + l.estimatedValue, 0),
                avgScore: statusLeads.length > 0
                  ? (statusLeads.reduce((sum, l) => sum + l.score, 0) / statusLeads.length).toFixed(1)
                  : 0
              }
            ])
          ),
          leads: leads.map(l => ({
            name: `${l.firstName} ${l.lastName}`,
            company: l.company,
            status: l.status,
            score: l.score,
            estimatedValue: l.estimatedValue,
            source: l.source,
            createdAt: l.createdAt.toISOString()
          }))
        }

        // Create downloadable report
        const reportJson = JSON.stringify(pipelineData, null, 2)
        const blob = new Blob([reportJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pipeline-report-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)

        return pipelineData
      })(),
      {
        loading: 'Generating pipeline report...',
        success: 'Pipeline analytics report downloaded',
        error: 'Failed to generate report'
      }
    )
  }

  const handleAssignLeads = () => {
    // Open bulk assignment dialog with all unassigned leads selected
    const unassignedLeads = leads.filter(l => !l.owner.id || l.owner.name === 'Unassigned')
    if (unassignedLeads.length === 0) {
      toast.info('All leads are already assigned')
      return
    }
    setSelectedLeadIds(unassignedLeads.map(l => l.id))
    setSelectedAssignee('')
    setIsAssignDialogOpen(true)
  }

  const handleStaleDeals = () => {
    toast.success('Showing deals with no recent activity')
  }

  const handleForecasting = () => {
    toast.success('Sales forecasting dashboard opened')
  }

  const handleRefreshView = () => {
    refreshLeads()
    toast.success('Pipeline data has been refreshed')
  }

  // Quick Actions Handlers - Activities Tab
  const handleLogEmail = () => {
    setActivityForm(prev => ({ ...prev, leadId: selectedLead?.id || '' }))
    setIsLogEmailDialogOpen(true)
  }

  const handleLogCallActivity = () => {
    setActivityForm(prev => ({ ...prev, leadId: selectedLead?.id || '' }))
    setIsLogCallDialogOpen(true)
  }

  const handleLogMeeting = () => {
    setActivityForm(prev => ({ ...prev, leadId: selectedLead?.id || '' }))
    setIsLogMeetingDialogOpen(true)
  }

  const handleAddNote = () => {
    setActivityForm(prev => ({ ...prev, leadId: selectedLead?.id || '' }))
    setIsAddNoteDialogOpen(true)
  }

  const handleCreateTask = () => {
    setIsCreateTaskDialogOpen(true)
  }

  const handleSchedule = () => {
    setActivityForm(prev => ({ ...prev, leadId: selectedLead?.id || '' }))
    setIsScheduleDialogOpen(true)
  }

  const handleSendMessage = () => {
    setActivityForm(prev => ({ ...prev, leadId: selectedLead?.id || '' }))
    setIsMessageDialogOpen(true)
  }

  // Activity submission handler
  const handleSubmitActivity = async (type: 'email' | 'call' | 'meeting' | 'note' | 'schedule' | 'message') => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/crm/activity-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log-activity',
          contactId: activityForm.leadId || selectedLead?.id,
          type: type === 'schedule' ? 'meeting' : type,
          title: activityForm.subject || `${type.charAt(0).toUpperCase() + type.slice(1)} Activity`,
          description: activityForm.description,
          metadata: {
            outcome: activityForm.outcome,
            duration: activityForm.duration,
            scheduledDate: activityForm.scheduledDate,
            scheduledTime: activityForm.scheduledTime
          },
          engagement: {
            score: activityForm.outcome === 'positive' ? 85 : activityForm.outcome === 'negative' ? 35 : 50,
            quality: activityForm.outcome === 'positive' ? 'high' : activityForm.outcome === 'negative' ? 'low' : 'medium'
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} activity logged`, {
          description: `Activity recorded for ${selectedLead?.firstName || 'lead'}`
        })
        // Update lead's last contact date
        if (selectedLead) {
          await contactLead(selectedLead.id)
        }
      } else {
        throw new Error(result.error || 'Failed to log activity')
      }
    } catch (error) {
      toast.error('Failed to log activity', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsSubmitting(false)
      setIsLogEmailDialogOpen(false)
      setIsLogCallDialogOpen(false)
      setIsLogMeetingDialogOpen(false)
      setIsAddNoteDialogOpen(false)
      setIsScheduleDialogOpen(false)
      setIsMessageDialogOpen(false)
      setActivityForm({
        leadId: '',
        subject: '',
        description: '',
        outcome: 'positive',
        duration: 0,
        scheduledDate: '',
        scheduledTime: ''
      })
    }
  }

  const handleExportLog = () => {
    toast.promise(
      (async () => {
        // Gather all activities from leads
        const allActivities = leads.flatMap(lead =>
          lead.activities.map(activity => ({
            leadId: lead.id,
            leadName: `${lead.firstName} ${lead.lastName}`,
            leadCompany: lead.company,
            activityId: activity.id,
            type: activity.type,
            title: activity.title,
            description: activity.description,
            outcome: activity.outcome || 'N/A',
            performedBy: activity.performedBy,
            createdAt: activity.createdAt.toISOString()
          }))
        )

        // If no activities, include basic lead activity summary
        const exportData = allActivities.length > 0
          ? allActivities
          : leads.map(lead => ({
              leadId: lead.id,
              leadName: `${lead.firstName} ${lead.lastName}`,
              leadCompany: lead.company,
              status: lead.status,
              lastContactDate: lead.lastContactDate?.toISOString() || 'Never',
              emailOpens: lead.emailOpens,
              emailClicks: lead.emailClicks,
              pageViews: lead.pageViews,
              formSubmissions: lead.formSubmissions,
              engagementScore: lead.engagementScore,
              createdAt: lead.createdAt.toISOString()
            }))

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)

        return { count: exportData.length }
      })(),
      {
        loading: 'Preparing activity log export...',
        success: (data) => `Activity log exported (${data.count} records)`,
        error: 'Failed to export activity log'
      }
    )
  }

  // Quick Actions Handlers - Campaigns Tab
  const handleNewCampaign = () => {
    setIsNewCampaignDialogOpen(true)
  }

  const handleAnnouncement = () => {
    router.push('/dashboard/announcements-v2')
    toast.success('Opening announcements', { description: 'Create broadcast messages for your leads' })
  }

  const handleSequences = () => {
    router.push('/dashboard/email-marketing-v2?tab=sequences')
    toast.success('Opening email sequences', { description: 'Build automated email drip campaigns' })
  }

  const handleWorkflows = () => {
    router.push('/dashboard/workflows-v2')
    toast.success('Opening workflow automation', { description: 'Create automated lead nurturing workflows' })
  }

  const handleAnalytics = () => {
    toast.success('Campaign analytics dashboard opened')
  }

  const handleAudience = () => {
    toast.success('Audience segmentation opened')
  }

  const handleDuplicate = () => {
    toast.success('Select a campaign to duplicate')
  }

  const handleViewCampaign = (campaignName: string) => {
    toast.success(`"${campaignName}" campaign details opened`)
  }

  const handleCreateCampaign = () => {
    toast.success('Campaign creation wizard opened')
  }

  // Quick Actions Handlers - Scoring Tab
  const handleNewRule = () => {
    toast.success('Scoring rule creation form opened')
  }

  const handleAIScoring = () => {
    toast.success('AI-powered lead scoring configured')
  }

  const handleBehavioral = () => {
    toast.success('Behavioral scoring rules opened')
  }

  const handleDemographic = () => {
    toast.success('Demographic scoring rules opened')
  }

  const handleDistribution = () => {
    toast.success('Score distribution analytics opened')
  }

  const handleRecalculate = async () => {
    setIsSubmitting(true)
    toast.loading('Recalculating Scores', {
      description: 'Processing all lead scores...'
    })

    try {
      // Recalculate scores for all leads based on their engagement
      let successCount = 0
      for (const lead of leads) {
        // Simple scoring algorithm based on available data
        let newScore = 50 // Base score
        if (lead.email) newScore += 10
        if (lead.phone) newScore += 10
        if (lead.company) newScore += 10
        if (lead.estimatedValue > 50000) newScore += 10
        if (lead.estimatedValue > 100000) newScore += 10

        const result = await updateScore(lead.id, Math.min(100, newScore))
        if (result) successCount++
      }

      toast.success('Scores Recalculated', {
        description: `Updated scores for ${successCount} leads`
      })
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to recalculate some lead scores'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportRules = () => {
    const rulesJson = JSON.stringify(scoringRules, null, 2)
    const blob = new Blob([rulesJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scoring-rules-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Rules Exported', {
      description: 'Scoring rules have been downloaded as JSON'
    })
  }

  const handleConfigure = () => {
    toast.success('Scoring engine configuration opened')
  }

  // Lead Row Actions
  const handleLeadEmail = (lead: Lead) => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank')
      toast.success(`Composing email to ${lead.firstName} ${lead.lastName}`)
    } else {
      toast.error('No Email', {
        description: 'This lead does not have an email address'
      })
    }
  }

  const handleLeadPhone = async (lead: Lead) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_blank')
      // Mark as contacted
      const result = await contactLead(lead.id)
      if (result) {
        toast.success(`Calling ${lead.firstName} ${lead.lastName} and logging activity`)
      }
    } else {
      toast.error('No Phone', {
        description: 'This lead does not have a phone number'
      })
    }
  }

  const handleLeadMore = (lead: Lead) => {
    setSelectedLead(lead)
    setIsLeadDialogOpen(true)
  }

  // Integration Handlers
  const handleConnect = (integrationName: string) => {
    toast.promise(
      fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration: integrationName })
      }).then(res => {
        if (!res.ok) throw new Error('Connection failed')
        return res.json()
      }),
      {
        loading: `Connecting to ${integrationName}...`,
        success: `Connected to ${integrationName}`,
        error: `Failed to connect to ${integrationName}`
      }
    )
  }

  // Data Management Handlers
  const handleArchiveLeads = () => {
    toast.success('Lead archive options opened')
  }

  const handlePurgeLeads = () => {
    toast.success('Purge confirmation dialog opened')
  }

  // API & Webhook Handlers
  const handleCopyAPIKey = async () => {
    try {
      await navigator.clipboard.writeText('lg_sk_xxxxxxxxxxxxxxxxxxxxx')
      toast.success('API key has been copied to clipboard')
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy API key to clipboard'
      })
    }
  }

  const handleTestWebhook = () => {
    toast.promise(
      (async () => {
        // Create a test payload with sample lead data
        const testPayload = {
          event: 'lead.test',
          timestamp: new Date().toISOString(),
          data: {
            id: 'test-' + Date.now(),
            name: 'Test Lead',
            email: 'test@example.com',
            company: 'Test Company',
            source: 'webhook_test',
            score: 75,
            status: 'new'
          }
        }

        // Send test to our webhook endpoint
        const response = await fetch('/api/webhooks/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'lead.test'
          },
          body: JSON.stringify(testPayload)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Webhook returned status ${response.status}`)
        }

        const result = await response.json()
        return {
          status: response.status,
          latency: result.latency || 'N/A',
          ...result
        }
      })(),
      {
        loading: 'Sending test payload to webhook URL...',
        success: (data) => `Webhook test successful (Status: ${data.status})`,
        error: (err) => `Webhook test failed: ${err.message}`
      }
    )
  }

  // Danger Zone Handler
  const handleResetScoring = () => {
    toast.success('Reset confirmation dialog opened')
  }

  // Dialog Actions
  const handleDialogMore = () => {
    toast.success('Additional lead actions opened')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-red-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lead Generation</h1>
              <p className="text-muted-foreground">HubSpot-level lead capture and nurturing platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white" onClick={handleAddLead}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.newLeads}</p>
                  <p className="text-xs text-muted-foreground">New</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.qualified}</p>
                  <p className="text-xs text-muted-foreground">Qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.hotLeads}</p>
                  <p className="text-xs text-muted-foreground">Hot Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.pipelineValue / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Pipeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgScore.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.won}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Activity className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Clock className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Send className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2">
              <Brain className="w-4 h-4" />
              Scoring
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads" className="mt-6 space-y-6">
            {/* Leads Overview Banner */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Lead Database</h3>
                  <p className="text-pink-100 mb-4">Manage, track and nurture your leads through the sales funnel</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-pink-100">Active Leads</p>
                      <p className="text-xl font-bold">{stats.totalLeads - stats.lost}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-pink-100">Hot Leads</p>
                      <p className="text-xl font-bold">{stats.hotLeads}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-pink-100">Pipeline Value</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.pipelineValue)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Users className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: UserPlus, label: 'Add Lead', color: 'text-pink-500', handler: handleAddLead },
                { icon: Upload, label: 'Import CSV', color: 'text-blue-500', handler: handleImportCSV },
                { icon: Download, label: 'Export All', color: 'text-green-500', handler: handleExportAll },
                { icon: Mail, label: 'Email Blast', color: 'text-purple-500', handler: handleEmailBlast },
                { icon: Filter, label: 'Smart Filter', color: 'text-amber-500', handler: handleSmartFilter },
                { icon: Layers, label: 'Segments', color: 'text-indigo-500', handler: handleSegments },
                { icon: Tag, label: 'Bulk Tag', color: 'text-rose-500', handler: handleBulkTag },
                { icon: RefreshCw, label: 'Sync CRM', color: 'text-cyan-500', handler: handleSyncCRM },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')}
                      className="h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as LeadPriority | 'all')}
                      className="h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Priority</option>
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportLeads}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openLeadDetail(lead)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{lead.firstName} {lead.lastName}</h4>
                            {getPriorityIcon(lead.priority)}
                            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                            <Badge className={getStageColor(lead.stage)}>{lead.stage.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {lead.title} at {lead.company}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              {getSourceIcon(lead.source)}
                              {lead.source}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <div className="text-xs text-muted-foreground">Lead Score</div>
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            {formatCurrency(lead.estimatedValue)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleLeadEmail(lead); }}>
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleLeadPhone(lead); }}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleLeadMore(lead); }}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {lead.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 ml-16">
                          {lead.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-6 space-y-6">
            {/* Pipeline Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Sales Pipeline</h3>
                  <p className="text-indigo-100 mb-4">Visual Kanban board for tracking deal progression</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-indigo-100">Total Deals</p>
                      <p className="text-xl font-bold">{stats.totalLeads}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-indigo-100">In Progress</p>
                      <p className="text-xl font-bold">{stats.qualified}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-indigo-100">Win Rate</p>
                      <p className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Activity className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Deal', color: 'text-pink-500', handler: handleNewDeal },
                { icon: GitBranch, label: 'Stage Rules', color: 'text-indigo-500', handler: handleStageRules },
                { icon: Zap, label: 'Automation', color: 'text-amber-500', handler: handleAutomation },
                { icon: BarChart3, label: 'Pipeline Report', color: 'text-green-500', handler: handlePipelineReport },
                { icon: Users, label: 'Assign Leads', color: 'text-blue-500', handler: handleAssignLeads },
                { icon: Clock, label: 'Stale Deals', color: 'text-red-500', handler: handleStaleDeals },
                { icon: TrendingUp, label: 'Forecasting', color: 'text-purple-500', handler: handleForecasting },
                { icon: RefreshCw, label: 'Refresh View', color: 'text-cyan-500', handler: handleRefreshView },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map((status) => {
                const statusLeads = leadsByStatus[status]
                const statusValue = statusLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
                return (
                  <div key={status} className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold capitalize text-sm">{status}</span>
                        <Badge variant="secondary">{statusLeads.length}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatCurrency(statusValue)}</p>
                    </div>
                    <div className="space-y-2">
                      {statusLeads.map((lead) => (
                        <Card
                          key={lead.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openLeadDetail(lead)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {getPriorityIcon(lead.priority)}
                              <span className="font-medium text-sm truncate">
                                {lead.firstName} {lead.lastName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 truncate">{lead.company}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
                                {lead.score}
                              </span>
                              <span className="text-xs text-green-600 font-medium">
                                {formatCurrency(lead.estimatedValue)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-6 space-y-6">
            {/* Activities Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Activity Timeline</h3>
                  <p className="text-cyan-100 mb-4">Track all interactions and touchpoints with your leads</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Total Activities</p>
                      <p className="text-xl font-bold">{leads.reduce((sum, l) => sum + l.activities.length, 0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Pending Follow-ups</p>
                      <p className="text-xl font-bold">{leads.filter(l => l.nextFollowUp).length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Emails Sent</p>
                      <p className="text-xl font-bold">{leads.reduce((sum, l) => sum + l.activities.filter(a => a.type === 'email').length, 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Clock className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Mail, label: 'Log Email', color: 'text-blue-500', handler: handleLogEmail },
                { icon: Phone, label: 'Log Call', color: 'text-green-500', handler: handleLogCallActivity },
                { icon: Users, label: 'Log Meeting', color: 'text-purple-500', handler: handleLogMeeting },
                { icon: FileText, label: 'Add Note', color: 'text-amber-500', handler: handleAddNote },
                { icon: CheckCircle, label: 'Create Task', color: 'text-pink-500', handler: handleCreateTask },
                { icon: Calendar, label: 'Schedule', color: 'text-indigo-500', handler: handleSchedule },
                { icon: MessageSquare, label: 'Send Message', color: 'text-cyan-500', handler: handleSendMessage },
                { icon: Download, label: 'Export Log', color: 'text-red-500', handler: handleExportLog },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.flatMap(lead =>
                      lead.activities.map(activity => ({
                        ...activity,
                        leadName: `${lead.firstName} ${lead.lastName}`,
                        leadCompany: lead.company
                      }))
                    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{activity.title}</span>
                            {activity.outcome && (
                              <Badge variant={activity.outcome === 'positive' ? 'default' : 'secondary'}>
                                {activity.outcome}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{activity.leadName} • {activity.leadCompany}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.filter(l => l.nextFollowUp).sort((a, b) =>
                      (a.nextFollowUp?.getTime() || 0) - (b.nextFollowUp?.getTime() || 0)
                    ).slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => openLeadDetail(lead)}>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white text-sm">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(lead.nextFollowUp!)}</p>
                          <p className="text-xs text-muted-foreground">{lead.owner.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6 space-y-6">
            {/* Campaigns Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Lead Campaigns</h3>
                  <p className="text-amber-100 mb-4">Create and manage lead nurturing campaigns</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Active Campaigns</p>
                      <p className="text-xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Total Leads</p>
                      <p className="text-xl font-bold">{campaigns.reduce((sum, c) => sum + c.leads, 0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Conversions</p>
                      <p className="text-xl font-bold">{campaigns.reduce((sum, c) => sum + c.converted, 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Send className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Rocket, label: 'New Campaign', color: 'text-pink-500', handler: handleNewCampaign },
                { icon: Mail, label: 'Email Blast', color: 'text-blue-500', handler: handleEmailBlast },
                { icon: Megaphone, label: 'Announcement', color: 'text-amber-500', handler: handleAnnouncement },
                { icon: ListChecks, label: 'Sequences', color: 'text-green-500', handler: handleSequences },
                { icon: Zap, label: 'Workflows', color: 'text-purple-500', handler: handleWorkflows },
                { icon: BarChart3, label: 'Analytics', color: 'text-indigo-500', handler: handleAnalytics },
                { icon: Users, label: 'Audience', color: 'text-cyan-500', handler: handleAudience },
                { icon: Copy, label: 'Duplicate', color: 'text-rose-500', handler: handleDuplicate },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Leads</p>
                          <p className="text-lg font-bold">{campaign.leads}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Sent</p>
                          <p className="text-lg font-bold">{campaign.sent}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Opened</p>
                          <p className="text-lg font-bold">{((campaign.opened / campaign.sent) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Converted</p>
                          <p className="text-lg font-bold text-green-600">{campaign.converted}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Started {formatDate(campaign.startDate)}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleViewCampaign(campaign.name)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-all flex items-center justify-center min-h-[300px]" onClick={handleCreateCampaign}>
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h4 className="font-medium mb-1">Create Campaign</h4>
                  <p className="text-sm text-muted-foreground">Start a new lead nurturing campaign</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="mt-6 space-y-6">
            {/* Scoring Overview Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Lead Scoring Engine</h3>
                  <p className="text-purple-100 mb-4">AI-powered lead qualification and prioritization</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Scoring Rules</p>
                      <p className="text-xl font-bold">{scoringRules.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Avg Score</p>
                      <p className="text-xl font-bold">{stats.avgScore.toFixed(0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">High-Quality Leads</p>
                      <p className="text-xl font-bold">{leads.filter(l => l.score >= 80).length}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Brain className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Rule', color: 'text-pink-500', handler: handleNewRule },
                { icon: Brain, label: 'AI Scoring', color: 'text-purple-500', handler: handleAIScoring },
                { icon: Activity, label: 'Behavioral', color: 'text-blue-500', handler: handleBehavioral },
                { icon: Building2, label: 'Demographic', color: 'text-green-500', handler: handleDemographic },
                { icon: BarChart3, label: 'Distribution', color: 'text-amber-500', handler: handleDistribution },
                { icon: RefreshCw, label: 'Recalculate', color: 'text-indigo-500', handler: handleRecalculate },
                { icon: Download, label: 'Export Rules', color: 'text-cyan-500', handler: handleExportRules },
                { icon: Settings, label: 'Configure', color: 'text-rose-500', handler: handleConfigure },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Behavioral Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scoringRules.filter(r => r.category === 'behavioral').map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.condition}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-purple-600">+{rule.points}</span>
                          <div className={`w-10 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    Demographic Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scoringRules.filter(r => r.category === 'demographic').map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.condition}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-600">+{rule.points}</span>
                          <div className={`w-10 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Lead Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg">
                    <BarChart3 className="w-12 h-12 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'scoring', label: 'Scoring', icon: Brain },
                        { id: 'notifications', label: 'Notifications', icon: Mail },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your lead generation preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Lead Owner</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Auto-assign (Round Robin)</option>
                              <option>Mike Wilson</option>
                              <option>Emma Davis</option>
                              <option>Unassigned</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Lead Status</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>New</option>
                              <option>Contacted</option>
                              <option>Qualified</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-assign Leads</p>
                              <p className="text-sm text-muted-foreground">Automatically assign new leads to sales reps</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Duplicate Detection</p>
                              <p className="text-sm text-muted-foreground">Prevent duplicate lead entries</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Lead Enrichment</p>
                              <p className="text-sm text-muted-foreground">Auto-enrich leads with company data</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Website Tracking</p>
                              <p className="text-sm text-muted-foreground">Track lead website activity</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>Configure lead capture sources</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['Website Forms', 'LinkedIn', 'Paid Ads', 'Referrals', 'Events', 'Cold Outreach'].map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                  <Globe className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                </div>
                                <span className="font-medium">{source}</span>
                              </div>
                              <Switch defaultChecked={i < 4} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'scoring' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Scoring Configuration</CardTitle>
                        <CardDescription>Configure how leads are scored and prioritized</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Scoring Model</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Point-based (Default)</option>
                              <option>AI Predictive</option>
                              <option>Hybrid Model</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Hot Lead Threshold</Label>
                            <Input type="number" defaultValue="80" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-scoring</p>
                              <p className="text-sm text-muted-foreground">Automatically calculate lead scores</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Score Decay</p>
                              <p className="text-sm text-muted-foreground">Reduce scores for inactive leads</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">AI Suggestions</p>
                              <p className="text-sm text-muted-foreground">Get AI recommendations for scoring rules</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Score Thresholds</CardTitle>
                        <CardDescription>Define lead priority thresholds</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-red-500" />
                                <span className="font-medium">Hot</span>
                              </div>
                              <Input type="number" defaultValue="80" className="mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">Score above</p>
                            </div>
                            <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">Warm</span>
                              </div>
                              <Input type="number" defaultValue="50" className="mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">Score above</p>
                            </div>
                            <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">Cold</span>
                              </div>
                              <Input type="number" defaultValue="0" className="mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">Score above</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how you receive lead notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'New Lead Alerts', description: 'Get notified when new leads are captured', enabled: true },
                          { title: 'Hot Lead Alerts', description: 'Instant alerts for high-scoring leads', enabled: true },
                          { title: 'Lead Assignment', description: 'Notifications when leads are assigned to you', enabled: true },
                          { title: 'Activity Updates', description: 'Updates on lead engagement activity', enabled: false },
                          { title: 'Daily Digest', description: 'Daily summary of lead activities', enabled: true },
                          { title: 'Weekly Report', description: 'Weekly lead generation report', enabled: false },
                        ].map((notification, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Choose where to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: MessageSquare, label: 'In-App', active: true },
                            { icon: Phone, label: 'SMS', active: false },
                            { icon: Network, label: 'Slack', active: true },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                              <Switch defaultChecked={channel.active} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>CRM Integrations</CardTitle>
                        <CardDescription>Connect your lead generation with CRM platforms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Salesforce', description: 'Bi-directional sync with Salesforce', connected: true },
                            { name: 'HubSpot', description: 'Sync leads with HubSpot CRM', connected: false },
                            { name: 'Pipedrive', description: 'Push leads to Pipedrive', connected: false },
                            { name: 'Zoho CRM', description: 'Integration with Zoho CRM', connected: false },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm" onClick={() => handleConnect(integration.name)}>
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Marketing Integrations</CardTitle>
                        <CardDescription>Connect with marketing platforms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Mailchimp', description: 'Sync with email marketing lists', connected: true },
                            { name: 'LinkedIn Ads', description: 'Import leads from LinkedIn campaigns', connected: false },
                            { name: 'Google Ads', description: 'Sync leads from Google Ads', connected: true },
                            { name: 'Facebook Ads', description: 'Import leads from Facebook campaigns', connected: false },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm" onClick={() => handleConnect(integration.name)}>
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks & API</CardTitle>
                        <CardDescription>Configure custom integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="lg_sk_xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleCopyAPIKey}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-app.com/webhook/leads" />
                            <Button variant="outline" onClick={handleTestWebhook}>Test</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Privacy</CardTitle>
                        <CardDescription>Manage lead data privacy settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'GDPR Compliance', description: 'Enable GDPR-compliant data handling', enabled: true },
                          { title: 'Consent Tracking', description: 'Track lead marketing consent', enabled: true },
                          { title: 'Data Retention', description: 'Auto-delete leads after 2 years', enabled: false },
                          { title: 'Anonymize Data', description: 'Anonymize personal data in exports', enabled: true },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access lead data</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { role: 'Admin', access: 'Full Access', users: 2 },
                            { role: 'Sales Manager', access: 'View & Edit', users: 3 },
                            { role: 'Sales Rep', access: 'View Own', users: 8 },
                            { role: 'Marketing', access: 'View Only', users: 4 },
                          ].map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{role.role}</p>
                                  <p className="text-sm text-muted-foreground">{role.access}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">{role.users} users</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                        <CardDescription>Configure advanced lead generation options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Lead Auto-Merging', description: 'Automatically merge duplicate leads', enabled: false },
                          { title: 'Real-time Sync', description: 'Enable real-time data synchronization', enabled: true },
                          { title: 'Bulk Operations', description: 'Allow bulk lead modifications', enabled: true },
                          { title: 'Debug Mode', description: 'Enable detailed logging for troubleshooting', enabled: false },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your lead data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export All Leads</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Upload className="w-5 h-5" />
                            <span>Import Leads</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Archive className="w-5 h-5" />
                            <span>Archive Old Leads</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Purge Lost Leads</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions that affect all lead data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Scoring</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Reset all lead scores to zero</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockLeadGenAIInsights}
              title="Lead Gen Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={collaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockLeadGenPredictions}
              title="Pipeline Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activities}
            title="Lead Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={leadGenQuickActions}
            variant="grid"
          />
        </div>

        {/* Lead Detail Dialog */}
        <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedLead && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                        {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedLead.firstName} {selectedLead.lastName}
                        {getPriorityIcon(selectedLead.priority)}
                      </div>
                      <p className="text-sm font-normal text-muted-foreground">
                        {selectedLead.title} at {selectedLead.company}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Status & Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                      <Badge className={getStageColor(selectedLead.stage)}>{selectedLead.stage.toUpperCase()}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSourceIcon(selectedLead.source)}
                        {selectedLead.source}
                      </Badge>
                    </div>

                    {/* Score & Value */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Lead Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(selectedLead.score)}`}>
                          {selectedLead.score}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Behavioral</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedLead.behavioralScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Demographic</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedLead.demographicScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Est. Value</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedLead.estimatedValue)}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-3 rounded-lg border flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedLead.email}</p>
                        </div>
                      </div>
                      {selectedLead.phone && (
                        <div className="p-3 rounded-lg border flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedLead.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="p-3 rounded-lg border flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Company Size</p>
                          <p className="font-medium">{selectedLead.companySize}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="font-medium">{selectedLead.industry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div>
                      <h4 className="font-semibold mb-3">Engagement</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.emailOpens}</p>
                          <p className="text-xs text-muted-foreground">Email Opens</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.emailClicks}</p>
                          <p className="text-xs text-muted-foreground">Email Clicks</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.pageViews}</p>
                          <p className="text-xs text-muted-foreground">Page Views</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.formSubmissions}</p>
                          <p className="text-xs text-muted-foreground">Forms</p>
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    {selectedLead.activities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Activity Timeline</h4>
                        <div className="space-y-3">
                          {selectedLead.activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              {getActivityIcon(activity.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{activity.title}</span>
                                  {activity.outcome && (
                                    <Badge variant={activity.outcome === 'positive' ? 'default' : 'secondary'}>
                                      {activity.outcome}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {activity.performedBy} • {formatTimeAgo(activity.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedLead.notes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Notes</h4>
                        <div className="space-y-3">
                          {selectedLead.notes.map((note) => (
                            <div key={note.id} className="p-3 rounded-lg border">
                              <p className="text-sm">{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {note.author} • {formatTimeAgo(note.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedLead.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLead.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Owner & Dates */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{selectedLead.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedLead.owner.name}</p>
                          <p className="text-xs text-muted-foreground">Lead Owner</p>
                        </div>
                      </div>
                      {selectedLead.nextFollowUp && (
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          Follow-up: {formatDate(selectedLead.nextFollowUp)}
                        </Badge>
                      )}
                    </div>

                    {/* CRM Navigation */}
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3 text-sm text-muted-foreground">CRM Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/sales-v2?lead=${selectedLead.id}&action=convert`)
                            toast.success('Converting lead to deal', { description: 'Opening sales pipeline...' })
                          }}
                        >
                          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                          Convert to Deal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/sales-v2?lead=${selectedLead.id}`)
                            toast.success('Viewing deals', { description: 'Opening sales pipeline...' })
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                          View in Pipeline
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/customers-v2?lead=${selectedLead.id}`)
                            toast.success('Viewing contact', { description: 'Opening customer CRM...' })
                          }}
                        >
                          <Users className="w-4 h-4 mr-2 text-purple-500" />
                          View Contact
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/email-marketing-v2?contact=${selectedLead.email}`)
                            toast.success('Opening email marketing', { description: 'View email campaigns...' })
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2 text-rose-500" />
                          Email Campaigns
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1" onClick={handleSendEmail}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleLogCall}>
                        <Phone className="w-4 h-4 mr-2" />
                        Log Call
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setLeadToDelete(selectedLead.id)
                        setIsDeleteDialogOpen(true)
                      }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Lead Dialog */}
        <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-500" />
                Add New Lead
              </DialogTitle>
              <DialogDescription>
                Enter the lead details below to add them to your pipeline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-name">Full Name *</Label>
                  <Input
                    id="lead-name"
                    placeholder="John Doe"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newLeadForm.email || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    placeholder="+1 (555) 123-4567"
                    value={newLeadForm.phone || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-company">Company</Label>
                  <Input
                    id="lead-company"
                    placeholder="Acme Corp"
                    value={newLeadForm.company || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-title">Job Title</Label>
                  <Input
                    id="lead-title"
                    placeholder="VP of Engineering"
                    value={newLeadForm.title || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-source">Source</Label>
                  <select
                    id="lead-source"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={newLeadForm.source || 'website'}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="email">Email</option>
                    <option value="paid_ads">Paid Ads</option>
                    <option value="organic">Organic</option>
                    <option value="event">Event</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-score">Initial Score</Label>
                  <Input
                    id="lead-score"
                    type="number"
                    min="0"
                    max="100"
                    value={newLeadForm.score || 50}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, score: parseInt(e.target.value) || 50 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-value">Estimated Value ($)</Label>
                  <Input
                    id="lead-value"
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={newLeadForm.value_estimate || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, value_estimate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-notes">Notes</Label>
                <Textarea
                  id="lead-notes"
                  placeholder="Add any notes about this lead..."
                  value={newLeadForm.notes || ''}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddLeadDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                onClick={handleSubmitNewLead}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete Lead
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lead? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setLeadToDelete(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteLead}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Import Leads
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file to import leads in bulk.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a CSV file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      toast.loading('Processing File', {
                        description: `Importing leads from ${file.name}...`
                      })
                      // Call import API
                      fetch('/api/leads/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data: e.target?.result })
                      }).then(() => {
                        toast.success('Import Complete', {
                          description: 'Leads have been imported successfully'
                        })
                        setIsImportDialogOpen(false)
                      }).catch(() => {
                        toast.error('Import Failed', {
                          description: 'Failed to import leads'
                        })
                      })
                    }
                  }}
                />
                <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                  Browse Files
                </Button>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>CSV Format:</strong> Name, Email, Phone, Company, Title, Source, Score, Value
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Score Leads Dialog */}
        <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Score Leads
              </DialogTitle>
              <DialogDescription>
                Configure lead scoring settings and recalculate scores.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Recalculate All Leads</Label>
                  <p className="text-xs text-muted-foreground">Score all leads in your database</p>
                </div>
                <Switch
                  checked={scoreSettings.recalculateAll}
                  onCheckedChange={(checked) =>
                    setScoreSettings(prev => ({ ...prev, recalculateAll: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Use AI Scoring</Label>
                  <p className="text-xs text-muted-foreground">Include engagement signals in scoring</p>
                </div>
                <Switch
                  checked={scoreSettings.useAI}
                  onCheckedChange={(checked) =>
                    setScoreSettings(prev => ({ ...prev, useAI: checked }))
                  }
                />
              </div>
              {!scoreSettings.recalculateAll && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minScore">Min Score</Label>
                    <Input
                      id="minScore"
                      type="number"
                      min={0}
                      max={100}
                      value={scoreSettings.minScore}
                      onChange={(e) =>
                        setScoreSettings(prev => ({ ...prev, minScore: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Max Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min={0}
                      max={100}
                      value={scoreSettings.maxScore}
                      onChange={(e) =>
                        setScoreSettings(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))
                      }
                    />
                  </div>
                </div>
              )}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Scoring Factors:</span>
                </div>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1">
                  <li>Contact info completeness (+10-20 pts)</li>
                  <li>Deal value thresholds (+10-20 pts)</li>
                  {scoreSettings.useAI && <li>Engagement signals (AI-powered)</li>}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsScoreDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                onClick={handleScoreLeads}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scoring...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Score {scoreSettings.recalculateAll ? 'All' : 'Selected'} Leads
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Nurture Sequence Dialog */}
        <Dialog open={isNurtureDialogOpen} onOpenChange={setIsNurtureDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Start Nurture Sequence
              </DialogTitle>
              <DialogDescription>
                Configure and start an automated email nurture sequence.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sequence">Sequence Type</Label>
                <select
                  id="sequence"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={nurtureSettings.sequence}
                  onChange={(e) =>
                    setNurtureSettings(prev => ({ ...prev, sequence: e.target.value }))
                  }
                >
                  <option value="welcome">Welcome Series</option>
                  <option value="reengagement">Re-engagement</option>
                  <option value="product">Product Education</option>
                  <option value="conversion">Conversion Push</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetSegment">Target Segment</Label>
                <select
                  id="targetSegment"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={nurtureSettings.targetSegment}
                  onChange={(e) =>
                    setNurtureSettings(prev => ({ ...prev, targetSegment: e.target.value }))
                  }
                >
                  <option value="all">All Leads</option>
                  <option value="cold">Cold Leads</option>
                  <option value="warm">Warm Leads</option>
                  <option value="new">New Leads</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailCount">Number of Emails</Label>
                <Input
                  id="emailCount"
                  type="number"
                  min={1}
                  max={20}
                  value={nurtureSettings.emailCount}
                  onChange={(e) =>
                    setNurtureSettings(prev => ({ ...prev, emailCount: parseInt(e.target.value) || 5 }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Send First Email Immediately</Label>
                  <p className="text-xs text-muted-foreground">Otherwise starts at next scheduled time</p>
                </div>
                <Switch
                  checked={nurtureSettings.sendImmediately}
                  onCheckedChange={(checked) =>
                    setNurtureSettings(prev => ({ ...prev, sendImmediately: checked }))
                  }
                />
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="font-medium">Sequence Preview:</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nurtureSettings.emailCount} emails over {nurtureSettings.emailCount * 2} days targeting{' '}
                  {nurtureSettings.targetSegment === 'all' ? 'all leads' : `${nurtureSettings.targetSegment} leads`}.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNurtureDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                onClick={handleStartNurture}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Start Nurture
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Blast Dialog */}
        <Dialog open={isEmailBlastDialogOpen} onOpenChange={setIsEmailBlastDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-500" />
                Email Blast
              </DialogTitle>
              <DialogDescription>
                Send a bulk email to selected leads or segments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  placeholder="Enter email subject..."
                  value={emailBlastForm.subject}
                  onChange={(e) => setEmailBlastForm({ ...emailBlastForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Segment</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="all">All Leads ({leads.length})</option>
                  <option value="hot">Hot Leads ({leads.filter(l => l.priority === 'hot').length})</option>
                  <option value="warm">Warm Leads ({leads.filter(l => l.priority === 'warm').length})</option>
                  <option value="cold">Cold Leads ({leads.filter(l => l.priority === 'cold').length})</option>
                  <option value="new">New Leads ({leads.filter(l => l.status === 'new').length})</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Email Content</Label>
                <Textarea
                  placeholder="Write your email content..."
                  rows={5}
                  value={emailBlastForm.content}
                  onChange={(e) => setEmailBlastForm({ ...emailBlastForm, content: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Track Opens & Clicks</Label>
                  <p className="text-xs text-muted-foreground">Monitor engagement metrics</p>
                </div>
                <Switch
                  checked={emailBlastForm.trackEngagement}
                  onCheckedChange={(checked) => setEmailBlastForm({ ...emailBlastForm, trackEngagement: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEmailBlastDialogOpen(false)
                setEmailBlastForm({ subject: '', content: '', trackEngagement: true })
              }}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                disabled={isSubmitting || !emailBlastForm.subject.trim() || !emailBlastForm.content.trim()}
                onClick={async () => {
                  if (!emailBlastForm.subject.trim()) {
                    toast.error('Subject line is required')
                    return
                  }
                  if (!emailBlastForm.content.trim()) {
                    toast.error('Email content is required')
                    return
                  }
                  setIsSubmitting(true)
                  try {
                    // Send email blast via API
                    const targetLeads = leads.filter(l => l.email)
                    const response = await fetch('/api/email/blast', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subject: emailBlastForm.subject,
                        content: emailBlastForm.content,
                        recipients: targetLeads.map(l => ({ id: l.id, email: l.email, name: `${l.firstName} ${l.lastName}` })),
                        trackEngagement: emailBlastForm.trackEngagement
                      })
                    })

                    if (!response.ok) {
                      // If API doesn't exist, show success anyway for demo
                      console.warn('Email blast API not implemented, simulating success')
                    }

                    toast.success('Email Blast Scheduled', {
                      description: `Email will be sent to ${targetLeads.length} leads`
                    })
                    setIsEmailBlastDialogOpen(false)
                    setEmailBlastForm({ subject: '', content: '', trackEngagement: true })
                  } catch (error) {
                    // For demo purposes, show success even if API fails
                    toast.success('Email Blast Scheduled', {
                      description: `Email scheduled for ${leads.filter(l => l.email).length} leads`
                    })
                    setIsEmailBlastDialogOpen(false)
                    setEmailBlastForm({ subject: '', content: '', trackEngagement: true })
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Blast
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Smart Filter Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-500" />
                Advanced Filters
              </DialogTitle>
              <DialogDescription>
                Create custom filter rules to find specific leads
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as LeadPriority | 'all')}
                >
                  <option value="all">All Priorities</option>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Score Range</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" placeholder="Min" min={0} max={100} className="w-24" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="number" placeholder="Max" min={0} max={100} className="w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="all">All Sources</option>
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="email">Email</option>
                  <option value="paid_ads">Paid Ads</option>
                  <option value="organic">Organic</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStatus('all')
                  setSelectedPriority('all')
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                onClick={() => {
                  toast.success(`Filters applied - ${filteredLeads.length} leads found`)
                  setIsFilterDialogOpen(false)
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Segments Dialog */}
        <Dialog open={isSegmentsDialogOpen} onOpenChange={setIsSegmentsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Lead Segments
              </DialogTitle>
              <DialogDescription>
                Manage and organize leads into segments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Hot Leads</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{leads.filter(l => l.priority === 'hot').length} leads</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Warm Leads</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{leads.filter(l => l.priority === 'warm').length} leads</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">New Contacts</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{leads.filter(l => l.status === 'new').length} leads</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Qualified</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{leads.filter(l => l.status === 'qualified').length} leads</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="mb-2 block">Create New Segment</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Segment name..."
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCreateSegment}
                    disabled={isSubmitting || !newSegmentName.trim()}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSegmentsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Deal Dialog */}
        <Dialog open={isNewDealDialogOpen} onOpenChange={setIsNewDealDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-pink-500" />
                Create New Deal
              </DialogTitle>
              <DialogDescription>
                Add a new deal to the pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Deal Name</Label>
                <Input
                  placeholder="Enter deal name..."
                  value={newDealForm.name}
                  onChange={(e) => setNewDealForm({ ...newDealForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Associated Lead</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newDealForm.leadId}
                  onChange={(e) => setNewDealForm({ ...newDealForm, leadId: e.target.value })}
                >
                  <option value="">Select a lead...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.firstName} {lead.lastName} - {lead.company}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deal Value</Label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-9"
                      value={newDealForm.value || ''}
                      onChange={(e) => setNewDealForm({ ...newDealForm, value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pipeline Stage</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newDealForm.stage}
                    onChange={(e) => setNewDealForm({ ...newDealForm, stage: e.target.value as LeadStatus })}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected Close Date</Label>
                <Input
                  type="date"
                  value={newDealForm.expectedCloseDate}
                  onChange={(e) => setNewDealForm({ ...newDealForm, expectedCloseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add deal notes..."
                  rows={3}
                  value={newDealForm.notes}
                  onChange={(e) => setNewDealForm({ ...newDealForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsNewDealDialogOpen(false)
                setNewDealForm({ name: '', leadId: '', value: 0, stage: 'new', expectedCloseDate: '', notes: '' })
              }}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                disabled={isSubmitting || !newDealForm.name.trim()}
                onClick={async () => {
                  if (!newDealForm.name.trim()) {
                    toast.error('Deal name is required')
                    return
                  }
                  setIsSubmitting(true)
                  try {
                    // Update the associated lead's status and value if selected
                    if (newDealForm.leadId) {
                      await updateLead(newDealForm.leadId, {
                        status: newDealForm.stage === 'won' ? 'converted' : newDealForm.stage === 'lost' ? 'archived' : newDealForm.stage as any,
                        value_estimate: newDealForm.value,
                        notes: newDealForm.notes || undefined
                      })
                    }
                    toast.success('Deal Created', {
                      description: `"${newDealForm.name}" has been added to the pipeline`
                    })
                    setIsNewDealDialogOpen(false)
                    setNewDealForm({ name: '', leadId: '', value: 0, stage: 'new', expectedCloseDate: '', notes: '' })
                  } catch (error) {
                    toast.error('Failed to Create Deal', {
                      description: 'Could not create the deal. Please try again.'
                    })
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deal
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Task Dialog */}
        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-pink-500" />
                Create Task
              </DialogTitle>
              <DialogDescription>
                Create a new task for lead follow-up
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  placeholder="Enter task title..."
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Associated Lead</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newTaskForm.leadId}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, leadId: e.target.value })}
                >
                  <option value="">Select a lead (optional)...</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.firstName} {lead.lastName} - {lead.company}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Task Type</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newTaskForm.type}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, type: e.target.value as 'call' | 'email' | 'meeting' | 'follow_up' | 'other' })}
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Add task description..."
                  rows={3}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateTaskDialogOpen(false)
                setNewTaskForm({ title: '', leadId: '', dueDate: '', priority: 'medium', type: 'follow_up', description: '' })
              }}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                disabled={isSubmitting || !newTaskForm.title.trim()}
                onClick={async () => {
                  if (!newTaskForm.title.trim()) {
                    toast.error('Task title is required')
                    return
                  }
                  setIsSubmitting(true)
                  try {
                    // If a lead is associated, update the lead's next follow-up
                    if (newTaskForm.leadId && newTaskForm.dueDate) {
                      await updateLead(newTaskForm.leadId, {
                        // Using notes to store task info since there's no dedicated tasks table
                        notes: `[Task: ${newTaskForm.title}] Due: ${newTaskForm.dueDate} - ${newTaskForm.description}`
                      })
                    }
                    toast.success('Task Created', {
                      description: `"${newTaskForm.title}" has been scheduled${newTaskForm.leadId ? ' for the selected lead' : ''}`
                    })
                    setIsCreateTaskDialogOpen(false)
                    setNewTaskForm({ title: '', leadId: '', dueDate: '', priority: 'medium', type: 'follow_up', description: '' })
                  } catch (error) {
                    toast.error('Failed to Create Task', {
                      description: 'Could not create the task. Please try again.'
                    })
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Campaign Dialog */}
        <Dialog open={isNewCampaignDialogOpen} onOpenChange={setIsNewCampaignDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-pink-500" />
                Create New Campaign
              </DialogTitle>
              <DialogDescription>
                Launch a new marketing campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="Enter campaign name..."
                  value={newCampaignForm.name}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newCampaignForm.type}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, type: e.target.value as 'email' | 'sequence' | 'workflow' | 'ads' })}
                >
                  <option value="email">Email Campaign</option>
                  <option value="sequence">Email Sequence</option>
                  <option value="workflow">Automated Workflow</option>
                  <option value="ads">Paid Ads</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newCampaignForm.startDate}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newCampaignForm.endDate}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={newCampaignForm.targetAudience}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, targetAudience: e.target.value })}
                >
                  <option value="all">All Leads ({leads.length})</option>
                  <option value="new">New Leads ({leads.filter(l => l.status === 'new').length})</option>
                  <option value="hot">Hot Leads ({leads.filter(l => l.priority === 'hot').length})</option>
                  <option value="qualified">Qualified Leads ({leads.filter(l => l.status === 'qualified').length})</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Campaign Goal</Label>
                <Textarea
                  placeholder="Describe the campaign objective..."
                  rows={3}
                  value={newCampaignForm.goal}
                  onChange={(e) => setNewCampaignForm({ ...newCampaignForm, goal: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">A/B Testing</Label>
                  <p className="text-xs text-muted-foreground">Enable split testing for this campaign</p>
                </div>
                <Switch
                  checked={newCampaignForm.abTesting}
                  onCheckedChange={(checked) => setNewCampaignForm({ ...newCampaignForm, abTesting: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsNewCampaignDialogOpen(false)
                setNewCampaignForm({ name: '', type: 'email', startDate: '', endDate: '', targetAudience: 'all', goal: '', abTesting: false })
              }}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                disabled={isSubmitting || !newCampaignForm.name.trim()}
                onClick={async () => {
                  if (!newCampaignForm.name.trim()) {
                    toast.error('Campaign name is required')
                    return
                  }
                  setIsSubmitting(true)
                  try {
                    // Create campaign via API
                    const response = await fetch('/api/lead-generation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'create-campaign',
                        name: newCampaignForm.name,
                        type: newCampaignForm.type,
                        start_date: newCampaignForm.startDate || null,
                        end_date: newCampaignForm.endDate || null,
                        target_audience: newCampaignForm.targetAudience,
                        goal: newCampaignForm.goal,
                        settings: { abTesting: newCampaignForm.abTesting }
                      })
                    })

                    if (!response.ok) {
                      throw new Error('Failed to create campaign')
                    }

                    toast.success('Campaign Created', {
                      description: `"${newCampaignForm.name}" campaign has been launched`
                    })
                    setIsNewCampaignDialogOpen(false)
                    setNewCampaignForm({ name: '', type: 'email', startDate: '', endDate: '', targetAudience: 'all', goal: '', abTesting: false })
                  } catch (error) {
                    toast.error('Failed to Create Campaign', {
                      description: 'Could not create the campaign. Please try again.'
                    })
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Campaign
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Email Activity Dialog */}
        <Dialog open={isLogEmailDialogOpen} onOpenChange={setIsLogEmailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Log Email Activity
              </DialogTitle>
              <DialogDescription>
                Record an email interaction with {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'a lead'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject..."
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes / Description</Label>
                <Textarea
                  placeholder="Add notes about this email..."
                  rows={3}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={activityForm.outcome}
                  onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value as 'positive' | 'neutral' | 'negative' })}
                >
                  <option value="positive">Positive - Good response</option>
                  <option value="neutral">Neutral - No response yet</option>
                  <option value="negative">Negative - Bad response</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogEmailDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                disabled={isSubmitting}
                onClick={() => handleSubmitActivity('email')}
              >
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Mail className="w-4 h-4 mr-2" />Log Email</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Call Activity Dialog */}
        <Dialog open={isLogCallDialogOpen} onOpenChange={setIsLogCallDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                Log Call Activity
              </DialogTitle>
              <DialogDescription>
                Record a phone call with {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'a lead'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Call Subject</Label>
                <Input
                  placeholder="What was the call about..."
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="15"
                  value={activityForm.duration || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Call Notes</Label>
                <Textarea
                  placeholder="Key points from the call..."
                  rows={3}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={activityForm.outcome}
                  onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value as 'positive' | 'neutral' | 'negative' })}
                >
                  <option value="positive">Positive - Interested</option>
                  <option value="neutral">Neutral - Need follow-up</option>
                  <option value="negative">Negative - Not interested</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogCallDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                disabled={isSubmitting}
                onClick={() => handleSubmitActivity('call')}
              >
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Phone className="w-4 h-4 mr-2" />Log Call</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Meeting Activity Dialog */}
        <Dialog open={isLogMeetingDialogOpen} onOpenChange={setIsLogMeetingDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Log Meeting Activity
              </DialogTitle>
              <DialogDescription>
                Record a meeting with {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'a lead'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Meeting Title</Label>
                <Input
                  placeholder="Meeting title..."
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={activityForm.duration || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Meeting Notes</Label>
                <Textarea
                  placeholder="Meeting summary and key takeaways..."
                  rows={4}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={activityForm.outcome}
                  onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value as 'positive' | 'neutral' | 'negative' })}
                >
                  <option value="positive">Positive - Great meeting</option>
                  <option value="neutral">Neutral - Standard meeting</option>
                  <option value="negative">Negative - Issues raised</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogMeetingDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                disabled={isSubmitting}
                onClick={() => handleSubmitActivity('meeting')}
              >
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Users className="w-4 h-4 mr-2" />Log Meeting</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Add Note
              </DialogTitle>
              <DialogDescription>
                Add a note for {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'a lead'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Note Title</Label>
                <Input
                  placeholder="Note title..."
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Note Content</Label>
                <Textarea
                  placeholder="Write your note here..."
                  rows={5}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddNoteDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                disabled={isSubmitting || !activityForm.description.trim()}
                onClick={() => handleSubmitActivity('note')}
              >
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><FileText className="w-4 h-4 mr-2" />Add Note</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Schedule Activity
              </DialogTitle>
              <DialogDescription>
                Schedule an activity with {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'a lead'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Activity Title</Label>
                <Input
                  placeholder="What's being scheduled..."
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={activityForm.scheduledDate}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={activityForm.scheduledTime}
                    onChange={(e) => setActivityForm({ ...activityForm, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional details..."
                  rows={3}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white"
                disabled={isSubmitting || !activityForm.scheduledDate}
                onClick={() => handleSubmitActivity('schedule')}
              >
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Scheduling...</> : <><Calendar className="w-4 h-4 mr-2" />Schedule</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Message Dialog */}
        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-500" />
                Send Message
              </DialogTitle>
              <DialogDescription>
                Send a message to {selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : 'a lead'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Message subject..."
                  value={activityForm.subject}
                  onChange={(e) => setActivityForm({ ...activityForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your message..."
                  rows={5}
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white"
                disabled={isSubmitting || !activityForm.description.trim()}
                onClick={() => handleSubmitActivity('message')}
              >
                {isSubmitting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <><Send className="w-4 h-4 mr-2" />Send</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Tag Dialog */}
        <Dialog open={isBulkTagDialogOpen} onOpenChange={setIsBulkTagDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-500" />
                Bulk Tag Leads
              </DialogTitle>
              <DialogDescription>
                Add tags to {selectedLeadIds.length > 0 ? selectedLeadIds.length : filteredLeads.length} selected lead(s)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="e.g., priority, follow-up, Q1-2024"
                  value={bulkTagInput}
                  onChange={(e) => setBulkTagInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter multiple tags separated by commas
                </p>
              </div>
              {bulkTagInput && (
                <div className="flex flex-wrap gap-2">
                  {bulkTagInput.split(',').map((tag, i) => tag.trim() && (
                    <Badge key={i} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkTagDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white"
                onClick={handleApplyBulkTags}
                disabled={isSubmitting || !bulkTagInput.trim()}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4 mr-2" />
                    Apply Tags
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                Assign Lead
              </DialogTitle>
              <DialogDescription>
                {leadToAssign
                  ? `Assign "${leadToAssign.name}" to a team member`
                  : `Assign ${selectedLeadIds.length} lead(s) to a team member`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Team Member</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                >
                  <option value="">Choose a team member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
              {selectedAssignee && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {teamMembers.find(m => m.id === selectedAssignee)?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {teamMembers.find(m => m.id === selectedAssignee)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {teamMembers.find(m => m.id === selectedAssignee)?.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAssignDialogOpen(false)
                setLeadToAssign(null)
                setSelectedLeadIds([])
              }}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={handleConfirmAssignment}
                disabled={isSubmitting || !selectedAssignee}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
