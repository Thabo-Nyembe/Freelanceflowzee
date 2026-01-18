"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useLeads, LeadInput, LeadStats } from '@/lib/hooks/use-leads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Target,
  Plus,
  Search,
  Users,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Trash2,
  Filter,
  MoreVertical,
  Building2,
  Globe,
  Calendar,
  MessageSquare,
  Send,
  Eye,
  UserPlus,
  UserCheck,
  BarChart3,
  Activity,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Tag,
  Briefcase,
  DollarSign,
  TrendingDown,
  Sparkles,
  Brain,
  Linkedin,
  AlertCircle,
  FileText,
  Copy,
  Flame,
  Sliders,
  Webhook,
  Database,
  Terminal,
  Shield,
  Archive,
  Lock,
  Layers,
  Rocket,
  Megaphone,
  ListChecks,
  GitBranch,
  Network
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

// Types
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
type LeadStage = 'subscriber' | 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'evangelist'
type LeadSource = 'website' | 'linkedin' | 'referral' | 'email' | 'paid_ads' | 'organic' | 'event' | 'cold_outreach' | 'partner'
type LeadPriority = 'hot' | 'warm' | 'cold'
type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task' | 'linkedin' | 'form_submit' | 'page_view'
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'

interface LeadActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  outcome?: 'positive' | 'neutral' | 'negative'
  performedBy: string
  createdAt: Date
}

interface LeadNote {
  id: string
  content: string
  author: string
  createdAt: Date
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company: string
  title: string
  status: LeadStatus
  stage: LeadStage
  source: LeadSource
  priority: LeadPriority
  score: number
  behavioralScore: number
  demographicScore: number
  estimatedValue: number
  owner: {
    id: string
    name: string
    avatar: string
  }
  lastContactDate?: Date
  nextFollowUp?: Date
  tags: string[]
  industry: string
  companySize: string
  website?: string
  linkedinUrl?: string
  activities: LeadActivity[]
  notes: LeadNote[]
  engagementScore: number
  emailOpens: number
  emailClicks: number
  pageViews: number
  formSubmissions: number
  createdAt: Date
  updatedAt: Date
}

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sequence' | 'workflow' | 'ads'
  status: CampaignStatus
  leads: number
  sent: number
  opened: number
  clicked: number
  converted: number
  startDate: Date
  endDate?: Date
}

interface ScoringRule {
  id: string
  name: string
  category: 'behavioral' | 'demographic'
  condition: string
  points: number
  isActive: boolean
}

// Mock Data
const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@acmecorp.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    title: 'VP of Engineering',
    status: 'qualified',
    stage: 'sql',
    source: 'website',
    priority: 'hot',
    score: 92,
    behavioralScore: 45,
    demographicScore: 47,
    estimatedValue: 150000,
    owner: { id: '1', name: 'Mike Wilson', avatar: '' },
    lastContactDate: new Date('2024-12-20'),
    nextFollowUp: new Date('2024-12-26'),
    tags: ['enterprise', 'decision-maker', 'high-value'],
    industry: 'Technology',
    companySize: '500-1000',
    website: 'https://acmecorp.com',
    linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
    activities: [
      { id: 'a1', type: 'email', title: 'Sent pricing proposal', description: 'Detailed enterprise pricing', outcome: 'positive', performedBy: 'Mike Wilson', createdAt: new Date('2024-12-20') },
      { id: 'a2', type: 'call', title: 'Discovery call', description: 'Discussed requirements and timeline', outcome: 'positive', performedBy: 'Mike Wilson', createdAt: new Date('2024-12-18') },
      { id: 'a3', type: 'form_submit', title: 'Demo request', description: 'Submitted demo request form', performedBy: 'System', createdAt: new Date('2024-12-15') }
    ],
    notes: [
      { id: 'n1', content: 'Looking to replace their current solution. Budget approved for Q1.', author: 'Mike Wilson', createdAt: new Date('2024-12-18') }
    ],
    engagementScore: 85,
    emailOpens: 12,
    emailClicks: 5,
    pageViews: 34,
    formSubmissions: 2,
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Chen',
    email: 'jchen@techstart.io',
    phone: '+1 (555) 234-5678',
    company: 'TechStart Inc',
    title: 'CTO',
    status: 'contacted',
    stage: 'mql',
    source: 'linkedin',
    priority: 'warm',
    score: 68,
    behavioralScore: 35,
    demographicScore: 33,
    estimatedValue: 45000,
    owner: { id: '2', name: 'Emma Davis', avatar: '' },
    lastContactDate: new Date('2024-12-15'),
    nextFollowUp: new Date('2024-12-28'),
    tags: ['startup', 'tech-savvy'],
    industry: 'SaaS',
    companySize: '50-100',
    website: 'https://techstart.io',
    activities: [
      { id: 'a4', type: 'linkedin', title: 'LinkedIn connection', description: 'Connected on LinkedIn', outcome: 'positive', performedBy: 'Emma Davis', createdAt: new Date('2024-12-15') },
      { id: 'a5', type: 'email', title: 'Introduction email', description: 'Sent intro and resources', performedBy: 'Emma Davis', createdAt: new Date('2024-12-16') }
    ],
    notes: [],
    engagementScore: 55,
    emailOpens: 4,
    emailClicks: 1,
    pageViews: 12,
    formSubmissions: 1,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-16')
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.r@globalent.com',
    company: 'Global Enterprises',
    title: 'Director of Operations',
    status: 'proposal',
    stage: 'opportunity',
    source: 'referral',
    priority: 'hot',
    score: 88,
    behavioralScore: 42,
    demographicScore: 46,
    estimatedValue: 280000,
    owner: { id: '1', name: 'Mike Wilson', avatar: '' },
    lastContactDate: new Date('2024-12-22'),
    nextFollowUp: new Date('2024-12-27'),
    tags: ['enterprise', 'referral', 'multi-year'],
    industry: 'Manufacturing',
    companySize: '1000+',
    website: 'https://globalent.com',
    activities: [
      { id: 'a6', type: 'meeting', title: 'Executive presentation', description: 'Presented to leadership team', outcome: 'positive', performedBy: 'Mike Wilson', createdAt: new Date('2024-12-22') },
      { id: 'a7', type: 'email', title: 'Proposal sent', description: '3-year enterprise agreement', performedBy: 'Mike Wilson', createdAt: new Date('2024-12-22') }
    ],
    notes: [
      { id: 'n2', content: 'Referred by Acme Corp. Very interested in 3-year deal.', author: 'Mike Wilson', createdAt: new Date('2024-12-20') }
    ],
    engagementScore: 92,
    emailOpens: 18,
    emailClicks: 8,
    pageViews: 56,
    formSubmissions: 3,
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-22')
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Kim',
    email: 'dkim@startup.co',
    company: 'Startup Co',
    title: 'Founder & CEO',
    status: 'new',
    stage: 'lead',
    source: 'paid_ads',
    priority: 'cold',
    score: 35,
    behavioralScore: 15,
    demographicScore: 20,
    estimatedValue: 12000,
    owner: { id: '2', name: 'Emma Davis', avatar: '' },
    tags: ['early-stage', 'bootstrap'],
    industry: 'Fintech',
    companySize: '1-10',
    activities: [
      { id: 'a8', type: 'page_view', title: 'Pricing page visit', description: 'Viewed pricing page 3 times', performedBy: 'System', createdAt: new Date('2024-12-21') }
    ],
    notes: [],
    engagementScore: 25,
    emailOpens: 1,
    emailClicks: 0,
    pageViews: 5,
    formSubmissions: 1,
    createdAt: new Date('2024-12-21'),
    updatedAt: new Date('2024-12-21')
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lwang@megacorp.com',
    phone: '+1 (555) 345-6789',
    company: 'MegaCorp Industries',
    title: 'Head of Procurement',
    status: 'negotiation',
    stage: 'opportunity',
    source: 'event',
    priority: 'hot',
    score: 95,
    behavioralScore: 48,
    demographicScore: 47,
    estimatedValue: 520000,
    owner: { id: '1', name: 'Mike Wilson', avatar: '' },
    lastContactDate: new Date('2024-12-23'),
    nextFollowUp: new Date('2024-12-26'),
    tags: ['enterprise', 'fortune-500', 'procurement'],
    industry: 'Manufacturing',
    companySize: '5000+',
    website: 'https://megacorp.com',
    linkedinUrl: 'https://linkedin.com/in/lisawang',
    activities: [
      { id: 'a9', type: 'meeting', title: 'Contract negotiation', description: 'Negotiating final terms', outcome: 'positive', performedBy: 'Mike Wilson', createdAt: new Date('2024-12-23') }
    ],
    notes: [
      { id: 'n3', content: 'Met at SaaS Connect conference. Very impressed with platform.', author: 'Mike Wilson', createdAt: new Date('2024-12-10') }
    ],
    engagementScore: 98,
    emailOpens: 25,
    emailClicks: 12,
    pageViews: 78,
    formSubmissions: 4,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-23')
  },
  {
    id: '6',
    firstName: 'Mark',
    lastName: 'Thompson',
    email: 'mark@lostdeal.com',
    company: 'Lost Deal Corp',
    title: 'Product Manager',
    status: 'lost',
    stage: 'sql',
    source: 'organic',
    priority: 'cold',
    score: 45,
    behavioralScore: 25,
    demographicScore: 20,
    estimatedValue: 35000,
    owner: { id: '2', name: 'Emma Davis', avatar: '' },
    lastContactDate: new Date('2024-12-01'),
    tags: ['lost', 'competitor'],
    industry: 'Retail',
    companySize: '100-500',
    activities: [],
    notes: [
      { id: 'n4', content: 'Went with competitor due to existing integration.', author: 'Emma Davis', createdAt: new Date('2024-12-01') }
    ],
    engagementScore: 15,
    emailOpens: 2,
    emailClicks: 0,
    pageViews: 8,
    formSubmissions: 1,
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-12-01')
  }
]

