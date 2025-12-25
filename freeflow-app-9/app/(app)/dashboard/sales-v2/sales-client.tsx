'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Briefcase,
  UserPlus,
  MessageSquare,
  FileText,
  Activity,
  PieChart,
  LineChart,
  Globe,
  MapPin,
  Star,
  Zap,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Account {
  id: string
  name: string
  industry: string
  type: 'customer' | 'prospect' | 'partner' | 'competitor'
  website?: string
  phone?: string
  address?: string
  annualRevenue: number
  employees: number
  owner: string
  createdAt: string
  lastActivity: string
  deals: number
  contacts: number
  status: 'active' | 'inactive' | 'churned'
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title: string
  department: string
  accountId: string
  accountName: string
  avatar?: string
  leadSource: string
  status: 'lead' | 'qualified' | 'customer' | 'churned'
  lastContact: string
  createdAt: string
}

interface Opportunity {
  id: string
  name: string
  accountId: string
  accountName: string
  amount: number
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  closeDate: string
  owner: string
  ownerAvatar?: string
  type: 'new_business' | 'existing_business' | 'renewal' | 'upsell'
  leadSource: string
  nextStep?: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface SalesActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note'
  subject: string
  description?: string
  relatedTo: string
  relatedType: 'account' | 'contact' | 'opportunity'
  owner: string
  dueDate?: string
  completedDate?: string
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAccounts: Account[] = [
  { id: '1', name: 'Acme Corporation', industry: 'Technology', type: 'customer', website: 'acme.com', phone: '+1-555-0100', address: 'San Francisco, CA', annualRevenue: 50000000, employees: 500, owner: 'Sarah Chen', createdAt: '2023-01-15', lastActivity: '2024-12-24', deals: 5, contacts: 12, status: 'active' },
  { id: '2', name: 'TechStart Inc', industry: 'Software', type: 'prospect', website: 'techstart.io', phone: '+1-555-0200', address: 'New York, NY', annualRevenue: 15000000, employees: 150, owner: 'Mike Johnson', createdAt: '2024-06-20', lastActivity: '2024-12-23', deals: 2, contacts: 4, status: 'active' },
  { id: '3', name: 'Global Industries', industry: 'Manufacturing', type: 'customer', website: 'globalind.com', phone: '+1-555-0300', address: 'Chicago, IL', annualRevenue: 200000000, employees: 2500, owner: 'Sarah Chen', createdAt: '2022-08-10', lastActivity: '2024-12-22', deals: 8, contacts: 25, status: 'active' },
  { id: '4', name: 'InnovateTech', industry: 'Technology', type: 'partner', website: 'innovatetech.ai', phone: '+1-555-0400', address: 'Austin, TX', annualRevenue: 30000000, employees: 200, owner: 'Lisa Park', createdAt: '2024-02-15', lastActivity: '2024-12-21', deals: 3, contacts: 8, status: 'active' },
  { id: '5', name: 'FinanceFirst', industry: 'Financial Services', type: 'customer', website: 'financefirst.com', phone: '+1-555-0500', address: 'Boston, MA', annualRevenue: 100000000, employees: 1000, owner: 'Mike Johnson', createdAt: '2023-05-20', lastActivity: '2024-12-20', deals: 6, contacts: 15, status: 'active' }
]

const mockContacts: Contact[] = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@acme.com', phone: '+1-555-1001', title: 'VP of Engineering', department: 'Engineering', accountId: '1', accountName: 'Acme Corporation', leadSource: 'Website', status: 'customer', lastContact: '2024-12-24', createdAt: '2023-01-15' },
  { id: '2', firstName: 'Emily', lastName: 'Davis', email: 'emily@techstart.io', phone: '+1-555-2001', title: 'CEO', department: 'Executive', accountId: '2', accountName: 'TechStart Inc', leadSource: 'Referral', status: 'qualified', lastContact: '2024-12-23', createdAt: '2024-06-20' },
  { id: '3', firstName: 'Robert', lastName: 'Wilson', email: 'rwilson@globalind.com', phone: '+1-555-3001', title: 'CTO', department: 'Technology', accountId: '3', accountName: 'Global Industries', leadSource: 'Trade Show', status: 'customer', lastContact: '2024-12-22', createdAt: '2022-08-10' },
  { id: '4', firstName: 'Jennifer', lastName: 'Brown', email: 'jbrown@innovatetech.ai', phone: '+1-555-4001', title: 'Director of Partnerships', department: 'Business Development', accountId: '4', accountName: 'InnovateTech', leadSource: 'LinkedIn', status: 'qualified', lastContact: '2024-12-21', createdAt: '2024-02-15' },
  { id: '5', firstName: 'Michael', lastName: 'Garcia', email: 'mgarcia@financefirst.com', phone: '+1-555-5001', title: 'VP of Technology', department: 'IT', accountId: '5', accountName: 'FinanceFirst', leadSource: 'Cold Call', status: 'customer', lastContact: '2024-12-20', createdAt: '2023-05-20' }
]

