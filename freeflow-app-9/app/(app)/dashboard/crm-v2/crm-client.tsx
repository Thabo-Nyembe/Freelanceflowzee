'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Users, Plus, Mail, Phone, DollarSign, TrendingUp, MessageSquare, UserPlus,
  Building2, Target, Search, Filter, MoreVertical, Star, Calendar, Clock,
  ArrowRight, Settings, Download, RefreshCw, Briefcase,
  Activity, BarChart3, Zap, CheckCircle2,
  FileText, Link2, Globe, MapPin, Linkedin, Award,
  ArrowUpRight, ArrowDownRight, Trash2, Edit, Bell, Play,
  GitBranch, Workflow, Cog, AlertCircle, CheckCircle, LayoutGrid,
  List, Kanban, Archive,
  Loader2
} from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation, useRealtimeSubscription } from '@/lib/hooks/use-supabase-helpers'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Centralized Mock Data - For features not yet stored in Supabase
import {
  crmCompanies,
  crmReports,
  crmAutomations,
  crmAIInsights,
  crmCollaborators,
  crmPredictions,
  crmQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type ContactType = 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor'
type ContactStatus = 'active' | 'vip' | 'new' | 'qualified' | 'inactive' | 'churned'
type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task'
type AutomationType = 'workflow' | 'sequence' | 'trigger' | 'action'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  title: string
  type: ContactType
  status: ContactStatus
  dealValue: number
  dealStage: DealStage | null
  leadScore: number
  probability: number
  owner: string
  source: string
  lastContact: string
  nextFollowUp: string | null
  tags: string[]
  emailCount: number
  callCount: number
  meetingCount: number
  createdAt: string
  avatar: string
}

interface Company {
  id: string
  name: string
  industry: string
  size: string
  revenue: number
  employees: number
  contacts: number
  deals: number
  dealValue: number
  website: string
  location: string
  status: 'active' | 'prospect' | 'inactive'
}

interface Deal {
  id: string
  name: string
  company: string
  contact: string
  value: number
  stage: DealStage
  probability: number
  expectedClose: string
  owner: string
  createdAt: string
  lastActivity: string
  products: string[]
}

interface CrmActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  contactId: string
  contactName: string
  timestamp: string
  completed: boolean
  outcome: string | null
  duration: number | null
}

interface Report {
  id: string
  name: string
  type: 'pipeline' | 'activity' | 'revenue' | 'conversion' | 'forecast'
  lastRun: string
  frequency: 'daily' | 'weekly' | 'monthly'
  recipients: number
  status: 'active' | 'paused'
}

interface Automation {
  id: string
  name: string
  type: AutomationType
  trigger: string
  actions: number
  executions: number
  successRate: number
  status: 'active' | 'paused' | 'draft'
  lastRun: string
}

// Pipeline stages configuration
const PIPELINE_STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecting', color: 'sky' },
  { id: 'qualification', label: 'Qualification', color: 'indigo' },
  { id: 'proposal', label: 'Proposal', color: 'amber' },
  { id: 'negotiation', label: 'Negotiation', color: 'orange' },
  { id: 'closed_won', label: 'Closed Won', color: 'emerald' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red' }
]

// Use mock data for reports, automations, and AI features (not stored in DB yet)
const mockCompanies = crmCompanies as Company[]
const mockReports = crmReports as Report[]
const mockAutomations = crmAutomations as Automation[]
const mockAIInsights = crmAIInsights
const mockCrmCollaborators = crmCollaborators
const mockCrmPredictions = crmPredictions
const mockCrmQuickActions = crmQuickActions

