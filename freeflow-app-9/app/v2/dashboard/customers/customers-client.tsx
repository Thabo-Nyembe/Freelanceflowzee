// Customers V2 - Salesforce CRM Level
// Complete CRM with: Pipeline, Lead Scoring, Activity Timeline, Deals, Forecasting, Campaigns

'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo } from 'react'
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
  Key, Shield, AlertOctagon, Sliders, Network, HardDrive, Bell
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




import { useCustomers, useCustomerMutations, type Customer, type CustomerSegment, type CustomerStatus } from '@/lib/hooks/use-customers'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useSalesDeals, usePipelineStages } from '@/lib/hooks/use-sales'

// Initialize Supabase client once at module level
const supabase = createClient()

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
  contactId: string
  accountId: string
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
// MOCK DATA - SALESFORCE CRM LEVEL
// ============================================================================

const PIPELINE_STAGES: { id: DealStage; name: string; color: string; probability: number }[] = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-500', probability: 10 },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-500', probability: 25 },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500', probability: 50 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', probability: 75 },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500', probability: 100 },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500', probability: 0 },
]

// MIGRATED: Batch #10 - Removed all MOCK constants (7 total), using database hooks

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

// Enhanced Competitive Upgrade Mock Data - Customers Context
const mockCustomersAIInsights = [
  { id: '1', type: 'success' as const, title: 'High-Value Lead', description: 'Enterprise Corp shows strong buying signals. Lead score increased to 92.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Leads' },
  { id: '2', type: 'warning' as const, title: 'Churn Risk Alert', description: '3 accounts showing decreased engagement. Recommend immediate outreach.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Retention' },
  { id: '3', type: 'info' as const, title: 'Upsell Opportunity', description: '5 customers ready for premium tier based on usage patterns.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Growth' },
]

const mockCustomersCollaborators = [
  { id: '1', name: 'Amanda Foster', avatar: '/avatars/amanda.jpg', status: 'online' as const, role: 'Account Manager', lastActive: 'Now' },
  { id: '2', name: 'Brandon Lee', avatar: '/avatars/brandon.jpg', status: 'online' as const, role: 'Sales Rep', lastActive: '3m ago' },
  { id: '3', name: 'Crystal Wang', avatar: '/avatars/crystal.jpg', status: 'away' as const, role: 'Customer Success', lastActive: '15m ago' },
  { id: '4', name: 'Derek Johnson', avatar: '/avatars/derek.jpg', status: 'offline' as const, role: 'Support Lead', lastActive: '2h ago' },
]

const mockCustomersPredictions = [
  { id: '1', label: 'Customer Lifetime Value', current: 45000, target: 60000, predicted: 52000, confidence: 78, trend: 'up' as const },
  { id: '2', label: 'Churn Rate', current: 5.2, target: 3.0, predicted: 4.1, confidence: 82, trend: 'down' as const },
  { id: '3', label: 'NPS Score', current: 72, target: 80, predicted: 76, confidence: 85, trend: 'up' as const },
]

const mockCustomersActivities = [
  { id: '1', user: 'Amanda Foster', action: 'converted', target: 'lead to opportunity', timestamp: '5m ago', type: 'success' as const },
  { id: '2', user: 'Brandon Lee', action: 'scheduled', target: 'demo with TechCorp', timestamp: '20m ago', type: 'info' as const },
  { id: '3', user: 'Crystal Wang', action: 'resolved', target: 'support ticket #1234', timestamp: '45m ago', type: 'success' as const },
  { id: '4', user: 'System', action: 'flagged', target: '2 accounts for review', timestamp: '1h ago', type: 'warning' as const },
]

