'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  Mail, Send, BarChart3, Users, Target, Zap, Clock, TrendingUp,
  Plus, Search, Filter, MoreVertical, Play, Pause, CheckCircle2,
  AlertCircle, Edit2, Copy, Trash2, Eye, Calendar, DollarSign,
  MousePointer, ArrowUpRight, Sparkles, MessageSquare, Phone,
  Globe, Settings, FileText, Layout, Layers, GitBranch, Split,
  FlaskConical, Inbox, UserPlus, Tag, Megaphone, ChevronRight,
  RefreshCw, Download, Share2, BarChart2, PieChart, Activity,
  Palette, Image, Type, Link2, Wand2, Brain, Gauge, Shield,
  MapPin, Smartphone, Monitor, Tablet, ArrowUp, ArrowDown,
  ThumbsUp, ThumbsDown, Star, Heart, Ban, AlertTriangle, CheckCircle,
  XCircle, Timer, TrendingDown, MailOpen, MousePointerClick, UserMinus,
  Unlink, ExternalLink, Hash, AtSign, Percent, LineChart, AreaChart,
  Sliders, Webhook, Key, Database, HardDrive, Terminal, Lock, Archive,
  Trash2 as TrashIcon, Bell, Server, Code, Folder, FileCode
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  Sparkline,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// ============== MAILCHIMP-LEVEL INTERFACES ==============

type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'running' | 'paused' | 'completed' | 'archived'
type CampaignType = 'email' | 'sms' | 'social' | 'multi_channel' | 'ab_test' | 'automation'
type EmailType = 'regular' | 'automated' | 'rss' | 'transactional' | 'plain_text'
type AudienceStatus = 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional'

interface Campaign {
  id: string
  name: string
  description?: string
  type: CampaignType
  emailType?: EmailType
  status: CampaignStatus
  subject?: string
  previewText?: string
  fromName: string
  fromEmail: string
  replyTo?: string
  audienceId: string
  audienceName: string
  audienceSize: number
  templateId?: string
  content?: {
    html: string
    plainText?: string
  }
  schedule?: {
    sendAt: Date
    timezone: string
    sendTimeOptimization: boolean
  }
  tracking: {
    opensTracking: boolean
    clicksTracking: boolean
    googleAnalytics: boolean
    utmParams?: Record<string, string>
  }
  stats: CampaignStats
  abTest?: ABTest
  automation?: AutomationTrigger
  tags: string[]
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
}

interface CampaignStats {
  sent: number
  delivered: number
  bounced: number
  opens: number
  uniqueOpens: number
  clicks: number
  uniqueClicks: number
  unsubscribes: number
  complaints: number
  revenue: number
  conversions: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  deliverabilityRate: number
}

interface ABTest {
  id: string
  name: string
  testType: 'subject' | 'from_name' | 'content' | 'send_time'
  variants: ABVariant[]
  winner?: string
  winnerCriteria: 'open_rate' | 'click_rate' | 'revenue'
  testDuration: number
  testPercentage: number
  status: 'testing' | 'completed' | 'no_winner'
}

interface ABVariant {
  id: string
  name: string
  subject?: string
  fromName?: string
  content?: string
  sendTime?: Date
  stats: {
    sent: number
    opens: number
    clicks: number
    conversions: number
    openRate: number
    clickRate: number
  }
  isWinner: boolean
}

interface AutomationTrigger {
  type: 'signup' | 'purchase' | 'abandoned_cart' | 'birthday' | 'date' | 'activity' | 'tag_added' | 'custom'
  config: Record<string, unknown>
  delayDays: number
  delayHours: number
}

interface Audience {
  id: string
  name: string
  description?: string
  stats: {
    total: number
    subscribed: number
    unsubscribed: number
    cleaned: number
    pending: number
    avgOpenRate: number
    avgClickRate: number
  }
  growthRate: number
  lastCampaignSent?: Date
  tags: string[]
  segments: AudienceSegment[]
  createdAt: Date
}

interface AudienceSegment {
  id: string
  name: string
  type: 'saved' | 'static' | 'dynamic'
  conditions: SegmentCondition[]
  memberCount: number
  createdAt: Date
}

interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_blank'
  value: string | number | boolean
}

interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: AudienceStatus
  rating: 1 | 2 | 3 | 4 | 5
  engagementScore: number
  openRate: number
  clickRate: number
  source: string
  location?: {
    country: string
    city?: string
    timezone?: string
  }
  tags: string[]
  customFields: Record<string, unknown>
  joinedAt: Date
  lastActivityAt?: Date
}

interface EmailTemplate {
  id: string
  name: string
  category: 'basic' | 'newsletter' | 'product' | 'event' | 'announcement' | 'ecommerce'
  thumbnail: string
  html: string
  usageCount: number
  openRate: number
  clickRate: number
  isCustom: boolean
  createdAt: Date
}

interface AutomationWorkflow {
  id: string
  name: string
  description?: string
  trigger: AutomationTrigger
  status: 'active' | 'paused' | 'draft'
  steps: WorkflowStep[]
  stats: {
    enrolled: number
    completed: number
    active: number
    revenue: number
    openRate: number
    clickRate: number
  }
  createdAt: Date
}

interface WorkflowStep {
  id: string
  type: 'email' | 'delay' | 'condition' | 'split' | 'tag' | 'webhook'
  config: Record<string, unknown>
  position: number
  stats?: {
    sent?: number
    opens?: number
    clicks?: number
  }
}

interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'video' | 'product' | 'code'
  content: Record<string, unknown>
  styles: Record<string, string>
}

interface DeliverabilityReport {
  domain: string
  score: number
  spfStatus: 'pass' | 'fail' | 'neutral'
  dkimStatus: 'pass' | 'fail' | 'neutral'
  dmarcStatus: 'pass' | 'fail' | 'neutral'
  blacklistStatus: 'clean' | 'listed'
  reputation: 'excellent' | 'good' | 'fair' | 'poor'
  issues: string[]
  recommendations: string[]
}

