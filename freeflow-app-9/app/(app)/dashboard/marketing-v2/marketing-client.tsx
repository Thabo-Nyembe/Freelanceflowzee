"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Megaphone,
  Target,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Share2,
  Award,
  BarChart3,
  Globe,
  Mail,
  Sparkles,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  Clock,
  Star,
  DollarSign,
  Zap,
  Send,
  FileText,
  Image,
  Video,
  Layers,
  GitBranch,
  ArrowRight,
  RefreshCw,
  Settings,
  MoreHorizontal,
  ExternalLink,
  Phone,
  Building,
  MapPin,
  Activity,
  PieChart,
  TrendingDown,
  MessageSquare,
  Heart,
  Bookmark
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES - HubSpot Level Marketing Platform
// ============================================================================

type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
type CampaignType = 'email' | 'social' | 'ppc' | 'content' | 'event' | 'influencer'
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
type LeadSource = 'website' | 'referral' | 'social' | 'email' | 'ads' | 'event' | 'cold'
type EmailStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
type ContentType = 'blog' | 'social' | 'email' | 'video' | 'infographic' | 'ebook' | 'webinar'
type ContentStatus = 'idea' | 'writing' | 'review' | 'scheduled' | 'published'
type WorkflowStatus = 'active' | 'paused' | 'draft'

interface Campaign {
  id: string
  name: string
  description: string
  type: CampaignType
  status: CampaignStatus
  startDate: string
  endDate: string
  budget: number
  spent: number
  reach: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  roi: number
  owner: string
  ownerAvatar: string
  channels: string[]
  tags: string[]
  abTest?: {
    variant: 'A' | 'B'
    conversion: number
  }
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  title: string
  location: string
  status: LeadStatus
  source: LeadSource
  score: number
  value: number
  assignedTo: string
  assignedAvatar: string
  lastActivity: string
  activities: number
  emails: number
  calls: number
  meetings: number
  createdAt: string
  tags: string[]
}

interface EmailSequence {
  id: string
  name: string
  description: string
  status: EmailStatus
  emails: number
  enrolled: number
  opened: number
  clicked: number
  replied: number
  unsubscribed: number
  openRate: number
  clickRate: number
  replyRate: number
  scheduledDate?: string
  sentDate?: string
  createdBy: string
  createdAvatar: string
}

interface ContentItem {
  id: string
  title: string
  type: ContentType
  status: ContentStatus
  author: string
  authorAvatar: string
  scheduledDate: string
  publishedDate?: string
  views: number
  engagement: number
  shares: number
  comments: number
  platform: string
  thumbnail?: string
  tags: string[]
}

interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  trigger: string
  enrolled: number
  completed: number
  active: number
  conversions: number
  conversionRate: number
  steps: number
  createdBy: string
  createdAvatar: string
  lastRun?: string
}

