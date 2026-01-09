'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Heart,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  Search,
  Plus,
  Phone,
  Mail,
  Video,
  MessageSquare,
  Target,
  Clock,
  RefreshCcw,
  Building2,
  Star,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  FileText,
  Settings,
  Bell,
  ChevronRight,
  Sparkles,
  Shield,
  Gauge,
  Layers,
  Download,
  Headphones,
  Trophy,
  Gift,
  Handshake,
  GraduationCap,
  BookOpen,
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

import { downloadAsCsv, apiPost } from '@/lib/button-handlers'




import { Switch } from '@/components/ui/switch'
import { CardDescription } from '@/components/ui/card'

// Types
type HealthStatus = 'healthy' | 'good' | 'concerning' | 'at_risk' | 'critical' | 'churned'
type AccountTier = 'enterprise' | 'business' | 'professional' | 'starter' | 'trial'
type EngagementLevel = 'champion' | 'active' | 'passive' | 'disengaged' | 'churning'
type RenewalRisk = 'low' | 'medium' | 'high' | 'critical'
type TouchpointType = 'call' | 'email' | 'meeting' | 'qbr' | 'support' | 'onboarding'

interface CSM {
  id: string
  name: string
  avatar: string
  email: string
  accounts: number
  arr: number
}

interface Touchpoint {
  id: string
  type: TouchpointType
  date: string
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  csmId: string
}

interface HealthTrend {
  date: string
  score: number
}

interface UsageMetric {
  feature: string
  adoption: number
  trend: number
  benchmark: number
}

interface Risk {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
  status: 'open' | 'mitigated' | 'resolved'
}

interface Opportunity {
  id: string
  type: 'upsell' | 'cross-sell' | 'expansion'
  product: string
  value: number
  probability: number
  stage: string
}

interface Customer {
  id: string
  name: string
  logo: string
  industry: string
  size: string
  tier: AccountTier
  healthScore: number
  healthStatus: HealthStatus
  healthTrend: HealthTrend[]
  engagementLevel: EngagementLevel
  csm: CSM
  mrr: number
  arr: number
  nps: number
  csat: number
  renewalDate: string
  daysToRenewal: number
  renewalRisk: RenewalRisk
  lifetimeValue: number
  contractStart: string
  touchpoints: Touchpoint[]
  usageMetrics: UsageMetric[]
  risks: Risk[]
  opportunities: Opportunity[]
  keyContacts: { name: string; role: string; email: string; champion: boolean }[]
  milestones: { name: string; date: string; completed: boolean }[]
  tags: string[]
}

interface Playbook {
  id: string
  name: string
  trigger: string
  steps: { order: number; action: string; timing: string }[]
  successRate: number
  activeAccounts: number
}