// ============== MOCK DATA ==============

const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Summer Sale 2024',
    description: 'Annual summer sale announcement with exclusive discounts',
    type: 'email',
    emailType: 'regular',
    status: 'completed',
    subject: '🌞 Summer Sale is Here! Up to 50% Off',
    previewText: 'Don\'t miss our biggest sale of the year',
    fromName: 'FreeFlow Store',
    fromEmail: 'hello@freeflow.com',
    audienceId: 'aud1',
    audienceName: 'All Subscribers',
    audienceSize: 12450,
    tags: ['sale', 'summer', '2024'],
    tracking: { opensTracking: true, clicksTracking: true, googleAnalytics: true },
    stats: {
      sent: 12450, delivered: 12234, bounced: 216, opens: 5856, uniqueOpens: 4234,
      clicks: 1890, uniqueClicks: 1456, unsubscribes: 23, complaints: 2,
      revenue: 45670, conversions: 234, openRate: 34.6, clickRate: 11.9,
      bounceRate: 1.7, unsubscribeRate: 0.18, deliverabilityRate: 98.3
    },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-15'),
    sentAt: new Date('2024-06-15T10:00:00')
  },
  {
    id: 'camp2',
    name: 'Welcome Series - Day 1',
    description: 'First email in welcome automation series',
    type: 'automation',
    emailType: 'automated',
    status: 'running',
    subject: 'Welcome to FreeFlow! Here\'s what to expect',
    fromName: 'FreeFlow Team',
    fromEmail: 'welcome@freeflow.com',
    audienceId: 'aud2',
    audienceName: 'New Signups',
    audienceSize: 890,
    tags: ['welcome', 'onboarding'],
    tracking: { opensTracking: true, clicksTracking: true, googleAnalytics: true },
    stats: {
      sent: 4532, delivered: 4498, bounced: 34, opens: 3456, uniqueOpens: 3012,
      clicks: 1234, uniqueClicks: 987, unsubscribes: 12, complaints: 0,
      revenue: 12340, conversions: 156, openRate: 67.0, clickRate: 21.9,
      bounceRate: 0.8, unsubscribeRate: 0.26, deliverabilityRate: 99.2
    },
    automation: { type: 'signup', config: {}, delayDays: 0, delayHours: 1 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-20')
  },
  {
    id: 'camp3',
    name: 'Product Launch: Pro Plan',
    description: 'Announcing new Pro plan features',
    type: 'ab_test',
    emailType: 'regular',
    status: 'completed',
    subject: 'Introducing FreeFlow Pro',
    fromName: 'FreeFlow',
    fromEmail: 'hello@freeflow.com',
    audienceId: 'aud1',
    audienceName: 'All Subscribers',
    audienceSize: 10000,
    tags: ['product', 'launch', 'pro'],
    tracking: { opensTracking: true, clicksTracking: true, googleAnalytics: true },
    stats: {
      sent: 10000, delivered: 9856, bounced: 144, opens: 4234, uniqueOpens: 3567,
      clicks: 890, uniqueClicks: 756, unsubscribes: 8, complaints: 1,
      revenue: 23450, conversions: 89, openRate: 36.2, clickRate: 7.7,
      bounceRate: 1.4, unsubscribeRate: 0.08, deliverabilityRate: 98.6
    },
    abTest: {
      id: 'ab1',
      name: 'Subject Line Test',
      testType: 'subject',
      variants: [
        { id: 'v1', name: 'Variant A', subject: 'Introducing FreeFlow Pro', stats: { sent: 5000, opens: 1890, clicks: 456, conversions: 45, openRate: 37.8, clickRate: 9.1 }, isWinner: true },
        { id: 'v2', name: 'Variant B', subject: 'Meet the New FreeFlow Pro Plan', stats: { sent: 5000, opens: 1677, clicks: 300, conversions: 44, openRate: 33.5, clickRate: 6.0 }, isWinner: false }
      ],
      winner: 'v1',
      winnerCriteria: 'open_rate',
      testDuration: 4,
      testPercentage: 100,
      status: 'completed'
    },
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-10'),
    sentAt: new Date('2024-05-10T09:00:00')
  },
  {
    id: 'camp4',
    name: 'Abandoned Cart Recovery',
    description: 'Automated cart abandonment emails',
    type: 'automation',
    emailType: 'automated',
    status: 'running',
    subject: 'You left something behind! 🛒',
    fromName: 'FreeFlow Store',
    fromEmail: 'shop@freeflow.com',
    audienceId: 'aud3',
    audienceName: 'Cart Abandoners',
    audienceSize: 2340,
    tags: ['ecommerce', 'recovery', 'cart'],
    tracking: { opensTracking: true, clicksTracking: true, googleAnalytics: true },
    stats: {
      sent: 1234, delivered: 1220, bounced: 14, opens: 634, uniqueOpens: 567,
      clicks: 312, uniqueClicks: 289, unsubscribes: 3, complaints: 0,
      revenue: 8940, conversions: 67, openRate: 46.5, clickRate: 23.7,
      bounceRate: 1.1, unsubscribeRate: 0.24, deliverabilityRate: 98.9
    },
    automation: { type: 'abandoned_cart', config: { cartValue: 50 }, delayDays: 0, delayHours: 2 },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-06-18')
  },
  {
    id: 'camp5',
    name: 'Monthly Newsletter - June',
    description: 'June newsletter with company updates',
    type: 'email',
    emailType: 'regular',
    status: 'scheduled',
    subject: 'June Updates: New Features & Tips',
    fromName: 'FreeFlow Newsletter',
    fromEmail: 'newsletter@freeflow.com',
    audienceId: 'aud4',
    audienceName: 'Newsletter Subscribers',
    audienceSize: 8900,
    tags: ['newsletter', 'monthly'],
    tracking: { opensTracking: true, clicksTracking: true, googleAnalytics: true },
    schedule: { sendAt: new Date('2024-07-01T10:00:00'), timezone: 'America/New_York', sendTimeOptimization: true },
    stats: {
      sent: 0, delivered: 0, bounced: 0, opens: 0, uniqueOpens: 0,
      clicks: 0, uniqueClicks: 0, unsubscribes: 0, complaints: 0,
      revenue: 0, conversions: 0, openRate: 0, clickRate: 0,
      bounceRate: 0, unsubscribeRate: 0, deliverabilityRate: 0
    },
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-06-22')
  }
]

