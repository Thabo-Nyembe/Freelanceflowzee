"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Mail,
  Send,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  BarChart3,
  Plus,
  Search,
  Clock,
  Edit,
  Copy,
  RefreshCw,
  Play,
  Pause,
  Calendar,
  Target,
  Zap,
  Tag,
  Smartphone,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LayoutTemplate,
  Workflow,
  TestTube2,
  Heart,
  UserPlus,
  UserMinus,
  Shield,
  Settings,
  ChevronRight,
  MailOpen,
  Link2,
  Ban,
  Star,
  Inbox
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
type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed' | 'cancelled'
type CampaignType = 'newsletter' | 'promotional' | 'automated' | 'transactional' | 'welcome' | 'reengagement' | 'announcement'
type SubscriberStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained' | 'pending' | 'cleaned'
type SegmentCondition = 'all' | 'any' | 'none'
type AutomationTrigger = 'signup' | 'purchase' | 'abandoned_cart' | 'birthday' | 'inactivity' | 'tag_added' | 'date_based'
type TemplateCategory = 'newsletter' | 'promotional' | 'welcome' | 'transactional' | 'event' | 'holiday'
type EngagementLevel = 'highly_engaged' | 'engaged' | 'inactive' | 'at_risk' | 'dormant'

interface Subscriber {
  id: string
  email: string
  firstName: string
  lastName: string
  status: SubscriberStatus
  engagementLevel: EngagementLevel
  tags: string[]
  listId: string
  openRate: number
  clickRate: number
  lastOpened: string
  lastClicked: string
  signupDate: string
  location: { city: string; country: string }
  source: string
  totalOpens: number
  totalClicks: number
  purchaseValue: number
  avatar?: string
}

interface Campaign {
  id: string
  name: string
  subject: string
  previewText: string
  type: CampaignType
  status: CampaignStatus
  listId: string
  segmentId?: string
  templateId: string
  createdAt: string
  scheduledAt?: string
  sentAt?: string
  stats: {
    sent: number
    delivered: number
    opens: number
    uniqueOpens: number
    clicks: number
    uniqueClicks: number
    bounces: number
    unsubscribes: number
    complaints: number
    forwards: number
  }
  abTest?: {
    enabled: boolean
    winnerCriteria: 'open_rate' | 'click_rate' | 'revenue'
    variants: { subject: string; sendPercentage: number }[]
  }
  sendTime: string
  fromName: string
  fromEmail: string
  replyTo: string
}

interface EmailList {
  id: string
  name: string
  description: string
  subscriberCount: number
  openRate: number
  clickRate: number
  createdAt: string
  tags: string[]
}

interface Segment {
  id: string
  name: string
  listId: string
  condition: SegmentCondition
  rules: { field: string; operator: string; value: string }[]
  subscriberCount: number
  createdAt: string
}

interface Automation {
  id: string
  name: string
  trigger: AutomationTrigger
  status: 'active' | 'paused' | 'draft'
  steps: {
    type: 'email' | 'delay' | 'condition' | 'action'
    config: Record<string, unknown>
  }[]
  stats: {
    enrolled: number
    completed: number
    inProgress: number
    converted: number
  }
  createdAt: string
}

interface EmailTemplate {
  id: string
  name: string
  category: TemplateCategory
  thumbnail: string
  isCustom: boolean
  createdAt: string
  lastUsed?: string
  useCount: number
}

// Mock Data
const mockSubscribers: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'sarah.johnson@email.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    status: 'subscribed',
    engagementLevel: 'highly_engaged',
    tags: ['vip', 'premium'],
    listId: 'list-1',
    openRate: 78,
    clickRate: 42,
    lastOpened: '2025-01-15T10:30:00Z',
    lastClicked: '2025-01-14T15:45:00Z',
    signupDate: '2024-06-12T00:00:00Z',
    location: { city: 'New York', country: 'USA' },
    source: 'Website Signup',
    totalOpens: 156,
    totalClicks: 89,
    purchaseValue: 2450
  },
  {
    id: 'sub-2',
    email: 'michael.chen@company.com',
    firstName: 'Michael',
    lastName: 'Chen',
    status: 'subscribed',
    engagementLevel: 'engaged',
    tags: ['newsletter'],
    listId: 'list-1',
    openRate: 62,
    clickRate: 28,
    lastOpened: '2025-01-12T08:15:00Z',
    lastClicked: '2025-01-10T12:30:00Z',
    signupDate: '2024-08-22T00:00:00Z',
    location: { city: 'San Francisco', country: 'USA' },
    source: 'Lead Magnet',
    totalOpens: 98,
    totalClicks: 45,
    purchaseValue: 890
  },
  {
    id: 'sub-3',
    email: 'emma.wilson@gmail.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    status: 'subscribed',
    engagementLevel: 'inactive',
    tags: ['free_trial'],
    listId: 'list-1',
    openRate: 15,
    clickRate: 3,
    lastOpened: '2024-11-20T14:00:00Z',
    lastClicked: '2024-10-15T09:30:00Z',
    signupDate: '2024-04-08T00:00:00Z',
    location: { city: 'London', country: 'UK' },
    source: 'Webinar',
    totalOpens: 12,
    totalClicks: 3,
    purchaseValue: 0
  },
  {
    id: 'sub-4',
    email: 'james.rodriguez@startup.io',
    firstName: 'James',
    lastName: 'Rodriguez',
    status: 'subscribed',
    engagementLevel: 'at_risk',
    tags: ['churned_customer'],
    listId: 'list-2',
    openRate: 8,
    clickRate: 1,
    lastOpened: '2024-10-05T11:20:00Z',
    lastClicked: '2024-09-22T16:45:00Z',
    signupDate: '2024-02-14T00:00:00Z',
    location: { city: 'Austin', country: 'USA' },
    source: 'Social Media',
    totalOpens: 24,
    totalClicks: 5,
    purchaseValue: 450
  },
  {
    id: 'sub-5',
    email: 'lisa.anderson@enterprise.com',
    firstName: 'Lisa',
    lastName: 'Anderson',
    status: 'unsubscribed',
    engagementLevel: 'dormant',
    tags: [],
    listId: 'list-1',
    openRate: 0,
    clickRate: 0,
    lastOpened: '2024-08-12T10:00:00Z',
    lastClicked: '2024-07-30T14:15:00Z',
    signupDate: '2024-01-20T00:00:00Z',
    location: { city: 'Chicago', country: 'USA' },
    source: 'Referral',
    totalOpens: 45,
    totalClicks: 12,
    purchaseValue: 1200
  }
]

