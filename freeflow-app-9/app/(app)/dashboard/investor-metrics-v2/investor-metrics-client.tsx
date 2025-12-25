'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Plus,
  Search,
  Building2,
  Briefcase,
  FileText,
  Eye,
  Edit,
  Share2,
  Percent,
  CircleDollarSign,
  Wallet,
  TrendingDown,
  Scale,
  LineChart,
  Calculator,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Layers,
  GitBranch,
  Settings,
  Bell,
  Shield,
  Lock,
  Key,
  Zap,
  RefreshCw,
  Upload,
  Link2,
  Palette,
  AlertTriangle,
  Info,
  FileCheck,
  UserCog,
  BookOpen
} from 'lucide-react'

// Types
type FundingStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'ipo'
type InvestorType = 'angel' | 'vc' | 'corporate' | 'family-office' | 'accelerator' | 'strategic'
type ShareClass = 'common' | 'preferred' | 'options' | 'warrants' | 'safe' | 'convertible-note'
type DocumentStatus = 'draft' | 'pending' | 'signed' | 'executed'

interface FundingRound {
  id: string
  name: string
  stage: FundingStage
  targetAmount: number
  raisedAmount: number
  preMoneyValuation: number
  postMoneyValuation: number
  pricePerShare: number
  sharesIssued: number
  leadInvestor: string
  closeDate: string
  status: 'open' | 'closed' | 'planned'
  documents: { name: string; status: DocumentStatus }[]
}

interface Investor {
  id: string
  name: string
  type: InvestorType
  avatar?: string
  company?: string
  email: string
  phone?: string
  website?: string
  totalInvested: number
  ownership: number
  shareClass: ShareClass
  sharesOwned: number
  rounds: string[]
  boardSeat: boolean
  proRataRights: boolean
  joinedDate: string
  notes?: string
}

interface CapTableEntry {
  id: string
  stakeholder: string
  stakeholderType: 'founder' | 'employee' | 'investor' | 'advisor'
  shareClass: ShareClass
  shares: number
  ownership: number
  fullyDiluted: number
  vestedShares?: number
  vestingSchedule?: string
  investmentAmount?: number
  pricePerShare?: number
}

interface KPIMetric {
  id: string
  name: string
  category: 'revenue' | 'growth' | 'efficiency' | 'engagement'
  currentValue: number
  previousValue: number
  unit: 'currency' | 'percent' | 'number' | 'ratio'
  period: 'monthly' | 'quarterly' | 'annual'
  target?: number
  description?: string
}

// Mock Data
const mockFundingRounds: FundingRound[] = [
  {
    id: '1',
    name: 'Series A',
    stage: 'series-a',
    targetAmount: 10000000,
    raisedAmount: 10000000,
    preMoneyValuation: 40000000,
    postMoneyValuation: 50000000,
    pricePerShare: 12.50,
    sharesIssued: 800000,
    leadInvestor: 'Sequoia Capital',
    closeDate: '2024-01-15',
    status: 'closed',
    documents: [
      { name: 'Term Sheet', status: 'executed' },
      { name: 'Stock Purchase Agreement', status: 'executed' },
      { name: 'Investor Rights Agreement', status: 'executed' }
    ]
  },
  {
    id: '2',
    name: 'Seed Round',
    stage: 'seed',
    targetAmount: 3000000,
    raisedAmount: 3000000,
    preMoneyValuation: 12000000,
    postMoneyValuation: 15000000,
    pricePerShare: 5.00,
    sharesIssued: 600000,
    leadInvestor: 'Y Combinator',
    closeDate: '2023-06-01',
    status: 'closed',
    documents: [
      { name: 'SAFE Agreement', status: 'executed' },
      { name: 'Pro Rata Side Letter', status: 'executed' }
    ]
  },
  {
    id: '3',
    name: 'Series B',
    stage: 'series-b',
    targetAmount: 30000000,
    raisedAmount: 18500000,
    preMoneyValuation: 120000000,
    postMoneyValuation: 150000000,
    pricePerShare: 25.00,
    sharesIssued: 0,
    leadInvestor: 'Andreessen Horowitz',
    closeDate: '2024-06-30',
    status: 'open',
    documents: [
      { name: 'Term Sheet', status: 'pending' },
      { name: 'Due Diligence Checklist', status: 'draft' }
    ]
  }
]

