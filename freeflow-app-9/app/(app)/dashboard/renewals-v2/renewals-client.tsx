"use client"

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRenewals, useRenewalMutations, type Renewal as DbRenewal } from '@/lib/hooks/use-renewals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Mail,
  Phone,
  FileText,
  Settings,
  Search,
  MoreVertical,
  ChevronRight,
  Zap,
  Shield,
  GitBranch,
  Play,
  Send,
  Download,
  Building2,
  UserCheck,
  CalendarDays,
  LineChart,
  Gauge,
  Handshake,
  Sliders,
  Webhook,
  Key
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




import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'

// Types
type RenewalStatus = 'upcoming' | 'in_progress' | 'negotiating' | 'at_risk' | 'won' | 'lost' | 'churned'
type RenewalType = 'expansion' | 'flat' | 'contraction' | 'multi_year' | 'early_renewal'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type HealthScore = 'healthy' | 'needs_attention' | 'at_risk' | 'critical'
type PlaybookType = 'expansion' | 'retention' | 'win_back' | 'upsell' | 'cross_sell'

interface RenewalContact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  avatar: string
  isPrimary: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface RenewalActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'proposal' | 'contract'
  title: string
  description: string
  date: Date
  user: string
  outcome?: 'positive' | 'neutral' | 'negative'
}

interface RenewalMilestone {
  id: string
  name: string
  dueDate: Date
  completed: boolean
  completedDate?: Date
}

interface Renewal {
  id: string
  customerName: string
  customerLogo: string
  status: RenewalStatus
  type: RenewalType
  priority: Priority
  healthScore: HealthScore
  healthScoreValue: number
  currentARR: number
  proposedARR: number
  expansionValue: number
  probability: number
  renewalDate: Date
  daysToRenewal: number
  contractTerm: number
  currency: string
  csmName: string
  csmAvatar: string
  aeName: string
  aeAvatar: string
  lastContactDate: Date
  nextActionDate: Date
  nextAction: string
  meetingsScheduled: number
  proposalSent: boolean
  contractSent: boolean
  contacts: RenewalContact[]
  activities: RenewalActivity[]
  milestones: RenewalMilestone[]
  products: string[]
  riskFactors: string[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

interface Playbook {
  id: string
  name: string
  type: PlaybookType
  description: string
  steps: string[]
  successRate: number
  timesUsed: number
}

interface Forecast {
  month: string
  renewals: number
  arr: number
  expansion: number
  churn: number
  netRetention: number
}

// Empty data arrays (real data comes from props or API)
const renewalsData: Renewal[] = []

const playbooksData: Playbook[] = []

const forecastsData: Forecast[] = []

// Helper Functions
const getStatusColor = (status: RenewalStatus): string => {
  const colors: Record<RenewalStatus, string> = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    negotiating: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    at_risk: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    churned: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status] || colors.upcoming
}

const getStatusIcon = (status: RenewalStatus) => {
  const icons: Record<RenewalStatus, React.ReactNode> = {
    upcoming: <Calendar className="w-3 h-3" />,
    in_progress: <Play className="w-3 h-3" />,
    negotiating: <Handshake className="w-3 h-3" />,
    at_risk: <AlertTriangle className="w-3 h-3" />,
    won: <CheckCircle className="w-3 h-3" />,
    lost: <XCircle className="w-3 h-3" />,
    churned: <XCircle className="w-3 h-3" />
  }
  return icons[status] || icons.upcoming
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[priority] || colors.medium
}

const getHealthColor = (health: HealthScore): string => {
  const colors: Record<HealthScore, string> = {
    healthy: 'text-green-600 dark:text-green-400',
    needs_attention: 'text-yellow-600 dark:text-yellow-400',
    at_risk: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400'
  }
  return colors[health] || colors.healthy
}

const getTypeColor = (type: RenewalType): string => {
  const colors: Record<RenewalType, string> = {
    expansion: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    flat: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    contraction: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    multi_year: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    early_renewal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
  }
  return colors[type] || colors.flat
}

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
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

interface RenewalsClientProps {
  initialRenewals?: any[]
}

// Empty arrays for competitive upgrade components (real data comes from props or API)
const renewalsAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const renewalsCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string }[] = []

const renewalsPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down'; impact: 'low' | 'medium' | 'high' }[] = []

const renewalsActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'warning' | 'info' }[] = []

// Quick actions are defined inside component to access state setters

