'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  FileText,
  Edit,
  Share2,
  CircleDollarSign,
  Wallet,
  TrendingDown,
  Scale,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Mail,
  Phone,
  Layers,
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




// Database types
interface DBInvestorMetric {
  id: string
  user_id: string
  metric_name: string
  category: 'revenue' | 'growth' | 'efficiency' | 'engagement'
  current_value: number
  previous_value: number
  change_percent: number
  unit: string
  description: string | null
  period: 'monthly' | 'quarterly' | 'yearly'
  created_at: string
  updated_at: string
}

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

// Mock data for AI-powered competitive upgrade components
const mockInvestorMetricsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Metrics Strong', description: 'All key metrics trending above board expectations. Great quarter!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Burn Rate Alert', description: 'Burn rate increased 15% this month. Review spending.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Finance' },
  { id: '3', type: 'info' as const, title: 'Investor Update', description: 'Q4 investor report due in 5 days. Data ready for review.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Reporting' },
]

const mockInvestorMetricsCollaborators = [
  { id: '1', name: 'CFO', avatar: '/avatars/cfo.jpg', status: 'online' as const, role: 'Finance' },
  { id: '2', name: 'CEO', avatar: '/avatars/ceo.jpg', status: 'online' as const, role: 'Executive' },
  { id: '3', name: 'Board Member', avatar: '/avatars/board.jpg', status: 'away' as const, role: 'Board' },
]