const mockInvestors: Investor[] = [
  {
    id: '1',
    name: 'Sequoia Capital',
    type: 'vc',
    company: 'Sequoia Capital',
    email: 'investments@sequoia.com',
    website: 'sequoia.com',
    totalInvested: 5000000,
    ownership: 10.0,
    shareClass: 'preferred',
    sharesOwned: 400000,
    rounds: ['Series A'],
    boardSeat: true,
    proRataRights: true,
    joinedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Andreessen Horowitz',
    type: 'vc',
    company: 'a16z',
    email: 'deals@a16z.com',
    website: 'a16z.com',
    totalInvested: 8000000,
    ownership: 8.5,
    shareClass: 'preferred',
    sharesOwned: 340000,
    rounds: ['Series A', 'Series B'],
    boardSeat: true,
    proRataRights: true,
    joinedDate: '2024-01-15'
  },
  {
    id: '3',
    name: 'Y Combinator',
    type: 'accelerator',
    company: 'Y Combinator',
    email: 'partners@ycombinator.com',
    website: 'ycombinator.com',
    totalInvested: 500000,
    ownership: 7.0,
    shareClass: 'safe',
    sharesOwned: 280000,
    rounds: ['Seed Round'],
    boardSeat: false,
    proRataRights: true,
    joinedDate: '2023-06-01'
  },
  {
    id: '4',
    name: 'Sarah Chen',
    type: 'angel',
    email: 'sarah@angelinvestor.com',
    totalInvested: 250000,
    ownership: 2.5,
    shareClass: 'preferred',
    sharesOwned: 100000,
    rounds: ['Seed Round'],
    boardSeat: false,
    proRataRights: false,
    joinedDate: '2023-06-01'
  },
  {
    id: '5',
    name: 'Google Ventures',
    type: 'corporate',
    company: 'GV',
    email: 'investments@gv.com',
    website: 'gv.com',
    totalInvested: 3000000,
    ownership: 6.0,
    shareClass: 'preferred',
    sharesOwned: 240000,
    rounds: ['Series A'],
    boardSeat: false,
    proRataRights: true,
    joinedDate: '2024-01-15'
  }
]

const mockCapTable: CapTableEntry[] = [
  { id: '1', stakeholder: 'John Founder (CEO)', stakeholderType: 'founder', shareClass: 'common', shares: 2000000, ownership: 40.0, fullyDiluted: 33.3, vestedShares: 1500000, vestingSchedule: '4 years, 1 year cliff' },
  { id: '2', stakeholder: 'Jane Founder (CTO)', stakeholderType: 'founder', shareClass: 'common', shares: 1500000, ownership: 30.0, fullyDiluted: 25.0, vestedShares: 1125000, vestingSchedule: '4 years, 1 year cliff' },
  { id: '3', stakeholder: 'Sequoia Capital', stakeholderType: 'investor', shareClass: 'preferred', shares: 400000, ownership: 8.0, fullyDiluted: 6.7, investmentAmount: 5000000, pricePerShare: 12.50 },
  { id: '4', stakeholder: 'Andreessen Horowitz', stakeholderType: 'investor', shareClass: 'preferred', shares: 340000, ownership: 6.8, fullyDiluted: 5.7, investmentAmount: 8000000, pricePerShare: 23.53 },
  { id: '5', stakeholder: 'Y Combinator', stakeholderType: 'investor', shareClass: 'safe', shares: 280000, ownership: 5.6, fullyDiluted: 4.7, investmentAmount: 500000 },
  { id: '6', stakeholder: 'Employee Option Pool', stakeholderType: 'employee', shareClass: 'options', shares: 600000, ownership: 12.0, fullyDiluted: 10.0, vestedShares: 180000 },
  { id: '7', stakeholder: 'Google Ventures', stakeholderType: 'investor', shareClass: 'preferred', shares: 240000, ownership: 4.8, fullyDiluted: 4.0, investmentAmount: 3000000, pricePerShare: 12.50 },
  { id: '8', stakeholder: 'Angel Investors', stakeholderType: 'investor', shareClass: 'preferred', shares: 140000, ownership: 2.8, fullyDiluted: 2.3, investmentAmount: 750000 }
]

