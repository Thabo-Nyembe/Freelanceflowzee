'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  Users, Plus, Mail, Phone, DollarSign, TrendingUp, MessageSquare, UserPlus,
  Building2, Target, Search, Filter, MoreVertical, Star, Calendar, Clock,
  ArrowRight, ChevronRight, Settings, Download, RefreshCw, Tag, Briefcase,
  Activity, BarChart3, PieChart, Zap, Send, CheckCircle2, XCircle, Pause,
  FileText, Link2, Globe, MapPin, Linkedin, Twitter, Award, History,
  ArrowUpRight, ArrowDownRight, Eye, Trash2, Edit, Copy, Bell, Play,
  GitBranch, Layers, Bot, Workflow, Sparkles, Cog, ShieldCheck, UserCog,
  TrendingDown, Percent, Timer, AlertCircle, CheckCircle, LayoutGrid,
  List, Kanban, FolderOpen, Archive, Heart, ThumbsUp, Share2, ExternalLink
} from 'lucide-react'

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

// Mock Data
const mockContacts: Contact[] = [
  { id: '1', name: 'John Smith', email: 'john@acme.com', phone: '+1 (555) 123-4567', company: 'Acme Corp', title: 'VP of Sales', type: 'customer', status: 'vip', dealValue: 125000, dealStage: 'negotiation', leadScore: 92, probability: 75, owner: 'Sarah Johnson', source: 'Referral', lastContact: '2024-01-15T10:30:00Z', nextFollowUp: '2024-01-18T14:00:00Z', tags: ['enterprise', 'priority'], emailCount: 24, callCount: 8, meetingCount: 5, createdAt: '2023-06-15T09:00:00Z', avatar: 'JS' },
  { id: '2', name: 'Emily Davis', email: 'emily@techstart.io', phone: '+1 (555) 234-5678', company: 'TechStart', title: 'CTO', type: 'prospect', status: 'qualified', dealValue: 45000, dealStage: 'proposal', leadScore: 78, probability: 60, owner: 'Mike Chen', source: 'LinkedIn', lastContact: '2024-01-14T15:00:00Z', nextFollowUp: '2024-01-17T10:00:00Z', tags: ['startup', 'tech'], emailCount: 12, callCount: 4, meetingCount: 2, createdAt: '2023-10-20T11:00:00Z', avatar: 'ED' },
  { id: '3', name: 'Michael Brown', email: 'michael@global.co', phone: '+1 (555) 345-6789', company: 'Global Services', title: 'Director', type: 'lead', status: 'new', dealValue: 85000, dealStage: 'prospecting', leadScore: 65, probability: 25, owner: 'Sarah Johnson', source: 'Website', lastContact: '2024-01-13T09:00:00Z', nextFollowUp: null, tags: ['consulting'], emailCount: 3, callCount: 1, meetingCount: 0, createdAt: '2024-01-10T08:00:00Z', avatar: 'MB' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@enterprise.com', phone: '+1 (555) 456-7890', company: 'Enterprise Inc', title: 'CEO', type: 'customer', status: 'active', dealValue: 250000, dealStage: 'closed_won', leadScore: 98, probability: 100, owner: 'James Lee', source: 'Event', lastContact: '2024-01-12T11:00:00Z', nextFollowUp: '2024-02-01T09:00:00Z', tags: ['enterprise', 'renewal'], emailCount: 45, callCount: 15, meetingCount: 8, createdAt: '2022-03-01T10:00:00Z', avatar: 'SW' },
  { id: '5', name: 'David Lee', email: 'david@innovate.co', phone: '+1 (555) 567-8901', company: 'Innovate Labs', title: 'Product Manager', type: 'prospect', status: 'active', dealValue: 35000, dealStage: 'qualification', leadScore: 72, probability: 40, owner: 'Mike Chen', source: 'Cold Outreach', lastContact: '2024-01-15T14:00:00Z', nextFollowUp: '2024-01-19T11:00:00Z', tags: ['product'], emailCount: 8, callCount: 3, meetingCount: 1, createdAt: '2023-12-01T09:00:00Z', avatar: 'DL' },
  { id: '6', name: 'Lisa Anderson', email: 'lisa@growth.io', phone: '+1 (555) 678-9012', company: 'Growth Partners', title: 'CMO', type: 'lead', status: 'qualified', dealValue: 65000, dealStage: 'proposal', leadScore: 81, probability: 55, owner: 'Sarah Johnson', source: 'Webinar', lastContact: '2024-01-14T16:00:00Z', nextFollowUp: '2024-01-20T15:00:00Z', tags: ['marketing'], emailCount: 15, callCount: 5, meetingCount: 3, createdAt: '2023-11-15T10:00:00Z', avatar: 'LA' }
]

const mockCompanies: Company[] = [
  { id: '1', name: 'Acme Corporation', industry: 'Technology', size: 'Enterprise', revenue: 50000000, employees: 500, contacts: 12, deals: 3, dealValue: 425000, website: 'acme.com', location: 'San Francisco, CA', status: 'active' },
  { id: '2', name: 'TechStart Inc', industry: 'Software', size: 'Startup', revenue: 2000000, employees: 25, contacts: 4, deals: 1, dealValue: 45000, website: 'techstart.io', location: 'Austin, TX', status: 'prospect' },
  { id: '3', name: 'Global Services Ltd', industry: 'Consulting', size: 'Mid-Market', revenue: 15000000, employees: 150, contacts: 8, deals: 2, dealValue: 210000, website: 'globalservices.co', location: 'New York, NY', status: 'active' },
  { id: '4', name: 'Enterprise Inc', industry: 'Finance', size: 'Enterprise', revenue: 100000000, employees: 1200, contacts: 18, deals: 5, dealValue: 850000, website: 'enterprise.com', location: 'Chicago, IL', status: 'active' },
  { id: '5', name: 'Innovate Labs', industry: 'Technology', size: 'Startup', revenue: 5000000, employees: 45, contacts: 6, deals: 2, dealValue: 75000, website: 'innovatelabs.co', location: 'Boston, MA', status: 'prospect' }
]

const mockDeals: Deal[] = [
  { id: '1', name: 'Enterprise License Deal', company: 'Acme Corporation', contact: 'John Smith', value: 125000, stage: 'negotiation', probability: 75, expectedClose: '2024-02-15', owner: 'Sarah Johnson', createdAt: '2023-11-01', lastActivity: '2024-01-15', products: ['Enterprise Plan', 'Support Package'] },
  { id: '2', name: 'Startup Growth Package', company: 'TechStart Inc', contact: 'Emily Davis', value: 45000, stage: 'proposal', probability: 60, expectedClose: '2024-01-30', owner: 'Mike Chen', createdAt: '2023-12-15', lastActivity: '2024-01-14', products: ['Growth Plan'] },
  { id: '3', name: 'Consulting Partnership', company: 'Global Services Ltd', contact: 'Michael Brown', value: 85000, stage: 'prospecting', probability: 25, expectedClose: '2024-03-31', owner: 'Sarah Johnson', createdAt: '2024-01-10', lastActivity: '2024-01-13', products: ['Professional Plan', 'Training'] },
  { id: '4', name: 'Annual Renewal', company: 'Enterprise Inc', contact: 'Sarah Wilson', value: 250000, stage: 'closed_won', probability: 100, expectedClose: '2024-01-01', owner: 'James Lee', createdAt: '2023-10-01', lastActivity: '2024-01-12', products: ['Enterprise Plan', 'Premium Support', 'Custom Integration'] },
  { id: '5', name: 'New Product Launch', company: 'Innovate Labs', contact: 'David Lee', value: 35000, stage: 'qualification', probability: 40, expectedClose: '2024-02-28', owner: 'Mike Chen', createdAt: '2023-12-01', lastActivity: '2024-01-15', products: ['Professional Plan'] },
  { id: '6', name: 'Marketing Suite', company: 'Growth Partners', contact: 'Lisa Anderson', value: 65000, stage: 'proposal', probability: 55, expectedClose: '2024-02-15', owner: 'Sarah Johnson', createdAt: '2023-11-15', lastActivity: '2024-01-14', products: ['Marketing Add-on', 'Analytics'] }
]

const mockActivities: CrmActivity[] = [
  { id: '1', type: 'email', title: 'Sent proposal', description: 'Q1 2024 project proposal with pricing details', contactId: '1', contactName: 'John Smith', timestamp: '2024-01-15T10:30:00Z', completed: true, outcome: 'positive', duration: null },
  { id: '2', type: 'call', title: 'Discovery call', description: 'Initial needs assessment and product demo', contactId: '2', contactName: 'Emily Davis', timestamp: '2024-01-14T15:00:00Z', completed: true, outcome: 'positive', duration: 45 },
  { id: '3', type: 'meeting', title: 'Quarterly review', description: 'Q4 performance review and Q1 planning', contactId: '4', contactName: 'Sarah Wilson', timestamp: '2024-01-12T11:00:00Z', completed: true, outcome: 'positive', duration: 60 },
  { id: '4', type: 'task', title: 'Send follow-up', description: 'Follow up on proposal sent last week', contactId: '6', contactName: 'Lisa Anderson', timestamp: '2024-01-17T10:00:00Z', completed: false, outcome: null, duration: null },
  { id: '5', type: 'email', title: 'Introduction email', description: 'Initial outreach with company overview', contactId: '3', contactName: 'Michael Brown', timestamp: '2024-01-13T09:00:00Z', completed: true, outcome: 'neutral', duration: null },
  { id: '6', type: 'call', title: 'Qualification call', description: 'Budget and timeline discussion', contactId: '5', contactName: 'David Lee', timestamp: '2024-01-15T14:00:00Z', completed: true, outcome: 'positive', duration: 30 }
]

const mockReports: Report[] = [
  { id: '1', name: 'Pipeline Overview', type: 'pipeline', lastRun: '2024-01-15T08:00:00Z', frequency: 'daily', recipients: 5, status: 'active' },
  { id: '2', name: 'Weekly Activity Summary', type: 'activity', lastRun: '2024-01-15T00:00:00Z', frequency: 'weekly', recipients: 12, status: 'active' },
  { id: '3', name: 'Revenue Forecast', type: 'forecast', lastRun: '2024-01-01T00:00:00Z', frequency: 'monthly', recipients: 3, status: 'active' },
  { id: '4', name: 'Conversion Analytics', type: 'conversion', lastRun: '2024-01-15T06:00:00Z', frequency: 'daily', recipients: 8, status: 'active' },
  { id: '5', name: 'Revenue by Source', type: 'revenue', lastRun: '2024-01-01T00:00:00Z', frequency: 'monthly', recipients: 4, status: 'paused' }
]

const mockAutomations: Automation[] = [
  { id: '1', name: 'Lead Nurture Sequence', type: 'sequence', trigger: 'New lead created', actions: 8, executions: 245, successRate: 78, status: 'active', lastRun: '2024-01-15T12:00:00Z' },
  { id: '2', name: 'Deal Stage Notification', type: 'trigger', trigger: 'Deal stage changed', actions: 3, executions: 89, successRate: 100, status: 'active', lastRun: '2024-01-15T10:30:00Z' },
  { id: '3', name: 'Follow-up Reminder', type: 'workflow', trigger: 'No activity for 7 days', actions: 2, executions: 156, successRate: 92, status: 'active', lastRun: '2024-01-14T09:00:00Z' },
  { id: '4', name: 'Welcome Email', type: 'action', trigger: 'Contact added', actions: 1, executions: 432, successRate: 99, status: 'active', lastRun: '2024-01-15T11:45:00Z' },
  { id: '5', name: 'Win/Loss Analysis', type: 'workflow', trigger: 'Deal closed', actions: 5, executions: 67, successRate: 85, status: 'paused', lastRun: '2024-01-10T16:00:00Z' }
]

const PIPELINE_STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecting', color: 'sky' },
  { id: 'qualification', label: 'Qualification', color: 'indigo' },
  { id: 'proposal', label: 'Proposal', color: 'amber' },
  { id: 'negotiation', label: 'Negotiation', color: 'orange' },
  { id: 'closed_won', label: 'Closed Won', color: 'emerald' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'red' }
]

