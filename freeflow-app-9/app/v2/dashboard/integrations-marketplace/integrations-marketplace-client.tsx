'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useMarketplaceIntegrations, MarketplaceIntegration, MarketplaceStats } from '@/lib/hooks/use-marketplace-integrations'
import { Search, Star, Download, ExternalLink, Shield, Zap, Users, TrendingUp, CheckCircle, Settings, Code, CreditCard, Package, Grid3X3, List, ChevronRight, Heart, Flag, MessageSquare, Plus, Sparkles, Verified, Lock, RefreshCw, Bell, Webhook, Key, AlertOctagon, Sliders, Mail, Copy } from 'lucide-react'

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

// Stripe Marketplace Level Types
interface AppListing {
  id: string
  name: string
  slug: string
  icon: string
  shortDescription: string
  fullDescription: string
  developer: Developer
  category: AppCategory
  subcategory: string
  pricing: PricingPlan[]
  currentPlan?: string
  rating: number
  reviewCount: number
  installCount: number
  featured: boolean
  verified: boolean
  isNew: boolean
  status: 'available' | 'installed' | 'pending' | 'error'
  version: string
  lastUpdated: string
  screenshots: string[]
  permissions: Permission[]
  tags: string[]
  supportUrl: string
  docsUrl: string
  privacyUrl: string
  changelog: ChangelogEntry[]
}

interface Developer {
  id: string
  name: string
  logo: string
  verified: boolean
  website: string
  supportEmail: string
  appsCount: number
}

interface PricingPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year' | 'one-time' | 'usage'
  features: string[]
  popular?: boolean
  limits?: Record<string, number | string>
}

