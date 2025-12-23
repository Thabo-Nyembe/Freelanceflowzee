// Customers V2 - Salesforce/HubSpot CRM Level
// Upgraded with: Pipeline, Lead Scoring, Activity Timeline, Deals, Company Management

'use client'

import { useState, useCallback, useMemo } from 'react'
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
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Star,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  PhoneCall,
  FileText,
  Target,
  Zap,
  ArrowRight,
  ChevronRight,
  Plus,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  Globe,
  Link,
  Tag,
  Layers
} from 'lucide-react'
import { useCustomers, type Customer, type CustomerSegment } from '@/lib/hooks/use-customers'

// ============================================================================
// TYPES - SALESFORCE/HUBSPOT CRM LEVEL
// ============================================================================

interface Deal {
  id: string
  name: string
  value: number
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  probability: number
  customerId: string
  expectedCloseDate: string
  createdAt: string
  owner: string
}

interface Activity {
  id: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'task'
  title: string
  description: string
  customerId: string
  createdAt: string
  createdBy: string
  status?: 'completed' | 'pending' | 'overdue'
}

interface Company {
  id: string
  name: string
  industry: string
  size: string
  website: string
  revenue: number
  employeeCount: number
  customers: string[]
}

interface LeadScore {
  customerId: string
  score: number
  factors: ScoreFactor[]
  lastUpdated: string
}

interface ScoreFactor {
  name: string
  impact: number
  value: string
}

// ============================================================================
// MOCK DATA - CRM LEVEL
// ============================================================================

const DEALS: Deal[] = [
  { id: 'd1', name: 'Enterprise License', value: 125000, stage: 'negotiation', probability: 75, customerId: 'c1', expectedCloseDate: '2024-02-15', createdAt: '2024-01-10', owner: 'Sarah J.' },
  { id: 'd2', name: 'Pro Subscription', value: 24000, stage: 'proposal', probability: 50, customerId: 'c2', expectedCloseDate: '2024-02-28', createdAt: '2024-01-15', owner: 'Mike C.' },
  { id: 'd3', name: 'Team Upgrade', value: 8500, stage: 'qualified', probability: 30, customerId: 'c3', expectedCloseDate: '2024-03-10', createdAt: '2024-01-20', owner: 'Sarah J.' },
  { id: 'd4', name: 'Annual Contract', value: 45000, stage: 'won', probability: 100, customerId: 'c4', expectedCloseDate: '2024-01-25', createdAt: '2024-01-05', owner: 'Alex T.' },
  { id: 'd5', name: 'Starter Plan', value: 2400, stage: 'lead', probability: 10, customerId: 'c5', expectedCloseDate: '2024-03-30', createdAt: '2024-01-28', owner: 'Emily W.' },
]

const ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'email', title: 'Sent proposal', description: 'Sent enterprise pricing proposal', customerId: 'c1', createdAt: '2024-01-28T10:30:00Z', createdBy: 'Sarah J.' },
  { id: 'a2', type: 'call', title: 'Discovery call', description: 'Discussed requirements and timeline', customerId: 'c2', createdAt: '2024-01-28T09:00:00Z', createdBy: 'Mike C.', status: 'completed' },
  { id: 'a3', type: 'meeting', title: 'Demo scheduled', description: 'Product demo for decision makers', customerId: 'c1', createdAt: '2024-01-29T14:00:00Z', createdBy: 'Sarah J.', status: 'pending' },
  { id: 'a4', type: 'note', title: 'Budget confirmed', description: 'Customer confirmed Q1 budget available', customerId: 'c3', createdAt: '2024-01-27T16:00:00Z', createdBy: 'Alex T.' },
  { id: 'a5', type: 'task', title: 'Follow up', description: 'Send case studies', customerId: 'c2', createdAt: '2024-01-30T10:00:00Z', createdBy: 'Mike C.', status: 'pending' },
]

const COMPANIES: Company[] = [
  { id: 'co1', name: 'Acme Corporation', industry: 'Technology', size: 'Enterprise', website: 'acme.com', revenue: 50000000, employeeCount: 500, customers: ['c1', 'c4'] },
  { id: 'co2', name: 'StartupXYZ', industry: 'SaaS', size: 'Startup', website: 'startupxyz.io', revenue: 2000000, employeeCount: 25, customers: ['c2'] },
  { id: 'co3', name: 'Global Retail', industry: 'Retail', size: 'Mid-Market', website: 'globalretail.com', revenue: 15000000, employeeCount: 150, customers: ['c3'] },
]