const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'January Product Updates',
    subject: 'New Features You\'ll Love 🚀',
    previewText: 'Check out our latest improvements...',
    type: 'newsletter',
    status: 'sent',
    listId: 'list-1',
    templateId: 'tmpl-1',
    createdAt: '2025-01-10T09:00:00Z',
    sentAt: '2025-01-15T10:00:00Z',
    stats: {
      sent: 12500,
      delivered: 12350,
      opens: 4850,
      uniqueOpens: 3200,
      clicks: 1560,
      uniqueClicks: 890,
      bounces: 150,
      unsubscribes: 45,
      complaints: 3,
      forwards: 78
    },
    sendTime: '10:00 AM',
    fromName: 'FreeFlow Team',
    fromEmail: 'hello@freeflow.com',
    replyTo: 'support@freeflow.com'
  },
  {
    id: 'camp-2',
    name: 'Flash Sale - 50% Off',
    subject: '⚡ 24-Hour Flash Sale - 50% Off Everything!',
    previewText: 'Don\'t miss our biggest sale of the year',
    type: 'promotional',
    status: 'sent',
    listId: 'list-1',
    segmentId: 'seg-1',
    templateId: 'tmpl-2',
    createdAt: '2025-01-08T14:00:00Z',
    sentAt: '2025-01-12T08:00:00Z',
    stats: {
      sent: 8500,
      delivered: 8420,
      opens: 5200,
      uniqueOpens: 4100,
      clicks: 2890,
      uniqueClicks: 1850,
      bounces: 80,
      unsubscribes: 22,
      complaints: 1,
      forwards: 245
    },
    abTest: {
      enabled: true,
      winnerCriteria: 'click_rate',
      variants: [
        { subject: '⚡ 24-Hour Flash Sale - 50% Off Everything!', sendPercentage: 50 },
        { subject: 'Your Exclusive 50% Discount Expires Tonight', sendPercentage: 50 }
      ]
    },
    sendTime: '8:00 AM',
    fromName: 'FreeFlow Deals',
    fromEmail: 'deals@freeflow.com',
    replyTo: 'support@freeflow.com'
  },
  {
    id: 'camp-3',
    name: 'Weekly Digest #48',
    subject: 'Your Weekly Roundup: Top Stories & Tips',
    previewText: 'Catch up on what you missed this week',
    type: 'newsletter',
    status: 'scheduled',
    listId: 'list-1',
    templateId: 'tmpl-1',
    createdAt: '2025-01-18T11:00:00Z',
    scheduledAt: '2025-01-20T09:00:00Z',
    stats: {
      sent: 0,
      delivered: 0,
      opens: 0,
      uniqueOpens: 0,
      clicks: 0,
      uniqueClicks: 0,
      bounces: 0,
      unsubscribes: 0,
      complaints: 0,
      forwards: 0
    },
    sendTime: '9:00 AM',
    fromName: 'FreeFlow Weekly',
    fromEmail: 'newsletter@freeflow.com',
    replyTo: 'hello@freeflow.com'
  },
  {
    id: 'camp-4',
    name: 'Re-engagement Campaign',
    subject: 'We Miss You! Come Back for 30% Off',
    previewText: 'It\'s been a while - here\'s something special',
    type: 'reengagement',
    status: 'draft',
    listId: 'list-1',
    segmentId: 'seg-2',
    templateId: 'tmpl-3',
    createdAt: '2025-01-17T16:30:00Z',
    stats: {
      sent: 0,
      delivered: 0,
      opens: 0,
      uniqueOpens: 0,
      clicks: 0,
      uniqueClicks: 0,
      bounces: 0,
      unsubscribes: 0,
      complaints: 0,
      forwards: 0
    },
    sendTime: '2:00 PM',
    fromName: 'FreeFlow Team',
    fromEmail: 'hello@freeflow.com',
    replyTo: 'support@freeflow.com'
  },
  {
    id: 'camp-5',
    name: 'Product Launch Announcement',
    subject: '🎉 Introducing Our Game-Changing New Feature',
    previewText: 'You\'ve been asking for this - it\'s finally here!',
    type: 'announcement',
    status: 'sending',
    listId: 'list-1',
    templateId: 'tmpl-4',
    createdAt: '2025-01-19T08:00:00Z',
    stats: {
      sent: 4250,
      delivered: 4200,
      opens: 890,
      uniqueOpens: 720,
      clicks: 340,
      uniqueClicks: 280,
      bounces: 50,
      unsubscribes: 8,
      complaints: 0,
      forwards: 45
    },
    sendTime: '11:00 AM',
    fromName: 'FreeFlow Product',
    fromEmail: 'product@freeflow.com',
    replyTo: 'product@freeflow.com'
  }
]