const mockOpportunities: Opportunity[] = [
  { id: '1', name: 'Enterprise License Deal', accountId: '1', accountName: 'Acme Corporation', amount: 250000, stage: 'negotiation', probability: 75, closeDate: '2025-01-15', owner: 'Sarah Chen', type: 'new_business', leadSource: 'Website', nextStep: 'Final contract review', createdAt: '2024-10-01', updatedAt: '2024-12-24' },
  { id: '2', name: 'Platform Upgrade', accountId: '3', accountName: 'Global Industries', amount: 180000, stage: 'proposal', probability: 60, closeDate: '2025-02-01', owner: 'Sarah Chen', type: 'upsell', leadSource: 'Account Manager', nextStep: 'Demo scheduled', createdAt: '2024-11-15', updatedAt: '2024-12-23' },
  { id: '3', name: 'New Implementation', accountId: '2', accountName: 'TechStart Inc', amount: 85000, stage: 'qualification', probability: 40, closeDate: '2025-03-01', owner: 'Mike Johnson', type: 'new_business', leadSource: 'Referral', nextStep: 'Discovery call', createdAt: '2024-12-01', updatedAt: '2024-12-22' },
  { id: '4', name: 'Annual Renewal', accountId: '5', accountName: 'FinanceFirst', amount: 120000, stage: 'closed_won', probability: 100, closeDate: '2024-12-15', owner: 'Mike Johnson', type: 'renewal', leadSource: 'Account Manager', createdAt: '2024-09-01', updatedAt: '2024-12-15' },
  { id: '5', name: 'Partner Integration', accountId: '4', accountName: 'InnovateTech', amount: 95000, stage: 'prospecting', probability: 20, closeDate: '2025-04-01', owner: 'Lisa Park', type: 'new_business', leadSource: 'Partner', nextStep: 'Initial call scheduled', createdAt: '2024-12-10', updatedAt: '2024-12-21' },
  { id: '6', name: 'Team Expansion', accountId: '1', accountName: 'Acme Corporation', amount: 45000, stage: 'closed_won', probability: 100, closeDate: '2024-12-01', owner: 'Sarah Chen', type: 'existing_business', leadSource: 'Upsell', createdAt: '2024-11-01', updatedAt: '2024-12-01' }
]

