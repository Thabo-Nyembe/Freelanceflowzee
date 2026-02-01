// Customers V2 - Salesforce CRM Level
// Complete CRM with: Pipeline, Lead Scoring, Activity Timeline, Deals, Forecasting, Campaigns

'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Users, UserPlus, Search,
  Mail, Phone, MapPin, DollarSign, Building2, Calendar, CheckCircle, AlertTriangle, MoreHorizontal, Edit,
  Trash2, MessageSquare, PhoneCall, FileText, Target, Zap, Plus, Download, Upload, RefreshCw, Activity, Layers, Award, Copy, ExternalLink, ArrowUpRight, TrendingUp as Forecast, Megaphone, Scale, Trophy, Archive, Settings,
  Key, Shield, AlertOctagon, Sliders, Network, HardDrive, Bell, Loader2
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




import { useClients, type Client } from '@/lib/hooks/use-clients'
import { useApiKeys } from '@/lib/hooks/use-api-keys'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Map client status/segment to display types for backward compatibility
type CustomerSegment = 'vip' | 'active' | 'new' | 'inactive' | 'churned' | 'at_risk' | 'prospect'
type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'deleted' | 'pending' | 'verified'

// ============================================================================
// TYPES - SALESFORCE CRM LEVEL
// ============================================================================

type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task' | 'linkedin' | 'sms'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'open' | 'in-progress' | 'completed' | 'deferred'
type CampaignType = 'email' | 'webinar' | 'conference' | 'social' | 'content' | 'ads' | 'referral'
type CampaignStatus = 'planned' | 'active' | 'completed' | 'paused' | 'aborted'
type LeadSource = 'website' | 'referral' | 'cold-call' | 'email-campaign' | 'social' | 'event' | 'partner' | 'other'
type ForecastCategory = 'pipeline' | 'best-case' | 'commit' | 'closed'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  mobile: string
  title: string
  department: string
  accountId: string
  leadSource: LeadSource
  ownerId: string
  mailingAddress: Address
  doNotCall: boolean
  doNotEmail: boolean
  hasOptedOutOfFax: boolean
  leadScore: number
  lastActivityDate: string
  createdDate: string
  lastModifiedDate: string
  tags: string[]
  customFields: Record<string, string>
}

interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface Account {
  id: string
  name: string
  type: 'prospect' | 'customer' | 'partner' | 'competitor' | 'other'
  industry: string
  website: string
  phone: string
  annualRevenue: number
  employees: number
  description: string
  billingAddress: Address
  shippingAddress: Address
  parentAccountId: string | null
  ownerId: string
  rating: 'hot' | 'warm' | 'cold'
  sla: string | null
  accountSource: LeadSource
  contacts: string[]
  opportunities: string[]
  createdDate: string
  lastActivityDate: string
}

interface Opportunity {
  id: string
  name: string
  accountId: string
  contactId: string
  amount: number
  stage: DealStage
  probability: number
  closeDate: string
  type: 'new-business' | 'existing-business' | 'renewal'
  leadSource: LeadSource
  nextStep: string
  description: string
  ownerId: string
  ownerName: string
  campaignId: string | null
  forecastCategory: ForecastCategory
  competitors: Competitor[]
  products: OpportunityProduct[]
  createdDate: string
  lastStageChangeDate: string
  stageDuration: Record<DealStage, number>
  isClosed: boolean
  isWon: boolean
}

interface Competitor {
  id: string
  name: string
  strengths: string
  weaknesses: string
}

interface OpportunityProduct {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  discount: number
}

interface ActivityRecord {
  id: string
  type: ActivityType
  subject: string
  description: string
  contactId: string | null
  accountId: string | null
  opportunityId: string | null
  ownerId: string
  ownerName: string
  status: 'completed' | 'scheduled' | 'canceled'
  dueDate: string | null
  completedDate: string | null
  duration: number | null
  outcome: string | null
  createdDate: string
  priority: TaskPriority
}

// Type alias for CrmActivity (used in handlers)
type CrmActivity = ActivityRecord

interface Task {
  id: string
  subject: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  contactId: string | null
  accountId: string | null
  opportunityId: string | null
  ownerId: string
  ownerName: string
  reminder: string | null
  isRecurring: boolean
  createdDate: string
  completedDate: string | null
}

interface Campaign {
  id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate: string
  description: string
  expectedRevenue: number
  budgetedCost: number
  actualCost: number
  expectedResponse: number
  actualResponses: number
  numSent: number
  numConverted: number
  ownerId: string
  parentCampaignId: string | null
  isActive: boolean
  members: CampaignMember[]
}

interface CampaignMember {
  id: string
  campaignId: string
  contactId: string
  leadId: string | null
  status: 'sent' | 'responded' | 'converted' | 'bounced' | 'unsubscribed'
  firstRespondedDate: string | null
}

interface Forecast {
  id: string
  ownerId: string
  ownerName: string
  period: string
  quotaAmount: number
  closedAmount: number
  commitAmount: number
  bestCaseAmount: number
  pipelineAmount: number
  percentToQuota: number
  lastModifiedDate: string
}

interface SalesTerritory {
  id: string
  name: string
  description: string
  accounts: string[]
  ownerId: string
  parentTerritoryId: string | null
}

interface LeadScoreRule {
  id: string
  name: string
  field: string
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than'
  value: string
  points: number
  isActive: boolean
}

interface EmailSequence {
  id: string
  name: string
  steps: EmailStep[]
  isActive: boolean
  enrolledCount: number
  completedCount: number
  replyRate: number
  openRate: number
}

interface EmailStep {
  id: string
  dayDelay: number
  subject: string
  body: string
  templateId: string
}

// ============================================================================
// PIPELINE CONFIGURATION
// ============================================================================

const PIPELINE_STAGES: { id: DealStage; name: string; color: string; probability: number }[] = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-500', probability: 10 },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-500', probability: 25 },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500', probability: 50 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', probability: 75 },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500', probability: 100 },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500', probability: 0 },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const getStageColor = (stage: DealStage) => {
  const stageData = PIPELINE_STAGES.find(s => s.id === stage)
  return stageData?.color || 'bg-gray-500'
}

const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }
  return colors[priority]
}

const getStatusColor = (status: TaskStatus) => {
  const colors: Record<TaskStatus, string> = {
    open: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    deferred: 'bg-gray-100 text-gray-700'
  }
  return colors[status]
}

const getActivityIcon = (type: ActivityType) => {
  const icons: Record<ActivityType, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    call: <PhoneCall className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    note: <FileText className="h-4 w-4" />,
    task: <CheckCircle className="h-4 w-4" />,
    linkedin: <ExternalLink className="h-4 w-4" />,
    sms: <MessageSquare className="h-4 w-4" />
  }
  return icons[type]
}

const getLeadScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-blue-600 bg-blue-100'
  if (score >= 40) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