const mockKPIs: KPIMetric[] = [
  { id: '1', name: 'Annual Recurring Revenue', category: 'revenue', currentValue: 4200000, previousValue: 2800000, unit: 'currency', period: 'annual', target: 5000000 },
  { id: '2', name: 'Monthly Recurring Revenue', category: 'revenue', currentValue: 350000, previousValue: 280000, unit: 'currency', period: 'monthly', target: 420000 },
  { id: '3', name: 'Revenue Growth Rate', category: 'growth', currentValue: 25, previousValue: 18, unit: 'percent', period: 'monthly' },
  { id: '4', name: 'Customer Acquisition Cost', category: 'efficiency', currentValue: 450, previousValue: 520, unit: 'currency', period: 'monthly', target: 400 },
  { id: '5', name: 'Customer Lifetime Value', category: 'revenue', currentValue: 4500, previousValue: 3800, unit: 'currency', period: 'annual' },
  { id: '6', name: 'LTV:CAC Ratio', category: 'efficiency', currentValue: 10, previousValue: 7.3, unit: 'ratio', period: 'quarterly', target: 12 },
  { id: '7', name: 'Net Revenue Retention', category: 'growth', currentValue: 125, previousValue: 118, unit: 'percent', period: 'annual', target: 130 },
  { id: '8', name: 'Gross Margin', category: 'efficiency', currentValue: 78, previousValue: 72, unit: 'percent', period: 'quarterly', target: 80 },
  { id: '9', name: 'Burn Rate', category: 'efficiency', currentValue: 420000, previousValue: 380000, unit: 'currency', period: 'monthly', target: 350000 },
  { id: '10', name: 'Runway (months)', category: 'efficiency', currentValue: 24, previousValue: 18, unit: 'number', period: 'monthly', target: 18 },
  { id: '11', name: 'Active Users', category: 'engagement', currentValue: 45000, previousValue: 32000, unit: 'number', period: 'monthly', target: 50000 },
  { id: '12', name: 'Churn Rate', category: 'engagement', currentValue: 2.1, previousValue: 3.2, unit: 'percent', period: 'monthly', target: 2.0 }
]