const mockActivities: SalesActivity[] = [
  { id: '1', type: 'call', subject: 'Discovery call with John Smith', relatedTo: 'Acme Corporation', relatedType: 'account', owner: 'Sarah Chen', dueDate: '2024-12-26', status: 'pending', priority: 'high', createdAt: '2024-12-24' },
  { id: '2', type: 'email', subject: 'Send proposal document', relatedTo: 'Enterprise License Deal', relatedType: 'opportunity', owner: 'Sarah Chen', dueDate: '2024-12-25', status: 'completed', completedDate: '2024-12-24', priority: 'high', createdAt: '2024-12-23' },
  { id: '3', type: 'meeting', subject: 'Product demo', description: 'Demo new features to technical team', relatedTo: 'TechStart Inc', relatedType: 'account', owner: 'Mike Johnson', dueDate: '2024-12-27', status: 'pending', priority: 'medium', createdAt: '2024-12-22' },
  { id: '4', type: 'task', subject: 'Update CRM records', relatedTo: 'Global Industries', relatedType: 'account', owner: 'Sarah Chen', dueDate: '2024-12-24', status: 'overdue', priority: 'low', createdAt: '2024-12-20' },
  { id: '5', type: 'note', subject: 'Meeting notes - Budget discussion', description: 'Client mentioned Q1 budget approval pending', relatedTo: 'New Implementation', relatedType: 'opportunity', owner: 'Mike Johnson', status: 'completed', completedDate: '2024-12-22', priority: 'medium', createdAt: '2024-12-22' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStageColor = (stage: Opportunity['stage']): string => {
  const colors: Record<Opportunity['stage'], string> = {
    prospecting: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    qualification: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    closed_won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colors[stage]
}

const getAccountTypeColor = (type: Account['type']): string => {
  const colors: Record<Account['type'], string> = {
    customer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    prospect: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    partner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    competitor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colors[type]
}

const getActivityIcon = (type: SalesActivity['type']) => {
  const icons: Record<SalesActivity['type'], React.ReactNode> = {
    call: <Phone className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    task: <CheckCircle2 className="w-4 h-4" />,
    note: <FileText className="w-4 h-4" />
  }
  return icons[type]
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount}`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SalesClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [stageFilter, setStageFilter] = useState<string>('all')

  // Stats calculations
  const stats = useMemo(() => {
    const totalPipeline = mockOpportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).reduce((acc, o) => acc + o.amount, 0)
    const wonDeals = mockOpportunities.filter(o => o.stage === 'closed_won')
    const wonAmount = wonDeals.reduce((acc, o) => acc + o.amount, 0)
    const totalDeals = mockOpportunities.length
    const winRate = wonDeals.length / totalDeals * 100
    const avgDealSize = totalPipeline / mockOpportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).length || 0
    const totalAccounts = mockAccounts.length
    const totalContacts = mockContacts.length
    const pendingActivities = mockActivities.filter(a => a.status === 'pending').length

    return { totalPipeline, wonAmount, winRate, avgDealSize, totalAccounts, totalContacts, pendingActivities, wonDeals: wonDeals.length }
  }, [])

  // Pipeline stages
  const pipelineStages = useMemo(() => {
    return [
      { name: 'Prospecting', count: mockOpportunities.filter(o => o.stage === 'prospecting').length, amount: mockOpportunities.filter(o => o.stage === 'prospecting').reduce((a, o) => a + o.amount, 0), color: 'from-gray-500 to-slate-500' },
      { name: 'Qualification', count: mockOpportunities.filter(o => o.stage === 'qualification').length, amount: mockOpportunities.filter(o => o.stage === 'qualification').reduce((a, o) => a + o.amount, 0), color: 'from-blue-500 to-cyan-500' },
      { name: 'Proposal', count: mockOpportunities.filter(o => o.stage === 'proposal').length, amount: mockOpportunities.filter(o => o.stage === 'proposal').reduce((a, o) => a + o.amount, 0), color: 'from-purple-500 to-pink-500' },
      { name: 'Negotiation', count: mockOpportunities.filter(o => o.stage === 'negotiation').length, amount: mockOpportunities.filter(o => o.stage === 'negotiation').reduce((a, o) => a + o.amount, 0), color: 'from-orange-500 to-amber-500' },
      { name: 'Closed Won', count: mockOpportunities.filter(o => o.stage === 'closed_won').length, amount: mockOpportunities.filter(o => o.stage === 'closed_won').reduce((a, o) => a + o.amount, 0), color: 'from-green-500 to-emerald-500' }
    ]
  }, [])

  // Filtered opportunities
  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter(opp => {
      const matchesSearch = opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.accountName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStage = stageFilter === 'all' || opp.stage === stageFilter
      return matchesSearch && matchesStage
    })
  }, [searchQuery, stageFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sales</h1>
                <p className="text-sm text-muted-foreground">Salesforce-level CRM platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals, accounts..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Pipeline Value', value: formatCurrency(stats.totalPipeline), change: 18.5, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { label: 'Closed Won', value: formatCurrency(stats.wonAmount), change: 25.3, icon: CheckCircle2, color: 'from-blue-500 to-cyan-500' },
            { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, change: 5.2, icon: Award, color: 'from-purple-500 to-pink-500' },
            { label: 'Avg Deal Size', value: formatCurrency(stats.avgDealSize), change: 12.8, icon: Target, color: 'from-orange-500 to-amber-500' },
            { label: 'Accounts', value: stats.totalAccounts.toString(), change: 8.0, icon: Building2, color: 'from-teal-500 to-cyan-500' },
            { label: 'Contacts', value: stats.totalContacts.toString(), change: 15.0, icon: Users, color: 'from-indigo-500 to-purple-500' },
            { label: 'Won Deals', value: stats.wonDeals.toString(), change: 20.0, icon: Star, color: 'from-yellow-500 to-orange-500' },
            { label: 'Pending Tasks', value: stats.pendingActivities.toString(), change: -10.0, icon: Clock, color: 'from-rose-500 to-pink-500' }
          ].map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2">
              <Building2 className="w-4 h-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <PieChart className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Pipeline Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Sales Pipeline
                </CardTitle>
                <CardDescription>Current pipeline by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelineStages.map((stage) => {
                    const maxAmount = Math.max(...pipelineStages.map(s => s.amount))
                    const percentage = maxAmount > 0 ? (stage.amount / maxAmount) * 100 : 0
                    return (
                      <div key={stage.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stage.color} flex items-center justify-center text-white font-bold`}>
                              {stage.count}
                            </div>
                            <span className="font-medium">{stage.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(stage.amount)}</p>
                            <p className="text-xs text-muted-foreground">{stage.count} deals</p>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Deals */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Recent Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOpportunities.slice(0, 5).map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedOpportunity(opp)}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{opp.name}</p>
                            <Badge className={getStageColor(opp.stage)}>{opp.stage.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{opp.accountName} • {opp.owner}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(opp.amount)}</p>
                          <p className="text-xs text-muted-foreground">{opp.probability}% probability</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Upcoming Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivities.filter(a => a.status === 'pending').slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.priority === 'high' ? 'bg-red-100 text-red-600' : activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.subject}</p>
                          <p className="text-xs text-muted-foreground">{activity.relatedTo}</p>
                          {activity.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.dueDate}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex items-center gap-2">
              {['all', 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'].map((stage) => (
                <Button
                  key={stage}
                  variant={stageFilter === stage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStageFilter(stage)}
                  className="capitalize"
                >
                  {stage === 'all' ? 'All' : stage.replace('_', ' ')}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredOpportunities.map((opp) => (
                <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOpportunity(opp)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{opp.name}</h3>
                          <Badge className={getStageColor(opp.stage)}>{opp.stage.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{opp.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {opp.accountName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Close: {opp.closeDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {opp.owner}
                          </span>
                        </div>
                        {opp.nextStep && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm"><strong>Next Step:</strong> {opp.nextStep}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(opp.amount)}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">Probability</span>
                            <span className="font-medium">{opp.probability}%</span>
                          </div>
                          <Progress value={opp.probability} className="h-2 w-24" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid gap-4">
              {mockAccounts.map((account) => (
                <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAccount(account)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{account.name}</h3>
                            <Badge className={getAccountTypeColor(account.type)}>{account.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{account.industry}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {account.website && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {account.website}
                              </span>
                            )}
                            {account.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {account.address}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold">{formatCurrency(account.annualRevenue)}</p>
                          <p className="text-xs text-muted-foreground">Annual Revenue</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{account.deals}</p>
                          <p className="text-xs text-muted-foreground">Deals</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{account.contacts}</p>
                          <p className="text-xs text-muted-foreground">Contacts</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{contact.firstName} {contact.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                        <p className="text-sm text-muted-foreground">{contact.accountName}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All Activities</Button>
                <Button variant="outline" size="sm">Pending</Button>
                <Button variant="outline" size="sm">Overdue</Button>
                <Button variant="outline" size="sm">Completed</Button>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Log Activity
              </Button>
            </div>

            <div className="grid gap-4">
              {mockActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                          activity.status === 'overdue' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <p className="font-medium">{activity.subject}</p>
                          <p className="text-sm text-muted-foreground">{activity.relatedTo} • {activity.owner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${
                          activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                          activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.priority}
                        </Badge>
                        <Badge className={`${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.status}
                        </Badge>
                        {activity.dueDate && (
                          <span className="text-sm text-muted-foreground">{activity.dueDate}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Revenue by Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pipelineStages.map((stage) => (
                      <div key={stage.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stage.color}`} />
                          <span>{stage.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(stage.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Sarah Chen', 'Mike Johnson', 'Lisa Park'].map((name, i) => (
                      <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-green-600">#{i + 1}</span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{name}</span>
                        </div>
                        <span className="font-bold">{formatCurrency([295000, 205000, 95000][i])}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Opportunity Detail Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-500" />
              {selectedOpportunity?.name}
            </DialogTitle>
            <DialogDescription>{selectedOpportunity?.accountName}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedOpportunity && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStageColor(selectedOpportunity.stage)}>{selectedOpportunity.stage.replace('_', ' ')}</Badge>
                  <Badge variant="outline">{selectedOpportunity.type.replace('_', ' ')}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedOpportunity.amount)}</p>
                    <p className="text-sm text-muted-foreground">Deal Value</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-3xl font-bold">{selectedOpportunity.probability}%</p>
                    <p className="text-sm text-muted-foreground">Probability</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-3xl font-bold">{selectedOpportunity.closeDate}</p>
                    <p className="text-sm text-muted-foreground">Close Date</p>
                  </div>
                </div>

                {selectedOpportunity.nextStep && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="font-medium mb-1">Next Step</p>
                    <p className="text-sm">{selectedOpportunity.nextStep}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Advance Stage
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Account Detail Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedAccount?.name}
            </DialogTitle>
            <DialogDescription>{selectedAccount?.industry}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedAccount && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getAccountTypeColor(selectedAccount.type)}>{selectedAccount.type}</Badge>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatCurrency(selectedAccount.annualRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Annual Revenue</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedAccount.employees}</p>
                    <p className="text-xs text-muted-foreground">Employees</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedAccount.deals}</p>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedAccount.contacts}</p>
                    <p className="text-xs text-muted-foreground">Contacts</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedAccount.website && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <p className="font-medium">{selectedAccount.website}</p>
                    </div>
                  )}
                  {selectedAccount.phone && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedAccount.phone}</p>
                    </div>
                  )}
                  {selectedAccount.address && (
                    <div className="p-3 bg-muted/30 rounded-lg col-span-2">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedAccount.address}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Briefcase className="w-4 h-4 mr-2" />
                    New Deal
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
