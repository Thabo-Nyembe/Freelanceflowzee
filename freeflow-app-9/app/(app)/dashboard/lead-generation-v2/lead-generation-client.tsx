"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Star,
  Filter,
  MoreVertical,
  Building2,
  Globe,
  Calendar,
  MessageSquare,
  Send,
  Eye,
  Edit3,
  UserPlus,
  UserCheck,
  UserX,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Link2,
  ExternalLink,
  Tag,
  Briefcase,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Brain,
  Linkedin,
  Twitter,
  Facebook,
  ChevronRight,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Copy,
  Share2,
  Heart,
  Flame,
  Sliders,
  Webhook,
  Key,
  Database,
  HardDrive,
  Terminal,
  Shield,
  Archive,
  Lock,
  Palette,
  Layers,
  Rocket,
  Megaphone,
  ListChecks,
  GitBranch,
  Network
} from 'lucide-react'

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

export default function LeadGenerationClient({ initialLeads, initialStats }: LeadGenerationClientProps) {
  const [activeTab, setActiveTab] = useState('leads')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<LeadPriority | 'all'>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  const leads = mockLeads
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
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
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
                { icon: UserPlus, label: 'Add Lead', color: 'text-pink-500' },
                { icon: Upload, label: 'Import CSV', color: 'text-blue-500' },
                { icon: Download, label: 'Export All', color: 'text-green-500' },
                { icon: Mail, label: 'Email Blast', color: 'text-purple-500' },
                { icon: Filter, label: 'Smart Filter', color: 'text-amber-500' },
                { icon: Layers, label: 'Segments', color: 'text-indigo-500' },
                { icon: Tag, label: 'Bulk Tag', color: 'text-rose-500' },
                { icon: RefreshCw, label: 'Sync CRM', color: 'text-cyan-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
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
                    <Button variant="outline" size="sm">
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
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
                { icon: Plus, label: 'New Deal', color: 'text-pink-500' },
                { icon: GitBranch, label: 'Stage Rules', color: 'text-indigo-500' },
                { icon: Zap, label: 'Automation', color: 'text-amber-500' },
                { icon: BarChart3, label: 'Pipeline Report', color: 'text-green-500' },
                { icon: Users, label: 'Assign Leads', color: 'text-blue-500' },
                { icon: Clock, label: 'Stale Deals', color: 'text-red-500' },
                { icon: TrendingUp, label: 'Forecasting', color: 'text-purple-500' },
                { icon: RefreshCw, label: 'Refresh View', color: 'text-cyan-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
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
                { icon: Mail, label: 'Log Email', color: 'text-blue-500' },
                { icon: Phone, label: 'Log Call', color: 'text-green-500' },
                { icon: Users, label: 'Log Meeting', color: 'text-purple-500' },
                { icon: FileText, label: 'Add Note', color: 'text-amber-500' },
                { icon: CheckCircle, label: 'Create Task', color: 'text-pink-500' },
                { icon: Calendar, label: 'Schedule', color: 'text-indigo-500' },
                { icon: MessageSquare, label: 'Send Message', color: 'text-cyan-500' },
                { icon: Download, label: 'Export Log', color: 'text-red-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
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
                { icon: Rocket, label: 'New Campaign', color: 'text-pink-500' },
                { icon: Mail, label: 'Email Blast', color: 'text-blue-500' },
                { icon: Megaphone, label: 'Announcement', color: 'text-amber-500' },
                { icon: ListChecks, label: 'Sequences', color: 'text-green-500' },
                { icon: Zap, label: 'Workflows', color: 'text-purple-500' },
                { icon: BarChart3, label: 'Analytics', color: 'text-indigo-500' },
                { icon: Users, label: 'Audience', color: 'text-cyan-500' },
                { icon: Copy, label: 'Duplicate', color: 'text-rose-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
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
                      <div className="grid grid-cols-2 gap-4">
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
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-all flex items-center justify-center min-h-[300px]">
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
                { icon: Plus, label: 'New Rule', color: 'text-pink-500' },
                { icon: Brain, label: 'AI Scoring', color: 'text-purple-500' },
                { icon: Activity, label: 'Behavioral', color: 'text-blue-500' },
                { icon: Building2, label: 'Demographic', color: 'text-green-500' },
                { icon: BarChart3, label: 'Distribution', color: 'text-amber-500' },
                { icon: RefreshCw, label: 'Recalculate', color: 'text-indigo-500' },
                { icon: Download, label: 'Export Rules', color: 'text-cyan-500' },
                { icon: Settings, label: 'Configure', color: 'text-rose-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
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
                          <div className="grid grid-cols-3 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
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
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
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
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
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
                            <Button variant="outline"><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-app.com/webhook/leads" />
                            <Button variant="outline">Test</Button>
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
                        <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-4 gap-4">
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

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button className="flex-1">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Log Call
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