export default function RenewalsClient({ initialRenewals }: RenewalsClientProps) {
  const supabase = createClient()

  // Data hooks
  const { renewals: dbRenewals, stats: renewalStats, isLoading, error, refetch } = useRenewals()
  const { updateRenewal, deleteRenewal, isUpdating, isDeleting } = useRenewalMutations()

  const [activeTab, setActiveTab] = useState('overview')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<RenewalStatus | 'all'>('all')
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null)
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false)
  const [isNewRenewalDialogOpen, setIsNewRenewalDialogOpen] = useState(false)

  // Additional dialog states
  const [isEditRenewalDialogOpen, setIsEditRenewalDialogOpen] = useState(false)
  const [isSendReminderDialogOpen, setIsSendReminderDialogOpen] = useState(false)
  const [isProcessRenewalDialogOpen, setIsProcessRenewalDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false)
  const [isForecastDialogOpen, setIsForecastDialogOpen] = useState(false)
  const [isAtRiskDialogOpen, setIsAtRiskDialogOpen] = useState(false)
  const [isPlaybookDialogOpen, setIsPlaybookDialogOpen] = useState(false)
  const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false)
  const [isCustomersDialogOpen, setIsCustomersDialogOpen] = useState(false)

  // Form states
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    currentARR: '',
    proposedARR: '',
    renewalDate: '',
    csmName: '',
    notes: ''
  })
  const [reminderType, setReminderType] = useState<'email' | 'sms' | 'both'>('email')
  const [reminderMessage, setReminderMessage] = useState('')
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [exportDateRange, setExportDateRange] = useState({ start: '', end: '' })
  const [filterCriteria, setFilterCriteria] = useState({
    status: 'all',
    priority: 'all',
    healthScore: 'all',
    csm: 'all',
    dateRange: { start: '', end: '' }
  })

  // Quick actions with real functionality
  const handleNewRenewal = () => {
    setIsNewRenewalDialogOpen(true)
  }

  const handleRunPlaybook = async () => {
    try {
      const response = await fetch('/api/renewals/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      })
      if (response.ok) {
        toast.success('Playbook executed successfully!')
      } else {
        toast.error('Playbook execution failed')
      }
    } catch {
      toast.error('Playbook execution failed')
    }
  }

  const handleExportPipeline = () => {
    const pipelineData = renewals.map(r => ({
      customerName: r.customerName,
      status: r.status,
      currentARR: r.currentARR,
      proposedARR: r.proposedARR,
      probability: r.probability,
      renewalDate: r.renewalDate,
      healthScore: r.healthScoreValue,
      csmName: r.csmName
    }))
    const csvContent = [
      'Customer Name,Status,Current ARR,Proposed ARR,Probability,Renewal Date,Health Score,CSM',
      ...pipelineData.map(r => `"${r.customerName}","${r.status}",${r.currentARR},${r.proposedARR},${r.probability},"${r.renewalDate}",${r.healthScore},"${r.csmName}"`)
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `renewal-pipeline-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Pipeline exported successfully!')
  }

  const renewalsQuickActions = [
    { id: '1', label: 'New Renewal', icon: 'plus', action: handleNewRenewal, variant: 'default' as const },
    { id: '2', label: 'Run Playbook', icon: 'play', action: handleRunPlaybook, variant: 'default' as const },
    { id: '3', label: 'Export Pipeline', icon: 'download', action: handleExportPipeline, variant: 'outline' as const },
  ]

  const renewals = renewalsData
  const playbooks = playbooksData
  const forecasts = forecastsData

  // Computed Statistics
  const stats = useMemo(() => {
    const activeRenewals = renewals.filter(r => !['won', 'lost', 'churned'].includes(r.status))
    const totalCurrentARR = activeRenewals.reduce((sum, r) => sum + r.currentARR, 0)
    const totalProposedARR = activeRenewals.reduce((sum, r) => sum + r.proposedARR, 0)
    const totalExpansion = activeRenewals.reduce((sum, r) => sum + Math.max(0, r.expansionValue), 0)
    const totalContraction = activeRenewals.reduce((sum, r) => sum + Math.min(0, r.expansionValue), 0)
    const avgProbability = activeRenewals.length > 0
      ? activeRenewals.reduce((sum, r) => sum + r.probability, 0) / activeRenewals.length
      : 0
    const atRiskCount = renewals.filter(r => r.status === 'at_risk').length
    const atRiskARR = renewals.filter(r => r.status === 'at_risk').reduce((sum, r) => sum + r.currentARR, 0)
    const upcomingCount = renewals.filter(r => r.status === 'upcoming').length
    const wonCount = renewals.filter(r => r.status === 'won').length
    const lostCount = renewals.filter(r => ['lost', 'churned'].includes(r.status)).length

    return {
      total: renewals.length,
      active: activeRenewals.length,
      totalCurrentARR,
      totalProposedARR,
      totalExpansion,
      totalContraction,
      avgProbability,
      atRiskCount,
      atRiskARR,
      upcomingCount,
      wonCount,
      lostCount
    }
  }, [renewals])

  // Filtered Renewals
  const filteredRenewals = useMemo(() => {
    return renewals.filter(renewal => {
      const matchesSearch = renewal.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        renewal.csmName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || renewal.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [renewals, searchQuery, selectedStatus])

  const openRenewalDetail = (renewal: Renewal) => {
    setSelectedRenewal(renewal)
    setIsRenewalDialogOpen(true)
  }

  // Handlers
  const handleSendProposal = () => {
    if (!selectedRenewal) return
    toast.success(`Proposal sent successfully to ${selectedRenewal.customerName}`)
    setIsRenewalDialogOpen(false)
  }

  const handleScheduleMeeting = () => {
    if (!selectedRenewal) return
    toast.success(`Meeting scheduled with ${selectedRenewal.customerName}`)
  }

  const handleExport = () => {
    toast.success('Export started')
  }

  const handleScheduleRenewal = () => {
    toast.info('Schedule Renewal')
  }

  const handleContactEmail = (email: string, name: string) => {
    toast.success(`Opening email for ${name}`)
  }

  const handleContactPhone = (phone: string, name: string) => {
    toast.success(`Initiating call to ${name}`)
  }

  const handleProcessRenewal = (contractName: string) => {
    toast.success(`Processing renewal: "${contractName}" renewal is being processed`)
  }

  const handleExportRenewals = () => {
    toast.success('Exporting renewals')
  }

  // Additional handlers for dialogs
  const handleOpenEditRenewal = (renewal: Renewal) => {
    setSelectedRenewal(renewal)
    setEditFormData({
      customerName: renewal.customerName,
      currentARR: renewal.currentARR.toString(),
      proposedARR: renewal.proposedARR.toString(),
      renewalDate: renewal.renewalDate.toISOString().split('T')[0],
      csmName: renewal.csmName,
      notes: renewal.notes
    })
    setIsEditRenewalDialogOpen(true)
  }

  const handleSaveEditRenewal = () => {
    if (!selectedRenewal) return
    toast.success(`Renewal updated: ${selectedRenewal.customerName} renewal has been updated successfully`)
    setIsEditRenewalDialogOpen(false)
    setSelectedRenewal(null)
  }

  const handleOpenSendReminder = (renewal?: Renewal) => {
    if (renewal) setSelectedRenewal(renewal)
    setReminderMessage('')
    setReminderType('email')
    setIsSendReminderDialogOpen(true)
  }

  const handleSendReminder = async () => {
    if (!selectedRenewal) return
    try {
      toast.loading('Sending reminder...', { id: 'reminder' })
      const response = await fetch('/api/renewals/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewalId: selectedRenewal.id,
          type: reminderType,
          message: reminderMessage
        })
      })
      if (!response.ok) throw new Error('Failed to send reminder')
      toast.success('Reminder sent', {
        id: 'reminder',
        description: `${reminderType === 'both' ? 'Email and SMS' : reminderType.toUpperCase()} reminder sent to ${selectedRenewal.customerName}`
      })
      setIsSendReminderDialogOpen(false)
    } catch {
      toast.error('Failed to send reminder', { id: 'reminder' })
    }
  }

  const handleOpenProcessRenewal = (renewal?: Renewal) => {
    if (renewal) setSelectedRenewal(renewal)
    setIsProcessRenewalDialogOpen(true)
  }

  const handleProcessRenewalAction = async (action: 'approve' | 'reject' | 'escalate') => {
    if (!selectedRenewal) return
    const actionLabels = {
      approve: 'approved',
      reject: 'rejected',
      escalate: 'escalated'
    }
    toast.loading(`Processing renewal...`, { id: 'process' })
    try {
      const response = await fetch('/api/renewals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewalId: selectedRenewal.id, action })
      })
      if (!response.ok) throw new Error('Failed to process renewal')
      toast.success(`Renewal ${actionLabels[action]}`, {
        id: 'process',
        description: `${selectedRenewal.customerName} renewal has been ${actionLabels[action]}`
      })
      setIsProcessRenewalDialogOpen(false)
    } catch {
      toast.error('Failed to process renewal', { id: 'process' })
    }
  }

  const handleOpenSettings = () => {
    setIsSettingsDialogOpen(true)
    toast.info('Opening renewal settings')
  }

  const handleSaveSettings = () => {
    toast.success('Settings saved')
    setIsSettingsDialogOpen(false)
  }

  const handleOpenExportDialog = () => {
    setExportFormat('csv')
    setExportDateRange({ start: '', end: '' })
    setIsExportDialogOpen(true)
  }

  const handleExportWithOptions = () => {
    const formatLabels = { csv: 'CSV', excel: 'Excel', pdf: 'PDF' }
    toast.loading(`Generating ${formatLabels[exportFormat]} export...`, { id: 'export' })
    setTimeout(() => {
      const data = renewals.map(r => ({
        customerName: r.customerName,
        status: r.status,
        currentARR: r.currentARR,
        proposedARR: r.proposedARR,
        probability: r.probability,
        renewalDate: r.renewalDate,
        healthScore: r.healthScoreValue,
        csmName: r.csmName
      }))
      if (exportFormat === 'csv') {
        const csvContent = [
          'Customer,Status,Current ARR,Proposed ARR,Probability,Renewal Date,Health,CSM',
          ...data.map(r => `"${r.customerName}","${r.status}",${r.currentARR},${r.proposedARR},${r.probability},"${r.renewalDate}",${r.healthScore},"${r.csmName}"`)
        ].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `renewals-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      toast.success(`${formatLabels[exportFormat]} export complete`, {
        id: 'export',
        description: `${data.length} renewals exported successfully`
      })
      setIsExportDialogOpen(false)
    }, 1500)
  }

  const handleOpenFilters = () => {
    setIsFiltersDialogOpen(true)
  }

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filterCriteria).filter(([_, v]) =>
      typeof v === 'string' ? v !== 'all' : (v.start || v.end)
    ).length
    toast.success(`Filters applied: ${activeFilters} filter${activeFilters !== 1 ? 's' : ''} active`)
    setIsFiltersDialogOpen(false)
  }

  const handleClearFilters = () => {
    setFilterCriteria({
      status: 'all',
      priority: 'all',
      healthScore: 'all',
      csm: 'all',
      dateRange: { start: '', end: '' }
    })
    toast.info('Filters cleared')
  }

  const handleOpenForecast = () => {
    setIsForecastDialogOpen(true)
    toast.info('Loading forecast data...')
  }

  const handleOpenAtRisk = () => {
    setIsAtRiskDialogOpen(true)
    const atRiskRenewals = renewals.filter(r => r.status === 'at_risk')
    toast.warning(`${atRiskRenewals.length} at-risk account${atRiskRenewals.length !== 1 ? 's' : ''} found`)
  }

  const handleOpenPlaybooks = () => {
    setIsPlaybookDialogOpen(true)
    toast.info('Loading playbooks...')
  }

  const handleRunSelectedPlaybook = (playbookName: string) => {
    if (!selectedRenewal) {
      toast.error('Please select a renewal first')
      return
    }
    toast.loading(`Running ${playbookName}...`, { id: 'playbook' })
    setTimeout(() => {
      toast.success(`${playbookName} started`, {
        id: 'playbook',
        description: `Playbook is now running for ${selectedRenewal.customerName}`
      })
      setIsPlaybookDialogOpen(false)
    }, 1000)
  }

  const handleOpenReports = () => {
    setIsReportsDialogOpen(true)
    toast.info('Loading reports...')
  }

  const handleGenerateReport = useCallback((reportType: string) => {
    toast.loading(`Generating ${reportType}...`, { id: 'report' })

    try {
      // Generate CSV report based on renewals data
      const headers = ['Customer Name', 'Status', 'Priority', 'Current ARR', 'Proposed ARR', 'Renewal Date', 'Health Score', 'Probability']
      const rows = dbRenewals.map(r => [
        r.customer_name,
        r.status,
        r.priority,
        r.current_arr.toString(),
        r.proposed_arr.toString(),
        r.renewal_date || 'N/A',
        r.health_score.toString(),
        `${r.probability}%`
      ])

      const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`${reportType} generated`, {
        id: 'report',
        description: 'Report downloaded to your device'
      })
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(`Failed to generate ${reportType}`, { id: 'report' })
    }
  }, [dbRenewals])

  const handleOpenCustomers = () => {
    setIsCustomersDialogOpen(true)
  }

  const handleViewCustomerDetails = (customerName: string) => {
    toast.info(`Viewing ${customerName}`)
  }

  // Overview quick action handlers
  const handleQuickNewRenewal = () => {
    setIsNewRenewalDialogOpen(true)
    toast.info('Create a new renewal')
  }

  const handleQuickForecast = () => {
    handleOpenForecast()
  }

  const handleQuickAtRisk = () => {
    handleOpenAtRisk()
  }

  const handleQuickPlaybooks = () => {
    handleOpenPlaybooks()
  }

  const handleQuickCustomers = () => {
    handleOpenCustomers()
  }

  const handleQuickReports = () => {
    handleOpenReports()
  }

  const handleQuickExport = () => {
    handleOpenExportDialog()
  }

  const handleQuickSettings = () => {
    setActiveTab('settings')
    toast.info('Opening settings')
  }

  const handleUsePlaybook = (playbook: Playbook) => {
    toast.success(`Starting ${playbook.name}: steps to complete`)
  }

  const handleManageIntegration = (integrationName: string, isConnected: boolean) => {
    if (isConnected) {
      toast.info(`Managing ${integrationName} integration`)
    } else {
      toast.loading(`Connecting to ${integrationName}...`, { id: 'integration' })
      setTimeout(() => {
        toast.success(`${integrationName} connected`, { id: 'integration' })
      }, 1500)
    }
  }

  const handleArchiveOldRenewals = async () => {
    try {
      toast.loading('Archiving old renewals...', { id: 'archive-renewals' })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to archive renewals', { id: 'archive-renewals' })
        return
      }

      // Archive renewals older than 2 years (renewed or churned)
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

      const { error, count } = await supabase
        .from('renewals')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('status', ['renewed', 'churned'])
        .lt('renewal_date', twoYearsAgo.toISOString())

      if (error) throw error

      toast.success(`Archived ${count || 0} old renewals`, { id: 'archive-renewals' })
      refetch()
    } catch (error) {
      console.error('Error archiving renewals:', error)
      toast.error('Failed to archive old renewals', { id: 'archive-renewals' })
    }
  }

  const handleResetSettings = () => {
    // Reset filter and form state to defaults
    setFilterCriteria({
      status: 'all',
      priority: 'all',
      healthScore: 'all',
      csm: 'all',
      dateRange: { start: '', end: '' }
    })
    setSelectedStatus('all')
    setSearchQuery('')
    setSettingsTab('general')
    toast.success('Settings reset to defaults')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <RefreshCw className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Renewal Management</h1>
              <p className="text-muted-foreground">Chargebee-level subscription renewal platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} aria-label="Export data">
                  <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={handleScheduleRenewal}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Schedule Renewal
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active Renewals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalCurrentARR / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Pipeline ARR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{formatCurrency(stats.totalExpansion / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Expansion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalContraction / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Contraction</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgProbability.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Probability</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.atRiskCount}</p>
                  <p className="text-xs text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.wonCount}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lostCount}</p>
                  <p className="text-xs text-muted-foreground">Lost/Churned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Building2 className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="gap-2">
              <LineChart className="w-4 h-4" />
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="playbooks" className="gap-2">
              <FileText className="w-4 h-4" />
              Playbooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Renewal Overview</h2>
                  <p className="text-blue-100">Gainsight-level renewal management and forecasting</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats?.totalValue || 0).toLocaleString()}</p>
                    <p className="text-blue-200 text-sm">Pipeline Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats?.renewalRate || 0}%</p>
                    <p className="text-blue-200 text-sm">Renewal Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats?.atRiskCount || 0}</p>
                    <p className="text-blue-200 text-sm">At Risk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: RefreshCw, label: 'New Renewal', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: handleQuickNewRenewal },
                { icon: Target, label: 'Forecast', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: handleQuickForecast },
                { icon: AlertTriangle, label: 'At Risk', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleQuickAtRisk },
                { icon: Play, label: 'Playbooks', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleQuickPlaybooks },
                { icon: Users, label: 'Customers', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: handleQuickCustomers },
                { icon: BarChart3, label: 'Reports', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleQuickReports },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: handleQuickExport },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: handleQuickSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Renewal Pipeline */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Renewal Pipeline</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search renewals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as RenewalStatus | 'all')}
                          className="h-10 px-3 rounded-md border border-input bg-background"
                        >
                          <option value="all">All Status</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="in_progress">In Progress</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="at_risk">At Risk</option>
                          <option value="won">Won</option>
                          <option value="churned">Churned</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredRenewals.map((renewal) => (
                        <div
                          key={renewal.id}
                          className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => openRenewalDetail(renewal)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                  {renewal.customerName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{renewal.customerName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getStatusColor(renewal.status)}>
                                    {getStatusIcon(renewal.status)}
                                    <span className="ml-1 capitalize">{renewal.status.replace('_', ' ')}</span>
                                  </Badge>
                                  <Badge className={getTypeColor(renewal.type)}>
                                    {renewal.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge className={getPriorityColor(renewal.priority)}>
                                    {renewal.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                                {renewal.probability}%
                              </div>
                              <div className="text-xs text-muted-foreground">probability</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Current ARR</p>
                              <p className="font-semibold">{formatCurrency(renewal.currentARR)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Proposed ARR</p>
                              <p className="font-semibold text-violet-600 dark:text-violet-400">
                                {formatCurrency(renewal.proposedARR)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Change</p>
                              <p className={`font-semibold flex items-center gap-1 ${
                                renewal.expansionValue > 0 ? 'text-green-600 dark:text-green-400' :
                                renewal.expansionValue < 0 ? 'text-red-600 dark:text-red-400' :
                                'text-muted-foreground'
                              }`}>
                                {renewal.expansionValue > 0 ? <ArrowUpRight className="w-3 h-3" /> :
                                 renewal.expansionValue < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                                {renewal.expansionValue > 0 ? '+' : ''}{formatCurrency(renewal.expansionValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Renewal Date</p>
                              <p className={`font-semibold ${renewal.daysToRenewal <= 30 && renewal.daysToRenewal > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                {formatDate(renewal.renewalDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {renewal.csmName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {renewal.daysToRenewal > 0 ? `${renewal.daysToRenewal} days` : 'Completed'}
                              </span>
                              <span className={`flex items-center gap-1 ${getHealthColor(renewal.healthScore)}`}>
                                <Gauge className="w-4 h-4" />
                                {renewal.healthScoreValue}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {renewal.proposalSent && (
                                <Badge variant="outline" className="text-xs">Proposal Sent</Badge>
                              )}
                              {renewal.contractSent && (
                                <Badge variant="outline" className="text-xs">Contract Sent</Badge>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3 pt-3 border-t">
                            <Progress
                              value={renewal.probability}
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* At Risk Summary */}
                <Card className="border-red-200 dark:border-red-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      At Risk Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {renewals.filter(r => r.status === 'at_risk').map((renewal) => (
                        <div key={renewal.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{renewal.customerName}</span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(renewal.currentARR)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {renewal.riskFactors.map((factor, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-300">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                      {renewals.filter(r => r.status === 'at_risk').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No at-risk accounts</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Renewals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                      Next 30 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {renewals
                        .filter(r => r.daysToRenewal > 0 && r.daysToRenewal <= 30 && !['won', 'lost', 'churned'].includes(r.status))
                        .sort((a, b) => a.daysToRenewal - b.daysToRenewal)
                        .map((renewal) => (
                          <div key={renewal.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div>
                              <p className="font-medium text-sm">{renewal.customerName}</p>
                              <p className="text-xs text-muted-foreground">{renewal.daysToRenewal} days</p>
                            </div>
                            <span className="font-semibold text-sm">{formatCurrency(renewal.currentARR)}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Health Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Health Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(['healthy', 'needs_attention', 'at_risk', 'critical'] as HealthScore[]).map((health) => {
                      const count = renewals.filter(r => r.healthScore === health && !['won', 'lost', 'churned'].includes(r.status)).length
                      const percentage = stats.active > 0 ? (count / stats.active) * 100 : 0
                      return (
                        <div key={health}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm capitalize ${getHealthColor(health)}`}>
                              {health.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Startup Labs renewal won', time: '2 hours ago' },
                        { icon: <Send className="w-4 h-4 text-blue-500" />, text: 'Proposal sent to Acme Corp', time: '4 hours ago' },
                        { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: 'TechStart marked at-risk', time: '1 day ago' },
                        { icon: <Phone className="w-4 h-4 text-purple-500" />, text: 'QBR call with Global Enterprises', time: '2 days ago' }
                      ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {activity.icon}
                          <div className="flex-1">
                            <p className="text-sm">{activity.text}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {(['upcoming', 'in_progress', 'negotiating', 'at_risk', 'won'] as RenewalStatus[]).map((status) => {
                const statusRenewals = renewals.filter(r => r.status === status)
                const statusARR = statusRenewals.reduce((sum, r) => sum + r.currentARR, 0)
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <div>
                        <p className="font-semibold capitalize">{status.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{statusRenewals.length} renewals</p>
                      </div>
                      <p className="font-bold">{formatCurrency(statusARR)}</p>
                    </div>
                    <div className="space-y-2">
                      {statusRenewals.map((renewal) => (
                        <Card
                          key={renewal.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openRenewalDetail(renewal)}
                        >
                          <CardContent className="p-3">
                            <p className="font-medium text-sm mb-1">{renewal.customerName}</p>
                            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                              {formatCurrency(renewal.currentARR)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {renewal.daysToRenewal > 0 ? `${renewal.daysToRenewal}d` : 'Done'}
                              </span>
                              <span className={`text-xs font-medium ${getHealthColor(renewal.healthScore)}`}>
                                {renewal.healthScoreValue}
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

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-6">
            {/* Customers Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Customer Accounts</h2>
                  <p className="text-purple-100">Manage customer health and renewal readiness</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{renewals.length}</p>
                  <p className="text-purple-200 text-sm">Active Accounts</p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {renewals.map((renewal) => (
                    <div
                      key={renewal.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => openRenewalDetail(renewal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                              {renewal.customerName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{renewal.customerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(renewal.status)}>
                                {renewal.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                CSM: {renewal.csmName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{formatCurrency(renewal.currentARR)}</p>
                            <p className="text-xs text-muted-foreground">ARR</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-2xl font-bold ${getHealthColor(renewal.healthScore)}`}>
                              {renewal.healthScoreValue}
                            </p>
                            <p className="text-xs text-muted-foreground">Health</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{renewal.probability}%</p>
                            <p className="text-xs text-muted-foreground">Probability</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-violet-500" />
                    Renewal Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecasts.map((forecast) => (
                      <div key={forecast.month} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">{forecast.month}</span>
                          <Badge variant="outline">{forecast.renewals} renewals</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-sm">
                          <div>
                            <p className="text-muted-foreground">ARR</p>
                            <p className="font-semibold">{formatCurrency(forecast.arr)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expansion</p>
                            <p className="font-semibold text-green-600">+{formatCurrency(forecast.expansion)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Churn</p>
                            <p className="font-semibold text-red-600">-{formatCurrency(forecast.churn)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Retention</p>
                            <p className={`font-semibold ${forecast.netRetention >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                              {forecast.netRetention}%
                            </p>
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
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg mb-4">
                    <PieChart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                      <p className="text-sm text-muted-foreground">Expansion Revenue</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalExpansion)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                      <p className="text-sm text-muted-foreground">At-Risk ARR</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(stats.atRiskARR)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Playbooks Tab */}
          <TabsContent value="playbooks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playbooks.map((playbook) => (
                <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          {playbook.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{playbook.description}</p>
                      </div>
                      <Badge className={getTypeColor(playbook.type as any)}>{playbook.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {playbook.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-medium text-violet-600">
                            {i + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {playbook.successRate}% success
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          {playbook.timesUsed} times used
                        </span>
                      </div>
                      <Button size="sm" onClick={() => handleUsePlaybook(playbook)}>Use Playbook</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Renewal Settings</h2>
                  <p className="text-slate-200">Configure your renewal management preferences</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white"
                    onClick={() => {
                      toast.success('Configuration exported')
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'automation', label: 'Automation', icon: Zap },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 text-blue-600" />
                          Renewal Defaults
                        </CardTitle>
                        <CardDescription>Default settings for new renewals</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Renewal Period</Label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                              <option value="1">1 Year</option>
                              <option value="2">2 Years</option>
                              <option value="3">3 Years</option>
                            </select>
                          </div>
                          <div>
                            <Label>Advance Notice (Days)</Label>
                            <Input defaultValue="90" type="number" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-create Renewal Opportunities</Label>
                            <p className="text-sm text-gray-500">Automatically create when contract nears expiration</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="h-5 h-5 text-green-600" />
                          Health Score Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Healthy Threshold</Label>
                            <Input defaultValue="70" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label>At-Risk Threshold</Label>
                            <Input defaultValue="40" type="number" className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Automation Settings */}
                {settingsTab === 'automation' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-amber-600" />
                          Workflow Automation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Auto-assign renewals', desc: 'Based on account owner' },
                          { label: 'Auto-escalate at-risk', desc: 'When health drops below threshold' },
                          { label: 'Auto-trigger playbooks', desc: 'Based on renewal stage' },
                          { label: 'Auto-update forecasts', desc: 'When renewal status changes' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>{item.label}</Label>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 2} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-purple-600" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Renewal due reminders', desc: 'Notify before renewal date' },
                          { label: 'At-risk alerts', desc: 'When accounts become at-risk' },
                          { label: 'Won/Lost notifications', desc: 'When renewal status changes' },
                          { label: 'Weekly pipeline digest', desc: 'Summary of renewal pipeline' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>{item.label}</Label>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 3} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-indigo-600" />
                          Connected Platforms
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Salesforce', status: 'Connected', icon: Building2 },
                          { name: 'Gainsight', status: 'Not Connected', icon: Gauge },
                          { name: 'HubSpot', status: 'Connected', icon: Target },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <integration.icon className="h-6 w-6 text-gray-600" />
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.status}</p>
                              </div>
                            </div>
                            <Button
                              variant={integration.status === 'Connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleManageIntegration(integration.name, integration.status === 'Connected')}
                            >
                              {integration.status === 'Connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-red-600" />
                          Access Control
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Require approval for discounts</Label>
                            <p className="text-sm text-gray-500">Discounts over 15% need approval</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Audit logging</Label>
                            <p className="text-sm text-gray-500">Track all renewal changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="h-5 w-5 text-gray-600" />
                          Advanced Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Multi-year renewals</Label>
                            <p className="text-sm text-gray-500">Enable multi-year contract options</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Custom health metrics</Label>
                            <p className="text-sm text-gray-500">Define custom health score factors</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Archive Old Renewals</Label>
                            <p className="text-sm text-red-600">Archive renewals older than 2 years</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleArchiveOldRenewals}>Archive</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset Settings</Label>
                            <p className="text-sm text-red-600">Reset to default configuration</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleResetSettings}>Reset</Button>
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
              insights={renewalsAIInsights}
              title="Renewal Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={renewalsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={renewalsPredictions}
              title="Renewal Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={renewalsActivities}
            title="Renewal Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={renewalsQuickActions}
            variant="grid"
          />
        </div>

        {/* Renewal Detail Dialog */}
        <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedRenewal && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        {selectedRenewal.customerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRenewal.customerName}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedRenewal.status)}>
                        {getStatusIcon(selectedRenewal.status)}
                        <span className="ml-1 capitalize">{selectedRenewal.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={getTypeColor(selectedRenewal.type)}>
                        {selectedRenewal.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(selectedRenewal.priority)}>
                        {selectedRenewal.priority} priority
                      </Badge>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Current ARR</p>
                        <p className="text-2xl font-bold">{formatCurrency(selectedRenewal.currentARR)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Proposed ARR</p>
                        <p className="text-2xl font-bold text-violet-600">{formatCurrency(selectedRenewal.proposedARR)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Change</p>
                        <p className={`text-2xl font-bold ${selectedRenewal.expansionValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedRenewal.expansionValue >= 0 ? '+' : ''}{formatCurrency(selectedRenewal.expansionValue)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Health Score</p>
                        <p className={`text-2xl font-bold ${getHealthColor(selectedRenewal.healthScore)}`}>
                          {selectedRenewal.healthScoreValue}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3">Renewal Timeline</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Renewal Date</p>
                          <p className="font-medium">{formatDate(selectedRenewal.renewalDate)}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Days Remaining</p>
                          <p className={`font-medium ${selectedRenewal.daysToRenewal <= 30 && selectedRenewal.daysToRenewal > 0 ? 'text-red-600' : ''}`}>
                            {selectedRenewal.daysToRenewal > 0 ? `${selectedRenewal.daysToRenewal} days` : 'Completed'}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Contract Term</p>
                          <p className="font-medium">{selectedRenewal.contractTerm} months</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Probability</p>
                          <p className="font-medium">{selectedRenewal.probability}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div>
                      <h4 className="font-semibold mb-3">Account Team</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar>
                            <AvatarFallback>{selectedRenewal.csmName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedRenewal.csmName}</p>
                            <p className="text-sm text-muted-foreground">Customer Success Manager</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar>
                            <AvatarFallback>{selectedRenewal.aeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedRenewal.aeName}</p>
                            <p className="text-sm text-muted-foreground">Account Executive</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contacts */}
                    {selectedRenewal.contacts.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Customer Contacts</h4>
                        <div className="space-y-2">
                          {selectedRenewal.contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{contact.name}</p>
                                    {contact.isPrimary && <Badge variant="secondary">Primary</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleContactEmail(contact.email, contact.name)}><Mail className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleContactPhone(contact.phone, contact.name)}><Phone className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {selectedRenewal.riskFactors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">Risk Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRenewal.riskFactors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-red-600 border-red-300">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    <div>
                      <h4 className="font-semibold mb-3">Products</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRenewal.products.map((product, i) => (
                          <Badge key={i} variant="secondary">{product}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedRenewal.notes && (
                      <div>
                        <h4 className="font-semibold mb-3">Notes</h4>
                        <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                          {selectedRenewal.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1" onClick={handleSendProposal}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Proposal
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleScheduleMeeting}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button variant="outline" onClick={() => handleOpenSendReminder(selectedRenewal!)}>
                        <Bell className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" onClick={() => handleOpenProcessRenewal(selectedRenewal!)}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" onClick={() => handleOpenEditRenewal(selectedRenewal!)}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Renewal Dialog */}
        <Dialog open={isNewRenewalDialogOpen} onOpenChange={setIsNewRenewalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-violet-600" />
                Create New Renewal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Customer Name</Label>
                  <Input placeholder="Enter customer name" className="mt-1" />
                </div>
                <div>
                  <Label>Current ARR</Label>
                  <Input type="number" placeholder="0" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Renewal Date</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <Label>Contract Term (months)</Label>
                  <Input type="number" placeholder="12" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>CSM Name</Label>
                <Input placeholder="Assigned CSM" className="mt-1" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input placeholder="Additional notes" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNewRenewalDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={() => {
                  setIsNewRenewalDialogOpen(false)
                  toast.success('Renewal created successfully!')
                }}
              >
                Create Renewal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Renewal Dialog */}
        <Dialog open={isEditRenewalDialogOpen} onOpenChange={setIsEditRenewalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-violet-600" />
                Edit Renewal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={editFormData.customerName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Current ARR</Label>
                  <Input
                    type="number"
                    value={editFormData.currentARR}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, currentARR: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Proposed ARR</Label>
                  <Input
                    type="number"
                    value={editFormData.proposedARR}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, proposedARR: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Renewal Date</Label>
                  <Input
                    type="date"
                    value={editFormData.renewalDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>CSM Name</Label>
                <Input
                  value={editFormData.csmName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, csmName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditRenewalDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={handleSaveEditRenewal}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Reminder Dialog */}
        <Dialog open={isSendReminderDialogOpen} onOpenChange={setIsSendReminderDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                Send Renewal Reminder
              </DialogTitle>
            </DialogHeader>
            {selectedRenewal && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{selectedRenewal.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    Renewal due: {formatDate(selectedRenewal.renewalDate)}
                  </p>
                </div>
                <div>
                  <Label>Reminder Type</Label>
                  <div className="flex gap-2 mt-2">
                    {(['email', 'sms', 'both'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={reminderType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setReminderType(type)}
                      >
                        {type === 'both' ? 'Both' : type.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Custom Message (optional)</Label>
                  <Input
                    placeholder="Add a personal message..."
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSendReminderDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                onClick={handleSendReminder}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Process Renewal Dialog */}
        <Dialog open={isProcessRenewalDialogOpen} onOpenChange={setIsProcessRenewalDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Process Renewal
              </DialogTitle>
            </DialogHeader>
            {selectedRenewal && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{selectedRenewal.customerName}</p>
                    <Badge className={getStatusColor(selectedRenewal.status)}>
                      {selectedRenewal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current ARR</p>
                      <p className="font-medium">{formatCurrency(selectedRenewal.currentARR)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Proposed ARR</p>
                      <p className="font-medium text-violet-600">{formatCurrency(selectedRenewal.proposedARR)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Select Action</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-2">
                    <Button
                      variant="outline"
                      className="flex-col h-20 border-green-300 hover:bg-green-50 hover:border-green-500"
                      onClick={() => handleProcessRenewalAction('approve')}
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                      <span className="text-xs">Approve</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col h-20 border-red-300 hover:bg-red-50 hover:border-red-500"
                      onClick={() => handleProcessRenewalAction('reject')}
                    >
                      <XCircle className="w-5 h-5 text-red-600 mb-1" />
                      <span className="text-xs">Reject</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col h-20 border-amber-300 hover:bg-amber-50 hover:border-amber-500"
                      onClick={() => handleProcessRenewalAction('escalate')}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-600 mb-1" />
                      <span className="text-xs">Escalate</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsProcessRenewalDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-teal-600" />
                Export Renewals
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <div className="flex gap-2 mt-2">
                  {(['csv', 'excel', 'pdf'] as const).map((format) => (
                    <Button
                      key={format}
                      variant={exportFormat === format ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat(format)}
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Start Date (optional)</Label>
                  <Input
                    type="date"
                    value={exportDateRange.start}
                    onChange={(e) => setExportDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date (optional)</Label>
                  <Input
                    type="date"
                    value={exportDateRange.end}
                    onChange={(e) => setExportDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-medium">{renewals.length} renewals will be exported</p>
                <p className="text-muted-foreground">Total ARR: {formatCurrency(stats.totalCurrentARR)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                onClick={handleExportWithOptions}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Filter Renewals
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <select
                  value={filterCriteria.status}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="in_progress">In Progress</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="at_risk">At Risk</option>
                  <option value="won">Won</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  value={filterCriteria.priority}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label>Health Score</Label>
                <select
                  value={filterCriteria.healthScore}
                  onChange={(e) => setFilterCriteria(prev => ({ ...prev, healthScore: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="all">All Health Scores</option>
                  <option value="healthy">Healthy</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="at_risk">At Risk</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filterCriteria.dateRange.start}
                    onChange={(e) => setFilterCriteria(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={filterCriteria.dateRange.end}
                    onChange={(e) => setFilterCriteria(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear All
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsFiltersDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Forecast Dialog */}
        <Dialog open={isForecastDialogOpen} onOpenChange={setIsForecastDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-indigo-600" />
                Renewal Forecast
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Forecasted ARR</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(forecasts.reduce((sum, f) => sum + f.arr, 0))}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expected Expansion</p>
                  <p className="text-2xl font-bold text-blue-600">
                    +{formatCurrency(forecasts.reduce((sum, f) => sum + f.expansion, 0))}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expected Churn</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{formatCurrency(forecasts.reduce((sum, f) => sum + f.churn, 0))}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {forecasts.slice(0, 4).map((forecast) => (
                  <div key={forecast.month} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{forecast.month}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-sm">{forecast.renewals} renewals</span>
                      <span className="font-semibold">{formatCurrency(forecast.arr)}</span>
                      <Badge className={forecast.netRetention >= 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {forecast.netRetention}% NRR
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsForecastDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* At Risk Dialog */}
        <Dialog open={isAtRiskDialogOpen} onOpenChange={setIsAtRiskDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                At-Risk Accounts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-red-600">
                      {renewals.filter(r => r.status === 'at_risk').length} At-Risk Renewals
                    </p>
                    <p className="text-sm text-red-500">
                      Total ARR at risk: {formatCurrency(stats.atRiskARR)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {renewals.filter(r => r.status === 'at_risk').map((renewal) => (
                  <div
                    key={renewal.id}
                    className="p-4 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={() => {
                      setSelectedRenewal(renewal)
                      setIsAtRiskDialogOpen(false)
                      setIsRenewalDialogOpen(true)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{renewal.customerName}</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(renewal.currentARR)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {renewal.riskFactors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-300">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>CSM: {renewal.csmName}</span>
                      <span>{renewal.daysToRenewal} days to renewal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAtRiskDialogOpen(false)}>
                Close
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  toast.info('Escalating all at-risk accounts')
                  setIsAtRiskDialogOpen(false)
                }}
              >
                Escalate All
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Playbooks Dialog */}
        <Dialog open={isPlaybookDialogOpen} onOpenChange={setIsPlaybookDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Select Playbook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
              {playbooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className="p-4 border rounded-lg hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 cursor-pointer transition-all"
                  onClick={() => handleRunSelectedPlaybook(playbook.name)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{playbook.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{playbook.description}</p>
                    </div>
                    <Badge className={getTypeColor(playbook.type as any)}>{playbook.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {playbook.successRate}% success rate
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      {playbook.timesUsed} times used
                    </span>
                    <span>{playbook.steps.length} steps</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsPlaybookDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reports Dialog */}
        <Dialog open={isReportsDialogOpen} onOpenChange={setIsReportsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                Generate Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {[
                { name: 'Pipeline Summary', description: 'Overview of all active renewals', icon: GitBranch },
                { name: 'Revenue Forecast', description: 'Projected ARR and expansion', icon: LineChart },
                { name: 'Health Analysis', description: 'Customer health score breakdown', icon: Activity },
                { name: 'At-Risk Report', description: 'Detailed at-risk account analysis', icon: AlertTriangle },
                { name: 'CSM Performance', description: 'Team performance metrics', icon: Users },
              ].map((report) => (
                <Button
                  key={report.name}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleGenerateReport(report.name)}
                >
                  <report.icon className="w-5 h-5 mr-3 text-amber-600" />
                  <div className="text-left">
                    <p className="font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsReportsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customers Dialog */}
        <Dialog open={isCustomersDialogOpen} onOpenChange={setIsCustomersDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Customer Overview
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3 py-4">
                {renewals.map((renewal) => (
                  <div
                    key={renewal.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      handleViewCustomerDetails(renewal.customerName)
                      setSelectedRenewal(renewal)
                      setIsCustomersDialogOpen(false)
                      setIsRenewalDialogOpen(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                            {renewal.customerName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{renewal.customerName}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(renewal.status)} variant="secondary">
                              {renewal.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">CSM: {renewal.csmName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(renewal.currentARR)}</p>
                        <p className={`text-sm ${getHealthColor(renewal.healthScore)}`}>
                          Health: {renewal.healthScoreValue}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsCustomersDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