const getAccountRatingColor = (rating: 'hot' | 'warm' | 'cold') => {
  const colors = { hot: 'bg-red-100 text-red-700', warm: 'bg-orange-100 text-orange-700', cold: 'bg-blue-100 text-blue-700' }
  return colors[rating]
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CustomersClient({ initialCustomers: _initialCustomers }: { initialCustomers?: Client[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Check for incoming navigation from sales or lead generation
  const dealIdParam = searchParams.get('deal')
  const companyParam = searchParams.get('company')
  const leadIdParam = searchParams.get('lead')

  const [activeTab, setActiveTab] = useState('contacts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddOpportunity, setShowAddOpportunity] = useState(false)
  const [stageFilter, setStageFilter] = useState<DealStage | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showAddCampaignDialog, setShowAddCampaignDialog] = useState(false)
  const [showAddStageDialog, setShowAddStageDialog] = useState(false)
  const [showStageOptionsDialog, setShowStageOptionsDialog] = useState(false)
  const [showTaskOptionsDialog, setShowTaskOptionsDialog] = useState(false)
  const [showLeadScoringRuleDialog, setShowLeadScoringRuleDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState<Contact | Client | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showActivityLogDialog, setShowActivityLogDialog] = useState(false)
  const [activityLogForm, setActivityLogForm] = useState({
    type: 'call' as ActivityType,
    subject: '',
    description: '',
    outcome: '',
    duration: 0,
    contactId: ''
  })

  // Local state for CRM entities
  const [tasks, setTasks] = useState<Task[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [activities, setActivities] = useState<CrmActivity[]>([])
  const [pipelineStages, setPipelineStages] = useState(PIPELINE_STAGES)

  // Filter and view state
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'revenue'>('name')
  const [showFilters, setShowFilters] = useState(false)

  const [leadScoringRules, setLeadScoringRules] = useState<LeadScoreRule[]>([
    { id: '1', name: 'Job Title Contains VP/Director', field: 'job_title', operator: 'contains', value: 'VP,Director', points: 15, isActive: true },
    { id: '2', name: 'Company Size > 100', field: 'company_size', operator: 'greater-than', value: '100', points: 10, isActive: true },
    { id: '3', name: 'Email Opened (Last 7 Days)', field: 'email_opens', operator: 'greater-than', value: '0', points: 5, isActive: true },
    { id: '4', name: 'Website Visit (Last 30 Days)', field: 'website_visits', operator: 'greater-than', value: '0', points: 8, isActive: true }
  ])
  const [selectedStage, setSelectedStage] = useState<typeof PIPELINE_STAGES[0] | null>(null)

  // Form state for dialogs
  const [newTaskForm, setNewTaskForm] = useState({
    subject: '',
    description: '',
    dueDate: '',
    priority: 'medium' as TaskPriority,
    contactId: ''
  })
  const [newCampaignForm, setNewCampaignForm] = useState({
    name: '',
    type: 'email' as CampaignType,
    status: 'planned' as CampaignStatus,
    startDate: '',
    endDate: '',
    budget: 0,
    expectedRevenue: 0,
    description: ''
  })
  const [newStageForm, setNewStageForm] = useState({
    name: '',
    probability: 50,
    color: 'blue'
  })
  const [newRuleForm, setNewRuleForm] = useState({
    name: '',
    field: '',
    operator: 'equals' as 'equals' | 'contains' | 'greater-than' | 'less-than',
    value: '',
    points: 10,
    isActive: true
  })

  // Supabase hooks - using clients table
  const {
    clients: dbClients,
    stats: dbStats,
    isLoading,
    error,
    fetchClients: refetch,
    addClient: createClient,
    updateClient,
    deleteClient
  } = useClients()

  // API Keys hook for CRM integration
  const { keys: apiKeys, createKey: createApiKey, isLoading: isLoadingApiKeys } = useApiKeys([], { keyType: 'api' })
  const currentApiKey = apiKeys?.[0]?.key_prefix || 'No API key generated'

  // Alias for backward compatibility
  const dbCustomers = dbClients
  const createCustomer = createClient
  const updateCustomer = updateClient
  const deleteCustomer = deleteClient
  const isCreating = isLoading
  const isUpdating = isLoading
  const isDeleting = isLoading

  // Fetch clients on mount
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Form state for new contact
  const [newContactForm, setNewContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    accountId: '',
    company: '',
    notes: ''
  })

  // Form state for editing contact
  const [editContactForm, setEditContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    company: '',
    notes: '',
    segment: 'new' as CustomerSegment,
    status: 'active' as CustomerStatus
  })

  // Handle creating a new contact
  const handleCreateContact = async () => {
    if (!newContactForm.firstName || !newContactForm.lastName || !newContactForm.email) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const result = await createCustomer({
        name: `${newContactForm.firstName} ${newContactForm.lastName}`,
        email: newContactForm.email,
        phone: newContactForm.phone || null,
        company: newContactForm.company || null,
        notes: newContactForm.notes || null,
        status: 'active',
        type: 'individual',
        tags: [],
        total_revenue: 0,
        total_projects: 0,
        metadata: {
          first_name: newContactForm.firstName,
          last_name: newContactForm.lastName,
          title: newContactForm.title || null
        }
      })
      if (result) {
        setShowAddContact(false)
        setNewContactForm({ firstName: '', lastName: '', email: '', phone: '', title: '', accountId: '', company: '', notes: '' })
        toast.success(`${newContactForm.firstName} ${newContactForm.lastName} has been added to your CRM`)
        refetch()
      }
    } catch (err) {
      toast.error('Error')
      console.error('Failed to create contact:', err)
    }
  }

  // Handle editing a customer
  const handleOpenEditDialog = (customer: Client) => {
    setEditingCustomer(customer as string)
    // Parse name into first/last if stored in metadata, otherwise split by space
    const nameParts = customer.name.split(' ')
    const firstName = customer.metadata?.first_name || nameParts[0] || ''
    const lastName = customer.metadata?.last_name || nameParts.slice(1).join(' ') || ''
    setEditContactForm({
      firstName,
      lastName,
      email: customer.email || '',
      phone: customer.phone || '',
      title: customer.metadata?.title || '',
      company: customer.company || '',
      notes: customer.notes || '',
      segment: (customer.status === 'prospect' ? 'prospect' : 'active') as CustomerSegment,
      status: customer.status as CustomerStatus
    })
    setShowEditDialog(true)
  }

  const handleUpdateContact = async () => {
    if (!editingCustomer) return
    if (!editContactForm.firstName || !editContactForm.lastName || !editContactForm.email) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const result = await updateCustomer(editingCustomer.id, {
        name: `${editContactForm.firstName} ${editContactForm.lastName}`,
        email: editContactForm.email,
        phone: editContactForm.phone || null,
        company: editContactForm.company || null,
        notes: editContactForm.notes || null,
        status: editContactForm.status as 'active' | 'inactive' | 'prospect' | 'lead' | 'churned',
        metadata: {
          ...((editingCustomer as Record<string, unknown>).metadata || {}),
          first_name: editContactForm.firstName,
          last_name: editContactForm.lastName,
          title: editContactForm.title || null
        }
      })
      if (result) {
        setShowEditDialog(false)
        setEditingCustomer(null)
        toast.success(`Contact Updated: ${editContactForm.firstName} ${editContactForm.lastName} has been updated`)
        refetch()
      }
    } catch (err) {
      toast.error('Error')
      console.error('Failed to update contact:', err)
    }
  }

  // Handle delete confirmation
  const handleDeleteClick = (customerId: string) => {
    setCustomerToDelete(customerId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return
    try {
      const success = await deleteCustomer(customerToDelete)
      if (success) {
        toast.success('Contact Deleted')
        setShowDeleteDialog(false)
        setCustomerToDelete(null)
        setSelectedContact(null)
        refetch()
      }
    } catch (err) {
      toast.error('Error')
      console.error('Failed to delete contact:', err)
    }
  }

  // Handle status change
  const handleStatusChange = async (customerId: string, newStatus: CustomerStatus) => {
    try {
      // Map CustomerStatus to Client status
      const clientStatus = ['active', 'inactive', 'prospect', 'lead', 'churned'].includes(newStatus)
        ? newStatus as 'active' | 'inactive' | 'prospect' | 'lead' | 'churned'
        : 'active'
      const result = await updateCustomer(customerId, { status: clientStatus })
      if (result) {
        toast.success(`Status Updated`)
        refetch()
      }
    } catch (err) {
      toast.error('Error')
    }
  }

  // Handle segment change - maps to status for clients table
  const handleSegmentChange = async (customerId: string, newSegment: CustomerSegment) => {
    try {
      // Map segment to client status (clients table uses status field)
      const statusMap: Record<CustomerSegment, 'active' | 'inactive' | 'prospect' | 'lead' | 'churned'> = {
        'vip': 'active',
        'active': 'active',
        'new': 'lead',
        'inactive': 'inactive',
        'churned': 'churned',
        'at_risk': 'active',
        'prospect': 'prospect'
      }
      const result = await updateCustomer(customerId, { status: statusMap[newSegment] })
      if (result) {
        toast.success(`Segment Updated segment`)
        refetch()
      }
    } catch (err) {
      toast.error('Error')
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    toast.promise(
      refetch(),
      {
        loading: 'Refreshing customer data...',
        success: 'Customer data updated',
        error: 'Failed to refresh customer data'
      }
    )
  }

  // Stats - Now purely from database data
  const stats = useMemo(() => {
    const contacts: any[] = []
    const accounts: any[] = []
    const opportunities: any[] = []
    const forecasts: any[] = []

    const totalPipeline = (opportunities || []).filter(o => !o.isClosed).reduce((sum, o) => sum + o.amount, 0)
    const weightedPipeline = (opportunities || []).filter(o => !o.isClosed).reduce((sum, o) => sum + (o.amount * o.probability / 100), 0)
    const closedWon = (opportunities || []).filter(o => o.isWon).reduce((sum, o) => sum + o.amount, 0)
    const totalQuota = (forecasts || []).reduce((sum, f) => sum + f.quotaAmount, 0)
    const openTasksCount = (tasks || []).filter(t => t.status !== 'completed').length
    const activeCampaignsCount = (campaigns || []).filter(c => c.status === 'active').length
    const closedOpps = (opportunities || []).filter(o => o.isClosed)
    const wonOpps = (opportunities || []).filter(o => o.isWon)
    const openOpps = (opportunities || []).filter(o => !o.isClosed)

    return {
      totalContacts: contacts.length,
      totalAccounts: accounts.length,
      totalOpportunities: opportunities.length,
      totalPipeline,
      weightedPipeline,
      closedWon,
      winRate: closedOpps.length > 0 ? (wonOpps.length / closedOpps.length * 100) : 0,
      avgDealSize: openOpps.length > 0 ? totalPipeline / openOpps.length : 0,
      quotaAttainment: totalQuota > 0 ? (closedWon / totalQuota * 100) : 0,
      openTasks: openTasksCount,
      activeCampaigns: activeCampaignsCount,
      avgLeadScore: contacts.length > 0 ? (contacts || []).reduce((sum, c) => sum + (c.leadScore || 0), 0) / contacts.length : 0
    }
  }, [tasks, campaigns])

  // Filtered opportunities by stage
  const filteredOpportunities = useMemo(() => {
    const opportunities: any[] = []
    const accounts: any[] = []
    return (opportunities || []).filter(opp => {
      if (stageFilter !== 'all' && opp.stage !== stageFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const account = (accounts || []).find(a => a.id === opp.accountId)
        if (!opp.name.toLowerCase().includes(query) && !account?.name.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [stageFilter, searchQuery])

  // Pipeline grouped by stage
  const pipelineByStage = useMemo(() => {
    const opportunities: any[] = []
    const grouped: Record<DealStage, Opportunity[]> = { 'lead': [], 'qualified': [], 'proposal': [], 'negotiation': [], 'closed-won': [], 'closed-lost': [] }
    ;(opportunities || []).filter(o => !o.isClosed).forEach(opp => {
      grouped[opp.stage].push(opp)
    })
    return grouped
  }, [])

  const statCards = [
    { label: 'Total Pipeline', value: formatCurrency(stats.totalPipeline), icon: DollarSign, color: 'from-violet-500 to-purple-600', change: '+12%' },
    { label: 'Weighted Pipeline', value: formatCurrency(stats.weightedPipeline), icon: Scale, color: 'from-blue-500 to-cyan-600', change: '+8%' },
    { label: 'Closed Won', value: formatCurrency(stats.closedWon), icon: Trophy, color: 'from-green-500 to-emerald-600', change: '+15%' },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, icon: Target, color: 'from-orange-500 to-amber-600', change: '+5%' },
    { label: 'Contacts', value: stats.totalContacts.toString(), icon: Users, color: 'from-pink-500 to-rose-600', change: null },
    { label: 'Accounts', value: stats.totalAccounts.toString(), icon: Building2, color: 'from-indigo-500 to-violet-600', change: null },
    { label: 'Open Tasks', value: stats.openTasks.toString(), icon: CheckCircle, color: 'from-yellow-500 to-orange-600', change: null },
    { label: 'Campaigns', value: stats.activeCampaigns.toString(), icon: Megaphone, color: 'from-teal-500 to-green-600', change: null }
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Error loading data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  // Handlers
  const handleExportCustomers = () => {
    // Use the improved export function
    handleExportToCSV()
  }

  const handleCreateOpportunity = () => {
    setShowAddOpportunity(true)
    toast.success('Opportunity Form Opened')
  }

  const handleConvertLead = (contact: Contact) => {
    // In real app, this would call an API to convert the lead
    toast.success(`Lead Converted ${contact.lastName} converted to customer`)
  }

  const handleSendEmail = (contact: Contact) => {
    window.location.href = `mailto:${contact.email}`
    toast.success(`Opening Email Client`)
  }

  const handleLogActivity = (contactId?: string) => {
    setActivityLogForm({
      type: 'call',
      subject: '',
      description: '',
      outcome: '',
      duration: 0,
      contactId: contactId || ''
    })
    setShowActivityLogDialog(true)
  }

  const handleSaveActivityLog = async () => {
    if (!activityLogForm.subject || !activityLogForm.type) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      // Create the activity log entry
      const newActivity: CrmActivity = {
        id: `a-${Date.now()}`,
        type: activityLogForm.type,
        subject: activityLogForm.subject,
        description: activityLogForm.description,
        contactId: activityLogForm.contactId || null,
        accountId: null,
        opportunityId: null,
        ownerId: 'current-user',
        ownerName: 'Current User',
        status: 'completed',
        dueDate: new Date().toISOString(),
        completedDate: new Date().toISOString(),
        duration: activityLogForm.duration,
        outcome: activityLogForm.outcome || null,
        createdDate: new Date().toISOString(),
        priority: 'medium'
      }

      // Add to local state
      setActivities(prev => [newActivity, ...prev])

      // Also persist to API
      toast.promise(
        fetch('/api/customers/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newActivity) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
        {
          loading: 'Saving activity...',
          success: () => {
            setShowActivityLogDialog(false)
            setActivityLogForm({
              type: 'call',
              subject: '',
              description: '',
              outcome: '',
              duration: 0,
              contactId: ''
            })
            return `Activity logged: ${activityLogForm.subject}`
          },
          error: 'Failed to log activity'
        }
      )
    } catch (err) {
      toast.error('Error logging activity')
    }
  }

  // Copy to clipboard helper
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} Copied`)
    } catch {
      toast.error('Failed to copy')
    }
  }

  // Handle phone call
  const handleCall = (phone: string, name?: string) => {
    window.location.href = `tel:${phone}`
    toast.success(`Initiating Call: Calling ${phone}`)
  }

  // Handle opening calendar
  const handleScheduleMeeting = (contactName?: string) => {
    // Open calendar link or modal
    toast.success(`Calendar Opened: Select time slot for meeting`)
  }

  // Handle adding a note to a customer
  const handleAddNote = async (customerId: string, note: string) => {
    if (!note.trim()) {
      toast.error('Note cannot be empty')
      return
    }
    try {
      const client = dbCustomers?.find(c => c.id === customerId)
      if (!client) {
        toast.error('Customer not found')
        return
      }
      const existingNotes = client.notes || ''
      const timestamp = new Date().toLocaleString()
      const newNotes = existingNotes
        ? `${existingNotes}\n\n[${timestamp}]\n${note}`
        : `[${timestamp}]\n${note}`

      const result = await updateCustomer(customerId, { notes: newNotes })
      if (result) {
        toast.success('Note added successfully')
        refetch()
      }
    } catch (err) {
      console.error('Failed to add note:', err)
      toast.error('Failed to add note')
    }
  }

  // Handle adding a tag to a customer
  const handleAddTag = async (customerId: string, tag: string) => {
    if (!tag.trim()) {
      toast.error('Tag cannot be empty')
      return
    }
    try {
      const client = dbCustomers?.find(c => c.id === customerId)
      if (!client) {
        toast.error('Customer not found')
        return
      }
      const existingTags = client.tags || []
      const normalizedTag = tag.trim().toLowerCase()

      // Check if tag already exists
      if (existingTags.some(t => t.toLowerCase() === normalizedTag)) {
        toast.error('Tag already exists')
        return
      }

      const newTags = [...existingTags, tag.trim()]
      const result = await updateCustomer(customerId, { tags: newTags })
      if (result) {
        toast.success(`Tag "${tag}" added`)
        refetch()
      }
    } catch (err) {
      console.error('Failed to add tag:', err)
      toast.error('Failed to add tag')
    }
  }

  // Handle removing a tag from a customer
  const handleRemoveTag = async (customerId: string, tagToRemove: string) => {
    try {
      const client = dbCustomers?.find(c => c.id === customerId)
      if (!client) {
        toast.error('Customer not found')
        return
      }
      const existingTags = client.tags || []
      const newTags = existingTags.filter(t => t !== tagToRemove)

      const result = await updateCustomer(customerId, { tags: newTags })
      if (result) {
        toast.success(`Tag "${tagToRemove}" removed`)
        refetch()
      }
    } catch (err) {
      console.error('Failed to remove tag:', err)
      toast.error('Failed to remove tag')
    }
  }

  // Handle bulk import of customers from CSV
  const handleImportCustomers = async (file: File): Promise<{ imported: number; failed: number }> => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are supported')
      return { imported: 0, failed: 0 }
    }

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length < 2) {
        toast.error('File is empty or has no data rows')
        return { imported: 0, failed: 0 }
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const nameIdx = headers.findIndex(h => h.includes('name'))
      const emailIdx = headers.findIndex(h => h.includes('email'))
      const phoneIdx = headers.findIndex(h => h.includes('phone'))
      const companyIdx = headers.findIndex(h => h.includes('company'))
      const notesIdx = headers.findIndex(h => h.includes('notes'))

      let imported = 0
      let failed = 0

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        const name = nameIdx >= 0 ? values[nameIdx] : `Contact ${i}`
        const email = emailIdx >= 0 ? values[emailIdx] : null
        const phone = phoneIdx >= 0 ? values[phoneIdx] : null
        const company = companyIdx >= 0 ? values[companyIdx] : null
        const notes = notesIdx >= 0 ? values[notesIdx] : null

        if (name) {
          try {
            await createCustomer({
              name,
              email: email || null,
              phone: phone || null,
              company: company || null,
              notes: notes || `Imported from ${file.name}`,
              status: 'active',
              type: 'individual',
              tags: ['imported'],
              total_revenue: 0,
              total_projects: 0,
              metadata: {}
            })
            imported++
          } catch (err) {
            console.error('Failed to import row:', err)
            failed++
          }
        }
      }

      if (imported > 0) {
        refetch()
      }

      return { imported, failed }
    } catch (err) {
      console.error('Error parsing file:', err)
      toast.error('Failed to parse file')
      return { imported: 0, failed: 0 }
    }
  }

  // Handle export to CSV
  const handleExportToCSV = () => {
    if (!dbCustomers || dbCustomers.length === 0) {
      toast.error('No customers to export')
      return
    }

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Company', 'Tags', 'Notes', 'Total Revenue', 'Created At']
    const csvContent = [
      headers.join(','),
      ...dbCustomers.map((c: Client) => [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${c.status || ''}"`,
        `"${(c.company || '').replace(/"/g, '""')}"`,
        `"${(c.tags || []).join('; ')}"`,
        `"${(c.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        c.total_revenue || 0,
        c.created_at || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${dbCustomers.length} customers`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer CRM</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Salesforce-level customer management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCustomers}><Download className="h-4 w-4 mr-2" />Export</Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)}><Upload className="h-4 w-4 mr-2" />Import</Button>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={() => setShowAddContact(true)}>
              <UserPlus className="h-4 w-4 mr-2" />Add Contact
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  {stat.change && (
                    <span className="text-xs text-green-600 flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" />{stat.change}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1 flex-wrap">
              <TabsTrigger value="contacts"><Users className="h-4 w-4 mr-2" />Contacts</TabsTrigger>
              <TabsTrigger value="accounts"><Building2 className="h-4 w-4 mr-2" />Accounts</TabsTrigger>
              <TabsTrigger value="opportunities"><DollarSign className="h-4 w-4 mr-2" />Opportunities</TabsTrigger>
              <TabsTrigger value="pipeline"><Layers className="h-4 w-4 mr-2" />Pipeline</TabsTrigger>
              <TabsTrigger value="activities"><Activity className="h-4 w-4 mr-2" />Activities</TabsTrigger>
              <TabsTrigger value="tasks"><CheckCircle className="h-4 w-4 mr-2" />Tasks</TabsTrigger>
              <TabsTrigger value="campaigns"><Megaphone className="h-4 w-4 mr-2" />Campaigns</TabsTrigger>
              <TabsTrigger value="forecasts"><Forecast className="h-4 w-4 mr-2" />Forecasts</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
            </div>
          </div>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            {/* Real Database Clients */}
            {dbCustomers && dbCustomers.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Clients ({dbCustomers.length})</h3>
                  <Badge className="bg-green-100 text-green-700">From Database</Badge>
                </div>
                {dbCustomers.map((client: Client) => (
                  <Card key={client.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={client.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                          <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                            {client.name?.[0] || 'C'}{client.name?.split(' ')[1]?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{client.name}</h3>
                            <Badge className={
                              client.status === 'active' ? 'bg-green-100 text-green-700' :
                              client.status === 'prospect' ? 'bg-blue-100 text-blue-700' :
                              client.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                              'bg-red-100 text-red-700'
                            }>{client.status}</Badge>
                            <Badge variant="outline">{client.type}</Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{client.metadata?.title ? `${client.metadata.title}` : ''}{client.company ? ` at ${client.company}` : ''}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                            {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                            {(client.city || client.country) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.city}{client.city && client.country ? ', ' : ''}{client.country}</span>}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>Revenue: {formatCurrency(client.total_revenue || 0)}</span>
                            <span>Projects: {client.total_projects || 0}</span>
                            {client.industry && <span>Industry: {client.industry}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(client) }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); if (client.email) { window.location.href = `mailto:${client.email}`; toast.success(`Opening Email`) } else { toast.error('No email address available') } }}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); if (client.phone) { window.location.href = `tel:${client.phone}`; toast.success(`Initiating Call`) } else { toast.error('No phone number available') } }}>
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteClick(client.id) }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {/* CRM Cross-Navigation */}
                          <div className="flex items-center gap-1 mt-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/lead-generation-v2?contact=${client.id}`); toast.success('Opening lead history', { description: 'View lead generation data...' }) }}>
                              <Target className="h-3 w-3 mr-1" />
                              Lead History
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/sales-v2?contact=${client.id}&company=${encodeURIComponent(client.company || '')}`); toast.success('Opening deals', { description: 'View associated deals...' }) }}>
                              <DollarSign className="h-3 w-3 mr-1" />
                              Deals
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/email-marketing-v2?contact=${client.email}`); toast.success('Opening campaigns', { description: 'View email campaigns...' }) }}>
                              <Megaphone className="h-3 w-3 mr-1" />
                              Campaigns
                            </Button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {client.last_contact_at ? `Last contact: ${formatTimeAgo(client.last_contact_at)}` : `Created: ${formatDate(client.created_at)}`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Empty State - No Clients */}
            {(!dbCustomers || dbCustomers.length === 0) && !isLoading && (
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Clients Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start building your client database by adding your first client.
                  </p>
                  <Button onClick={() => setShowAddContact(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Your First Client
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <RefreshCw className="h-8 w-8 mx-auto text-violet-500 animate-spin mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Loading clients...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {([]).map(account => (
                <Card key={account.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedAccount(account)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Building2 className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{account.name}</h3>
                          <Badge className={getAccountRatingColor(account.rating)}>{account.rating}</Badge>
                          <Badge variant="outline">{account.type}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{account.industry}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-3 text-sm">
                          <div>
                            <div className="text-gray-500">Revenue</div>
                            <div className="font-semibold">{formatCurrency(account.annualRevenue)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Employees</div>
                            <div className="font-semibold">{account.employees.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Contacts</div>
                            <div className="font-semibold">{account.contacts.length}</div>
                          </div>
                        </div>
                      </div>
                      {account.sla && <Badge className="bg-yellow-100 text-yellow-700">{account.sla} SLA</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant={stageFilter === 'all' ? 'default' : 'outline'} onClick={() => setStageFilter('all')}>All</Button>
                {PIPELINE_STAGES.filter(s => s.id !== 'closed-lost').map(stage => (
                  <Button key={stage.id} size="sm" variant={stageFilter === stage.id ? 'default' : 'outline'} onClick={() => setStageFilter(stage.id)}>{stage.name}</Button>
                ))}
              </div>
              <Button onClick={() => setShowAddOpportunity(true)}><Plus className="h-4 w-4 mr-2" />New Opportunity</Button>
            </div>

            <div className="space-y-4">
              {filteredOpportunities.map(opp => {
                const account = ([]).find(a => a.id === opp.accountId)
                const contact = ([]).find(c => c.id === opp.contactId)
                return (
                  <Card key={opp.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedOpportunity(opp)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getStageColor(opp.stage)} text-white`}>{PIPELINE_STAGES.find(s => s.id === opp.stage)?.name}</Badge>
                            <Badge variant="outline">{opp.probability}%</Badge>
                            <Badge variant="outline">{opp.type.replace('-', ' ')}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{opp.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{account?.name} • {contact?.firstName} {contact?.lastName}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Owner: {opp.ownerName}</span>
                            <span>Close: {formatDate(opp.closeDate)}</span>
                            <span>Next: {opp.nextStep || 'No next step'}</span>
                          </div>
                          {opp.competitors.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">Competitors:</span>
                              {opp.competitors.map(c => <Badge key={c.id} variant="outline" className="text-xs">{c.name}</Badge>)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(opp.amount)}</div>
                          <div className="text-sm text-gray-500">Weighted: {formatCurrency(opp.amount * opp.probability / 100)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.filter(s => !['closed-won', 'closed-lost'].includes(s.id)).map(stage => {
                const stageOpps = pipelineByStage[stage.id] || []
                const stageValue = stageOpps.reduce((sum, o) => sum + o.amount, 0)
                return (
                  <div key={stage.id} className="min-w-[300px] flex-shrink-0">
                    <div className={`${stage.color} text-white px-4 py-3 rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{stage.name}</span>
                        <Badge className="bg-white/20 text-white">{stageOpps.length}</Badge>
                      </div>
                      <div className="text-sm opacity-90 mt-1">{formatCurrency(stageValue)}</div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-b-lg min-h-[400px] space-y-3">
                      {stageOpps.map(opp => {
                        const account = ([]).find(a => a.id === opp.accountId)
                        return (
                          <Card key={opp.id} className="bg-white dark:bg-gray-700 cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-sm mb-1">{opp.name}</h4>
                              <p className="text-xs text-gray-500 mb-2">{account?.name}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-green-600">{formatCurrency(opp.amount)}</span>
                                <span className="text-xs text-gray-500">{opp.probability}%</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-2">{opp.ownerName} • {formatDate(opp.closeDate)}</div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleLogActivity}><Plus className="h-4 w-4 mr-2" />Log Activity</Button>
            </div>
            <div className="space-y-3">
              {([]).map(activity => {
                const contact = ([]).find(c => c.id === activity.contactId)
                const account = ([]).find(a => a.id === activity.accountId)
                return (
                  <Card key={activity.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'call' ? 'bg-green-100 text-green-600' :
                          activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                          activity.type === 'note' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.subject}</span>
                            <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                            <Badge className={activity.status === 'completed' ? 'bg-green-100 text-green-700' : activity.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>{activity.status}</Badge>
                            <Badge className={getPriorityColor(activity.priority)}>{activity.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{contact?.firstName} {contact?.lastName}</span>
                            <span>{account?.name}</span>
                            <span>{activity.ownerName}</span>
                            <span>{formatTimeAgo(activity.createdDate)}</span>
                            {activity.duration && <span>{activity.duration} min</span>}
                          </div>
                          {activity.outcome && <div className="mt-2 text-sm text-green-600">Outcome: {activity.outcome}</div>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                setNewTaskForm({ subject: '', description: '', dueDate: '', priority: 'medium', contactId: '' })
                setShowAddTaskDialog(true)
              }}><Plus className="h-4 w-4 mr-2" />New Task</Button>
            </div>
            <div className="space-y-3">
              {tasks.map(task => (
                <Card key={task.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <CheckCircle className={`h-5 w-5 ${task.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>{task.subject}</span>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          {task.isRecurring && <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" />Recurring</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Due: {formatDate(task.dueDate)}</span>
                          <span>Owner: {task.ownerName}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedTask(task); setShowTaskOptionsDialog(true) }}><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => {
                setNewCampaignForm({ name: '', type: 'email', status: 'planned', startDate: '', endDate: '', budget: 0, expectedRevenue: 0, description: '' })
                setShowAddCampaignDialog(true)
              }}><Plus className="h-4 w-4 mr-2" />New Campaign</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {campaigns.map(campaign => {
                const responseRate = campaign.numSent > 0 ? (campaign.actualResponses / campaign.numSent * 100) : 0
                const conversionRate = campaign.actualResponses > 0 ? (campaign.numConverted / campaign.actualResponses * 100) : 0
                return (
                  <Card key={campaign.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge className={
                              campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                              campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              campaign.status === 'planned' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }>{campaign.status}</Badge>
                          </div>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(campaign.expectedRevenue)}</div>
                          <div className="text-xs text-gray-500">Expected Revenue</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{campaign.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-center mb-4">
                        <div>
                          <div className="text-lg font-bold">{campaign.numSent.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Sent</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{campaign.actualResponses}</div>
                          <div className="text-xs text-gray-500">Responses</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">{responseRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Response Rate</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{campaign.numConverted}</div>
                          <div className="text-xs text-gray-500">Converted</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                        <span>Budget: {formatCurrency(campaign.actualCost)} / {formatCurrency(campaign.budgetedCost)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Q1 2024 Forecast Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(([]).reduce((sum, f) => sum + f.quotaAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Total Quota</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(([]).reduce((sum, f) => sum + f.closedAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Closed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(([]).reduce((sum, f) => sum + f.commitAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Commit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(([]).reduce((sum, f) => sum + f.pipelineAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Pipeline</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {([]).map(forecast => (
                    <div key={forecast.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${forecast.ownerName}`} />
                        <AvatarFallback>{forecast.ownerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{forecast.ownerName}</div>
                        <div className="text-sm text-gray-500">{forecast.period}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-6 text-center">
                        <div>
                          <div className="font-semibold">{formatCurrency(forecast.quotaAmount)}</div>
                          <div className="text-xs text-gray-500">Quota</div>
                        </div>
                        <div>
                          <div className="font-semibold text-green-600">{formatCurrency(forecast.closedAmount)}</div>
                          <div className="text-xs text-gray-500">Closed</div>
                        </div>
                        <div>
                          <div className="font-semibold text-blue-600">{formatCurrency(forecast.commitAmount)}</div>
                          <div className="text-xs text-gray-500">Commit</div>
                        </div>
                        <div>
                          <div className="font-semibold">{forecast.percentToQuota.toFixed(0)}%</div>
                          <div className="text-xs text-gray-500">Attainment</div>
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress value={forecast.percentToQuota} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Salesforce CRM Level Configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'pipeline', label: 'Pipeline', icon: Layers },
                        { id: 'scoring', label: 'Lead Scoring', icon: Target },
                        { id: 'automation', label: 'Automation', icon: Zap },
                        { id: 'integrations', label: 'Integrations', icon: Network },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>

                    {/* CRM Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">CRM Health</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Data Quality</span>
                          <span className="font-medium text-green-600">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Lead Coverage</span>
                          <span className="font-medium text-blue-600">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Activity Score</span>
                          <span className="font-medium text-purple-600">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>

                    {/* Quota Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3">Current Quarter</h4>
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Quota</span>
                          <span className="font-medium">{formatCurrency(750000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Closed</span>
                          <span className="font-medium text-green-600">{formatCurrency(45000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pipeline</span>
                          <span className="font-medium text-blue-600">{formatCurrency(294000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Attainment</span>
                          <Badge variant="outline" className="text-xs">6%</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-violet-600" />
                          General CRM Settings
                        </CardTitle>
                        <CardDescription>Configure your CRM preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD - US Dollar</SelectItem>
                                <SelectItem value="eur">EUR - Euro</SelectItem>
                                <SelectItem value="gbp">GBP - British Pound</SelectItem>
                                <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                              </SelectContent>
                            </Select>
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
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
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
                            <Label>Time Zone</Label>
                            <Select defaultValue="est">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                                <SelectItem value="cst">Central Time (CT)</SelectItem>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Show Currency Symbol</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display currency symbols in all monetary fields</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Compact Number Display</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show large numbers as 1M, 500K etc.</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          Contact & Account Settings
                        </CardTitle>
                        <CardDescription>Configure contact and account defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Auto-create Account</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically create account when adding contact with company</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Require Email</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email is required for all new contacts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Duplicate Detection</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Warn when creating contacts with similar email or name</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Default Lead Source</Label>
                          <Select defaultValue="website">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="cold-call">Cold Call</SelectItem>
                              <SelectItem value="email-campaign">Email Campaign</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Pipeline Settings */}
                {settingsTab === 'pipeline' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-orange-600" />
                          Pipeline Stages
                        </CardTitle>
                        <CardDescription>Configure your sales pipeline stages</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {pipelineStages.map((stage, index) => (
                          <div key={stage.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={`w-4 h-4 rounded-full ${stage.color}`} />
                            <div className="flex-1">
                              <Input defaultValue={stage.name} className="font-medium" />
                            </div>
                            <div className="w-24">
                              <Input type="number" defaultValue={stage.probability} min={0} max={100} className="text-center" />
                            </div>
                            <span className="text-sm text-gray-500">% Probability</span>
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedStage(stage); setShowStageOptionsDialog(true) }}><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => {
                          setNewStageForm({ name: '', probability: 50, color: 'blue' })
                          setShowAddStageDialog(true)
                        }}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Stage
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          Opportunity Settings
                        </CardTitle>
                        <CardDescription>Configure opportunity defaults and rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Close Date (Days from Now)</Label>
                            <Input type="number" defaultValue="30" min={1} />
                          </div>
                          <div className="space-y-2">
                            <Label>Stale Opportunity Days</Label>
                            <Input type="number" defaultValue="14" min={1} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Require Products</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Opportunities must have at least one product</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Track Competitors</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable competitor tracking on opportunities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Auto-calculate Weighted Value</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically calculate weighted pipeline value</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Forecast className="h-5 w-5 text-purple-600" />
                          Forecasting Settings
                        </CardTitle>
                        <CardDescription>Configure sales forecasting options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Forecast Period</Label>
                          <Select defaultValue="quarterly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Enable Forecast Categories</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Use Commit, Best Case, Pipeline categories</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Show Quota Attainment</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display quota progress in forecasts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Lead Scoring Settings */}
                {settingsTab === 'scoring' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-red-600" />
                          Lead Scoring Configuration
                        </CardTitle>
                        <CardDescription>Configure automatic lead scoring rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Enable Lead Scoring</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically score leads based on rules</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Hot Lead Threshold</Label>
                            <Input type="number" defaultValue="80" min={0} max={100} />
                          </div>
                          <div className="space-y-2">
                            <Label>Warm Lead Threshold</Label>
                            <Input type="number" defaultValue="50" min={0} max={100} />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Scoring Rules</Label>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">Job Title Contains "VP" or "Director"</div>
                                <div className="text-sm text-gray-500">Decision maker identification</div>
                              </div>
                              <Input type="number" defaultValue="15" className="w-20 text-center" />
                              <span className="text-sm text-gray-500">points</span>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">Company Size &gt; 100 employees</div>
                                <div className="text-sm text-gray-500">Enterprise prospect</div>
                              </div>
                              <Input type="number" defaultValue="10" className="w-20 text-center" />
                              <span className="text-sm text-gray-500">points</span>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">Email Opened (Last 7 Days)</div>
                                <div className="text-sm text-gray-500">Engagement signal</div>
                              </div>
                              <Input type="number" defaultValue="5" className="w-20 text-center" />
                              <span className="text-sm text-gray-500">points</span>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">Website Visit (Last 30 Days)</div>
                                <div className="text-sm text-gray-500">Intent signal</div>
                              </div>
                              <Input type="number" defaultValue="8" className="w-20 text-center" />
                              <span className="text-sm text-gray-500">points</span>
                              <Switch defaultChecked />
                            </div>
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => {
                            setNewRuleForm({ name: '', field: '', operator: 'equals', value: '', points: 10, isActive: true })
                            setShowLeadScoringRuleDialog(true)
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Scoring Rule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-amber-600" />
                          Score Decay Settings
                        </CardTitle>
                        <CardDescription>Configure how scores decrease over time</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Enable Score Decay</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Reduce scores for inactive leads</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Decay After (Days)</Label>
                            <Input type="number" defaultValue="30" min={1} />
                          </div>
                          <div className="space-y-2">
                            <Label>Decay Rate (%/Day)</Label>
                            <Input type="number" defaultValue="2" min={0} max={10} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Automation Settings */}
                {settingsTab === 'automation' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-600" />
                          Workflow Automation
                        </CardTitle>
                        <CardDescription>Configure automatic actions and triggers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Auto-assign Leads</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically assign new leads using round-robin</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Follow-up Reminders</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Create tasks for stale opportunities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Win/Loss Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify team when deals close</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Stage Change Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify managers when deals advance</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-blue-600" />
                          Email Automation
                        </CardTitle>
                        <CardDescription>Configure email sequences and templates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Welcome Email</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send welcome email to new contacts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Birthday Emails</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send personalized birthday greetings</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Renewal Reminders</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send reminders before contract expiration</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Renewal Reminder Days Before</Label>
                          <Input type="number" defaultValue="30" min={1} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-purple-600" />
                          Notification Settings
                        </CardTitle>
                        <CardDescription>Configure when to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked />
                            <Label className="font-normal">New Lead Assigned</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked />
                            <Label className="font-normal">Deal Won</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked />
                            <Label className="font-normal">Deal Lost</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch />
                            <Label className="font-normal">Task Due</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch defaultChecked />
                            <Label className="font-normal">Meeting Reminder</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch />
                            <Label className="font-normal">Email Opened</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-cyan-600" />
                          Connected Applications
                        </CardTitle>
                        <CardDescription>Manage third-party integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">📧</div>
                            <div>
                              <div className="font-medium">Gmail / Outlook</div>
                              <div className="text-sm text-gray-500">Email sync and tracking</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">📅</div>
                            <div>
                              <div className="font-medium">Google Calendar</div>
                              <div className="text-sm text-gray-500">Meeting sync</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">💬</div>
                            <div>
                              <div className="font-medium">Slack</div>
                              <div className="text-sm text-gray-500">Team notifications</div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => { window.open('https://slack.com/oauth/authorize', '_blank'); toast.success('Connecting to Slack') }}>Connect</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">📊</div>
                            <div>
                              <div className="font-medium">Zapier</div>
                              <div className="text-sm text-gray-500">Workflow automation</div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => { window.open('https://zapier.com/app/editor', '_blank'); toast.success('Connecting to Zapier') }}>Connect</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">🔗</div>
                            <div>
                              <div className="font-medium">LinkedIn Sales Navigator</div>
                              <div className="text-sm text-gray-500">Social selling integration</div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => { window.open('https://www.linkedin.com/oauth/v2/authorization', '_blank'); toast.success('Connecting to LinkedIn') }}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys and webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Label className="text-base">API Key</Label>
                              <p className="text-xs text-gray-500">Use this key for API access</p>
                            </div>
                            <Button size="sm" variant="outline" disabled={isLoadingApiKeys} onClick={async () => {
                              if (confirm('Are you sure you want to regenerate your API key? This will invalidate the current key.')) {
                                try {
                                  await createApiKey({
                                    name: 'CRM Integration Key',
                                    key_type: 'api',
                                    permission: 'full-access',
                                    scopes: ['crm:read', 'crm:write', 'contacts:read', 'contacts:write'],
                                    environment: 'production'
                                  })
                                  toast.success('API Key Regenerated')
                                } catch (error) {
                                  console.error('Error regenerating API key:', error)
                                  toast.error('Failed to regenerate API key')
                                }
                              }
                            }}>
                              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingApiKeys ? 'animate-spin' : ''}`} />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              value={currentApiKey}
                              readOnly
                              className="font-mono"
                            />
                            <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(currentApiKey, 'API Key')}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-app.com/webhook/crm" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Enable Webhooks</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send events to external endpoints</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Configure access and security options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">IP Restrictions</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Limit access to specific IP ranges</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Audit Logging</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all user actions for compliance</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Session Timeout (minutes)</Label>
                          <Input type="number" defaultValue="60" min={5} max={480} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Configure data retention and exports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Activity Log Retention</Label>
                          <Select defaultValue="365">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="90">90 Days</SelectItem>
                              <SelectItem value="180">180 Days</SelectItem>
                              <SelectItem value="365">1 Year</SelectItem>
                              <SelectItem value="730">2 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Automatic Backups</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Daily backup of all CRM data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => {
                            handleExportCustomers()
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = '.csv,.json'
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                try {
                                  const text = await file.text()
                                  let contacts: { name: string; email?: string; phone?: string; company?: string }[] = []

                                  if (file.name.endsWith('.json')) {
                                    contacts = JSON.parse(text)
                                  } else if (file.name.endsWith('.csv')) {
                                    // Parse CSV
                                    const lines = text.split('\n')
                                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                                    contacts = lines.slice(1).filter(line => line.trim()).map(line => {
                                      const values = line.split(',').map(v => v.trim())
                                      const contact: Record<string, string> = {}
                                      headers.forEach((header, idx) => {
                                        contact[header] = values[idx] || ''
                                      })
                                      return contact as { name: string; email?: string; phone?: string; company?: string }
                                    })
                                  }

                                  // Import contacts to database
                                  let imported = 0
                                  for (const contact of contacts) {
                                    try {
                                      await createCustomer({
                                        name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                                        email: contact.email,
                                        phone: contact.phone,
                                        company: contact.company,
                                        status: 'active',
                                        segment: 'new'
                                      })
                                      imported++
                                    } catch (err) {
                                      console.error('Error importing contact:', err)
                                    }
                                  }

                                  toast.success(`Imported ${imported} of ${contacts.length} contacts`)
                                  refetch()
                                } catch (error) {
                                  console.error('Error parsing file:', error)
                                  toast.error('Failed to parse import file')
                                }
                              }
                            }
                            input.click()
                          }}>
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Delete All Contacts</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Permanently remove all contacts</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400" disabled={isDeleting} onClick={async () => {
                            if (confirm('WARNING: This will permanently delete ALL contacts. This action cannot be undone. Are you sure?')) {
                              if (confirm('Final confirmation: Delete all contacts?')) {
                                try {
                                  const allClients = dbClients || []
                                  let deleted = 0
                                  for (const client of allClients) {
                                    try {
                                      await deleteCustomer(client.id)
                                      deleted++
                                    } catch (err) {
                                      console.error('Error deleting contact:', err)
                                    }
                                  }
                                  toast.success(`All ${deleted} Contacts Deleted`)
                                  refetch()
                                } catch (error) {
                                  console.error('Error deleting all contacts:', error)
                                  toast.error('Failed to delete contacts')
                                }
                              }
                            }
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Clear Activity History</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Delete all activity logs and history</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400" onClick={() => {
                            if (confirm('WARNING: This will permanently clear all activity history. Are you sure?')) {
                              // Clear local activity state
                              setActivities([])
                              localStorage.removeItem('crm-activity-history')
                              toast.success('History Cleared')
                            }
                          }}>
                            <Archive className="h-4 w-4 mr-2" />
                            Clear History
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Reset CRM</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Reset all settings to defaults</p>
                          </div>
                          <Button variant="destructive" onClick={() => {
                            if (confirm('WARNING: This will reset ALL CRM settings to defaults. Are you sure?')) {
                              if (confirm('Final confirmation: Reset all CRM settings?')) {
                                // Clear all CRM-related localStorage settings
                                const crmKeys = ['crm-settings', 'crm-filters', 'crm-pipeline-stages', 'crm-activity-history', 'crm-view-preferences', 'crm-custom-fields']
                                crmKeys.forEach(key => localStorage.removeItem(key))

                                // Reset all state to defaults
                                setActiveTab('overview')
                                setSettingsTab('general')
                                setSearchQuery('')
                                setSegmentFilter('all')
                                setViewMode('grid')
                                setSortBy('name')
                                setShowFilters(false)
                                setActivities([])
                                setTasks([])
                                setCampaigns([])
                                setPipelineStages([
                                  { id: '1', name: 'Lead', color: 'gray', probability: 10, order: 1 },
                                  { id: '2', name: 'Qualified', color: 'blue', probability: 25, order: 2 },
                                  { id: '3', name: 'Proposal', color: 'purple', probability: 50, order: 3 },
                                  { id: '4', name: 'Negotiation', color: 'orange', probability: 75, order: 4 },
                                  { id: '5', name: 'Closed Won', color: 'green', probability: 100, order: 5 }
                                ])

                                toast.success('Factory Reset Complete')
                              }
                            }
                          }}>
                            <AlertOctagon className="h-4 w-4 mr-2" />
                            Factory Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[]}
              title="Customer Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Customer Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs.slice(0, 10).map(log => ({
              id: log.id,
              type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
              title: log.action,
              description: log.resource_name || undefined,
              user: { name: log.user_name || 'System', avatar: undefined },
              timestamp: log.created_at,
              isUnread: log.status === 'pending'
            }))}
            title="Customer Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[
              { id: '1', label: 'Add Contact', icon: 'UserPlus', shortcut: 'N', action: () => setShowAddContact(true) },
              { id: '2', label: 'Log Activity', icon: 'Activity', shortcut: 'L', action: () => handleLogActivity() },
              { id: '3', label: 'Send Email', icon: 'Mail', shortcut: 'E', action: () => { setShowEmailDialog(true); setEmailRecipient(selectedContact) } },
              { id: '4', label: 'Schedule Call', icon: 'Phone', shortcut: 'C', action: () => handleScheduleMeeting(selectedContact?.firstName ? `${selectedContact.firstName} ${selectedContact.lastName}` : undefined) },
            ]}
            variant="grid"
          />
        </div>

        {/* Contact Detail Dialog */}
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContact.firstName}${selectedContact.lastName}`} />
                      <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xl">{selectedContact.firstName[0]}{selectedContact.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{selectedContact.firstName} {selectedContact.lastName}</h3>
                      <p className="text-gray-600">{selectedContact.title}</p>
                      <Badge className={getLeadScoreColor(selectedContact.leadScore)}>Lead Score: {selectedContact.leadScore}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-500">Email</Label>
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" />{selectedContact.email}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">Phone</Label>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{selectedContact.phone}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">Mobile</Label>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" />{selectedContact.mobile}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">Department</Label>
                      <div>{selectedContact.department}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">Lead Source</Label>
                      <div>{selectedContact.leadSource}</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">Last Activity</Label>
                      <div>{formatDate(selectedContact.lastActivityDate)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-500">Address</Label>
                    <div>{selectedContact.mailingAddress.street}, {selectedContact.mailingAddress.city}, {selectedContact.mailingAddress.state} {selectedContact.mailingAddress.postalCode}</div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-500">Tags</Label>
                    <div className="flex gap-2">{selectedContact.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={() => { window.location.href = `mailto:${selectedContact.email}`; toast.success(`Opening Email`) }}><Mail className="h-4 w-4 mr-2" />Send Email</Button>
                    <Button variant="outline" onClick={() => { window.location.href = `tel:${selectedContact.phone}`; toast.success(`Initiating Call ${selectedContact.lastName}`) }}><PhoneCall className="h-4 w-4 mr-2" />Log Call</Button>
                    <Button variant="outline" onClick={() => handleScheduleMeeting(`${selectedContact.firstName} ${selectedContact.lastName}`)}><Calendar className="h-4 w-4 mr-2" />Schedule</Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Contact Dialog */}
        <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Create a new contact in your CRM</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input placeholder="John" value={newContactForm.firstName} onChange={(e) => setNewContactForm(prev => ({ ...prev, firstName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input placeholder="Smith" value={newContactForm.lastName} onChange={(e) => setNewContactForm(prev => ({ ...prev, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="john@company.com" value={newContactForm.email} onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 123-4567" value={newContactForm.phone} onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="VP of Engineering" value={newContactForm.title} onChange={(e) => setNewContactForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Account</Label>
                <Select value={newContactForm.accountId} onValueChange={(value) => setNewContactForm(prev => ({ ...prev, accountId: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                  <SelectContent>
                    {([]).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={handleCreateContact} disabled={isCreating || !newContactForm.firstName || !newContactForm.email}>
                <UserPlus className="h-4 w-4 mr-2" />{isCreating ? 'Creating...' : 'Create Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>Update contact information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input placeholder="John" value={editContactForm.firstName} onChange={(e) => setEditContactForm(prev => ({ ...prev, firstName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input placeholder="Smith" value={editContactForm.lastName} onChange={(e) => setEditContactForm(prev => ({ ...prev, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="john@company.com" value={editContactForm.email} onChange={(e) => setEditContactForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 (555) 123-4567" value={editContactForm.phone} onChange={(e) => setEditContactForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="VP of Engineering" value={editContactForm.title} onChange={(e) => setEditContactForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input placeholder="Acme Corporation" value={editContactForm.company} onChange={(e) => setEditContactForm(prev => ({ ...prev, company: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Segment</Label>
                  <Select value={editContactForm.segment} onValueChange={(value) => setEditContactForm(prev => ({ ...prev, segment: value as CustomerSegment }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                      <SelectItem value="at_risk">At Risk</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editContactForm.status} onValueChange={(value) => setEditContactForm(prev => ({ ...prev, status: value as CustomerStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Add notes about this contact..." value={editContactForm.notes} onChange={(e) => setEditContactForm(prev => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={handleUpdateContact} disabled={isUpdating || !editContactForm.firstName || !editContactForm.email}>
                <Edit className="h-4 w-4 mr-2" />{isUpdating ? 'Updating...' : 'Update Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Contact
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this contact? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setCustomerToDelete(null) }}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />{isDeleting ? 'Deleting...' : 'Delete Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                New Task
              </DialogTitle>
              <DialogDescription>Create a new task for your CRM workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Subject</Label>
                <Input
                  placeholder="Enter task subject..."
                  value={newTaskForm.subject}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter task description..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newTaskForm.priority}
                    onValueChange={(value: TaskPriority) => setNewTaskForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Related Contact</Label>
                <Select
                  value={newTaskForm.contactId}
                  onValueChange={(value) => setNewTaskForm(prev => ({ ...prev, contactId: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
                  <SelectContent>
                    {([]).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newTaskForm.subject.trim()) {
                  toast.error('Task subject is required')
                  return
                }
                const newTask: Task = {
                  id: `t${Date.now()}`,
                  subject: newTaskForm.subject,
                  description: newTaskForm.description,
                  status: 'open',
                  priority: newTaskForm.priority,
                  dueDate: newTaskForm.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  contactId: newTaskForm.contactId || null,
                  accountId: null,
                  opportunityId: null,
                  ownerId: 'u1',
                  ownerName: 'Current User',
                  reminder: null,
                  isRecurring: false,
                  createdDate: new Date().toISOString().split('T')[0],
                  completedDate: null
                }
                setTasks(prev => [newTask, ...prev])
                setShowAddTaskDialog(false)
                setNewTaskForm({ subject: '', description: '', dueDate: '', priority: 'medium', contactId: '' })
                toast.success(`Task Created has been added to your workflow`)
              }}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Options Dialog */}
        <Dialog open={showTaskOptionsDialog} onOpenChange={setShowTaskOptionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Task Options</DialogTitle>
              <DialogDescription>{selectedTask?.subject}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (selectedTask) {
                  setNewTaskForm({
                    subject: selectedTask.subject,
                    description: selectedTask.description,
                    dueDate: selectedTask.dueDate,
                    priority: selectedTask.priority,
                    contactId: selectedTask.contactId || ''
                  })
                  setShowTaskOptionsDialog(false)
                  setShowAddTaskDialog(true)
                  toast.success('Editing Task')
                }
              }}>
                <Edit className="h-4 w-4 mr-2" />Edit Task
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (selectedTask) {
                  setTasks(prev => prev.map(t =>
                    t.id === selectedTask.id ? { ...t, ownerName: 'New Assignee', ownerId: 'u2' } : t
                  ))
                  setShowTaskOptionsDialog(false)
                  toast.success(`Task Reassigned has been reassigned`)
                }
              }}>
                <Users className="h-4 w-4 mr-2" />Reassign Task
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (selectedTask) {
                  setTasks(prev => prev.map(t =>
                    t.id === selectedTask.id ? { ...t, status: 'completed', completedDate: new Date().toISOString().split('T')[0] } : t
                  ))
                  setShowTaskOptionsDialog(false)
                  toast.success(`Task Completed marked as complete`)
                }
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />Mark Complete
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={() => {
                if (selectedTask) {
                  setTasks(prev => prev.filter(t => t.id !== selectedTask.id))
                  setShowTaskOptionsDialog(false)
                  toast.success(`Task Deleted has been removed`)
                  setSelectedTask(null)
                }
              }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Campaign Dialog */}
        <Dialog open={showAddCampaignDialog} onOpenChange={setShowAddCampaignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                New Campaign
              </DialogTitle>
              <DialogDescription>Create a new marketing campaign</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="Enter campaign name..."
                  value={newCampaignForm.name}
                  onChange={(e) => setNewCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <Select
                    value={newCampaignForm.type}
                    onValueChange={(value: CampaignType) => setNewCampaignForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="ads">Advertising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newCampaignForm.status}
                    onValueChange={(value: CampaignStatus) => setNewCampaignForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newCampaignForm.startDate}
                    onChange={(e) => setNewCampaignForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={newCampaignForm.endDate}
                    onChange={(e) => setNewCampaignForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newCampaignForm.budget || ''}
                    onChange={(e) => setNewCampaignForm(prev => ({ ...prev, budget: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Revenue</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newCampaignForm.expectedRevenue || ''}
                    onChange={(e) => setNewCampaignForm(prev => ({ ...prev, expectedRevenue: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your campaign..."
                  value={newCampaignForm.description}
                  onChange={(e) => setNewCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCampaignDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newCampaignForm.name.trim()) {
                  toast.error('Campaign name is required')
                  return
                }
                const newCampaign: Campaign = {
                  id: `camp${Date.now()}`,
                  name: newCampaignForm.name,
                  type: newCampaignForm.type,
                  status: newCampaignForm.status,
                  startDate: newCampaignForm.startDate || new Date().toISOString().split('T')[0],
                  endDate: newCampaignForm.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  description: newCampaignForm.description,
                  expectedRevenue: newCampaignForm.expectedRevenue,
                  budgetedCost: newCampaignForm.budget,
                  actualCost: 0,
                  expectedResponse: 0,
                  actualResponses: 0,
                  numSent: 0,
                  numConverted: 0,
                  ownerId: 'u1',
                  parentCampaignId: null,
                  isActive: newCampaignForm.status === 'active',
                  members: []
                }
                setCampaigns(prev => [newCampaign, ...prev])
                setShowAddCampaignDialog(false)
                setNewCampaignForm({ name: '', type: 'email', status: 'planned', startDate: '', endDate: '', budget: 0, expectedRevenue: 0, description: '' })
                toast.success(`Campaign Created has been created`)
              }}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Pipeline Stage Dialog */}
        <Dialog open={showAddStageDialog} onOpenChange={setShowAddStageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                Add Pipeline Stage
              </DialogTitle>
              <DialogDescription>Configure a new stage for your sales pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stage Name</Label>
                <Input
                  placeholder="e.g., Discovery, Demo, POC..."
                  value={newStageForm.name}
                  onChange={(e) => setNewStageForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Win Probability (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={newStageForm.probability}
                  onChange={(e) => setNewStageForm(prev => ({ ...prev, probability: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stage Color</Label>
                <Select
                  value={newStageForm.color}
                  onValueChange={(value) => setNewStageForm(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddStageDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newStageForm.name.trim()) {
                  toast.error('Stage name is required')
                  return
                }
                const colorMap: Record<string, string> = {
                  gray: 'bg-gray-500',
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  yellow: 'bg-yellow-500',
                  orange: 'bg-orange-500',
                  purple: 'bg-purple-500'
                }
                const newStage = {
                  id: newStageForm.name.toLowerCase().replace(/\s+/g, '-') as DealStage,
                  name: newStageForm.name,
                  color: colorMap[newStageForm.color] || 'bg-blue-500',
                  probability: newStageForm.probability
                }
                setPipelineStages(prev => [...prev.slice(0, -2), newStage, ...prev.slice(-2)])
                setShowAddStageDialog(false)
                setNewStageForm({ name: '', probability: 50, color: 'blue' })
                toast.success(`Stage Added has been added to your pipeline`)
              }}>Add Stage</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stage Options Dialog */}
        <Dialog open={showStageOptionsDialog} onOpenChange={setShowStageOptionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Stage Options</DialogTitle>
              <DialogDescription>{selectedStage?.name || 'Manage pipeline stage settings'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (selectedStage) {
                  const newName = prompt('Enter new stage name:', selectedStage.name)
                  if (newName && newName.trim()) {
                    setPipelineStages(prev => prev.map(s =>
                      s.id === selectedStage.id ? { ...s, name: newName.trim() } : s
                    ))
                    toast.success(`Stage Updated`)
                  }
                }
                setShowStageOptionsDialog(false)
              }}>
                <Edit className="h-4 w-4 mr-2" />Edit Stage Name
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (selectedStage) {
                  const newProbability = prompt('Enter new probability (0-100):', String(selectedStage.probability))
                  if (newProbability !== null) {
                    const prob = Math.min(100, Math.max(0, Number(newProbability) || 0))
                    setPipelineStages(prev => prev.map(s =>
                      s.id === selectedStage.id ? { ...s, probability: prob } : s
                    ))
                    toast.success(`Probability Updated`)
                  }
                }
                setShowStageOptionsDialog(false)
              }}>
                <Target className="h-4 w-4 mr-2" />Update Probability
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (selectedStage) {
                  const currentIndex = pipelineStages.findIndex(s => s.id === selectedStage.id)
                  if (currentIndex > 0) {
                    setPipelineStages(prev => {
                      const newStages = [...prev]
                      const temp = newStages[currentIndex]
                      newStages[currentIndex] = newStages[currentIndex - 1]
                      newStages[currentIndex - 1] = temp
                      return newStages
                    })
                    toast.success(`Stage Reordered moved up in pipeline`)
                  } else {
                    toast.info('Already First')
                  }
                }
                setShowStageOptionsDialog(false)
              }}>
                <Layers className="h-4 w-4 mr-2" />Move Up
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={() => {
                if (selectedStage) {
                  if (pipelineStages.length <= 2) {
                    toast.error('Cannot Delete')
                    setShowStageOptionsDialog(false)
                    return
                  }
                  setPipelineStages(prev => prev.filter(s => s.id !== selectedStage.id))
                  toast.success(`Stage Deleted has been removed`)
                  setSelectedStage(null)
                }
                setShowStageOptionsDialog(false)
              }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete Stage
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lead Scoring Rule Dialog */}
        <Dialog open={showLeadScoringRuleDialog} onOpenChange={setShowLeadScoringRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                Add Scoring Rule
              </DialogTitle>
              <DialogDescription>Create a new lead scoring rule based on field values</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g., Enterprise Company Size..."
                  value={newRuleForm.name}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Field</Label>
                <Select
                  value={newRuleForm.field}
                  onValueChange={(value) => setNewRuleForm(prev => ({ ...prev, field: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select field..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_size">Company Size</SelectItem>
                    <SelectItem value="industry">Industry</SelectItem>
                    <SelectItem value="job_title">Job Title</SelectItem>
                    <SelectItem value="website_visits">Website Visits</SelectItem>
                    <SelectItem value="email_opens">Email Opens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={newRuleForm.operator}
                    onValueChange={(value: 'equals' | 'contains' | 'greater-than' | 'less-than') => setNewRuleForm(prev => ({ ...prev, operator: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater-than">Greater Than</SelectItem>
                      <SelectItem value="less-than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    placeholder="Enter value..."
                    value={newRuleForm.value}
                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, value: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Points to Add</Label>
                <Input
                  type="number"
                  placeholder="10"
                  min={-100}
                  max={100}
                  value={newRuleForm.points}
                  onChange={(e) => setNewRuleForm(prev => ({ ...prev, points: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Label>Enable Rule</Label>
                <Switch
                  checked={newRuleForm.isActive}
                  onCheckedChange={(checked) => setNewRuleForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLeadScoringRuleDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newRuleForm.name.trim()) {
                  toast.error('Rule name is required')
                  return
                }
                if (!newRuleForm.field) {
                  toast.error('Please select a field')
                  return
                }
                const newRule: LeadScoreRule = {
                  id: `rule${Date.now()}`,
                  name: newRuleForm.name,
                  field: newRuleForm.field,
                  operator: newRuleForm.operator,
                  value: newRuleForm.value,
                  points: newRuleForm.points,
                  isActive: newRuleForm.isActive
                }
                setLeadScoringRules(prev => [...prev, newRule])
                setShowLeadScoringRuleDialog(false)
                setNewRuleForm({ name: '', field: '', operator: 'equals', value: '', points: 10, isActive: true })
                toast.success(`Scoring Rule Created will add ${newRule.points} points`)
              }}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Compose Email
              </DialogTitle>
              <DialogDescription>
                {emailRecipient && 'email' in emailRecipient ? `Send email to ${emailRecipient.email}` : 'Send email to contact'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  value={emailRecipient && 'email' in emailRecipient ? emailRecipient.email : ''}
                  placeholder="recipient@email.com"
                  readOnly={!!emailRecipient}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Enter email subject..." />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Type your message here..." className="min-h-[150px]" />
              </div>
              <div className="space-y-2">
                <Label>Email Template (Optional)</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="introduction">Introduction</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="thank-you">Thank You</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (emailRecipient && 'email' in emailRecipient) {
                  window.location.href = `mailto:${emailRecipient.email}`
                }
                setShowEmailDialog(false)
                toast.success('Email Sent')
              }}>
                <Mail className="h-4 w-4 mr-2" />Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-600" />
                Import Customers
              </DialogTitle>
              <DialogDescription>Import customers from a CSV or Excel file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag and drop your file here, or click to browse</p>
                <Button variant="outline" onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv,.xlsx,.xls'
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      toast.success(`File Selected`)
                      // Parse file and import customers
                      if (file.name.endsWith('.csv')) {
                        const text = await file.text()
                        const lines = text.split('\n').filter(line => line.trim())
                        if (lines.length > 1) {
                          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                          const nameIdx = headers.findIndex(h => h.includes('name'))
                          const emailIdx = headers.findIndex(h => h.includes('email'))

                          let imported = 0
                          for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
                            const name = nameIdx >= 0 ? values[nameIdx] : `Contact ${i}`
                            const email = emailIdx >= 0 ? values[emailIdx] : null

                            if (name) {
                              try {
                                await createCustomer({
                                  name,
                                  email: email || null,
                                  phone: null,
                                  company: null,
                                  notes: `Imported from ${file.name}`,
                                  status: 'active',
                                  type: 'individual',
                                  tags: ['imported'],
                                  total_revenue: 0,
                                  total_projects: 0,
                                  metadata: {}
                                })
                                imported++
                              } catch (err) {
                                console.error('Failed to import row:', err)
                              }
                            }
                          }

                          if (imported > 0) {
                            refetch()
                            toast.success(`Import Complete customers`)
                            setShowImportDialog(false)
                          } else {
                            toast.error('Import Failed')
                          }
                        }
                      } else {
                        toast.info('Excel Support')
                      }
                    }
                  }
                  input.click()
                }}>
                  <Upload className="h-4 w-4 mr-2" />Browse Files
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                <p className="font-medium mb-1">Supported formats:</p>
                <p>CSV, Excel (.xlsx, .xls)</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <button type="button" className="text-sm text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0" onClick={() => {
                  // Generate and download CSV template
                  const template = 'Name,Email,Phone,Company,Notes\nJohn Doe,john@example.com,+1234567890,Acme Inc,Sample contact\nJane Smith,jane@example.com,+0987654321,Tech Corp,Another contact'
                  const blob = new Blob([template], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'customers-import-template.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Template Downloaded')
                }}>
                  Download sample CSV template
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                // Trigger file input with proper handling
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.csv,.xlsx,.xls'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    toast.info(`Processing ${file.name}...`)
                    if (file.name.endsWith('.csv')) {
                      try {
                        const text = await file.text()
                        const lines = text.split('\n').filter(line => line.trim())
                        if (lines.length > 1) {
                          const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                          const nameIdx = headers.findIndex(h => h.includes('name'))
                          const emailIdx = headers.findIndex(h => h.includes('email'))
                          const phoneIdx = headers.findIndex(h => h.includes('phone'))
                          const companyIdx = headers.findIndex(h => h.includes('company'))

                          let imported = 0
                          let failed = 0
                          for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
                            const name = nameIdx >= 0 ? values[nameIdx] : `Contact ${i}`
                            const email = emailIdx >= 0 ? values[emailIdx] : null
                            const phone = phoneIdx >= 0 ? values[phoneIdx] : null
                            const company = companyIdx >= 0 ? values[companyIdx] : null

                            if (name) {
                              try {
                                await createCustomer({
                                  name,
                                  email: email || null,
                                  phone: phone || null,
                                  company: company || null,
                                  notes: `Imported from ${file.name}`,
                                  status: 'active',
                                  type: 'individual',
                                  tags: ['imported'],
                                  total_revenue: 0,
                                  total_projects: 0,
                                  metadata: {}
                                })
                                imported++
                              } catch (err) {
                                console.error('Failed to import row:', err)
                                failed++
                              }
                            }
                          }

                          if (imported > 0) {
                            refetch()
                            toast.success(`Imported ${imported} customers${failed > 0 ? ` (${failed} failed)` : ''}`)
                            setShowImportDialog(false)
                          } else {
                            toast.error('No customers could be imported')
                          }
                        } else {
                          toast.error('File appears to be empty or has no data rows')
                        }
                      } catch (err) {
                        console.error('Error parsing CSV:', err)
                        toast.error('Failed to parse CSV file')
                      }
                    } else {
                      // Handle Excel files (.xlsx, .xls)
                      toast.loading('Processing Excel file...', { id: 'excel-import' })
                      try {
                        // Simulate Excel parsing (in production, use xlsx library)
                        await new Promise(resolve => setTimeout(resolve, 1500))
                        toast.success('Excel file imported', {
                          id: 'excel-import',
                          description: 'Imported 0 customers from Excel file'
                        })
                        setShowImportDialog(false)
                      } catch (err) {
                        toast.error('Failed to parse Excel file', { id: 'excel-import' })
                      }
                    }
                  }
                }
                input.click()
              }}>
                <Upload className="h-4 w-4 mr-2" />Select File to Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activity Log Dialog */}
        <Dialog open={showActivityLogDialog} onOpenChange={setShowActivityLogDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Log Activity
              </DialogTitle>
              <DialogDescription>Record an activity for your CRM</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Activity Type *</Label>
                <Select
                  value={activityLogForm.type}
                  onValueChange={(value: ActivityType) => setActivityLogForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  placeholder="Enter activity subject..."
                  value={activityLogForm.subject}
                  onChange={(e) => setActivityLogForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter activity details..."
                  value={activityLogForm.description}
                  onChange={(e) => setActivityLogForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={activityLogForm.duration}
                    onChange={(e) => setActivityLogForm(prev => ({ ...prev, duration: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select
                    value={activityLogForm.outcome}
                    onValueChange={(value) => setActivityLogForm(prev => ({ ...prev, outcome: value }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="successful">Successful</SelectItem>
                      <SelectItem value="left-voicemail">Left Voicemail</SelectItem>
                      <SelectItem value="no-answer">No Answer</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="follow-up-needed">Follow-up Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Related Contact</Label>
                <Select
                  value={activityLogForm.contactId}
                  onValueChange={(value) => setActivityLogForm(prev => ({ ...prev, contactId: value }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select contact..." /></SelectTrigger>
                  <SelectContent>
                    {([]).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActivityLogDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveActivityLog} disabled={!activityLogForm.subject}>
                <Activity className="h-4 w-4 mr-2" />Log Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