interface Permission {
  scope: string
  description: string
  required: boolean
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

interface Review {
  id: string
  appId: string
  user: { name: string; avatar: string; company?: string }
  rating: number
  title: string
  content: string
  helpful: number
  date: string
  response?: { content: string; date: string }
}

interface Collection {
  id: string
  name: string
  description: string
  icon: string
  apps: string[]
  color: string
}

type AppCategory = 'payments' | 'analytics' | 'marketing' | 'crm' | 'productivity' | 'communication' | 'security' | 'developer-tools' | 'finance' | 'hr'

interface IntegrationsMarketplaceClientProps {
  initialIntegrations: MarketplaceIntegration[]
  initialStats: MarketplaceStats
}

// Mock Data - Stripe Marketplace Level
const mockDevelopers: Developer[] = [
  { id: 'dev-1', name: 'Stripe', logo: 'S', verified: true, website: 'stripe.com', supportEmail: 'support@stripe.com', appsCount: 12 },
  { id: 'dev-2', name: 'Segment', logo: 'Se', verified: true, website: 'segment.com', supportEmail: 'support@segment.com', appsCount: 8 },
  { id: 'dev-3', name: 'HubSpot', logo: 'H', verified: true, website: 'hubspot.com', supportEmail: 'support@hubspot.com', appsCount: 15 },
  { id: 'dev-4', name: 'Intercom', logo: 'I', verified: true, website: 'intercom.com', supportEmail: 'support@intercom.com', appsCount: 6 },
  { id: 'dev-5', name: 'Zapier', logo: 'Z', verified: true, website: 'zapier.com', supportEmail: 'support@zapier.com', appsCount: 20 },
]

const mockApps: AppListing[] = [
  {
    id: 'app-1',
    name: 'Stripe Payments',
    slug: 'stripe-payments',
    icon: 'S',
    shortDescription: 'Accept payments online with the world\'s most powerful payment platform',
    fullDescription: 'Stripe Payments enables you to accept credit cards, digital wallets, and local payment methods from customers worldwide. Built-in fraud prevention, automatic currency conversion, and comprehensive reporting.',
    developer: mockDevelopers[0],
    category: 'payments',
    subcategory: 'Payment Processing',
    pricing: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['2.9% + 30¢ per transaction', 'Basic dashboard', 'Email support'] },
      { id: 'pro', name: 'Pro', price: 25, interval: 'month', features: ['2.5% + 25¢ per transaction', 'Advanced analytics', 'Priority support', 'Custom branding'], popular: true },
      { id: 'enterprise', name: 'Enterprise', price: 0, interval: 'usage', features: ['Custom pricing', 'Dedicated support', 'SLA guarantee', 'Custom integrations'] }
    ],
    currentPlan: 'pro',
    rating: 4.9,
    reviewCount: 12847,
    installCount: 2450000,
    featured: true,
    verified: true,
    isNew: false,
    status: 'installed',
    version: '4.2.1',
    lastUpdated: '2024-01-15',
    screenshots: [],
    permissions: [
      { scope: 'payments:read', description: 'View payment information', required: true },
      { scope: 'payments:write', description: 'Create and manage payments', required: true },
      { scope: 'customers:read', description: 'Access customer data', required: false }
    ],
    tags: ['payments', 'billing', 'subscriptions', 'invoicing'],
    supportUrl: 'https://stripe.com/support',
    docsUrl: 'https://stripe.com/docs',
    privacyUrl: 'https://stripe.com/privacy',
    changelog: [
      { version: '4.2.1', date: '2024-01-15', changes: ['Fixed subscription renewal bug', 'Improved webhook reliability'] },
      { version: '4.2.0', date: '2024-01-10', changes: ['Added Apple Pay support', 'New fraud detection rules'] }
    ]
  },
  {
    id: 'app-2',
    name: 'Segment Analytics',
    slug: 'segment-analytics',
    icon: 'Se',
    shortDescription: 'Customer data platform for collecting, cleaning, and controlling your data',
    fullDescription: 'Segment is the #1 customer data platform. Collect, clean, and control your customer data with a single API. Connect 300+ tools instantly.',
    developer: mockDevelopers[1],
    category: 'analytics',
    subcategory: 'Customer Data',
    pricing: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['1,000 MTU', '2 sources', 'Core integrations'] },
      { id: 'team', name: 'Team', price: 120, interval: 'month', features: ['10,000 MTU', 'Unlimited sources', 'Functions', 'Protocols'], popular: true },
      { id: 'business', name: 'Business', price: 0, interval: 'usage', features: ['Custom MTU', 'Enterprise features', 'Dedicated support'] }
    ],
    rating: 4.7,
    reviewCount: 3241,
    installCount: 890000,
    featured: true,
    verified: true,
    isNew: false,
    status: 'available',
    version: '3.1.0',
    lastUpdated: '2024-01-12',
    screenshots: [],
    permissions: [
      { scope: 'analytics:read', description: 'View analytics data', required: true },
      { scope: 'users:track', description: 'Track user events', required: true }
    ],
    tags: ['analytics', 'data', 'tracking', 'CDP'],
    supportUrl: 'https://segment.com/support',
    docsUrl: 'https://segment.com/docs',
    privacyUrl: 'https://segment.com/privacy',
    changelog: []
  },
  {
    id: 'app-3',
    name: 'HubSpot CRM',
    slug: 'hubspot-crm',
    icon: 'H',
    shortDescription: 'Free CRM software with tools for sales, marketing, and customer service',
    fullDescription: 'HubSpot CRM is a complete platform for marketing, sales, and service. Grow your business with free tools that scale with you.',
    developer: mockDevelopers[2],
    category: 'crm',
    subcategory: 'Sales CRM',
    pricing: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['Contact management', 'Deal pipeline', 'Email tracking'] },
      { id: 'starter', name: 'Starter', price: 45, interval: 'month', features: ['1,000 contacts', 'Email automation', 'Ad management'], popular: true },
      { id: 'pro', name: 'Professional', price: 450, interval: 'month', features: ['2,000 contacts', 'Sales automation', 'Custom reports'] }
    ],
    rating: 4.6,
    reviewCount: 8934,
    installCount: 1560000,
    featured: true,
    verified: true,
    isNew: false,
    status: 'installed',
    version: '8.0.2',
    lastUpdated: '2024-01-18',
    screenshots: [],
    permissions: [
      { scope: 'contacts:read', description: 'View contact information', required: true },
      { scope: 'contacts:write', description: 'Create and update contacts', required: true },
      { scope: 'deals:manage', description: 'Manage sales deals', required: false }
    ],
    tags: ['crm', 'sales', 'marketing', 'automation'],
    supportUrl: 'https://hubspot.com/support',
    docsUrl: 'https://developers.hubspot.com',
    privacyUrl: 'https://hubspot.com/privacy',
    changelog: []
  },
  {
    id: 'app-4',
    name: 'Intercom',
    slug: 'intercom',
    icon: 'I',
    shortDescription: 'Customer messaging platform for sales, marketing, and support',
    fullDescription: 'Intercom is the complete customer communications platform. Reach customers with targeted messages, answer questions in real-time, and convert leads faster.',
    developer: mockDevelopers[3],
    category: 'communication',
    subcategory: 'Customer Messaging',
    pricing: [
      { id: 'starter', name: 'Starter', price: 74, interval: 'month', features: ['Live chat', 'Shared inbox', 'Basic bots'] },
      { id: 'pro', name: 'Pro', price: 395, interval: 'month', features: ['All Starter features', 'Advanced bots', 'Product tours'], popular: true }
    ],
    rating: 4.5,
    reviewCount: 5621,
    installCount: 750000,
    featured: false,
    verified: true,
    isNew: false,
    status: 'available',
    version: '2.8.0',
    lastUpdated: '2024-01-08',
    screenshots: [],
    permissions: [
      { scope: 'messages:send', description: 'Send messages to users', required: true },
      { scope: 'users:read', description: 'Access user information', required: true }
    ],
    tags: ['chat', 'support', 'messaging', 'bots'],
    supportUrl: 'https://intercom.com/help',
    docsUrl: 'https://developers.intercom.com',
    privacyUrl: 'https://intercom.com/privacy',
    changelog: []
  },
  {
    id: 'app-5',
    name: 'Zapier Automation',
    slug: 'zapier',
    icon: 'Z',
    shortDescription: 'Connect your apps and automate workflows with 5,000+ integrations',
    fullDescription: 'Zapier lets you connect 5,000+ apps to automate repetitive tasks without coding or relying on developers.',
    developer: mockDevelopers[4],
    category: 'productivity',
    subcategory: 'Automation',
    pricing: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['100 tasks/month', '5 Zaps', 'Single-step Zaps'] },
      { id: 'starter', name: 'Starter', price: 19.99, interval: 'month', features: ['750 tasks/month', '20 Zaps', 'Multi-step Zaps'], popular: true },
      { id: 'pro', name: 'Professional', price: 49, interval: 'month', features: ['2,000 tasks/month', 'Unlimited Zaps', 'Custom logic'] }
    ],
    rating: 4.8,
    reviewCount: 15234,
    installCount: 3200000,
    featured: true,
    verified: true,
    isNew: false,
    status: 'installed',
    version: '5.0.0',
    lastUpdated: '2024-01-20',
    screenshots: [],
    permissions: [
      { scope: 'automation:create', description: 'Create automation workflows', required: true },
      { scope: 'data:sync', description: 'Sync data between apps', required: true }
    ],
    tags: ['automation', 'workflow', 'integration', 'no-code'],
    supportUrl: 'https://zapier.com/help',
    docsUrl: 'https://zapier.com/developer',
    privacyUrl: 'https://zapier.com/privacy',
    changelog: []
  },
  {
    id: 'app-6',
    name: 'Mixpanel',
    slug: 'mixpanel',
    icon: 'M',
    shortDescription: 'Product analytics to understand user behavior and drive growth',
    fullDescription: 'Mixpanel helps you analyze how users engage with your product. Track events, build funnels, and understand retention to make better product decisions.',
    developer: { id: 'dev-6', name: 'Mixpanel', logo: 'M', verified: true, website: 'mixpanel.com', supportEmail: 'support@mixpanel.com', appsCount: 4 },
    category: 'analytics',
    subcategory: 'Product Analytics',
    pricing: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['100K events/month', 'Core reports', '90-day history'] },
      { id: 'growth', name: 'Growth', price: 25, interval: 'month', features: ['Unlimited events', 'Advanced analytics', 'Data modeling'], popular: true }
    ],
    rating: 4.4,
    reviewCount: 2156,
    installCount: 420000,
    featured: false,
    verified: true,
    isNew: false,
    status: 'available',
    version: '3.5.2',
    lastUpdated: '2024-01-05',
    screenshots: [],
    permissions: [
      { scope: 'events:track', description: 'Track user events', required: true },
      { scope: 'reports:read', description: 'View analytics reports', required: true }
    ],
    tags: ['analytics', 'product', 'events', 'funnels'],
    supportUrl: 'https://mixpanel.com/support',
    docsUrl: 'https://developer.mixpanel.com',
    privacyUrl: 'https://mixpanel.com/privacy',
    changelog: []
  },
  {
    id: 'app-7',
    name: 'Slack',
    slug: 'slack',
    icon: 'Sl',
    shortDescription: 'Team collaboration and messaging platform',
    fullDescription: 'Slack brings all your team communication into one place. Channels, direct messages, file sharing, and integrations with your favorite tools.',
    developer: { id: 'dev-7', name: 'Slack', logo: 'Sl', verified: true, website: 'slack.com', supportEmail: 'support@slack.com', appsCount: 25 },
    category: 'communication',
    subcategory: 'Team Messaging',
    pricing: [
      { id: 'free', name: 'Free', price: 0, interval: 'month', features: ['90-day message history', '10 integrations', '1:1 calls'] },
      { id: 'pro', name: 'Pro', price: 8.75, interval: 'month', features: ['Unlimited history', 'Unlimited integrations', 'Group calls'], popular: true }
    ],
    rating: 4.7,
    reviewCount: 28456,
    installCount: 12000000,
    featured: true,
    verified: true,
    isNew: false,
    status: 'installed',
    version: '4.35.126',
    lastUpdated: '2024-01-22',
    screenshots: [],
    permissions: [
      { scope: 'channels:read', description: 'View channel information', required: true },
      { scope: 'messages:write', description: 'Send messages', required: true }
    ],
    tags: ['chat', 'collaboration', 'team', 'messaging'],
    supportUrl: 'https://slack.com/help',
    docsUrl: 'https://api.slack.com',
    privacyUrl: 'https://slack.com/privacy-policy',
    changelog: []
  },
  {
    id: 'app-8',
    name: 'Plaid',
    slug: 'plaid',
    icon: 'P',
    shortDescription: 'Connect your app to bank accounts securely',
    fullDescription: 'Plaid enables applications to connect with users\' bank accounts. Verify accounts, check balances, and initiate payments with a secure API.',
    developer: { id: 'dev-8', name: 'Plaid', logo: 'P', verified: true, website: 'plaid.com', supportEmail: 'support@plaid.com', appsCount: 7 },
    category: 'finance',
    subcategory: 'Banking',
    pricing: [
      { id: 'pay-per-use', name: 'Pay per use', price: 0, interval: 'usage', features: ['$0.30 per connection', 'Auth + Balance', 'Dashboard'], popular: true },
      { id: 'scale', name: 'Scale', price: 0, interval: 'usage', features: ['Volume pricing', 'All products', 'Priority support'] }
    ],
    rating: 4.6,
    reviewCount: 1823,
    installCount: 340000,
    featured: false,
    verified: true,
    isNew: true,
    status: 'available',
    version: '2.0.0',
    lastUpdated: '2024-01-19',
    screenshots: [],
    permissions: [
      { scope: 'accounts:read', description: 'View linked accounts', required: true },
      { scope: 'transactions:read', description: 'View transaction history', required: false }
    ],
    tags: ['banking', 'fintech', 'accounts', 'payments'],
    supportUrl: 'https://plaid.com/contact',
    docsUrl: 'https://plaid.com/docs',
    privacyUrl: 'https://plaid.com/legal',
    changelog: []
  }
]

const mockReviews: Review[] = [
  { id: 'r-1', appId: 'app-1', user: { name: 'Sarah Chen', avatar: 'SC', company: 'TechStartup Inc' }, rating: 5, title: 'Best payment solution we\'ve used', content: 'Stripe has transformed how we handle payments. The API is clean, documentation is excellent, and support is top-notch.', helpful: 234, date: '2024-01-15' },
  { id: 'r-2', appId: 'app-1', user: { name: 'Marcus Johnson', avatar: 'MJ', company: 'E-commerce Plus' }, rating: 5, title: 'Seamless integration', content: 'We integrated Stripe in just 2 days. The webhooks work flawlessly and the dashboard gives us all the insights we need.', helpful: 156, date: '2024-01-10' },
  { id: 'r-3', appId: 'app-1', user: { name: 'Emma Wilson', avatar: 'EW' }, rating: 4, title: 'Great but pricey for small businesses', content: 'The product is excellent but the fees add up for smaller transaction volumes. Would love tiered pricing.', helpful: 89, date: '2024-01-08' },
  { id: 'r-4', appId: 'app-5', user: { name: 'David Park', avatar: 'DP', company: 'AutomateNow' }, rating: 5, title: 'Saved us 20+ hours per week', content: 'Zapier automation has completely changed how our team works. What used to take hours now happens automatically.', helpful: 312, date: '2024-01-18' }
]

