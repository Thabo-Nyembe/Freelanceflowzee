// Clients V2 - Salesforce Level CRM Platform
// Comprehensive client relationship management with pipeline, deals, and activities
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Star,
  Settings,
  Filter,
  Building2,
  UserPlus,
  MessageSquare,
  Trash2,
  Edit,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  FileText,
  Briefcase,
  Target,
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Zap,
  Send,
  History,
  Handshake,
  Eye,
  LayoutGrid,
  List,
  ChevronRight,
  AlertCircle,
  PhoneCall,
  Video,
  CalendarClock,
  Award,
  UserCheck,
  Building
} from 'lucide-react'

// Types
type ClientStatus = 'lead' | 'prospect' | 'opportunity' | 'customer' | 'churned' | 'inactive'
type DealStage = 'qualification' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'deal'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  title: string
  department?: string
  isPrimary: boolean
  avatar?: string
  linkedin?: string
  lastContact?: string
}

interface Client {
  id: string
  name: string
  company: string
  industry: string
  website?: string
  status: ClientStatus
  contacts: Contact[]
  primaryContact: Contact
  revenue: number
  lifetime_value: number
  projects: number
  health_score: number
  nps?: number
  createdAt: string
  lastActivity: string
  tags: string[]
  address: {
    city: string
    state: string
    country: string
  }
  owner: string
  team: string[]
  source: string
  deals: Deal[]
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface Deal {
  id: string
  name: string
  value: number
  stage: DealStage
  probability: number
  expectedClose: string
  createdAt: string
  owner: string
  products: string[]
  notes?: string
}

interface Activity {
  id: string
  clientId: string
  type: ActivityType
  title: string
  description: string
  createdAt: string
  createdBy: string
  completed: boolean
  dueDate?: string
  priority?: Priority
  outcome?: string
}

interface Task {
  id: string
  clientId: string
  title: string
  description?: string
  dueDate: string
  priority: Priority
  assignee: string
  completed: boolean
  createdAt: string
}

// Mock data
const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'TechCorp International',
    company: 'TechCorp International',
    industry: 'Technology',
    website: 'https://techcorp.com',
    status: 'customer',
    contacts: [
      { id: 'ct1', name: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+1 555 0123', title: 'VP of Engineering', isPrimary: true, linkedin: 'linkedin.com/in/sarahchen' }
    ],
    primaryContact: { id: 'ct1', name: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+1 555 0123', title: 'VP of Engineering', isPrimary: true },
    revenue: 450000,
    lifetime_value: 1250000,
    projects: 12,
    health_score: 92,
    nps: 9,
    createdAt: '2023-01-15T10:00:00Z',
    lastActivity: '2024-12-22T14:30:00Z',
    tags: ['enterprise', 'technology', 'strategic'],
    address: { city: 'San Francisco', state: 'CA', country: 'USA' },
    owner: 'John Smith',
    team: ['John Smith', 'Emily Davis'],
    source: 'Inbound',
    deals: [
      { id: 'd1', name: 'Platform Expansion Q1', value: 150000, stage: 'negotiation', probability: 75, expectedClose: '2025-01-31', createdAt: '2024-11-01', owner: 'John Smith', products: ['Enterprise Suite', 'API Access'] }
    ],
    tier: 'platinum'
  },
  {
    id: 'c2',
    name: 'Global Innovations Ltd',
    company: 'Global Innovations Ltd',
    industry: 'Manufacturing',
    website: 'https://globalinnovations.com',
    status: 'customer',
    contacts: [
      { id: 'ct2', name: 'Mike Johnson', email: 'mike@globalinnovations.com', phone: '+1 555 0456', title: 'CTO', isPrimary: true }
    ],
    primaryContact: { id: 'ct2', name: 'Mike Johnson', email: 'mike@globalinnovations.com', phone: '+1 555 0456', title: 'CTO', isPrimary: true },
    revenue: 285000,
    lifetime_value: 780000,
    projects: 8,
    health_score: 78,
    nps: 7,
    createdAt: '2023-03-20T11:00:00Z',
    lastActivity: '2024-12-20T09:00:00Z',
    tags: ['manufacturing', 'mid-market'],
    address: { city: 'Chicago', state: 'IL', country: 'USA' },
    owner: 'Emily Davis',
    team: ['Emily Davis'],
    source: 'Referral',
    deals: [
      { id: 'd2', name: 'Annual Renewal 2025', value: 95000, stage: 'proposal', probability: 90, expectedClose: '2025-02-28', createdAt: '2024-12-01', owner: 'Emily Davis', products: ['Core Platform'] }
    ],
    tier: 'gold'
  },
  {
    id: 'c3',
    name: 'Startup Ventures',
    company: 'Startup Ventures',
    industry: 'Venture Capital',
    website: 'https://startupventures.io',
    status: 'opportunity',
    contacts: [
      { id: 'ct3', name: 'James Wilson', email: 'james@startupventures.io', phone: '+1 555 0789', title: 'Partner', isPrimary: true }
    ],
    primaryContact: { id: 'ct3', name: 'James Wilson', email: 'james@startupventures.io', phone: '+1 555 0789', title: 'Partner', isPrimary: true },
    revenue: 0,
    lifetime_value: 0,
    projects: 0,
    health_score: 65,
    createdAt: '2024-10-15T14:00:00Z',
    lastActivity: '2024-12-21T16:00:00Z',
    tags: ['finance', 'startup'],
    address: { city: 'New York', state: 'NY', country: 'USA' },
    owner: 'John Smith',
    team: ['John Smith'],
    source: 'Conference',
    deals: [
      { id: 'd3', name: 'Initial Contract', value: 75000, stage: 'discovery', probability: 40, expectedClose: '2025-03-15', createdAt: '2024-11-15', owner: 'John Smith', products: ['Starter Pack'] }
    ],
    tier: 'silver'
  },
  {
    id: 'c4',
    name: 'Healthcare Plus',
    company: 'Healthcare Plus',
    industry: 'Healthcare',
    status: 'lead',
    contacts: [
      { id: 'ct4', name: 'Dr. Emily Carter', email: 'emily@healthcareplus.org', title: 'Director of IT', isPrimary: true }
    ],
    primaryContact: { id: 'ct4', name: 'Dr. Emily Carter', email: 'emily@healthcareplus.org', title: 'Director of IT', isPrimary: true },
    revenue: 0,
    lifetime_value: 0,
    projects: 0,
    health_score: 0,
    createdAt: '2024-12-10T10:00:00Z',
    lastActivity: '2024-12-18T11:00:00Z',
    tags: ['healthcare', 'enterprise'],
    address: { city: 'Boston', state: 'MA', country: 'USA' },
    owner: 'Emily Davis',
    team: ['Emily Davis'],
    source: 'Webinar',
    deals: [],
    tier: 'bronze'
  },
  {
    id: 'c5',
    name: 'Retail Empire',
    company: 'Retail Empire',
    industry: 'Retail',
    website: 'https://retailempire.com',
    status: 'churned',
    contacts: [
      { id: 'ct5', name: 'Alex Thompson', email: 'alex@retailempire.com', title: 'Operations Manager', isPrimary: true }
    ],
    primaryContact: { id: 'ct5', name: 'Alex Thompson', email: 'alex@retailempire.com', title: 'Operations Manager', isPrimary: true },
    revenue: 125000,
    lifetime_value: 125000,
    projects: 3,
    health_score: 25,
    nps: 4,
    createdAt: '2022-06-01T09:00:00Z',
    lastActivity: '2024-09-15T10:00:00Z',
    tags: ['retail', 'at-risk'],
    address: { city: 'Los Angeles', state: 'CA', country: 'USA' },
    owner: 'John Smith',
    team: ['John Smith'],
    source: 'Partner',
    deals: [],
    tier: 'silver'
  },
]

const mockActivities: Activity[] = [
  { id: 'a1', clientId: 'c1', type: 'meeting', title: 'Q1 Planning Meeting', description: 'Discussed expansion plans', createdAt: '2024-12-22T14:30:00Z', createdBy: 'John Smith', completed: true, outcome: 'Positive - moving forward with proposal' },
  { id: 'a2', clientId: 'c1', type: 'email', title: 'Follow-up on proposal', description: 'Sent updated pricing', createdAt: '2024-12-21T10:00:00Z', createdBy: 'John Smith', completed: true },
  { id: 'a3', clientId: 'c2', type: 'call', title: 'Renewal discussion', description: 'Discussed annual renewal terms', createdAt: '2024-12-20T09:00:00Z', createdBy: 'Emily Davis', completed: true },
  { id: 'a4', clientId: 'c3', type: 'meeting', title: 'Discovery call', description: 'Initial needs assessment', createdAt: '2024-12-21T16:00:00Z', createdBy: 'John Smith', completed: true },
  { id: 'a5', clientId: 'c1', type: 'task', title: 'Send contract amendment', description: 'Update for new pricing', createdAt: '2024-12-23T09:00:00Z', createdBy: 'John Smith', completed: false, dueDate: '2024-12-26', priority: 'high' },
]

const mockTasks: Task[] = [
  { id: 't1', clientId: 'c1', title: 'Send updated proposal', description: 'Include new pricing tier', dueDate: '2024-12-26', priority: 'high', assignee: 'John Smith', completed: false, createdAt: '2024-12-22' },
  { id: 't2', clientId: 'c2', title: 'Schedule renewal call', description: 'Discuss 2025 contract', dueDate: '2024-12-28', priority: 'medium', assignee: 'Emily Davis', completed: false, createdAt: '2024-12-20' },
  { id: 't3', clientId: 'c3', title: 'Send case studies', description: 'VC-focused success stories', dueDate: '2024-12-27', priority: 'medium', assignee: 'John Smith', completed: false, createdAt: '2024-12-21' },
  { id: 't4', clientId: 'c4', title: 'Follow up on demo request', dueDate: '2024-12-24', priority: 'urgent', assignee: 'Emily Davis', completed: false, createdAt: '2024-12-18' },
]

// Helper functions
const getStatusColor = (status: ClientStatus): string => {
  const colors: Record<ClientStatus, string> = {
    lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    prospect: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    opportunity: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    customer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    churned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return colors[status]
}

const getStageColor = (stage: DealStage): string => {
  const colors: Record<DealStage, string> = {
    qualification: 'bg-blue-100 text-blue-700',
    discovery: 'bg-purple-100 text-purple-700',
    proposal: 'bg-amber-100 text-amber-700',
    negotiation: 'bg-orange-100 text-orange-700',
    closed_won: 'bg-green-100 text-green-700',
    closed_lost: 'bg-red-100 text-red-700'
  }
  return colors[stage]
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    low: 'text-gray-500',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  }
  return colors[priority]
}

const getTierColor = (tier: Client['tier']): string => {
  const colors = {
    bronze: 'bg-amber-700 text-white',
    silver: 'bg-gray-400 text-white',
    gold: 'bg-yellow-500 text-white',
    platinum: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
  }
  return colors[tier]
}

const getHealthColor = (score: number): string => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

interface ClientsClientProps {
  initialClients?: any[]
  initialStats?: any
}

export default function ClientsClient({ initialClients, initialStats }: ClientsClientProps) {
  const [activeTab, setActiveTab] = useState('clients')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Filter clients
  const filteredClients = useMemo(() => {
    let result = [...mockClients]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query) ||
        client.primaryContact.email.toLowerCase().includes(query) ||
        client.industry.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(client => client.status === statusFilter)
    }

    return result
  }, [searchQuery, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const customers = mockClients.filter(c => c.status === 'customer')
    return {
      totalClients: mockClients.length,
      totalCustomers: customers.length,
      totalRevenue: mockClients.reduce((sum, c) => sum + c.revenue, 0),
      totalLTV: mockClients.reduce((sum, c) => sum + c.lifetime_value, 0),
      avgHealthScore: customers.length > 0 ? customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length : 0,
      pipelineValue: mockClients.flatMap(c => c.deals).filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').reduce((sum, d) => sum + (d.value * d.probability / 100), 0),
      openDeals: mockClients.flatMap(c => c.deals).filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length,
      pendingTasks: mockTasks.filter(t => !t.completed).length
    }
  }, [])

  // Pipeline stages for kanban
  const pipelineStages: { stage: DealStage; label: string; color: string }[] = [
    { stage: 'qualification', label: 'Qualification', color: 'blue' },
    { stage: 'discovery', label: 'Discovery', color: 'purple' },
    { stage: 'proposal', label: 'Proposal', color: 'amber' },
    { stage: 'negotiation', label: 'Negotiation', color: 'orange' },
    { stage: 'closed_won', label: 'Won', color: 'green' },
  ]

  const allDeals = mockClients.flatMap(c => c.deals.map(d => ({ ...d, clientName: c.name, clientId: c.id })))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client CRM</h1>
              <p className="text-gray-600 dark:text-gray-400">Salesforce-level relationship management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-gray-500">Total Clients</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Customers</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">LTV</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalLTV)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Health Avg</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgHealthScore.toFixed(0)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-gray-500">Pipeline</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.pipelineValue)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Handshake className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Open Deals</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openDeals}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-500">Tasks Due</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Target className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="customer">Customer</option>
                    <option value="churned">Churned</option>
                  </select>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {client.company.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{client.company}</h3>
                          <Badge className={getTierColor(client.tier)}>{client.tier}</Badge>
                          <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{client.industry}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(client.revenue)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {client.projects} projects
                          </span>
                          {client.health_score > 0 && (
                            <span className={`flex items-center gap-1 ${getHealthColor(client.health_score)}`}>
                              <Activity className="w-3 h-3" />
                              {client.health_score}%
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{client.primaryContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">{client.primaryContact.name}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">{client.primaryContact.title}</span>
                        </div>

                        {client.deals.length > 0 && (
                          <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-amber-800 dark:text-amber-400">{client.deals[0].name}</span>
                              <span className="font-medium text-amber-900 dark:text-amber-300">{formatCurrency(client.deals[0].value)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStageColor(client.deals[0].stage)}>{client.deals[0].stage.replace('_', ' ')}</Badge>
                              <span className="text-xs text-gray-500">{client.deals[0].probability}% probability</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-gray-500">{formatRelativeTime(client.lastActivity)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pipelineStages.map(({ stage, label, color }) => {
                const stageDeals = allDeals.filter(d => d.stage === stage)
                const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
                return (
                  <div key={stage} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                        <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
                      </div>
                      <Badge variant="secondary">{stageDeals.length}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{formatCurrency(stageValue)}</div>

                    <div className="space-y-2">
                      {stageDeals.map(deal => (
                        <Card key={deal.id} className="bg-white dark:bg-gray-800 shadow-sm">
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-1">{deal.name}</h4>
                            <p className="text-xs text-gray-500 mb-2">{deal.clientName}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">{formatCurrency(deal.value)}</span>
                              <span className="text-xs text-gray-500">{deal.probability}%</span>
                            </div>
                            <div className="mt-2">
                              <Progress value={deal.probability} className="h-1" />
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(deal.expectedClose)}
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
          <TabsContent value="activities" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Activities</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {mockActivities.map(activity => {
                      const client = mockClients.find(c => c.id === activity.clientId)
                      return (
                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'call' ? 'bg-green-100 text-green-600' :
                            activity.type === 'email' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {activity.type === 'call' && <PhoneCall className="w-5 h-5" />}
                            {activity.type === 'email' && <Mail className="w-5 h-5" />}
                            {activity.type === 'meeting' && <Video className="w-5 h-5" />}
                            {activity.type === 'note' && <FileText className="w-5 h-5" />}
                            {activity.type === 'task' && <CheckCircle2 className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.title}</span>
                              {activity.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {client?.company}
                              </span>
                              <span>{activity.createdBy}</span>
                              <span>{formatRelativeTime(activity.createdAt)}</span>
                            </div>
                            {activity.outcome && (
                              <p className="text-sm text-green-600 mt-2 italic">{activity.outcome}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Tasks</h3>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTasks.filter(t => !t.completed).map(task => {
                const client = mockClients.find(c => c.id === task.clientId)
                const isOverdue = new Date(task.dueDate) < new Date()
                return (
                  <Card key={task.id} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                          task.priority === 'urgent' ? 'border-red-500' :
                          task.priority === 'high' ? 'border-orange-500' :
                          'border-gray-300'
                        }`}>
                          {task.completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {client?.company}
                            </span>
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                              <CalendarClock className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                              {isOverdue && ' (Overdue)'}
                            </span>
                            <Badge className={`${getPriorityColor(task.priority)} bg-opacity-10`}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue by Client Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['platinum', 'gold', 'silver', 'bronze'].map(tier => {
                      const tierClients = mockClients.filter(c => c.tier === tier as any)
                      const tierRevenue = tierClients.reduce((sum, c) => sum + c.revenue, 0)
                      return (
                        <div key={tier} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{tier}</span>
                            <span>{formatCurrency(tierRevenue)}</span>
                          </div>
                          <Progress value={(tierRevenue / stats.totalRevenue) * 100} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Client Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['customer', 'opportunity', 'prospect', 'lead', 'churned'] as const).map(status => {
                      const count = mockClients.filter(c => c.status === status).length
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Top Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(mockClients.map(c => c.industry))).map(industry => {
                      const count = mockClients.filter(c => c.industry === industry).length
                      const revenue = mockClients.filter(c => c.industry === industry).reduce((sum, c) => sum + c.revenue, 0)
                      return (
                        <div key={industry} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">{industry}</div>
                            <div className="text-xs text-gray-500">{count} clients</div>
                          </div>
                          <span className="font-semibold">{formatCurrency(revenue)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Client Detail Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedClient && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl">
                        {selectedClient.company.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl">{selectedClient.company}</DialogTitle>
                        <Badge className={getTierColor(selectedClient.tier)}>{selectedClient.tier}</Badge>
                        <Badge className={getStatusColor(selectedClient.status)}>{selectedClient.status}</Badge>
                      </div>
                      <p className="text-gray-600">{selectedClient.industry}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Revenue</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedClient.revenue)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Lifetime Value</div>
                    <div className="text-2xl font-bold">{formatCurrency(selectedClient.lifetime_value)}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Health Score</div>
                    <div className={`text-2xl font-bold ${getHealthColor(selectedClient.health_score)}`}>{selectedClient.health_score}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-sm text-gray-500">Projects</div>
                    <div className="text-2xl font-bold">{selectedClient.projects}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Primary Contact</h3>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback>{selectedClient.primaryContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedClient.primaryContact.name}</div>
                          <div className="text-sm text-gray-500">{selectedClient.primaryContact.title}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedClient.primaryContact.email}
                        </div>
                        {selectedClient.primaryContact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {selectedClient.primaryContact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Company Details</h3>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {selectedClient.address.city}, {selectedClient.address.state}, {selectedClient.address.country}
                      </div>
                      {selectedClient.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          {selectedClient.website}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        Source: {selectedClient.source}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClient.deals.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Active Deals</h3>
                    <div className="space-y-3">
                      {selectedClient.deals.map(deal => (
                        <div key={deal.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{deal.name}</span>
                            <Badge className={getStageColor(deal.stage)}>{deal.stage.replace('_', ' ')}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                            <span>{deal.probability}% probability</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Close: {formatDate(deal.expectedClose)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-6">
                  {selectedClient.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Meeting
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Client Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name *</label>
                <Input placeholder="Enter company name" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <select className="w-full mt-1 p-2 rounded-lg border">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Manufacturing</option>
                    <option>Retail</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full mt-1 p-2 rounded-lg border">
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="opportunity">Opportunity</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input placeholder="https://company.com" className="mt-1" />
              </div>
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Primary Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input placeholder="Contact name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input placeholder="Job title" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input type="email" placeholder="email@company.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input placeholder="+1 555 000 0000" className="mt-1" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