// Mock Data
const mockCSMs: CSM[] = [
  { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', email: 'sarah@company.com', accounts: 45, arr: 2500000 },
  { id: '2', name: 'Mike Johnson', avatar: '/avatars/mike.jpg', email: 'mike@company.com', accounts: 38, arr: 1800000 },
  { id: '3', name: 'Emily Davis', avatar: '/avatars/emily.jpg', email: 'emily@company.com', accounts: 52, arr: 3200000 },
]

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    logo: '/logos/acme.png',
    industry: 'Technology',
    size: 'Enterprise (5000+)',
    tier: 'enterprise',
    healthScore: 92,
    healthStatus: 'healthy',
    healthTrend: [
      { date: '2024-01', score: 85 },
      { date: '2024-02', score: 88 },
      { date: '2024-03', score: 92 }
    ],
    engagementLevel: 'champion',
    csm: mockCSMs[0],
    mrr: 45000,
    arr: 540000,
    nps: 9,
    csat: 95,
    renewalDate: '2024-12-15',
    daysToRenewal: 265,
    renewalRisk: 'low',
    lifetimeValue: 1620000,
    contractStart: '2021-12-15',
    touchpoints: [
      { id: '1', type: 'qbr', date: '2024-03-15', summary: 'Q1 Business Review - Strong adoption', sentiment: 'positive', csmId: '1' },
      { id: '2', type: 'call', date: '2024-03-10', summary: 'Expansion discussion', sentiment: 'positive', csmId: '1' }
    ],
    usageMetrics: [
      { feature: 'Dashboard', adoption: 95, trend: 5, benchmark: 80 },
      { feature: 'Reports', adoption: 88, trend: 3, benchmark: 70 },
      { feature: 'API', adoption: 75, trend: 10, benchmark: 50 },
      { feature: 'Integrations', adoption: 60, trend: -2, benchmark: 45 }
    ],
    risks: [],
    opportunities: [
      { id: '1', type: 'expansion', product: 'Enterprise Add-on', value: 120000, probability: 80, stage: 'Proposal' }
    ],
    keyContacts: [
      { name: 'John Smith', role: 'VP Engineering', email: 'john@acme.com', champion: true },
      { name: 'Lisa Wong', role: 'Product Manager', email: 'lisa@acme.com', champion: false }
    ],
    milestones: [
      { name: 'Onboarding Complete', date: '2022-01-15', completed: true },
      { name: 'First Value Realization', date: '2022-02-28', completed: true },
      { name: 'Expansion Discussion', date: '2024-04-01', completed: false }
    ],
    tags: ['strategic', 'reference-able', 'high-growth']
  },
  {
    id: '2',
    name: 'GlobalTech Inc',
    logo: '/logos/globaltech.png',
    industry: 'Financial Services',
    size: 'Mid-Market (500-5000)',
    tier: 'business',
    healthScore: 65,
    healthStatus: 'concerning',
    healthTrend: [
      { date: '2024-01', score: 78 },
      { date: '2024-02', score: 72 },
      { date: '2024-03', score: 65 }
    ],
    engagementLevel: 'passive',
    csm: mockCSMs[1],
    mrr: 18000,
    arr: 216000,
    nps: 6,
    csat: 72,
    renewalDate: '2024-06-30',
    daysToRenewal: 97,
    renewalRisk: 'high',
    lifetimeValue: 432000,
    contractStart: '2022-06-30',
    touchpoints: [
      { id: '3', type: 'support', date: '2024-03-18', summary: 'Multiple support tickets', sentiment: 'negative', csmId: '2' },
      { id: '4', type: 'email', date: '2024-03-12', summary: 'Check-in email - no response', sentiment: 'neutral', csmId: '2' }
    ],
    usageMetrics: [
      { feature: 'Dashboard', adoption: 45, trend: -15, benchmark: 80 },
      { feature: 'Reports', adoption: 30, trend: -8, benchmark: 70 },
      { feature: 'API', adoption: 15, trend: -5, benchmark: 50 },
      { feature: 'Integrations', adoption: 10, trend: 0, benchmark: 45 }
    ],
    risks: [
      { id: '1', type: 'Low Engagement', severity: 'high', description: 'Usage dropped 30% in 60 days', mitigation: 'Schedule executive review', status: 'open' },
      { id: '2', type: 'Champion Left', severity: 'critical', description: 'Primary champion moved to new role', mitigation: 'Identify new champion', status: 'open' }
    ],
    opportunities: [],
    keyContacts: [
      { name: 'Robert Chen', role: 'CTO', email: 'robert@globaltech.com', champion: false },
      { name: 'Amy Taylor', role: 'Director IT', email: 'amy@globaltech.com', champion: false }
    ],
    milestones: [
      { name: 'Onboarding Complete', date: '2022-07-15', completed: true },
      { name: 'First Value Realization', date: '2022-09-01', completed: true },
      { name: 'Renewal Discussion', date: '2024-04-01', completed: false }
    ],
    tags: ['at-risk', 'needs-attention']
  },
  {
    id: '3',
    name: 'InnovateCo',
    logo: '/logos/innovateco.png',
    industry: 'Healthcare',
    size: 'Enterprise (5000+)',
    tier: 'enterprise',
    healthScore: 88,
    healthStatus: 'healthy',
    healthTrend: [
      { date: '2024-01', score: 82 },
      { date: '2024-02', score: 85 },
      { date: '2024-03', score: 88 }
    ],
    engagementLevel: 'active',
    csm: mockCSMs[2],
    mrr: 62000,
    arr: 744000,
    nps: 8,
    csat: 90,
    renewalDate: '2024-09-30',
    daysToRenewal: 189,
    renewalRisk: 'low',
    lifetimeValue: 2232000,
    contractStart: '2021-09-30',
    touchpoints: [
      { id: '5', type: 'meeting', date: '2024-03-20', summary: 'Product roadmap review', sentiment: 'positive', csmId: '3' }
    ],
    usageMetrics: [
      { feature: 'Dashboard', adoption: 92, trend: 2, benchmark: 80 },
      { feature: 'Reports', adoption: 85, trend: 5, benchmark: 70 },
      { feature: 'API', adoption: 70, trend: 8, benchmark: 50 },
      { feature: 'Integrations', adoption: 55, trend: 12, benchmark: 45 }
    ],
    risks: [],
    opportunities: [
      { id: '2', type: 'upsell', product: 'Analytics Pro', value: 84000, probability: 60, stage: 'Discovery' }
    ],
    keyContacts: [
      { name: 'Dr. Sarah Mitchell', role: 'Chief Digital Officer', email: 'sarah@innovateco.com', champion: true }
    ],
    milestones: [
      { name: 'Onboarding Complete', date: '2021-10-30', completed: true },
      { name: 'First Value Realization', date: '2021-12-15', completed: true }
    ],
    tags: ['healthcare', 'expansion-ready']
  },
  {
    id: '4',
    name: 'StartupXYZ',
    logo: '/logos/startupxyz.png',
    industry: 'Technology',
    size: 'SMB (<500)',
    tier: 'starter',
    healthScore: 78,
    healthStatus: 'good',
    healthTrend: [
      { date: '2024-01', score: 70 },
      { date: '2024-02', score: 75 },
      { date: '2024-03', score: 78 }
    ],
    engagementLevel: 'active',
    csm: mockCSMs[0],
    mrr: 2500,
    arr: 30000,
    nps: 8,
    csat: 85,
    renewalDate: '2024-08-15',
    daysToRenewal: 143,
    renewalRisk: 'low',
    lifetimeValue: 60000,
    contractStart: '2023-08-15',
    touchpoints: [
      { id: '6', type: 'onboarding', date: '2024-03-01', summary: 'Onboarding kickoff', sentiment: 'positive', csmId: '1' }
    ],
    usageMetrics: [
      { feature: 'Dashboard', adoption: 80, trend: 10, benchmark: 80 },
      { feature: 'Reports', adoption: 65, trend: 15, benchmark: 70 },
      { feature: 'API', adoption: 40, trend: 20, benchmark: 50 },
      { feature: 'Integrations', adoption: 30, trend: 8, benchmark: 45 }
    ],
    risks: [],
    opportunities: [
      { id: '3', type: 'upsell', product: 'Team Plan', value: 12000, probability: 70, stage: 'Qualified' }
    ],
    keyContacts: [
      { name: 'Alex Rivera', role: 'CEO', email: 'alex@startupxyz.com', champion: true }
    ],
    milestones: [
      { name: 'Onboarding Complete', date: '2023-09-01', completed: true }
    ],
    tags: ['high-potential', 'fast-growing']
  }
]