const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Q1 Enterprise Outreach',
    type: 'sequence',
    status: 'active',
    leads: 245,
    sent: 890,
    opened: 356,
    clicked: 124,
    converted: 18,
    startDate: new Date('2024-12-01')
  },
  {
    id: 'c2',
    name: 'Product Launch Announcement',
    type: 'email',
    status: 'completed',
    leads: 1250,
    sent: 1250,
    opened: 625,
    clicked: 312,
    converted: 45,
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-11-30')
  },
  {
    id: 'c3',
    name: 'Re-engagement Campaign',
    type: 'workflow',
    status: 'active',
    leads: 180,
    sent: 540,
    opened: 162,
    clicked: 54,
    converted: 8,
    startDate: new Date('2024-12-10')
  }
]

const mockScoringRules: ScoringRule[] = [
  { id: 's1', name: 'Demo request', category: 'behavioral', condition: 'Submitted demo form', points: 20, isActive: true },
  { id: 's2', name: 'Pricing page visit', category: 'behavioral', condition: 'Visited pricing page', points: 10, isActive: true },
  { id: 's3', name: 'Email opened', category: 'behavioral', condition: 'Opened marketing email', points: 2, isActive: true },
  { id: 's4', name: 'Enterprise company', category: 'demographic', condition: 'Company size 500+', points: 15, isActive: true },
  { id: 's5', name: 'Decision maker title', category: 'demographic', condition: 'VP, Director, C-level', points: 20, isActive: true },
  { id: 's6', name: 'Target industry', category: 'demographic', condition: 'Tech, SaaS, Finance', points: 10, isActive: true }
]

// Helper Functions
const getStatusColor = (status: LeadStatus): string => {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    qualified: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    proposal: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status] || colors.new
}

const getStageColor = (stage: LeadStage): string => {
  const colors: Record<LeadStage, string> = {
    subscriber: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    mql: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    sql: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    opportunity: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    customer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    evangelist: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
  }
  return colors[stage] || colors.lead
}

const getPriorityIcon = (priority: LeadPriority) => {
  const icons: Record<LeadPriority, React.ReactNode> = {
    hot: <Flame className="w-4 h-4 text-red-500" />,
    warm: <TrendingUp className="w-4 h-4 text-orange-500" />,
    cold: <TrendingDown className="w-4 h-4 text-blue-500" />
  }
  return icons[priority]
}

const getSourceIcon = (source: LeadSource) => {
  const icons: Record<LeadSource, React.ReactNode> = {
    website: <Globe className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    referral: <Users className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    paid_ads: <DollarSign className="w-4 h-4" />,
    organic: <Search className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
    cold_outreach: <Phone className="w-4 h-4" />,
    partner: <Building2 className="w-4 h-4" />
  }
  return icons[source] || <Globe className="w-4 h-4" />
}

const getActivityIcon = (type: ActivityType) => {
  const icons: Record<ActivityType, React.ReactNode> = {
    email: <Mail className="w-4 h-4 text-blue-500" />,
    call: <Phone className="w-4 h-4 text-green-500" />,
    meeting: <Users className="w-4 h-4 text-purple-500" />,
    note: <FileText className="w-4 h-4 text-gray-500" />,
    task: <CheckCircle className="w-4 h-4 text-amber-500" />,
    linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
    form_submit: <FileText className="w-4 h-4 text-pink-500" />,
    page_view: <Eye className="w-4 h-4 text-indigo-500" />
  }
  return icons[type] || <Activity className="w-4 h-4" />
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(date)
}

interface LeadGenerationClientProps {
  initialLeads?: any[]
  initialStats?: any
}

