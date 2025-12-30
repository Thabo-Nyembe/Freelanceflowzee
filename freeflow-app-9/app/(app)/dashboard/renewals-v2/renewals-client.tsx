"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Mail,
  Phone,
  FileText,
  Settings,
  Search,
  MoreVertical,
  ChevronRight,
  Zap,
  Shield,
  GitBranch,
  Play,
  Send,
  Download,
  Building2,
  UserCheck,
  CalendarDays,
  LineChart,
  Gauge,
  Handshake,
  Sliders,
  Webhook,
  Key
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




import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'

// Types
type RenewalStatus = 'upcoming' | 'in_progress' | 'negotiating' | 'at_risk' | 'won' | 'lost' | 'churned'
type RenewalType = 'expansion' | 'flat' | 'contraction' | 'multi_year' | 'early_renewal'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type HealthScore = 'healthy' | 'needs_attention' | 'at_risk' | 'critical'
type PlaybookType = 'expansion' | 'retention' | 'win_back' | 'upsell' | 'cross_sell'

interface RenewalContact {
  id: string
  name: string
  role: string
  email: string
  phone: string
  avatar: string
  isPrimary: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
}

interface RenewalActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'proposal' | 'contract'
  title: string
  description: string
  date: Date
  user: string
  outcome?: 'positive' | 'neutral' | 'negative'
}

interface RenewalMilestone {
  id: string
  name: string
  dueDate: Date
  completed: boolean
  completedDate?: Date
}