const mockAudiences: Audience[] = [
  {
    id: 'aud1',
    name: 'All Subscribers',
    description: 'Main subscriber list',
    stats: { total: 12450, subscribed: 11234, unsubscribed: 890, cleaned: 326, pending: 0, avgOpenRate: 34.5, avgClickRate: 12.3 },
    growthRate: 5.2,
    tags: ['main', 'active'],
    segments: [
      { id: 'seg1', name: 'High Engagers', type: 'dynamic', conditions: [{ field: 'engagement_score', operator: 'greater_than', value: 80 }], memberCount: 2340, createdAt: new Date() },
      { id: 'seg2', name: 'Inactive (90 days)', type: 'dynamic', conditions: [{ field: 'last_activity', operator: 'less_than', value: 90 }], memberCount: 1560, createdAt: new Date() }
    ],
    createdAt: new Date('2023-01-01')
  },
  {
    id: 'aud2',
    name: 'New Signups (30 days)',
    description: 'Recently joined subscribers',
    stats: { total: 890, subscribed: 870, unsubscribed: 12, cleaned: 8, pending: 0, avgOpenRate: 56.7, avgClickRate: 18.9 },
    growthRate: 12.3,
    tags: ['new', 'onboarding'],
    segments: [],
    createdAt: new Date('2024-05-01')
  },
  {
    id: 'aud3',
    name: 'E-commerce Customers',
    description: 'Customers who have made a purchase',
    stats: { total: 4560, subscribed: 4320, unsubscribed: 180, cleaned: 60, pending: 0, avgOpenRate: 42.3, avgClickRate: 15.6 },
    growthRate: 8.7,
    tags: ['customers', 'purchasers'],
    segments: [
      { id: 'seg3', name: 'VIP Customers', type: 'saved', conditions: [{ field: 'total_spent', operator: 'greater_than', value: 500 }], memberCount: 890, createdAt: new Date() },
      { id: 'seg4', name: 'One-time Buyers', type: 'saved', conditions: [{ field: 'order_count', operator: 'equals', value: 1 }], memberCount: 2340, createdAt: new Date() }
    ],
    createdAt: new Date('2023-06-01')
  },
  {
    id: 'aud4',
    name: 'Newsletter Subscribers',
    description: 'Blog and content subscribers',
    stats: { total: 8900, subscribed: 8450, unsubscribed: 340, cleaned: 110, pending: 0, avgOpenRate: 38.9, avgClickRate: 14.2 },
    growthRate: 3.4,
    tags: ['content', 'blog'],
    segments: [],
    createdAt: new Date('2023-03-01')
  }
]

const mockAutomations: AutomationWorkflow[] = [
  {
    id: 'auto1',
    name: 'Welcome Email Series',
    description: 'Onboard new subscribers with a 5-email series',
    trigger: { type: 'signup', config: {}, delayDays: 0, delayHours: 1 },
    status: 'active',
    steps: [
      { id: 's1', type: 'email', config: { subject: 'Welcome!' }, position: 1, stats: { sent: 4532, opens: 3456, clicks: 1234 } },
      { id: 's2', type: 'delay', config: { days: 2 }, position: 2 },
      { id: 's3', type: 'email', config: { subject: 'Getting Started' }, position: 3, stats: { sent: 4012, opens: 2890, clicks: 890 } },
      { id: 's4', type: 'delay', config: { days: 3 }, position: 4 },
      { id: 's5', type: 'email', config: { subject: 'Pro Tips' }, position: 5, stats: { sent: 3678, opens: 2456, clicks: 678 } }
    ],
    stats: { enrolled: 4890, completed: 3456, active: 1234, revenue: 23450, openRate: 68.2, clickRate: 24.5 },
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'auto2',
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with 3 follow-up emails',
    trigger: { type: 'abandoned_cart', config: { minCartValue: 50 }, delayDays: 0, delayHours: 2 },
    status: 'active',
    steps: [
      { id: 's6', type: 'email', config: { subject: 'You forgot something!' }, position: 1, stats: { sent: 1234, opens: 634, clicks: 312 } },
      { id: 's7', type: 'delay', config: { days: 1 }, position: 2 },
      { id: 's8', type: 'condition', config: { check: 'not_purchased' }, position: 3 },
      { id: 's9', type: 'email', config: { subject: '10% off your cart' }, position: 4, stats: { sent: 890, opens: 456, clicks: 234 } }
    ],
    stats: { enrolled: 2340, completed: 1890, active: 450, revenue: 45670, openRate: 52.1, clickRate: 31.2 },
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'auto3',
    name: 'Birthday Campaign',
    description: 'Send birthday wishes with special offer',
    trigger: { type: 'birthday', config: { daysBefore: 3 }, delayDays: 0, delayHours: 0 },
    status: 'active',
    steps: [
      { id: 's10', type: 'email', config: { subject: '🎂 Happy Birthday!' }, position: 1, stats: { sent: 456, opens: 376, clicks: 189 } }
    ],
    stats: { enrolled: 456, completed: 456, active: 0, revenue: 8900, openRate: 82.5, clickRate: 45.2 },
    createdAt: new Date('2024-03-01')
  }
]