interface MarketingAnalytics {
  totalLeads: number
  qualifiedLeads: number
  conversions: number
  revenue: number
  cost: number
  roi: number
  cpl: number
  cac: number
  ltv: number
  websiteTraffic: number
  emailSubscribers: number
  socialFollowers: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Product Launch',
    description: 'Multi-channel campaign for new product line launch',
    type: 'email',
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-07-31',
    budget: 50000,
    spent: 32450,
    reach: 245000,
    impressions: 890000,
    clicks: 45600,
    conversions: 2340,
    revenue: 187200,
    roi: 477,
    owner: 'Sarah Chen',
    ownerAvatar: '',
    channels: ['Email', 'Social', 'PPC'],
    tags: ['product-launch', 'summer', 'priority'],
    abTest: { variant: 'A', conversion: 5.2 }
  },
  {
    id: '2',
    name: 'Brand Awareness Q3',
    description: 'Social media brand awareness campaign',
    type: 'social',
    status: 'active',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    budget: 25000,
    spent: 12800,
    reach: 580000,
    impressions: 1450000,
    clicks: 28900,
    conversions: 890,
    revenue: 44500,
    roi: 248,
    owner: 'Mike Johnson',
    ownerAvatar: '',
    channels: ['Instagram', 'TikTok', 'LinkedIn'],
    tags: ['brand', 'awareness', 'social']
  },
  {
    id: '3',
    name: 'Webinar Series - AI in Business',
    description: 'Educational webinar series for lead generation',
    type: 'event',
    status: 'scheduled',
    startDate: '2024-08-15',
    endDate: '2024-10-15',
    budget: 15000,
    spent: 0,
    reach: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    roi: 0,
    owner: 'Emily Davis',
    ownerAvatar: '',
    channels: ['Email', 'LinkedIn', 'Website'],
    tags: ['webinar', 'ai', 'education']
  },
  {
    id: '4',
    name: 'Holiday Sale Campaign',
    description: 'Black Friday and Cyber Monday promotional campaign',
    type: 'ppc',
    status: 'draft',
    startDate: '2024-11-20',
    endDate: '2024-12-02',
    budget: 75000,
    spent: 0,
    reach: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    roi: 0,
    owner: 'Alex Thompson',
    ownerAvatar: '',
    channels: ['Google Ads', 'Facebook', 'Email'],
    tags: ['holiday', 'sale', 'priority']
  },
  {
    id: '5',
    name: 'Influencer Partnership Q2',
    description: 'Collaboration with industry influencers',
    type: 'influencer',
    status: 'completed',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    budget: 40000,
    spent: 38500,
    reach: 1200000,
    impressions: 3400000,
    clicks: 89000,
    conversions: 4560,
    revenue: 273600,
    roi: 610,
    owner: 'Jordan Lee',
    ownerAvatar: '',
    channels: ['YouTube', 'Instagram', 'TikTok'],
    tags: ['influencer', 'completed', 'success']
  }
]

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Jennifer Martinez',
    email: 'jennifer@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Industries',
    title: 'VP of Marketing',
    location: 'San Francisco, CA',
    status: 'qualified',
    source: 'website',
    score: 85,
    value: 125000,
    assignedTo: 'Sarah Chen',
    assignedAvatar: '',
    lastActivity: '2 hours ago',
    activities: 24,
    emails: 8,
    calls: 3,
    meetings: 2,
    createdAt: '2024-06-15',
    tags: ['enterprise', 'high-value', 'ready']
  },
  {
    id: '2',
    name: 'Robert Wilson',
    email: 'rwilson@innovate.io',
    phone: '+1 (555) 234-5678',
    company: 'Innovate.io',
    title: 'CEO',
    location: 'New York, NY',
    status: 'proposal',
    source: 'referral',
    score: 92,
    value: 250000,
    assignedTo: 'Mike Johnson',
    assignedAvatar: '',
    lastActivity: '1 day ago',
    activities: 42,
    emails: 15,
    calls: 6,
    meetings: 4,
    createdAt: '2024-05-20',
    tags: ['startup', 'hot', 'priority']
  },
  {
    id: '3',
    name: 'Amanda Foster',
    email: 'afoster@globalretail.com',
    phone: '+1 (555) 345-6789',
    company: 'Global Retail Group',
    title: 'Marketing Director',
    location: 'Chicago, IL',
    status: 'contacted',
    source: 'event',
    score: 68,
    value: 75000,
    assignedTo: 'Emily Davis',
    assignedAvatar: '',
    lastActivity: '3 days ago',
    activities: 12,
    emails: 4,
    calls: 1,
    meetings: 0,
    createdAt: '2024-07-01',
    tags: ['retail', 'mid-market']
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'dkim@financeplus.com',
    phone: '+1 (555) 456-7890',
    company: 'FinancePlus',
    title: 'CFO',
    location: 'Boston, MA',
    status: 'new',
    source: 'ads',
    score: 45,
    value: 50000,
    assignedTo: 'Alex Thompson',
    assignedAvatar: '',
    lastActivity: '1 hour ago',
    activities: 3,
    emails: 1,
    calls: 0,
    meetings: 0,
    createdAt: '2024-07-10',
    tags: ['finance', 'new']
  }
]