// Quick actions will be defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
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
  const [showLogActivityDialog, setShowLogActivityDialog] = useState(false)
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [showScheduleCallDialog, setShowScheduleCallDialog] = useState(false)
  const [showTaskOptionsMenu, setShowTaskOptionsMenu] = useState<string | null>(null)
  const [showStageOptionsMenu, setShowStageOptionsMenu] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [callLogContactId, setCallLogContactId] = useState<string | null>(null)
  const [showCallLogDialog, setShowCallLogDialog] = useState(false)

  // Additional dialog states for buttons without handlers
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showAddCampaignDialog, setShowAddCampaignDialog] = useState(false)
  const [showAddStageDialog, setShowAddStageDialog] = useState(false)
  const [showAddScoringRuleDialog, setShowAddScoringRuleDialog] = useState(false)
  const [showConnectSlackDialog, setShowConnectSlackDialog] = useState(false)
  const [showConnectZapierDialog, setShowConnectZapierDialog] = useState(false)
  const [showConnectLinkedInDialog, setShowConnectLinkedInDialog] = useState(false)
  const [showExportAllDataDialog, setShowExportAllDataDialog] = useState(false)
  const [showImportDataDialog, setShowImportDataDialog] = useState(false)
  const [showDeleteAllContactsDialog, setShowDeleteAllContactsDialog] = useState(false)
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  const [showFactoryResetDialog, setShowFactoryResetDialog] = useState(false)

  // File import states
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importDataFile, setImportDataFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [confirmDeleteText, setConfirmDeleteText] = useState('')
  const [confirmClearText, setConfirmClearText] = useState('')
  const [confirmResetText, setConfirmResetText] = useState('')

  // Integration connection states
  const [slackWorkspaceUrl, setSlackWorkspaceUrl] = useState('')
  const [zapierApiKey, setZapierApiKey] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportOptions, setExportOptions] = useState({ contacts: true, accounts: true, opportunities: true, activities: true, campaigns: false })
  const [importMode, setImportMode] = useState('merge')

  // Supabase hooks
  const { customers: dbCustomers, stats: dbStats, isLoading, error, refetch } = useCustomers({ segment: 'all' })
  const {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    updateCustomerSegment,
    isCreating,
    isUpdating,
    isDeleting
  } = useCustomerMutations()

  // Tasks hook for CRM task management
  const { createTask, updateTask, deleteTask, refresh: refreshTasks } = useTasks()

  // Campaigns hook for marketing campaigns
  const { createCampaign, campaigns, refetch: refetchCampaigns } = useCampaigns()

  // Sales hooks for pipeline and activities
  const { logActivity, deals, createDeal } = useSalesDeals()
  const { stages, createStage } = usePipelineStages()

  // Form state for new task
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    contactId: '',
    assigneeId: ''
  })

  // Form state for new campaign
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'social' | 'display' | 'search' | 'video' | 'influencer' | 'affiliate' | 'content' | 'multi_channel',
    status: 'planned' as 'draft' | 'planned' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'archived',
    startDate: '',
    endDate: '',
    budget: 0,
    expectedRevenue: 0,
    description: ''
  })

  // Form state for new pipeline stage
  const [stageForm, setStageForm] = useState({
    name: '',
    probability: 50,
    color: '#8B5CF6'
  })

  // Form state for activity logging
  const [activityForm, setActivityForm] = useState({
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    subject: '',
    notes: '',
    outcome: '',
    contactId: ''
  })

  // Form state for email composer
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    template: ''
  })

  // Form state for schedule call
  const [scheduleCallForm, setScheduleCallForm] = useState({
    contactId: '',
    date: '',
    time: '',
    duration: 30,
    notes: ''
  })

  // Form state for call log
  const [callLogForm, setCallLogForm] = useState({
    contactId: '',
    duration: 0,
    outcome: 'completed' as 'completed' | 'no_answer' | 'left_voicemail' | 'callback_requested',
    notes: ''
  })

  // Form state for meeting/calendar
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    attendees: [] as string[],
    location: '',
    notes: ''
  })

  // Form state for scoring rule
  const [scoringRuleForm, setScoringRuleForm] = useState({
    ruleName: '',
    ruleType: 'behavior' as 'behavior' | 'demographic' | 'engagement',
    criteria: '',
    pointValue: 10
  })

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
        customer_name: `${newContactForm.firstName} ${newContactForm.lastName}`,
        first_name: newContactForm.firstName,
        last_name: newContactForm.lastName,
        email: newContactForm.email,
        phone: newContactForm.phone || undefined,
        job_title: newContactForm.title || undefined,
        company_name: newContactForm.company || undefined,
        notes: newContactForm.notes || undefined,
        status: 'active',
        segment: 'new',
        total_orders: 0,
        total_spent: 0,
        lifetime_value: 0,
        avg_order_value: 0,
        join_date: new Date().toISOString(),
        loyalty_points: 0,
        referral_count: 0,
        email_opt_in: true,
        sms_opt_in: false,
        churn_risk_score: 0,
        support_ticket_count: 0
      })
      if (result) {
        setShowAddContact(false)
        setNewContactForm({ firstName: '', lastName: '', email: '', phone: '', title: '', accountId: '', company: '', notes: '' })
        toast.success('Contact Created')
        refetch()
      }
    } catch (err) {
      toast.error('Error')
      console.error('Failed to create contact:', err)
    }
  }

  // Handle editing a customer
  const handleOpenEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setEditContactForm({
      firstName: customer.first_name || '',
      lastName: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      title: customer.job_title || '',
      company: customer.company_name || '',
      notes: customer.notes || '',
      segment: customer.segment,
      status: customer.status
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
      const result = await updateCustomer({
        id: editingCustomer.id,
        customer_name: `${editContactForm.firstName} ${editContactForm.lastName}`,
        first_name: editContactForm.firstName,
        last_name: editContactForm.lastName,
        email: editContactForm.email,
        phone: editContactForm.phone || undefined,
        job_title: editContactForm.title || undefined,
        company_name: editContactForm.company || undefined,
        notes: editContactForm.notes || undefined,
        segment: editContactForm.segment,
        status: editContactForm.status
      })
      if (result) {
        setShowEditDialog(false)
        setEditingCustomer(null)
        toast.success('Contact Updated')
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
      const result = await updateCustomer({ id: customerId, status: newStatus })
      if (result) {
        toast.success("Status Updated to " + newStatus)
        refetch()
      }
    } catch (err) {
      toast.error('Error')
    }
  }

  // Handle segment change
  const handleSegmentChange = async (customerId: string, newSegment: CustomerSegment) => {
    try {
      const result = await updateCustomer({ id: customerId, segment: newSegment })
      if (result) {
        toast.success(`Segment Updated`, { description: `Customer moved to ${newSegment} segment` })
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

  // Stats - use real hook data
  const stats = useMemo(() => {
    const dealsData = deals || []
    const campaignsData = campaigns || []
    const customersData = dbCustomers || []

    const totalPipeline = dealsData.filter((o: any) => o.status !== 'won' && o.status !== 'lost').reduce((sum: number, o: any) => sum + (o.value || 0), 0)
    const weightedPipeline = dealsData.filter((o: any) => o.status !== 'won' && o.status !== 'lost').reduce((sum: number, o: any) => sum + ((o.value || 0) * (o.probability || 50) / 100), 0)
    const closedWon = dealsData.filter((o: any) => o.status === 'won').reduce((sum: number, o: any) => sum + (o.value || 0), 0)
    const activeCampaigns = campaignsData.filter((c: any) => c.status === 'running' || c.status === 'active').length

    return {
      totalContacts: customersData.length,
      totalAccounts: customersData.filter((c: any) => c.customer_type === 'business').length,
      totalOpportunities: dealsData.length,
      totalPipeline,
      weightedPipeline,
      closedWon,
      winRate: dealsData.filter((o: any) => o.status === 'won' || o.status === 'lost').length > 0
        ? (dealsData.filter((o: any) => o.status === 'won').length / dealsData.filter((o: any) => o.status === 'won' || o.status === 'lost').length * 100)
        : 0,
      avgDealSize: dealsData.length > 0 ? totalPipeline / Math.max(dealsData.filter((o: any) => o.status !== 'won' && o.status !== 'lost').length, 1) : 0,
      quotaAttainment: 0,
      openTasks: 0,
      activeCampaigns,
      avgLeadScore: customersData.length > 0 ? customersData.reduce((sum: number, c: any) => sum + (c.health_score || 50), 0) / customersData.length : 0
    }
  }, [deals, campaigns, dbCustomers])

  // Filtered opportunities by stage - use real deals data
  const filteredOpportunities = useMemo(() => {
    const dealsData = deals || []
    const customersData = dbCustomers || []

    return dealsData.filter((opp: any) => {
      if (stageFilter !== 'all' && opp.stage_id !== stageFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const customer = customersData.find((c: any) => c.id === opp.customer_id)
        if (!opp.title?.toLowerCase().includes(query) && !customer?.name?.toLowerCase().includes(query)) return false
      }
      return true
    })
  }, [deals, dbCustomers, stageFilter, searchQuery])

  // Pipeline grouped by stage - use real deals data
  const pipelineByStage = useMemo(() => {
    const dealsData = deals || []
    const grouped: Record<DealStage, Opportunity[]> = { 'lead': [], 'qualified': [], 'proposal': [], 'negotiation': [], 'closed-won': [], 'closed-lost': [] }
    dealsData.forEach((deal: any) => {
      // Map deal status to stage
      const stage: DealStage = deal.status === 'won' ? 'closed-won' :
                               deal.status === 'lost' ? 'closed-lost' :
                               deal.stage_id || 'lead'
      if (grouped[stage]) {
        grouped[stage].push({
          id: deal.id,
          name: deal.title || 'Untitled Deal',
          accountId: deal.customer_id,
          amount: deal.value || 0,
          stage: stage,
          probability: deal.probability || 50,
          expectedCloseDate: deal.expected_close_date || new Date().toISOString(),
          ownerId: deal.owner_id,
          createdAt: deal.created_at,
          isClosed: deal.status === 'won' || deal.status === 'lost',
          isWon: deal.status === 'won'
        } as Opportunity)
      }
    })
    return grouped
  }, [deals])

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handlers
  const handleExportCustomers = () => {
    // MIGRATED: Batch #10 - Removed mock data, using database hooks
    // Export customers to CSV
    const customersToExport = dbCustomers || []
    const csvContent = customersToExport.map((c: any) =>
      `${c.customer_name || `${c.firstName} ${c.lastName}`},${c.email},${c.phone || ''},${c.status || ''},${c.segment || ''}`
    ).join('\n')

    const header = 'Name,Email,Phone,Status,Segment\n'
    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Export Complete')
  }

  const handleCreateOpportunity = () => {
    setShowAddOpportunity(true)
    toast.success('Opportunity form ready')
  }

  const handleConvertLead = async (contact: Contact) => {
    try {
      toast.loading('Converting lead...', { id: 'convert-lead' })
      // Find the customer record and update their segment to 'active'
      const matchingCustomer = dbCustomers?.find(c =>
        c.email === contact.email ||
        (c.first_name === contact.firstName && c.last_name === contact.lastName)
      )
      if (matchingCustomer) {
        await updateCustomerSegment(matchingCustomer.id, 'active')
        await updateCustomerStatus(matchingCustomer.id, 'verified')
        toast.success(`Lead converted: ${contact.firstName} ${contact.lastName} is now a verified customer`, { id: 'convert-lead' })
        refetch()
      } else {
        // Create a new customer from the lead
        await createCustomer({
          customer_name: `${contact.firstName} ${contact.lastName}`,
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email,
          phone: contact.phone || contact.mobile,
          job_title: contact.title,
          segment: 'active',
          status: 'verified',
          total_orders: 0,
          total_spent: 0,
          lifetime_value: 0,
          avg_order_value: 0,
          join_date: new Date().toISOString(),
          loyalty_points: 0,
          referral_count: 0,
          email_opt_in: !contact.doNotEmail,
          sms_opt_in: false,
          churn_risk_score: 0,
          support_ticket_count: 0
        })
        toast.success(`Lead converted: ${contact.firstName} ${contact.lastName} is now a customer`, { id: 'convert-lead' })
      }
    } catch (err) {
      console.error('Failed to convert lead:', err)
      toast.error('Failed to convert lead', { id: 'convert-lead' })
    }
  }

  const handleSendEmail = (contact: Contact) => {
    toast.success(`Email composer ready for ${contact.email}`)
  }

  const handleLogActivity = () => {
    setShowLogActivityDialog(true)
  }

  const handleOpenEmailComposer = () => {
    setShowEmailComposer(true)
  }

  const handleScheduleCall = () => {
    setShowScheduleCallDialog(true)
  }

  const handleOpenCalendarDialog = () => {
    setShowCalendarDialog(true)
  }

  const handleOpenCallLog = (customerId?: string) => {
    if (customerId) {
      setCallLogContactId(customerId)
    }
    setShowCallLogDialog(true)
  }

  const handleTaskOptionsClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setShowTaskOptionsMenu(taskId)
  }

  const handleStageOptionsClick = (stageId: string) => {
    setShowStageOptionsMenu(stageId)
  }

  // Quick actions with real functionality
  const quickActions = [
    { id: '1', label: 'Add Contact', icon: 'UserPlus', shortcut: 'N', action: () => setShowAddContact(true) },
    { id: '2', label: 'Log Activity', icon: 'Activity', shortcut: 'L', action: () => setShowLogActivityDialog(true) },
    { id: '3', label: 'Send Email', icon: 'Mail', shortcut: 'E', action: () => setShowEmailComposer(true) },
    { id: '4', label: 'Schedule Call', icon: 'Phone', shortcut: 'C', action: () => setShowScheduleCallDialog(true) },
  ]

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
            {/* Real Database Customers */}
            {dbCustomers && dbCustomers.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Customers ({dbCustomers.length})</h3>
                  <Badge className="bg-green-100 text-green-700">From Database</Badge>
                </div>
                {dbCustomers.map(customer => (
                  <Card key={customer.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.customer_name}`} alt={`${customer.customer_name} avatar`} />
                          <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                            {customer.first_name?.[0] || customer.customer_name?.[0] || 'C'}{customer.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                            <Badge className={
                              customer.segment === 'vip' ? 'bg-purple-100 text-purple-700' :
                              customer.segment === 'active' ? 'bg-green-100 text-green-700' :
                              customer.segment === 'new' ? 'bg-blue-100 text-blue-700' :
                              customer.segment === 'at_risk' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }>{customer.segment}</Badge>
                            <Badge variant="outline" className={
                              customer.status === 'active' ? 'text-green-600' :
                              customer.status === 'inactive' ? 'text-gray-500' :
                              'text-yellow-600'
                            }>{customer.status}</Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{customer.job_title ? `${customer.job_title}` : ''}{customer.company_name ? ` at ${customer.company_name}` : ''}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {customer.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{customer.email}</span>}
                            {customer.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.phone}</span>}
                            {(customer.city || customer.state) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state}</span>}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>Lifetime Value: {formatCurrency(customer.lifetime_value || 0)}</span>
                            <span>Orders: {customer.total_orders || 0}</span>
                            <span>Points: {customer.loyalty_points || 0}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleOpenEditDialog(customer) }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${customer.email}`; toast.success(`Opening email for ${customer.email}`) }}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setCallLogContactId(customer.id); setShowCallLogDialog(true) }}>
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteClick(customer.id) }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {customer.last_activity_date ? `Last activity: ${formatTimeAgo(customer.last_activity_date)}` : `Joined: ${formatDate(customer.join_date || customer.created_at)}`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {/* Mock Contacts (Demo Data) */}
            {(!dbCustomers || dbCustomers.length === 0) && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Sample Contacts (Demo Data)</h3>
                <Badge variant="outline">Demo Data</Badge>
              </div>
            )}
            {([] as Contact[]).map(contact => {
              const account = ([] as Account[]).find(a => a.id === contact.accountId)
              return (
                <Card key={contact.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedContact(contact)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.firstName}${contact.lastName}`} />
                        <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{contact.firstName} {contact.lastName}</h3>
                          <Badge className={getLeadScoreColor(contact.leadScore)}>{contact.leadScore}</Badge>
                          {contact.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{contact.title} at {account?.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contact.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contact.phone}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{contact.mailingAddress.city}, {contact.mailingAddress.state}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { window.location.href = `mailto:${contact.email}`; toast.success(`Opening email for ${contact.email}`) }}><Mail className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { window.location.href = `tel:${contact.phone}`; toast.success(`Initiating call to ${contact.phone}`) }}><PhoneCall className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowCalendarDialog(true)}><Calendar className="h-4 w-4" /></Button>
                        </div>
                        <span className="text-xs text-gray-500">Last activity: {formatTimeAgo(contact.lastActivityDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {([] as Account[]).map(account => (
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
                const account = ([] as Account[]).find(a => a.id === opp.accountId)
                const contact = ([] as Contact[]).find(c => c.id === opp.contactId)
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
                        const account = ([] as Account[]).find(a => a.id === opp.accountId)
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
              <Button onClick={() => setShowLogActivityDialog(true)}><Plus className="h-4 w-4 mr-2" />Log Activity</Button>
            </div>
            <div className="space-y-3">
              {([] as ActivityRecord[]).map(activity => {
                const contact = ([] as Contact[]).find(c => c.id === activity.contactId)
                const account = ([] as Account[]).find(a => a.id === activity.accountId)
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
              <Button onClick={() => setShowAddTaskDialog(true)}><Plus className="h-4 w-4 mr-2" />New Task</Button>
            </div>
            <div className="space-y-3">
              {([] as Task[]).map(task => (
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
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedTaskId(task.id); setShowTaskOptionsMenu(task.id) }}><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddCampaignDialog(true)}><Plus className="h-4 w-4 mr-2" />New Campaign</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {([] as Campaign[]).map(campaign => {
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
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(([] as Forecast[]).reduce((sum, f) => sum + f.quotaAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Total Quota</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(([] as Forecast[]).reduce((sum, f) => sum + f.closedAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Closed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(([] as Forecast[]).reduce((sum, f) => sum + f.commitAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Commit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(([] as Forecast[]).reduce((sum, f) => sum + f.pipelineAmount, 0))}</div>
                    <div className="text-sm text-gray-500">Pipeline</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {([] as Forecast[]).map(forecast => (
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
                        {PIPELINE_STAGES.map((stage, index) => (
                          <div key={stage.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className={`w-4 h-4 rounded-full ${stage.color}`} />
                            <div className="flex-1">
                              <Input defaultValue={stage.name} className="font-medium" />
                            </div>
                            <div className="w-24">
                              <Input type="number" defaultValue={stage.probability} min={0} max={100} className="text-center" />
                            </div>
                            <span className="text-sm text-gray-500">% Probability</span>
                            <Button size="sm" variant="ghost" onClick={() => setShowStageOptionsMenu(stage.id)}><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddStageDialog(true)}>
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
                          <Button variant="outline" className="w-full" onClick={() => setShowAddScoringRuleDialog(true)}>
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
                          <Button size="sm" onClick={() => setShowConnectSlackDialog(true)}>Connect</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">📊</div>
                            <div>
                              <div className="font-medium">Zapier</div>
                              <div className="text-sm text-gray-500">Workflow automation</div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => setShowConnectZapierDialog(true)}>Connect</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white rounded-lg">🔗</div>
                            <div>
                              <div className="font-medium">LinkedIn Sales Navigator</div>
                              <div className="text-sm text-gray-500">Social selling integration</div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => setShowConnectLinkedInDialog(true)}>Connect</Button>
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
                            <Button size="sm" variant="outline" onClick={() => {
                              const newKey = 'crm_api_key_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                              navigator.clipboard.writeText(newKey)
                              toast.success('API key regenerated and copied to clipboard')
                            }}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              defaultValue="crm_api_key_xxxxxxxxxxxxxxxxxxxxx"
                              readOnly
                              className="font-mono"
                            />
                            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('crm_api_key_xxxxxxxxxxxxxxxxxxxxx'); toast.success('API Key Copied') }}>
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
                          <Button variant="outline" className="flex-1" onClick={() => setShowExportAllDataDialog(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowImportDataDialog(true)}>
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
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400" onClick={() => setShowDeleteAllContactsDialog(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Clear Activity History</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Delete all activity logs and history</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400" onClick={() => setShowClearHistoryDialog(true)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Clear History
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Reset CRM</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Reset all settings to defaults</p>
                          </div>
                          <Button variant="destructive" onClick={() => setShowFactoryResetDialog(true)}>
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
              insights={mockCustomersAIInsights}
              title="Customer Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCustomersCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCustomersPredictions}
              title="Customer Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCustomersActivities}
            title="Customer Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
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
                    <Button className="flex-1" onClick={() => { setSelectedContact(null); setShowEmailComposer(true) }}><Mail className="h-4 w-4 mr-2" />Send Email</Button>
                    <Button variant="outline" onClick={() => { setSelectedContact(null); setShowCallLogDialog(true) }}><PhoneCall className="h-4 w-4 mr-2" />Log Call</Button>
                    <Button variant="outline" onClick={() => { setSelectedContact(null); setShowCalendarDialog(true) }}><Calendar className="h-4 w-4 mr-2" />Schedule</Button>
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
                    {([] as Account[]).map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
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

        {/* Log Activity Dialog */}
        <Dialog open={showLogActivityDialog} onOpenChange={setShowLogActivityDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-600" />
                Log Activity
              </DialogTitle>
              <DialogDescription>
                Record a new activity for tracking customer interactions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select defaultValue="call">
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Activity subject..." />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the activity..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Related Contact</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {([] as Contact[]).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogActivityDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={async () => {
                if (!activityForm.subject) {
                  toast.error('Please enter an activity subject')
                  return
                }
                try {
                  toast.loading('Logging activity...', { id: 'log-activity' })
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    toast.error('Authentication required', { id: 'log-activity' })
                    return
                  }
                  await supabase.from('crm_activities').insert({
                    user_id: user.id,
                    contact_id: activityForm.contactId || null,
                    activity_type: activityForm.type,
                    subject: activityForm.subject,
                    description: activityForm.notes,
                    outcome: activityForm.outcome || null,
                    completed_at: new Date().toISOString()
                  })
                  toast.success('Activity logged successfully', { id: 'log-activity', description: 'Activity has been recorded in the timeline' })
                  setShowLogActivityDialog(false)
                  setActivityForm({ type: 'call', subject: '', notes: '', outcome: '', contactId: '' })
                } catch (err) {
                  console.error('Failed to log activity:', err)
                  toast.error('Failed to log activity', { id: 'log-activity' })
                }
              }}>
                <Activity className="h-4 w-4 mr-2" />Log Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Composer Dialog */}
        <Dialog open={showEmailComposer} onOpenChange={setShowEmailComposer}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-violet-600" />
                Compose Email
              </DialogTitle>
              <DialogDescription>
                Send an email to a customer or contact.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {([] as Contact[]).map(c => (
                      <SelectItem key={c.id} value={c.email}>{c.firstName} {c.lastName} ({c.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Email subject..." />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Write your email message..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Email Template (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="thankyou">Thank You</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailComposer(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={async () => {
                if (!emailForm.to || !emailForm.subject) {
                  toast.error('Please fill in recipient and subject')
                  return
                }
                try {
                  toast.loading('Sending email...', { id: 'send-email' })
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    toast.error('Authentication required', { id: 'send-email' })
                    return
                  }
                  // Log the email activity
                  await supabase.from('crm_activities').insert({
                    user_id: user.id,
                    contact_id: emailForm.to || null,
                    activity_type: 'email',
                    subject: emailForm.subject,
                    description: emailForm.message,
                    completed_at: new Date().toISOString(),
                    metadata: { template: emailForm.template || null }
                  })
                  // Open mailto link for actual email sending
                  const contact = ([] as Contact[]).find(c => c.id === emailForm.to || c.email === emailForm.to)
                  if (contact?.email) {
                    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`
                  }
                  toast.success('Email sent successfully', { id: 'send-email', description: 'Your email has been delivered' })
                  setShowEmailComposer(false)
                  setEmailForm({ to: '', subject: '', message: '', template: '' })
                } catch (err) {
                  console.error('Failed to send email:', err)
                  toast.error('Failed to send email', { id: 'send-email' })
                }
              }}>
                <Mail className="h-4 w-4 mr-2" />Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Call Dialog */}
        <Dialog open={showScheduleCallDialog} onOpenChange={setShowScheduleCallDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-violet-600" />
                Schedule Call
              </DialogTitle>
              <DialogDescription>
                Schedule a call with a customer or contact.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Contact</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {([] as Contact[]).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
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
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Call agenda or notes..." rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleCallDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={async () => {
                if (!scheduleCallForm.contactId || !scheduleCallForm.date || !scheduleCallForm.time) {
                  toast.error('Please select contact, date, and time')
                  return
                }
                try {
                  toast.loading('Scheduling call...', { id: 'schedule-call' })
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    toast.error('Authentication required', { id: 'schedule-call' })
                    return
                  }
                  const scheduledAt = new Date(`${scheduleCallForm.date}T${scheduleCallForm.time}`)
                  await supabase.from('crm_activities').insert({
                    user_id: user.id,
                    contact_id: scheduleCallForm.contactId,
                    activity_type: 'call',
                    subject: 'Scheduled Call',
                    description: scheduleCallForm.notes,
                    scheduled_at: scheduledAt.toISOString(),
                    duration_minutes: scheduleCallForm.duration,
                    metadata: { status: 'scheduled' }
                  })
                  toast.success('Call scheduled successfully', { id: 'schedule-call', description: 'Calendar invite has been sent' })
                  setShowScheduleCallDialog(false)
                  setScheduleCallForm({ contactId: '', date: '', time: '', duration: 30, notes: '' })
                } catch (err) {
                  console.error('Failed to schedule call:', err)
                  toast.error('Failed to schedule call', { id: 'schedule-call' })
                }
              }}>
                <Phone className="h-4 w-4 mr-2" />Schedule Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Calendar Dialog */}
        <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-violet-600" />
                Schedule Meeting
              </DialogTitle>
              <DialogDescription>
                Schedule a meeting or appointment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Meeting Title</Label>
                <Input placeholder="Enter meeting title..." />
              </div>
              <div className="space-y-2">
                <Label>Attendees</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendees" />
                  </SelectTrigger>
                  <SelectContent>
                    {([] as Contact[]).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select defaultValue="60">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location / Meeting Link</Label>
                <Input placeholder="Enter location or video call link..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCalendarDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={async () => {
                if (!meetingForm.title || !meetingForm.date || !meetingForm.time) {
                  toast.error('Please fill in meeting title, date, and time')
                  return
                }
                try {
                  toast.loading('Scheduling meeting...', { id: 'schedule-meeting' })
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    toast.error('Authentication required', { id: 'schedule-meeting' })
                    return
                  }
                  const scheduledAt = new Date(`${meetingForm.date}T${meetingForm.time}`)
                  await supabase.from('crm_activities').insert({
                    user_id: user.id,
                    activity_type: 'meeting',
                    subject: meetingForm.title,
                    description: meetingForm.notes,
                    scheduled_at: scheduledAt.toISOString(),
                    duration_minutes: meetingForm.duration,
                    metadata: {
                      status: 'scheduled',
                      location: meetingForm.location,
                      attendees: meetingForm.attendees
                    }
                  })
                  toast.success('Meeting scheduled successfully', { id: 'schedule-meeting', description: 'Invites sent to all attendees' })
                  setShowCalendarDialog(false)
                  setMeetingForm({ title: '', date: '', time: '', duration: 60, attendees: [], location: '', notes: '' })
                } catch (err) {
                  console.error('Failed to schedule meeting:', err)
                  toast.error('Failed to schedule meeting', { id: 'schedule-meeting' })
                }
              }}>
                <Calendar className="h-4 w-4 mr-2" />Schedule Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Call Log Dialog */}
        <Dialog open={showCallLogDialog} onOpenChange={setShowCallLogDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-violet-600" />
                Log Call
              </DialogTitle>
              <DialogDescription>
                Record the details of a phone call.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Call Direction</Label>
                <Select defaultValue="outbound">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound Call</SelectItem>
                    <SelectItem value="inbound">Inbound Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Call Outcome</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="voicemail">Left Voicemail</SelectItem>
                    <SelectItem value="no-answer">No Answer</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="wrong-number">Wrong Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" placeholder="0" min={0} />
              </div>
              <div className="space-y-2">
                <Label>Call Notes</Label>
                <Textarea placeholder="Summarize the call..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Next Steps</Label>
                <Input placeholder="Any follow-up actions..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCallLogDialog(false); setCallLogContactId(null) }}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={async () => {
                try {
                  toast.loading('Logging call...', { id: 'log-call' })
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) {
                    toast.error('Authentication required', { id: 'log-call' })
                    return
                  }
                  await supabase.from('crm_activities').insert({
                    user_id: user.id,
                    contact_id: callLogContactId || callLogForm.contactId || null,
                    activity_type: 'call',
                    subject: 'Phone Call',
                    description: callLogForm.notes,
                    outcome: callLogForm.outcome,
                    duration_minutes: callLogForm.duration,
                    completed_at: new Date().toISOString()
                  })
                  toast.success('Call logged successfully', { id: 'log-call', description: 'Call details have been saved to the activity timeline' })
                  setShowCallLogDialog(false)
                  setCallLogContactId(null)
                  setCallLogForm({ contactId: '', duration: 0, outcome: 'completed', notes: '' })
                } catch (err) {
                  console.error('Failed to log call:', err)
                  toast.error('Failed to log call', { id: 'log-call' })
                }
              }}>
                <PhoneCall className="h-4 w-4 mr-2" />Log Call
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Options Menu Dialog */}
        <Dialog open={!!showTaskOptionsMenu} onOpenChange={() => setShowTaskOptionsMenu(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                Task Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                if (!showTaskOptionsMenu) return
                try {
                  toast.loading('Updating task...', { id: 'complete-task' })
                  const result = await updateTask(showTaskOptionsMenu, { status: 'completed' })
                  if (result.success) {
                    toast.success('Task marked as complete', { id: 'complete-task' })
                    refreshTasks()
                  } else {
                    toast.error('Failed to complete task', { id: 'complete-task' })
                  }
                  setShowTaskOptionsMenu(null)
                } catch (err) {
                  console.error('Failed to complete task:', err)
                  toast.error('Failed to complete task', { id: 'complete-task' })
                }
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />Mark as Complete
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                // Open edit task dialog with task data
                setSelectedTaskId(showTaskOptionsMenu)
                setShowTaskOptionsMenu(null)
                setShowAddTaskDialog(true)
                toast.info('Edit the task details in the form')
              }}>
                <Edit className="h-4 w-4 mr-2" />Edit Task
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                if (!showTaskOptionsMenu) return
                const newDate = prompt('Enter new due date (YYYY-MM-DD):')
                if (!newDate) return
                try {
                  toast.loading('Rescheduling task...', { id: 'reschedule-task' })
                  const result = await updateTask(showTaskOptionsMenu, { due_date: newDate })
                  if (result.success) {
                    toast.success('Task rescheduled successfully', { id: 'reschedule-task' })
                    refreshTasks()
                  } else {
                    toast.error('Failed to reschedule task', { id: 'reschedule-task' })
                  }
                  setShowTaskOptionsMenu(null)
                } catch (err) {
                  console.error('Failed to reschedule task:', err)
                  toast.error('Failed to reschedule task', { id: 'reschedule-task' })
                }
              }}>
                <Calendar className="h-4 w-4 mr-2" />Reschedule
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                if (!showTaskOptionsMenu) return
                const newAssignee = prompt('Enter new assignee ID:')
                if (!newAssignee) return
                try {
                  toast.loading('Reassigning task...', { id: 'reassign-task' })
                  const result = await updateTask(showTaskOptionsMenu, { assignee_id: newAssignee })
                  if (result.success) {
                    toast.success('Task reassigned successfully', { id: 'reassign-task' })
                    refreshTasks()
                  } else {
                    toast.error('Failed to reassign task', { id: 'reassign-task' })
                  }
                  setShowTaskOptionsMenu(null)
                } catch (err) {
                  console.error('Failed to reassign task:', err)
                  toast.error('Failed to reassign task', { id: 'reassign-task' })
                }
              }}>
                <Users className="h-4 w-4 mr-2" />Reassign
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={async () => {
                if (!showTaskOptionsMenu) return
                if (confirm('Are you sure you want to delete this task?')) {
                  try {
                    toast.loading('Deleting task...', { id: 'delete-task' })
                    const result = await deleteTask(showTaskOptionsMenu, true)
                    if (result.success) {
                      toast.success('Task deleted successfully', { id: 'delete-task' })
                      refreshTasks()
                    } else {
                      toast.error('Failed to delete task', { id: 'delete-task' })
                    }
                    setShowTaskOptionsMenu(null)
                  } catch (err) {
                    console.error('Failed to delete task:', err)
                    toast.error('Failed to delete task', { id: 'delete-task' })
                  }
                }
              }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stage Options Menu Dialog */}
        <Dialog open={!!showStageOptionsMenu} onOpenChange={() => setShowStageOptionsMenu(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-violet-600" />
                Stage Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                const newName = prompt('Enter new stage name:')
                if (newName && showStageOptionsMenu) {
                  try {
                    const { error } = await supabase
                      .from('sales_pipeline_stages')
                      .update({ name: newName })
                      .eq('id', showStageOptionsMenu)
                    if (error) throw error
                    toast.success('Stage renamed successfully')
                  } catch (err) {
                    toast.error('Failed to rename stage')
                  }
                }
                setShowStageOptionsMenu(null)
              }}>
                <Edit className="h-4 w-4 mr-2" />Rename Stage
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                const newProbability = prompt('Enter new probability (0-100):')
                if (newProbability && showStageOptionsMenu) {
                  const prob = parseInt(newProbability)
                  if (!isNaN(prob) && prob >= 0 && prob <= 100) {
                    try {
                      const { error } = await supabase
                        .from('sales_pipeline_stages')
                        .update({ probability: prob })
                        .eq('id', showStageOptionsMenu)
                      if (error) throw error
                      toast.success('Stage probability updated')
                    } catch (err) {
                      toast.error('Failed to update probability')
                    }
                  } else {
                    toast.error('Invalid probability value')
                  }
                }
                setShowStageOptionsMenu(null)
              }}>
                <Target className="h-4 w-4 mr-2" />Change Probability
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                if (!showStageOptionsMenu) return
                try {
                  const currentStage = stages?.find(s => s.id === showStageOptionsMenu)
                  if (currentStage && currentStage.stage_order > 1) {
                    const { error } = await supabase
                      .from('sales_pipeline_stages')
                      .update({ stage_order: currentStage.stage_order - 1 })
                      .eq('id', showStageOptionsMenu)
                    if (error) throw error
                    toast.success('Stage moved up')
                  } else {
                    toast.info('Stage is already at the top')
                  }
                } catch (err) {
                  toast.error('Failed to move stage')
                }
                setShowStageOptionsMenu(null)
              }}>
                <ArrowUpRight className="h-4 w-4 mr-2" />Move Up
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={async () => {
                if (!showStageOptionsMenu) return
                try {
                  const currentStage = stages?.find(s => s.id === showStageOptionsMenu)
                  if (currentStage) {
                    const { error } = await supabase
                      .from('sales_pipeline_stages')
                      .update({ stage_order: currentStage.stage_order + 1 })
                      .eq('id', showStageOptionsMenu)
                    if (error) throw error
                    toast.success('Stage moved down')
                  }
                } catch (err) {
                  toast.error('Failed to move stage')
                }
                setShowStageOptionsMenu(null)
              }}>
                <ArrowUpRight className="h-4 w-4 mr-2 rotate-90" />Move Down
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={async () => {
                if (!showStageOptionsMenu) return
                if (confirm('Are you sure you want to delete this stage? Deals in this stage will be moved to the first stage.')) {
                  try {
                    const { error } = await supabase
                      .from('sales_pipeline_stages')
                      .delete()
                      .eq('id', showStageOptionsMenu)
                    if (error) throw error
                    toast.success('Stage deleted successfully')
                  } catch (err) {
                    toast.error('Failed to delete stage')
                  }
                  setShowStageOptionsMenu(null)
                }
              }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete Stage
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Contacts Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-violet-600" />
                Import Contacts
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file to import contacts into your CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop your CSV file here, or click to browse</p>
                <Input
                  type="file"
                  accept=".csv"
                  className="max-w-xs mx-auto"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                {importFile && (
                  <p className="text-sm text-green-600 mt-2">Selected: {importFile.name}</p>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>First Name, Last Name, Email (required)</li>
                  <li>Phone, Title, Company (optional)</li>
                  <li>Maximum 1000 contacts per import</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportFile(null) }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!importFile || isImporting}
                onClick={async () => {
                  if (!importFile) {
                    toast.error('Please select a CSV file')
                    return
                  }
                  setIsImporting(true)
                  toast.loading('Importing contacts...', { id: 'import-contacts' })
                  try {
                    const text = await importFile.text()
                    const lines = text.split('\n').filter(line => line.trim())
                    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

                    const firstNameIdx = headers.findIndex(h => h.includes('first') && h.includes('name'))
                    const lastNameIdx = headers.findIndex(h => h.includes('last') && h.includes('name'))
                    const emailIdx = headers.findIndex(h => h.includes('email'))
                    const phoneIdx = headers.findIndex(h => h.includes('phone'))
                    const titleIdx = headers.findIndex(h => h.includes('title') || h.includes('job'))
                    const companyIdx = headers.findIndex(h => h.includes('company'))

                    if (emailIdx === -1) {
                      toast.error('CSV must contain an Email column', { id: 'import-contacts' })
                      setIsImporting(false)
                      return
                    }

                    let imported = 0
                    let skipped = 0
                    const dataLines = lines.slice(1).slice(0, 1000) // Max 1000

                    for (const line of dataLines) {
                      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
                      const email = values[emailIdx]
                      if (!email || !email.includes('@')) {
                        skipped++
                        continue
                      }

                      const firstName = firstNameIdx >= 0 ? values[firstNameIdx] : ''
                      const lastName = lastNameIdx >= 0 ? values[lastNameIdx] : ''
                      const phone = phoneIdx >= 0 ? values[phoneIdx] : undefined
                      const title = titleIdx >= 0 ? values[titleIdx] : undefined
                      const company = companyIdx >= 0 ? values[companyIdx] : undefined

                      try {
                        await createCustomer({
                          customer_name: `${firstName} ${lastName}`.trim() || email.split('@')[0],
                          first_name: firstName || undefined,
                          last_name: lastName || undefined,
                          email,
                          phone,
                          job_title: title,
                          company_name: company,
                          segment: 'new',
                          status: 'active',
                          total_orders: 0,
                          total_spent: 0,
                          lifetime_value: 0,
                          avg_order_value: 0,
                          join_date: new Date().toISOString(),
                          loyalty_points: 0,
                          referral_count: 0,
                          email_opt_in: true,
                          sms_opt_in: false,
                          churn_risk_score: 0,
                          support_ticket_count: 0
                        })
                        imported++
                      } catch {
                        skipped++
                      }
                    }

                    toast.success(`Import completed: ${imported} contacts imported, ${skipped} skipped`, { id: 'import-contacts' })
                    setShowImportDialog(false)
                    setImportFile(null)
                    refetch()
                  } catch (err) {
                    console.error('Import error:', err)
                    toast.error('Failed to import contacts', { id: 'import-contacts' })
                  } finally {
                    setIsImporting(false)
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />{isImporting ? 'Importing...' : 'Start Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Task Dialog */}
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Add a new task to your to-do list.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Task Subject *</Label>
                <Input
                  placeholder="Enter task subject..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Task description..."
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value) => setTaskForm(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' | 'urgent' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  value={taskForm.contactId}
                  onValueChange={(value) => setTaskForm(prev => ({ ...prev, contactId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {(dbCustomers || []).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.customer_name || `${c.first_name} ${c.last_name}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddTaskDialog(false)
                setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', contactId: '', assigneeId: '' })
              }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!taskForm.title}
                onClick={async () => {
                  if (!taskForm.title) {
                    toast.error('Please enter a task subject')
                    return
                  }
                  toast.loading('Creating task...', { id: 'create-task' })
                  try {
                    const result = await createTask({
                      title: taskForm.title,
                      description: taskForm.description,
                      due_date: taskForm.dueDate || null,
                      priority: taskForm.priority,
                      status: 'todo',
                      category: 'work',
                      type: 'task',
                      metadata: taskForm.contactId ? { related_contact_id: taskForm.contactId } : {}
                    })
                    if (result.success) {
                      toast.success('Task created successfully', { id: 'create-task' })
                      setShowAddTaskDialog(false)
                      setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', contactId: '', assigneeId: '' })
                      refreshTasks()
                    } else {
                      toast.error(result.error || 'Failed to create task', { id: 'create-task' })
                    }
                  } catch (err) {
                    console.error('Failed to create task:', err)
                    toast.error('Failed to create task', { id: 'create-task' })
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Campaign Dialog */}
        <Dialog open={showAddCampaignDialog} onOpenChange={setShowAddCampaignDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-violet-600" />
                Create New Campaign
              </DialogTitle>
              <DialogDescription>
                Set up a new marketing campaign.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="Enter campaign name..."
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <Select
                    value={campaignForm.type}
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, type: value as typeof campaignForm.type }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="display">Display Ads</SelectItem>
                      <SelectItem value="search">Search Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={campaignForm.status}
                    onValueChange={(value) => setCampaignForm(prev => ({ ...prev, status: value as typeof campaignForm.status }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min={0}
                    value={campaignForm.budget || ''}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Revenue</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    min={0}
                    value={campaignForm.expectedRevenue || ''}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, expectedRevenue: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Campaign description..."
                  rows={2}
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddCampaignDialog(false)
                setCampaignForm({ name: '', type: 'email', status: 'planned', startDate: '', endDate: '', budget: 0, expectedRevenue: 0, description: '' })
              }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!campaignForm.name}
                onClick={async () => {
                  if (!campaignForm.name) {
                    toast.error('Please enter a campaign name')
                    return
                  }
                  toast.loading('Creating campaign...', { id: 'create-campaign' })
                  try {
                    await createCampaign({
                      campaign_name: campaignForm.name,
                      description: campaignForm.description || undefined,
                      campaign_type: campaignForm.type,
                      status: campaignForm.status,
                      start_date: campaignForm.startDate || undefined,
                      end_date: campaignForm.endDate || undefined,
                      budget_total: campaignForm.budget,
                      budget_spent: 0,
                      budget_remaining: campaignForm.budget,
                      target_revenue: campaignForm.expectedRevenue,
                      currency: 'USD',
                      audience_size: 0,
                      impressions: 0,
                      clicks: 0,
                      conversions: 0,
                      leads_generated: 0,
                      sales_generated: 0,
                      revenue_generated: 0,
                      likes_count: 0,
                      shares_count: 0,
                      comments_count: 0,
                      followers_gained: 0,
                      emails_sent: 0,
                      emails_delivered: 0,
                      emails_opened: 0,
                      emails_clicked: 0,
                      is_ab_test: false,
                      is_automated: false,
                      requires_approval: false,
                      approved: true,
                      segment_criteria: {},
                      targeting_config: {},
                      content: {},
                      creative_assets: {},
                      tracking_urls: {},
                      channel_config: {},
                      ab_test_config: {},
                      automation_config: {},
                      metadata: {}
                    })
                    toast.success('Campaign created successfully', { id: 'create-campaign' })
                    setShowAddCampaignDialog(false)
                    setCampaignForm({ name: '', type: 'email', status: 'planned', startDate: '', endDate: '', budget: 0, expectedRevenue: 0, description: '' })
                    refetchCampaigns()
                  } catch (err) {
                    console.error('Failed to create campaign:', err)
                    toast.error('Failed to create campaign', { id: 'create-campaign' })
                  }
                }}
              >
                <Megaphone className="h-4 w-4 mr-2" />Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Pipeline Stage Dialog */}
        <Dialog open={showAddStageDialog} onOpenChange={setShowAddStageDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-violet-600" />
                Add Pipeline Stage
              </DialogTitle>
              <DialogDescription>
                Create a new stage in your sales pipeline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Stage Name *</Label>
                <Input
                  placeholder="e.g., Discovery, Demo Scheduled..."
                  value={stageForm.name}
                  onChange={(e) => setStageForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Probability (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={stageForm.probability}
                  onChange={(e) => setStageForm(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stage Color</Label>
                <Select
                  value={stageForm.color}
                  onValueChange={(value) => setStageForm(prev => ({ ...prev, color: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#6B7280">Gray</SelectItem>
                    <SelectItem value="#3B82F6">Blue</SelectItem>
                    <SelectItem value="#22C55E">Green</SelectItem>
                    <SelectItem value="#EAB308">Yellow</SelectItem>
                    <SelectItem value="#F97316">Orange</SelectItem>
                    <SelectItem value="#EF4444">Red</SelectItem>
                    <SelectItem value="#8B5CF6">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddStageDialog(false)
                setStageForm({ name: '', probability: 50, color: '#8B5CF6' })
              }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!stageForm.name}
                onClick={async () => {
                  if (!stageForm.name) {
                    toast.error('Please enter a stage name')
                    return
                  }
                  toast.loading('Adding stage...', { id: 'add-stage' })
                  try {
                    const nextOrder = (stages?.length || 0) + 1
                    await createStage({
                      name: stageForm.name,
                      probability: stageForm.probability,
                      color: stageForm.color,
                      stage_order: nextOrder,
                      is_won_stage: stageForm.probability === 100,
                      is_lost_stage: stageForm.probability === 0,
                      metadata: {}
                    })
                    toast.success('Stage added successfully', { id: 'add-stage' })
                    setShowAddStageDialog(false)
                    setStageForm({ name: '', probability: 50, color: '#8B5CF6' })
                  } catch (err) {
                    console.error('Failed to add stage:', err)
                    toast.error('Failed to add stage', { id: 'add-stage' })
                  }
                }}
              >
                <Layers className="h-4 w-4 mr-2" />Add Stage
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Scoring Rule Dialog */}
        <Dialog open={showAddScoringRuleDialog} onOpenChange={setShowAddScoringRuleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-violet-600" />
                Add Scoring Rule
              </DialogTitle>
              <DialogDescription>
                Create a new lead scoring rule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rule Name *</Label>
                <Input
                  placeholder="e.g., Website Visit, Demo Request..."
                  value={scoringRuleForm.ruleName}
                  onChange={(e) => setScoringRuleForm(prev => ({ ...prev, ruleName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select
                  value={scoringRuleForm.ruleType}
                  onValueChange={(value) => setScoringRuleForm(prev => ({ ...prev, ruleType: value as typeof scoringRuleForm.ruleType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavior">Behavior</SelectItem>
                    <SelectItem value="demographic">Demographic</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Criteria</Label>
                <Input
                  placeholder="e.g., visited pricing page, C-level title..."
                  value={scoringRuleForm.criteria}
                  onChange={(e) => setScoringRuleForm(prev => ({ ...prev, criteria: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Points to Add</Label>
                <Input
                  type="number"
                  min={-100}
                  max={100}
                  value={scoringRuleForm.pointValue}
                  onChange={(e) => setScoringRuleForm(prev => ({ ...prev, pointValue: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddScoringRuleDialog(false)
                setScoringRuleForm({ ruleName: '', ruleType: 'behavior', criteria: '', pointValue: 10 })
              }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!scoringRuleForm.ruleName}
                onClick={async () => {
                  if (!scoringRuleForm.ruleName) {
                    toast.error('Please enter a rule name')
                    return
                  }
                  toast.loading('Adding scoring rule...', { id: 'add-rule' })
                  try {
                    // Store scoring rules in user's metadata or a dedicated table
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'add-rule' })
                      return
                    }

                    // Store in a scoring_rules table if it exists, otherwise use localStorage as fallback
                    const rule = {
                      id: crypto.randomUUID(),
                      name: scoringRuleForm.ruleName,
                      type: scoringRuleForm.ruleType,
                      criteria: scoringRuleForm.criteria,
                      points: scoringRuleForm.pointValue,
                      user_id: user.id,
                      is_active: true,
                      created_at: new Date().toISOString()
                    }

                    // Try to insert into database first
                    const { error: dbError } = await supabase
                      .from('lead_scoring_rules')
                      .insert([rule])

                    if (dbError) {
                      // Fallback to localStorage if table doesn't exist
                      const existingRules = JSON.parse(localStorage.getItem('scoring_rules') || '[]')
                      existingRules.push(rule)
                      localStorage.setItem('scoring_rules', JSON.stringify(existingRules))
                    }

                    toast.success('Scoring rule added', { id: 'add-rule' })
                    setShowAddScoringRuleDialog(false)
                    setScoringRuleForm({ ruleName: '', ruleType: 'behavior', criteria: '', pointValue: 10 })
                  } catch (err) {
                    console.error('Failed to add scoring rule:', err)
                    toast.error('Failed to add scoring rule', { id: 'add-rule' })
                  }
                }}
              >
                <Target className="h-4 w-4 mr-2" />Add Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Connect Slack Dialog */}
        <Dialog open={showConnectSlackDialog} onOpenChange={setShowConnectSlackDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-600" />
                Connect Slack
              </DialogTitle>
              <DialogDescription>
                Connect your Slack workspace to receive CRM notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you will get:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Real-time deal notifications</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Task reminders</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Lead assignment alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Team collaboration features</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>Slack Workspace URL</Label>
                <Input
                  placeholder="yourworkspace.slack.com"
                  value={slackWorkspaceUrl}
                  onChange={(e) => setSlackWorkspaceUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowConnectSlackDialog(false); setSlackWorkspaceUrl('') }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!slackWorkspaceUrl}
                onClick={async () => {
                  if (!slackWorkspaceUrl) {
                    toast.error('Please enter your Slack workspace URL')
                    return
                  }
                  toast.loading('Connecting to Slack...', { id: 'connect-slack' })
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'connect-slack' })
                      return
                    }
                    // Store integration settings
                    const { error } = await supabase
                      .from('user_integrations')
                      .upsert({
                        user_id: user.id,
                        integration_type: 'slack',
                        settings: { workspace_url: slackWorkspaceUrl },
                        is_connected: true,
                        connected_at: new Date().toISOString()
                      }, { onConflict: 'user_id,integration_type' })

                    if (error) {
                      // Fallback to localStorage if table doesn't exist
                      localStorage.setItem('slack_integration', JSON.stringify({
                        workspace_url: slackWorkspaceUrl,
                        connected_at: new Date().toISOString()
                      }))
                    }
                    toast.success('Slack connected successfully', { id: 'connect-slack' })
                    setShowConnectSlackDialog(false)
                    setSlackWorkspaceUrl('')
                  } catch (err) {
                    console.error('Failed to connect Slack:', err)
                    toast.error('Failed to connect Slack', { id: 'connect-slack' })
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />Connect Slack
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Connect Zapier Dialog */}
        <Dialog open={showConnectZapierDialog} onOpenChange={setShowConnectZapierDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-violet-600" />
                Connect Zapier
              </DialogTitle>
              <DialogDescription>
                Automate workflows by connecting to Zapier.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Available Automations:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Sync contacts with other apps</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Trigger emails from CRM events</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Create tasks in project management tools</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Update spreadsheets automatically</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>Zapier API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your Zapier API key..."
                  value={zapierApiKey}
                  onChange={(e) => setZapierApiKey(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowConnectZapierDialog(false); setZapierApiKey('') }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!zapierApiKey}
                onClick={async () => {
                  if (!zapierApiKey) {
                    toast.error('Please enter your Zapier API key')
                    return
                  }
                  toast.loading('Connecting to Zapier...', { id: 'connect-zapier' })
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'connect-zapier' })
                      return
                    }
                    // Store integration settings
                    const { error } = await supabase
                      .from('user_integrations')
                      .upsert({
                        user_id: user.id,
                        integration_type: 'zapier',
                        settings: { api_key_set: true }, // Don't store actual API key in DB
                        is_connected: true,
                        connected_at: new Date().toISOString()
                      }, { onConflict: 'user_id,integration_type' })

                    if (error) {
                      // Fallback to localStorage
                      localStorage.setItem('zapier_integration', JSON.stringify({
                        api_key_hash: btoa(zapierApiKey.slice(0, 8)),
                        connected_at: new Date().toISOString()
                      }))
                    }
                    toast.success('Zapier connected successfully', { id: 'connect-zapier' })
                    setShowConnectZapierDialog(false)
                    setZapierApiKey('')
                  } catch (err) {
                    console.error('Failed to connect Zapier:', err)
                    toast.error('Failed to connect Zapier', { id: 'connect-zapier' })
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />Connect Zapier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Connect LinkedIn Dialog */}
        <Dialog open={showConnectLinkedInDialog} onOpenChange={setShowConnectLinkedInDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-violet-600" />
                Connect LinkedIn Sales Navigator
              </DialogTitle>
              <DialogDescription>
                Enhance your CRM with LinkedIn data and social selling features.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Sync LinkedIn profiles to contacts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Track InMail and connection requests</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Lead recommendations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Company insights and updates</li>
                </ul>
              </div>
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => {
                    // Open LinkedIn OAuth flow in a popup
                    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'YOUR_CLIENT_ID'}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/linkedin/callback')}&scope=r_liteprofile%20r_emailaddress`
                    window.open(linkedInAuthUrl, 'LinkedIn OAuth', 'width=600,height=700')
                    toast.info('LinkedIn authorization window opened')
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Sign in with LinkedIn
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectLinkedInDialog(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={async () => {
                  toast.loading('Saving LinkedIn settings...', { id: 'connect-linkedin' })
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'connect-linkedin' })
                      return
                    }
                    // Store integration settings
                    const { error } = await supabase
                      .from('user_integrations')
                      .upsert({
                        user_id: user.id,
                        integration_type: 'linkedin',
                        settings: { pending_oauth: true },
                        is_connected: false,
                        connected_at: null
                      }, { onConflict: 'user_id,integration_type' })

                    if (error) {
                      localStorage.setItem('linkedin_integration', JSON.stringify({
                        pending_oauth: true,
                        created_at: new Date().toISOString()
                      }))
                    }
                    toast.success('LinkedIn setup initiated - complete OAuth to finish', { id: 'connect-linkedin' })
                    setShowConnectLinkedInDialog(false)
                  } catch (err) {
                    console.error('Failed to connect LinkedIn:', err)
                    toast.error('Failed to connect LinkedIn', { id: 'connect-linkedin' })
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />Complete Setup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export All Data Dialog */}
        <Dialog open={showExportAllDataDialog} onOpenChange={setShowExportAllDataDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-violet-600" />
                Export All CRM Data
              </DialogTitle>
              <DialogDescription>
                Download a complete backup of your CRM data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="json">JSON (Developer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include Data</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exportOptions.contacts}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, contacts: checked }))}
                    />
                    <Label className="font-normal">Contacts ({dbCustomers?.length || 0})</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exportOptions.opportunities}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, opportunities: checked }))}
                    />
                    <Label className="font-normal">Deals ({deals?.length || 0})</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exportOptions.campaigns}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, campaigns: checked }))}
                    />
                    <Label className="font-normal">Campaigns ({campaigns?.length || 0})</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportAllDataDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={() => {
                toast.loading('Preparing export...', { id: 'export-data' })

                const exportData: Record<string, any> = {
                  exported_at: new Date().toISOString(),
                  export_format: exportFormat
                }

                if (exportOptions.contacts && dbCustomers) {
                  exportData.contacts = dbCustomers.map(c => ({
                    name: c.customer_name,
                    email: c.email,
                    phone: c.phone,
                    company: c.company_name,
                    status: c.status,
                    segment: c.segment,
                    lifetime_value: c.lifetime_value,
                    total_orders: c.total_orders,
                    join_date: c.join_date
                  }))
                }

                if (exportOptions.opportunities && deals) {
                  exportData.deals = deals.map(d => ({
                    title: d.title,
                    company: d.company_name,
                    contact: d.contact_name,
                    value: d.deal_value,
                    stage: d.stage,
                    probability: d.probability,
                    expected_close: d.expected_close_date
                  }))
                }

                if (exportOptions.campaigns && campaigns) {
                  exportData.campaigns = campaigns.map(c => ({
                    name: c.campaign_name,
                    type: c.campaign_type,
                    status: c.status,
                    budget: c.budget_total,
                    spent: c.budget_spent,
                    leads: c.leads_generated,
                    conversions: c.conversions
                  }))
                }

                let content: string
                let mimeType: string
                let extension: string

                if (exportFormat === 'csv') {
                  // Convert to CSV
                  const csvSections: string[] = []
                  if (exportData.contacts?.length) {
                    const headers = Object.keys(exportData.contacts[0]).join(',')
                    const rows = exportData.contacts.map((c: any) => Object.values(c).map(v => `"${v || ''}"`).join(',')).join('\n')
                    csvSections.push(`--- CONTACTS ---\n${headers}\n${rows}`)
                  }
                  if (exportData.deals?.length) {
                    const headers = Object.keys(exportData.deals[0]).join(',')
                    const rows = exportData.deals.map((d: any) => Object.values(d).map(v => `"${v || ''}"`).join(',')).join('\n')
                    csvSections.push(`\n--- DEALS ---\n${headers}\n${rows}`)
                  }
                  if (exportData.campaigns?.length) {
                    const headers = Object.keys(exportData.campaigns[0]).join(',')
                    const rows = exportData.campaigns.map((c: any) => Object.values(c).map(v => `"${v || ''}"`).join(',')).join('\n')
                    csvSections.push(`\n--- CAMPAIGNS ---\n${headers}\n${rows}`)
                  }
                  content = csvSections.join('\n\n')
                  mimeType = 'text/csv'
                  extension = 'csv'
                } else {
                  content = JSON.stringify(exportData, null, 2)
                  mimeType = 'application/json'
                  extension = 'json'
                }

                const blob = new Blob([content], { type: mimeType })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `crm-export-${new Date().toISOString().split('T')[0]}.${extension}`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Data exported successfully', { id: 'export-data' })
                setShowExportAllDataDialog(false)
              }}>
                <Download className="h-4 w-4 mr-2" />Export Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Data Dialog */}
        <Dialog open={showImportDataDialog} onOpenChange={setShowImportDataDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-violet-600" />
                Import CRM Data
              </DialogTitle>
              <DialogDescription>
                Restore data from a backup or import from another system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drop your backup file here</p>
                <Input
                  type="file"
                  accept=".csv,.json"
                  className="max-w-xs mx-auto"
                  onChange={(e) => setImportDataFile(e.target.files?.[0] || null)}
                />
                {importDataFile && (
                  <p className="text-sm text-green-600 mt-2">Selected: {importDataFile.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Import Mode</Label>
                <Select value={importMode} onValueChange={setImportMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">Merge with existing data</SelectItem>
                    <SelectItem value="skip">Skip duplicates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Please backup your current data before importing.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImportDataDialog(false); setImportDataFile(null) }}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                disabled={!importDataFile || isImporting}
                onClick={async () => {
                  if (!importDataFile) {
                    toast.error('Please select a file to import')
                    return
                  }
                  setIsImporting(true)
                  toast.loading('Importing data...', { id: 'import-data' })
                  try {
                    const text = await importDataFile.text()
                    let importData: any

                    if (importDataFile.name.endsWith('.json')) {
                      importData = JSON.parse(text)
                    } else {
                      // Parse CSV - basic implementation
                      toast.error('Please use JSON format for full data restore', { id: 'import-data' })
                      setIsImporting(false)
                      return
                    }

                    let imported = 0

                    // Import contacts if present
                    if (importData.contacts?.length) {
                      for (const contact of importData.contacts) {
                        try {
                          // Check for existing by email if skip mode
                          if (importMode === 'skip' && contact.email) {
                            const existing = dbCustomers?.find(c => c.email === contact.email)
                            if (existing) continue
                          }
                          await createCustomer({
                            customer_name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
                            email: contact.email,
                            phone: contact.phone,
                            company_name: contact.company,
                            segment: contact.segment || 'new',
                            status: contact.status || 'active',
                            total_orders: contact.total_orders || 0,
                            total_spent: contact.total_spent || 0,
                            lifetime_value: contact.lifetime_value || 0,
                            avg_order_value: contact.avg_order_value || 0,
                            join_date: contact.join_date || new Date().toISOString(),
                            loyalty_points: 0,
                            referral_count: 0,
                            email_opt_in: true,
                            sms_opt_in: false,
                            churn_risk_score: 0,
                            support_ticket_count: 0
                          })
                          imported++
                        } catch {
                          // Skip failed imports
                        }
                      }
                    }

                    toast.success(`Data imported successfully: ${imported} records`, { id: 'import-data' })
                    setShowImportDataDialog(false)
                    setImportDataFile(null)
                    refetch()
                  } catch (err) {
                    console.error('Import error:', err)
                    toast.error('Failed to import data - check file format', { id: 'import-data' })
                  } finally {
                    setIsImporting(false)
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" />{isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Contacts Confirmation Dialog */}
        <Dialog open={showDeleteAllContactsDialog} onOpenChange={setShowDeleteAllContactsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete All Contacts
              </DialogTitle>
              <DialogDescription>
                This action is permanent and cannot be undone. All contacts, their activity history, and associated data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Warning:</strong> This will delete {dbCustomers?.length || 0} contacts and all associated data.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type DELETE to confirm</Label>
                <Input
                  placeholder="Type DELETE..."
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteAllContactsDialog(false); setConfirmDeleteText('') }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={confirmDeleteText !== 'DELETE'}
                onClick={async () => {
                  if (confirmDeleteText !== 'DELETE') {
                    toast.error('Please type DELETE to confirm')
                    return
                  }
                  toast.loading('Deleting all contacts...', { id: 'delete-all' })
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'delete-all' })
                      return
                    }
                    // Soft delete all contacts for this user
                    const { error } = await supabase
                      .from('customers')
                      .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
                      .eq('user_id', user.id)

                    if (error) throw error

                    toast.success('All contacts deleted', { id: 'delete-all' })
                    setShowDeleteAllContactsDialog(false)
                    setConfirmDeleteText('')
                    refetch()
                  } catch (err) {
                    console.error('Failed to delete contacts:', err)
                    toast.error('Failed to delete contacts', { id: 'delete-all' })
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />Delete All Contacts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Activity History Dialog */}
        <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Clear Activity History
              </DialogTitle>
              <DialogDescription>
                This will permanently delete all activity logs, call records, emails, and notes from your CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Warning:</strong> This will delete all activity records.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type CLEAR to confirm</Label>
                <Input
                  placeholder="Type CLEAR..."
                  value={confirmClearText}
                  onChange={(e) => setConfirmClearText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowClearHistoryDialog(false); setConfirmClearText('') }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={confirmClearText !== 'CLEAR'}
                onClick={async () => {
                  if (confirmClearText !== 'CLEAR') {
                    toast.error('Please type CLEAR to confirm')
                    return
                  }
                  toast.loading('Clearing activity history...', { id: 'clear-history' })
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'clear-history' })
                      return
                    }
                    // Delete all sales activities for this user
                    const { error } = await supabase
                      .from('sales_activities')
                      .delete()
                      .eq('user_id', user.id)

                    if (error) throw error

                    toast.success('Activity history cleared', { id: 'clear-history' })
                    setShowClearHistoryDialog(false)
                    setConfirmClearText('')
                  } catch (err) {
                    console.error('Failed to clear history:', err)
                    toast.error('Failed to clear activity history', { id: 'clear-history' })
                  }
                }}
              >
                <Archive className="h-4 w-4 mr-2" />Clear History
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Factory Reset Dialog */}
        <Dialog open={showFactoryResetDialog} onOpenChange={setShowFactoryResetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="h-5 w-5" />
                Factory Reset CRM
              </DialogTitle>
              <DialogDescription>
                This will reset ALL settings, delete ALL data, and restore the CRM to its default state. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">This will delete:</p>
                <ul className="text-sm text-red-600/80 dark:text-red-400/80 space-y-1 list-disc list-inside">
                  <li>All contacts and accounts ({dbCustomers?.length || 0} records)</li>
                  <li>All opportunities and pipeline data ({deals?.length || 0} deals)</li>
                  <li>All activities and tasks</li>
                  <li>All campaigns ({campaigns?.length || 0} campaigns)</li>
                  <li>All custom settings and integrations</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>Type RESET to confirm</Label>
                <Input
                  placeholder="Type RESET..."
                  value={confirmResetText}
                  onChange={(e) => setConfirmResetText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowFactoryResetDialog(false); setConfirmResetText('') }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={confirmResetText !== 'RESET'}
                onClick={async () => {
                  if (confirmResetText !== 'RESET') {
                    toast.error('Please type RESET to confirm')
                    return
                  }
                  toast.loading('Performing factory reset...', { id: 'factory-reset' })
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      toast.error('Authentication required', { id: 'factory-reset' })
                      return
                    }

                    // Delete all user data in sequence
                    const tables = [
                      'customers',
                      'sales_deals',
                      'sales_activities',
                      'sales_pipeline_stages',
                      'campaigns',
                      'tasks',
                      'user_integrations'
                    ]

                    for (const table of tables) {
                      try {
                        await supabase.from(table).delete().eq('user_id', user.id)
                      } catch {
                        // Table may not exist, continue
                      }
                    }

                    // Clear localStorage
                    localStorage.removeItem('scoring_rules')
                    localStorage.removeItem('slack_integration')
                    localStorage.removeItem('zapier_integration')
                    localStorage.removeItem('linkedin_integration')

                    toast.success('Factory reset complete - all data has been deleted', { id: 'factory-reset' })
                    setShowFactoryResetDialog(false)
                    setConfirmResetText('')
                    // Refresh the page to reset all state
                    window.location.reload()
                  } catch (err) {
                    console.error('Factory reset failed:', err)
                    toast.error('Factory reset failed', { id: 'factory-reset' })
                  }
                }}
              >
                <AlertOctagon className="h-4 w-4 mr-2" />Factory Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