export default function CrmClient() {
  const supabase = createClient()

  // Supabase queries
  const { data: dbContacts, isLoading: contactsLoading, refetch: refetchContacts } = useSupabaseQuery<any>({
    table: 'crm_contacts',
    orderBy: { column: 'created_at', ascending: false }
  })

  const { data: dbDeals, isLoading: dealsLoading, refetch: refetchDeals } = useSupabaseQuery<any>({
    table: 'crm_deals',
    orderBy: { column: 'created_at', ascending: false }
  })

  const { data: dbActivities, isLoading: activitiesLoading, refetch: refetchActivities } = useSupabaseQuery<any>({
    table: 'crm_activities',
    orderBy: { column: 'created_at', ascending: false }
  })

  // Mutations
  const contactMutation = useSupabaseMutation<any>({
    table: 'crm_contacts',
    onSuccess: () => refetchContacts()
  })

  const dealMutation = useSupabaseMutation<any>({
    table: 'crm_deals',
    onSuccess: () => refetchDeals()
  })

  const activityMutation = useSupabaseMutation<any>({
    table: 'crm_activities',
    onSuccess: () => refetchActivities()
  })

  // Transform database data to UI format - no mock fallback, show empty state for real data
  const contacts: Contact[] = dbContacts.map((c: any) => ({
    id: c.id,
    name: c.contact_name || c.name || 'Unknown',
    email: c.email || '',
    phone: c.phone || '',
    company: c.company_name || c.company || '',
    title: c.job_title || c.title || '',
    type: c.contact_type || 'lead',
    status: c.status || 'new',
    dealValue: parseFloat(c.deal_value) || 0,
    dealStage: c.deal_stage || null,
    leadScore: c.lead_score || 50,
    probability: c.probability_percentage || 0,
    owner: c.account_owner_name || 'Unassigned',
    source: c.lead_source || 'website',
    lastContact: c.last_contact_date || c.updated_at || c.created_at,
    nextFollowUp: c.next_followup_date || null,
    tags: c.tags || [],
    emailCount: c.email_count || 0,
    callCount: c.call_count || 0,
    meetingCount: c.meeting_count || 0,
    createdAt: c.created_at,
    avatar: (c.contact_name || c.name || 'U').charAt(0).toUpperCase()
  }))

  const deals: Deal[] = dbDeals.map((d: any) => {
    // Map database stage values to UI stage values
    const stageMap: Record<string, DealStage> = {
      'discovery': 'prospecting',
      'qualification': 'qualification',
      'proposal': 'proposal',
      'negotiation': 'negotiation',
      'closed-won': 'closed_won',
      'closed_won': 'closed_won',
      'closed-lost': 'closed_lost',
      'closed_lost': 'closed_lost',
      'prospecting': 'prospecting',
    }
    const rawStage = d.deal_stage || d.stage || 'prospecting'
    const mappedStage = stageMap[rawStage] || 'prospecting'

    return {
      id: d.id,
      name: d.deal_name || d.name || 'Untitled Deal',
      company: d.company_name || d.company || '',
      contact: d.contact_name || d.contact || '',
      value: parseFloat(d.deal_value || d.value) || 0,
      stage: mappedStage,
      probability: d.probability_percentage || d.probability || 0,
      expectedClose: d.expected_close_date || d.expectedClose || new Date().toISOString(),
      owner: d.owner_name || d.owner || 'Unassigned',
      createdAt: d.created_at,
      lastActivity: d.updated_at || d.created_at,
      products: d.products || []
    }
  })

  const activities: CrmActivity[] = dbActivities.map((a: any) => {
    // Map database activity type to UI type
    const typeMap: Record<string, ActivityType> = {
      'call': 'call',
      'email': 'email',
      'meeting': 'meeting',
      'note': 'note',
      'task': 'task',
      'deal-update': 'note',
    }
    const rawType = a.activity_type || a.type || 'note'
    const mappedType = typeMap[rawType] || 'note'

    return {
      id: a.id,
      type: mappedType,
      title: a.subject || a.title || 'Activity',
      description: a.description || '',
      contactId: a.contact_id || '',
      contactName: a.contact_name || 'Unknown',
      timestamp: a.activity_date || a.due_date || a.created_at,
      completed: a.status === 'completed' || a.completed || !!a.completed_at,
      outcome: a.outcome || null,
      duration: a.duration_minutes || a.duration || null
    }
  })

  const [companies] = useState<Company[]>(mockCompanies)
  const [reports] = useState<Report[]>(mockReports)
  const [automations] = useState<Automation[]>(mockAutomations)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states
  const [showAddContactDialog, setShowAddContactDialog] = useState(false)
  const [showAddDealDialog, setShowAddDealDialog] = useState(false)
  const [showEditContactDialog, setShowEditContactDialog] = useState(false)
  const [showEditDealDialog, setShowEditDealDialog] = useState(false)
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false)

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    type: 'lead' as ContactType,
    status: 'new' as ContactStatus,
    dealValue: 0,
    leadScore: 50,
    source: 'website',
    notes: ''
  })

  const [dealForm, setDealForm] = useState({
    name: '',
    company: '',
    contact: '',
    value: 0,
    stage: 'prospecting' as DealStage,
    probability: 25,
    expectedClose: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [activityForm, setActivityForm] = useState({
    type: 'note' as ActivityType,
    title: '',
    description: '',
    contactId: '',
    contactName: ''
  })

  // Real-time subscriptions
  useRealtimeSubscription({
    table: 'crm_contacts',
    onUpdate: () => refetchContacts()
  })

  useRealtimeSubscription({
    table: 'crm_deals',
    onUpdate: () => refetchDeals()
  })

  useRealtimeSubscription({
    table: 'crm_activities',
    onUpdate: () => refetchActivities()
  })

  // Settings
  const [settings, setSettings] = useState({
    emailSync: true,
    calendarSync: true,
    autoAssign: true,
    leadScoring: true,
    activityReminders: true,
    dealRotation: false,
    duplicateDetection: true,
    dataEnrichment: true
  })

  // Loading state
  const isLoading = contactsLoading || dealsLoading || activitiesLoading

  // Stats
  const stats = useMemo(() => {
    const totalContacts = contacts.length
    const totalLeads = contacts.filter(c => c.type === 'lead').length
    const totalCustomers = contacts.filter(c => c.type === 'customer').length
    const vipContacts = contacts.filter(c => c.status === 'vip').length
    const pipelineValue = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').reduce((sum, d) => sum + d.value, 0)
    const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0)
    const closedDeals = deals.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost')
    const wonDeals = deals.filter(d => d.stage === 'closed_won')
    const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0
    const avgDealSize = deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0
    const avgLeadScore = contacts.length > 0 ? contacts.reduce((sum, c) => sum + c.leadScore, 0) / contacts.length : 0
    const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length
    return { totalContacts, totalLeads, totalCustomers, vipContacts, pipelineValue, wonValue, winRate, avgDealSize, avgLeadScore, activeDeals }
  }, [contacts, deals])

  // Pipeline data
  const pipelineData = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      prospecting: [],
      qualification: [],
      proposal: [],
      negotiation: [],
      closed_won: [],
      closed_lost: []
    }
    deals.forEach(deal => {
      if (grouped[deal.stage]) {
        grouped[deal.stage].push(deal)
      }
    })
    return grouped
  }, [deals])

  // CRUD Handlers
  const handleAddContact = () => {
    setContactForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      type: 'lead',
      status: 'new',
      dealValue: 0,
      leadScore: 50,
      source: 'website',
      notes: ''
    })
    setShowAddContactDialog(true)
  }

  const handleCreateContact = async () => {
    if (!contactForm.name.trim()) {
      toast.error('Contact name is required')
      return
    }

    const result = await contactMutation.mutate({
      contact_name: contactForm.name,
      email: contactForm.email || null,
      phone: contactForm.phone || null,
      company_name: contactForm.company || null,
      job_title: contactForm.title || null,
      contact_type: contactForm.type,
      status: contactForm.status,
      deal_value: contactForm.dealValue,
      lead_score: contactForm.leadScore,
      lead_source: contactForm.source,
      notes: contactForm.notes || null,
      email_count: 0,
      call_count: 0,
      meeting_count: 0,
      probability_percentage: 0,
      lifetime_value: 0,
      total_purchases: 0,
      avg_purchase_value: 0,
      purchase_count: 0,
      outstanding_balance: 0,
      engagement_score: 0,
      email_opt_in: true,
      sms_opt_in: false,
      do_not_contact: false
    })

    if (result) {
      toast.success('Contact created', {
        description: `${contactForm.name} has been added to your CRM`
      })
      setShowAddContactDialog(false)
    } else {
      toast.error('Failed to create contact', {
        description: contactMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleEditContact = (contact: Contact) => {
    setContactForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      type: contact.type,
      status: contact.status,
      dealValue: contact.dealValue,
      leadScore: contact.leadScore,
      source: contact.source,
      notes: ''
    })
    setSelectedContact(contact)
    setShowEditContactDialog(true)
  }

  const handleUpdateContact = async () => {
    if (!selectedContact) return

    const result = await contactMutation.mutate({
      contact_name: contactForm.name,
      email: contactForm.email || null,
      phone: contactForm.phone || null,
      company_name: contactForm.company || null,
      job_title: contactForm.title || null,
      contact_type: contactForm.type,
      status: contactForm.status,
      deal_value: contactForm.dealValue,
      lead_score: contactForm.leadScore,
      lead_source: contactForm.source,
      notes: contactForm.notes || null
    }, selectedContact.id)

    if (result) {
      toast.success('Contact updated', {
        description: `${contactForm.name} has been updated`
      })
      setShowEditContactDialog(false)
      setSelectedContact(null)
    } else {
      toast.error('Failed to update contact', {
        description: contactMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleDeleteContact = async (contactId: string, contactName: string) => {
    const success = await contactMutation.remove(contactId)
    if (success) {
      toast.success('Contact deleted', {
        description: `${contactName} has been removed`
      })
      setSelectedContact(null)
    } else {
      toast.error('Failed to delete contact', {
        description: contactMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleAddDeal = () => {
    setDealForm({
      name: '',
      company: '',
      contact: '',
      value: 0,
      stage: 'prospecting',
      probability: 25,
      expectedClose: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowAddDealDialog(true)
  }

  const handleCreateDeal = async () => {
    if (!dealForm.name.trim()) {
      toast.error('Deal name is required')
      return
    }

    const result = await dealMutation.mutate({
      deal_name: dealForm.name,
      company_name: dealForm.company || null,
      contact_name: dealForm.contact || null,
      deal_value: dealForm.value,
      deal_stage: dealForm.stage,
      probability_percentage: dealForm.probability,
      expected_close_date: dealForm.expectedClose,
      notes: dealForm.notes || null,
      products: []
    })

    if (result) {
      toast.success('Deal created', {
        description: `${dealForm.name} has been added to your pipeline`
      })
      setShowAddDealDialog(false)
    } else {
      toast.error('Failed to create deal', {
        description: dealMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleEditDeal = (deal: Deal) => {
    setDealForm({
      name: deal.name,
      company: deal.company,
      contact: deal.contact,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedClose: deal.expectedClose.split('T')[0],
      notes: ''
    })
    setSelectedDeal(deal)
    setShowEditDealDialog(true)
  }

  const handleUpdateDeal = async () => {
    if (!selectedDeal) return

    const result = await dealMutation.mutate({
      deal_name: dealForm.name,
      company_name: dealForm.company || null,
      contact_name: dealForm.contact || null,
      deal_value: dealForm.value,
      deal_stage: dealForm.stage,
      probability_percentage: dealForm.probability,
      expected_close_date: dealForm.expectedClose,
      notes: dealForm.notes || null
    }, selectedDeal.id)

    if (result) {
      toast.success('Deal updated', {
        description: `${dealForm.name} has been updated`
      })
      setShowEditDealDialog(false)
      setSelectedDeal(null)
    } else {
      toast.error('Failed to update deal', {
        description: dealMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleDeleteDeal = async (dealId: string, dealName: string) => {
    const success = await dealMutation.remove(dealId)
    if (success) {
      toast.success('Deal deleted', {
        description: `${dealName} has been removed`
      })
      setSelectedDeal(null)
    } else {
      toast.error('Failed to delete deal', {
        description: dealMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleMoveDealStage = async (dealId: string, newStage: DealStage) => {
    const probability = {
      prospecting: 10,
      qualification: 25,
      proposal: 50,
      negotiation: 75,
      closed_won: 100,
      closed_lost: 0
    }[newStage]

    const result = await dealMutation.mutate({
      deal_stage: newStage,
      probability_percentage: probability
    }, dealId)

    if (result) {
      toast.success('Deal stage updated', {
        description: `Moved to ${newStage.replace('_', ' ')}`
      })
    } else {
      toast.error('Failed to update deal stage')
    }
  }

  const handleAddActivity = (contactId?: string, contactName?: string) => {
    setActivityForm({
      type: 'note',
      title: '',
      description: '',
      contactId: contactId || '',
      contactName: contactName || ''
    })
    setShowAddActivityDialog(true)
  }

  const handleCreateActivity = async () => {
    if (!activityForm.title.trim()) {
      toast.error('Activity title is required')
      return
    }

    const result = await activityMutation.mutate({
      activity_type: activityForm.type,
      title: activityForm.title,
      description: activityForm.description || null,
      contact_id: activityForm.contactId || null,
      contact_name: activityForm.contactName || null,
      activity_date: new Date().toISOString(),
      completed: false,
      outcome: null,
      duration_minutes: null
    })

    if (result) {
      toast.success('Activity logged', {
        description: `${activityForm.title} has been recorded`
      })
      setShowAddActivityDialog(false)
    } else {
      toast.error('Failed to log activity', {
        description: activityMutation.error?.message || 'Please try again'
      })
    }
  }

  const handleCompleteActivity = async (activityId: string) => {
    const result = await activityMutation.mutate({
      completed: true
    }, activityId)

    if (result) {
      toast.success('Activity completed')
    } else {
      toast.error('Failed to complete activity')
    }
  }

  const handleExportCRM = async () => {
    const exportPromise = new Promise<void>((resolve, reject) => {
      try {
        const exportData = {
          contacts: contacts,
          deals: deals,
          activities: activities,
          exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `crm-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(exportPromise, {
      loading: 'Preparing export... Your CRM data is being prepared for download',
      success: 'Export complete! Your CRM data has been downloaded',
      error: 'Export failed. Unable to export CRM data'
    })
  }

  const handleSyncData = async () => {
    const syncPromise = Promise.all([
      refetchContacts(),
      refetchDeals(),
      refetchActivities()
    ])

    toast.promise(syncPromise, {
      loading: 'Syncing data... Refreshing from database',
      success: 'Sync complete! CRM data has been refreshed',
      error: 'Sync failed. Unable to refresh CRM data'
    })
  }

  const handleQualifyLead = async (contactId: string, contactName: string) => {
    const result = await contactMutation.mutate({
      status: 'qualified',
      qualification_status: 'qualified'
    }, contactId)

    if (result) {
      toast.success('Lead qualified', {
        description: `${contactName} has been moved to qualified status`
      })
    } else {
      toast.error('Failed to qualify lead')
    }
  }

  const handleImportContacts = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string
            if (file.name.endsWith('.json')) {
              const data = JSON.parse(content)
              toast.success(`Parsed ${Array.isArray(data) ? data.length : 1} contacts from ${file.name}`)
            } else {
              const lines = content.split('\n').filter(l => l.trim())
              toast.success(`Parsed ${Math.max(0, lines.length - 1)} contacts from ${file.name}`)
            }
          } catch {
            toast.error('Failed to parse import file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [contacts, searchQuery, statusFilter])

  // Helper functions
  const getStatusColor = (status: ContactStatus) => {
    const colors: Record<ContactStatus, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      vip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      qualified: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      churned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status]
  }

  const getStageColor = (stage: DealStage) => {
    const colors: Record<DealStage, string> = {
      prospecting: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      qualification: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      proposal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      closed_won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      closed_lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[stage]
  }

  const getActivityIcon = (type: ActivityType) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      call: <Phone className="w-4 h-4" />,
      meeting: <Calendar className="w-4 h-4" />,
      note: <FileText className="w-4 h-4" />,
      task: <CheckCircle2 className="w-4 h-4" />
    }
    return icons[type]
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`
    return `$${num}`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const statCards = [
    { label: 'Total Contacts', value: stats.totalContacts.toString(), change: 12.5, icon: Users, gradient: 'from-indigo-500 to-purple-500' },
    { label: 'Active Leads', value: stats.totalLeads.toString(), change: 8.3, icon: Target, gradient: 'from-sky-500 to-blue-500' },
    { label: 'Pipeline Value', value: formatCurrency(stats.pipelineValue), change: 23.1, icon: DollarSign, gradient: 'from-emerald-500 to-green-500' },
    { label: 'Won Revenue', value: formatCurrency(stats.wonValue), change: 15.7, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, change: 5.2, icon: Award, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Active Deals', value: stats.activeDeals.toString(), change: -3.4, icon: Briefcase, gradient: 'from-cyan-500 to-teal-500' },
    { label: 'VIP Contacts', value: stats.vipContacts.toString(), change: 18.9, icon: Star, gradient: 'from-rose-500 to-red-500' },
    { label: 'Avg Lead Score', value: stats.avgLeadScore.toFixed(0), change: 4.1, icon: Zap, gradient: 'from-blue-500 to-indigo-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Platform</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Salesforce-level customer relationship management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Collaboration Indicator */}
            <CollaborationIndicator
              collaborators={mockCrmCollaborators}
              maxVisible={3}
            />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSyncData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => {
              const statuses: (ContactStatus | 'all')[] = ['all', 'active', 'vip', 'new', 'qualified', 'inactive', 'churned']
              const currentIndex = statuses.indexOf(statusFilter)
              const nextStatus = statuses[(currentIndex + 1) % statuses.length]
              setStatusFilter(nextStatus)
              toast.success(`Filter: ${nextStatus === 'all' ? 'All contacts' : nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`)
            }}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button onClick={handleAddContact} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
            <span className="text-sm text-gray-500">Loading CRM data...</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CRM Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="font-semibold">Top Performer</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sarah Johnson closed 3 deals worth $405K this month</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="font-semibold">Deals Won</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise Inc deal closed for $250K - your biggest win!</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="font-semibold">Needs Attention</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">3 deals have been stale for 7+ days - follow up soon</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="font-semibold">Upcoming</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">5 follow-ups scheduled for this week across 4 contacts</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Kanban className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            {/* Pipeline Overview Banner */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Kanban className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Sales Pipeline</h3>
                      <p className="text-indigo-100">Drag and drop to move deals between stages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.activeDeals}</div>
                      <div className="text-sm text-indigo-100">Active Deals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(stats.pipelineValue)}</div>
                      <div className="text-sm text-indigo-100">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.winRate.toFixed(0)}%</div>
                      <div className="text-sm text-indigo-100">Win Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(stats.avgDealSize)}</div>
                      <div className="text-sm text-indigo-100">Avg Deal</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {PIPELINE_STAGES.filter(s => s.id !== 'closed_lost').map((stage) => {
                  const stageDeals = pipelineData[stage.id] || []
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)

                  return (
                    <div key={stage.id} className="w-[320px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full bg-${stage.color}-500`}></div>
                          <h3 className="font-semibold">{stage.label}</h3>
                          <Badge variant="secondary">{stageDeals.length}</Badge>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{formatCurrency(stageValue)}</span>
                      </div>

                      <div className="space-y-3">
                        {stageDeals.map(deal => (
                          <Card key={deal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDeal(deal)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-sm">{deal.name}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {deal.company}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditDeal(deal)
                                }}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold text-emerald-600">{formatCurrency(deal.value)}</span>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Target className="w-3 h-3" />
                                  {deal.probability}%
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                Close: {new Date(deal.expectedClose).toLocaleDateString()}
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {stageDeals.length === 0 && (
                          <div className="py-8 text-center text-sm text-gray-400">
                            No deals in this stage
                          </div>
                        )}

                        <Button variant="outline" className="w-full border-dashed" onClick={handleAddDeal}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Deal
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            {/* Contacts Overview Banner */}
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Contact Management</h3>
                      <p className="text-blue-100">Track and manage all your customer relationships</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalContacts}</div>
                      <div className="text-sm text-blue-100">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalLeads}</div>
                      <div className="text-sm text-blue-100">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                      <div className="text-sm text-blue-100">Customers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.vipContacts}</div>
                      <div className="text-sm text-blue-100">VIP</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                  <List className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'active', 'vip', 'new', 'qualified'] as const).map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Deal Value</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lead Score</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactsLoading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                            <p className="text-gray-500">Loading contacts...</p>
                          </td>
                        </tr>
                      ) : filteredContacts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No contacts yet</p>
                            <p className="text-sm text-gray-400 mb-4">Get started by adding your first contact</p>
                            <Button onClick={() => setShowAddContactDialog(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Contact
                            </Button>
                          </td>
                        </tr>
                      ) : filteredContacts.map(contact => (
                        <tr key={contact.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                {contact.avatar}
                              </div>
                              <div>
                                <p className="font-medium">{contact.name}</p>
                                <p className="text-sm text-gray-500">{contact.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span>{contact.company}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                          </td>
                          <td className="py-3 px-4 font-medium text-emerald-600">{formatCurrency(contact.dealValue)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Progress value={contact.leadScore} className="w-16 h-2" />
                              <span className="text-sm">{contact.leadScore}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatTimeAgo(contact.lastContact)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation()
                                if (contact.email) {
                                  window.location.href = `mailto:${contact.email}`
                                  toast.success(`Opening email to ${contact.name}`)
                                } else {
                                  toast.error('No email address available')
                                }
                              }}>
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation()
                                if (contact.phone) {
                                  window.location.href = `tel:${contact.phone}`
                                  toast.success(`Calling ${contact.phone}`)
                                } else {
                                  toast.error('No phone number available')
                                }
                              }}>
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                e.stopPropagation()
                                handleEditContact(contact)
                              }}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            {/* Companies Overview Banner */}
            <Card className="bg-gradient-to-r from-emerald-600 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Company Accounts</h3>
                      <p className="text-green-100">Manage B2B relationships and accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{companies.length}</div>
                      <div className="text-sm text-green-100">Companies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{companies.filter(c => c.status === 'active').length}</div>
                      <div className="text-sm text-green-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(companies.reduce((sum, c) => sum + c.dealValue, 0))}</div>
                      <div className="text-sm text-green-100">Total Value</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map(company => (
                <Card key={company.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <p className="text-sm text-gray-500">{company.industry}</p>
                        </div>
                      </div>
                      <Badge className={company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {company.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Contacts</p>
                        <p className="text-lg font-bold">{company.contacts}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(company.dealValue)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {company.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {company.website}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-0 shadow-sm border-dashed border-2 border-gray-300 dark:border-gray-600">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Building2 className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Add Company</p>
                  <p className="text-sm text-gray-500">Create a new company record</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            {/* Deals Overview Banner */}
            <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Deal Management</h3>
                      <p className="text-amber-100">Track opportunities through your sales cycle</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{deals.length}</div>
                      <div className="text-sm text-amber-100">Total Deals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))}</div>
                      <div className="text-sm text-amber-100">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(stats.wonValue)}</div>
                      <div className="text-sm text-amber-100">Won Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.winRate.toFixed(0)}%</div>
                      <div className="text-sm text-amber-100">Win Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {dealsLoading ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                    <p className="text-gray-500">Loading deals...</p>
                  </CardContent>
                </Card>
              ) : deals.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No deals yet</p>
                    <p className="text-sm text-gray-400 mb-4">Create your first deal to start tracking opportunities</p>
                    <Button onClick={() => setShowAddDealDialog(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Deal
                    </Button>
                  </CardContent>
                </Card>
              ) : deals.map(deal => (
                <Card key={deal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDeal(deal)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                          {deal.company.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{deal.name}</h3>
                          <p className="text-sm text-gray-500">{deal.company} {deal.contact ? `• ${deal.contact}` : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(deal.value)}</div>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <span className="text-sm text-gray-500">{deal.probability}% probability</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <Badge className={getStageColor(deal.stage)}>
                        {deal.stage.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Close: {new Date(deal.expectedClose).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {deal.owner}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            {/* Activities Overview Banner */}
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Activity Timeline</h3>
                      <p className="text-purple-100">Track all customer interactions and tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{activities.length}</div>
                      <div className="text-sm text-purple-100">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{activities.filter(a => !a.completed).length}</div>
                      <div className="text-sm text-purple-100">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{activities.filter(a => a.completed).length}</div>
                      <div className="text-sm text-purple-100">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{activities.filter(a => a.type === 'email').length}</div>
                      <div className="text-sm text-purple-100">Emails</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Upcoming Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activitiesLoading ? (
                      <div className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" />
                        <p className="text-sm text-gray-500">Loading activities...</p>
                      </div>
                    ) : activities.filter(a => !a.completed).length === 0 ? (
                      <div className="py-8 text-center">
                        <Activity className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium text-sm">No upcoming activities</p>
                        <p className="text-xs text-gray-400">Use the quick actions to log activities</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activities.filter(a => !a.completed).map(activity => (
                          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className={`p-2 rounded-lg ${
                              activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'call' ? 'bg-green-100 text-green-600' :
                              activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                {activity.contactName}
                                <span className="mx-1">•</span>
                                <Clock className="w-3 h-3" />
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCompleteActivity(activity.id)}
                              title="Mark as complete"
                            >
                              <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Completed Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.filter(a => a.completed).length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500 font-medium text-sm">No completed activities yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activities.filter(a => a.completed).map(activity => (
                          <div key={activity.id} className="flex items-start gap-4 p-4 border-l-2 border-green-500 bg-gray-50 dark:bg-gray-800 rounded-r-lg">
                            <div className={`p-2 rounded-lg ${
                              activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'call' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                {activity.contactName}
                                <span className="mx-1">•</span>
                                {formatTimeAgo(activity.timestamp)}
                              </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-blue-50 text-blue-600 border-blue-200"
                      onClick={() => {
                        setActivityForm({ ...activityForm, type: 'email', title: '', description: '' })
                        setShowAddActivityDialog(true)
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Log Email
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-green-50 text-green-600 border-green-200"
                      onClick={() => {
                        setActivityForm({ ...activityForm, type: 'call', title: '', description: '' })
                        setShowAddActivityDialog(true)
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Log Call
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-purple-50 text-purple-600 border-purple-200"
                      onClick={() => {
                        setActivityForm({ ...activityForm, type: 'meeting', title: '', description: '' })
                        setShowAddActivityDialog(true)
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-amber-50 text-amber-600 border-amber-200"
                      onClick={() => {
                        setActivityForm({ ...activityForm, type: 'note', title: '', description: '' })
                        setShowAddActivityDialog(true)
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Activity Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Emails sent</span>
                      <span className="font-bold">127</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Calls made</span>
                      <span className="font-bold">48</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Meetings held</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tasks completed</span>
                      <span className="font-bold">89</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Reports Overview Banner */}
            <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Reports & Analytics</h3>
                      <p className="text-teal-100">Gain insights into your sales performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{reports.length}</div>
                      <div className="text-sm text-teal-100">Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{reports.filter(r => r.status === 'active').length}</div>
                      <div className="text-sm text-teal-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{reports.reduce((sum, r) => sum + r.recipients, 0)}</div>
                      <div className="text-sm text-teal-100">Recipients</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reports & Analytics</h3>
              <Button onClick={() => {
                const reportData = reports.map(r => ({
                  name: r.name,
                  type: r.type,
                  frequency: r.frequency,
                  status: r.status,
                  recipients: r.recipients,
                  lastRun: r.lastRun
                }))
                const csv = [
                  ['Name', 'Type', 'Frequency', 'Status', 'Recipients', 'Last Run'].join(','),
                  ...reportData.map(r => [r.name, r.type, r.frequency, r.status, r.recipients, r.lastRun].join(','))
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `crm-reports-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success('Report exported as CSV')
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map(report => (
                <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          report.type === 'pipeline' ? 'bg-indigo-100 text-indigo-600' :
                          report.type === 'activity' ? 'bg-green-100 text-green-600' :
                          report.type === 'revenue' ? 'bg-emerald-100 text-emerald-600' :
                          report.type === 'conversion' ? 'bg-amber-100 text-amber-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {report.type === 'pipeline' ? <Kanban className="w-5 h-5" /> :
                           report.type === 'activity' ? <Activity className="w-5 h-5" /> :
                           report.type === 'revenue' ? <DollarSign className="w-5 h-5" /> :
                           report.type === 'conversion' ? <TrendingUp className="w-5 h-5" /> :
                           <BarChart3 className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{report.name}</h4>
                          <p className="text-xs text-gray-500 capitalize">{report.frequency}</p>
                        </div>
                      </div>
                      <Badge className={report.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {report.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{report.recipients} recipients</span>
                      <span>Last run {formatTimeAgo(report.lastRun)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            {/* Automation Overview Banner */}
            <Card className="bg-gradient-to-r from-rose-600 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Workflow className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Workflows & Automation</h3>
                      <p className="text-rose-100">Automate repetitive tasks and workflows</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{automations.length}</div>
                      <div className="text-sm text-rose-100">Automations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{automations.filter(a => a.status === 'active').length}</div>
                      <div className="text-sm text-rose-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{automations.reduce((sum, a) => sum + a.executions, 0)}</div>
                      <div className="text-sm text-rose-100">Executions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length).toFixed(0)}%</div>
                      <div className="text-sm text-rose-100">Success</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Workflows & Automation</h3>
              <Button onClick={() => {
                const automationData = automations.map(a => ({
                  name: a.name,
                  type: a.type,
                  trigger: a.trigger,
                  actions: a.actions,
                  executions: a.executions,
                  successRate: a.successRate,
                  status: a.status
                }))
                const csv = [
                  ['Name', 'Type', 'Trigger', 'Actions', 'Executions', 'Success Rate', 'Status'].join(','),
                  ...automationData.map(a => [a.name, a.type, a.trigger, a.actions, a.executions, `${a.successRate}%`, a.status].join(','))
                ].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `crm-automations-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success('Automations exported as CSV')
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Export Automations
              </Button>
            </div>

            <div className="space-y-4">
              {automations.map(automation => (
                <Card key={automation.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          automation.type === 'workflow' ? 'bg-indigo-100 text-indigo-600' :
                          automation.type === 'sequence' ? 'bg-purple-100 text-purple-600' :
                          automation.type === 'trigger' ? 'bg-amber-100 text-amber-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {automation.type === 'workflow' ? <Workflow className="w-6 h-6" /> :
                           automation.type === 'sequence' ? <GitBranch className="w-6 h-6" /> :
                           automation.type === 'trigger' ? <Zap className="w-6 h-6" /> :
                           <Play className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{automation.name}</h4>
                          <p className="text-sm text-gray-500">Trigger: {automation.trigger}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold">{automation.actions}</p>
                          <p className="text-xs text-gray-500">Actions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{automation.executions}</p>
                          <p className="text-xs text-gray-500">Executions</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${automation.successRate >= 90 ? 'text-green-600' : automation.successRate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                            {automation.successRate}%
                          </p>
                          <p className="text-xs text-gray-500">Success</p>
                        </div>
                        <Badge className={automation.status === 'active' ? 'bg-green-100 text-green-700' : automation.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}>
                          {automation.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(automation, null, 2))
                          toast.success(`Copied ${automation.name} details to clipboard`)
                        }}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Salesforce-Level CRM Platform</h2>
                      <p className="text-indigo-100 mt-1">Configure contacts, pipelines, automation, and integrations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalContacts}</div>
                      <div className="text-sm text-indigo-100">Contacts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.activeDeals}</div>
                      <div className="text-sm text-indigo-100">Active Deals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{formatCurrency(stats.pipelineValue)}</div>
                      <div className="text-sm text-indigo-100">Pipeline</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.winRate.toFixed(0)}%</div>
                      <div className="text-sm text-indigo-100">Win Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit border-0 shadow-sm">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'pipeline', icon: Kanban, label: 'Pipeline' },
                      { id: 'automation', icon: Workflow, label: 'Automation' },
                      { id: 'integrations', icon: Link2, label: 'Integrations' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'advanced', icon: Zap, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          settingsTab === item.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cog className="w-5 h-5" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure CRM preferences and defaults</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Email Sync</div>
                          <div className="text-sm text-muted-foreground">Automatically sync email conversations</div>
                        </div>
                        <Switch checked={settings.emailSync} onCheckedChange={(checked) => setSettings({ ...settings, emailSync: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Calendar Sync</div>
                          <div className="text-sm text-muted-foreground">Sync meetings and events</div>
                        </div>
                        <Switch checked={settings.calendarSync} onCheckedChange={(checked) => setSettings({ ...settings, calendarSync: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Auto Lead Assignment</div>
                          <div className="text-sm text-muted-foreground">Automatically assign new leads to team members</div>
                        </div>
                        <Switch checked={settings.autoAssign} onCheckedChange={(checked) => setSettings({ ...settings, autoAssign: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Lead Scoring</div>
                          <div className="text-sm text-muted-foreground">Enable AI-powered lead scoring</div>
                        </div>
                        <Switch checked={settings.leadScoring} onCheckedChange={(checked) => setSettings({ ...settings, leadScoring: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Contact View</div>
                          <div className="text-sm text-muted-foreground">Choose default view for contacts</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>List View</option>
                          <option>Grid View</option>
                          <option>Kanban View</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Activity Logging</div>
                          <div className="text-sm text-muted-foreground">Auto-log emails and calls</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'pipeline' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Kanban className="w-5 h-5" />
                        Pipeline Settings
                      </CardTitle>
                      <CardDescription>Configure deal stages and pipeline behavior</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Pipeline</div>
                          <div className="text-sm text-muted-foreground">Select default pipeline for new deals</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>Sales Pipeline</option>
                          <option>Enterprise Pipeline</option>
                          <option>Partner Pipeline</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Auto-move Stale Deals</div>
                          <div className="text-sm text-muted-foreground">Move inactive deals after 30 days</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Probability Auto-update</div>
                          <div className="text-sm text-muted-foreground">Update probability based on stage</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Required Fields</div>
                          <div className="text-sm text-muted-foreground">Enforce required fields per stage</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Close Date Alerts</div>
                          <div className="text-sm text-muted-foreground">Alert before expected close date</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>3 days before</option>
                          <option>7 days before</option>
                          <option>14 days before</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'automation' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="w-5 h-5" />
                        Automation Settings
                      </CardTitle>
                      <CardDescription>Configure workflows and automation rules</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Lead Nurturing</div>
                          <div className="text-sm text-muted-foreground">Enable automated lead nurture sequences</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Follow-up Reminders</div>
                          <div className="text-sm text-muted-foreground">Auto-create follow-up tasks</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Deal Stage Triggers</div>
                          <div className="text-sm text-muted-foreground">Run automations on stage change</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Win/Loss Analysis</div>
                          <div className="text-sm text-muted-foreground">Auto-send surveys on deal close</div>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Territory Assignment</div>
                          <div className="text-sm text-muted-foreground">Auto-assign by geography</div>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Duplicate Detection</div>
                          <div className="text-sm text-muted-foreground">Auto-detect and merge duplicates</div>
                        </div>
                        <Switch checked={settings.duplicateDetection} onCheckedChange={(checked) => setSettings({ ...settings, duplicateDetection: checked })} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Integrations
                      </CardTitle>
                      <CardDescription>Connect with external services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Gmail / Google Workspace</div>
                            <div className="text-sm text-muted-foreground">Sync emails and calendar</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Linkedin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">LinkedIn Sales Navigator</div>
                            <div className="text-sm text-muted-foreground">Prospect enrichment</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Slack</div>
                            <div className="text-sm text-muted-foreground">Deal notifications</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">Stripe</div>
                            <div className="text-sm text-muted-foreground">Payment tracking</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">Zapier</div>
                            <div className="text-sm text-muted-foreground">Connect 5000+ apps</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>Manage alert and notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Activity Reminders</div>
                          <div className="text-sm text-muted-foreground">Get reminders for scheduled activities</div>
                        </div>
                        <Switch checked={settings.activityReminders} onCheckedChange={(checked) => setSettings({ ...settings, activityReminders: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Deal Stage Changes</div>
                          <div className="text-sm text-muted-foreground">Notify when deals move stages</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">New Lead Alerts</div>
                          <div className="text-sm text-muted-foreground">Instant notification for new leads</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Deal Rotation Alerts</div>
                          <div className="text-sm text-muted-foreground">Notify when deals need attention</div>
                        </div>
                        <Switch checked={settings.dealRotation} onCheckedChange={(checked) => setSettings({ ...settings, dealRotation: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Email Opens/Clicks</div>
                          <div className="text-sm text-muted-foreground">Track engagement notifications</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Weekly Digest</div>
                          <div className="text-sm text-muted-foreground">Summary of pipeline activity</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>Power user settings and data management</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Data Enrichment</div>
                          <div className="text-sm text-muted-foreground">Auto-fill missing contact information</div>
                        </div>
                        <Switch checked={settings.dataEnrichment} onCheckedChange={(checked) => setSettings({ ...settings, dataEnrichment: checked })} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">API Access</div>
                          <div className="text-sm text-muted-foreground">Enable REST API for integrations</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Audit Logging</div>
                          <div className="text-sm text-muted-foreground">Track all user actions</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Field-level Security</div>
                          <div className="text-sm text-muted-foreground">Restrict field access by role</div>
                        </div>
                        <Switch />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportCRM}>
                          <Download className="w-6 h-6" />
                          <span>Export All Data</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleImportContacts}>
                          <Plus className="w-6 h-6" />
                          <span>Import Data</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportCRM}>
                          <Archive className="w-6 h-6" />
                          <span>Backup CRM</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleSyncData}>
                          <RefreshCw className="w-6 h-6" />
                          <span>Sync All Data</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: UserPlus, label: 'Add Contact', desc: 'Create new', color: 'from-indigo-500 to-purple-600' },
                { icon: Briefcase, label: 'New Deal', desc: 'Start deal', color: 'from-green-500 to-emerald-600' },
                { icon: Building2, label: 'Add Company', desc: 'Create account', color: 'from-blue-500 to-cyan-600' },
                { icon: Mail, label: 'Send Email', desc: 'Compose', color: 'from-orange-500 to-red-600' },
                { icon: Calendar, label: 'Schedule', desc: 'Book meeting', color: 'from-purple-500 to-pink-600' },
                { icon: Workflow, label: 'Automation', desc: 'Create rule', color: 'from-teal-500 to-green-600' },
                { icon: BarChart3, label: 'Reports', desc: 'View stats', color: 'from-yellow-500 to-orange-600' },
                { icon: Download, label: 'Export', desc: 'Download', color: 'from-cyan-500 to-blue-600' }
              ].map((action, idx) => (
                <Card key={idx} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contact Detail Dialog */}
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedContact?.avatar}
                </div>
                <div>
                  <DialogTitle className="text-2xl">{selectedContact?.name}</DialogTitle>
                  <p className="text-gray-500">{selectedContact?.title} at {selectedContact?.company}</p>
                </div>
              </div>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="font-medium">{selectedContact.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4" />
                      Deal Value
                    </div>
                    <p className="font-medium text-emerald-600">{formatCurrency(selectedContact.dealValue)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Target className="w-4 h-4" />
                      Lead Score
                    </div>
                    <p className="font-medium">{selectedContact.leadScore}/100</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-3">Engagement Stats</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">{selectedContact.emailCount}</div>
                      <p className="text-xs text-gray-500">Emails</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{selectedContact.callCount}</div>
                      <p className="text-xs text-gray-500">Calls</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{selectedContact.meetingCount}</div>
                      <p className="text-xs text-gray-500">Meetings</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-600">{selectedContact.probability}%</div>
                      <p className="text-xs text-gray-500">Win Prob.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    onClick={() => {
                      setActivityForm({
                        type: 'email',
                        title: `Email to ${selectedContact.name}`,
                        description: '',
                        contactId: selectedContact.id,
                        contactName: selectedContact.name
                      })
                      setShowAddActivityDialog(true)
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActivityForm({
                        type: 'call',
                        title: `Call with ${selectedContact.name}`,
                        description: '',
                        contactId: selectedContact.id,
                        contactName: selectedContact.name
                      })
                      setShowAddActivityDialog(true)
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActivityForm({
                        type: 'meeting',
                        title: `Meeting with ${selectedContact.name}`,
                        description: '',
                        contactId: selectedContact.id,
                        contactName: selectedContact.name
                      })
                      setShowAddActivityDialog(true)
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEditContact(selectedContact)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteContact(selectedContact.id, selectedContact.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Deal Detail Dialog */}
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedDeal?.name}</DialogTitle>
              <DialogDescription>{selectedDeal?.company} • {selectedDeal?.contact}</DialogDescription>
            </DialogHeader>
            {selectedDeal && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Deal Value</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedDeal.value)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Probability</p>
                    <p className="text-2xl font-bold">{selectedDeal.probability}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Stage</p>
                    <Badge className={getStageColor(selectedDeal.stage)}>{selectedDeal.stage.replace('_', ' ')}</Badge>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500">Expected Close</p>
                    <p className="font-medium">{new Date(selectedDeal.expectedClose).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Products</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDeal.products.map((product, i) => (
                      <Badge key={i} variant="secondary">{product}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    onClick={() => handleEditDeal(selectedDeal)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Deal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const stages: DealStage[] = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
                      const currentIndex = stages.indexOf(selectedDeal.stage)
                      if (currentIndex < stages.length - 2) {
                        handleMoveDealStage(selectedDeal.id, stages[currentIndex + 1])
                      }
                    }}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Move Stage
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteDeal(selectedDeal.id, selectedDeal.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Contact Dialog */}
        <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Create a new contact in your CRM</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name *</Label>
                  <Input
                    id="contact-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-company">Company</Label>
                  <Input
                    id="contact-company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                    placeholder="Acme Inc"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-title">Job Title</Label>
                  <Input
                    id="contact-title"
                    value={contactForm.title}
                    onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                    placeholder="CEO"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-type">Type</Label>
                  <Select
                    value={contactForm.type}
                    onValueChange={(value: ContactType) => setContactForm({ ...contactForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-status">Status</Label>
                  <Select
                    value={contactForm.status}
                    onValueChange={(value: ContactStatus) => setContactForm({ ...contactForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-source">Source</Label>
                  <Select
                    value={contactForm.source}
                    onValueChange={(value) => setContactForm({ ...contactForm, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-deal-value">Deal Value ($)</Label>
                  <Input
                    id="contact-deal-value"
                    type="number"
                    value={contactForm.dealValue}
                    onChange={(e) => setContactForm({ ...contactForm, dealValue: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-lead-score">Lead Score (0-100)</Label>
                  <Input
                    id="contact-lead-score"
                    type="number"
                    min="0"
                    max="100"
                    value={contactForm.leadScore}
                    onChange={(e) => setContactForm({ ...contactForm, leadScore: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-notes">Notes</Label>
                <Textarea
                  id="contact-notes"
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddContactDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateContact}
                disabled={contactMutation.isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {contactMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={showEditContactDialog} onOpenChange={setShowEditContactDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>Update contact information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-name">Name *</Label>
                  <Input
                    id="edit-contact-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-email">Email</Label>
                  <Input
                    id="edit-contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-phone">Phone</Label>
                  <Input
                    id="edit-contact-phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-company">Company</Label>
                  <Input
                    id="edit-contact-company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-status">Status</Label>
                  <Select
                    value={contactForm.status}
                    onValueChange={(value: ContactStatus) => setContactForm({ ...contactForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-lead-score">Lead Score</Label>
                  <Input
                    id="edit-contact-lead-score"
                    type="number"
                    min="0"
                    max="100"
                    value={contactForm.leadScore}
                    onChange={(e) => setContactForm({ ...contactForm, leadScore: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditContactDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateContact}
                disabled={contactMutation.isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {contactMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Deal Dialog */}
        <Dialog open={showAddDealDialog} onOpenChange={setShowAddDealDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
              <DialogDescription>Add a new deal to your sales pipeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deal-name">Deal Name *</Label>
                <Input
                  id="deal-name"
                  value={dealForm.name}
                  onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                  placeholder="Enterprise SaaS Implementation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal-company">Company</Label>
                  <Input
                    id="deal-company"
                    value={dealForm.company}
                    onChange={(e) => setDealForm({ ...dealForm, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deal-contact">Contact</Label>
                  <Input
                    id="deal-contact"
                    value={dealForm.contact}
                    onChange={(e) => setDealForm({ ...dealForm, contact: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal-value">Deal Value ($)</Label>
                  <Input
                    id="deal-value"
                    type="number"
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deal-stage">Stage</Label>
                  <Select
                    value={dealForm.stage}
                    onValueChange={(value: DealStage) => setDealForm({ ...dealForm, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal-probability">Probability (%)</Label>
                  <Input
                    id="deal-probability"
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deal-close">Expected Close</Label>
                  <Input
                    id="deal-close"
                    type="date"
                    value={dealForm.expectedClose}
                    onChange={(e) => setDealForm({ ...dealForm, expectedClose: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deal-notes">Notes</Label>
                <Textarea
                  id="deal-notes"
                  value={dealForm.notes}
                  onChange={(e) => setDealForm({ ...dealForm, notes: e.target.value })}
                  placeholder="Additional notes about this deal..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDealDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateDeal}
                disabled={dealMutation.isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {dealMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Deal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Deal Dialog */}
        <Dialog open={showEditDealDialog} onOpenChange={setShowEditDealDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Deal</DialogTitle>
              <DialogDescription>Update deal information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-deal-name">Deal Name *</Label>
                <Input
                  id="edit-deal-name"
                  value={dealForm.name}
                  onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-deal-value">Deal Value ($)</Label>
                  <Input
                    id="edit-deal-value"
                    type="number"
                    value={dealForm.value}
                    onChange={(e) => setDealForm({ ...dealForm, value: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-deal-stage">Stage</Label>
                  <Select
                    value={dealForm.stage}
                    onValueChange={(value: DealStage) => setDealForm({ ...dealForm, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospecting">Prospecting</SelectItem>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed_won">Closed Won</SelectItem>
                      <SelectItem value="closed_lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-deal-probability">Probability (%)</Label>
                  <Input
                    id="edit-deal-probability"
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.probability}
                    onChange={(e) => setDealForm({ ...dealForm, probability: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-deal-close">Expected Close</Label>
                  <Input
                    id="edit-deal-close"
                    type="date"
                    value={dealForm.expectedClose}
                    onChange={(e) => setDealForm({ ...dealForm, expectedClose: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDealDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDeal}
                disabled={dealMutation.isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {dealMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivityDialog} onOpenChange={setShowAddActivityDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>Record a new activity in your CRM</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select
                  value={activityForm.type}
                  onValueChange={(value: ActivityType) => setActivityForm({ ...activityForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-title">Title *</Label>
                <Input
                  id="activity-title"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  placeholder="Follow-up call with prospect"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-description">Description</Label>
                <Textarea
                  id="activity-description"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  placeholder="Details about this activity..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-contact">Contact Name</Label>
                <Input
                  id="activity-contact"
                  value={activityForm.contactName}
                  onChange={(e) => setActivityForm({ ...activityForm, contactName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddActivityDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateActivity}
                disabled={activityMutation.isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {activityMutation.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Log Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI-Powered CRM Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AIInsightsPanel
            insights={mockAIInsights}
            onAskQuestion={(q) => console.log('CRM Question:', q)}
          />
          <PredictiveAnalytics predictions={mockCrmPredictions} />
        </div>

        {/* Activity Feed */}
        <div className="mt-6">
          <ActivityFeed
            activities={mockCrmActivitiesFeed}
            maxItems={5}
            showFilters={true}
          />
        </div>

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar actions={mockCrmQuickActions} />
      </div>
    </div>
  )
}