const mockEmailSequences: EmailSequence[] = [
  {
    id: '1',
    name: 'Welcome Series',
    description: 'Onboarding sequence for new subscribers',
    status: 'sent',
    emails: 5,
    enrolled: 12500,
    opened: 8750,
    clicked: 3125,
    replied: 625,
    unsubscribed: 125,
    openRate: 70,
    clickRate: 25,
    replyRate: 5,
    sentDate: '2024-06-01',
    createdBy: 'Sarah Chen',
    createdAvatar: ''
  },
  {
    id: '2',
    name: 'Product Education',
    description: 'Feature highlights and tutorials',
    status: 'sending',
    emails: 8,
    enrolled: 8400,
    opened: 5460,
    clicked: 2184,
    replied: 336,
    unsubscribed: 84,
    openRate: 65,
    clickRate: 26,
    replyRate: 4,
    createdBy: 'Mike Johnson',
    createdAvatar: ''
  },
  {
    id: '3',
    name: 'Re-engagement Campaign',
    description: 'Win back inactive users',
    status: 'scheduled',
    emails: 4,
    enrolled: 5600,
    opened: 0,
    clicked: 0,
    replied: 0,
    unsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    replyRate: 0,
    scheduledDate: '2024-08-01',
    createdBy: 'Emily Davis',
    createdAvatar: ''
  }
]

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'The Future of AI in Marketing',
    type: 'blog',
    status: 'published',
    author: 'Sarah Chen',
    authorAvatar: '',
    scheduledDate: '2024-07-01',
    publishedDate: '2024-07-01',
    views: 12500,
    engagement: 8.5,
    shares: 450,
    comments: 89,
    platform: 'Blog',
    tags: ['ai', 'marketing', 'trends']
  },
  {
    id: '2',
    title: 'Product Demo Video',
    type: 'video',
    status: 'published',
    author: 'Mike Johnson',
    authorAvatar: '',
    scheduledDate: '2024-06-25',
    publishedDate: '2024-06-25',
    views: 45000,
    engagement: 12.3,
    shares: 1200,
    comments: 234,
    platform: 'YouTube',
    tags: ['product', 'demo', 'video']
  },
  {
    id: '3',
    title: 'Q3 Marketing Strategy Guide',
    type: 'ebook',
    status: 'review',
    author: 'Emily Davis',
    authorAvatar: '',
    scheduledDate: '2024-08-15',
    views: 0,
    engagement: 0,
    shares: 0,
    comments: 0,
    platform: 'Website',
    tags: ['strategy', 'guide', 'q3']
  },
  {
    id: '4',
    title: 'Weekly Industry Insights',
    type: 'social',
    status: 'scheduled',
    author: 'Jordan Lee',
    authorAvatar: '',
    scheduledDate: '2024-07-15',
    views: 0,
    engagement: 0,
    shares: 0,
    comments: 0,
    platform: 'LinkedIn',
    tags: ['social', 'insights', 'weekly']
  }
]

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Lead Nurturing',
    description: 'Automated lead nurturing sequence',
    status: 'active',
    trigger: 'Form submission',
    enrolled: 2450,
    completed: 1890,
    active: 560,
    conversions: 378,
    conversionRate: 20,
    steps: 12,
    createdBy: 'Sarah Chen',
    createdAvatar: '',
    lastRun: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Welcome Automation',
    description: 'New subscriber welcome flow',
    status: 'active',
    trigger: 'Email subscription',
    enrolled: 8900,
    completed: 7120,
    active: 1780,
    conversions: 1424,
    conversionRate: 20,
    steps: 5,
    createdBy: 'Mike Johnson',
    createdAvatar: '',
    lastRun: '5 minutes ago'
  },
  {
    id: '3',
    name: 'Cart Abandonment',
    description: 'Recover abandoned shopping carts',
    status: 'active',
    trigger: 'Cart abandoned',
    enrolled: 3200,
    completed: 2560,
    active: 640,
    conversions: 768,
    conversionRate: 30,
    steps: 4,
    createdBy: 'Emily Davis',
    createdAvatar: '',
    lastRun: '1 minute ago'
  },
  {
    id: '4',
    name: 'Upsell Campaign',
    description: 'Cross-sell and upsell existing customers',
    status: 'paused',
    trigger: 'Purchase completed',
    enrolled: 1500,
    completed: 900,
    active: 0,
    conversions: 225,
    conversionRate: 25,
    steps: 6,
    createdBy: 'Alex Thompson',
    createdAvatar: ''
  }
]

const mockAnalytics: MarketingAnalytics = {
  totalLeads: 12450,
  qualifiedLeads: 4980,
  conversions: 2340,
  revenue: 1870000,
  cost: 245000,
  roi: 663,
  cpl: 19.68,
  cac: 104.70,
  ltv: 798,
  websiteTraffic: 458000,
  emailSubscribers: 89500,
  socialFollowers: 125000
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCampaignStatusColor = (status: CampaignStatus) => {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    archived: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
  return colors[status]
}

const getCampaignTypeIcon = (type: CampaignType) => {
  const icons: Record<CampaignType, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    social: <Share2 className="w-4 h-4" />,
    ppc: <Target className="w-4 h-4" />,
    content: <FileText className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
    influencer: <Star className="w-4 h-4" />
  }
  return icons[type]
}