const mockTemplates: EmailTemplate[] = [
  { id: 't1', name: 'Welcome Email', category: 'basic', thumbnail: '📧', html: '', usageCount: 234, openRate: 68.2, clickRate: 24.5, isCustom: false, createdAt: new Date() },
  { id: 't2', name: 'Product Launch', category: 'announcement', thumbnail: '🚀', html: '', usageCount: 156, openRate: 42.3, clickRate: 18.7, isCustom: false, createdAt: new Date() },
  { id: 't3', name: 'Newsletter Classic', category: 'newsletter', thumbnail: '📰', html: '', usageCount: 445, openRate: 38.9, clickRate: 14.2, isCustom: false, createdAt: new Date() },
  { id: 't4', name: 'Cart Abandonment', category: 'ecommerce', thumbnail: '🛒', html: '', usageCount: 312, openRate: 52.1, clickRate: 31.2, isCustom: false, createdAt: new Date() },
  { id: 't5', name: 'Re-engagement', category: 'basic', thumbnail: '💫', html: '', usageCount: 189, openRate: 28.3, clickRate: 12.1, isCustom: false, createdAt: new Date() },
  { id: 't6', name: 'Sale Announcement', category: 'ecommerce', thumbnail: '🎉', html: '', usageCount: 267, openRate: 45.6, clickRate: 22.8, isCustom: false, createdAt: new Date() },
  { id: 't7', name: 'Event Invitation', category: 'event', thumbnail: '📅', html: '', usageCount: 123, openRate: 51.2, clickRate: 28.9, isCustom: false, createdAt: new Date() },
  { id: 't8', name: 'Custom Brand Template', category: 'basic', thumbnail: '✨', html: '', usageCount: 89, openRate: 44.5, clickRate: 19.3, isCustom: true, createdAt: new Date() }
]

const mockDeliverability: DeliverabilityReport = {
  domain: 'freeflow.com',
  score: 92,
  spfStatus: 'pass',
  dkimStatus: 'pass',
  dmarcStatus: 'pass',
  blacklistStatus: 'clean',
  reputation: 'excellent',
  issues: [],
  recommendations: ['Consider implementing BIMI for brand visibility', 'Monitor feedback loops from major ISPs']
}

// ============== HELPER FUNCTIONS ==============

const getStatusColor = (status: CampaignStatus): string => {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    sending: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    running: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    completed: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
    archived: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400'
  }
  return colors[status] || colors.draft
}

const getCampaignTypeColor = (type: CampaignType): string => {
  const colors: Record<CampaignType, string> = {
    email: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    sms: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    social: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    multi_channel: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ab_test: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    automation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
  }
  return colors[type] || colors.email
}

const getCampaignIcon = (type: CampaignType) => {
  const icons: Record<CampaignType, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    social: <Globe className="w-4 h-4" />,
    multi_channel: <Layers className="w-4 h-4" />,
    ab_test: <Split className="w-4 h-4" />,
    automation: <Zap className="w-4 h-4" />
  }
  return icons[type] || icons.email
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// ============== COMPETITIVE UPGRADE MOCK DATA ==============

const mockCampaignAIInsights = [
  { id: '1', query: "Which campaign is performing best?", insight: "Summer Sale campaign has 34% open rate - 12% above average. Subject line A/B test winner: urgency-based messaging.", confidence: 0.93, category: 'engagement' as const, timestamp: new Date().toISOString() },
  { id: '2', query: "When should I send the next campaign?", insight: "Your audience is most active Tuesdays 10-11am EST. Avoid Mondays - 23% lower open rates.", confidence: 0.88, category: 'conversion' as const, timestamp: new Date().toISOString() },
  { id: '3', query: "How to reduce unsubscribes?", insight: "Segment 'Inactive 90 days' has 5x higher unsubscribe rate. Consider a re-engagement campaign first.", confidence: 0.85, category: 'revenue' as const, timestamp: new Date().toISOString() },
]

const mockCampaignCollaborators = [
  { id: '1', name: 'Marketing Team', avatar: '/avatars/marketing.jpg', status: 'active' as const, lastActive: 'Just now', role: 'Marketing' },
  { id: '2', name: 'Content Writer', avatar: '/avatars/content.jpg', status: 'active' as const, lastActive: '5m ago', role: 'Content' },
  { id: '3', name: 'Design Lead', avatar: '/avatars/design.jpg', status: 'idle' as const, lastActive: '15m ago', role: 'Design' },
]

const mockCampaignPredictions = [
  { id: '1', metric: 'Open Rate', currentValue: 24.5, predictedValue: 28, confidence: 0.81, trend: 'up' as const, timeframe: 'Next campaign', factors: ['Subject line optimization', 'Send time optimization'] },
  { id: '2', metric: 'Click Rate', currentValue: 3.2, predictedValue: 4.1, confidence: 0.77, trend: 'up' as const, timeframe: 'Next campaign', factors: ['Better CTAs', 'Personalization'] },
  { id: '3', metric: 'Revenue per Email', currentValue: 0.42, predictedValue: 0.58, confidence: 0.74, trend: 'up' as const, timeframe: 'Q1', factors: ['Product recommendations', 'Cart abandonment flows'] },
]

const mockCampaignActivities = [
  { id: '1', type: 'create' as const, title: 'Campaign scheduled', description: 'Spring Newsletter set for March 1st 10am', user: { name: 'Marketing Team', avatar: '/avatars/marketing.jpg' }, timestamp: new Date().toISOString(), metadata: {} },
  { id: '2', type: 'update' as const, title: 'A/B test completed', description: 'Subject line B won with 28% open rate', user: { name: 'System', avatar: '' }, timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: {} },
  { id: '3', type: 'milestone' as const, title: 'Subscriber milestone', description: 'Email list reached 50,000 subscribers', user: { name: 'Marketing Team', avatar: '/avatars/marketing.jpg' }, timestamp: new Date(Date.now() - 86400000).toISOString(), metadata: {} },
]