interface Renewal {
  id: string
  customerName: string
  customerLogo: string
  status: RenewalStatus
  type: RenewalType
  priority: Priority
  healthScore: HealthScore
  healthScoreValue: number
  currentARR: number
  proposedARR: number
  expansionValue: number
  probability: number
  renewalDate: Date
  daysToRenewal: number
  contractTerm: number
  currency: string
  csmName: string
  csmAvatar: string
  aeName: string
  aeAvatar: string
  lastContactDate: Date
  nextActionDate: Date
  nextAction: string
  meetingsScheduled: number
  proposalSent: boolean
  contractSent: boolean
  contacts: RenewalContact[]
  activities: RenewalActivity[]
  milestones: RenewalMilestone[]
  products: string[]
  riskFactors: string[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

interface Playbook {
  id: string
  name: string
  type: PlaybookType
  description: string
  steps: string[]
  successRate: number
  timesUsed: number
}

interface Forecast {
  month: string
  renewals: number
  arr: number
  expansion: number
  churn: number
  netRetention: number
}

// Mock Data
const mockRenewals: Renewal[] = [
  {
    id: '1',
    customerName: 'Acme Corporation',
    customerLogo: '',
    status: 'negotiating',
    type: 'expansion',
    priority: 'high',
    healthScore: 'healthy',
    healthScoreValue: 92,
    currentARR: 180000,
    proposedARR: 240000,
    expansionValue: 60000,
    probability: 85,
    renewalDate: new Date('2025-02-15'),
    daysToRenewal: 52,
    contractTerm: 12,
    currency: 'USD',
    csmName: 'Sarah Chen',
    csmAvatar: '',
    aeName: 'Mike Johnson',
    aeAvatar: '',
    lastContactDate: new Date('2024-12-20'),
    nextActionDate: new Date('2024-12-28'),
    nextAction: 'Send revised proposal',
    meetingsScheduled: 3,
    proposalSent: true,
    contractSent: false,
    contacts: [
      { id: 'c1', name: 'John Smith', role: 'VP Engineering', email: 'john@acme.com', phone: '+1 555-0101', avatar: '', isPrimary: true, sentiment: 'positive' },
      { id: 'c2', name: 'Lisa Wang', role: 'Director of IT', email: 'lisa@acme.com', phone: '+1 555-0102', avatar: '', isPrimary: false, sentiment: 'positive' }
    ],
    activities: [
      { id: 'a1', type: 'meeting', title: 'QBR Meeting', description: 'Quarterly business review with stakeholders', date: new Date('2024-12-15'), user: 'Sarah Chen', outcome: 'positive' },
      { id: 'a2', type: 'proposal', title: 'Sent Expansion Proposal', description: 'Proposal for additional seats and features', date: new Date('2024-12-18'), user: 'Mike Johnson', outcome: 'positive' }
    ],
    milestones: [
      { id: 'm1', name: 'Initial Outreach', dueDate: new Date('2024-11-01'), completed: true, completedDate: new Date('2024-10-28') },
      { id: 'm2', name: 'QBR Completed', dueDate: new Date('2024-12-15'), completed: true, completedDate: new Date('2024-12-15') },
      { id: 'm3', name: 'Proposal Sent', dueDate: new Date('2024-12-20'), completed: true, completedDate: new Date('2024-12-18') },
      { id: 'm4', name: 'Contract Signed', dueDate: new Date('2025-01-15'), completed: false }
    ],
    products: ['Enterprise Plan', 'API Access', 'Priority Support'],
    riskFactors: [],
    notes: 'Customer is very happy with the product. Looking to expand to 3 more departments.',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: '2',
    customerName: 'TechStart Inc',
    customerLogo: '',
    status: 'at_risk',
    type: 'contraction',
    priority: 'critical',
    healthScore: 'at_risk',
    healthScoreValue: 45,
    currentARR: 96000,
    proposedARR: 72000,
    expansionValue: -24000,
    probability: 55,
    renewalDate: new Date('2025-01-31'),
    daysToRenewal: 37,
    contractTerm: 12,
    currency: 'USD',
    csmName: 'Alex Rivera',
    csmAvatar: '',
    aeName: 'Emma Wilson',
    aeAvatar: '',
    lastContactDate: new Date('2024-12-10'),
    nextActionDate: new Date('2024-12-26'),
    nextAction: 'Executive escalation call',
    meetingsScheduled: 1,
    proposalSent: false,
    contractSent: false,
    contacts: [
      { id: 'c3', name: 'David Park', role: 'CTO', email: 'david@techstart.com', phone: '+1 555-0201', avatar: '', isPrimary: true, sentiment: 'negative' }
    ],
    activities: [
      { id: 'a3', type: 'call', title: 'Check-in Call', description: 'Discussed concerns about ROI', date: new Date('2024-12-10'), user: 'Alex Rivera', outcome: 'negative' }
    ],
    milestones: [
      { id: 'm5', name: 'Initial Outreach', dueDate: new Date('2024-11-15'), completed: true, completedDate: new Date('2024-11-20') },
      { id: 'm6', name: 'Risk Assessment', dueDate: new Date('2024-12-01'), completed: true, completedDate: new Date('2024-12-05') },
      { id: 'm7', name: 'Executive Escalation', dueDate: new Date('2024-12-26'), completed: false }
    ],
    products: ['Pro Plan', 'Standard Support'],
    riskFactors: ['Low product usage', 'Budget constraints', 'Champion left company'],
    notes: 'Customer expressing concerns about value. Need executive alignment.',
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: '3',
    customerName: 'Global Enterprises',
    customerLogo: '',
    status: 'upcoming',
    type: 'multi_year',
    priority: 'high',
    healthScore: 'healthy',
    healthScoreValue: 88,
    currentARR: 450000,
    proposedARR: 520000,
    expansionValue: 70000,
    probability: 90,
    renewalDate: new Date('2025-03-31'),
    daysToRenewal: 96,
    contractTerm: 36,
    currency: 'USD',
    csmName: 'Sarah Chen',
    csmAvatar: '',
    aeName: 'James Park',
    aeAvatar: '',
    lastContactDate: new Date('2024-12-18'),
    nextActionDate: new Date('2025-01-10'),
    nextAction: 'Schedule QBR',
    meetingsScheduled: 0,
    proposalSent: false,
    contractSent: false,
    contacts: [
      { id: 'c4', name: 'Maria Garcia', role: 'SVP Operations', email: 'maria@global.com', phone: '+1 555-0301', avatar: '', isPrimary: true, sentiment: 'positive' },
      { id: 'c5', name: 'Robert Chen', role: 'Director IT', email: 'robert@global.com', phone: '+1 555-0302', avatar: '', isPrimary: false, sentiment: 'positive' }
    ],
    activities: [],
    milestones: [
      { id: 'm8', name: 'Initial Outreach', dueDate: new Date('2025-01-01'), completed: false },
      { id: 'm9', name: 'QBR Scheduled', dueDate: new Date('2025-01-15'), completed: false }
    ],
    products: ['Enterprise Plan', 'API Access', 'Premium Support', 'Custom Integrations'],
    riskFactors: [],
    notes: 'Strategic account. Looking to lock in 3-year deal with volume discount.',
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-12-18')
  },
  {
    id: '4',
    customerName: 'Startup Labs',
    customerLogo: '',
    status: 'won',
    type: 'expansion',
    priority: 'medium',
    healthScore: 'healthy',
    healthScoreValue: 95,
    currentARR: 36000,
    proposedARR: 60000,
    expansionValue: 24000,
    probability: 100,
    renewalDate: new Date('2024-12-15'),
    daysToRenewal: -9,
    contractTerm: 12,
    currency: 'USD',
    csmName: 'Alex Rivera',
    csmAvatar: '',
    aeName: 'Emma Wilson',
    aeAvatar: '',
    lastContactDate: new Date('2024-12-14'),
    nextActionDate: new Date('2024-12-14'),
    nextAction: 'Completed',
    meetingsScheduled: 2,
    proposalSent: true,
    contractSent: true,
    contacts: [
      { id: 'c6', name: 'Tom Wilson', role: 'CEO', email: 'tom@startuplabs.com', phone: '+1 555-0401', avatar: '', isPrimary: true, sentiment: 'positive' }
    ],
    activities: [
      { id: 'a4', type: 'contract', title: 'Contract Signed', description: '12-month expansion contract signed', date: new Date('2024-12-14'), user: 'Emma Wilson', outcome: 'positive' }
    ],
    milestones: [
      { id: 'm10', name: 'Contract Signed', dueDate: new Date('2024-12-15'), completed: true, completedDate: new Date('2024-12-14') }
    ],
    products: ['Pro Plan', 'API Access'],
    riskFactors: [],
    notes: 'Great renewal with 67% expansion!',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-12-14')
  },
  {
    id: '5',
    customerName: 'MegaCorp Industries',
    customerLogo: '',
    status: 'in_progress',
    type: 'flat',
    priority: 'medium',
    healthScore: 'needs_attention',
    healthScoreValue: 68,
    currentARR: 120000,
    proposedARR: 120000,
    expansionValue: 0,
    probability: 75,
    renewalDate: new Date('2025-02-28'),
    daysToRenewal: 65,
    contractTerm: 12,
    currency: 'USD',
    csmName: 'Sarah Chen',
    csmAvatar: '',
    aeName: 'Mike Johnson',
    aeAvatar: '',
    lastContactDate: new Date('2024-12-15'),
    nextActionDate: new Date('2024-12-30'),
    nextAction: 'Follow up on proposal',
    meetingsScheduled: 2,
    proposalSent: true,
    contractSent: false,
    contacts: [
      { id: 'c7', name: 'Jennifer Lee', role: 'VP Technology', email: 'jennifer@megacorp.com', phone: '+1 555-0501', avatar: '', isPrimary: true, sentiment: 'neutral' }
    ],
    activities: [],
    milestones: [
      { id: 'm11', name: 'Proposal Sent', dueDate: new Date('2024-12-20'), completed: true, completedDate: new Date('2024-12-18') },
      { id: 'm12', name: 'Follow-up Meeting', dueDate: new Date('2024-12-30'), completed: false }
    ],
    products: ['Enterprise Plan', 'Standard Support'],
    riskFactors: ['Competitive evaluation'],
    notes: 'Customer evaluating alternatives. Need to reinforce value.',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '6',
    customerName: 'DataFlow Systems',
    customerLogo: '',
    status: 'churned',
    type: 'contraction',
    priority: 'low',
    healthScore: 'critical',
    healthScoreValue: 20,
    currentARR: 84000,
    proposedARR: 0,
    expansionValue: -84000,
    probability: 0,
    renewalDate: new Date('2024-11-30'),
    daysToRenewal: -24,
    contractTerm: 12,
    currency: 'USD',
    csmName: 'Alex Rivera',
    csmAvatar: '',
    aeName: 'James Park',
    aeAvatar: '',
    lastContactDate: new Date('2024-11-25'),
    nextActionDate: new Date('2024-11-30'),
    nextAction: 'N/A',
    meetingsScheduled: 0,
    proposalSent: false,
    contractSent: false,
    contacts: [],
    activities: [],
    milestones: [],
    products: ['Pro Plan'],
    riskFactors: ['Product fit issues', 'Acquisition by competitor'],
    notes: 'Customer acquired by competitor. Churn unavoidable.',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-11-30')
  }
]

const mockPlaybooks: Playbook[] = [
  {
    id: 'p1',
    name: 'Expansion Playbook',
    type: 'expansion',
    description: 'Guide for expanding existing accounts with additional products or seats',
    steps: ['Identify expansion opportunities', 'Schedule value review', 'Present ROI analysis', 'Send expansion proposal', 'Negotiate terms', 'Close deal'],
    successRate: 78,
    timesUsed: 156
  },
  {
    id: 'p2',
    name: 'At-Risk Retention',
    type: 'retention',
    description: 'Playbook for saving at-risk renewals',
    steps: ['Escalate to leadership', 'Conduct root cause analysis', 'Create success plan', 'Weekly check-ins', 'Offer incentives if needed', 'Secure commitment'],
    successRate: 62,
    timesUsed: 89
  },
  {
    id: 'p3',
    name: 'Win-Back Campaign',
    type: 'win_back',
    description: 'Strategy for winning back churned customers',
    steps: ['Wait 90 days', 'Send re-engagement email', 'Offer special pricing', 'Demonstrate new features', 'Remove friction', 'Close'],
    successRate: 24,
    timesUsed: 45
  },
  {
    id: 'p4',
    name: 'Strategic Upsell',
    type: 'upsell',
    description: 'Playbook for upgrading customers to higher tiers',
    steps: ['Analyze usage patterns', 'Identify tier limitations', 'Present upgrade benefits', 'Offer trial of premium features', 'Propose upgrade', 'Execute'],
    successRate: 71,
    timesUsed: 203
  }
]

const mockForecasts: Forecast[] = [
  { month: 'Jan 2025', renewals: 12, arr: 420000, expansion: 85000, churn: 24000, netRetention: 114 },
  { month: 'Feb 2025', renewals: 8, arr: 280000, expansion: 45000, churn: 36000, netRetention: 103 },
  { month: 'Mar 2025', renewals: 15, arr: 680000, expansion: 120000, churn: 48000, netRetention: 111 },
  { month: 'Apr 2025', renewals: 10, arr: 350000, expansion: 65000, churn: 30000, netRetention: 110 },
  { month: 'May 2025', renewals: 6, arr: 180000, expansion: 25000, churn: 18000, netRetention: 104 },
  { month: 'Jun 2025', renewals: 14, arr: 520000, expansion: 95000, churn: 42000, netRetention: 110 }
]

// Helper Functions
const getStatusColor = (status: RenewalStatus): string => {
  const colors: Record<RenewalStatus, string> = {
    upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    negotiating: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    at_risk: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    churned: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status] || colors.upcoming
}

const getStatusIcon = (status: RenewalStatus) => {
  const icons: Record<RenewalStatus, React.ReactNode> = {
    upcoming: <Calendar className="w-3 h-3" />,
    in_progress: <Play className="w-3 h-3" />,
    negotiating: <Handshake className="w-3 h-3" />,
    at_risk: <AlertTriangle className="w-3 h-3" />,
    won: <CheckCircle className="w-3 h-3" />,
    lost: <XCircle className="w-3 h-3" />,
    churned: <XCircle className="w-3 h-3" />
  }
  return icons[status] || icons.upcoming
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[priority] || colors.medium
}

const getHealthColor = (health: HealthScore): string => {
  const colors: Record<HealthScore, string> = {
    healthy: 'text-green-600 dark:text-green-400',
    needs_attention: 'text-yellow-600 dark:text-yellow-400',
    at_risk: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400'
  }
  return colors[health] || colors.healthy
}

const getTypeColor = (type: RenewalType): string => {
  const colors: Record<RenewalType, string> = {
    expansion: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    flat: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    contraction: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    multi_year: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    early_renewal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
  }
  return colors[type] || colors.flat
}

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

interface RenewalsClientProps {
  initialRenewals?: any[]
}

// Enhanced Competitive Upgrade Mock Data
const mockRenewalsAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Renewal Rate', description: 'Renewal rate at 92%. 15% above industry benchmark.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'At-Risk Accounts', description: '3 accounts flagged as at-risk. Executive escalation recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Risk' },
  { id: '3', type: 'info' as const, title: 'Expansion Opportunity', description: 'Identified $180K expansion potential across 5 accounts.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Revenue' },
]