export default function CrmClient() {
  const [contacts] = useState<Contact[]>(mockContacts)
  const [companies] = useState<Company[]>(mockCompanies)
  const [deals] = useState<Deal[]>(mockDeals)
  const [activities] = useState<CrmActivity[]>(mockActivities)
  const [reports] = useState<Report[]>(mockReports)
  const [automations] = useState<Automation[]>(mockAutomations)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-72"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

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
                                <Button variant="ghost" size="icon" className="h-6 w-6">
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

                        <Button variant="outline" className="w-full border-dashed">
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
                      {filteredContacts.map(contact => (
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
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
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
            <div className="space-y-4">
              {deals.map(deal => (
                <Card key={deal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDeal(deal)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                          {deal.company.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{deal.name}</h3>
                          <p className="text-sm text-gray-500">{deal.company} • {deal.contact}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Upcoming Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                          <Button variant="ghost" size="icon">
                            <CheckCircle2 className="w-5 h-5 text-gray-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Completed Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-blue-50 text-blue-600 border-blue-200">
                      <Mail className="w-4 h-4 mr-2" />
                      Log Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-green-50 text-green-600 border-green-200">
                      <Phone className="w-4 h-4 mr-2" />
                      Log Call
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-purple-50 text-purple-600 border-purple-200">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-amber-50 text-amber-600 border-amber-200">
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Reports & Analytics</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Report
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Workflows & Automation</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
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
                        <Button variant="ghost" size="icon">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cog className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Configure CRM preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Email Sync</Label>
                      <p className="text-xs text-gray-500">Automatically sync email conversations</p>
                    </div>
                    <Switch checked={settings.emailSync} onCheckedChange={(checked) => setSettings({ ...settings, emailSync: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Calendar Sync</Label>
                      <p className="text-xs text-gray-500">Sync meetings and events</p>
                    </div>
                    <Switch checked={settings.calendarSync} onCheckedChange={(checked) => setSettings({ ...settings, calendarSync: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto Lead Assignment</Label>
                      <p className="text-xs text-gray-500">Automatically assign new leads</p>
                    </div>
                    <Switch checked={settings.autoAssign} onCheckedChange={(checked) => setSettings({ ...settings, autoAssign: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Lead Scoring</Label>
                      <p className="text-xs text-gray-500">Enable AI-powered lead scoring</p>
                    </div>
                    <Switch checked={settings.leadScoring} onCheckedChange={(checked) => setSettings({ ...settings, leadScoring: checked })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Manage notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Activity Reminders</Label>
                      <p className="text-xs text-gray-500">Get reminders for scheduled activities</p>
                    </div>
                    <Switch checked={settings.activityReminders} onCheckedChange={(checked) => setSettings({ ...settings, activityReminders: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Deal Rotation Alerts</Label>
                      <p className="text-xs text-gray-500">Notify when deals need attention</p>
                    </div>
                    <Switch checked={settings.dealRotation} onCheckedChange={(checked) => setSettings({ ...settings, dealRotation: checked })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Data Enrichment
                  </CardTitle>
                  <CardDescription>Enhance contact data automatically</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Duplicate Detection</Label>
                      <p className="text-xs text-gray-500">Automatically detect duplicate records</p>
                    </div>
                    <Switch checked={settings.duplicateDetection} onCheckedChange={(checked) => setSettings({ ...settings, duplicateDetection: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Data Enrichment</Label>
                      <p className="text-xs text-gray-500">Auto-fill missing contact information</p>
                    </div>
                    <Switch checked={settings.dataEnrichment} onCheckedChange={(checked) => setSettings({ ...settings, dataEnrichment: checked })} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Import, export, and manage data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Download className="w-6 h-6" />
                      <span>Export Contacts</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Plus className="w-6 h-6" />
                      <span>Import Contacts</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <Archive className="w-6 h-6" />
                      <span>Backup Data</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                      <RefreshCw className="w-6 h-6" />
                      <span>Sync Now</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
                  <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
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
                  <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Deal
                  </Button>
                  <Button variant="outline">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Move Stage
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