const mockPlaybooks: Playbook[] = [
  {
    id: '1',
    name: 'At-Risk Recovery',
    trigger: 'Health score drops below 70',
    steps: [
      { order: 1, action: 'Send personalized check-in email', timing: 'Day 1' },
      { order: 2, action: 'Schedule discovery call', timing: 'Day 3' },
      { order: 3, action: 'Create action plan', timing: 'Day 7' },
      { order: 4, action: 'Executive escalation if needed', timing: 'Day 14' }
    ],
    successRate: 72,
    activeAccounts: 8
  },
  {
    id: '2',
    name: 'Renewal Preparation',
    trigger: '90 days before renewal',
    steps: [
      { order: 1, action: 'Review account health and usage', timing: 'Day 1' },
      { order: 2, action: 'Schedule renewal discussion', timing: 'Day 7' },
      { order: 3, action: 'Prepare value realization report', timing: 'Day 14' },
      { order: 4, action: 'QBR presentation', timing: 'Day 30' }
    ],
    successRate: 95,
    activeAccounts: 12
  },
  {
    id: '3',
    name: 'Expansion Play',
    trigger: 'Health score above 85 + high usage',
    steps: [
      { order: 1, action: 'Identify expansion opportunities', timing: 'Day 1' },
      { order: 2, action: 'Share success story/case study', timing: 'Day 3' },
      { order: 3, action: 'Product demo of new features', timing: 'Day 10' },
      { order: 4, action: 'Commercial discussion', timing: 'Day 20' }
    ],
    successRate: 45,
    activeAccounts: 15
  }
]