const mockCampaignQuickActions = [
  { id: '1', label: 'New Campaign', icon: 'Mail', shortcut: '⌘N', action: () => console.log('New campaign') },
  { id: '2', label: 'Send Test', icon: 'Send', shortcut: '⌘T', action: () => console.log('Send test') },
  { id: '3', label: 'View Analytics', icon: 'BarChart3', shortcut: '⌘A', action: () => console.log('Analytics') },
  { id: '4', label: 'Manage Audience', icon: 'Users', shortcut: '⌘U', action: () => console.log('Audience') },
]

// ============== MAIN COMPONENT ==============

export default function CampaignsClient() {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showAudienceDialog, setShowAudienceDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  const stats = useMemo(() => ({
    totalCampaigns: mockCampaigns.length,
    activeCampaigns: mockCampaigns.filter(c => c.status === 'running').length,
    scheduledCampaigns: mockCampaigns.filter(c => c.status === 'scheduled').length,
    totalSubscribers: mockAudiences.reduce((sum, a) => sum + a.stats.subscribed, 0),
    avgOpenRate: mockCampaigns.filter(c => c.stats.openRate > 0).reduce((sum, c) => sum + c.stats.openRate, 0) / mockCampaigns.filter(c => c.stats.openRate > 0).length || 0,
    avgClickRate: mockCampaigns.filter(c => c.stats.clickRate > 0).reduce((sum, c) => sum + c.stats.clickRate, 0) / mockCampaigns.filter(c => c.stats.clickRate > 0).length || 0,
    totalRevenue: mockCampaigns.reduce((sum, c) => sum + c.stats.revenue, 0),
    totalSent: mockCampaigns.reduce((sum, c) => sum + c.stats.sent, 0)
  }), [])

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter(campaign => {
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false
      if (typeFilter !== 'all' && campaign.type !== typeFilter) return false
      if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [statusFilter, typeFilter, searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Megaphone className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Marketing Hub</h1>
                <p className="text-rose-100">Mailchimp-Level Email Marketing Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Content
              </Button>
              <Button
                onClick={() => setShowNewCampaignDialog(true)}
                className="bg-white text-rose-600 hover:bg-rose-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-8 gap-3">
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Campaigns</p>
                  <p className="text-xl font-bold">{stats.totalCampaigns}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Active</p>
                  <p className="text-xl font-bold">{stats.activeCampaigns}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Scheduled</p>
                  <p className="text-xl font-bold">{stats.scheduledCampaigns}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Subscribers</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalSubscribers)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <MailOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Open Rate</p>
                  <p className="text-xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg">
                  <MousePointerClick className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Click Rate</p>
                  <p className="text-xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Revenue</p>
                  <p className="text-xl font-bold">${formatNumber(stats.totalRevenue)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-fuchsia-400 to-pink-500 rounded-lg">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-rose-100">Emails Sent</p>
                  <p className="text-xl font-bold">{formatNumber(stats.totalSent)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1">
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="automations" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Automations
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="audiences" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Audiences
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="deliverability" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Deliverability
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-6">
              {/* Campaigns Overview Banner */}
              <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Email Campaigns</h3>
                    <p className="text-rose-100 mb-4">Create, send, and analyze email marketing campaigns</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-rose-100">Total Campaigns</p>
                        <p className="text-xl font-bold">{stats.totalCampaigns}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-rose-100">Active</p>
                        <p className="text-xl font-bold">{stats.activeCampaigns}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-rose-100">Avg Open Rate</p>
                        <p className="text-xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Mail className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Campaign', color: 'text-rose-500' },
                  { icon: Copy, label: 'Duplicate', color: 'text-blue-500' },
                  { icon: Zap, label: 'Automate', color: 'text-amber-500' },
                  { icon: Split, label: 'A/B Test', color: 'text-purple-500' },
                  { icon: Layout, label: 'Templates', color: 'text-green-500' },
                  { icon: Users, label: 'Audiences', color: 'text-indigo-500' },
                  { icon: BarChart3, label: 'Reports', color: 'text-cyan-500' },
                  { icon: Download, label: 'Export', color: 'text-pink-500' },
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

              {/* Filters */}
              <div className="flex items-center gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="automation">Automation</option>
                  <option value="ab_test">A/B Test</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {/* Campaign List */}
              <div className="space-y-4">
                {filteredCampaigns.map(campaign => (
                  <Card
                    key={campaign.id}
                    className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedCampaign(campaign)
                      setShowCampaignDialog(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getCampaignTypeColor(campaign.type)}`}>
                          {getCampaignIcon(campaign.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                            <Badge className={getCampaignTypeColor(campaign.type)}>{campaign.type}</Badge>
                            {campaign.abTest && <Badge className="bg-amber-100 text-amber-700">A/B Test</Badge>}
                          </div>
                          {campaign.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{campaign.description}</p>
                          )}
                          {campaign.subject && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                              <span className="font-medium">Subject:</span> {campaign.subject}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(campaign.audienceSize)} subscribers
                            </span>
                            <span className="flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              {formatNumber(campaign.stats.sent)} sent
                            </span>
                            {campaign.sentAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {campaign.sentAt.toLocaleDateString()}
                              </span>
                            )}
                            {campaign.schedule && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Clock className="w-3 h-3" />
                                Scheduled: {campaign.schedule.sendAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        {campaign.stats.openRate > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.stats.openRate.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Open Rate</div>
                          </div>
                        )}
                        {campaign.stats.clickRate > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{campaign.stats.clickRate.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Click Rate</div>
                          </div>
                        )}
                        {campaign.stats.revenue > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">${formatNumber(campaign.stats.revenue)}</div>
                            <div className="text-xs text-gray-500">Revenue</div>
                          </div>
                        )}
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* A/B Test Results */}
                    {campaign.abTest && campaign.abTest.status === 'completed' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Split className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium">A/B Test Results</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {campaign.abTest.variants.map(variant => (
                            <div
                              key={variant.id}
                              className={`p-3 rounded-lg ${variant.isWinner ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{variant.name}</span>
                                {variant.isWinner && <Badge className="bg-green-100 text-green-700">Winner</Badge>}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{variant.subject}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span>Open: {variant.stats.openRate.toFixed(1)}%</span>
                                <span>Click: {variant.stats.clickRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations">
            <div className="space-y-6">
              {/* Automations Overview Banner */}
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Email Automations</h3>
                    <p className="text-indigo-100 mb-4">Create automated email journeys that nurture leads</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-indigo-100">Active Automations</p>
                        <p className="text-xl font-bold">{mockAutomations.filter(a => a.status === 'active').length}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-indigo-100">Total Enrolled</p>
                        <p className="text-xl font-bold">{formatNumber(mockAutomations.reduce((sum, a) => sum + a.stats.enrolled, 0))}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-indigo-100">Revenue Generated</p>
                        <p className="text-xl font-bold">${formatNumber(mockAutomations.reduce((sum, a) => sum + a.stats.revenue, 0))}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Zap className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Flow', color: 'text-indigo-500' },
                  { icon: GitBranch, label: 'Branches', color: 'text-purple-500' },
                  { icon: Timer, label: 'Delays', color: 'text-amber-500' },
                  { icon: Split, label: 'A/B Split', color: 'text-pink-500' },
                  { icon: Target, label: 'Triggers', color: 'text-green-500' },
                  { icon: Filter, label: 'Conditions', color: 'text-blue-500' },
                  { icon: BarChart3, label: 'Analytics', color: 'text-cyan-500' },
                  { icon: Copy, label: 'Templates', color: 'text-rose-500' },
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

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Active Workflows</h2>
                  <p className="text-gray-500">Manage your automation workflows</p>
                </div>
                <Button><Plus className="w-4 h-4 mr-2" />Create Automation</Button>
              </div>

              <div className="grid gap-4">
                {mockAutomations.map(automation => (
                  <Card key={automation.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${automation.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <Zap className={`w-5 h-5 ${automation.status === 'active' ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{automation.name}</h3>
                            <Badge className={automation.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {automation.status}
                            </Badge>
                          </div>
                          {automation.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{automation.description}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Trigger: {automation.trigger.type.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            {automation.steps.filter(s => s.type === 'email').map((step, i) => (
                              <div key={step.id} className="flex items-center gap-2">
                                {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded">
                                  <Mail className="w-4 h-4 text-rose-600" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xl font-bold">{formatNumber(automation.stats.enrolled)}</div>
                          <div className="text-xs text-gray-500">Enrolled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{automation.stats.openRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{automation.stats.clickRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Click Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">${formatNumber(automation.stats.revenue)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <Switch checked={automation.status === 'active'} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="space-y-6">
              {/* Templates Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Email Templates</h3>
                    <p className="text-emerald-100 mb-4">Design beautiful emails with drag-and-drop editor</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-emerald-100">Total Templates</p>
                        <p className="text-xl font-bold">{mockTemplates.length}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-emerald-100">Custom Templates</p>
                        <p className="text-xl font-bold">{mockTemplates.filter(t => t.isCustom).length}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-emerald-100">Avg Open Rate</p>
                        <p className="text-xl font-bold">{(mockTemplates.reduce((sum, t) => sum + t.openRate, 0) / mockTemplates.length).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <Layout className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Template', color: 'text-emerald-500' },
                  { icon: Wand2, label: 'AI Generate', color: 'text-purple-500' },
                  { icon: Image, label: 'Media', color: 'text-blue-500' },
                  { icon: Type, label: 'Typography', color: 'text-amber-500' },
                  { icon: Palette, label: 'Colors', color: 'text-pink-500' },
                  { icon: Code, label: 'HTML Edit', color: 'text-gray-500' },
                  { icon: Copy, label: 'Duplicate', color: 'text-indigo-500' },
                  { icon: Download, label: 'Export', color: 'text-cyan-500' },
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

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Template Library</h2>
                  <p className="text-gray-500">Choose from pre-built or custom templates</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline"><Wand2 className="w-4 h-4 mr-2" />AI Generate</Button>
                  <Button><Plus className="w-4 h-4 mr-2" />Create Template</Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {mockTemplates.map(template => (
                  <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="h-40 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center relative">
                      <span className="text-6xl">{template.thumbnail}</span>
                      {template.isCustom && (
                        <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-700">Custom</Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Used {template.usageCount} times</span>
                        <span className="text-green-600">{template.openRate.toFixed(1)}% opens</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audiences Tab */}
          <TabsContent value="audiences">
            <div className="space-y-6">
              {/* Audiences Overview Banner */}
              <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Audience Management</h3>
                    <p className="text-violet-100 mb-4">Segment and manage your subscriber lists</p>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-violet-100">Total Audiences</p>
                        <p className="text-xl font-bold">{mockAudiences.length}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-violet-100">Total Subscribers</p>
                        <p className="text-xl font-bold">{formatNumber(stats.totalSubscribers)}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                        <p className="text-sm text-violet-100">Segments</p>
                        <p className="text-xl font-bold">{mockAudiences.reduce((sum, a) => sum + a.segments.length, 0)}</p>
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
                  { icon: Plus, label: 'New List', color: 'text-violet-500' },
                  { icon: Download, label: 'Import CSV', color: 'text-blue-500' },
                  { icon: Target, label: 'New Segment', color: 'text-green-500' },
                  { icon: Tag, label: 'Manage Tags', color: 'text-amber-500' },
                  { icon: UserPlus, label: 'Add Subscriber', color: 'text-pink-500' },
                  { icon: UserMinus, label: 'Clean List', color: 'text-red-500' },
                  { icon: RefreshCw, label: 'Sync CRM', color: 'text-indigo-500' },
                  { icon: Share2, label: 'Export', color: 'text-cyan-500' },
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

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Audience Lists</h2>
                  <p className="text-gray-500">All your subscriber lists and segments</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline"><Download className="w-4 h-4 mr-2" />Import</Button>
                  <Button><Plus className="w-4 h-4 mr-2" />Create Audience</Button>
                </div>
              </div>

              <div className="grid gap-4">
                {mockAudiences.map(audience => (
                  <Card key={audience.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{audience.name}</h3>
                            <div className="flex items-center gap-1">
                              {audience.growthRate >= 0 ? (
                                <ArrowUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-red-500" />
                              )}
                              <span className={audience.growthRate >= 0 ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                                {Math.abs(audience.growthRate)}%
                              </span>
                            </div>
                          </div>
                          {audience.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{audience.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {audience.tags.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(audience.stats.subscribed)}</div>
                          <div className="text-xs text-gray-500">Subscribed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{audience.stats.avgOpenRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Avg Opens</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{audience.stats.avgClickRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Avg Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{audience.segments.length}</div>
                          <div className="text-xs text-gray-500">Segments</div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {audience.segments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Segments</div>
                        <div className="flex flex-wrap gap-2">
                          {audience.segments.map(segment => (
                            <Badge key={segment.id} variant="outline" className="gap-1">
                              <Target className="w-3 h-3" />
                              {segment.name} ({formatNumber(segment.memberCount)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Emails Sent (30d)</h3>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(28450)}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% vs last period</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Avg Open Rate</h3>
                    <MailOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
                  <Progress value={stats.avgOpenRate} className="mt-2" />
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Avg Click Rate</h3>
                    <MousePointerClick className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{stats.avgClickRate.toFixed(1)}%</p>
                  <Progress value={stats.avgClickRate} className="mt-2" />
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-gray-500">Revenue (30d)</h3>
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">${formatNumber(stats.totalRevenue)}</p>
                  <p className="text-xs text-green-600 mt-1">+8.3% vs last period</p>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Email Performance Over Time</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <AreaChart className="w-16 h-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Performance chart</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Campaign Type Breakdown</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <PieChart className="w-16 h-16 text-gray-400" />
                    <span className="ml-4 text-gray-500">Type distribution</span>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top Performing Campaigns</h3>
                <div className="space-y-4">
                  {mockCampaigns.filter(c => c.stats.openRate > 0).sort((a, b) => b.stats.openRate - a.stats.openRate).slice(0, 5).map((campaign, i) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.sentAt?.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-green-600">{campaign.stats.openRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Opens</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-blue-600">{campaign.stats.clickRate.toFixed(1)}%</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-600">${formatNumber(campaign.stats.revenue)}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Deliverability Tab */}
          <TabsContent value="deliverability">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Email Deliverability</h2>
                  <p className="text-gray-500">Monitor your sender reputation and inbox placement</p>
                </div>
                <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Run Health Check</Button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                  <p className="text-4xl font-bold text-green-700">{mockDeliverability.score}</p>
                  <p className="text-sm text-green-600 mt-1">Sender Score</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium">SPF</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{mockDeliverability.spfStatus.toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">Email authentication</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium">DKIM</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{mockDeliverability.dkimStatus.toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">Domain verification</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="font-medium">DMARC</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{mockDeliverability.dmarcStatus.toUpperCase()}</p>
                  <p className="text-xs text-gray-500 mt-1">Policy enforcement</p>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Delivery Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Delivery Rate</span>
                        <span className="font-semibold">98.3%</span>
                      </div>
                      <Progress value={98.3} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Bounce Rate</span>
                        <span className="font-semibold text-red-600">1.7%</span>
                      </div>
                      <Progress value={1.7} className="h-2 bg-gray-100 [&>div]:bg-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Complaint Rate</span>
                        <span className="font-semibold text-yellow-600">0.02%</span>
                      </div>
                      <Progress value={0.02} className="h-2 bg-gray-100 [&>div]:bg-yellow-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Unsubscribe Rate</span>
                        <span className="font-semibold">0.18%</span>
                      </div>
                      <Progress value={0.18} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {mockDeliverability.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">{rec}</p>
                      </div>
                    ))}
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800 dark:text-green-300">Your domain is not on any email blacklists</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
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
                        { id: 'sending', label: 'Sending', icon: Send },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium'
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
                        <CardDescription>Configure your campaign defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default From Name</Label>
                            <Input defaultValue="FreeFlow Marketing" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default From Email</Label>
                            <Input defaultValue="hello@freeflow.com" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Reply-To Email</Label>
                            <Input defaultValue="support@freeflow.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>America/New_York</option>
                              <option>America/Los_Angeles</option>
                              <option>Europe/London</option>
                              <option>Asia/Tokyo</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Archive Completed Campaigns</p>
                              <p className="text-sm text-muted-foreground">Auto-archive after 30 days</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Show Unsubscribe Link</p>
                              <p className="text-sm text-muted-foreground">Required for compliance</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Branding</CardTitle>
                        <CardDescription>Customize your email appearance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Primary Brand Color</Label>
                            <div className="flex gap-2">
                              <Input type="color" defaultValue="#e11d48" className="w-12 h-10 p-1" />
                              <Input defaultValue="#e11d48" className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <Input placeholder="https://your-domain.com/logo.png" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'sending' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sending Configuration</CardTitle>
                        <CardDescription>Configure email sending behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Sending Rate Limit</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>No limit</option>
                              <option>100/hour</option>
                              <option>500/hour</option>
                              <option>1000/hour</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Send Time Optimization</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Disabled</option>
                              <option>Optimize for opens</option>
                              <option>Optimize for clicks</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Track Opens</p>
                              <p className="text-sm text-muted-foreground">Track email open events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Track Clicks</p>
                              <p className="text-sm text-muted-foreground">Track link click events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Google Analytics</p>
                              <p className="text-sm text-muted-foreground">Add UTM parameters to links</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Plain Text Fallback</p>
                              <p className="text-sm text-muted-foreground">Auto-generate plain text version</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Email Validation</CardTitle>
                        <CardDescription>Configure email validation settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Verify on Import</p>
                            <p className="text-sm text-muted-foreground">Validate emails when importing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Remove Invalid Emails</p>
                            <p className="text-sm text-muted-foreground">Auto-clean invalid addresses</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Notifications</CardTitle>
                        <CardDescription>Configure when to receive alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Campaign Sent', description: 'When a campaign finishes sending', enabled: true },
                          { title: 'Campaign Completed', description: 'Daily summary of campaign performance', enabled: true },
                          { title: 'Low Open Rate Alert', description: 'When open rate drops below threshold', enabled: true },
                          { title: 'High Unsubscribe Alert', description: 'When unsubscribes exceed threshold', enabled: true },
                          { title: 'New Subscriber', description: 'When someone joins your list', enabled: false },
                          { title: 'Bounce Alert', description: 'When bounce rate is high', enabled: true },
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
                        <CardDescription>Choose how to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: MessageSquare, label: 'In-App', active: true },
                            { icon: Smartphone, label: 'Mobile Push', active: false },
                            { icon: Globe, label: 'Slack', active: true },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
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
                        <CardTitle>Connected Integrations</CardTitle>
                        <CardDescription>Manage your third-party connections</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Salesforce', description: 'Sync subscribers with Salesforce', connected: true },
                            { name: 'Shopify', description: 'E-commerce integration', connected: true },
                            { name: 'Stripe', description: 'Payment and revenue tracking', connected: true },
                            { name: 'Google Analytics', description: 'Campaign tracking', connected: false },
                            { name: 'Zapier', description: 'Connect with 3000+ apps', connected: false },
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
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="mc_sk_xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline"><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input placeholder="https://your-app.com/webhook/campaigns" />
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
                        <CardTitle>Email Authentication</CardTitle>
                        <CardDescription>Configure domain authentication</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: 'SPF Record', status: 'pass', description: 'Sender Policy Framework' },
                            { name: 'DKIM Signature', status: 'pass', description: 'DomainKeys Identified Mail' },
                            { name: 'DMARC Policy', status: 'pass', description: 'Domain-based Message Authentication' },
                          ].map((auth, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className="font-medium">{auth.name}</p>
                                  <p className="text-sm text-muted-foreground">{auth.description}</p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700">{auth.status.toUpperCase()}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Compliance Settings</CardTitle>
                        <CardDescription>Manage data privacy compliance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">GDPR Mode</p>
                            <p className="text-sm text-muted-foreground">Enable GDPR-compliant features</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Double Opt-In</p>
                            <p className="text-sm text-muted-foreground">Require email confirmation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Data Retention</p>
                            <p className="text-sm text-muted-foreground">Auto-delete unsubscribed after 2 years</p>
                          </div>
                          <Switch />
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
                        <CardDescription>Configure advanced campaign options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Custom Tracking Domain', description: 'Use your own domain for tracking links', enabled: false },
                          { title: 'IP Warming', description: 'Gradually increase sending volume', enabled: true },
                          { title: 'List-Unsubscribe Header', description: 'Add one-click unsubscribe', enabled: true },
                          { title: 'Debug Mode', description: 'Enable detailed logging', enabled: false },
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
                        <CardDescription>Manage your campaign data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export All Data</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Archive className="w-5 h-5" />
                            <span>Archive Old Campaigns</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset Statistics</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600">
                            <TrashIcon className="w-5 h-5" />
                            <span>Purge Test Emails</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Campaigns</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete all campaign data</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete</Button>
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

      {/* Campaign Detail Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCampaign && getCampaignIcon(selectedCampaign.type)}
              {selectedCampaign?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {selectedCampaign && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatNumber(selectedCampaign.stats.sent)}</p>
                    <p className="text-sm text-gray-500">Sent</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedCampaign.stats.openRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Open Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedCampaign.stats.clickRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Click Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">${formatNumber(selectedCampaign.stats.revenue)}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Campaign Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subject</span>
                        <span>{selectedCampaign.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">From</span>
                        <span>{selectedCampaign.fromName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Audience</span>
                        <span>{selectedCampaign.audienceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type</span>
                        <Badge className={getCampaignTypeColor(selectedCampaign.type)}>{selectedCampaign.type}</Badge>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">Engagement Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unique Opens</span>
                        <span>{formatNumber(selectedCampaign.stats.uniqueOpens)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unique Clicks</span>
                        <span>{formatNumber(selectedCampaign.stats.uniqueClicks)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unsubscribes</span>
                        <span className="text-red-600">{selectedCampaign.stats.unsubscribes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Conversions</span>
                        <span className="text-green-600">{selectedCampaign.stats.conversions}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* New Campaign Dialog */}
      <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>Choose a campaign type to get started</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group">
              <Mail className="w-8 h-8 text-gray-400 group-hover:text-rose-600" />
              <span className="font-medium">Email Campaign</span>
              <span className="text-xs text-gray-500">Send a one-time email</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group">
              <Zap className="w-8 h-8 text-gray-400 group-hover:text-rose-600" />
              <span className="font-medium">Automation</span>
              <span className="text-xs text-gray-500">Create automated flows</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group">
              <Split className="w-8 h-8 text-gray-400 group-hover:text-rose-600" />
              <span className="font-medium">A/B Test</span>
              <span className="text-xs text-gray-500">Test and optimize</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group">
              <MessageSquare className="w-8 h-8 text-gray-400 group-hover:text-rose-600" />
              <span className="font-medium">SMS Campaign</span>
              <span className="text-xs text-gray-500">Send text messages</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI-Powered Campaign Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <AIInsightsPanel
          insights={mockCampaignAIInsights}
          onAskQuestion={(q) => console.log('Campaign Question:', q)}
        />
        <PredictiveAnalytics predictions={mockCampaignPredictions} />
      </div>

      {/* Activity Feed */}
      <div className="mt-6">
        <ActivityFeed
          activities={mockCampaignActivities}
          maxItems={5}
          showFilters={true}
        />
      </div>

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar actions={mockCampaignQuickActions} />
    </div>
  )
}