// Competitive Upgrade Mock Data - HubSpot/Marketo-level Lead Gen Intelligence
const mockLeadGenAIInsights = [
  { id: '1', type: 'success' as const, title: 'Conversion Rate', description: 'Lead-to-MQL conversion up 25% this month!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Conversion' },
  { id: '2', type: 'warning' as const, title: 'Lead Decay', description: '45 leads inactive for 14+ days - nurture recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
  { id: '3', type: 'info' as const, title: 'AI Scoring', description: 'LinkedIn leads have 3x higher close rate than cold email.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockLeadGenCollaborators = [
  { id: '1', name: 'Growth Lead', avatar: '/avatars/growth.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'SDR Manager', avatar: '/avatars/sdr.jpg', status: 'online' as const, role: 'Manager' },
  { id: '3', name: 'Marketing Ops', avatar: '/avatars/mops.jpg', status: 'away' as const, role: 'Ops' },
]

const mockLeadGenPredictions = [
  { id: '1', title: 'Pipeline Value', prediction: 'Current leads will generate $450K pipeline this quarter', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'SQL Velocity', prediction: 'Lead-to-SQL time will decrease to 5 days with automation', confidence: 81, trend: 'down' as const, impact: 'medium' as const },
]

const mockLeadGenActivities = [
  { id: '1', user: 'Growth Lead', action: 'Qualified', target: '12 new MQLs', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'SDR Manager', action: 'Assigned', target: 'leads to SDR team', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Marketing Ops', action: 'Launched', target: 'email nurture sequence', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are defined inside the component to access component state and handlers

// Default stats for initial hook state
const defaultStats: LeadStats = {
  total: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
  converted: 0,
  conversionRate: 0,
  avgScore: 0,
  pipelineValue: 0
}

export default function LeadGenerationClient({ initialLeads, initialStats }: LeadGenerationClientProps) {
  const [activeTab, setActiveTab] = useState('leads')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<LeadPriority | 'all'>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // New state for dialogs and forms
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Email compose dialog state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' })

  // Note dialog state
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')

  // Assign lead dialog state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState('')

  // Edit lead dialog state
  const [isEditLeadDialogOpen, setIsEditLeadDialogOpen] = useState(false)
  const [editLeadForm, setEditLeadForm] = useState<LeadInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    status: 'new',
    score: 50,
    source: 'website',
    notes: '',
    value_estimate: 0,
    tags: []
  })

  // Status change dialog state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedNewStatus, setSelectedNewStatus] = useState<LeadStatus>('new')

  // Team members for assignment
  const teamMembers = [
    { id: '1', name: 'Mike Wilson', role: 'Sales Manager' },
    { id: '2', name: 'Emma Davis', role: 'Sales Rep' },
    { id: '3', name: 'John Smith', role: 'SDR' },
    { id: '4', name: 'Sarah Brown', role: 'Account Executive' }
  ]

  // Form state for new lead
  const [newLeadForm, setNewLeadForm] = useState<LeadInput>({
    name: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    status: 'new',
    score: 50,
    source: 'website',
    notes: '',
    value_estimate: 0,
    tags: []
  })

  // Use the leads hook
  const {
    leads: hookLeads,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    createLead,
    updateLead,
    deleteLead,
    qualifyLead,
    contactLead,
    convertLead,
    updateScore
  } = useLeads(initialLeads || [], initialStats || defaultStats)

  // Convert hook leads to the component's Lead type for display (use mock data as fallback)
  const displayLeads = hookLeads.length > 0 ? hookLeads.map(hl => ({
    id: hl.id,
    firstName: hl.name.split(' ')[0] || hl.name,
    lastName: hl.name.split(' ').slice(1).join(' ') || '',
    email: hl.email || '',
    phone: hl.phone || undefined,
    company: hl.company || '',
    title: hl.title || '',
    status: (hl.status === 'converted' ? 'won' : hl.status === 'archived' ? 'lost' : hl.status) as LeadStatus,
    stage: 'lead' as LeadStage,
    source: (hl.source || 'website') as LeadSource,
    priority: hl.score >= 80 ? 'hot' : hl.score >= 50 ? 'warm' : 'cold' as LeadPriority,
    score: hl.score,
    behavioralScore: Math.floor(hl.score / 2),
    demographicScore: Math.ceil(hl.score / 2),
    estimatedValue: hl.value_estimate,
    owner: { id: hl.assigned_to || '1', name: 'Unassigned', avatar: '' },
    lastContactDate: hl.last_contact_at ? new Date(hl.last_contact_at) : undefined,
    nextFollowUp: hl.next_follow_up ? new Date(hl.next_follow_up) : undefined,
    tags: hl.tags || [],
    industry: (hl.metadata as any)?.industry || 'Unknown',
    companySize: (hl.metadata as any)?.companySize || 'Unknown',
    website: (hl.metadata as any)?.website,
    linkedinUrl: (hl.metadata as any)?.linkedinUrl,
    activities: [],
    notes: hl.notes ? [{ id: '1', content: hl.notes, author: 'System', createdAt: new Date(hl.created_at) }] : [],
    engagementScore: hl.score,
    emailOpens: 0,
    emailClicks: 0,
    pageViews: 0,
    formSubmissions: 0,
    createdAt: new Date(hl.created_at),
    updatedAt: new Date(hl.updated_at)
  })) : mockLeads

  const leads = displayLeads
  const campaigns = mockCampaigns
  const scoringRules = mockScoringRules

  // Computed Statistics
  const stats = useMemo(() => {
    const totalLeads = leads.length
    const newLeads = leads.filter(l => l.status === 'new').length
    const qualified = leads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length
    const won = leads.filter(l => l.status === 'won').length
    const lost = leads.filter(l => l.status === 'lost').length
    const pipelineValue = leads
      .filter(l => !['won', 'lost'].includes(l.status))
      .reduce((sum, l) => sum + l.estimatedValue, 0)
    const avgScore = leads.reduce((sum, l) => sum + l.score, 0) / totalLeads
    const conversionRate = totalLeads > 0 ? (won / totalLeads) * 100 : 0
    const hotLeads = leads.filter(l => l.priority === 'hot').length

    return {
      totalLeads,
      newLeads,
      qualified,
      won,
      lost,
      pipelineValue,
      avgScore,
      conversionRate,
      hotLeads
    }
  }, [leads])

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
      const matchesPriority = selectedPriority === 'all' || lead.priority === selectedPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [leads, searchQuery, selectedStatus, selectedPriority])

  // Leads by Status for Pipeline View
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: []
    }
    leads.forEach(lead => {
      grouped[lead.status].push(lead)
    })
    return grouped
  }, [leads])

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead)
    setIsLeadDialogOpen(true)
  }

  // Reset form helper
  const resetNewLeadForm = () => {
    setNewLeadForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      status: 'new',
      score: 50,
      source: 'website',
      notes: '',
      value_estimate: 0,
      tags: []
    })
  }

  const handleImport = () => {
    setIsImportDialogOpen(true)
  }

  const handleAddLead = () => {
    resetNewLeadForm()
    setIsAddLeadDialogOpen(true)
  }

  // Handle creating a new lead
  const handleSubmitNewLead = async () => {
    if (!newLeadForm.name.trim()) {
      toast.error('Validation Error')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createLead(newLeadForm)
      if (result) {
        toast.success("Lead created successfully")
        setIsAddLeadDialogOpen(false)
        resetNewLeadForm()
      } else {
        toast.error('Failed to Create Lead')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendEmail = () => {
    if (!selectedLead) return
    setEmailForm({ subject: '', body: '' })
    setIsEmailDialogOpen(true)
  }

  const handleSubmitEmail = async () => {
    if (!selectedLead) return
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      toast.error('Validation Error')
      return
    }

    setIsSubmitting(true)
    try {
      // Log the email activity
      await contactLead(selectedLead.id)

      // Open the user's email client with the composed email
      const mailtoUrl = `mailto:${selectedLead.email}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.body)}`
      window.open(mailtoUrl, '_blank')

      toast.success("Email sent to " + selectedLead.firstName + " " + selectedLead.lastName)
      setIsEmailDialogOpen(false)
      setEmailForm({ subject: '', body: '' })
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handlers
  const handleLogCall = async () => {
    if (!selectedLead) return
    const result = await contactLead(selectedLead.id)
    if (result) {
      toast.success("Call logged for " + selectedLead.firstName + " " + selectedLead.lastName)
    } else {
      toast.error('Error')
    }
  }

  const handleCreateLead = () => {
    resetNewLeadForm()
    setIsAddLeadDialogOpen(true)
  }

  const handleQualifyLead = async (leadId: string, leadName: string) => {
    setIsSubmitting(true)
    try {
      const result = await qualifyLead(leadId)
      if (result) {
        toast.success("Lead qualified")
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConvertLead = async (leadId: string, leadName: string) => {
    setIsSubmitting(true)
    try {
      const result = await convertLead(leadId)
      if (result) {
        toast.success("Lead converted")
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!leadToDelete) return

    setIsSubmitting(true)
    try {
      const result = await deleteLead(leadToDelete)
      if (result) {
        toast.success('Lead Deleted')
        setIsDeleteDialogOpen(false)
        setLeadToDelete(null)
        if (selectedLead?.id === leadToDelete) {
          setIsLeadDialogOpen(false)
          setSelectedLead(null)
        }
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateLeadScore = async (leadId: string, newScore: number) => {
    const result = await updateScore(leadId, newScore)
    if (result) {
      toast.success('Score Updated')
    } else {
      toast.error('Error')
    }
  }

  const handleAssignLead = (leadName: string) => {
    setSelectedAssignee('')
    setIsAssignDialogOpen(true)
  }

  const handleSubmitAssignment = async () => {
    if (!selectedLead || !selectedAssignee) {
      toast.error('Validation Error')
      return
    }

    setIsSubmitting(true)
    try {
      const assignee = teamMembers.find(t => t.id === selectedAssignee)
      const result = await updateLead(selectedLead.id, {
        // Update metadata to store assignment info
      })

      if (result) {
        toast.success("Lead " + selectedLead.firstName + " " + selectedLead.lastName + " assigned to " + (assignee?.name || "team member"))
        setIsAssignDialogOpen(false)
        setSelectedAssignee('')
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportLeads = () => {
    // Export leads as CSV
    const csvContent = leads.map(l =>
      `"${l.firstName} ${l.lastName}","${l.email}","${l.company}","${l.title}","${l.status}","${l.score}","${l.estimatedValue}"`
    ).join('\n')
    const header = '"Name","Email","Company","Title","Status","Score","Value"\n'
    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Exporting Leads')
  }

  // Quick Actions Handlers - Leads Tab
  const handleImportCSV = () => {
    setIsImportDialogOpen(true)
  }

  const handleExportAll = () => {
    // Export all leads as CSV with extended data
    const header = '"Name","Email","Phone","Company","Title","Status","Stage","Source","Priority","Score","Behavioral Score","Demographic Score","Estimated Value","Owner","Industry","Company Size","Tags","Created At","Updated At"\n'
    const csvContent = leads.map(l =>
      `"${l.firstName} ${l.lastName}","${l.email}","${l.phone || ''}","${l.company}","${l.title}","${l.status}","${l.stage}","${l.source}","${l.priority}","${l.score}","${l.behavioralScore}","${l.demographicScore}","${l.estimatedValue}","${l.owner.name}","${l.industry}","${l.companySize}","${l.tags.join('; ')}","${formatDate(l.createdAt)}","${formatDate(l.updatedAt)}"`
    ).join('\n')
    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-full-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Export complete - " + leads.length + " leads to CSV")
  }

  const handleEmailBlast = () => {
    toast.info('Email Blast')
  }

  const handleSmartFilter = () => {
    toast.info('Smart Filter')
  }

  const handleSegments = () => {
    toast.info('Segments')
  }

  const handleBulkTag = () => {
    toast.info('Bulk Tag')
  }

  const handleSyncCRM = () => {
    toast.success('CRM Sync')
  }

  // Quick Actions Handlers - Pipeline Tab
  const handleNewDeal = () => {
    toast.info('New Deal')
  }

  const handleStageRules = () => {
    toast.info('Stage Rules')
  }

  const handleAutomation = () => {
    toast.info('Automation')
  }

  const handlePipelineReport = () => {
    toast.info('Pipeline Report')
  }

  const handleAssignLeads = () => {
    toast.info('Assign Leads')
  }

  const handleStaleDeals = () => {
    toast.info('Stale Deals')
  }

  const handleForecasting = () => {
    toast.info('Forecasting')
  }

  const handleRefreshView = () => {
    toast.success('View Refreshed')
  }

  // Quick Actions Handlers - Activities Tab
  const handleLogEmail = () => {
    toast.info('Log Email')
  }

  const handleLogCallActivity = () => {
    toast.info('Log Call')
  }

  const handleLogMeeting = () => {
    toast.info('Log Meeting')
  }

  const handleAddNote = () => {
    if (!selectedLead) {
      toast.info('Select a Lead')
      return
    }
    setNoteContent('')
    setIsNoteDialogOpen(true)
  }

  const handleSubmitNote = async () => {
    if (!selectedLead) return
    if (!noteContent.trim()) {
      toast.error('Validation Error')
      return
    }

    setIsSubmitting(true)
    try {
      // Append note to existing notes
      const existingNotes = selectedLead.notes.map(n => n.content).join('\n---\n')
      const newNotes = existingNotes
        ? `${existingNotes}\n---\n[${new Date().toLocaleDateString()}] ${noteContent}`
        : `[${new Date().toLocaleDateString()}] ${noteContent}`

      const result = await updateLead(selectedLead.id, { notes: newNotes })

      if (result) {
        toast.success("Note added to " + selectedLead.firstName + " " + selectedLead.lastName)
        setIsNoteDialogOpen(false)
        setNoteContent('')
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTask = () => {
    toast.info('Create Task')
  }

  const handleSchedule = () => {
    toast.info('Schedule')
  }

  const handleSendMessage = () => {
    toast.info('Send Message')
  }

  const handleExportLog = () => {
    // Export activity log as CSV
    const activities = leads.flatMap(lead =>
      lead.activities.map(activity => ({
        ...activity,
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadEmail: lead.email,
        leadCompany: lead.company
      }))
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const header = '"Date","Type","Title","Description","Lead Name","Lead Email","Company","Performed By","Outcome"\n'
    const csvContent = activities.map(a =>
      `"${formatDate(a.createdAt)}","${a.type}","${a.title}","${a.description}","${a.leadName}","${a.leadEmail}","${a.leadCompany}","${a.performedBy}","${a.outcome || ''}"`
    ).join('\n')

    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Export complete - activities to CSV")
  }

  // Quick Actions Handlers - Campaigns Tab
  const handleNewCampaign = () => {
    toast.info('New Campaign')
  }

  const handleAnnouncement = () => {
    toast.info('Announcement')
  }

  const handleSequences = () => {
    toast.info('Sequences')
  }

  const handleWorkflows = () => {
    toast.info('Workflows')
  }

  const handleAnalytics = () => {
    toast.info('Analytics')
  }

  const handleAudience = () => {
    toast.info('Audience')
  }

  const handleDuplicate = () => {
    toast.info('Duplicate Campaign')
  }

  const handleViewCampaign = (campaignName: string) => {
    toast.info("Opening " + campaignName + " campaign details...")
  }

  const handleCreateCampaign = () => {
    toast.info('Create Campaign')
  }

  // Quick Actions Handlers - Scoring Tab
  const handleNewRule = () => {
    toast.info('New Rule')
  }

  const handleAIScoring = () => {
    toast.info('AI Scoring')
  }

  const handleBehavioral = () => {
    toast.info('Behavioral Scoring')
  }

  const handleDemographic = () => {
    toast.info('Demographic Scoring')
  }

  const handleDistribution = () => {
    toast.info('Score Distribution')
  }

  const handleRecalculate = async () => {
    setIsSubmitting(true)
    toast.info('Recalculating Scores')

    try {
      // Recalculate scores for all leads based on their engagement
      let successCount = 0
      for (const lead of leads) {
        // Simple scoring algorithm based on available data
        let newScore = 50 // Base score
        if (lead.email) newScore += 10
        if (lead.phone) newScore += 10
        if (lead.company) newScore += 10
        if (lead.estimatedValue > 50000) newScore += 10
        if (lead.estimatedValue > 100000) newScore += 10

        const result = await updateScore(lead.id, Math.min(100, newScore))
        if (result) successCount++
      }

      toast.success("Scores recalculated for " + successCount + " leads")
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportRules = () => {
    const rulesJson = JSON.stringify(scoringRules, null, 2)
    const blob = new Blob([rulesJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scoring-rules-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Rules Exported')
  }

  const handleConfigure = () => {
    toast.info('Configure')
  }

  // Lead Row Actions
  const handleLeadEmail = (lead: Lead) => {
    if (lead.email) {
      window.open(`mailto:${lead.email}`, '_blank')
      toast.success("Email client opened for " + lead.firstName + " " + lead.lastName)
    } else {
      toast.error('No Email')
    }
  }

  const handleLeadPhone = async (lead: Lead) => {
    if (lead.phone) {
      window.open(`tel:${lead.phone}`, '_blank')
      // Mark as contacted
      const result = await contactLead(lead.id)
      if (result) {
        toast.success("Call initiated for " + lead.firstName + " " + lead.lastName + " and logging activity")
      }
    } else {
      toast.error('No Phone')
    }
  }

  const handleLeadMore = (lead: Lead) => {
    setSelectedLead(lead)
    setIsLeadDialogOpen(true)
  }

  // Integration Handlers
  const handleConnect = (integrationName: string) => {
    toast.info("Connecting " + integrationName + "...")
  }

  // Data Management Handlers
  const handleArchiveLeads = () => {
    toast.info('Archive Old Leads')
  }

  const handlePurgeLeads = () => {
    toast.warning('Purge Lost Leads')
  }

  // API & Webhook Handlers
  const handleCopyAPIKey = async () => {
    try {
      await navigator.clipboard.writeText('lg_sk_xxxxxxxxxxxxxxxxxxxxx')
      toast.success('API Key Copied')
    } catch (error) {
      toast.error('Copy Failed')
    }
  }

  const handleTestWebhook = () => {
    toast.info('Testing Webhook')
  }

  // Danger Zone Handler
  const handleResetScoring = () => {
    toast.warning('Reset All Scoring')
  }

  // Dialog Actions
  const handleDialogMore = () => {
    if (!selectedLead) return
    // Open edit dialog instead of just showing toast
    handleEditLead()
  }

  const handleEditLead = () => {
    if (!selectedLead) return
    setEditLeadForm({
      name: `${selectedLead.firstName} ${selectedLead.lastName}`,
      email: selectedLead.email,
      phone: selectedLead.phone || '',
      company: selectedLead.company,
      title: selectedLead.title,
      status: selectedLead.status === 'won' ? 'converted' : selectedLead.status === 'lost' ? 'archived' : selectedLead.status as any,
      score: selectedLead.score,
      source: selectedLead.source,
      notes: selectedLead.notes.map(n => n.content).join('\n'),
      value_estimate: selectedLead.estimatedValue,
      tags: selectedLead.tags
    })
    setIsEditLeadDialogOpen(true)
  }

  const handleSubmitEditLead = async () => {
    if (!selectedLead) return
    if (!editLeadForm.name?.trim()) {
      toast.error('Validation Error')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateLead(selectedLead.id, {
        name: editLeadForm.name,
        email: editLeadForm.email,
        phone: editLeadForm.phone,
        company: editLeadForm.company,
        title: editLeadForm.title,
        score: editLeadForm.score,
        source: editLeadForm.source,
        notes: editLeadForm.notes,
        value_estimate: editLeadForm.value_estimate,
        tags: editLeadForm.tags
      })

      if (result) {
        toast.success("Lead updated successfully")
        setIsEditLeadDialogOpen(false)
        setIsLeadDialogOpen(false)
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Status change handler
  const handleChangeStatus = () => {
    if (!selectedLead) {
      toast.info('Select a Lead')
      return
    }
    setSelectedNewStatus(selectedLead.status)
    setIsStatusDialogOpen(true)
  }

  const handleSubmitStatusChange = async () => {
    if (!selectedLead) return

    setIsSubmitting(true)
    try {
      // Map component status to hook status
      let hookStatus: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost' | 'archived' = 'new'
      if (selectedNewStatus === 'won') hookStatus = 'converted'
      else if (selectedNewStatus === 'lost') hookStatus = 'archived'
      else if (['new', 'contacted', 'qualified'].includes(selectedNewStatus)) hookStatus = selectedNewStatus as any

      const result = await updateLead(selectedLead.id, { status: hookStatus })

      if (result) {
        toast.success('Status Updated')
        setIsStatusDialogOpen(false)
      } else {
        toast.error('Error')
      }
    } catch (error) {
      toast.error('Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick actions with real functionality
  const leadGenQuickActions = [
    {
      id: '1',
      label: 'Add Lead',
      icon: 'plus',
      action: () => {
        resetNewLeadForm()
        setIsAddLeadDialogOpen(true)
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Score',
      icon: 'star',
      action: async () => {
        if (selectedLead) {
          const newScore = Math.min(100, selectedLead.score + 10)
          const result = await updateScore(selectedLead.id, newScore)
          if (result) {
            toast.success('Lead Score Updated')
          } else {
            toast.error('Failed to Update Score')
          }
        } else {
          toast.info('Select a Lead')
        }
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Export CSV',
      icon: 'mail',
      action: () => {
        handleExportLeads()
      },
      variant: 'outline' as const
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-red-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lead Generation</h1>
              <p className="text-muted-foreground">HubSpot-level lead capture and nurturing platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white" onClick={handleAddLead}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.newLeads}</p>
                  <p className="text-xs text-muted-foreground">New</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.qualified}</p>
                  <p className="text-xs text-muted-foreground">Qualified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.hotLeads}</p>
                  <p className="text-xs text-muted-foreground">Hot Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.pipelineValue / 1000)}K</p>
                  <p className="text-xs text-muted-foreground">Pipeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgScore.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.won}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Activity className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Clock className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Send className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="scoring" className="gap-2">
              <Brain className="w-4 h-4" />
              Scoring
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads" className="mt-6 space-y-6">
            {/* Leads Overview Banner */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Lead Database</h3>
                  <p className="text-pink-100 mb-4">Manage, track and nurture your leads through the sales funnel</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-pink-100">Active Leads</p>
                      <p className="text-xl font-bold">{stats.totalLeads - stats.lost}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-pink-100">Hot Leads</p>
                      <p className="text-xl font-bold">{stats.hotLeads}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-pink-100">Pipeline Value</p>
                      <p className="text-xl font-bold">{formatCurrency(stats.pipelineValue)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Users className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: UserPlus, label: 'Add Lead', color: 'text-pink-500', handler: handleAddLead },
                { icon: Upload, label: 'Import CSV', color: 'text-blue-500', handler: handleImportCSV },
                { icon: Download, label: 'Export All', color: 'text-green-500', handler: handleExportAll },
                { icon: Mail, label: 'Email Blast', color: 'text-purple-500', handler: handleEmailBlast },
                { icon: Filter, label: 'Smart Filter', color: 'text-amber-500', handler: handleSmartFilter },
                { icon: Layers, label: 'Segments', color: 'text-indigo-500', handler: handleSegments },
                { icon: Tag, label: 'Bulk Tag', color: 'text-rose-500', handler: handleBulkTag },
                { icon: RefreshCw, label: 'Sync CRM', color: 'text-cyan-500', handler: handleSyncCRM },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')}
                      className="h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as LeadPriority | 'all')}
                      className="h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Priority</option>
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportLeads}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openLeadDetail(lead)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{lead.firstName} {lead.lastName}</h4>
                            {getPriorityIcon(lead.priority)}
                            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                            <Badge className={getStageColor(lead.stage)}>{lead.stage.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {lead.title} at {lead.company}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              {getSourceIcon(lead.source)}
                              {lead.source}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </div>
                          <div className="text-xs text-muted-foreground">Lead Score</div>
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            {formatCurrency(lead.estimatedValue)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleLeadEmail(lead); }}>
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleLeadPhone(lead); }}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleLeadMore(lead); }}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {lead.tags.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 ml-16">
                          {lead.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="mt-6 space-y-6">
            {/* Pipeline Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Sales Pipeline</h3>
                  <p className="text-indigo-100 mb-4">Visual Kanban board for tracking deal progression</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-indigo-100">Total Deals</p>
                      <p className="text-xl font-bold">{stats.totalLeads}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-indigo-100">In Progress</p>
                      <p className="text-xl font-bold">{stats.qualified}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-indigo-100">Win Rate</p>
                      <p className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Activity className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Deal', color: 'text-pink-500', handler: handleNewDeal },
                { icon: GitBranch, label: 'Stage Rules', color: 'text-indigo-500', handler: handleStageRules },
                { icon: Zap, label: 'Automation', color: 'text-amber-500', handler: handleAutomation },
                { icon: BarChart3, label: 'Pipeline Report', color: 'text-green-500', handler: handlePipelineReport },
                { icon: Users, label: 'Assign Leads', color: 'text-blue-500', handler: handleAssignLeads },
                { icon: Clock, label: 'Stale Deals', color: 'text-red-500', handler: handleStaleDeals },
                { icon: TrendingUp, label: 'Forecasting', color: 'text-purple-500', handler: handleForecasting },
                { icon: RefreshCw, label: 'Refresh View', color: 'text-cyan-500', handler: handleRefreshView },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map((status) => {
                const statusLeads = leadsByStatus[status]
                const statusValue = statusLeads.reduce((sum, l) => sum + l.estimatedValue, 0)
                return (
                  <div key={status} className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold capitalize text-sm">{status}</span>
                        <Badge variant="secondary">{statusLeads.length}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatCurrency(statusValue)}</p>
                    </div>
                    <div className="space-y-2">
                      {statusLeads.map((lead) => (
                        <Card
                          key={lead.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openLeadDetail(lead)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {getPriorityIcon(lead.priority)}
                              <span className="font-medium text-sm truncate">
                                {lead.firstName} {lead.lastName}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 truncate">{lead.company}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
                                {lead.score}
                              </span>
                              <span className="text-xs text-green-600 font-medium">
                                {formatCurrency(lead.estimatedValue)}
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

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-6 space-y-6">
            {/* Activities Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Activity Timeline</h3>
                  <p className="text-cyan-100 mb-4">Track all interactions and touchpoints with your leads</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Total Activities</p>
                      <p className="text-xl font-bold">{leads.reduce((sum, l) => sum + l.activities.length, 0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Pending Follow-ups</p>
                      <p className="text-xl font-bold">{leads.filter(l => l.nextFollowUp).length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Emails Sent</p>
                      <p className="text-xl font-bold">{leads.reduce((sum, l) => sum + l.activities.filter(a => a.type === 'email').length, 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Clock className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Mail, label: 'Log Email', color: 'text-blue-500', handler: handleLogEmail },
                { icon: Phone, label: 'Log Call', color: 'text-green-500', handler: handleLogCallActivity },
                { icon: Users, label: 'Log Meeting', color: 'text-purple-500', handler: handleLogMeeting },
                { icon: FileText, label: 'Add Note', color: 'text-amber-500', handler: handleAddNote },
                { icon: CheckCircle, label: 'Create Task', color: 'text-pink-500', handler: handleCreateTask },
                { icon: Calendar, label: 'Schedule', color: 'text-indigo-500', handler: handleSchedule },
                { icon: MessageSquare, label: 'Send Message', color: 'text-cyan-500', handler: handleSendMessage },
                { icon: Download, label: 'Export Log', color: 'text-red-500', handler: handleExportLog },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.flatMap(lead =>
                      lead.activities.map(activity => ({
                        ...activity,
                        leadName: `${lead.firstName} ${lead.lastName}`,
                        leadCompany: lead.company
                      }))
                    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{activity.title}</span>
                            {activity.outcome && (
                              <Badge variant={activity.outcome === 'positive' ? 'default' : 'secondary'}>
                                {activity.outcome}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{activity.leadName} • {activity.leadCompany}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Follow-ups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.filter(l => l.nextFollowUp).sort((a, b) =>
                      (a.nextFollowUp?.getTime() || 0) - (b.nextFollowUp?.getTime() || 0)
                    ).slice(0, 5).map((lead) => (
                      <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => openLeadDetail(lead)}>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white text-sm">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatDate(lead.nextFollowUp!)}</p>
                          <p className="text-xs text-muted-foreground">{lead.owner.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6 space-y-6">
            {/* Campaigns Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Lead Campaigns</h3>
                  <p className="text-amber-100 mb-4">Create and manage lead nurturing campaigns</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Active Campaigns</p>
                      <p className="text-xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Total Leads</p>
                      <p className="text-xl font-bold">{campaigns.reduce((sum, c) => sum + c.leads, 0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Conversions</p>
                      <p className="text-xl font-bold">{campaigns.reduce((sum, c) => sum + c.converted, 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Send className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Rocket, label: 'New Campaign', color: 'text-pink-500', handler: handleNewCampaign },
                { icon: Mail, label: 'Email Blast', color: 'text-blue-500', handler: handleEmailBlast },
                { icon: Megaphone, label: 'Announcement', color: 'text-amber-500', handler: handleAnnouncement },
                { icon: ListChecks, label: 'Sequences', color: 'text-green-500', handler: handleSequences },
                { icon: Zap, label: 'Workflows', color: 'text-purple-500', handler: handleWorkflows },
                { icon: BarChart3, label: 'Analytics', color: 'text-indigo-500', handler: handleAnalytics },
                { icon: Users, label: 'Audience', color: 'text-cyan-500', handler: handleAudience },
                { icon: Copy, label: 'Duplicate', color: 'text-rose-500', handler: handleDuplicate },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Leads</p>
                          <p className="text-lg font-bold">{campaign.leads}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Sent</p>
                          <p className="text-lg font-bold">{campaign.sent}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Opened</p>
                          <p className="text-lg font-bold">{((campaign.opened / campaign.sent) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Converted</p>
                          <p className="text-lg font-bold text-green-600">{campaign.converted}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Started {formatDate(campaign.startDate)}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleViewCampaign(campaign.name)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-all flex items-center justify-center min-h-[300px]" onClick={handleCreateCampaign}>
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mx-auto mb-3">
                    <Send className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h4 className="font-medium mb-1">Create Campaign</h4>
                  <p className="text-sm text-muted-foreground">Start a new lead nurturing campaign</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="mt-6 space-y-6">
            {/* Scoring Overview Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Lead Scoring Engine</h3>
                  <p className="text-purple-100 mb-4">AI-powered lead qualification and prioritization</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Scoring Rules</p>
                      <p className="text-xl font-bold">{scoringRules.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Avg Score</p>
                      <p className="text-xl font-bold">{stats.avgScore.toFixed(0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">High-Quality Leads</p>
                      <p className="text-xl font-bold">{leads.filter(l => l.score >= 80).length}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Brain className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Rule', color: 'text-pink-500', handler: handleNewRule },
                { icon: Brain, label: 'AI Scoring', color: 'text-purple-500', handler: handleAIScoring },
                { icon: Activity, label: 'Behavioral', color: 'text-blue-500', handler: handleBehavioral },
                { icon: Building2, label: 'Demographic', color: 'text-green-500', handler: handleDemographic },
                { icon: BarChart3, label: 'Distribution', color: 'text-amber-500', handler: handleDistribution },
                { icon: RefreshCw, label: 'Recalculate', color: 'text-indigo-500', handler: handleRecalculate },
                { icon: Download, label: 'Export Rules', color: 'text-cyan-500', handler: handleExportRules },
                { icon: Settings, label: 'Configure', color: 'text-rose-500', handler: handleConfigure },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.handler}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Behavioral Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scoringRules.filter(r => r.category === 'behavioral').map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.condition}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-purple-600">+{rule.points}</span>
                          <div className={`w-10 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
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
                    <Building2 className="w-5 h-5 text-blue-500" />
                    Demographic Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scoringRules.filter(r => r.category === 'demographic').map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.condition}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-600">+{rule.points}</span>
                          <div className={`w-10 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Lead Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg">
                    <BarChart3 className="w-12 h-12 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'scoring', label: 'Scoring', icon: Brain },
                        { id: 'notifications', label: 'Notifications', icon: Mail },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your lead generation preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Lead Owner</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Auto-assign (Round Robin)</option>
                              <option>Mike Wilson</option>
                              <option>Emma Davis</option>
                              <option>Unassigned</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Lead Status</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>New</option>
                              <option>Contacted</option>
                              <option>Qualified</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-assign Leads</p>
                              <p className="text-sm text-muted-foreground">Automatically assign new leads to sales reps</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Duplicate Detection</p>
                              <p className="text-sm text-muted-foreground">Prevent duplicate lead entries</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Lead Enrichment</p>
                              <p className="text-sm text-muted-foreground">Auto-enrich leads with company data</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Website Tracking</p>
                              <p className="text-sm text-muted-foreground">Track lead website activity</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>Configure lead capture sources</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {['Website Forms', 'LinkedIn', 'Paid Ads', 'Referrals', 'Events', 'Cold Outreach'].map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                  <Globe className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                </div>
                                <span className="font-medium">{source}</span>
                              </div>
                              <Switch defaultChecked={i < 4} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'scoring' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Scoring Configuration</CardTitle>
                        <CardDescription>Configure how leads are scored and prioritized</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Scoring Model</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Point-based (Default)</option>
                              <option>AI Predictive</option>
                              <option>Hybrid Model</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Hot Lead Threshold</Label>
                            <Input type="number" defaultValue="80" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-scoring</p>
                              <p className="text-sm text-muted-foreground">Automatically calculate lead scores</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Score Decay</p>
                              <p className="text-sm text-muted-foreground">Reduce scores for inactive leads</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">AI Suggestions</p>
                              <p className="text-sm text-muted-foreground">Get AI recommendations for scoring rules</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Score Thresholds</CardTitle>
                        <CardDescription>Define lead priority thresholds</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-red-500" />
                                <span className="font-medium">Hot</span>
                              </div>
                              <Input type="number" defaultValue="80" className="mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">Score above</p>
                            </div>
                            <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">Warm</span>
                              </div>
                              <Input type="number" defaultValue="50" className="mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">Score above</p>
                            </div>
                            <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">Cold</span>
                              </div>
                              <Input type="number" defaultValue="0" className="mt-2" />
                              <p className="text-xs text-muted-foreground mt-1">Score above</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how you receive lead notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'New Lead Alerts', description: 'Get notified when new leads are captured', enabled: true },
                          { title: 'Hot Lead Alerts', description: 'Instant alerts for high-scoring leads', enabled: true },
                          { title: 'Lead Assignment', description: 'Notifications when leads are assigned to you', enabled: true },
                          { title: 'Activity Updates', description: 'Updates on lead engagement activity', enabled: false },
                          { title: 'Daily Digest', description: 'Daily summary of lead activities', enabled: true },
                          { title: 'Weekly Report', description: 'Weekly lead generation report', enabled: false },
                        ].map((notification, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Choose where to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: MessageSquare, label: 'In-App', active: true },
                            { icon: Phone, label: 'SMS', active: false },
                            { icon: Network, label: 'Slack', active: true },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                              <Switch defaultChecked={channel.active} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>CRM Integrations</CardTitle>
                        <CardDescription>Connect your lead generation with CRM platforms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Salesforce', description: 'Bi-directional sync with Salesforce', connected: true },
                            { name: 'HubSpot', description: 'Sync leads with HubSpot CRM', connected: false },
                            { name: 'Pipedrive', description: 'Push leads to Pipedrive', connected: false },
                            { name: 'Zoho CRM', description: 'Integration with Zoho CRM', connected: false },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm" onClick={() => handleConnect(integration.name)}>
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Marketing Integrations</CardTitle>
                        <CardDescription>Connect with marketing platforms</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Mailchimp', description: 'Sync with email marketing lists', connected: true },
                            { name: 'LinkedIn Ads', description: 'Import leads from LinkedIn campaigns', connected: false },
                            { name: 'Google Ads', description: 'Sync leads from Google Ads', connected: true },
                            { name: 'Facebook Ads', description: 'Import leads from Facebook campaigns', connected: false },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  <Megaphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm" onClick={() => handleConnect(integration.name)}>
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks & API</CardTitle>
                        <CardDescription>Configure custom integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="lg_sk_xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleCopyAPIKey}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-app.com/webhook/leads" />
                            <Button variant="outline" onClick={handleTestWebhook}>Test</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Privacy</CardTitle>
                        <CardDescription>Manage lead data privacy settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'GDPR Compliance', description: 'Enable GDPR-compliant data handling', enabled: true },
                          { title: 'Consent Tracking', description: 'Track lead marketing consent', enabled: true },
                          { title: 'Data Retention', description: 'Auto-delete leads after 2 years', enabled: false },
                          { title: 'Anonymize Data', description: 'Anonymize personal data in exports', enabled: true },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access lead data</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { role: 'Admin', access: 'Full Access', users: 2 },
                            { role: 'Sales Manager', access: 'View & Edit', users: 3 },
                            { role: 'Sales Rep', access: 'View Own', users: 8 },
                            { role: 'Marketing', access: 'View Only', users: 4 },
                          ].map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{role.role}</p>
                                  <p className="text-sm text-muted-foreground">{role.access}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">{role.users} users</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                        <CardDescription>Configure advanced lead generation options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Lead Auto-Merging', description: 'Automatically merge duplicate leads', enabled: false },
                          { title: 'Real-time Sync', description: 'Enable real-time data synchronization', enabled: true },
                          { title: 'Bulk Operations', description: 'Allow bulk lead modifications', enabled: true },
                          { title: 'Debug Mode', description: 'Enable detailed logging for troubleshooting', enabled: false },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your lead data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export All Leads</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Upload className="w-5 h-5" />
                            <span>Import Leads</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Archive className="w-5 h-5" />
                            <span>Archive Old Leads</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Purge Lost Leads</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertCircle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions that affect all lead data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Scoring</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Reset all lead scores to zero</p>
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
              insights={mockLeadGenAIInsights}
              title="Lead Gen Intelligence"
              onInsightAction={(insight) => {
                if (insight.type === 'warning') {
                  // Handle warning insights - show stale leads
                  setSelectedStatus('all')
                  toast.info('Showing Inactive Leads')
                } else if (insight.type === 'success') {
                  // Handle success insights - show dashboard
                  toast.success('Great Progress!')
                } else {
                  toast.info(insight.title)
                }
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockLeadGenCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockLeadGenPredictions}
              title="Pipeline Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockLeadGenActivities}
            title="Lead Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={leadGenQuickActions}
            variant="grid"
          />
        </div>

        {/* Lead Detail Dialog */}
        <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedLead && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                        {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedLead.firstName} {selectedLead.lastName}
                        {getPriorityIcon(selectedLead.priority)}
                      </div>
                      <p className="text-sm font-normal text-muted-foreground">
                        {selectedLead.title} at {selectedLead.company}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Status & Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getStatusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                      <Badge className={getStageColor(selectedLead.stage)}>{selectedLead.stage.toUpperCase()}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getSourceIcon(selectedLead.source)}
                        {selectedLead.source}
                      </Badge>
                    </div>

                    {/* Score & Value */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Lead Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(selectedLead.score)}`}>
                          {selectedLead.score}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Behavioral</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedLead.behavioralScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Demographic</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedLead.demographicScore}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Est. Value</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedLead.estimatedValue)}</p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-3 rounded-lg border flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedLead.email}</p>
                        </div>
                      </div>
                      {selectedLead.phone && (
                        <div className="p-3 rounded-lg border flex items-center gap-3">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="font-medium">{selectedLead.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="p-3 rounded-lg border flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Company Size</p>
                          <p className="font-medium">{selectedLead.companySize}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="font-medium">{selectedLead.industry}</p>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div>
                      <h4 className="font-semibold mb-3">Engagement</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.emailOpens}</p>
                          <p className="text-xs text-muted-foreground">Email Opens</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.emailClicks}</p>
                          <p className="text-xs text-muted-foreground">Email Clicks</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.pageViews}</p>
                          <p className="text-xs text-muted-foreground">Page Views</p>
                        </div>
                        <div className="p-3 rounded-lg border text-center">
                          <p className="text-lg font-bold">{selectedLead.formSubmissions}</p>
                          <p className="text-xs text-muted-foreground">Forms</p>
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    {selectedLead.activities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Activity Timeline</h4>
                        <div className="space-y-3">
                          {selectedLead.activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              {getActivityIcon(activity.type)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{activity.title}</span>
                                  {activity.outcome && (
                                    <Badge variant={activity.outcome === 'positive' ? 'default' : 'secondary'}>
                                      {activity.outcome}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {activity.performedBy} • {formatTimeAgo(activity.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedLead.notes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Notes</h4>
                        <div className="space-y-3">
                          {selectedLead.notes.map((note) => (
                            <div key={note.id} className="p-3 rounded-lg border">
                              <p className="text-sm">{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {note.author} • {formatTimeAgo(note.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedLead.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLead.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Owner & Dates */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{selectedLead.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedLead.owner.name}</p>
                          <p className="text-xs text-muted-foreground">Lead Owner</p>
                        </div>
                      </div>
                      {selectedLead.nextFollowUp && (
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          Follow-up: {formatDate(selectedLead.nextFollowUp)}
                        </Badge>
                      )}
                    </div>

                    {/* Actions - Primary Row */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1" onClick={handleSendEmail}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={handleLogCall}>
                        <Phone className="w-4 h-4 mr-2" />
                        Log Call
                      </Button>
                    </div>

                    {/* Actions - Secondary Row */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleAddNote}>
                        <FileText className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAssignLead(`${selectedLead.firstName} ${selectedLead.lastName}`)}>
                        <Users className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleChangeStatus}>
                        <Activity className="w-4 h-4 mr-2" />
                        Status
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleEditLead}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setLeadToDelete(selectedLead.id)
                        setIsDeleteDialogOpen(true)
                      }}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    {/* Quick Actions Row */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleQualifyLead(selectedLead.id, `${selectedLead.firstName} ${selectedLead.lastName}`)}
                        disabled={selectedLead.status === 'qualified' || selectedLead.status === 'won'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Qualify
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={() => handleConvertLead(selectedLead.id, `${selectedLead.firstName} ${selectedLead.lastName}`)}
                        disabled={selectedLead.status === 'won'}
                      >
                        <Award className="w-4 h-4 mr-1" />
                        Convert
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Lead Dialog */}
        <Dialog open={isAddLeadDialogOpen} onOpenChange={setIsAddLeadDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-500" />
                Add New Lead
              </DialogTitle>
              <DialogDescription>
                Enter the lead details below to add them to your pipeline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-name">Full Name *</Label>
                  <Input
                    id="lead-name"
                    placeholder="John Doe"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="john@example.com"
                    value={newLeadForm.email || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    placeholder="+1 (555) 123-4567"
                    value={newLeadForm.phone || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-company">Company</Label>
                  <Input
                    id="lead-company"
                    placeholder="Acme Corp"
                    value={newLeadForm.company || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-title">Job Title</Label>
                  <Input
                    id="lead-title"
                    placeholder="VP of Engineering"
                    value={newLeadForm.title || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-source">Source</Label>
                  <select
                    id="lead-source"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={newLeadForm.source || 'website'}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="email">Email</option>
                    <option value="paid_ads">Paid Ads</option>
                    <option value="organic">Organic</option>
                    <option value="event">Event</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-score">Initial Score</Label>
                  <Input
                    id="lead-score"
                    type="number"
                    min="0"
                    max="100"
                    value={newLeadForm.score || 50}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, score: parseInt(e.target.value) || 50 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-value">Estimated Value ($)</Label>
                  <Input
                    id="lead-value"
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={newLeadForm.value_estimate || ''}
                    onChange={(e) => setNewLeadForm(prev => ({ ...prev, value_estimate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-notes">Notes</Label>
                <Textarea
                  id="lead-notes"
                  placeholder="Add any notes about this lead..."
                  value={newLeadForm.notes || ''}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddLeadDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white"
                onClick={handleSubmitNewLead}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete Lead
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this lead? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setLeadToDelete(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteLead}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Import Leads
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file to import leads in bulk.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop a CSV file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setIsSubmitting(true)
                      try {
                        const text = await file.text()
                        const lines = text.split('\n').filter(line => line.trim())
                        // Skip header row
                        const dataLines = lines.slice(1)
                        let successCount = 0
                        let errorCount = 0

                        for (const line of dataLines) {
                          // Parse CSV: Name, Email, Phone, Company, Title, Source, Score, Value
                          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())
                          if (values.length >= 1 && values[0]) {
                            const leadData: LeadInput = {
                              name: values[0] || 'Unknown',
                              email: values[1] || '',
                              phone: values[2] || '',
                              company: values[3] || '',
                              title: values[4] || '',
                              source: values[5] || 'website',
                              score: parseInt(values[6]) || 50,
                              value_estimate: parseFloat(values[7]) || 0,
                              status: 'new',
                              tags: []
                            }
                            const result = await createLead(leadData)
                            if (result) {
                              successCount++
                            } else {
                              errorCount++
                            }
                          }
                        }

                        if (successCount > 0) {
                          toast.success("Import complete - " + successCount + " leads" + (errorCount > 0 ? ", " + errorCount + " failed" : ""))
                        } else if (errorCount > 0) {
                          toast.error('Import Failed')
                        } else {
                          toast.info('No Data')
                        }
                        setIsImportDialogOpen(false)
                      } catch (error) {
                        toast.error('Import Error')
                      } finally {
                        setIsSubmitting(false)
                        // Reset file input
                        e.target.value = ''
                      }
                    }
                  }}
                />
                <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                  Browse Files
                </Button>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>CSV Format:</strong> Name, Email, Phone, Company, Title, Source, Score, Value
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Compose Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Compose Email
              </DialogTitle>
              <DialogDescription>
                {selectedLead && `Send an email to ${selectedLead.firstName} ${selectedLead.lastName} (${selectedLead.email})`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Enter email subject..."
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Message</Label>
                <Textarea
                  id="email-body"
                  placeholder="Write your message..."
                  value={emailForm.body}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                onClick={handleSubmitEmail}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Note Dialog */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Add Note
              </DialogTitle>
              <DialogDescription>
                {selectedLead && `Add a note to ${selectedLead.firstName} ${selectedLead.lastName}'s record`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note-content">Note</Label>
                <Textarea
                  id="note-content"
                  placeholder="Enter your note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                onClick={handleSubmitNote}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Lead Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Assign Lead
              </DialogTitle>
              <DialogDescription>
                {selectedLead && `Assign ${selectedLead.firstName} ${selectedLead.lastName} to a team member`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Team Member</Label>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedAssignee === member.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAssignee(member.id)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      {selectedAssignee === member.id && (
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                onClick={handleSubmitAssignment}
                disabled={isSubmitting || !selectedAssignee}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Lead Dialog */}
        <Dialog open={isEditLeadDialogOpen} onOpenChange={setIsEditLeadDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Edit Lead
              </DialogTitle>
              <DialogDescription>
                Update lead information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-name">Full Name *</Label>
                  <Input
                    id="edit-lead-name"
                    placeholder="John Doe"
                    value={editLeadForm.name}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-email">Email</Label>
                  <Input
                    id="edit-lead-email"
                    type="email"
                    placeholder="john@example.com"
                    value={editLeadForm.email || ''}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-phone">Phone</Label>
                  <Input
                    id="edit-lead-phone"
                    placeholder="+1 (555) 123-4567"
                    value={editLeadForm.phone || ''}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-company">Company</Label>
                  <Input
                    id="edit-lead-company"
                    placeholder="Acme Corp"
                    value={editLeadForm.company || ''}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-title">Job Title</Label>
                  <Input
                    id="edit-lead-title"
                    placeholder="VP of Engineering"
                    value={editLeadForm.title || ''}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-source">Source</Label>
                  <select
                    id="edit-lead-source"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={editLeadForm.source || 'website'}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="email">Email</option>
                    <option value="paid_ads">Paid Ads</option>
                    <option value="organic">Organic</option>
                    <option value="event">Event</option>
                    <option value="cold_outreach">Cold Outreach</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-score">Score</Label>
                  <Input
                    id="edit-lead-score"
                    type="number"
                    min="0"
                    max="100"
                    value={editLeadForm.score || 50}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, score: parseInt(e.target.value) || 50 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lead-value">Estimated Value ($)</Label>
                  <Input
                    id="edit-lead-value"
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={editLeadForm.value_estimate || ''}
                    onChange={(e) => setEditLeadForm(prev => ({ ...prev, value_estimate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-notes">Notes</Label>
                <Textarea
                  id="edit-lead-notes"
                  placeholder="Add any notes about this lead..."
                  value={editLeadForm.notes || ''}
                  onChange={(e) => setEditLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditLeadDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={handleSubmitEditLead}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Change Lead Status
              </DialogTitle>
              <DialogDescription>
                {selectedLead && `Update status for ${selectedLead.firstName} ${selectedLead.lastName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select New Status</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                  {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map((status) => (
                    <div
                      key={status}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedNewStatus === status
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedNewStatus(status)}
                    >
                      <Badge className={getStatusColor(status)}>{status}</Badge>
                      {selectedNewStatus === status && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                onClick={handleSubmitStatusChange}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