const mockLists: EmailList[] = [
  {
    id: 'list-1',
    name: 'Main Newsletter',
    description: 'Primary subscriber list for weekly newsletters and updates',
    subscriberCount: 45230,
    openRate: 28.5,
    clickRate: 4.2,
    createdAt: '2023-03-15T00:00:00Z',
    tags: ['newsletter', 'main']
  },
  {
    id: 'list-2',
    name: 'Product Updates',
    description: 'Subscribers interested in product announcements',
    subscriberCount: 32100,
    openRate: 35.2,
    clickRate: 8.7,
    createdAt: '2023-06-22T00:00:00Z',
    tags: ['product', 'updates']
  },
  {
    id: 'list-3',
    name: 'VIP Customers',
    description: 'Premium customers and high-value leads',
    subscriberCount: 5420,
    openRate: 52.8,
    clickRate: 18.4,
    createdAt: '2023-09-10T00:00:00Z',
    tags: ['vip', 'premium']
  }
]

const mockSegments: Segment[] = [
  {
    id: 'seg-1',
    name: 'Highly Engaged',
    listId: 'list-1',
    condition: 'all',
    rules: [
      { field: 'open_rate', operator: 'greater_than', value: '50' },
      { field: 'last_open', operator: 'within', value: '30_days' }
    ],
    subscriberCount: 8450,
    createdAt: '2024-06-15T00:00:00Z'
  },
  {
    id: 'seg-2',
    name: 'Inactive 90+ Days',
    listId: 'list-1',
    condition: 'all',
    rules: [
      { field: 'last_open', operator: 'not_within', value: '90_days' }
    ],
    subscriberCount: 12300,
    createdAt: '2024-08-20T00:00:00Z'
  },
  {
    id: 'seg-3',
    name: 'Purchasers',
    listId: 'list-1',
    condition: 'any',
    rules: [
      { field: 'purchase_value', operator: 'greater_than', value: '0' }
    ],
    subscriberCount: 15670,
    createdAt: '2024-10-05T00:00:00Z'
  }
]

const mockAutomations: Automation[] = [
  {
    id: 'auto-1',
    name: 'Welcome Series',
    trigger: 'signup',
    status: 'active',
    steps: [
      { type: 'email', config: { templateId: 'tmpl-welcome-1' } },
      { type: 'delay', config: { days: 2 } },
      { type: 'email', config: { templateId: 'tmpl-welcome-2' } },
      { type: 'delay', config: { days: 3 } },
      { type: 'email', config: { templateId: 'tmpl-welcome-3' } }
    ],
    stats: {
      enrolled: 12450,
      completed: 9800,
      inProgress: 2650,
      converted: 4560
    },
    createdAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'auto-2',
    name: 'Abandoned Cart Recovery',
    trigger: 'abandoned_cart',
    status: 'active',
    steps: [
      { type: 'delay', config: { hours: 1 } },
      { type: 'email', config: { templateId: 'tmpl-cart-1' } },
      { type: 'delay', config: { days: 1 } },
      { type: 'condition', config: { field: 'purchased', value: false } },
      { type: 'email', config: { templateId: 'tmpl-cart-2' } }
    ],
    stats: {
      enrolled: 8920,
      completed: 7100,
      inProgress: 1820,
      converted: 2340
    },
    createdAt: '2024-04-18T00:00:00Z'
  },
  {
    id: 'auto-3',
    name: 'Birthday Discount',
    trigger: 'birthday',
    status: 'active',
    steps: [
      { type: 'email', config: { templateId: 'tmpl-birthday' } }
    ],
    stats: {
      enrolled: 2340,
      completed: 2340,
      inProgress: 0,
      converted: 890
    },
    createdAt: '2024-06-01T00:00:00Z'
  },
  {
    id: 'auto-4',
    name: 'Win-Back Campaign',
    trigger: 'inactivity',
    status: 'paused',
    steps: [
      { type: 'email', config: { templateId: 'tmpl-winback-1' } },
      { type: 'delay', config: { days: 7 } },
      { type: 'condition', config: { field: 'opened', value: false } },
      { type: 'email', config: { templateId: 'tmpl-winback-2' } }
    ],
    stats: {
      enrolled: 5670,
      completed: 4200,
      inProgress: 1470,
      converted: 980
    },
    createdAt: '2024-08-25T00:00:00Z'
  }
]

const mockTemplates: EmailTemplate[] = [
  { id: 'tmpl-1', name: 'Modern Newsletter', category: 'newsletter', thumbnail: '', isCustom: false, createdAt: '2024-01-15T00:00:00Z', lastUsed: '2025-01-15T00:00:00Z', useCount: 48 },
  { id: 'tmpl-2', name: 'Flash Sale Banner', category: 'promotional', thumbnail: '', isCustom: false, createdAt: '2024-03-20T00:00:00Z', lastUsed: '2025-01-12T00:00:00Z', useCount: 24 },
  { id: 'tmpl-3', name: 'Re-engagement Special', category: 'promotional', thumbnail: '', isCustom: true, createdAt: '2024-07-10T00:00:00Z', lastUsed: '2024-12-20T00:00:00Z', useCount: 8 },
  { id: 'tmpl-4', name: 'Product Announcement', category: 'newsletter', thumbnail: '', isCustom: false, createdAt: '2024-02-28T00:00:00Z', lastUsed: '2025-01-19T00:00:00Z', useCount: 32 },
  { id: 'tmpl-5', name: 'Welcome Email', category: 'welcome', thumbnail: '', isCustom: false, createdAt: '2024-01-05T00:00:00Z', lastUsed: '2025-01-18T00:00:00Z', useCount: 156 },
  { id: 'tmpl-6', name: 'Order Confirmation', category: 'transactional', thumbnail: '', isCustom: false, createdAt: '2024-01-10T00:00:00Z', lastUsed: '2025-01-19T00:00:00Z', useCount: 2340 },
  { id: 'tmpl-7', name: 'Holiday Special', category: 'holiday', thumbnail: '', isCustom: true, createdAt: '2024-11-15T00:00:00Z', lastUsed: '2024-12-25T00:00:00Z', useCount: 4 },
  { id: 'tmpl-8', name: 'Event Invitation', category: 'event', thumbnail: '', isCustom: false, createdAt: '2024-05-20T00:00:00Z', lastUsed: '2024-11-10T00:00:00Z', useCount: 12 }
]