export default function InvestorMetricsClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRound, setSelectedRound] = useState<FundingRound | null>(null)
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [periodFilter, setPeriodFilter] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly')
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats calculations
  const stats = useMemo(() => {
    const totalRaised = mockFundingRounds.reduce((sum, r) => sum + r.raisedAmount, 0)
    const currentValuation = mockFundingRounds.find(r => r.status === 'open')?.postMoneyValuation ||
      mockFundingRounds.filter(r => r.status === 'closed').sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())[0]?.postMoneyValuation || 0
    const totalInvestors = mockInvestors.length
    const totalShares = mockCapTable.reduce((sum, e) => sum + e.shares, 0)
    const arr = mockKPIs.find(k => k.name === 'Annual Recurring Revenue')?.currentValue || 0
    const mrr = mockKPIs.find(k => k.name === 'Monthly Recurring Revenue')?.currentValue || 0
    const runway = mockKPIs.find(k => k.name === 'Runway (months)')?.currentValue || 0
    const burnRate = mockKPIs.find(k => k.name === 'Burn Rate')?.currentValue || 0

    return {
      totalRaised,
      currentValuation,
      totalInvestors,
      totalShares,
      arr,
      mrr,
      runway,
      burnRate
    }
  }, [])

  // Helper functions
  const formatCurrency = (amount: number, compact = false) => {
    if (compact) {
      if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
  }

  const getStageColor = (stage: FundingStage) => {
    switch (stage) {
      case 'pre-seed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'seed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'series-a': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'series-b': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'series-c': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'series-d': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'ipo': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getInvestorTypeColor = (type: InvestorType) => {
    switch (type) {
      case 'vc': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'angel': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      case 'corporate': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'accelerator': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'family-office': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'strategic': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getShareClassColor = (shareClass: ShareClass) => {
    switch (shareClass) {
      case 'common': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'preferred': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'options': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'warrants': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'safe': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'convertible-note': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const getChangeColor = (change: number, inverse = false) => {
    const positive = inverse ? change < 0 : change > 0
    return positive ? 'text-green-600' : change === 0 ? 'text-gray-500' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-orange-50/40 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investor Metrics</h1>
                <p className="text-gray-500 dark:text-gray-400">Carta-level Cap Table & Investor Relations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Investor
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRaised, true)}</div>
                <div className="text-xs text-gray-500">Total Raised</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.currentValuation, true)}</div>
                <div className="text-xs text-gray-500">Valuation</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInvestors}</div>
                <div className="text-xs text-gray-500">Investors</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.arr, true)}</div>
                <div className="text-xs text-gray-500">ARR</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-cyan-600 mb-1">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.mrr, true)}</div>
                <div className="text-xs text-gray-500">MRR</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.burnRate, true)}</div>
                <div className="text-xs text-gray-500">Burn Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.runway} mo</div>
                <div className="text-xs text-gray-500">Runway</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalShares / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-gray-500">Total Shares</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cap-table">Cap Table</TabsTrigger>
                <TabsTrigger value="funding">Funding Rounds</TabsTrigger>
                <TabsTrigger value="investors">Investors</TabsTrigger>
                <TabsTrigger value="kpis">KPI Dashboard</TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Funding Progress */}
                <Card className="bg-white dark:bg-gray-800 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CircleDollarSign className="w-5 h-5 text-amber-500" />
                      Funding Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {mockFundingRounds.map(round => (
                      <div key={round.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStageColor(round.stage)}>{round.stage.replace('-', ' ')}</Badge>
                            <span className="font-medium">{round.name}</span>
                          </div>
                          <Badge variant="outline" className={
                            round.status === 'closed' ? 'bg-green-100 text-green-700' :
                            round.status === 'open' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {round.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={(round.raisedAmount / round.targetAmount) * 100} className="flex-1 h-3" />
                          <span className="text-sm font-medium w-32 text-right">
                            {formatCurrency(round.raisedAmount, true)} / {formatCurrency(round.targetAmount, true)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Lead: {round.leadInvestor}</span>
                          <span>•</span>
                          <span>Valuation: {formatCurrency(round.postMoneyValuation, true)}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Ownership Breakdown */}
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-500" />
                      Ownership
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockCapTable.slice(0, 6).map(entry => (
                        <div key={entry.id} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{
                            backgroundColor: entry.stakeholderType === 'founder' ? '#f59e0b' :
                              entry.stakeholderType === 'investor' ? '#3b82f6' :
                              entry.stakeholderType === 'employee' ? '#8b5cf6' : '#10b981'
                          }} />
                          <span className="text-sm flex-1 truncate">{entry.stakeholder}</span>
                          <span className="text-sm font-medium">{entry.ownership.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockKPIs.slice(0, 8).map(kpi => {
                  const change = calculateChange(kpi.currentValue, kpi.previousValue)
                  const isInverse = kpi.name.includes('Churn') || kpi.name.includes('CAC') || kpi.name.includes('Burn')
                  return (
                    <Card key={kpi.id} className="bg-white dark:bg-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">{kpi.name}</span>
                          <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor(change, isInverse)}`}>
                            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                            {Math.abs(change).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {kpi.unit === 'currency' ? formatCurrency(kpi.currentValue, true) :
                           kpi.unit === 'percent' ? `${kpi.currentValue}%` :
                           kpi.unit === 'ratio' ? `${kpi.currentValue}x` :
                           kpi.currentValue.toLocaleString()}
                        </div>
                        {kpi.target && (
                          <div className="mt-2">
                            <Progress value={(kpi.currentValue / kpi.target) * 100} className="h-1.5" />
                            <div className="text-xs text-gray-500 mt-1">
                              Target: {kpi.unit === 'currency' ? formatCurrency(kpi.target, true) : kpi.target}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Cap Table Tab */}
            <TabsContent value="cap-table" className="space-y-4">
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stakeholder</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Class</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ownership</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fully Diluted</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {mockCapTable.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className={
                                  entry.stakeholderType === 'founder' ? 'bg-amber-500 text-white' :
                                  entry.stakeholderType === 'investor' ? 'bg-blue-500 text-white' :
                                  entry.stakeholderType === 'employee' ? 'bg-purple-500 text-white' :
                                  'bg-green-500 text-white'
                                }>
                                  {entry.stakeholder.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{entry.stakeholder}</div>
                                {entry.vestingSchedule && (
                                  <div className="text-xs text-gray-500">{entry.vestingSchedule}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="capitalize">{entry.stakeholderType}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getShareClassColor(entry.shareClass)}>{entry.shareClass}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                            {entry.shares.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                            {entry.ownership.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                            {entry.fullyDiluted.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                            {entry.investmentAmount ? formatCurrency(entry.investmentAmount, true) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-medium">
                      <tr>
                        <td className="px-6 py-3" colSpan={3}>Total</td>
                        <td className="px-6 py-3 text-right">{mockCapTable.reduce((sum, e) => sum + e.shares, 0).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right">100.00%</td>
                        <td className="px-6 py-3 text-right">100.00%</td>
                        <td className="px-6 py-3 text-right">{formatCurrency(mockCapTable.reduce((sum, e) => sum + (e.investmentAmount || 0), 0), true)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funding Rounds Tab */}
            <TabsContent value="funding" className="space-y-4">
              <div className="grid gap-6">
                {mockFundingRounds.map(round => (
                  <Card key={round.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRound(round)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                            <CircleDollarSign className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{round.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStageColor(round.stage)}>{round.stage.replace('-', ' ')}</Badge>
                              <Badge variant="outline" className={
                                round.status === 'closed' ? 'bg-green-100 text-green-700' :
                                round.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {round.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(round.raisedAmount)}</div>
                          <div className="text-sm text-gray-500">of {formatCurrency(round.targetAmount)} target</div>
                        </div>
                      </div>

                      <Progress value={(round.raisedAmount / round.targetAmount) * 100} className="h-3 mb-4" />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Pre-Money</div>
                          <div className="font-semibold">{formatCurrency(round.preMoneyValuation, true)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Post-Money</div>
                          <div className="font-semibold">{formatCurrency(round.postMoneyValuation, true)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Price/Share</div>
                          <div className="font-semibold">${round.pricePerShare.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Lead Investor</div>
                          <div className="font-semibold truncate">{round.leadInvestor}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {round.status === 'closed' ? 'Closed' : 'Target close'}: {new Date(round.closeDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FileText className="w-4 h-4" />
                          {round.documents.length} documents
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Investors Tab */}
            <TabsContent value="investors" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockInvestors.map(investor => (
                  <Card key={investor.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedInvestor(investor)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg">
                            {investor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{investor.name}</h3>
                          {investor.company && investor.company !== investor.name && (
                            <p className="text-sm text-gray-500">{investor.company}</p>
                          )}
                          <Badge className={getInvestorTypeColor(investor.type)} variant="outline">
                            {investor.type.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(investor.totalInvested, true)}</div>
                          <div className="text-xs text-gray-500">Invested</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{investor.ownership}%</div>
                          <div className="text-xs text-gray-500">Ownership</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {investor.rounds.map(round => (
                          <Badge key={round} variant="outline" className="text-xs">{round}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {investor.boardSeat && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            Board Seat
                          </div>
                        )}
                        {investor.proRataRights && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Pro Rata
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* KPIs Tab */}
            <TabsContent value="kpis" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant={periodFilter === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodFilter('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={periodFilter === 'quarterly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodFilter('quarterly')}
                >
                  Quarterly
                </Button>
                <Button
                  variant={periodFilter === 'annual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriodFilter('annual')}
                >
                  Annual
                </Button>
              </div>

              {['revenue', 'growth', 'efficiency', 'engagement'].map(category => (
                <Card key={category} className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      {category === 'revenue' && <DollarSign className="w-5 h-5 text-green-500" />}
                      {category === 'growth' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                      {category === 'efficiency' && <BarChart3 className="w-5 h-5 text-purple-500" />}
                      {category === 'engagement' && <Users className="w-5 h-5 text-orange-500" />}
                      {category} Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {mockKPIs.filter(k => k.category === category).map(kpi => {
                        const change = calculateChange(kpi.currentValue, kpi.previousValue)
                        const isInverse = kpi.name.includes('Churn') || kpi.name.includes('CAC') || kpi.name.includes('Burn')
                        return (
                          <div key={kpi.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">{kpi.name}</span>
                              <div className={`flex items-center gap-1 text-xs font-medium ${getChangeColor(change, isInverse)}`}>
                                {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                                {Math.abs(change).toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">
                              {kpi.unit === 'currency' ? formatCurrency(kpi.currentValue, true) :
                               kpi.unit === 'percent' ? `${kpi.currentValue}%` :
                               kpi.unit === 'ratio' ? `${kpi.currentValue}x` :
                               kpi.currentValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Previous: {kpi.unit === 'currency' ? formatCurrency(kpi.previousValue, true) :
                                kpi.unit === 'percent' ? `${kpi.previousValue}%` :
                                kpi.unit === 'ratio' ? `${kpi.previousValue}x` :
                                kpi.previousValue.toLocaleString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Settings Sub-tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1 p-2 overflow-x-auto">
                    {[
                      { id: 'general', label: 'General', icon: Settings },
                      { id: 'permissions', label: 'Permissions', icon: Shield },
                      { id: 'reporting', label: 'Reporting', icon: BarChart3 },
                      { id: 'integrations', label: 'Integrations', icon: Link2 },
                      { id: 'compliance', label: 'Compliance', icon: FileCheck },
                      { id: 'advanced', label: 'Advanced', icon: Zap }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSettingsTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          settingsTab === tab.id
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {/* General Settings */}
                  {settingsTab === 'general' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-amber-600" />
                            Company Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Company Legal Name</Label>
                              <Input defaultValue="Kazi Technologies Inc." className="mt-1" />
                            </div>
                            <div>
                              <Label>Doing Business As (DBA)</Label>
                              <Input defaultValue="Kazi" className="mt-1" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>State of Incorporation</Label>
                              <Select defaultValue="delaware">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="delaware">Delaware</SelectItem>
                                  <SelectItem value="california">California</SelectItem>
                                  <SelectItem value="nevada">Nevada</SelectItem>
                                  <SelectItem value="wyoming">Wyoming</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Entity Type</Label>
                              <Select defaultValue="c-corp">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="c-corp">C Corporation</SelectItem>
                                  <SelectItem value="s-corp">S Corporation</SelectItem>
                                  <SelectItem value="llc">LLC</SelectItem>
                                  <SelectItem value="lp">Limited Partnership</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>Federal EIN</Label>
                            <Input defaultValue="XX-XXXXXXX" className="mt-1 font-mono" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <CircleDollarSign className="w-5 h-5 text-green-600" />
                            Financial Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Currency</Label>
                              <Select defaultValue="usd">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="usd">USD ($)</SelectItem>
                                  <SelectItem value="eur">EUR (€)</SelectItem>
                                  <SelectItem value="gbp">GBP (£)</SelectItem>
                                  <SelectItem value="cad">CAD ($)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Fiscal Year End</Label>
                              <Select defaultValue="december">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="december">December</SelectItem>
                                  <SelectItem value="march">March</SelectItem>
                                  <SelectItem value="june">June</SelectItem>
                                  <SelectItem value="september">September</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Par Value per Share</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Standard par value for common stock</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>$</span>
                              <Input type="number" defaultValue="0.0001" className="w-24" step="0.0001" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            Notifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Investor Updates</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Notify when investor details change</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Cap Table Changes</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Alert on equity transactions</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>KPI Threshold Alerts</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Notify when metrics exceed limits</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Permissions Settings */}
                  {settingsTab === 'permissions' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access & Permissions</h3>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <UserCog className="w-5 h-5 text-indigo-600" />
                            Role-Based Access
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { role: 'Admin', description: 'Full access to all investor data and settings', users: 2 },
                            { role: 'Finance', description: 'View and edit financial data, cap table', users: 3 },
                            { role: 'Investor Relations', description: 'Manage investor communications', users: 2 },
                            { role: 'Viewer', description: 'Read-only access to dashboard', users: 5 }
                          ].map(role => (
                            <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div>
                                <Label>{role.role}</Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">{role.users} users</Badge>
                                <Button variant="ghost" size="sm">Configure</Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Lock className="w-5 h-5 text-red-600" />
                            Data Access Controls
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Require MFA for Sensitive Data</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Two-factor authentication for cap table access</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Hide Valuations from Non-Admins</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Restrict valuation visibility</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Investor Portal Access</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Allow investors to view their holdings</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Key className="w-5 h-5 text-amber-600" />
                            API Access
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Label>API Key</Label>
                              <Button variant="ghost" size="sm">Regenerate</Button>
                            </div>
                            <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly className="font-mono" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                            <span className="text-sm text-gray-500">Last used 2 hours ago</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Reporting Settings */}
                  {settingsTab === 'reporting' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reporting Configuration</h3>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Investor Reports
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Default Report Frequency</Label>
                            <Select defaultValue="quarterly">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Include Financial Statements</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Attach P&L and balance sheet</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Include KPI Dashboard</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Attach key metrics summary</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Auto-send Reports</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically email reports to investors</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            Report Templates
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {[
                              'Quarterly Investor Update',
                              'Board Meeting Package',
                              'Cap Table Summary',
                              '409A Valuation Report',
                              'Funding Round Summary'
                            ].map(template => (
                              <div key={template} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-medium">{template}</span>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">Preview</Button>
                                  <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" className="mt-4 w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Custom Template
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Export Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Default Export Format</Label>
                            <Select defaultValue="pdf">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="excel">Excel (XLSX)</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="outline" className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Export Cap Table
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Export KPIs
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Integrations Settings */}
                  {settingsTab === 'integrations' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integrations</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'QuickBooks', description: 'Sync financial data', icon: CircleDollarSign, connected: true, color: 'green' },
                          { name: 'Stripe', description: 'Payment processing', icon: Wallet, connected: true, color: 'purple' },
                          { name: 'DocuSign', description: 'Document signing', icon: FileText, connected: true, color: 'blue' },
                          { name: 'Slack', description: 'Team notifications', icon: Bell, connected: false, color: 'purple' },
                          { name: 'Salesforce', description: 'CRM integration', icon: Users, connected: false, color: 'blue' },
                          { name: 'Google Workspace', description: 'Document storage', icon: Globe, connected: true, color: 'amber' }
                        ].map(integration => (
                          <Card key={integration.name}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-${integration.color}-100 dark:bg-${integration.color}-900/40 flex items-center justify-center`}>
                                    <integration.icon className={`w-5 h-5 text-${integration.color}-600`} />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                                  </div>
                                </div>
                                {integration.connected ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Connected</Badge>
                                ) : (
                                  <Button size="sm" variant="outline">Connect</Button>
                                )}
                              </div>
                              {integration.connected && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <RefreshCw className="w-3 h-3" />
                                  Last synced 10 minutes ago
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Data Import</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Drag and drop files to import</p>
                            <p className="text-xs text-gray-500 mt-1">Supports CSV, Excel, and Carta export files</p>
                            <Button variant="outline" className="mt-4">Browse Files</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Compliance Settings */}
                  {settingsTab === 'compliance' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance & Legal</h3>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-green-600" />
                            Regulatory Filings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Form D Reminder</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Alert 15 days before filing deadline</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Delaware Franchise Tax</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Annual filing reminder</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>409A Valuation Tracker</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Track valuation expiration dates</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-600" />
                            Legal Documents
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {[
                              { name: 'Certificate of Incorporation', status: 'active', date: '2023-01-15' },
                              { name: 'Bylaws', status: 'active', date: '2023-01-15' },
                              { name: 'Investor Rights Agreement', status: 'active', date: '2024-01-15' },
                              { name: 'Stock Plan', status: 'needs_update', date: '2023-06-01' },
                              { name: 'ROFR Agreement', status: 'active', date: '2024-01-15' }
                            ].map(doc => (
                              <div key={doc.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <span className="font-medium">{doc.name}</span>
                                    <p className="text-xs text-gray-500">{doc.date}</p>
                                  </div>
                                </div>
                                <Badge className={doc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                  {doc.status === 'active' ? 'Active' : 'Needs Update'}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Info className="w-5 h-5 text-purple-600" />
                            Audit Trail
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Enable Audit Logging</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Track all cap table changes</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div>
                            <Label>Audit Log Retention</Label>
                            <Select defaultValue="7years">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1year">1 Year</SelectItem>
                                <SelectItem value="3years">3 Years</SelectItem>
                                <SelectItem value="5years">5 Years</SelectItem>
                                <SelectItem value="7years">7 Years</SelectItem>
                                <SelectItem value="forever">Forever</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Advanced Settings */}
                  {settingsTab === 'advanced' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-600" />
                            Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Auto-refresh Dashboard</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Update data every 5 minutes</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Cache Financial Data</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Improve load times with caching</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div>
                            <Label>Historical Data Range</Label>
                            <Select defaultValue="5years">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1year">1 Year</SelectItem>
                                <SelectItem value="2years">2 Years</SelectItem>
                                <SelectItem value="5years">5 Years</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Palette className="w-5 h-5 text-pink-600" />
                            Display Options
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Default Dashboard View</Label>
                            <Select defaultValue="overview">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="cap-table">Cap Table</SelectItem>
                                <SelectItem value="funding">Funding Rounds</SelectItem>
                                <SelectItem value="kpis">KPI Dashboard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Compact Number Format</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Show $1.5M instead of $1,500,000</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Show Fully Diluted by Default</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Display fully diluted ownership</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                          <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div>
                              <Label className="text-red-700 dark:text-red-400">Reset All KPIs</Label>
                              <p className="text-sm text-red-600 dark:text-red-500">Clear all historical KPI data</p>
                            </div>
                            <Button variant="destructive" size="sm">Reset</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div>
                              <Label className="text-red-700 dark:text-red-400">Export & Delete Account</Label>
                              <p className="text-sm text-red-600 dark:text-red-500">Download all data and close account</p>
                            </div>
                            <Button variant="destructive" size="sm">Export & Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Investor Detail Dialog */}
      <Dialog open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {selectedInvestor?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {selectedInvestor?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedInvestor && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getInvestorTypeColor(selectedInvestor.type)}>{selectedInvestor.type}</Badge>
                <Badge className={getShareClassColor(selectedInvestor.shareClass)}>{selectedInvestor.shareClass}</Badge>
                {selectedInvestor.boardSeat && <Badge className="bg-yellow-100 text-yellow-700">Board Seat</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Invested</div>
                  <div className="text-xl font-bold">{formatCurrency(selectedInvestor.totalInvested)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ownership</div>
                  <div className="text-xl font-bold">{selectedInvestor.ownership}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Shares Owned</div>
                  <div className="text-xl font-bold">{selectedInvestor.sharesOwned.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Joined</div>
                  <div className="text-xl font-bold">{new Date(selectedInvestor.joinedDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Participated Rounds</div>
                <div className="flex gap-2 flex-wrap">
                  {selectedInvestor.rounds.map(round => (
                    <Badge key={round} variant="outline">{round}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedInvestor.email}</span>
                </div>
                {selectedInvestor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedInvestor.phone}</span>
                  </div>
                )}
                {selectedInvestor.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span>{selectedInvestor.website}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Update
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