const mockCollections: Collection[] = [
  { id: 'col-1', name: 'Staff Picks', description: 'Hand-picked apps by our team', icon: 'sparkles', apps: ['app-1', 'app-5', 'app-7'], color: 'from-purple-500 to-pink-500' },
  { id: 'col-2', name: 'Essential Stack', description: 'Must-have apps for every business', icon: 'stack', apps: ['app-1', 'app-3', 'app-7', 'app-5'], color: 'from-blue-500 to-cyan-500' },
  { id: 'col-3', name: 'Analytics Suite', description: 'Understand your data better', icon: 'chart', apps: ['app-2', 'app-6'], color: 'from-green-500 to-emerald-500' },
  { id: 'col-4', name: 'New & Notable', description: 'Recently launched apps worth checking out', icon: 'rocket', apps: ['app-8'], color: 'from-orange-500 to-red-500' }
]

const categories: { id: AppCategory; name: string; icon: React.ReactNode; count: number }[] = [
  { id: 'payments', name: 'Payments', icon: <CreditCard className="w-4 h-4" />, count: 24 },
  { id: 'analytics', name: 'Analytics', icon: <TrendingUp className="w-4 h-4" />, count: 38 },
  { id: 'marketing', name: 'Marketing', icon: <Zap className="w-4 h-4" />, count: 52 },
  { id: 'crm', name: 'CRM', icon: <Users className="w-4 h-4" />, count: 31 },
  { id: 'productivity', name: 'Productivity', icon: <Package className="w-4 h-4" />, count: 67 },
  { id: 'communication', name: 'Communication', icon: <MessageSquare className="w-4 h-4" />, count: 45 },
  { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" />, count: 19 },
  { id: 'developer-tools', name: 'Developer Tools', icon: <Code className="w-4 h-4" />, count: 83 },
  { id: 'finance', name: 'Finance', icon: <CreditCard className="w-4 h-4" />, count: 28 },
  { id: 'hr', name: 'HR & Recruiting', icon: <Users className="w-4 h-4" />, count: 22 }
]

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Stripe Connect Level
// ============================================================================

const mockIntegrationsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Top Integration', description: 'Slack integration has 98% adoption rate and drives 45% of workflow automation.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Usage' },
  { id: '2', type: 'warning' as const, title: 'API Rate Alert', description: 'Salesforce integration approaching API limits. Consider upgrade.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '3', type: 'info' as const, title: 'New Partners', description: '15 new integrations added this month. Review for potential value.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Discovery' },
]

const mockIntegrationsCollaborators = [
  { id: '1', name: 'Integration Lead', avatar: '/avatars/integration.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'DevOps Engineer', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'DevOps' },
  { id: '3', name: 'Solutions Architect', avatar: '/avatars/architect.jpg', status: 'away' as const, role: 'Architect' },
]

const mockIntegrationsPredictions = [
  { id: '1', title: 'Adoption Forecast', prediction: 'New Notion integration expected to reach 80% adoption in 2 weeks', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cost Optimization', prediction: 'Consolidating 3 integrations could save $2K/month', confidence: 92, trend: 'up' as const, impact: 'medium' as const },
]

const mockIntegrationsActivities = [
  { id: '1', user: 'Integration Lead', action: 'Installed', target: 'Notion integration for all teams', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'System', action: 'Synced', target: '50K records with Salesforce', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'DevOps', action: 'Flagged', target: 'Deprecated API in Stripe integration', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// Quick actions are defined inside the component to access state setters

export default function IntegrationsMarketplaceClient({ initialIntegrations, initialStats }: IntegrationsMarketplaceClientProps) {
  const { integrations, stats, createIntegration, updateIntegration, deleteIntegration, connectIntegration, disconnectIntegration } = useMarketplaceIntegrations(initialIntegrations, initialStats)
  const [apps, setApps] = useState<AppListing[]>(mockApps)
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedApp, setSelectedApp] = useState<AppListing | null>(null)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showBrowseAppsDialog, setShowBrowseAppsDialog] = useState(false)
  const [showInstallAppDialog, setShowInstallAppDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [browseSearchQuery, setBrowseSearchQuery] = useState('')
  const [selectedAppToInstall, setSelectedAppToInstall] = useState<AppListing | null>(null)
  const [installStep, setInstallStep] = useState<'select' | 'plan' | 'confirm'>('select')
  const [selectedInstallPlan, setSelectedInstallPlan] = useState<PricingPlan | null>(null)
  const [logsFilter, setLogsFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all')

  // Additional dialog states for buttons
  const [showDeveloperPortalDialog, setShowDeveloperPortalDialog] = useState(false)
  const [showSubmitAppDialog, setShowSubmitAppDialog] = useState(false)
  const [showConfigureAppDialog, setShowConfigureAppDialog] = useState(false)
  const [showUninstallDialog, setShowUninstallDialog] = useState(false)
  const [showReconnectDialog, setShowReconnectDialog] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [showCreateApiKeyDialog, setShowCreateApiKeyDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showUnblockAppDialog, setShowUnblockAppDialog] = useState(false)
  const [showBlockAppDialog, setShowBlockAppDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDisconnectAllDialog, setShowDisconnectAllDialog] = useState(false)
  const [showRegenerateKeyDialog, setShowRegenerateKeyDialog] = useState(false)
  const [selectedAppForAction, setSelectedAppForAction] = useState<AppListing | null>(null)
  const [keyTypeToRegenerate, setKeyTypeToRegenerate] = useState<'production' | 'test'>('production')
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([])
  const [appToBlock, setAppToBlock] = useState('')
  const [actionedInsights, setActionedInsights] = useState<Set<string>>(new Set())

  // Mock logs data
  const integrationLogs = [
    { id: '1', timestamp: new Date().toISOString(), type: 'success' as const, app: 'Stripe', event: 'Payment webhook received', details: 'Order #12345 payment confirmed' },
    { id: '2', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'success' as const, app: 'Slack', event: 'Message sent', details: 'Notification delivered to #general' },
    { id: '3', timestamp: new Date(Date.now() - 600000).toISOString(), type: 'error' as const, app: 'HubSpot', event: 'Sync failed', details: 'API rate limit exceeded' },
    { id: '4', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'warning' as const, app: 'Zapier', event: 'Zap paused', details: 'Task limit approaching' },
    { id: '5', timestamp: new Date(Date.now() - 1200000).toISOString(), type: 'success' as const, app: 'Segment', event: 'Event tracked', details: 'page_view event recorded' },
    { id: '6', timestamp: new Date(Date.now() - 1500000).toISOString(), type: 'info' as const, app: 'Intercom', event: 'User identified', details: 'New user session started' },
    { id: '7', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'error' as const, app: 'Plaid', event: 'Connection lost', details: 'Bank connection expired' },
    { id: '8', timestamp: new Date(Date.now() - 2100000).toISOString(), type: 'success' as const, app: 'Stripe', event: 'Subscription created', details: 'Pro plan subscription started' },
  ]

  const filteredLogs = logsFilter === 'all'
    ? integrationLogs
    : integrationLogs.filter(log => log.type === logsFilter)

  // Quick actions with real dialog functionality
  const mockIntegrationsQuickActions = [
    { id: '1', label: 'Browse Apps', icon: 'search', action: () => setShowBrowseAppsDialog(true), variant: 'default' as const },
    { id: '2', label: 'Install App', icon: 'plus', action: () => { setInstallStep('select'); setShowInstallAppDialog(true) }, variant: 'default' as const },
    { id: '3', label: 'View Logs', icon: 'file', action: () => setShowLogsDialog(true), variant: 'outline' as const },
  ]

  const filteredApps = useMemo(() => {
    let appsList = [...apps]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      appsList = appsList.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.shortDescription.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      appsList = appsList.filter(app => app.category === selectedCategory)
    }

    switch (sortBy) {
      case 'popular':
        appsList.sort((a, b) => b.installCount - a.installCount)
        break
      case 'rating':
        appsList.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        appsList.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        break
    }

    return appsList
  }, [apps, searchQuery, selectedCategory, sortBy])

  const installedApps = apps.filter(app => app.status === 'installed')
  const featuredApps = apps.filter(app => app.featured)

  const formatInstalls = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return count.toString()
  }

  // Handlers
  const handleInstall = (app: AppListing, plan: PricingPlan) => {
    // Update app status to installed
    setApps(prev => prev.map(a =>
      a.id === app.id
        ? { ...a, status: 'installed' as const, currentPlan: plan.name, installCount: a.installCount + 1 }
        : a
    ))
    toast.success(`${app.name} installed successfully with ${plan.name} plan`)
    setShowInstallDialog(false)
    setSelectedApp(null)
  }

  // Uninstall app handler
  const handleUninstallApp = (app: AppListing) => {
    setApps(prev => prev.map(a =>
      a.id === app.id
        ? { ...a, status: 'available' as const, currentPlan: undefined }
        : a
    ))
    toast.success(`${app.name} uninstalled successfully`)
    setShowUninstallDialog(false)
    setSelectedAppForAction(null)
  }

  // Reconnect app handler
  const handleReconnectApp = (app: AppListing) => {
    setApps(prev => prev.map(a =>
      a.id === app.id
        ? { ...a, status: 'installed' as const }
        : a
    ))
    toast.success(`${app.name} reconnected successfully`)
    setShowReconnectDialog(false)
    setSelectedAppForAction(null)
  }

  // Disconnect app handler
  const handleDisconnectApp = (app: AppListing) => {
    setApps(prev => prev.map(a =>
      a.id === app.id
        ? { ...a, status: 'pending' as const }
        : a
    ))
    toast.success(`${app.name} disconnected successfully`)
    setShowDisconnectDialog(false)
    setSelectedAppForAction(null)
  }

  // Disconnect all apps handler
  const handleDisconnectAllApps = () => {
    setApps(prev => prev.map(a =>
      a.status === 'installed'
        ? { ...a, status: 'available' as const, currentPlan: undefined }
        : a
    ))
    toast.success('All apps disconnected successfully')
    setShowDisconnectAllDialog(false)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const AppCard = ({ app, compact = false }: { app: AppListing; compact?: boolean }) => (
    <Card
      className={`group cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-teal-300 ${compact ? 'p-3' : ''}`}
      onClick={() => setSelectedApp(app)}
    >
      <CardContent className={compact ? 'p-0' : 'p-4'}>
        <div className="flex items-start gap-3">
          <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md`}>
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>{app.name}</h3>
              {app.verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
              {app.isNew && <Badge className="bg-green-100 text-green-700 text-xs">New</Badge>}
            </div>
            <p className={`text-gray-500 ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2'} mt-0.5`}>
              {app.shortDescription}
            </p>
            {!compact && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {renderStars(app.rating)}
                  <span className="ml-1">{app.rating}</span>
                  <span>({app.reviewCount.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{formatInstalls(app.installCount)}</span>
                </div>
              </div>
            )}
          </div>
          {app.status === 'installed' && (
            <Badge className="bg-green-100 text-green-700 flex-shrink-0">Installed</Badge>
          )}
        </div>
        {!compact && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{app.category}</Badge>
              {app.pricing[0]?.price === 0 && (
                <Badge className="bg-teal-100 text-teal-700 text-xs">Free tier</Badge>
              )}
            </div>
            <Button
              size="sm"
              variant={app.status === 'installed' ? 'outline' : 'default'}
              className={app.status !== 'installed' ? 'bg-teal-600 hover:bg-teal-700' : ''}
              onClick={(e) => {
                e.stopPropagation()
                if (app.status === 'installed') {
                  setSelectedAppForAction(app)
                  setShowConfigureAppDialog(true)
                } else {
                  setSelectedApp(app)
                  setShowInstallDialog(true)
                }
              }}
            >
              {app.status === 'installed' ? 'Manage' : 'Install'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Integrations Marketplace</h1>
              <p className="text-teal-100 mt-1">Discover and connect powerful tools to supercharge your workflow</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0" onClick={() => setShowDeveloperPortalDialog(true)}>
                <Code className="w-4 h-4 mr-2" />
                Developer Portal
              </Button>
              <Button className="bg-white text-teal-600 hover:bg-teal-50" onClick={() => setShowSubmitAppDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit App
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search 500+ integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-0 shadow-lg rounded-xl text-gray-900"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{apps.length * 62}</div>
              <div className="text-teal-100 text-sm">Total Apps</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{installedApps.length}</div>
              <div className="text-teal-100 text-sm">Installed</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{categories.length}</div>
              <div className="text-teal-100 text-sm">Categories</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">4.6</div>
              <div className="text-teal-100 text-sm">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="installed">
                Installed
                <Badge className="ml-2 bg-teal-100 text-teal-700">{installedApps.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-teal-100 text-teal-700' : 'bg-white dark:bg-gray-800'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-teal-100 text-teal-700' : 'bg-white dark:bg-gray-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-8">
            {/* Featured Apps */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Apps</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => { setSelectedCategory('all'); setActiveTab('discover') }}>
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredApps.slice(0, 3).map(app => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            </section>

            {/* Category Pills */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-teal-600' : ''}
                >
                  All Apps
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'bg-teal-600' : ''}
                  >
                    {cat.icon}
                    <span className="ml-1">{cat.name}</span>
                    <span className="ml-1 text-xs opacity-60">({cat.count})</span>
                  </Button>
                ))}
              </div>
            </section>

            {/* All Apps */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Apps' : categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-gray-400 font-normal ml-2">({filteredApps.length})</span>
                </h2>
              </div>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredApps.map(app => (
                  <AppCard key={app.id} app={app} compact={viewMode === 'list'} />
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{installedApps.length}</div>
                      <div className="text-sm text-gray-500">Active Integrations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12.4K</div>
                      <div className="text-sm text-gray-500">API Calls Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">$127</div>
                      <div className="text-sm text-gray-500">Monthly Spend</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {installedApps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No integrations installed</h3>
                  <p className="text-gray-500 mb-4">Browse our marketplace to find apps that work for your business</p>
                  <Button className="bg-teal-600" onClick={() => setActiveTab('discover')}>
                    Browse Marketplace
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {installedApps.map(app => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {app.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{app.name}</h3>
                            {app.verified && <Verified className="w-4 h-4 text-blue-500" />}
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{app.shortDescription}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>v{app.version}</span>
                            <span>•</span>
                            <span>Plan: {app.currentPlan || 'Free'}</span>
                            <span>•</span>
                            <span>Last synced: 2 min ago</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedAppForAction(app); setShowConfigureAppDialog(true) }}>
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => { setSelectedAppForAction(app); setShowUninstallDialog(true) }}>
                            Uninstall
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockCollections.map(collection => (
                <Card key={collection.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className={`h-24 bg-gradient-to-r ${collection.color} p-4 flex items-end`}>
                    <div>
                      <h3 className="text-xl font-bold text-white">{collection.name}</h3>
                      <p className="text-white/80 text-sm">{collection.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-500">{collection.apps.length} apps</span>
                    </div>
                    <div className="flex -space-x-2">
                      {collection.apps.slice(0, 4).map((appId, idx) => {
                        const app = apps.find(a => a.id === appId)
                        return app ? (
                          <div key={appId} className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                            {app.icon}
                          </div>
                        ) : null
                      })}
                      {collection.apps.length > 4 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-white">
                          +{collection.apps.length - 4}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:shadow-md hover:border-teal-300 transition-all"
                  onClick={() => { setSelectedCategory(cat.id); setActiveTab('discover') }}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mx-auto mb-3 text-teal-600">
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.count} apps</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Zapier Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: <Sliders className="w-4 h-4" /> },
                        { id: 'apps', label: 'Apps & Connections', icon: <Package className="w-4 h-4" /> },
                        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                        { id: 'api', label: 'API & Webhooks', icon: <Webhook className="w-4 h-4" /> },
                        { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
                        { id: 'advanced', label: 'Advanced', icon: <Code className="w-4 h-4" /> }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSettingsTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === tab.id
                              ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {tab.icon}
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-teal-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure your marketplace preferences and display options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View Mode</Label>
                            <Select defaultValue="grid">
                              <SelectTrigger>
                                <SelectValue placeholder="Select view" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="compact">Compact View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Items Per Page</Label>
                            <Select defaultValue="24">
                              <SelectTrigger>
                                <SelectValue placeholder="Select count" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12 items</SelectItem>
                                <SelectItem value="24">24 items</SelectItem>
                                <SelectItem value="48">48 items</SelectItem>
                                <SelectItem value="96">96 items</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show Featured Apps</div>
                              <div className="text-sm text-gray-500">Display featured apps at the top of discover page</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show App Ratings</div>
                              <div className="text-sm text-gray-500">Display ratings and reviews on app cards</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show Install Count</div>
                              <div className="text-sm text-gray-500">Display how many users have installed each app</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Auto-Update Apps</div>
                              <div className="text-sm text-gray-500">Automatically update apps when new versions are available</div>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Discovery Preferences</CardTitle>
                        <CardDescription>Customize how apps are recommended to you</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Sort Order</Label>
                            <Select defaultValue="popular">
                              <SelectTrigger>
                                <SelectValue placeholder="Select sort" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="name">Alphabetical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Preferred Categories</Label>
                            <Select defaultValue="all">
                              <SelectTrigger>
                                <SelectValue placeholder="Select categories" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="productivity">Productivity</SelectItem>
                                <SelectItem value="analytics">Analytics</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Personalized Recommendations</div>
                              <div className="text-sm text-gray-500">Use your usage data to suggest relevant apps</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Show Beta Apps</div>
                              <div className="text-sm text-gray-500">Include apps that are in beta testing</div>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Language & Region</CardTitle>
                        <CardDescription>Set your locale preferences for the marketplace</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Display Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English (US)</SelectItem>
                                <SelectItem value="en-gb">English (UK)</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="jpy">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Apps & Connections Settings */}
                {settingsTab === 'apps' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-teal-600" />
                          Connected Apps
                        </CardTitle>
                        <CardDescription>Manage your installed integrations and their permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {installedApps.map(app => (
                          <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-teal-300 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                {app.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{app.name}</h4>
                                  {app.verified && <Verified className="w-4 h-4 text-blue-500" />}
                                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Plan: {app.currentPlan || 'Free'} • v{app.version} • Last synced: 2 min ago
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => { setSelectedAppForAction(app); setShowReconnectDialog(true) }}>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Reconnect
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => { setSelectedAppForAction(app); setShowDisconnectDialog(true) }}>
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        ))}
                        {installedApps.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No apps connected yet</p>
                            <Button className="mt-4 bg-teal-600" onClick={() => setActiveTab('discover')}>
                              Browse Marketplace
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Connection Settings</CardTitle>
                        <CardDescription>Configure how apps connect and sync with your workspace</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Auto-Reconnect</div>
                            <div className="text-sm text-gray-500">Automatically reconnect when connection is lost</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Background Sync</div>
                            <div className="text-sm text-gray-500">Keep data synced in the background</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Sync Frequency</div>
                            <div className="text-sm text-gray-500">How often to sync data with connected apps</div>
                          </div>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Every minute</SelectItem>
                              <SelectItem value="5">Every 5 minutes</SelectItem>
                              <SelectItem value="15">Every 15 minutes</SelectItem>
                              <SelectItem value="60">Every hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Sharing</CardTitle>
                        <CardDescription>Control what data is shared with connected apps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Share Usage Analytics</div>
                            <div className="text-sm text-gray-500">Help apps improve by sharing anonymous usage data</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Share Contact Data</div>
                            <div className="text-sm text-gray-500">Allow apps to access your contact list</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Share Calendar Access</div>
                            <div className="text-sm text-gray-500">Allow apps to view and manage your calendar</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-teal-600" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>Configure how you receive marketplace notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">New App Releases</div>
                              <div className="text-sm text-gray-500">Get notified when new apps are added to the marketplace</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">App Updates Available</div>
                              <div className="text-sm text-gray-500">Notify when updates are available for installed apps</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Connection Issues</div>
                              <div className="text-sm text-gray-500">Alert when an app loses connection or encounters errors</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Weekly Digest</div>
                              <div className="text-sm text-gray-500">Receive a weekly summary of marketplace activity</div>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <div className="font-medium">Price Changes</div>
                              <div className="text-sm text-gray-500">Notify when pricing changes for installed apps</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Delivery Channels</CardTitle>
                        <CardDescription>Choose how you want to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Email Notifications</div>
                              <div className="text-sm text-gray-500">user@example.com</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium">Push Notifications</div>
                              <div className="text-sm text-gray-500">Browser & mobile push</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <MessageSquare className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <div className="font-medium">Slack Notifications</div>
                              <div className="text-sm text-gray-500">#integrations channel</div>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>Set times when you don't want to be notified</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Enable Quiet Hours</div>
                            <div className="text-sm text-gray-500">Pause notifications during specified times</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* API & Webhooks Settings */}
                {settingsTab === 'api' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-teal-600" />
                          API Keys
                        </CardTitle>
                        <CardDescription>Manage API keys for accessing the marketplace programmatically</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-medium">Production API Key</div>
                              <div className="text-sm text-gray-500">Use this key in your production environment</div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="mk_prod_xxxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('mk_prod_xxxxxxxxxxxxxxxxxxxxxxxxx'); toast.success('Production API key copied to clipboard') }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setKeyTypeToRegenerate('production'); setShowRegenerateKeyDialog(true) }}>Regenerate</Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Created Jan 15, 2024 • Last used 2 hours ago</div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-medium">Test API Key</div>
                              <div className="text-sm text-gray-500">Use this key for development and testing</div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700">Test</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="mk_test_xxxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('mk_test_xxxxxxxxxxxxxxxxxxxxxxxxx'); toast.success('Test API key copied to clipboard') }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setKeyTypeToRegenerate('test'); setShowRegenerateKeyDialog(true) }}>Regenerate</Button>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">Created Jan 15, 2024 • Last used 5 min ago</div>
                        </div>

                        <Button className="w-full bg-teal-600" onClick={() => setShowCreateApiKeyDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New API Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-teal-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Configure webhooks to receive real-time events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">App Install Events</span>
                            </div>
                            <Badge>Enabled</Badge>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">https://api.yourapp.com/webhooks/marketplace</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Events: app.installed, app.uninstalled, app.updated</span>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">Sync Events</span>
                            </div>
                            <Badge>Enabled</Badge>
                          </div>
                          <div className="text-sm text-gray-500 mb-2">https://api.yourapp.com/webhooks/sync</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Events: sync.started, sync.completed, sync.failed</span>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook Endpoint
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Usage</CardTitle>
                        <CardDescription>Monitor your API usage and rate limits</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold text-teal-600">12,847</div>
                            <div className="text-sm text-gray-500">API Calls Today</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">98.7%</div>
                            <div className="text-sm text-gray-500">Success Rate</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">45ms</div>
                            <div className="text-sm text-gray-500">Avg Response</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Rate Limit Usage</span>
                            <span className="text-sm text-gray-500">12,847 / 100,000</span>
                          </div>
                          <Progress value={12.8} className="h-2" />
                          <div className="text-xs text-gray-500">Resets in 8 hours</div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-teal-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Manage security and access control for integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Require Approval for New Apps</div>
                            <div className="text-sm text-gray-500">Admin must approve before apps can be installed</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-500">Require 2FA for sensitive app operations</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">IP Allowlist</div>
                            <div className="text-sm text-gray-500">Restrict API access to specific IP addresses</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Audit Logging</div>
                            <div className="text-sm text-gray-500">Log all app installations and configuration changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Permissions</CardTitle>
                        <CardDescription>Control who can install and manage apps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Who can install apps</Label>
                          <Select defaultValue="admins">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins only</SelectItem>
                              <SelectItem value="managers">Admins & Managers</SelectItem>
                              <SelectItem value="all">All team members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Who can configure apps</Label>
                          <Select defaultValue="managers">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins only</SelectItem>
                              <SelectItem value="managers">Admins & Managers</SelectItem>
                              <SelectItem value="all">All team members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Who can view installed apps</Label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admins">Admins only</SelectItem>
                              <SelectItem value="managers">Admins & Managers</SelectItem>
                              <SelectItem value="all">All team members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Blocked Apps</CardTitle>
                        <CardDescription>Apps that are blocked from being installed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <AlertOctagon className="w-5 h-5 text-red-600" />
                              <div>
                                <div className="font-medium text-red-800 dark:text-red-200">UnsafeApp Pro</div>
                                <div className="text-sm text-red-600">Blocked by admin on Jan 10, 2024</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowUnblockAppDialog(true)}>Unblock</Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowBlockAppDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Block an App
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-teal-600" />
                          Developer Options
                        </CardTitle>
                        <CardDescription>Advanced configuration for developers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Developer Mode</div>
                            <div className="text-sm text-gray-500">Enable advanced debugging and logging features</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Show API Response Times</div>
                            <div className="text-sm text-gray-500">Display response time metrics in the UI</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Console Logging</div>
                            <div className="text-sm text-gray-500">Log integration events to browser console</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Mock Mode</div>
                            <div className="text-sm text-gray-500">Use mock data instead of live API calls</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Tuning</CardTitle>
                        <CardDescription>Optimize integration performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Connection Timeout (seconds)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Retry Attempts</Label>
                            <Input type="number" defaultValue="3" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Batch Size</Label>
                            <Select defaultValue="100">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50 items</SelectItem>
                                <SelectItem value="100">100 items</SelectItem>
                                <SelectItem value="250">250 items</SelectItem>
                                <SelectItem value="500">500 items</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Cache Duration</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 minute</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your marketplace data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Export All Data</div>
                            <div className="text-sm text-gray-500">Download all your marketplace configuration</div>
                          </div>
                          <Button variant="outline" onClick={() => setShowExportDialog(true)}>Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Import Configuration</div>
                            <div className="text-sm text-gray-500">Import settings from another workspace</div>
                          </div>
                          <Button variant="outline" onClick={() => setShowImportDialog(true)}>Import</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">Clear Cache</div>
                            <div className="text-sm text-gray-500">Clear all cached data and force refresh</div>
                          </div>
                          <Button variant="outline" onClick={() => setShowClearCacheDialog(true)}>Clear</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions - proceed with caution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                          <div>
                            <div className="font-medium text-red-600">Reset All Settings</div>
                            <div className="text-sm text-gray-500">Reset all marketplace settings to defaults</div>
                          </div>
                          <Button variant="destructive" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                          <div>
                            <div className="font-medium text-red-600">Disconnect All Apps</div>
                            <div className="text-sm text-gray-500">Remove all connected integrations</div>
                          </div>
                          <Button variant="destructive" onClick={() => setShowDisconnectAllDialog(true)}>Disconnect All</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockIntegrationsAIInsights}
              title="Integration Intelligence"
              onInsightAction={(_insight) => toast.success(`${insight.title} action completed`)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockIntegrationsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockIntegrationsPredictions}
              title="Integration Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockIntegrationsActivities}
            title="Integration Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockIntegrationsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Browse Apps Dialog */}
      <Dialog open={showBrowseAppsDialog} onOpenChange={setShowBrowseAppsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              Browse Marketplace Apps
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search apps by name, category, or tag..."
                value={browseSearchQuery}
                onChange={(e) => setBrowseSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {apps
                  .filter(app =>
                    browseSearchQuery === '' ||
                    app.name.toLowerCase().includes(browseSearchQuery.toLowerCase()) ||
                    app.category.toLowerCase().includes(browseSearchQuery.toLowerCase()) ||
                    app.tags.some(tag => tag.toLowerCase().includes(browseSearchQuery.toLowerCase()))
                  )
                  .map(app => (
                    <Card
                      key={app.id}
                      className="cursor-pointer hover:border-teal-300 transition-colors"
                      onClick={() => {
                        setShowBrowseAppsDialog(false)
                        setSelectedApp(app)
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {app.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate">{app.name}</h4>
                              {app.verified && <Verified className="w-3 h-3 text-blue-500" />}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{app.shortDescription}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{app.category}</Badge>
                              {app.status === 'installed' && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Installed</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-500">
                {apps.filter(app =>
                  browseSearchQuery === '' ||
                  app.name.toLowerCase().includes(browseSearchQuery.toLowerCase()) ||
                  app.category.toLowerCase().includes(browseSearchQuery.toLowerCase())
                ).length} apps found
              </span>
              <Button variant="outline" onClick={() => setShowBrowseAppsDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Install App Dialog */}
      <Dialog open={showInstallAppDialog} onOpenChange={(open) => {
        setShowInstallAppDialog(open)
        if (!open) {
          setSelectedAppToInstall(null)
          setSelectedInstallPlan(null)
          setInstallStep('select')
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              {installStep === 'select' && 'Select App to Install'}
              {installStep === 'plan' && `Choose Plan for ${selectedAppToInstall?.name}`}
              {installStep === 'confirm' && 'Confirm Installation'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {installStep === 'select' && (
              <>
                <p className="text-sm text-gray-500">Choose an app from our marketplace to install</p>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-2">
                    {apps
                      .filter(app => app.status !== 'installed')
                      .map(app => (
                        <Card
                          key={app.id}
                          className={`cursor-pointer transition-all ${selectedAppToInstall?.id === app.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'hover:border-teal-300'}`}
                          onClick={() => setSelectedAppToInstall(app)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {app.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{app.name}</h4>
                                  {app.verified && <Verified className="w-4 h-4 text-blue-500" />}
                                </div>
                                <p className="text-sm text-gray-500">{app.shortDescription}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span>{renderStars(app.rating)}</span>
                                  <span>{app.rating}</span>
                                  <span>•</span>
                                  <span>{formatInstalls(app.installCount)} installs</span>
                                </div>
                              </div>
                              {selectedAppToInstall?.id === app.id && (
                                <CheckCircle className="w-5 h-5 text-teal-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => setShowInstallAppDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={!selectedAppToInstall}
                    onClick={() => setInstallStep('plan')}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {installStep === 'plan' && selectedAppToInstall && (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {selectedAppToInstall.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedAppToInstall.name}</h4>
                    <p className="text-sm text-gray-500">by {selectedAppToInstall.developer.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedAppToInstall.pricing.map(plan => (
                    <Card
                      key={plan.id}
                      className={`cursor-pointer transition-all ${selectedInstallPlan?.id === plan.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'hover:border-teal-300'} ${plan.popular ? 'ring-2 ring-teal-200' : ''}`}
                      onClick={() => setSelectedInstallPlan(plan)}
                    >
                      <CardContent className="p-4">
                        {plan.popular && (
                          <Badge className="bg-teal-600 mb-2">Popular</Badge>
                        )}
                        <h4 className="font-semibold">{plan.name}</h4>
                        <div className="text-2xl font-bold mt-1">
                          {plan.price === 0 ? 'Free' : `$${plan.price}`}
                          {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>}
                        </div>
                        <ul className="mt-3 space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {selectedInstallPlan?.id === plan.id && (
                          <div className="mt-2 text-center">
                            <CheckCircle className="w-5 h-5 text-teal-600 mx-auto" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => setInstallStep('select')}>
                    Back
                  </Button>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={!selectedInstallPlan}
                    onClick={() => setInstallStep('confirm')}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {installStep === 'confirm' && selectedAppToInstall && selectedInstallPlan && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Installation Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {selectedAppToInstall.icon}
                          </div>
                          <div>
                            <h5 className="font-medium">{selectedAppToInstall.name}</h5>
                            <p className="text-xs text-gray-500">{selectedInstallPlan.name} Plan</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {selectedInstallPlan.price === 0 ? 'Free' : `$${selectedInstallPlan.price}/${selectedInstallPlan.interval}`}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Required Permissions</h5>
                        <div className="space-y-1">
                          {selectedAppToInstall.permissions.filter(p => p.required).map((perm, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <Shield className="w-3 h-3 text-gray-400" />
                              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{perm.scope}</code>
                              <span className="text-gray-500">- {perm.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-between gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => setInstallStep('plan')}>
                    Back
                  </Button>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => {
                      // Update app status to installed
                      setApps(prev => prev.map(a =>
                        a.id === selectedAppToInstall.id
                          ? { ...a, status: 'installed' as const, currentPlan: selectedInstallPlan.name, installCount: a.installCount + 1 }
                          : a
                      ))
                      toast.success(`${selectedAppToInstall.name} installed successfully with ${selectedInstallPlan.name} plan`)
                      setShowInstallAppDialog(false)
                      setSelectedAppToInstall(null)
                      setSelectedInstallPlan(null)
                      setInstallStep('select')
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-teal-600" />
              Integration Logs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['all', 'success', 'error', 'warning'] as const).map(filter => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={logsFilter === filter ? 'default' : 'outline'}
                    className={logsFilter === filter ? 'bg-teal-600' : ''}
                    onClick={() => setLogsFilter(filter)}
                  >
                    {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                toast.success('Logs refreshed successfully')
              }}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${
                      log.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                      log.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                      log.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                      'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          log.type === 'success' ? 'bg-green-500' :
                          log.type === 'error' ? 'bg-red-500' :
                          log.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <span className="font-medium text-sm">{log.app}</span>
                        <Badge variant="outline" className="text-xs">{log.event}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">{log.details}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-500">{filteredLogs.length} log entries</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Logs exported successfully')
                }}>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => setShowLogsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* App Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedApp && (
            <div className="flex flex-col h-full">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedApp.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-2xl">{selectedApp.name}</DialogTitle>
                      {selectedApp.verified && <Verified className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-gray-500">by {selectedApp.developer.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(selectedApp.rating)}
                        <span className="font-semibold ml-1">{selectedApp.rating}</span>
                        <span className="text-gray-500">({selectedApp.reviewCount.toLocaleString()} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Download className="w-4 h-4" />
                        <span>{formatInstalls(selectedApp.installCount)} installs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedApp.status === 'installed' ? (
                      <>
                        <Button variant="outline" onClick={() => { setSelectedAppForAction(selectedApp); setShowConfigureAppDialog(true) }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" className="text-red-600" onClick={() => { setSelectedAppForAction(selectedApp); setShowUninstallDialog(true) }}>Uninstall</Button>
                      </>
                    ) : (
                      <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowInstallDialog(true)}>
                        Install App
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 py-4">
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-600">{selectedApp.fullDescription}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Version</div>
                        <div className="font-semibold">{selectedApp.version}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <div className="font-semibold">{selectedApp.lastUpdated}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="font-semibold capitalize">{selectedApp.category}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Links</h3>
                      <div className="flex gap-4">
                        <a href={selectedApp.docsUrl} className="flex items-center gap-1 text-teal-600 hover:underline">
                          <ExternalLink className="w-4 h-4" />
                          Documentation
                        </a>
                        <a href={selectedApp.supportUrl} className="flex items-center gap-1 text-teal-600 hover:underline">
                          <MessageSquare className="w-4 h-4" />
                          Support
                        </a>
                        <a href={selectedApp.privacyUrl} className="flex items-center gap-1 text-teal-600 hover:underline">
                          <Shield className="w-4 h-4" />
                          Privacy Policy
                        </a>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedApp.pricing.map(plan => (
                        <Card key={plan.id} className={`relative ${plan.popular ? 'border-teal-500 border-2' : ''}`}>
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-teal-600">Most Popular</Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <div className="mt-2 mb-4">
                              <span className="text-3xl font-bold">
                                {plan.price === 0 ? 'Free' : `$${plan.price}`}
                              </span>
                              {plan.price > 0 && (
                                <span className="text-gray-500">/{plan.interval}</span>
                              )}
                            </div>
                            <ul className="space-y-2 mb-6">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`w-full ${plan.popular ? 'bg-teal-600' : ''}`}
                              variant={plan.popular ? 'default' : 'outline'}
                              onClick={() => handleInstall(selectedApp, plan)}
                            >
                              {selectedApp.status === 'installed' && selectedApp.currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{selectedApp.rating}</div>
                        <div className="flex justify-center mt-1">{renderStars(selectedApp.rating)}</div>
                        <div className="text-sm text-gray-500 mt-1">{selectedApp.reviewCount.toLocaleString()} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <Progress value={star === 5 ? 72 : star === 4 ? 20 : 8 / star} className="h-2 flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {mockReviews.filter(r => r.appId === selectedApp.id).map(review => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback>{review.user.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{review.user.name}</span>
                                {review.user.company && (
                                  <span className="text-sm text-gray-500">at {review.user.company}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <h4 className="font-medium mt-2">{review.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{review.content}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <button className="flex items-center gap-1 hover:text-gray-700">
                                  <Heart className="w-4 h-4" />
                                  Helpful ({review.helpful})
                                </button>
                                <button className="flex items-center gap-1 hover:text-gray-700">
                                  <Flag className="w-4 h-4" />
                                  Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="permissions" className="space-y-4">
                    <p className="text-gray-600">
                      This app requires the following permissions to function properly:
                    </p>
                    <div className="space-y-3">
                      {selectedApp.permissions.map((perm, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-1.5 rounded ${perm.required ? 'bg-red-100' : 'bg-gray-100'}`}>
                            {perm.required ? (
                              <Lock className="w-4 h-4 text-red-600" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{perm.scope}</code>
                              {perm.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Developer Portal Dialog */}
      <Dialog open={showDeveloperPortalDialog} onOpenChange={setShowDeveloperPortalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-teal-600" />
              Developer Portal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Access developer resources and documentation to build integrations with FreeFlow.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="cursor-pointer hover:border-teal-300" onClick={() => {
                toast.info('Opening API Documentation...')
                setShowDeveloperPortalDialog(false)
              }}>
                <CardContent className="p-4 text-center">
                  <Code className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                  <h4 className="font-semibold">API Documentation</h4>
                  <p className="text-sm text-gray-500">REST API reference and guides</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-teal-300" onClick={() => {
                toast.info('Opening SDK Downloads...')
                setShowDeveloperPortalDialog(false)
              }}>
                <CardContent className="p-4 text-center">
                  <Download className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold">SDK Downloads</h4>
                  <p className="text-sm text-gray-500">JavaScript, Python, Ruby SDKs</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-teal-300" onClick={() => {
                toast.info('Opening Webhook Guide...')
                setShowDeveloperPortalDialog(false)
              }}>
                <CardContent className="p-4 text-center">
                  <Webhook className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-semibold">Webhook Guide</h4>
                  <p className="text-sm text-gray-500">Events and payload reference</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-teal-300" onClick={() => {
                toast.info('Opening Sample Apps...')
                setShowDeveloperPortalDialog(false)
              }}>
                <CardContent className="p-4 text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-semibold">Sample Apps</h4>
                  <p className="text-sm text-gray-500">Example integrations and code</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDeveloperPortalDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit App Dialog */}
      <Dialog open={showSubmitAppDialog} onOpenChange={setShowSubmitAppDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              Submit Your App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Submit your app to the FreeFlow Marketplace and reach thousands of users.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>App Name</Label>
                <Input placeholder="Enter your app name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description of your app" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input placeholder="https://yourapp.com" />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input placeholder="support@yourapp.com" type="email" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSubmitAppDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600" onClick={() => {
                toast.success('App submitted for review successfully')
                setShowSubmitAppDialog(false)
              }}>Submit for Review</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure App Dialog */}
      <Dialog open={showConfigureAppDialog} onOpenChange={setShowConfigureAppDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-teal-600" />
              Configure {selectedAppForAction?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedAppForAction && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {selectedAppForAction.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{selectedAppForAction.name}</h4>
                  <p className="text-sm text-gray-500">v{selectedAppForAction.version} - {selectedAppForAction.currentPlan || 'Free'} Plan</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <Input defaultValue="https://api.freeflow.com/integrations" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Enable Auto-Sync</div>
                    <div className="text-sm text-gray-500">Automatically sync data every 5 minutes</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Debug Mode</div>
                    <div className="text-sm text-gray-500">Log detailed API calls and responses</div>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every minute</SelectItem>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="60">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConfigureAppDialog(false)}>Cancel</Button>
                <Button className="bg-teal-600" onClick={() => {
                  toast.success('Configuration saved successfully')
                  setShowConfigureAppDialog(false)
                }}>Save Configuration</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Uninstall App Dialog */}
      <Dialog open={showUninstallDialog} onOpenChange={setShowUninstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-5 h-5" />
              Uninstall {selectedAppForAction?.name}?
            </DialogTitle>
          </DialogHeader>
          {selectedAppForAction && (
            <div className="space-y-4">
              <p className="text-gray-600">Are you sure you want to uninstall this app? This action will:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Remove all app connections and configurations</li>
                <li>Stop all automated workflows using this app</li>
                <li>Delete any cached data from this integration</li>
              </ul>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                You can reinstall this app at any time from the marketplace.
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowUninstallDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  if (confirm(`Are you sure you want to uninstall ${selectedAppForAction.name}?`)) {
                    // Update app status to available
                    setApps(prev => prev.map(a =>
                      a.id === selectedAppForAction.id
                        ? { ...a, status: 'available' as const, currentPlan: undefined }
                        : a
                    ))
                    toast.success(`${selectedAppForAction.name} uninstalled successfully`)
                    setShowUninstallDialog(false)
                    setSelectedAppForAction(null)
                  }
                }}>Uninstall</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reconnect App Dialog */}
      <Dialog open={showReconnectDialog} onOpenChange={setShowReconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-600" />
              Reconnect {selectedAppForAction?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedAppForAction && (
            <div className="space-y-4">
              <p className="text-gray-600">Re-establish the connection to {selectedAppForAction.name}. This will:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Refresh your authentication tokens</li>
                <li>Verify API access and permissions</li>
                <li>Resume any paused sync operations</li>
              </ul>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReconnectDialog(false)}>Cancel</Button>
                <Button className="bg-teal-600" onClick={() => {
                  toast.success(`${selectedAppForAction.name} reconnected successfully`)
                  setShowReconnectDialog(false)
                }}>Reconnect</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect App Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-5 h-5" />
              Disconnect {selectedAppForAction?.name}?
            </DialogTitle>
          </DialogHeader>
          {selectedAppForAction && (
            <div className="space-y-4">
              <p className="text-gray-600">This will disconnect the app but keep it installed. You can reconnect at any time.</p>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDisconnectDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => {
                  if (confirm(`Are you sure you want to disconnect ${selectedAppForAction.name}?`)) {
                    toast.success(`${selectedAppForAction.name} disconnected successfully`)
                    setShowDisconnectDialog(false)
                  }
                }}>Disconnect</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={showRegenerateKeyDialog} onOpenChange={setShowRegenerateKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <Key className="w-5 h-5" />
              Regenerate {keyTypeToRegenerate === 'production' ? 'Production' : 'Test'} API Key?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">This will invalidate your current {keyTypeToRegenerate} API key immediately. Any applications using this key will stop working until updated.</p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Make sure to update your applications with the new key after regenerating.
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(false)}>Cancel</Button>
              <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={() => {
                if (confirm(`Are you sure you want to regenerate your ${keyTypeToRegenerate} API key? This will invalidate your current key.`)) {
                  toast.success(`${keyTypeToRegenerate} API key regenerated successfully`)
                  setShowRegenerateKeyDialog(false)
                }
              }}>Regenerate Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateApiKeyDialog} onOpenChange={setShowCreateApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-teal-600" />
              Create New API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input placeholder="e.g., Mobile App Key" value={newApiKeyName} onChange={(e) => setNewApiKeyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Key Type</Label>
              <Select defaultValue="test">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test Key</SelectItem>
                  <SelectItem value="production">Production Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="read" defaultChecked className="rounded" />
                  <Label htmlFor="read" className="font-normal">Read access</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="write" className="rounded" />
                  <Label htmlFor="write" className="font-normal">Write access</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="admin" className="rounded" />
                  <Label htmlFor="admin" className="font-normal">Admin access</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowCreateApiKeyDialog(false); setNewApiKeyName('') }}>Cancel</Button>
              <Button className="bg-teal-600" onClick={() => {
                toast.success('API key created successfully')
                setShowCreateApiKeyDialog(false)
                setNewApiKeyName('')
              }}>Create Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-teal-600" />
              Add Webhook Endpoint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input placeholder="https://api.yourapp.com/webhook" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Events to Subscribe</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {['app.installed', 'app.uninstalled', 'app.updated', 'sync.started', 'sync.completed', 'sync.failed'].map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={event}
                      checked={newWebhookEvents.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhookEvents([...newWebhookEvents, event])
                        } else {
                          setNewWebhookEvents(newWebhookEvents.filter(e => e !== event))
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={event} className="font-normal text-sm">{event}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secret Key (optional)</Label>
              <Input placeholder="Webhook signing secret" type="password" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowAddWebhookDialog(false); setNewWebhookUrl(''); setNewWebhookEvents([]) }}>Cancel</Button>
              <Button className="bg-teal-600" onClick={() => {
                toast.success('Webhook endpoint added successfully')
                setShowAddWebhookDialog(false)
                setNewWebhookUrl('')
                setNewWebhookEvents([])
              }}>Add Webhook</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unblock App Dialog */}
      <Dialog open={showUnblockAppDialog} onOpenChange={setShowUnblockAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Unblock UnsafeApp Pro?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">This will allow users to install UnsafeApp Pro again. Are you sure you want to unblock this app?</p>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowUnblockAppDialog(false)}>Cancel</Button>
              <Button className="bg-green-600" onClick={() => {
                toast.success('App unblocked successfully')
                setShowUnblockAppDialog(false)
              }}>Unblock</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block App Dialog */}
      <Dialog open={showBlockAppDialog} onOpenChange={setShowBlockAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-5 h-5" />
              Block an App
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Select an app to block. Blocked apps cannot be installed by any team members.</p>
            <div className="space-y-2">
              <Label>App to Block</Label>
              <Select value={appToBlock} onValueChange={setAppToBlock}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an app" />
                </SelectTrigger>
                <SelectContent>
                  {apps.filter(app => app.status !== 'installed').map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input placeholder="Why is this app being blocked?" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setShowBlockAppDialog(false); setAppToBlock('') }}>Cancel</Button>
              <Button variant="destructive" disabled={!appToBlock} onClick={() => {
                if (confirm('Are you sure you want to block this app?')) {
                  toast.success('App blocked successfully')
                  setShowBlockAppDialog(false)
                  setAppToBlock('')
                }
              }}>Block App</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-teal-600" />
              Export Marketplace Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Export your marketplace configuration and settings.</p>
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="json">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Include</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-settings" defaultChecked className="rounded" />
                  <Label htmlFor="exp-settings" className="font-normal">Settings & Preferences</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-apps" defaultChecked className="rounded" />
                  <Label htmlFor="exp-apps" className="font-normal">Installed Apps</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="exp-api" defaultChecked className="rounded" />
                  <Label htmlFor="exp-api" className="font-normal">API Configuration</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600" onClick={() => {
                toast.success('Marketplace data exported successfully')
                setShowExportDialog(false)
              }}>Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Data Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              Import Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">Import marketplace configuration from another workspace.</p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 mb-2">Drag and drop your configuration file here</p>
              <p className="text-sm text-gray-400 mb-4">or</p>
              <Button variant="outline" onClick={() => toast.info('Browse', { description: 'Opening file picker...' })}>Browse Files</Button>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600" onClick={() => {
                toast.success('Configuration imported successfully')
                setShowImportDialog(false)
              }}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Cache Dialog */}
      <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-600" />
              Clear Cache
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">This will clear all cached data and force a fresh sync with all connected apps.</p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              This may take a few minutes to complete and temporarily slow down the application.
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
              <Button className="bg-teal-600" onClick={() => {
                toast.success('Cache cleared successfully')
                setShowClearCacheDialog(false)
              }}>Clear Cache</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-5 h-5" />
              Reset All Settings?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">This will reset all marketplace settings to their default values. This action cannot be undone.</p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              Warning: This will remove all custom configurations, preferences, and API settings.
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
                  toast.success('All settings reset successfully')
                  setShowResetSettingsDialog(false)
                }
              }}>Reset All Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect All Apps Dialog */}
      <Dialog open={showDisconnectAllDialog} onOpenChange={setShowDisconnectAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="w-5 h-5" />
              Disconnect All Apps?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">This will disconnect all {installedApps.length} connected apps. This action cannot be undone.</p>
            <div className="space-y-2">
              {installedApps.map(app => (
                <div key={app.id} className="flex items-center gap-2 p-2 border rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {app.icon}
                  </div>
                  <span className="text-sm font-medium">{app.name}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              Warning: All automated workflows using these apps will stop working immediately.
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowDisconnectAllDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you sure you want to disconnect all apps? This action cannot be undone.')) {
                  toast.success('All apps disconnected successfully')
                  setShowDisconnectAllDialog(false)
                }
              }}>Disconnect All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