// Helper Functions
const getStatusColor = (status: CampaignStatus): string => {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    sending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    sent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[status]
}

const getStatusIcon = (status: CampaignStatus) => {
  const icons: Record<CampaignStatus, JSX.Element> = {
    draft: <Edit className="w-3 h-3" />,
    scheduled: <Clock className="w-3 h-3" />,
    sending: <RefreshCw className="w-3 h-3 animate-spin" />,
    sent: <CheckCircle2 className="w-3 h-3" />,
    paused: <Pause className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    cancelled: <Ban className="w-3 h-3" />
  }
  return icons[status]
}

const getCampaignTypeColor = (type: CampaignType): string => {
  const colors: Record<CampaignType, string> = {
    newsletter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    promotional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    automated: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    transactional: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    welcome: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    reengagement: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    announcement: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
  }
  return colors[type]
}

const getEngagementColor = (level: EngagementLevel): string => {
  const colors: Record<EngagementLevel, string> = {
    highly_engaged: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    engaged: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    inactive: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    at_risk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    dormant: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[level]
}

const getSubscriberStatusColor = (status: SubscriberStatus): string => {
  const colors: Record<SubscriberStatus, string> = {
    subscribed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    unsubscribed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    bounced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    complained: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cleaned: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[status]
}

const getAutomationTriggerIcon = (trigger: AutomationTrigger) => {
  const icons: Record<AutomationTrigger, JSX.Element> = {
    signup: <UserPlus className="w-4 h-4" />,
    purchase: <Target className="w-4 h-4" />,
    abandoned_cart: <Inbox className="w-4 h-4" />,
    birthday: <Heart className="w-4 h-4" />,
    inactivity: <Clock className="w-4 h-4" />,
    tag_added: <Tag className="w-4 h-4" />,
    date_based: <Calendar className="w-4 h-4" />
  }
  return icons[trigger]
}

const getTemplateCategoryColor = (category: TemplateCategory): string => {
  const colors: Record<TemplateCategory, string> = {
    newsletter: 'from-blue-500 to-cyan-500',
    promotional: 'from-purple-500 to-pink-500',
    welcome: 'from-green-500 to-emerald-500',
    transactional: 'from-gray-500 to-slate-500',
    event: 'from-orange-500 to-amber-500',
    holiday: 'from-red-500 to-rose-500'
  }
  return colors[category]
}

interface EmailMarketingClientProps {
  initialCampaigns?: Campaign[]
  initialSubscribers?: Subscriber[]
  initialTemplates?: EmailTemplate[]
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Mailchimp Level
// ============================================================================

const mockEmailAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Open Rate', description: 'Last campaign achieved 42% open rate - 15% above industry average.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Bounce Alert', description: '150 emails bounced from last send. Clean list recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Deliverability' },
  { id: '3', type: 'info' as const, title: 'Best Send Time', description: 'Your audience engages most on Tuesdays at 10am. Schedule accordingly.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
]

const mockEmailCollaborators = [
  { id: '1', name: 'Marketing Lead', avatar: '/avatars/marketing.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Content Writer', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Content' },
  { id: '3', name: 'Designer', avatar: '/avatars/designer.jpg', status: 'away' as const, role: 'Design' },
]

const mockEmailPredictions = [
  { id: '1', title: 'Campaign Forecast', prediction: 'Holiday campaign expected to generate 25% more revenue than last year', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'List Growth', prediction: 'Subscriber list projected to reach 50K by end of quarter', confidence: 91, trend: 'up' as const, impact: 'medium' as const },
]

const mockEmailActivities = [
  { id: '1', user: 'Marketing Lead', action: 'Sent', target: 'Weekly Newsletter to 25K subscribers', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Content Writer', action: 'Created', target: 'New email template for Black Friday', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Flagged', target: '50 subscribers for re-engagement', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

const mockEmailQuickActions = [
  { id: '1', label: 'New Campaign', icon: 'plus', action: () => console.log('New campaign'), variant: 'default' as const },
  { id: '2', label: 'View Analytics', icon: 'chart', action: () => console.log('View analytics'), variant: 'default' as const },
  { id: '3', label: 'Manage Lists', icon: 'users', action: () => console.log('Manage lists'), variant: 'outline' as const },
]

export default function EmailMarketingClient({
  initialCampaigns = mockCampaigns,
  initialSubscribers = mockSubscribers,
  initialTemplates = mockTemplates
}: EmailMarketingClientProps) {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [campaignFilter, setCampaignFilter] = useState<'all' | CampaignStatus>('all')

  // Calculate stats
  const stats = useMemo(() => {
    const sentCampaigns = initialCampaigns.filter(c => c.status === 'sent')
    const totalSent = sentCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)
    const totalDelivered = sentCampaigns.reduce((sum, c) => sum + c.stats.delivered, 0)
    const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.stats.uniqueOpens, 0)
    const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.stats.uniqueClicks, 0)
    const totalBounces = sentCampaigns.reduce((sum, c) => sum + c.stats.bounces, 0)
    const totalUnsubscribes = sentCampaigns.reduce((sum, c) => sum + c.stats.unsubscribes, 0)

    const openRate = totalDelivered > 0 ? (totalOpens / totalDelivered) * 100 : 0
    const clickRate = totalDelivered > 0 ? (totalClicks / totalDelivered) * 100 : 0
    const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0

    const activeSubscribers = initialSubscribers.filter(s => s.status === 'subscribed').length
    const totalLists = mockLists.reduce((sum, l) => sum + l.subscriberCount, 0)

    return {
      totalSent,
      totalDelivered,
      openRate,
      clickRate,
      bounceRate,
      totalUnsubscribes,
      activeSubscribers,
      totalLists,
      engagedRate: (initialSubscribers.filter(s => s.engagementLevel === 'highly_engaged' || s.engagementLevel === 'engaged').length / initialSubscribers.length) * 100
    }
  }, [initialCampaigns, initialSubscribers])

  const filteredCampaigns = useMemo(() => {
    return initialCampaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = campaignFilter === 'all' || campaign.status === campaignFilter
      return matchesSearch && matchesFilter
    })
  }, [initialCampaigns, searchQuery, campaignFilter])

  const statCards = [
    { label: 'Emails Sent', value: stats.totalSent.toLocaleString(), change: 18.5, icon: Send, color: 'from-rose-500 to-pink-600' },
    { label: 'Open Rate', value: `${stats.openRate.toFixed(1)}%`, change: 5.2, icon: MailOpen, color: 'from-blue-500 to-cyan-600' },
    { label: 'Click Rate', value: `${stats.clickRate.toFixed(1)}%`, change: 8.7, icon: MousePointer, color: 'from-purple-500 to-violet-600' },
    { label: 'Subscribers', value: stats.totalLists.toLocaleString(), change: 12.3, icon: Users, color: 'from-green-500 to-emerald-600' },
    { label: 'Bounce Rate', value: `${stats.bounceRate.toFixed(1)}%`, change: -15.4, icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
    { label: 'Delivered', value: `${((stats.totalDelivered / stats.totalSent) * 100).toFixed(1)}%`, change: 2.1, icon: CheckCircle2, color: 'from-teal-500 to-cyan-600' },
    { label: 'Unsubscribes', value: stats.totalUnsubscribes.toString(), change: -8.5, icon: UserMinus, color: 'from-red-500 to-rose-600' },
    { label: 'Engaged Rate', value: `${stats.engagedRate.toFixed(1)}%`, change: 4.8, icon: Star, color: 'from-indigo-500 to-purple-600' }
  ]

  // Handlers
  const handleCreateCampaign = () => {
    toast.info('Create Campaign', {
      description: 'Opening email campaign builder...'
    })
  }

  const handleSendCampaign = (campaignName: string) => {
    toast.success('Sending campaign', {
      description: `"${campaignName}" is being sent...`
    })
  }

  const handleScheduleCampaign = (campaignName: string) => {
    toast.success('Campaign scheduled', {
      description: `"${campaignName}" has been scheduled`
    })
  }

  const handleDuplicateCampaign = (campaignName: string) => {
    toast.success('Campaign duplicated', {
      description: `Copy of "${campaignName}" created`
    })
  }

  const handleExportSubscribers = () => {
    toast.success('Exporting subscribers', {
      description: 'Subscriber list will be downloaded'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50/30 to-purple-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Marketing</h1>
              <p className="text-gray-600 dark:text-gray-400">Mailchimp-level campaign management platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="campaigns" className="gap-2">
              <Send className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="gap-2">
              <Users className="w-4 h-4" />
              Subscribers
            </TabsTrigger>
            <TabsTrigger value="automations" className="gap-2">
              <Workflow className="w-4 h-4" />
              Automations
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaigns Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Email Campaigns</h2>
                  <p className="text-purple-100">Mailchimp-level campaign management and delivery</p>
                  <p className="text-purple-200 text-xs mt-1">A/B testing • Scheduling • Performance tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredCampaigns.length}</p>
                    <p className="text-purple-200 text-sm">Campaigns</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCampaigns.filter(c => c.status === 'sent').length}</p>
                    <p className="text-purple-200 text-sm">Sent</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'draft', 'scheduled', 'sending', 'sent'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={campaignFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCampaignFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedCampaign(campaign)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1 capitalize">{campaign.status}</span>
                          </Badge>
                          <Badge className={getCampaignTypeColor(campaign.type)}>
                            {campaign.type}
                          </Badge>
                          {campaign.abTest?.enabled && (
                            <Badge variant="outline" className="gap-1">
                              <TestTube2 className="w-3 h-3" />
                              A/B Test
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{campaign.subject}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{campaign.previewText}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>

                    {campaign.status === 'sent' && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-6 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Sent</p>
                          <p className="font-semibold">{campaign.stats.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Delivered</p>
                          <p className="font-semibold">{((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Opened</p>
                          <p className="font-semibold text-blue-600">{((campaign.stats.uniqueOpens / campaign.stats.delivered) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Clicked</p>
                          <p className="font-semibold text-purple-600">{((campaign.stats.uniqueClicks / campaign.stats.delivered) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bounced</p>
                          <p className="font-semibold text-amber-600">{campaign.stats.bounces}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Unsubscribed</p>
                          <p className="font-semibold text-red-600">{campaign.stats.unsubscribes}</p>
                        </div>
                      </div>
                    )}

                    {campaign.status === 'scheduled' && campaign.scheduledAt && (
                      <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}
                      </div>
                    )}

                    {campaign.status === 'sending' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Sending progress</span>
                          <span className="text-sm font-medium">{((campaign.stats.sent / stats.totalLists) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(campaign.stats.sent / stats.totalLists) * 100} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            {/* Subscribers Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Subscriber Management</h2>
                  <p className="text-blue-100">ConvertKit-level list management and segmentation</p>
                  <p className="text-blue-200 text-xs mt-1">Smart segments • Tags • Growth tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSubscribers.length}</p>
                    <p className="text-blue-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSubscribers.filter(s => s.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Subscriber Lists</CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create List
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockLists.map((list) => (
                        <div key={list.id} className="p-4 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{list.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{list.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{list.subscriberCount.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">subscribers</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              <Eye className="w-4 h-4 inline mr-1" />
                              {list.openRate}% opens
                            </span>
                            <span className="text-gray-500">
                              <MousePointer className="w-4 h-4 inline mr-1" />
                              {list.clickRate}% clicks
                            </span>
                            <div className="flex gap-1">
                              {list.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Subscribers</CardTitle>
                      <Button variant="outline" size="sm">View All</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {initialSubscribers.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="p-3 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedSubscriber(subscriber)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={subscriber.avatar} />
                              <AvatarFallback>{subscriber.firstName[0]}{subscriber.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{subscriber.firstName} {subscriber.lastName}</p>
                                <Badge className={getSubscriberStatusColor(subscriber.status)} variant="secondary">
                                  {subscriber.status}
                                </Badge>
                                <Badge className={getEngagementColor(subscriber.engagementLevel)} variant="secondary">
                                  {subscriber.engagementLevel.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{subscriber.email}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-500">{subscriber.openRate}% opens</p>
                              <p className="text-gray-500">{subscriber.clickRate}% clicks</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Segments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockSegments.map((segment) => (
                        <div key={segment.id} className="p-3 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{segment.name}</p>
                              <p className="text-sm text-gray-500">{segment.subscriberCount.toLocaleString()} subscribers</p>
                            </div>
                            <Target className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Segment
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Engagement Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { level: 'Highly Engaged', count: 8450, percentage: 35, color: 'bg-green-500' },
                        { level: 'Engaged', count: 12300, percentage: 28, color: 'bg-blue-500' },
                        { level: 'Inactive', count: 8900, percentage: 20, color: 'bg-yellow-500' },
                        { level: 'At Risk', count: 5200, percentage: 12, color: 'bg-orange-500' },
                        { level: 'Dormant', count: 2150, percentage: 5, color: 'bg-red-500' }
                      ].map((item) => (
                        <div key={item.level}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{item.level}</span>
                            <span className="text-sm text-gray-500">{item.count.toLocaleString()}</span>
                          </div>
                          <Progress value={item.percentage} className={`h-2 ${item.color}`} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-6">
            {/* Automations Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Email Automations</h2>
                  <p className="text-emerald-100">ActiveCampaign-level workflow automation</p>
                  <p className="text-emerald-200 text-xs mt-1">Drip campaigns • Triggers • Personalization</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{automations.length}</p>
                    <p className="text-emerald-200 text-sm">Automations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{automations.filter(a => a.status === 'active').length}</p>
                    <p className="text-emerald-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Email Automations</h2>
                <p className="text-gray-500">Create automated email sequences triggered by user actions</p>
              </div>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockAutomations.map((automation) => (
                <Card key={automation.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedAutomation(automation)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                          {getAutomationTriggerIcon(automation.trigger)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{automation.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{automation.trigger.replace('_', ' ')} trigger</p>
                        </div>
                      </div>
                      <Badge className={automation.status === 'active' ? 'bg-green-100 text-green-700' : automation.status === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                        {automation.status === 'active' ? <Play className="w-3 h-3 mr-1" /> : automation.status === 'paused' ? <Pause className="w-3 h-3 mr-1" /> : <Edit className="w-3 h-3 mr-1" />}
                        {automation.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {automation.steps.slice(0, 5).map((step, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.type === 'email' ? 'bg-blue-100 text-blue-600' :
                            step.type === 'delay' ? 'bg-gray-100 text-gray-600' :
                            step.type === 'condition' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {step.type === 'email' ? <Mail className="w-4 h-4" /> :
                             step.type === 'delay' ? <Clock className="w-4 h-4" /> :
                             step.type === 'condition' ? <Target className="w-4 h-4" /> :
                             <Zap className="w-4 h-4" />}
                          </div>
                          {idx < automation.steps.length - 1 && idx < 4 && (
                            <div className="w-4 h-0.5 bg-gray-200" />
                          )}
                        </div>
                      ))}
                      {automation.steps.length > 5 && (
                        <span className="text-xs text-gray-500">+{automation.steps.length - 5}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold">{automation.stats.enrolled.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Enrolled</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{automation.stats.inProgress.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{automation.stats.completed.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-600">{((automation.stats.converted / automation.stats.enrolled) * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">Converted</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Email Templates</h2>
                <p className="text-gray-500">Design beautiful email templates for your campaigns</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {initialTemplates.map((template) => (
                <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-0">
                    <div className={`h-40 bg-gradient-to-br ${getTemplateCategoryColor(template.category)} rounded-t-lg flex items-center justify-center`}>
                      <LayoutTemplate className="w-16 h-16 text-white/80" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        {template.isCustom && (
                          <Badge variant="outline" className="text-xs">Custom</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="capitalize">{template.category}</span>
                        <span>Used {template.useCount}x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Email Analytics</h2>
                  <p className="text-orange-100">SendGrid-level analytics and deliverability insights</p>
                  <p className="text-orange-200 text-xs mt-1">Open rates • Click tracking • Bounce analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{((stats.totalOpens / stats.totalSent) * 100).toFixed(1)}%</p>
                    <p className="text-orange-200 text-sm">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{((stats.totalClicks / stats.totalSent) * 100).toFixed(1)}%</p>
                    <p className="text-orange-200 text-sm">Click Rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Email performance chart</p>
                      <p className="text-sm">Opens, clicks, and conversions over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { device: 'Mobile', percentage: 58, icon: Smartphone },
                      { device: 'Desktop', percentage: 35, icon: Monitor },
                      { device: 'Tablet', percentage: 7, icon: Monitor }
                    ].map((item) => (
                      <div key={item.device} className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{item.device}</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Top Performing Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {initialCampaigns
                      .filter(c => c.status === 'sent')
                      .sort((a, b) => (b.stats.uniqueClicks / b.stats.delivered) - (a.stats.uniqueClicks / a.stats.delivered))
                      .slice(0, 5)
                      .map((campaign, idx) => (
                        <div key={campaign.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{campaign.name}</p>
                            <p className="text-xs text-gray-500">{((campaign.stats.uniqueClicks / campaign.stats.delivered) * 100).toFixed(1)}% CTR</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Deliverability Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sender Score</span>
                      <span className="font-semibold text-green-600">92/100</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Spam Rate</p>
                        <p className="font-semibold text-green-600">0.02%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bounce Rate</p>
                        <p className="font-semibold text-green-600">{stats.bounceRate.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Blacklist Status</p>
                        <p className="font-semibold text-green-600">Clean</p>
                      </div>
                      <div>
                        <p className="text-gray-500">SPF/DKIM</p>
                        <p className="font-semibold text-green-600">Passed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Link Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { url: 'View Product', clicks: 1250, percentage: 45 },
                      { url: 'Shop Now', clicks: 890, percentage: 32 },
                      { url: 'Learn More', clicks: 456, percentage: 16 },
                      { url: 'Unsubscribe', clicks: 89, percentage: 3 },
                      { url: 'Social Links', clicks: 112, percentage: 4 }
                    ].map((link) => (
                      <div key={link.url} className="flex items-center gap-3">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{link.url}</span>
                            <span className="text-sm text-gray-500">{link.clicks}</span>
                          </div>
                          <Progress value={link.percentage} className="h-1 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Email Settings</h2>
                  <p className="text-slate-100">Enterprise-level email configuration and compliance</p>
                  <p className="text-slate-200 text-xs mt-1">DKIM/SPF • Sender profiles • Compliance settings</p>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: <Settings className="w-4 h-4" />, label: 'General', color: 'text-slate-600' },
                { icon: <Mail className="w-4 h-4" />, label: 'Sender', color: 'text-blue-600' },
                { icon: <Shield className="w-4 h-4" />, label: 'Auth', color: 'text-green-600' },
                { icon: <Link className="w-4 h-4" />, label: 'Tracking', color: 'text-purple-600' },
                { icon: <Bell className="w-4 h-4" />, label: 'Notify', color: 'text-orange-600' },
                { icon: <Zap className="w-4 h-4" />, label: 'API', color: 'text-amber-600' },
                { icon: <Users className="w-4 h-4" />, label: 'Team', color: 'text-pink-600' },
                { icon: <Download className="w-4 h-4" />, label: 'Export', color: 'text-cyan-600' }
              ].map((action, index) => (
                <button key={index} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:scale-105 transition-all duration-200">
                  <span className={action.color}>{action.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Sender Information</CardTitle>
                  <CardDescription>Configure your default sender details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default From Name</label>
                    <Input defaultValue="FreeFlow Team" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default From Email</label>
                    <Input defaultValue="hello@freeflow.com" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reply-To Email</label>
                    <Input defaultValue="support@freeflow.com" className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Email Authentication</CardTitle>
                  <CardDescription>Verify your domain for better deliverability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'SPF Record', status: 'verified' },
                    { name: 'DKIM Signature', status: 'verified' },
                    { name: 'DMARC Policy', status: 'verified' },
                    { name: 'Custom Domain', status: 'verified' }
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span>{item.name}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Subscription Preferences</CardTitle>
                  <CardDescription>Manage unsubscribe and preference settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Double Opt-In</p>
                      <p className="text-sm text-gray-500">Require email confirmation for new subscribers</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Preference Center</p>
                      <p className="text-sm text-gray-500">Allow subscribers to manage their preferences</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">One-Click Unsubscribe</p>
                      <p className="text-sm text-gray-500">Add list-unsubscribe header to all emails</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Connect your email marketing with other tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Shopify', connected: true },
                    { name: 'WooCommerce', connected: false },
                    { name: 'Zapier', connected: true },
                    { name: 'Salesforce', connected: false }
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{integration.name}</span>
                      <Button variant={integration.connected ? 'outline' : 'default'} size="sm">
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockEmailAIInsights}
              title="Email Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockEmailCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockEmailPredictions}
              title="Campaign Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockEmailActivities}
            title="Email Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockEmailQuickActions}
            variant="grid"
          />
        </div>

        {/* Campaign Detail Dialog */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedCampaign?.name}
                {selectedCampaign && (
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {getStatusIcon(selectedCampaign.status)}
                    <span className="ml-1 capitalize">{selectedCampaign.status}</span>
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{selectedCampaign?.subject}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              {selectedCampaign && (
                <div className="space-y-6 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{selectedCampaign.fromName}</p>
                      <p className="text-sm text-gray-500">{selectedCampaign.fromEmail}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-sm text-gray-500">Reply To</p>
                      <p className="font-medium">{selectedCampaign.replyTo}</p>
                    </div>
                  </div>

                  {selectedCampaign.status === 'sent' && (
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="border-0 bg-blue-50 dark:bg-blue-900/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-blue-600">{((selectedCampaign.stats.uniqueOpens / selectedCampaign.stats.delivered) * 100).toFixed(1)}%</p>
                          <p className="text-sm text-blue-600">Open Rate</p>
                          <p className="text-xs text-gray-500 mt-1">{selectedCampaign.stats.uniqueOpens.toLocaleString()} unique opens</p>
                        </CardContent>
                      </Card>
                      <Card className="border-0 bg-purple-50 dark:bg-purple-900/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-purple-600">{((selectedCampaign.stats.uniqueClicks / selectedCampaign.stats.delivered) * 100).toFixed(1)}%</p>
                          <p className="text-sm text-purple-600">Click Rate</p>
                          <p className="text-xs text-gray-500 mt-1">{selectedCampaign.stats.uniqueClicks.toLocaleString()} unique clicks</p>
                        </CardContent>
                      </Card>
                      <Card className="border-0 bg-green-50 dark:bg-green-900/20">
                        <CardContent className="p-4 text-center">
                          <p className="text-3xl font-bold text-green-600">{((selectedCampaign.stats.delivered / selectedCampaign.stats.sent) * 100).toFixed(1)}%</p>
                          <p className="text-sm text-green-600">Delivery Rate</p>
                          <p className="text-xs text-gray-500 mt-1">{selectedCampaign.stats.delivered.toLocaleString()} delivered</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {selectedCampaign.abTest?.enabled && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-3">
                        <TestTube2 className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold text-amber-700">A/B Test Results</h4>
                      </div>
                      <div className="space-y-2">
                        {selectedCampaign.abTest.variants.map((variant, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                            <span className="text-sm">{variant.subject}</span>
                            <Badge variant="outline">{variant.sendPercentage}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {selectedCampaign.status === 'draft' && (
                      <>
                        <Button><Edit className="w-4 h-4 mr-2" />Edit</Button>
                        <Button variant="outline"><Clock className="w-4 h-4 mr-2" />Schedule</Button>
                        <Button className="bg-gradient-to-r from-rose-500 to-pink-600"><Send className="w-4 h-4 mr-2" />Send Now</Button>
                      </>
                    )}
                    {selectedCampaign.status === 'sent' && (
                      <>
                        <Button variant="outline"><Copy className="w-4 h-4 mr-2" />Duplicate</Button>
                        <Button variant="outline"><BarChart3 className="w-4 h-4 mr-2" />Full Report</Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Subscriber Detail Dialog */}
        <Dialog open={!!selectedSubscriber} onOpenChange={() => setSelectedSubscriber(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedSubscriber?.avatar} />
                  <AvatarFallback>{selectedSubscriber?.firstName[0]}{selectedSubscriber?.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p>{selectedSubscriber?.firstName} {selectedSubscriber?.lastName}</p>
                  <p className="text-sm font-normal text-gray-500">{selectedSubscriber?.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedSubscriber && (
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Badge className={getSubscriberStatusColor(selectedSubscriber.status)}>{selectedSubscriber.status}</Badge>
                  <Badge className={getEngagementColor(selectedSubscriber.engagementLevel)}>{selectedSubscriber.engagementLevel.replace('_', ' ')}</Badge>
                  {selectedSubscriber.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedSubscriber.openRate}%</p>
                    <p className="text-sm text-gray-500">Open Rate</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedSubscriber.clickRate}%</p>
                    <p className="text-sm text-gray-500">Click Rate</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold text-green-600">${selectedSubscriber.purchaseValue}</p>
                    <p className="text-sm text-gray-500">Total Value</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span>{selectedSubscriber.location.city}, {selectedSubscriber.location.country}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Source</span>
                    <span>{selectedSubscriber.source}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Signup Date</span>
                    <span>{new Date(selectedSubscriber.signupDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Opened</span>
                    <span>{new Date(selectedSubscriber.lastOpened).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Opens</span>
                    <span>{selectedSubscriber.totalOpens}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Clicks</span>
                    <span>{selectedSubscriber.totalClicks}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Automation Detail Dialog */}
        <Dialog open={!!selectedAutomation} onOpenChange={() => setSelectedAutomation(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  {selectedAutomation && getAutomationTriggerIcon(selectedAutomation.trigger)}
                </div>
                {selectedAutomation?.name}
              </DialogTitle>
              <DialogDescription className="capitalize">
                {selectedAutomation?.trigger.replace('_', ' ')} trigger
              </DialogDescription>
            </DialogHeader>
            {selectedAutomation && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold">{selectedAutomation.stats.enrolled.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Enrolled</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedAutomation.stats.inProgress.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">In Progress</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedAutomation.stats.completed.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                    <p className="text-2xl font-bold text-purple-600">{((selectedAutomation.stats.converted / selectedAutomation.stats.enrolled) * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Conversion</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Automation Steps</h4>
                  <div className="space-y-2">
                    {selectedAutomation.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.type === 'email' ? 'bg-blue-100 text-blue-600' :
                          step.type === 'delay' ? 'bg-gray-200 text-gray-600' :
                          step.type === 'condition' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {step.type === 'email' ? <Mail className="w-4 h-4" /> :
                           step.type === 'delay' ? <Clock className="w-4 h-4" /> :
                           step.type === 'condition' ? <Target className="w-4 h-4" /> :
                           <Zap className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{step.type}</p>
                          <p className="text-sm text-gray-500">
                            {step.type === 'email' && 'Send email template'}
                            {step.type === 'delay' && `Wait ${(step.config as { days?: number; hours?: number }).days || (step.config as { hours?: number }).hours} ${(step.config as { days?: number }).days ? 'days' : 'hours'}`}
                            {step.type === 'condition' && 'Check condition'}
                            {step.type === 'action' && 'Perform action'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedAutomation.status === 'active' ? (
                    <Button variant="outline"><Pause className="w-4 h-4 mr-2" />Pause Automation</Button>
                  ) : (
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600"><Play className="w-4 h-4 mr-2" />Activate</Button>
                  )}
                  <Button variant="outline"><Edit className="w-4 h-4 mr-2" />Edit Steps</Button>
                  <Button variant="outline"><BarChart3 className="w-4 h-4 mr-2" />View Analytics</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