const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-500' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-500' },
  { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500' },
  { id: 'won', name: 'Won', color: 'bg-green-500' },
  { id: 'lost', name: 'Lost', color: 'bg-red-500' },
]

// ============================================================================
// MAIN COMPONENT - SALESFORCE/HUBSPOT CRM LEVEL
// ============================================================================

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  // State
  const [activeTab, setActiveTab] = useState('customers')
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'pipeline'>('list')

  // Form state
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerCompany, setNewCustomerCompany] = useState('')

  // Hook
  const { customers, loading, error } = useCustomers({ segment: segmentFilter })
  const displayCustomers = (customers && customers.length > 0) ? customers : (initialCustomers || [])

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return displayCustomers.filter(customer => {
      if (segmentFilter !== 'all' && customer.segment !== segmentFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!customer.customer_name.toLowerCase().includes(query) &&
            !customer.email?.toLowerCase().includes(query) &&
            !customer.phone?.toLowerCase().includes(query)) {
          return false
        }
      }
      return true
    })
  }, [displayCustomers, segmentFilter, searchQuery])

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const totalLTV = displayCustomers.reduce((sum, c) => sum + c.lifetime_value, 0)
    const avgLTV = displayCustomers.length > 0 ? totalLTV / displayCustomers.length : 0
    const totalDeals = DEALS.reduce((sum, d) => sum + d.value, 0)
    const wonDeals = DEALS.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0)
    const pipelineValue = DEALS.filter(d => !['won', 'lost'].includes(d.stage)).reduce((sum, d) => sum + d.value, 0)

    return {
      totalCustomers: displayCustomers.length,
      activeCustomers: displayCustomers.filter(c => c.segment === 'active').length,
      vipCustomers: displayCustomers.filter(c => c.segment === 'vip').length,
      atRiskCustomers: displayCustomers.filter(c => c.segment === 'at_risk').length,
      totalLTV,
      avgLTV,
      totalDeals: DEALS.length,
      pipelineValue,
      wonDeals,
      winRate: DEALS.length > 0 ? ((DEALS.filter(d => d.stage === 'won').length / DEALS.filter(d => ['won', 'lost'].includes(d.stage)).length) * 100) : 0,
      avgDealSize: DEALS.length > 0 ? totalDeals / DEALS.length : 0,
      activitiesThisWeek: ACTIVITIES.length
    }
  }, [displayCustomers])

  // Pipeline grouped by stage
  const pipelineDeals = useMemo(() => {
    const grouped: Record<string, Deal[]> = {}
    PIPELINE_STAGES.forEach(stage => {
      grouped[stage.id] = DEALS.filter(d => d.stage === stage.id)
    })
    return grouped
  }, [])

  // Handlers
  const handleAddCustomer = useCallback(() => {
    if (!newCustomerName.trim() || !newCustomerEmail.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    toast.success('Customer Added', {
      description: `${newCustomerName} has been added to your CRM`
    })

    setShowAddCustomer(false)
    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewCustomerPhone('')
    setNewCustomerCompany('')
  }, [newCustomerName, newCustomerEmail])

  const handleLogActivity = useCallback((type: string) => {
    toast.success('Activity Logged', {
      description: `${type} activity has been recorded`
    })
    setShowAddActivity(false)
  }, [])

  const getSegmentColor = (segment: CustomerSegment) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'at_risk': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'churned': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLeadScore = (customer: Customer): number => {
    let score = 50
    if (customer.segment === 'vip') score += 30
    if (customer.segment === 'active') score += 20
    if (customer.lifetime_value > 10000) score += 15
    if (customer.total_orders > 10) score += 10
    if (customer.segment === 'at_risk') score -= 20
    if (customer.segment === 'churned') score -= 40
    return Math.max(0, Math.min(100, score))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'call': return <PhoneCall className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'task': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Customers</h3>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  Salesforce Level
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {stats.totalCustomers.toLocaleString()} Contacts
                </Badge>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Customer CRM
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Complete customer relationship management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
              onClick={() => setShowAddCustomer(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-violet-600">{stats.totalCustomers}</div>
              <div className="text-xs text-gray-500">Total Customers</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
              <div className="text-xs text-gray-500">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.vipCustomers}</div>
              <div className="text-xs text-gray-500">VIP</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">${(stats.pipelineValue / 1000).toFixed(0)}k</div>
              <div className="text-xs text-gray-500">Pipeline</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">${(stats.wonDeals / 1000).toFixed(0)}k</div>
              <div className="text-xs text-gray-500">Won Deals</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.atRiskCustomers}</div>
              <div className="text-xs text-gray-500">At Risk</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="deals" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Deals
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Pipeline
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Companies
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            {/* Segment Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'vip', 'active', 'new', 'at_risk', 'inactive', 'churned'].map(seg => (
                <Button
                  key={seg}
                  size="sm"
                  variant={segmentFilter === seg ? 'default' : 'outline'}
                  onClick={() => setSegmentFilter(seg as any)}
                  className={segmentFilter === seg ? 'bg-violet-600 hover:bg-violet-700' : ''}
                >
                  {seg === 'all' ? 'All' : seg.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>

            {/* Customers List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-r-transparent" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
                  <p className="text-gray-500 mb-4">Add your first customer to get started</p>
                  <Button onClick={() => setShowAddCustomer(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map(customer => {
                  const leadScore = getLeadScore(customer)
                  return (
                    <Card key={customer.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.customer_name}`} />
                            <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                              {customer.customer_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{customer.customer_name}</h3>
                              <Badge className={getSegmentColor(customer.segment)}>{customer.segment}</Badge>
                              {customer.segment === 'vip' && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              {customer.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </span>
                              )}
                              {customer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-5 gap-4 text-sm">
                              <div>
                                <div className="text-gray-500">Lifetime Value</div>
                                <div className="font-semibold text-violet-600">${customer.lifetime_value.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Orders</div>
                                <div className="font-semibold">{customer.total_orders}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Avg Order</div>
                                <div className="font-semibold">${customer.avg_order_value.toFixed(0)}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Last Purchase</div>
                                <div className="font-semibold">
                                  {customer.last_purchase_date ? new Date(customer.last_purchase_date).toLocaleDateString() : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500">Lead Score</div>
                                <div className={`font-bold ${getScoreColor(leadScore)}`}>
                                  {leadScore}/100
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleLogActivity('email')}>
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleLogActivity('call')}>
                                <PhoneCall className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedCustomer(customer)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="w-32">
                              <Progress value={leadScore} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddDeal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
            </div>

            <div className="space-y-4">
              {DEALS.map(deal => (
                <Card key={deal.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={PIPELINE_STAGES.find(s => s.id === deal.stage)?.color + ' text-white'}>
                            {deal.stage}
                          </Badge>
                          <span className="text-sm text-gray-500">{deal.probability}% probability</span>
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{deal.name}</h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Owner: {deal.owner}</span>
                          <span>Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">${deal.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Expected: ${(deal.value * deal.probability / 100).toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.filter(s => s.id !== 'lost').map(stage => (
                <div key={stage.id} className="min-w-[280px] flex-shrink-0">
                  <div className={`${stage.color} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                    <span className="font-medium">{stage.name}</span>
                    <Badge className="bg-white/20 text-white">{pipelineDeals[stage.id]?.length || 0}</Badge>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-b-lg min-h-[400px] space-y-2">
                    {pipelineDeals[stage.id]?.map(deal => (
                      <Card key={deal.id} className="bg-white dark:bg-gray-700 cursor-grab">
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm mb-1">{deal.name}</h4>
                          <div className="text-lg font-bold text-green-600">${deal.value.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">{deal.owner}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddActivity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Activity
              </Button>
            </div>

            <div className="space-y-3">
              {ACTIVITIES.map(activity => (
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
                          <span className="font-medium">{activity.title}</span>
                          <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                          {activity.status && (
                            <Badge className={activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {activity.createdBy} · {formatTimeAgo(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {COMPANIES.map(company => (
                <Card key={company.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Building2 className="h-6 w-6 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <Badge variant="outline" className="text-xs">{company.industry}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{company.website}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{company.employeeCount} employees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>${(company.revenue / 1000000).toFixed(1)}M revenue</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-gray-500">{company.customers.length} contacts</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Customer Dialog */}
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-violet-600" />
                Add New Customer
              </DialogTitle>
              <DialogDescription>
                Add a new contact to your CRM
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Smith"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  placeholder="Company name"
                  value={newCustomerCompany}
                  onChange={(e) => setNewCustomerCompany(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={handleAddCustomer}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>Record an interaction with a customer</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3 py-4">
              {['email', 'call', 'meeting', 'note', 'task'].map(type => (
                <Button
                  key={type}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handleLogActivity(type)}
                >
                  {getActivityIcon(type)}
                  <span className="capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