const getLeadStatusColor = (status: LeadStatus) => {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    qualified: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    proposal: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    negotiation: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status]
}

const getEmailStatusColor = (status: EmailStatus) => {
  const colors: Record<EmailStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    sending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    sent: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status]
}

const getContentTypeIcon = (type: ContentType) => {
  const icons: Record<ContentType, React.ReactNode> = {
    blog: <FileText className="w-4 h-4" />,
    social: <Share2 className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    infographic: <Image className="w-4 h-4" />,
    ebook: <Bookmark className="w-4 h-4" />,
    webinar: <Users className="w-4 h-4" />
  }
  return icons[type]
}

const getContentStatusColor = (status: ContentStatus) => {
  const colors: Record<ContentStatus, string> = {
    idea: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    writing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  }
  return colors[status]
}

const getWorkflowStatusColor = (status: WorkflowStatus) => {
  const colors: Record<WorkflowStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[status]
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MarketingClient() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [campaignFilter, setCampaignFilter] = useState<CampaignStatus | 'all'>('all')
  const [leadFilter, setLeadFilter] = useState<LeadStatus | 'all'>('all')

  // Computed stats
  const stats = useMemo(() => {
    const activeCampaigns = mockCampaigns.filter(c => c.status === 'active').length
    const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spent, 0)
    const totalRevenue = mockCampaigns.reduce((sum, c) => sum + c.revenue, 0)
    const avgRoi = mockCampaigns.filter(c => c.roi > 0).reduce((sum, c, _, arr) => sum + c.roi / arr.length, 0)
    const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0)
    const qualifiedLeads = mockLeads.filter(l => l.status === 'qualified' || l.status === 'proposal').length
    const totalLeadValue = mockLeads.reduce((sum, l) => sum + l.value, 0)

    return {
      activeCampaigns,
      totalBudget,
      totalSpent,
      totalRevenue,
      avgRoi,
      totalConversions,
      qualifiedLeads,
      totalLeadValue
    }
  }, [])

  // Filtered data
  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = campaignFilter === 'all' || campaign.status === campaignFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, campaignFilter])

  const filteredLeads = useMemo(() => {
    return mockLeads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = leadFilter === 'all' || lead.status === leadFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, leadFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Hub</h1>
              <p className="text-gray-600 dark:text-gray-400">HubSpot-level campaign management & analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search campaigns, leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Campaigns', value: stats.activeCampaigns.toString(), change: 12.5, icon: Target, color: 'from-pink-500 to-rose-500' },
            { label: 'Total Budget', value: `$${(stats.totalBudget / 1000).toFixed(0)}K`, change: 8.3, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { label: 'Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, change: 23.7, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Avg ROI', value: `${stats.avgRoi.toFixed(0)}%`, change: 15.2, icon: PieChart, color: 'from-purple-500 to-violet-500' },
            { label: 'Conversions', value: stats.totalConversions.toLocaleString(), change: 18.9, icon: CheckCircle, color: 'from-orange-500 to-amber-500' },
            { label: 'Qualified Leads', value: stats.qualifiedLeads.toString(), change: 10.4, icon: Users, color: 'from-teal-500 to-cyan-500' },
            { label: 'Lead Value', value: `$${(stats.totalLeadValue / 1000).toFixed(0)}K`, change: 25.6, icon: Award, color: 'from-indigo-500 to-blue-500' },
            { label: 'Email Subscribers', value: `${(mockAnalytics.emailSubscribers / 1000).toFixed(1)}K`, change: 5.8, icon: Mail, color: 'from-rose-500 to-pink-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <Badge variant="outline" className={stat.change >= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={campaignFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCampaignFilter('all')}
                >
                  All
                </Button>
                {(['active', 'scheduled', 'draft', 'completed'] as CampaignStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={campaignFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCampaignFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredCampaigns.map(campaign => (
                <Card
                  key={campaign.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white">
                          {getCampaignTypeIcon(campaign.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                            <Badge className={getCampaignStatusColor(campaign.status)}>{campaign.status}</Badge>
                            {campaign.abTest && (
                              <Badge variant="outline" className="text-purple-600 border-purple-200">
                                A/B Test
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{campaign.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {campaign.startDate} - {campaign.endDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={campaign.ownerAvatar} />
                                <AvatarFallback className="text-[8px]">{campaign.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {campaign.owner}
                            </span>
                            {campaign.channels.map(ch => (
                              <Badge key={ch} variant="secondary" className="text-xs">{ch}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Reach</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{(campaign.reach / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Clicks</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{(campaign.clicks / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Conversions</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{campaign.conversions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">ROI</p>
                          <p className={`font-semibold ${campaign.roi > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {campaign.roi > 0 ? `${campaign.roi}%` : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {campaign.status === 'active' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Budget: ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                          <span className="font-medium">{((campaign.spent / campaign.budget) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={leadFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLeadFilter('all')}
                >
                  All Leads
                </Button>
                {(['new', 'contacted', 'qualified', 'proposal'] as LeadStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={leadFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLeadFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredLeads.map(lead => (
                <Card
                  key={lead.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedLead(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{lead.name}</h3>
                            <Badge className={getLeadStatusColor(lead.status)}>{lead.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{lead.title} at {lead.company}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Lead Score</p>
                          <p className={`text-xl font-bold ${getScoreColor(lead.score)}`}>{lead.score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Value</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">${(lead.value / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="flex items-center gap-3 text-center">
                          <div>
                            <p className="text-xs text-gray-500">Emails</p>
                            <p className="font-semibold">{lead.emails}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Calls</p>
                            <p className="font-semibold">{lead.calls}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Meetings</p>
                            <p className="font-semibold">{lead.meetings}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {lead.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Sequences</h3>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Sequence
              </Button>
            </div>

            <div className="grid gap-4">
              {mockEmailSequences.map(sequence => (
                <Card key={sequence.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center text-white">
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{sequence.name}</h3>
                            <Badge className={getEmailStatusColor(sequence.status)}>{sequence.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{sequence.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{sequence.emails} emails</span>
                            <span>{sequence.enrolled.toLocaleString()} enrolled</span>
                            <span className="flex items-center gap-1">
                              <Avatar className="w-4 h-4">
                                <AvatarFallback className="text-[8px]">{sequence.createdBy.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              {sequence.createdBy}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Open Rate</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{sequence.openRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Click Rate</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{sequence.clickRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reply Rate</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{sequence.replyRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Unsubscribed</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{sequence.unsubscribed}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Calendar</h3>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockContent.map(content => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        {getContentTypeIcon(content.type)}
                      </div>
                      <Badge className={getContentStatusColor(content.status)}>{content.status}</Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{content.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span>{content.platform}</span>
                      <span>•</span>
                      <span>{content.scheduledDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[8px]">{content.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-gray-600 dark:text-gray-400">{content.author}</span>
                      </div>
                      {content.status === 'published' && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(content.views / 1000).toFixed(1)}K
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {content.engagement}%
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Marketing Workflows</h3>
              <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>

            <div className="grid gap-4">
              {mockWorkflows.map(workflow => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
                            <Badge className={getWorkflowStatusColor(workflow.status)}>{workflow.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{workflow.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {workflow.steps} steps
                            </span>
                            <span>Trigger: {workflow.trigger}</span>
                            {workflow.lastRun && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last run: {workflow.lastRun}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Enrolled</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{workflow.enrolled.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Active</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{workflow.active}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{workflow.completed.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Conversion</p>
                          <p className="font-semibold text-green-600">{workflow.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Revenue Overview */}
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${(mockAnalytics.revenue / 1000000).toFixed(2)}M</p>
                      <p className="text-xs text-green-600">+23.5% vs last period</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Marketing Cost</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${(mockAnalytics.cost / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-red-600">+8.2% vs last period</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">ROI</p>
                      <p className="text-2xl font-bold text-green-600">{mockAnalytics.roi}%</p>
                      <p className="text-xs text-green-600">+15.3% vs last period</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">LTV:CAC Ratio</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{(mockAnalytics.ltv / mockAnalytics.cac).toFixed(1)}:1</p>
                      <p className="text-xs text-green-600">Healthy ratio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Lead Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { stage: 'Total Leads', count: mockAnalytics.totalLeads, percent: 100, color: 'bg-blue-500' },
                    { stage: 'Qualified', count: mockAnalytics.qualifiedLeads, percent: 40, color: 'bg-green-500' },
                    { stage: 'Proposals', count: 1245, percent: 25, color: 'bg-purple-500' },
                    { stage: 'Conversions', count: mockAnalytics.conversions, percent: 19, color: 'bg-orange-500' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.stage}</span>
                        <span className="text-sm font-semibold">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Channel Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    Channel Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { channel: 'Email', revenue: 450000, roi: 580, icon: <Mail className="w-4 h-4" /> },
                    { channel: 'Social', revenue: 320000, roi: 420, icon: <Share2 className="w-4 h-4" /> },
                    { channel: 'PPC', revenue: 280000, roi: 350, icon: <Target className="w-4 h-4" /> },
                    { channel: 'Content', revenue: 180000, roi: 890, icon: <FileText className="w-4 h-4" /> }
                  ].map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white">
                          {ch.icon}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{ch.channel}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">${(ch.revenue / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-green-600">{ch.roi}% ROI</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Cost per Lead', value: `$${mockAnalytics.cpl.toFixed(2)}`, change: -12.5 },
                    { label: 'Customer Acquisition Cost', value: `$${mockAnalytics.cac.toFixed(2)}`, change: -8.3 },
                    { label: 'Customer Lifetime Value', value: `$${mockAnalytics.ltv.toFixed(0)}`, change: 15.7 },
                    { label: 'Website Traffic', value: `${(mockAnalytics.websiteTraffic / 1000).toFixed(0)}K`, change: 22.4 },
                    { label: 'Social Followers', value: `${(mockAnalytics.socialFollowers / 1000).toFixed(0)}K`, change: 18.9 }
                  ].map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{metric.value}</span>
                        <Badge variant="outline" className={metric.change >= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                          {metric.change >= 0 ? '+' : ''}{metric.change}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Campaign Detail Dialog */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white">
                  {selectedCampaign && getCampaignTypeIcon(selectedCampaign.type)}
                </div>
                {selectedCampaign?.name}
              </DialogTitle>
              <DialogDescription>{selectedCampaign?.description}</DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getCampaignStatusColor(selectedCampaign.status)}>{selectedCampaign.status}</Badge>
                    {selectedCampaign.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Reach</p>
                      <p className="text-xl font-bold">{(selectedCampaign.reach / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Impressions</p>
                      <p className="text-xl font-bold">{(selectedCampaign.impressions / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Clicks</p>
                      <p className="text-xl font-bold">{(selectedCampaign.clicks / 1000).toFixed(1)}K</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Conversions</p>
                      <p className="text-xl font-bold">{selectedCampaign.conversions.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3">Budget & Spend</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Budget</span>
                          <span className="font-medium">${selectedCampaign.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Spent</span>
                          <span className="font-medium">${selectedCampaign.spent.toLocaleString()}</span>
                        </div>
                        <Progress value={(selectedCampaign.spent / selectedCampaign.budget) * 100} className="h-2" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Revenue</span>
                          <span className="font-medium text-green-600">${selectedCampaign.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">ROI</span>
                          <span className="font-medium text-green-600">{selectedCampaign.roi}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Campaign Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Date</span>
                        <span>{selectedCampaign.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">End Date</span>
                        <span>{selectedCampaign.endDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Owner</span>
                        <span>{selectedCampaign.owner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Channels</span>
                        <span>{selectedCampaign.channels.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {selectedCampaign.abTest && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        A/B Test Results
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Variant {selectedCampaign.abTest.variant} is winning with {selectedCampaign.abTest.conversion}% conversion rate
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Lead Detail Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg">
                    {selectedLead?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p>{selectedLead?.name}</p>
                  <p className="text-sm font-normal text-gray-500">{selectedLead?.title} at {selectedLead?.company}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getLeadStatusColor(selectedLead.status)}>{selectedLead.status}</Badge>
                    <div className={`font-bold text-lg ${getScoreColor(selectedLead.score)}`}>
                      Score: {selectedLead.score}
                    </div>
                    {selectedLead.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedLead.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedLead.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span>{selectedLead.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedLead.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Lead Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimated Value</span>
                          <span className="font-medium">${selectedLead.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Source</span>
                          <span className="capitalize">{selectedLead.source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Assigned To</span>
                          <span>{selectedLead.assignedTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created</span>
                          <span>{selectedLead.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Activity Summary</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-2xl font-bold">{selectedLead.activities}</p>
                        <p className="text-xs text-gray-500">Total Activities</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-2xl font-bold">{selectedLead.emails}</p>
                        <p className="text-xs text-gray-500">Emails</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-2xl font-bold">{selectedLead.calls}</p>
                        <p className="text-xs text-gray-500">Calls</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-2xl font-bold">{selectedLead.meetings}</p>
                        <p className="text-xs text-gray-500">Meetings</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Log Call
                    </Button>
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