// Enhanced Competitive Upgrade Mock Data
const mockCSAIInsights = [
  { id: '1', type: 'success' as const, title: 'Customer Health', description: '87% of accounts in healthy status. NPS score: 72.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'warning' as const, title: 'Churn Risk', description: '3 enterprise accounts showing declining engagement.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Churn' },
  { id: '3', type: 'info' as const, title: 'Expansion Opportunity', description: '8 accounts ready for upsell conversation.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Growth' },
]

const mockCSCollaborators = [
  { id: '1', name: 'CS Manager', avatar: '/avatars/csm.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Account Exec', avatar: '/avatars/ae.jpg', status: 'online' as const, role: 'AE' },
  { id: '3', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockCSPredictions = [
  { id: '1', title: 'Renewal Forecast', prediction: '95% renewal rate expected this quarter', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Support Volume', prediction: 'Ticket volume expected to decrease 15% with new onboarding', confidence: 76, trend: 'down' as const, impact: 'medium' as const },
]

const mockCSActivities = [
  { id: '1', user: 'CS Manager', action: 'Completed', target: 'QBR with Acme Corp', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Account Exec', action: 'Scheduled', target: 'expansion call with TechStart', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Detected', target: 'usage spike at GlobalTech', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Helper function for exporting customer success data
function exportCustomerSuccessData(customers: Customer[]) {
  const exportData = customers.map(c => ({
    Name: c.name,
    Industry: c.industry,
    Tier: c.tier,
    HealthScore: c.healthScore,
    HealthStatus: c.healthStatus,
    ARR: c.arr,
    MRR: c.mrr,
    NPS: c.nps,
    CSAT: c.csat,
    RenewalDate: c.renewalDate,
    DaysToRenewal: c.daysToRenewal,
    RenewalRisk: c.renewalRisk,
    LTV: c.lifetimeValue,
    CSM: c.csm.name,
    RisksCount: c.risks.length,
    OpportunitiesCount: c.opportunities.length,
    Tags: c.tags.join('; ')
  }))

  downloadAsCsv(exportData, `customer-success-report-${new Date().toISOString().split('T')[0]}.csv`)
}

// Helper function for creating playbook via API
async function createPlaybook() {
  const result = await apiPost('/api/playbooks', {
    name: 'New Playbook',
    trigger: 'Custom trigger',
    steps: [],
    successRate: 0,
    activeAccounts: 0
  }, {
    loading: 'Creating playbook...',
    success: 'Playbook created! Add triggers and actions',
    error: 'Failed to create playbook'
  })
  return result
}

// Helper function for generating health report
function generateHealthReport(customers: Customer[]) {
  const healthyCount = customers.filter(c => c.healthStatus === 'healthy').length
  const atRiskCount = customers.filter(c => c.healthStatus === 'at_risk' || c.healthStatus === 'critical').length
  const churningCount = customers.filter(c => c.healthStatus === 'churned').length

  const healthyPercent = Math.round((healthyCount / customers.length) * 100)
  const atRiskPercent = Math.round((atRiskCount / customers.length) * 100)
  const churningPercent = Math.round((churningCount / customers.length) * 100)

  toast.success(`Customer Health Report - ${healthyPercent}% healthy - ${atRiskPercent}% at-risk - ${churningPercent}% churning`)
}

export default function CustomerSuccessClient() {
  const [customers] = useState<Customer[]>(mockCustomers)
  const [csms] = useState<CSM[]>(mockCSMs)
  const [playbooks] = useState<Playbook[]>(mockPlaybooks)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<AccountTier | 'all'>('all')
  const [selectedHealth, setSelectedHealth] = useState<HealthStatus | 'all'>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState('portfolio')
  const [settingsTab, setSettingsTab] = useState('general')
  const [showTriggersDialog, setShowTriggersDialog] = useState(false)
  const [showEnrollmentsDialog, setShowEnrollmentsDialog] = useState(false)

  // Form state for triggers dialog
  const [triggerForm, setTriggerForm] = useState({
    name: '',
    type: 'health_score' as 'health_score' | 'usage_drop' | 'renewal_approaching' | 'nps_change',
    condition: 'below' as 'below' | 'above' | 'equals',
    threshold: 70,
    playbookId: '',
    enabled: true
  })

  // Mock data for enrollments
  const [enrollments] = useState([
    { id: '1', customer: 'Acme Corporation', playbook: 'At-Risk Recovery', status: 'active', startedAt: '2024-03-15', progress: 60 },
    { id: '2', customer: 'GlobalTech Inc', playbook: 'Renewal Preparation', status: 'active', startedAt: '2024-03-10', progress: 30 },
    { id: '3', customer: 'InnovateCo', playbook: 'Expansion Play', status: 'active', startedAt: '2024-03-01', progress: 80 },
    { id: '4', customer: 'StartupXYZ', playbook: 'Onboarding', status: 'completed', startedAt: '2024-02-15', progress: 100 },
  ])

  // Quick actions with real functionality
  const mockCSQuickActions = [
    { id: '1', label: 'New Playbook', icon: 'plus', action: () => createPlaybook(), variant: 'default' as const },
    { id: '2', label: 'Health Report', icon: 'activity', action: () => generateHealthReport(customers), variant: 'default' as const },
    { id: '3', label: 'Export Data', icon: 'download', action: () => exportCustomerSuccessData(customers), variant: 'outline' as const },
  ]

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    let result = customers

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query) ||
        c.csm.name.toLowerCase().includes(query)
      )
    }

    if (selectedTier !== 'all') {
      result = result.filter(c => c.tier === selectedTier)
    }

    if (selectedHealth !== 'all') {
      result = result.filter(c => c.healthStatus === selectedHealth)
    }

    return result.sort((a, b) => {
      // Sort by risk first, then by ARR
      if (a.renewalRisk !== b.renewalRisk) {
        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return riskOrder[a.renewalRisk] - riskOrder[b.renewalRisk]
      }
      return b.arr - a.arr
    })
  }, [customers, searchQuery, selectedTier, selectedHealth])

  // Stats
  const stats = useMemo(() => {
    const totalARR = customers.reduce((sum, c) => sum + c.arr, 0)
    const atRiskARR = customers.filter(c => c.renewalRisk === 'high' || c.renewalRisk === 'critical').reduce((sum, c) => sum + c.arr, 0)
    const avgHealth = customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length
    const avgNPS = customers.reduce((sum, c) => sum + c.nps, 0) / customers.length
    const expansionPipeline = customers.reduce((sum, c) => sum + c.opportunities.reduce((s, o) => s + o.value * (o.probability / 100), 0), 0)
    const renewalsNext90 = customers.filter(c => c.daysToRenewal <= 90).length

    return { totalARR, atRiskARR, avgHealth, avgNPS, expansionPipeline, renewalsNext90 }
  }, [customers])

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthBadgeColor = (status: HealthStatus) => {
    const colors: Record<HealthStatus, string> = {
      healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      concerning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      at_risk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      churned: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status]
  }

  const getTierColor = (tier: AccountTier) => {
    const colors: Record<AccountTier, string> = {
      enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      business: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      professional: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      starter: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      trial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return colors[tier]
  }

  const getRiskColor = (risk: RenewalRisk) => {
    const colors: Record<RenewalRisk, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    }
    return colors[risk]
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  const getTouchpointIcon = (type: TouchpointType) => {
    const icons: Record<TouchpointType, React.ReactNode> = {
      call: <Phone className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      meeting: <Video className="h-4 w-4" />,
      qbr: <FileText className="h-4 w-4" />,
      support: <MessageSquare className="h-4 w-4" />,
      onboarding: <Sparkles className="h-4 w-4" />
    }
    return icons[type]
  }

  // Handlers with real functionality
  const handleScheduleQBR = (customerId: string) => {
    // Open calendar to schedule QBR
    window.open(`/dashboard/calendar?action=schedule&type=qbr&customerId=${customerId}`, '_blank')
    toast.info('Opening calendar to schedule QBR')
  }

  const handleLogInteraction = async (customerId: string) => {
    const result = await apiPost('/api/customer-success/touchpoints', {
      customerId,
      type: 'call',
      date: new Date().toISOString(),
      summary: 'Customer touchpoint',
      sentiment: 'neutral'
    }, {
      loading: 'Logging interaction...',
      success: 'Customer touchpoint recorded',
      error: 'Failed to log interaction'
    })
    return result
  }

  const handleExportReport = () => {
    exportCustomerSuccessData(customers)
  }

  // Contact handlers
  const handleEmailContact = (email: string) => {
    window.location.href = `mailto:${email}`
    toast.success(`Opening email to ${email}`)
  }

  const handleCallContact = (phone: string) => {
    window.location.href = `tel:${phone}`
    toast.success(`Initiating call`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Heart className="h-8 w-8" />
                Customer Success
              </h1>
              <p className="mt-2 text-white/80">
                Drive retention, expansion, and customer outcomes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              <Button className="bg-white text-emerald-600 hover:bg-white/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-6 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{formatCurrency(stats.totalARR)}</div>
              <div className="text-sm text-white/70">Total ARR</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-300">{formatCurrency(stats.atRiskARR)}</div>
              <div className="text-sm text-white/70">At Risk ARR</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.avgHealth.toFixed(0)}</div>
              <div className="text-sm text-white/70">Avg Health Score</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.avgNPS.toFixed(1)}</div>
              <div className="text-sm text-white/70">Avg NPS</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-300">{formatCurrency(stats.expansionPipeline)}</div>
              <div className="text-sm text-white/70">Expansion Pipeline</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-300">{stats.renewalsNext90}</div>
              <div className="text-sm text-white/70">Renewals (90 days)</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800">
            <TabsTrigger value="portfolio" className="gap-2">
              <Building2 className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Gauge className="h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="renewals" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Renewals
            </TabsTrigger>
            <TabsTrigger value="playbooks" className="gap-2">
              <Layers className="h-4 w-4" />
              Playbooks
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              CSM Team
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Customer Portfolio</h2>
                    <p className="text-emerald-100">{customers.length} customers • {formatCurrency(stats.totalARR)} ARR</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.avgHealth.toFixed(0)}</p>
                    <p className="text-emerald-100 text-sm">Avg Health</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'Add Customer', desc: 'New account', color: 'text-emerald-500' },
                { icon: Phone, label: 'Schedule Call', desc: 'Book meeting', color: 'text-blue-500' },
                { icon: Mail, label: 'Send Campaign', desc: 'Email blast', color: 'text-purple-500' },
                { icon: Target, label: 'Set Goals', desc: 'Define targets', color: 'text-amber-500' },
                { icon: Trophy, label: 'Recognize', desc: 'Customer wins', color: 'text-pink-500' },
                { icon: Gift, label: 'Send Gift', desc: 'Appreciation', color: 'text-red-500' },
                { icon: FileText, label: 'Report', desc: 'Generate report', color: 'text-cyan-500' },
                { icon: Handshake, label: 'Introduce', desc: 'Make intro', color: 'text-green-500' },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value as AccountTier | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Tiers</option>
                      <option value="enterprise">Enterprise</option>
                      <option value="business">Business</option>
                      <option value="professional">Professional</option>
                      <option value="starter">Starter</option>
                    </select>

                    <select
                      value={selectedHealth}
                      onChange={(e) => setSelectedHealth(e.target.value as HealthStatus | 'all')}
                      className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Health</option>
                      <option value="healthy">Healthy</option>
                      <option value="good">Good</option>
                      <option value="concerning">Concerning</option>
                      <option value="at_risk">At Risk</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer List */}
            <div className="space-y-4">
              {filteredCustomers.map(customer => (
                <Card
                  key={customer.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                            {customer.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <Badge className={getTierColor(customer.tier)}>{customer.tier}</Badge>
                            <Badge className={getHealthBadgeColor(customer.healthStatus)}>
                              {customer.healthStatus.replace('_', ' ')}
                            </Badge>
                            {customer.risks.length > 0 && (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {customer.risks.length} risks
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{customer.industry}</span>
                            <span>|</span>
                            <span>{customer.size}</span>
                            <span>|</span>
                            <span>CSM: {customer.csm.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getHealthColor(customer.healthScore)}`}>
                            {customer.healthScore}
                          </div>
                          <div className="text-xs text-gray-500">Health</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{formatCurrency(customer.arr)}</div>
                          <div className="text-xs text-gray-500">ARR</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-xl font-bold ${getRiskColor(customer.renewalRisk)}`}>
                            {customer.daysToRenewal}d
                          </div>
                          <div className="text-xs text-gray-500">To Renewal</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <div className="text-xs text-gray-500">NPS</div>
                        <div className="font-semibold">{customer.nps}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">CSAT</div>
                        <div className="font-semibold">{customer.csat}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">LTV</div>
                        <div className="font-semibold">{formatCurrency(customer.lifetimeValue)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Expansion</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(customer.opportunities.reduce((sum, o) => sum + o.value, 0))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            {/* Health Overview Banner */}
            <div className="bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Gauge className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Customer Health</h2>
                    <p className="text-green-100">Monitor health scores and engagement</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{customers.filter(c => c.healthStatus === 'healthy').length}</p>
                    <p className="text-green-100 text-sm">Healthy</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleExportReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['healthy', 'good', 'concerning', 'at_risk', 'critical'].map(status => {
                        const count = customers.filter(c => c.healthStatus === status).length
                        const percentage = (count / customers.length) * 100
                        return (
                          <div key={status} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="capitalize">{status.replace('_', ' ')}</span>
                              <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accounts Needing Attention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customers.filter(c => c.healthStatus === 'at_risk' || c.healthStatus === 'critical' || c.healthStatus === 'concerning').map(customer => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`text-2xl font-bold ${getHealthColor(customer.healthScore)}`}>
                              {customer.healthScore}
                            </div>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.risks.length} active risks</div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleQBR(customer.id)}
                          >
                            Take Action
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Improving</span>
                        <span className="font-semibold text-green-600">
                          {customers.filter(c => {
                            const trend = c.healthTrend
                            return trend.length >= 2 && trend[trend.length - 1].score > trend[trend.length - 2].score
                          }).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stable</span>
                        <span className="font-semibold text-gray-600">
                          {customers.filter(c => {
                            const trend = c.healthTrend
                            return trend.length >= 2 && trend[trend.length - 1].score === trend[trend.length - 2].score
                          }).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Declining</span>
                        <span className="font-semibold text-red-600">
                          {customers.filter(c => {
                            const trend = c.healthTrend
                            return trend.length >= 2 && trend[trend.length - 1].score < trend[trend.length - 2].score
                          }).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['critical', 'high', 'medium', 'low'].map(severity => {
                        const count = customers.reduce((sum, c) => sum + c.risks.filter(r => r.severity === severity && r.status === 'open').length, 0)
                        return (
                          <div key={severity} className="flex items-center justify-between">
                            <Badge className={
                              severity === 'critical' ? 'bg-red-100 text-red-700' :
                              severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {severity}
                            </Badge>
                            <span className="font-semibold">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="renewals" className="space-y-6">
            {/* Renewals Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <RefreshCcw className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Renewal Management</h2>
                    <p className="text-blue-100">{stats.renewalsNext90} renewals in 90 days • {formatCurrency(stats.atRiskARR)} at risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{customers.filter(c => c.renewalRisk === 'low').length}</p>
                    <p className="text-blue-100 text-sm">On Track</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => window.open('/dashboard/calendar?view=renewals', '_blank')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {[30, 60, 90, 180].map(days => {
                const renewals = customers.filter(c => c.daysToRenewal <= days)
                const totalARR = renewals.reduce((sum, c) => sum + c.arr, 0)
                return (
                  <Card key={days}>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500">Next {days} Days</div>
                      <div className="text-2xl font-bold">{renewals.length}</div>
                      <div className="text-sm text-emerald-600">{formatCurrency(totalARR)}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Renewals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .sort((a, b) => a.daysToRenewal - b.daysToRenewal)
                    .map(customer => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold ${getRiskColor(customer.renewalRisk)}`}>
                            {customer.daysToRenewal}d
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              Renews {new Date(customer.renewalDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(customer.arr)}</div>
                            <Badge className={
                              customer.renewalRisk === 'low' ? 'bg-green-100 text-green-700' :
                              customer.renewalRisk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              customer.renewalRisk === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {customer.renewalRisk} risk
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleQBR(customer.id)}
                          >
                            Prepare
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playbooks" className="space-y-6">
            {/* Playbooks Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layers className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Success Playbooks</h2>
                    <p className="text-orange-100">{playbooks.length} playbooks • {playbooks.reduce((sum, p) => sum + p.activeAccounts, 0)} active enrollments</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{(playbooks.reduce((sum, p) => sum + p.successRate, 0) / playbooks.length).toFixed(0)}%</p>
                    <p className="text-orange-100 text-sm">Avg Success Rate</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => createPlaybook()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'New Playbook', desc: 'Create new', color: 'text-orange-500', action: () => createPlaybook() },
                { icon: BookOpen, label: 'Templates', desc: 'Start fast', color: 'text-blue-500', action: () => window.open('/dashboard/templates?type=playbook', '_blank') },
                { icon: Target, label: 'Set Triggers', desc: 'Automation', color: 'text-purple-500', action: () => setShowTriggersDialog(true) },
                { icon: BarChart3, label: 'Analytics', desc: 'Performance', color: 'text-green-500', action: () => window.open('/dashboard/analytics?view=playbooks', '_blank') },
                { icon: Users, label: 'Enrollments', desc: 'Active runs', color: 'text-pink-500', action: () => setShowEnrollmentsDialog(true) },
                { icon: Clock, label: 'Schedule', desc: 'Timing', color: 'text-amber-500', action: () => window.open('/dashboard/calendar?view=playbooks', '_blank') },
                { icon: GraduationCap, label: 'Training', desc: 'Best practices', color: 'text-cyan-500', action: () => window.open('/dashboard/help-center?topic=playbooks', '_blank') },
                { icon: Download, label: 'Export', desc: 'Share playbook', color: 'text-gray-500', action: () => {
                  const exportData = playbooks.map(p => ({
                    Name: p.name,
                    Trigger: p.trigger,
                    Steps: p.steps.length,
                    SuccessRate: p.successRate,
                    ActiveAccounts: p.activeAccounts
                  }))
                  downloadAsCsv(exportData, 'playbooks-export.csv')
                }},
              ].map((action, i) => (
                <Card
                  key={i}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={action.action}
                >
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Playbooks</h2>
              <Button onClick={() => createPlaybook()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Playbook
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {playbooks.map(playbook => (
                <Card key={playbook.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{playbook.name}</CardTitle>
                      <Badge variant="secondary">{playbook.activeAccounts} active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Trigger:</span> {playbook.trigger}
                    </div>

                    <div className="space-y-2">
                      {playbook.steps.map(step => (
                        <div key={step.order} className="flex items-start gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium">
                            {step.order}
                          </div>
                          <div className="flex-1">
                            <div>{step.action}</div>
                            <div className="text-xs text-gray-400">{step.timing}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Success Rate:</span>
                        <span className="font-semibold text-green-600 ml-1">{playbook.successRate}%</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/dashboard/playbooks/${playbook.id}/edit`, '_blank')}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            {/* Team Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">CSM Team</h2>
                    <p className="text-pink-100">{csms.length} CSMs • {formatCurrency(csms.reduce((sum, c) => sum + c.arr, 0))} total ARR</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{csms.reduce((sum, c) => sum + c.accounts, 0)}</p>
                    <p className="text-pink-100 text-sm">Total Accounts</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="h-4 w-4 mr-2" />
                    Add CSM
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {csms.map(csm => (
                <Card key={csm.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg">
                          {csm.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{csm.name}</h3>
                        <div
                          className="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                          onClick={() => handleEmailContact(csm.email)}
                        >
                          {csm.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{csm.accounts}</div>
                        <div className="text-xs text-gray-500">Accounts</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold">{formatCurrency(csm.arr)}</div>
                        <div className="text-xs text-gray-500">Book ARR</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-500 mb-2">Account Health</div>
                      <div className="flex gap-1">
                        {['healthy', 'good', 'concerning', 'at_risk'].map(status => {
                          const count = customers.filter(c => c.csm.id === csm.id && c.healthStatus === status).length
                          return count > 0 ? (
                            <div
                              key={status}
                              className={`flex-1 h-2 rounded ${
                                status === 'healthy' ? 'bg-green-500' :
                                status === 'good' ? 'bg-blue-500' :
                                status === 'concerning' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ flex: count }}
                            />
                          ) : null
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Customer Success Settings</h2>
                    <p className="text-emerald-100">Configure health scoring, alerts, and team settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={handleExportReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <nav className="p-2 space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'health', icon: Gauge, label: 'Health Scoring', desc: 'Score rules' },
                      { id: 'alerts', icon: Bell, label: 'Alerts', desc: 'Alert triggers' },
                      { id: 'integrations', icon: Zap, label: 'Integrations', desc: 'Connect apps' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Email settings' },
                      { id: 'advanced', icon: Shield, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs opacity-70">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>

              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Customer Success Configuration</CardTitle>
                        <CardDescription>Basic CS platform settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default CSM Assignment</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Round Robin</option>
                              <option>Territory Based</option>
                              <option>Manual</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Renewal Window</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>90 days</option>
                              <option>60 days</option>
                              <option>120 days</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-assign New Customers</p>
                            <p className="text-sm text-gray-500">Automatically assign CSM to new accounts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Track Customer Lifecycle</p>
                            <p className="text-sm text-gray-500">Monitor onboarding to renewal</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Touchpoint Settings</CardTitle>
                        <CardDescription>Configure customer interaction tracking</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Log All Communications</p>
                            <p className="text-sm text-gray-500">Auto-log emails and calls</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Sentiment Analysis</p>
                            <p className="text-sm text-gray-500">AI-powered sentiment detection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Health Scoring Settings */}
                {settingsTab === 'health' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Health Score Model</CardTitle>
                        <CardDescription>Configure health score calculation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { metric: 'Product Usage', weight: 30 },
                            { metric: 'NPS Score', weight: 20 },
                            { metric: 'Support Tickets', weight: 15 },
                            { metric: 'Engagement', weight: 20 },
                            { metric: 'Contract Value', weight: 15 },
                          ].map((item) => (
                            <div key={item.metric} className="flex items-center justify-between p-4 border rounded-lg">
                              <span className="font-medium">{item.metric}</span>
                              <Input value={`${item.weight}%`} className="w-20 text-right" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Health Thresholds</CardTitle>
                        <CardDescription>Define health status boundaries</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { status: 'Healthy', min: 80, color: 'green' },
                          { status: 'Good', min: 60, color: 'blue' },
                          { status: 'Concerning', min: 40, color: 'yellow' },
                          { status: 'At Risk', min: 20, color: 'orange' },
                          { status: 'Critical', min: 0, color: 'red' },
                        ].map((item) => (
                          <div key={item.status} className="flex items-center justify-between p-4 border rounded-lg">
                            <span className={`font-medium text-${item.color}-600`}>{item.status}</span>
                            <span className="text-sm text-gray-500">{item.min}+ score</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Alerts Settings */}
                {settingsTab === 'alerts' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Triggers</CardTitle>
                        <CardDescription>Configure automatic alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Health Score Drop</p>
                            <p className="text-sm text-gray-500">Alert when score drops 10+ points</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Renewal Approaching</p>
                            <p className="text-sm text-gray-500">Alert 90 days before renewal</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Champion Left</p>
                            <p className="text-sm text-gray-500">Alert when key contact leaves</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Usage Decline</p>
                            <p className="text-sm text-gray-500">Alert on 20%+ usage drop</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Integrations</CardTitle>
                        <CardDescription>Manage data sources</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Salesforce', status: 'Connected', icon: DollarSign },
                          { name: 'HubSpot', status: 'Not Connected', icon: Users },
                          { name: 'Zendesk', status: 'Connected', icon: Headphones },
                          { name: 'Slack', status: 'Connected', icon: MessageSquare },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <integration.icon className="h-5 w-5 text-gray-500" />
                              <span className="font-medium">{integration.name}</span>
                            </div>
                            <Badge className={integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {integration.status}
                            </Badge>
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
                        <CardTitle>Email Notifications</CardTitle>
                        <CardDescription>Configure notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Daily Digest</p>
                            <p className="text-sm text-gray-500">Summary of daily activities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Risk Alerts</p>
                            <p className="text-sm text-gray-500">Immediate risk notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Weekly performance summary</p>
                          </div>
                          <Switch />
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
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Programmatic access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable API</p>
                            <p className="text-sm text-gray-500">Allow external integrations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <div className="flex gap-2">
                            <Input value="cs_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline">Regenerate</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Reset All Settings</p>
                            <p className="text-sm text-gray-500">Restore default settings</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Reset</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Delete All Data</p>
                            <p className="text-sm text-gray-500">Permanently delete CS data</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">Delete All</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Export All Data</p>
                            <p className="text-sm text-gray-500">Download complete backup</p>
                          </div>
                          <Button variant="outline" onClick={handleExportReport}>Export</Button>
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
              insights={mockCSAIInsights}
              title="Customer Success Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCSCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCSPredictions}
              title="Success Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCSActivities}
            title="Customer Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockCSQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        {selectedCustomer.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedCustomer.name}</DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTierColor(selectedCustomer.tier)}>{selectedCustomer.tier}</Badge>
                        <Badge className={getHealthBadgeColor(selectedCustomer.healthStatus)}>
                          {selectedCustomer.healthStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className={`text-4xl font-bold ${getHealthColor(selectedCustomer.healthScore)}`}>
                    {selectedCustomer.healthScore}
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="touchpoints">Touchpoints</TabsTrigger>
                  <TabsTrigger value="risks">Risks & Opportunities</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="overview" className="p-4 space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-500">ARR</div>
                          <div className="text-2xl font-bold">{formatCurrency(selectedCustomer.arr)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-500">NPS</div>
                          <div className="text-2xl font-bold">{selectedCustomer.nps}/10</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-500">CSAT</div>
                          <div className="text-2xl font-bold">{selectedCustomer.csat}%</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-500">Days to Renewal</div>
                          <div className={`text-2xl font-bold ${getRiskColor(selectedCustomer.renewalRisk)}`}>
                            {selectedCustomer.daysToRenewal}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Key Contacts</h4>
                        <div className="space-y-2">
                          {selectedCustomer.keyContacts.map((contact, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {contact.name}
                                    {contact.champion && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                  </div>
                                  <div className="text-sm text-gray-500">{contact.role}</div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEmailContact(contact.email)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">CSM Assignment</h4>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-emerald-500 text-white">
                                {selectedCustomer.csm.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{selectedCustomer.csm.name}</div>
                              <div
                                className="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                                onClick={() => handleEmailContact(selectedCustomer.csm.email)}
                              >
                                {selectedCustomer.csm.email}
                              </div>
                            </div>
                          </div>
                        </div>

                        <h4 className="font-medium mb-3 mt-6">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCustomer.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="usage" className="p-4 space-y-6">
                    <h4 className="font-medium">Feature Adoption</h4>
                    <div className="space-y-4">
                      {selectedCustomer.usageMetrics.map(metric => (
                        <div key={metric.feature} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{metric.feature}</span>
                            <div className="flex items-center gap-4">
                              <span className={metric.adoption >= metric.benchmark ? 'text-green-600' : 'text-amber-600'}>
                                {metric.adoption}% (Benchmark: {metric.benchmark}%)
                              </span>
                              <span className={`flex items-center gap-1 ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                {Math.abs(metric.trend)}%
                              </span>
                            </div>
                          </div>
                          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div
                              className={`absolute h-full rounded-full ${metric.adoption >= metric.benchmark ? 'bg-green-500' : 'bg-amber-500'}`}
                              style={{ width: `${metric.adoption}%` }}
                            />
                            <div
                              className="absolute h-full w-0.5 bg-gray-400"
                              style={{ left: `${metric.benchmark}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="touchpoints" className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Recent Touchpoints</h4>
                      <Button
                        size="sm"
                        onClick={() => handleLogInteraction(selectedCustomer.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Log Touchpoint
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {selectedCustomer.touchpoints.map(tp => (
                        <Card key={tp.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                tp.sentiment === 'positive' ? 'bg-green-100 text-green-600' :
                                tp.sentiment === 'negative' ? 'bg-red-100 text-red-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {getTouchpointIcon(tp.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium capitalize">{tp.type}</span>
                                  <span className="text-sm text-gray-500">{tp.date}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{tp.summary}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="risks" className="p-4 space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Active Risks</h4>
                      {selectedCustomer.risks.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCustomer.risks.map(risk => (
                            <Card key={risk.id} className={
                              risk.severity === 'critical' ? 'border-red-200' :
                              risk.severity === 'high' ? 'border-orange-200' :
                              'border-yellow-200'
                            }>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={
                                        risk.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                        risk.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                        'bg-yellow-100 text-yellow-700'
                                      }>
                                        {risk.severity}
                                      </Badge>
                                      <span className="font-medium">{risk.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                                    <p className="text-sm text-emerald-600 mt-1">
                                      <span className="font-medium">Mitigation:</span> {risk.mitigation}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">Resolve</Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No active risks</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Opportunities</h4>
                      {selectedCustomer.opportunities.length > 0 ? (
                        <div className="space-y-3">
                          {selectedCustomer.opportunities.map(opp => (
                            <Card key={opp.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-100 text-green-700">{opp.type}</Badge>
                                      <span className="font-medium">{opp.product}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">Stage: {opp.stage}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-green-600">{formatCurrency(opp.value)}</div>
                                    <div className="text-sm text-gray-500">{opp.probability}% probability</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No active opportunities</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Set Triggers Dialog */}
      <Dialog open={showTriggersDialog} onOpenChange={setShowTriggersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Configure Playbook Triggers
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Name</label>
                <Input
                  placeholder="e.g., Low Health Score Alert"
                  value={triggerForm.name}
                  onChange={(e) => setTriggerForm({ ...triggerForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Trigger Type</label>
                  <select
                    value={triggerForm.type}
                    onChange={(e) => setTriggerForm({ ...triggerForm, type: e.target.value as typeof triggerForm.type })}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="health_score">Health Score Change</option>
                    <option value="usage_drop">Usage Drop</option>
                    <option value="renewal_approaching">Renewal Approaching</option>
                    <option value="nps_change">NPS Change</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <select
                    value={triggerForm.condition}
                    onChange={(e) => setTriggerForm({ ...triggerForm, condition: e.target.value as typeof triggerForm.condition })}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="below">Falls Below</option>
                    <option value="above">Rises Above</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Threshold Value</label>
                  <Input
                    type="number"
                    value={triggerForm.threshold}
                    onChange={(e) => setTriggerForm({ ...triggerForm, threshold: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Activate Playbook</label>
                  <select
                    value={triggerForm.playbookId}
                    onChange={(e) => setTriggerForm({ ...triggerForm, playbookId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="">Select a playbook...</option>
                    {playbooks.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">Enable Trigger</div>
                  <div className="text-sm text-gray-500">Automatically run when conditions are met</div>
                </div>
                <Switch
                  checked={triggerForm.enabled}
                  onCheckedChange={(checked) => setTriggerForm({ ...triggerForm, enabled: checked })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Existing Triggers</h4>
              <div className="space-y-2">
                {[
                  { name: 'At-Risk Detection', type: 'Health Score < 70', playbook: 'At-Risk Recovery', enabled: true },
                  { name: 'Renewal Reminder', type: '90 days before renewal', playbook: 'Renewal Preparation', enabled: true },
                  { name: 'Expansion Signal', type: 'Health Score > 85', playbook: 'Expansion Play', enabled: false },
                ].map((trigger, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border">
                    <div>
                      <div className="font-medium text-sm">{trigger.name}</div>
                      <div className="text-xs text-gray-500">{trigger.type} → {trigger.playbook}</div>
                    </div>
                    <Badge variant={trigger.enabled ? 'default' : 'secondary'}>
                      {trigger.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTriggersDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!triggerForm.name || !triggerForm.playbookId) {
                  toast.error('Please fill in all required fields')
                  return
                }
                await apiPost('/api/customer-success/triggers', triggerForm, {
                  loading: 'Creating trigger...',
                  success: 'Trigger created successfully',
                  error: 'Failed to create trigger'
                })
                setShowTriggersDialog(false)
                setTriggerForm({
                  name: '',
                  type: 'health_score',
                  condition: 'below',
                  threshold: 70,
                  playbookId: '',
                  enabled: true
                })
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Create Trigger
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrollments Dialog */}
      <Dialog open={showEnrollmentsDialog} onOpenChange={setShowEnrollmentsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-600" />
              Active Playbook Enrollments
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search enrollments..." className="pl-9" />
              </div>
              <select className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="all">All Playbooks</option>
                {playbooks.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold text-emerald-600">{enrollments.filter(e => e.status === 'active').length}</div>
                <div className="text-sm text-gray-500">Active</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-600">{enrollments.filter(e => e.status === 'completed').length}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-amber-600">0</div>
                <div className="text-sm text-gray-500">Paused</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-purple-600">{enrollments.length}</div>
                <div className="text-sm text-gray-500">Total</div>
              </Card>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {enrollments.map(enrollment => (
                  <Card key={enrollment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                            {enrollment.customer.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{enrollment.customer}</div>
                          <div className="text-sm text-gray-500">{enrollment.playbook}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{enrollment.progress}%</div>
                          <div className="text-xs text-gray-500">Started {enrollment.startedAt}</div>
                        </div>
                        <Badge variant={enrollment.status === 'active' ? 'default' : enrollment.status === 'completed' ? 'secondary' : 'outline'}>
                          {enrollment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      {enrollment.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { /* TODO: Implement enrollment pause */ }}
                          >
                            Pause
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const customer = customers.find(c => c.name === enrollment.customer)
                              if (customer) setSelectedCustomer(customer)
                              setShowEnrollmentsDialog(false)
                            }}
                          >
                            View Customer
                          </Button>
                        </>
                      )}
                      {enrollment.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { /* TODO: Implement customer re-enrollment */ }}
                        >
                          Re-enroll
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const exportData = enrollments.map(e => ({
                  Customer: e.customer,
                  Playbook: e.playbook,
                  Status: e.status,
                  StartedAt: e.startedAt,
                  Progress: `${e.progress}%`
                }))
                downloadAsCsv(exportData, 'playbook-enrollments.csv')
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowEnrollmentsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