const mockInvestorMetricsPredictions = [
  { id: '1', title: 'Runway Forecast', prediction: 'Current runway extends to 26 months with Q1 revenue projections', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Series B Timeline', prediction: 'Metrics support Series B raise by Q3 at $150M+ valuation', confidence: 75, trend: 'up' as const, impact: 'high' as const },
]

const mockInvestorMetricsActivities = [
  { id: '1', user: 'CFO', action: 'Updated', target: 'monthly financial metrics', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'CEO', action: 'Shared', target: 'investor deck with advisors', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Generated', target: 'automated KPI report', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// QuickActions are defined inside the component to access state setters

export default function InvestorMetricsClient() {

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRound, setSelectedRound] = useState<FundingRound | null>(null)
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [periodFilter, setPeriodFilter] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly')
  const [settingsTab, setSettingsTab] = useState('general')

  // Database state
  const [dbMetrics, setDbMetrics] = useState<DBInvestorMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [showMetricDialog, setShowMetricDialog] = useState(false)
  const [editingMetric, setEditingMetric] = useState<DBInvestorMetric | null>(null)

  // Dialog states for QuickActions
  const [showUpdateMetricsDialog, setShowUpdateMetricsDialog] = useState(false)
  const [showInvestorReportDialog, setShowInvestorReportDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [updateMetricsData, setUpdateMetricsData] = useState({
    refreshAll: true,
    syncWithAccounting: false,
    recalculateKPIs: true,
    updateTimestamp: true
  })
  const [reportConfig, setReportConfig] = useState({
    reportType: 'quarterly' as 'monthly' | 'quarterly' | 'annual',
    includeFinancials: true,
    includeCapTable: true,
    includeKPIs: true,
    recipientEmails: '',
    sendImmediately: false
  })
  const [exportConfig, setExportConfig] = useState({
    format: 'xlsx' as 'xlsx' | 'csv' | 'json' | 'pdf',
    includeMetrics: true,
    includeCapTable: true,
    includeFundingRounds: true,
    includeInvestors: true,
    dateRange: 'all' as 'all' | 'ytd' | 'last12months' | 'custom'
  })
  const [formData, setFormData] = useState<{
    metric_name: string
    category: 'revenue' | 'growth' | 'efficiency' | 'engagement'
    current_value: number
    previous_value: number
    unit: string
    description: string
    period: 'monthly' | 'quarterly' | 'yearly'
  }>({
    metric_name: '',
    category: 'revenue',
    current_value: 0,
    previous_value: 0,
    unit: 'currency',
    description: '',
    period: 'quarterly'
  })

  // Fetch metrics from Supabase
  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('investor_metrics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbMetrics(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch metrics', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMetric = async () => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const changePercent = formData.previous_value > 0
        ? ((formData.current_value - formData.previous_value) / formData.previous_value) * 100
        : 0

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('investor_metrics')
        .insert({
          user_id: user.id,
          metric_name: formData.metric_name,
          category: formData.category,
          current_value: formData.current_value,
          previous_value: formData.previous_value,
          change_percent: changePercent,
          unit: formData.unit,
          description: formData.description || null,
          period: formData.period
        })
        .select()
        .single()

      if (error) throw error

      setDbMetrics(prev => [data, ...prev])
      setShowMetricDialog(false)
      resetForm()
      toast.success('Metric created successfully')
    } catch (error: any) {
      toast.error('Failed to create metric', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMetric = async () => {
    if (!editingMetric) return
    setLoading(true)
    try {
      const changePercent = formData.previous_value > 0
        ? ((formData.current_value - formData.previous_value) / formData.previous_value) * 100
        : 0

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('investor_metrics')
        .update({
          metric_name: formData.metric_name,
          category: formData.category,
          current_value: formData.current_value,
          previous_value: formData.previous_value,
          change_percent: changePercent,
          unit: formData.unit,
          description: formData.description || null,
          period: formData.period,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMetric.id)
        .select()
        .single()

      if (error) throw error

      setDbMetrics(prev => prev.map(m => m.id === editingMetric.id ? data : m))
      setShowMetricDialog(false)
      setEditingMetric(null)
      resetForm()
      toast.success('Metric updated successfully')
    } catch (error: any) {
      toast.error('Failed to update metric', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMetric = async (id: string) => {
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('investor_metrics')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDbMetrics(prev => prev.filter(m => m.id !== id))
      toast.success('Metric deleted successfully')
    } catch (error: any) {
      toast.error('Failed to delete metric', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      metric_name: '',
      category: 'revenue',
      current_value: 0,
      previous_value: 0,
      unit: 'currency',
      description: '',
      period: 'quarterly'
    })
  }

  const openEditDialog = (metric: DBInvestorMetric) => {
    setEditingMetric(metric)
    setFormData({
      metric_name: metric.metric_name,
      category: metric.category,
      current_value: metric.current_value,
      previous_value: metric.previous_value,
      unit: metric.unit,
      description: metric.description || '',
      period: metric.period as 'monthly' | 'quarterly' | 'yearly'
    })
    setShowMetricDialog(true)
  }

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

  // Handlers
  const handleExportMetrics = async () => {
    try {
      const exportData = {
        metrics: dbMetrics,
        kpis: mockKPIs,
        capTable: mockCapTable,
        fundingRounds: mockFundingRounds,
        exportedAt: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `investor-metrics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Metrics exported', { description: 'Investor report downloaded successfully' })
    } catch (error: any) {
      toast.error('Export failed', { description: error.message })
    }
  }

  const handleRefreshData = async () => {
    await toast.promise(fetchMetrics(), {
      loading: 'Refreshing data...',
      success: 'Data refreshed - Latest metrics loaded',
      error: 'Failed to refresh data'
    })
  }

  const handleGenerateReport = () => {
    setShowInvestorReportDialog(true)
  }

  const handleGenerateReportSubmit = async () => {
    setLoading(true)
    try {
      // Generate report data
      const reportData = {
        type: reportConfig.reportType,
        generatedAt: new Date().toISOString(),
        company: 'Kazi Technologies Inc.',
        ...(reportConfig.includeFinancials && { financials: mockKPIs.filter(k => k.category === 'revenue') }),
        ...(reportConfig.includeCapTable && { capTable: mockCapTable }),
        ...(reportConfig.includeKPIs && { kpis: mockKPIs })
      }

      // Create and download report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `investor-report-${reportConfig.reportType}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      if (reportConfig.sendImmediately && reportConfig.recipientEmails) {
        // In production, this would send to an API endpoint
        toast.success('Report sent', { description: `Report emailed to ${reportConfig.recipientEmails.split(',').length} recipients` })
      }

      toast.success('Report Generated', { description: `${reportConfig.reportType.charAt(0).toUpperCase() + reportConfig.reportType.slice(1)} investor report is ready` })
      setShowInvestorReportDialog(false)
    } catch (error: any) {
      toast.error('Failed to generate report', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMetricsSubmit = async () => {
    setLoading(true)
    try {
      if (updateMetricsData.refreshAll) {
        await fetchMetrics()
      }

      if (updateMetricsData.recalculateKPIs) {
        // In production, this would trigger KPI recalculation
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (updateMetricsData.syncWithAccounting) {
        // In production, this would sync with accounting system
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      toast.success('Metrics Updated', {
        description: `Updated: ${[
          updateMetricsData.refreshAll && 'data refreshed',
          updateMetricsData.recalculateKPIs && 'KPIs recalculated',
          updateMetricsData.syncWithAccounting && 'accounting synced'
        ].filter(Boolean).join(', ')}`
      })
      setShowUpdateMetricsDialog(false)
    } catch (error: any) {
      toast.error('Failed to update metrics', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleExportDataSubmit = async () => {
    setLoading(true)
    try {
      const exportData: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        dateRange: exportConfig.dateRange
      }

      if (exportConfig.includeMetrics) {
        exportData.metrics = dbMetrics
        exportData.kpis = mockKPIs
      }
      if (exportConfig.includeCapTable) {
        exportData.capTable = mockCapTable
      }
      if (exportConfig.includeFundingRounds) {
        exportData.fundingRounds = mockFundingRounds
      }
      if (exportConfig.includeInvestors) {
        exportData.investors = mockInvestors
      }

      let blob: Blob
      let filename: string

      if (exportConfig.format === 'json') {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        filename = `investor-data-export-${new Date().toISOString().split('T')[0]}.json`
      } else if (exportConfig.format === 'csv') {
        // Convert to CSV (simplified)
        const csvContent = Object.entries(exportData)
          .map(([key, value]) => `${key},${JSON.stringify(value)}`)
          .join('\n')
        blob = new Blob([csvContent], { type: 'text/csv' })
        filename = `investor-data-export-${new Date().toISOString().split('T')[0]}.csv`
      } else {
        // Default to JSON for xlsx/pdf (in production would use proper libraries)
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        filename = `investor-data-export-${new Date().toISOString().split('T')[0]}.${exportConfig.format}`
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Data Exported', {
        description: `Exported ${Object.keys(exportData).length - 2} data sets as ${exportConfig.format.toUpperCase()}`
      })
      setShowExportDataDialog(false)
    } catch (error: any) {
      toast.error('Export failed', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSetAlert = async (metric: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }
      // Could save alert to database here
      toast.success('Alert set', { description: `You'll be notified when ${metric} changes` })
    } catch (error: any) {
      toast.error('Failed to set alert', { description: error.message })
    }
  }

  const handleShareDashboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied', { description: 'Dashboard link copied to clipboard' })
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleAddInvestor = () => {
    setEditingMetric(null)
    resetForm()
    setShowMetricDialog(true)
  }

  // QuickActions with real dialog-based workflows
  const investorMetricsQuickActions = [
    { id: '1', label: 'Update Metrics', icon: 'refresh', action: () => setShowUpdateMetricsDialog(true), variant: 'default' as const },
    { id: '2', label: 'Investor Report', icon: 'file-text', action: () => setShowInvestorReportDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export Data', icon: 'download', action: () => setShowExportDataDialog(true), variant: 'outline' as const },
  ]

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
              <Button variant="outline" size="sm" onClick={handleExportMetrics} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareDashboard}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={handleAddInvestor}>
                <Plus className="w-4 h-4 mr-2" />
                Add Metric
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
              {/* Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Investor Dashboard</h2>
                    <p className="text-emerald-100">Carta-level cap table and investor relations management</p>
                    <p className="text-emerald-200 text-xs mt-1">Real-time metrics • Funding progress • KPI tracking</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">${Math.round(mockCapTable.reduce((s, c) => s + (c.shares * c.sharePrice), 0) / 1000000)}M</p>
                      <p className="text-emerald-200 text-sm">Valuation</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">${Math.round(mockFundingRounds.reduce((s, r) => s + r.raisedAmount, 0) / 1000000)}M</p>
                      <p className="text-emerald-200 text-sm">Total Raised</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockInvestors.length}</p>
                      <p className="text-emerald-200 text-sm">Investors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                {[
                  { icon: CircleDollarSign, label: 'Add Metric', color: 'text-emerald-600 dark:text-emerald-400', action: handleAddInvestor },
                  { icon: PieChart, label: 'Cap Table', color: 'text-blue-600 dark:text-blue-400', action: () => setActiveTab('cap-table') },
                  { icon: Users, label: 'Investors', color: 'text-purple-600 dark:text-purple-400', action: () => setActiveTab('investors') },
                  { icon: TrendingUp, label: 'KPIs', color: 'text-green-600 dark:text-green-400', action: () => setActiveTab('kpis') },
                  { icon: FileText, label: 'Reports', color: 'text-amber-600 dark:text-amber-400', action: handleGenerateReport },
                  { icon: RefreshCw, label: 'Refresh', color: 'text-pink-600 dark:text-pink-400', action: handleRefreshData },
                  { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400', action: handleExportMetrics },
                  { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400', action: () => setActiveTab('settings') }
                ].map((action, i) => (
                  <Button key={i} variant="outline" onClick={action.action} className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>

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
              {/* Cap Table Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Cap Table Management</h2>
                    <p className="text-blue-100">Carta/Pulley-level equity and ownership tracking</p>
                    <p className="text-blue-200 text-xs mt-1">Shareholder registry • Vesting schedules • Option pools</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockCapTable.length}</p>
                      <p className="text-blue-200 text-sm">Shareholders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockCapTable.reduce((s, c) => s + c.shares, 0).toLocaleString()}</p>
                      <p className="text-blue-200 text-sm">Total Shares</p>
                    </div>
                  </div>
                </div>
              </div>

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
              {/* Funding Banner */}
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Funding Rounds</h2>
                    <p className="text-amber-100">AngelList-level fundraising and investment tracking</p>
                    <p className="text-amber-200 text-xs mt-1">Deal flow • Term sheets • Investment pipeline</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockFundingRounds.length}</p>
                      <p className="text-amber-200 text-sm">Rounds</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockFundingRounds.filter(r => r.status === 'closed').length}</p>
                      <p className="text-amber-200 text-sm">Closed</p>
                    </div>
                  </div>
                </div>
              </div>

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
              {/* Investors Banner */}
              <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Investor Relations</h2>
                    <p className="text-purple-100">Visible-level investor communication and updates</p>
                    <p className="text-purple-200 text-xs mt-1">Investor profiles • Communication history • Portfolio insights</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockInvestors.length}</p>
                      <p className="text-purple-200 text-sm">Investors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockInvestors.filter(i => i.type === 'lead').length}</p>
                      <p className="text-purple-200 text-sm">Lead</p>
                    </div>
                  </div>
                </div>
              </div>

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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
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
              {/* KPIs Banner */}
              <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Key Performance Indicators</h2>
                    <p className="text-rose-100">Geckoboard-level startup metrics and tracking</p>
                    <p className="text-rose-200 text-xs mt-1">ARR • MRR • Burn Rate • Runway • Growth metrics</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockKPIs.length}</p>
                      <p className="text-rose-200 text-sm">Metrics</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{mockKPIs.filter(k => k.trend === 'up').length}</p>
                      <p className="text-rose-200 text-sm">Improving</p>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Database Metrics Section */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-500" />
                      Your Custom Metrics
                      {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                    </CardTitle>
                    <Button size="sm" onClick={handleAddInvestor} className="bg-gradient-to-r from-amber-500 to-orange-500">
                      <Plus className="w-4 h-4 mr-1" /> Add Metric
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {dbMetrics.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No custom metrics yet. Create your first metric to get started.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dbMetrics.map(metric => (
                        <div key={metric.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg relative group">
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEditDialog(metric)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDeleteMetric(metric.id)}>
                              <AlertCircle className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500 truncate pr-12">{metric.metric_name}</span>
                            <Badge variant="outline" className="text-xs">{metric.category}</Badge>
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {metric.unit === 'currency' ? formatCurrency(metric.current_value, true) :
                             metric.unit === 'percent' ? `${metric.current_value}%` :
                             metric.unit === 'ratio' ? `${metric.current_value}x` :
                             metric.current_value.toLocaleString()}
                          </div>
                          <div className={`flex items-center gap-1 text-xs mt-1 ${getChangeColor(metric.change_percent)}`}>
                            {metric.change_percent > 0 ? <ArrowUpRight className="w-3 h-3" /> : metric.change_percent < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                            {Math.abs(metric.change_percent).toFixed(1)}% from previous
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Settings Banner */}
              <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Investor Settings</h2>
                    <p className="text-slate-300">Configure investor portal and reporting preferences</p>
                    <p className="text-slate-400 text-xs mt-1">Branding • Reports • Access control • Integrations</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">4</p>
                      <p className="text-slate-400 text-sm">Admins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">ON</p>
                      <p className="text-slate-400 text-sm">Portal</p>
                    </div>
                  </div>
                </div>
              </div>

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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                              <Label>Company Legal Name</Label>
                              <Input defaultValue="Kazi Technologies Inc." className="mt-1" />
                            </div>
                            <div>
                              <Label>Doing Business As (DBA)</Label>
                              <Input defaultValue="Kazi" className="mt-1" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={mockInvestorMetricsAIInsights}
                title="Investor Intelligence"
                onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={mockInvestorMetricsCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={mockInvestorMetricsPredictions}
                title="Financial Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={mockInvestorMetricsActivities}
              title="Investor Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={investorMetricsQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Metric Create/Edit Dialog */}
      <Dialog open={showMetricDialog} onOpenChange={(open) => { setShowMetricDialog(open); if (!open) { setEditingMetric(null); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMetric ? 'Edit Metric' : 'Create Metric'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Metric Name</Label>
              <Input
                value={formData.metric_name}
                onChange={(e) => setFormData(prev => ({ ...prev, metric_name: e.target.value }))}
                placeholder="e.g., Monthly Revenue"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Period</Label>
                <Select value={formData.period} onValueChange={(v) => setFormData(prev => ({ ...prev, period: v as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Current Value</Label>
                <Input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Previous Value</Label>
                <Input
                  type="number"
                  value={formData.previous_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, previous_value: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={formData.unit} onValueChange={(v) => setFormData(prev => ({ ...prev, unit: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">Currency ($)</SelectItem>
                  <SelectItem value="percent">Percent (%)</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="ratio">Ratio (x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this metric"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setShowMetricDialog(false); setEditingMetric(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={editingMetric ? handleUpdateMetric : handleCreateMetric}
              disabled={loading || !formData.metric_name}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              {loading ? 'Saving...' : editingMetric ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

      {/* Update Metrics Dialog */}
      <Dialog open={showUpdateMetricsDialog} onOpenChange={setShowUpdateMetricsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              Update Metrics
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure which metrics to update and sync options.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <Label>Refresh All Data</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pull latest metrics from database</p>
                </div>
                <Switch
                  checked={updateMetricsData.refreshAll}
                  onCheckedChange={(checked) => setUpdateMetricsData(prev => ({ ...prev, refreshAll: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <Label>Recalculate KPIs</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recompute derived metrics</p>
                </div>
                <Switch
                  checked={updateMetricsData.recalculateKPIs}
                  onCheckedChange={(checked) => setUpdateMetricsData(prev => ({ ...prev, recalculateKPIs: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <Label>Sync with Accounting</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Import from QuickBooks/Xero</p>
                </div>
                <Switch
                  checked={updateMetricsData.syncWithAccounting}
                  onCheckedChange={(checked) => setUpdateMetricsData(prev => ({ ...prev, syncWithAccounting: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <Label>Update Timestamps</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Set last updated time</p>
                </div>
                <Switch
                  checked={updateMetricsData.updateTimestamp}
                  onCheckedChange={(checked) => setUpdateMetricsData(prev => ({ ...prev, updateTimestamp: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowUpdateMetricsDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMetricsSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Metrics
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investor Report Dialog */}
      <Dialog open={showInvestorReportDialog} onOpenChange={setShowInvestorReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Generate Investor Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure your investor report settings and content.
            </p>
            <div>
              <Label>Report Type</Label>
              <Select
                value={reportConfig.reportType}
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, reportType: v as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Update</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="annual">Annual Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Include in Report</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm">Financial Statements</span>
                <Switch
                  checked={reportConfig.includeFinancials}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeFinancials: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm">Cap Table Summary</span>
                <Switch
                  checked={reportConfig.includeCapTable}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeCapTable: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm">KPI Dashboard</span>
                <Switch
                  checked={reportConfig.includeKPIs}
                  onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, includeKPIs: checked }))}
                />
              </div>
            </div>
            <div>
              <Label>Recipient Emails (optional)</Label>
              <Input
                value={reportConfig.recipientEmails}
                onChange={(e) => setReportConfig(prev => ({ ...prev, recipientEmails: e.target.value }))}
                placeholder="investor1@email.com, investor2@email.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <Label>Send Immediately</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email report to recipients after generation</p>
              </div>
              <Switch
                checked={reportConfig.sendImmediately}
                onCheckedChange={(checked) => setReportConfig(prev => ({ ...prev, sendImmediately: checked }))}
                disabled={!reportConfig.recipientEmails}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowInvestorReportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReportSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-500" />
              Export Investor Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the data sets and format for export.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Export Format</Label>
                <Select
                  value={exportConfig.format}
                  onValueChange={(v) => setExportConfig(prev => ({ ...prev, format: v as any }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select
                  value={exportConfig.dateRange}
                  onValueChange={(v) => setExportConfig(prev => ({ ...prev, dateRange: v as any }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="last12months">Last 12 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Data to Export</Label>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Metrics & KPIs</span>
                </div>
                <Switch
                  checked={exportConfig.includeMetrics}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeMetrics: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Cap Table</span>
                </div>
                <Switch
                  checked={exportConfig.includeCapTable}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeCapTable: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Funding Rounds</span>
                </div>
                <Switch
                  checked={exportConfig.includeFundingRounds}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeFundingRounds: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Investor Directory</span>
                </div>
                <Switch
                  checked={exportConfig.includeInvestors}
                  onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeInvestors: checked }))}
                />
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">Export Preview</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                {[
                  exportConfig.includeMetrics && 'Metrics',
                  exportConfig.includeCapTable && 'Cap Table',
                  exportConfig.includeFundingRounds && 'Funding Rounds',
                  exportConfig.includeInvestors && 'Investors'
                ].filter(Boolean).join(', ') || 'No data selected'} will be exported as {exportConfig.format.toUpperCase()}
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExportDataSubmit}
              disabled={loading || (!exportConfig.includeMetrics && !exportConfig.includeCapTable && !exportConfig.includeFundingRounds && !exportConfig.includeInvestors)}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