const mockRenewalsCollaborators = [
  { id: '1', name: 'Customer Success Lead', avatar: '/avatars/cs.jpg', status: 'online' as const, role: 'CS Lead' },
  { id: '2', name: 'Account Executive', avatar: '/avatars/ae.jpg', status: 'online' as const, role: 'AE' },
  { id: '3', name: 'Revenue Ops', avatar: '/avatars/revops.jpg', status: 'away' as const, role: 'RevOps' },
]

const mockRenewalsPredictions = [
  { id: '1', title: 'Q1 Renewal Forecast', prediction: 'Expecting 94% renewal rate with $520K ARR retained', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Churn Risk Analysis', prediction: 'TechStart and 2 others may need intervention', confidence: 75, trend: 'down' as const, impact: 'high' as const },
]

const mockRenewalsActivities = [
  { id: '1', user: 'Sarah Chen', action: 'Closed', target: 'Startup Labs renewal with 67% expansion', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Alex Rivera', action: 'Escalated', target: 'TechStart to executive team', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'warning' as const },
  { id: '3', user: 'Mike Johnson', action: 'Sent', target: 'proposal to Acme Corporation', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'info' as const },
]

const mockRenewalsQuickActions = [
  { id: '1', label: 'New Renewal', icon: 'plus', action: () => console.log('New renewal'), variant: 'default' as const },
  { id: '2', label: 'Run Playbook', icon: 'play', action: () => console.log('Run playbook'), variant: 'default' as const },
  { id: '3', label: 'Export Pipeline', icon: 'download', action: () => console.log('Export'), variant: 'outline' as const },
]

export default function RenewalsClient({ initialRenewals }: RenewalsClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<RenewalStatus | 'all'>('all')
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null)
  const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false)

  const renewals = mockRenewals
  const playbooks = mockPlaybooks
  const forecasts = mockForecasts

  // Computed Statistics
  const stats = useMemo(() => {
    const activeRenewals = renewals.filter(r => !['won', 'lost', 'churned'].includes(r.status))
    const totalCurrentARR = activeRenewals.reduce((sum, r) => sum + r.currentARR, 0)
    const totalProposedARR = activeRenewals.reduce((sum, r) => sum + r.proposedARR, 0)
    const totalExpansion = activeRenewals.reduce((sum, r) => sum + Math.max(0, r.expansionValue), 0)
    const totalContraction = activeRenewals.reduce((sum, r) => sum + Math.min(0, r.expansionValue), 0)
    const avgProbability = activeRenewals.length > 0
      ? activeRenewals.reduce((sum, r) => sum + r.probability, 0) / activeRenewals.length
      : 0
    const atRiskCount = renewals.filter(r => r.status === 'at_risk').length
    const atRiskARR = renewals.filter(r => r.status === 'at_risk').reduce((sum, r) => sum + r.currentARR, 0)
    const upcomingCount = renewals.filter(r => r.status === 'upcoming').length
    const wonCount = renewals.filter(r => r.status === 'won').length
    const lostCount = renewals.filter(r => ['lost', 'churned'].includes(r.status)).length

    return {
      total: renewals.length,
      active: activeRenewals.length,
      totalCurrentARR,
      totalProposedARR,
      totalExpansion,
      totalContraction,
      avgProbability,
      atRiskCount,
      atRiskARR,
      upcomingCount,
      wonCount,
      lostCount
    }
  }, [renewals])

  // Filtered Renewals
  const filteredRenewals = useMemo(() => {
    return renewals.filter(renewal => {
      const matchesSearch = renewal.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        renewal.csmName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || renewal.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [renewals, searchQuery, selectedStatus])

  const openRenewalDetail = (renewal: Renewal) => {
    setSelectedRenewal(renewal)
    setIsRenewalDialogOpen(true)
  }

  // Handlers
  const handleSendProposal = () => {
    if (!selectedRenewal) return
    toast.success('Proposal sent successfully', {
      description: `Renewal proposal sent to ${selectedRenewal.customerName}`
    })
    setIsRenewalDialogOpen(false)
  }

  const handleScheduleMeeting = () => {
    if (!selectedRenewal) return
    toast.success('Meeting scheduled', {
      description: `Meeting request sent to ${selectedRenewal.customerName}`
    })
  }

  const handleExport = () => {
    toast.success('Export started', {
      description: 'Your renewal data is being exported'
    })
  }

  const handleScheduleRenewal = () => {
    toast.info('Schedule Renewal', {
      description: 'Opening renewal scheduler...'
    })
  }

  const handleContactEmail = (email: string, name: string) => {
    toast.success('Opening email', {
      description: `Composing email to ${name}`
    })
  }

  const handleContactPhone = (phone: string, name: string) => {
    toast.success('Initiating call', {
      description: `Calling ${name}`
    })
  }

  const handleProcessRenewal = (contractName: string) => {
    toast.success('Processing renewal', {
      description: `"${contractName}" renewal is being processed`
    })
  }

  const handleExportRenewals = () => {
    toast.success('Exporting renewals', {
      description: 'Renewal data will be downloaded shortly'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <RefreshCw className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Renewal Management</h1>
              <p className="text-muted-foreground">Chargebee-level subscription renewal platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={handleScheduleRenewal}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Schedule Renewal
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active Renewals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalCurrentARR / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Pipeline ARR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+{formatCurrency(stats.totalExpansion / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Expansion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalContraction / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Contraction</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgProbability.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Probability</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.atRiskCount}</p>
                  <p className="text-xs text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.wonCount}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lostCount}</p>
                  <p className="text-xs text-muted-foreground">Lost/Churned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Building2 className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="gap-2">
              <LineChart className="w-4 h-4" />
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="playbooks" className="gap-2">
              <FileText className="w-4 h-4" />
              Playbooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Renewal Overview</h2>
                  <p className="text-blue-100">Gainsight-level renewal management and forecasting</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalValue.toLocaleString()}</p>
                    <p className="text-blue-200 text-sm">Pipeline Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.renewalRate}%</p>
                    <p className="text-blue-200 text-sm">Renewal Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.atRiskCount}</p>
                    <p className="text-blue-200 text-sm">At Risk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: RefreshCw, label: 'New Renewal', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Target, label: 'Forecast', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: AlertTriangle, label: 'At Risk', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Play, label: 'Playbooks', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Users, label: 'Customers', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Renewal Pipeline */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Renewal Pipeline</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search renewals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value as RenewalStatus | 'all')}
                          className="h-10 px-3 rounded-md border border-input bg-background"
                        >
                          <option value="all">All Status</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="in_progress">In Progress</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="at_risk">At Risk</option>
                          <option value="won">Won</option>
                          <option value="churned">Churned</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredRenewals.map((renewal) => (
                        <div
                          key={renewal.id}
                          className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => openRenewalDetail(renewal)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                  {renewal.customerName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{renewal.customerName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getStatusColor(renewal.status)}>
                                    {getStatusIcon(renewal.status)}
                                    <span className="ml-1 capitalize">{renewal.status.replace('_', ' ')}</span>
                                  </Badge>
                                  <Badge className={getTypeColor(renewal.type)}>
                                    {renewal.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge className={getPriorityColor(renewal.priority)}>
                                    {renewal.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                                {renewal.probability}%
                              </div>
                              <div className="text-xs text-muted-foreground">probability</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Current ARR</p>
                              <p className="font-semibold">{formatCurrency(renewal.currentARR)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Proposed ARR</p>
                              <p className="font-semibold text-violet-600 dark:text-violet-400">
                                {formatCurrency(renewal.proposedARR)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Change</p>
                              <p className={`font-semibold flex items-center gap-1 ${
                                renewal.expansionValue > 0 ? 'text-green-600 dark:text-green-400' :
                                renewal.expansionValue < 0 ? 'text-red-600 dark:text-red-400' :
                                'text-muted-foreground'
                              }`}>
                                {renewal.expansionValue > 0 ? <ArrowUpRight className="w-3 h-3" /> :
                                 renewal.expansionValue < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                                {renewal.expansionValue > 0 ? '+' : ''}{formatCurrency(renewal.expansionValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Renewal Date</p>
                              <p className={`font-semibold ${renewal.daysToRenewal <= 30 && renewal.daysToRenewal > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                {formatDate(renewal.renewalDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {renewal.csmName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {renewal.daysToRenewal > 0 ? `${renewal.daysToRenewal} days` : 'Completed'}
                              </span>
                              <span className={`flex items-center gap-1 ${getHealthColor(renewal.healthScore)}`}>
                                <Gauge className="w-4 h-4" />
                                {renewal.healthScoreValue}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {renewal.proposalSent && (
                                <Badge variant="outline" className="text-xs">Proposal Sent</Badge>
                              )}
                              {renewal.contractSent && (
                                <Badge variant="outline" className="text-xs">Contract Sent</Badge>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3 pt-3 border-t">
                            <Progress
                              value={renewal.probability}
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* At Risk Summary */}
                <Card className="border-red-200 dark:border-red-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      At Risk Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {renewals.filter(r => r.status === 'at_risk').map((renewal) => (
                        <div key={renewal.id} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{renewal.customerName}</span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(renewal.currentARR)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {renewal.riskFactors.map((factor, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-300">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                      {renewals.filter(r => r.status === 'at_risk').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No at-risk accounts</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Renewals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                      Next 30 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {renewals
                        .filter(r => r.daysToRenewal > 0 && r.daysToRenewal <= 30 && !['won', 'lost', 'churned'].includes(r.status))
                        .sort((a, b) => a.daysToRenewal - b.daysToRenewal)
                        .map((renewal) => (
                          <div key={renewal.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                            <div>
                              <p className="font-medium text-sm">{renewal.customerName}</p>
                              <p className="text-xs text-muted-foreground">{renewal.daysToRenewal} days</p>
                            </div>
                            <span className="font-semibold text-sm">{formatCurrency(renewal.currentARR)}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Health Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Health Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(['healthy', 'needs_attention', 'at_risk', 'critical'] as HealthScore[]).map((health) => {
                      const count = renewals.filter(r => r.healthScore === health && !['won', 'lost', 'churned'].includes(r.status)).length
                      const percentage = stats.active > 0 ? (count / stats.active) * 100 : 0
                      return (
                        <div key={health}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm capitalize ${getHealthColor(health)}`}>
                              {health.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Startup Labs renewal won', time: '2 hours ago' },
                        { icon: <Send className="w-4 h-4 text-blue-500" />, text: 'Proposal sent to Acme Corp', time: '4 hours ago' },
                        { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: 'TechStart marked at-risk', time: '1 day ago' },
                        { icon: <Phone className="w-4 h-4 text-purple-500" />, text: 'QBR call with Global Enterprises', time: '2 days ago' }
                      ].map((activity, i) => (
                        <div key={i} className="flex items-start gap-3">
                          {activity.icon}
                          <div className="flex-1">
                            <p className="text-sm">{activity.text}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-6">
            <div className="grid grid-cols-5 gap-4">
              {(['upcoming', 'in_progress', 'negotiating', 'at_risk', 'won'] as RenewalStatus[]).map((status) => {
                const statusRenewals = renewals.filter(r => r.status === status)
                const statusARR = statusRenewals.reduce((sum, r) => sum + r.currentARR, 0)
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <div>
                        <p className="font-semibold capitalize">{status.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{statusRenewals.length} renewals</p>
                      </div>
                      <p className="font-bold">{formatCurrency(statusARR)}</p>
                    </div>
                    <div className="space-y-2">
                      {statusRenewals.map((renewal) => (
                        <Card
                          key={renewal.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openRenewalDetail(renewal)}
                        >
                          <CardContent className="p-3">
                            <p className="font-medium text-sm mb-1">{renewal.customerName}</p>
                            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                              {formatCurrency(renewal.currentARR)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {renewal.daysToRenewal > 0 ? `${renewal.daysToRenewal}d` : 'Done'}
                              </span>
                              <span className={`text-xs font-medium ${getHealthColor(renewal.healthScore)}`}>
                                {renewal.healthScoreValue}
                              </span>
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

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-6">
            {/* Customers Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Customer Accounts</h2>
                  <p className="text-purple-100">Manage customer health and renewal readiness</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{renewals.length}</p>
                  <p className="text-purple-200 text-sm">Active Accounts</p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {renewals.map((renewal) => (
                    <div
                      key={renewal.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => openRenewalDetail(renewal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                              {renewal.customerName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{renewal.customerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(renewal.status)}>
                                {renewal.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                CSM: {renewal.csmName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{formatCurrency(renewal.currentARR)}</p>
                            <p className="text-xs text-muted-foreground">ARR</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-2xl font-bold ${getHealthColor(renewal.healthScore)}`}>
                              {renewal.healthScoreValue}
                            </p>
                            <p className="text-xs text-muted-foreground">Health</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{renewal.probability}%</p>
                            <p className="text-xs text-muted-foreground">Probability</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-violet-500" />
                    Renewal Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecasts.map((forecast) => (
                      <div key={forecast.month} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">{forecast.month}</span>
                          <Badge variant="outline">{forecast.renewals} renewals</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">ARR</p>
                            <p className="font-semibold">{formatCurrency(forecast.arr)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expansion</p>
                            <p className="font-semibold text-green-600">+{formatCurrency(forecast.expansion)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Churn</p>
                            <p className="font-semibold text-red-600">-{formatCurrency(forecast.churn)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Retention</p>
                            <p className={`font-semibold ${forecast.netRetention >= 100 ? 'text-green-600' : 'text-red-600'}`}>
                              {forecast.netRetention}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg mb-4">
                    <PieChart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                      <p className="text-sm text-muted-foreground">Expansion Revenue</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalExpansion)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10">
                      <p className="text-sm text-muted-foreground">At-Risk ARR</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(stats.atRiskARR)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Playbooks Tab */}
          <TabsContent value="playbooks" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playbooks.map((playbook) => (
                <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          {playbook.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{playbook.description}</p>
                      </div>
                      <Badge className={getTypeColor(playbook.type as any)}>{playbook.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {playbook.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-medium text-violet-600">
                            {i + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {playbook.successRate}% success
                        </span>
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          {playbook.timesUsed} times used
                        </span>
                      </div>
                      <Button size="sm">Use Playbook</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Renewal Settings</h2>
                  <p className="text-slate-200">Configure your renewal management preferences</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'automation', label: 'Automation', icon: Zap },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 text-blue-600" />
                          Renewal Defaults
                        </CardTitle>
                        <CardDescription>Default settings for new renewals</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Renewal Period</Label>
                            <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                              <option value="1">1 Year</option>
                              <option value="2">2 Years</option>
                              <option value="3">3 Years</option>
                            </select>
                          </div>
                          <div>
                            <Label>Advance Notice (Days)</Label>
                            <Input defaultValue="90" type="number" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-create Renewal Opportunities</Label>
                            <p className="text-sm text-gray-500">Automatically create when contract nears expiration</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="h-5 h-5 text-green-600" />
                          Health Score Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Healthy Threshold</Label>
                            <Input defaultValue="70" type="number" className="mt-1" />
                          </div>
                          <div>
                            <Label>At-Risk Threshold</Label>
                            <Input defaultValue="40" type="number" className="mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Automation Settings */}
                {settingsTab === 'automation' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-amber-600" />
                          Workflow Automation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Auto-assign renewals', desc: 'Based on account owner' },
                          { label: 'Auto-escalate at-risk', desc: 'When health drops below threshold' },
                          { label: 'Auto-trigger playbooks', desc: 'Based on renewal stage' },
                          { label: 'Auto-update forecasts', desc: 'When renewal status changes' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>{item.label}</Label>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 2} />
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
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-purple-600" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Renewal due reminders', desc: 'Notify before renewal date' },
                          { label: 'At-risk alerts', desc: 'When accounts become at-risk' },
                          { label: 'Won/Lost notifications', desc: 'When renewal status changes' },
                          { label: 'Weekly pipeline digest', desc: 'Summary of renewal pipeline' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>{item.label}</Label>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 3} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-indigo-600" />
                          Connected Platforms
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Salesforce', status: 'Connected', icon: Building2 },
                          { name: 'Gainsight', status: 'Not Connected', icon: Gauge },
                          { name: 'HubSpot', status: 'Connected', icon: Target },
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <integration.icon className="h-6 w-6 text-gray-600" />
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.status}</p>
                              </div>
                            </div>
                            <Button variant={integration.status === 'Connected' ? 'outline' : 'default'} size="sm">
                              {integration.status === 'Connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-red-600" />
                          Access Control
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Require approval for discounts</Label>
                            <p className="text-sm text-gray-500">Discounts over 15% need approval</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Audit logging</Label>
                            <p className="text-sm text-gray-500">Track all renewal changes</p>
                          </div>
                          <Switch defaultChecked />
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
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="h-5 w-5 text-gray-600" />
                          Advanced Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Multi-year renewals</Label>
                            <p className="text-sm text-gray-500">Enable multi-year contract options</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Custom health metrics</Label>
                            <p className="text-sm text-gray-500">Define custom health score factors</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Archive Old Renewals</Label>
                            <p className="text-sm text-red-600">Archive renewals older than 2 years</p>
                          </div>
                          <Button variant="destructive" size="sm">Archive</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset Settings</Label>
                            <p className="text-sm text-red-600">Reset to default configuration</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
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
              insights={mockRenewalsAIInsights}
              title="Renewal Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockRenewalsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockRenewalsPredictions}
              title="Renewal Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockRenewalsActivities}
            title="Renewal Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockRenewalsQuickActions}
            variant="grid"
          />
        </div>

        {/* Renewal Detail Dialog */}
        <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedRenewal && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        {selectedRenewal.customerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRenewal.customerName}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedRenewal.status)}>
                        {getStatusIcon(selectedRenewal.status)}
                        <span className="ml-1 capitalize">{selectedRenewal.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={getTypeColor(selectedRenewal.type)}>
                        {selectedRenewal.type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(selectedRenewal.priority)}>
                        {selectedRenewal.priority} priority
                      </Badge>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Current ARR</p>
                        <p className="text-2xl font-bold">{formatCurrency(selectedRenewal.currentARR)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Proposed ARR</p>
                        <p className="text-2xl font-bold text-violet-600">{formatCurrency(selectedRenewal.proposedARR)}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Change</p>
                        <p className={`text-2xl font-bold ${selectedRenewal.expansionValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedRenewal.expansionValue >= 0 ? '+' : ''}{formatCurrency(selectedRenewal.expansionValue)}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Health Score</p>
                        <p className={`text-2xl font-bold ${getHealthColor(selectedRenewal.healthScore)}`}>
                          {selectedRenewal.healthScoreValue}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3">Renewal Timeline</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Renewal Date</p>
                          <p className="font-medium">{formatDate(selectedRenewal.renewalDate)}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Days Remaining</p>
                          <p className={`font-medium ${selectedRenewal.daysToRenewal <= 30 && selectedRenewal.daysToRenewal > 0 ? 'text-red-600' : ''}`}>
                            {selectedRenewal.daysToRenewal > 0 ? `${selectedRenewal.daysToRenewal} days` : 'Completed'}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Contract Term</p>
                          <p className="font-medium">{selectedRenewal.contractTerm} months</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Probability</p>
                          <p className="font-medium">{selectedRenewal.probability}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div>
                      <h4 className="font-semibold mb-3">Account Team</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar>
                            <AvatarFallback>{selectedRenewal.csmName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedRenewal.csmName}</p>
                            <p className="text-sm text-muted-foreground">Customer Success Manager</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                          <Avatar>
                            <AvatarFallback>{selectedRenewal.aeName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedRenewal.aeName}</p>
                            <p className="text-sm text-muted-foreground">Account Executive</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contacts */}
                    {selectedRenewal.contacts.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Customer Contacts</h4>
                        <div className="space-y-2">
                          {selectedRenewal.contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{contact.name}</p>
                                    {contact.isPrimary && <Badge variant="secondary">Primary</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleContactEmail(contact.email, contact.name)}><Mail className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleContactPhone(contact.phone, contact.name)}><Phone className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {selectedRenewal.riskFactors.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-red-600">Risk Factors</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRenewal.riskFactors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-red-600 border-red-300">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    <div>
                      <h4 className="font-semibold mb-3">Products</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRenewal.products.map((product, i) => (
                          <Badge key={i} variant="secondary">{product}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedRenewal.notes && (
                      <div>
                        <h4 className="font-semibold mb-3">Notes</h4>
                        <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                          {selectedRenewal.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1" onClick={handleSendProposal}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Proposal
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleScheduleMeeting}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
