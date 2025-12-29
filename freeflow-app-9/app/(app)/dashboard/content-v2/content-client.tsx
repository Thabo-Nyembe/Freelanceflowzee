'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bell, Key, Webhook, Mail, AlertTriangle, Sliders, Globe as GlobeIcon, HardDrive, Trash2 as TrashIcon, RefreshCw, Download, Plus, Settings, Shield, Database, Cloud, Code, Layers, FileText } from 'lucide-react'

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

import {
  contentAIInsights,
  contentCollaborators,
  contentPredictions,
  contentActivities,
  contentQuickActions,
} from '@/lib/mock-data/adapters'

// ============================================================================
// CONTENTFUL/STRAPI-LEVEL CMS - Headless Content Management System
// Features: Rich editor, Asset library, Content types, Localization, Versioning
// ============================================================================

interface ContentEntry {
  id: string
  title: string
  slug: string
  contentType: string
  status: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived'
  locale: string
  locales: string[]
  version: number
  versions: ContentVersion[]
  author: {
    id: string
    name: string
    avatar: string
    email: string
  }
  fields: Record<string, any>
  metadata: {
    createdAt: string
    updatedAt: string
    publishedAt: string | null
    scheduledAt: string | null
  }
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: string | null
    keywords: string[]
  }
  stats: {
    views: number
    avgReadTime: number
    bounceRate: number
    shares: number
  }
  workflow: {
    stage: string
    assignee: string | null
    dueDate: string | null
    comments: number
  }
}

interface ContentVersion {
  id: string
  version: number
  createdAt: string
  createdBy: { name: string; avatar: string }
  changes: string[]
  status: 'draft' | 'published' | 'archived'
}

interface Asset {
  id: string
  filename: string
  title: string
  description: string
  type: 'image' | 'video' | 'audio' | 'document' | 'archive'
  mimeType: string
  size: number
  dimensions?: { width: number; height: number }
  duration?: number
  url: string
  thumbnailUrl: string
  folder: string
  tags: string[]
  uploadedBy: { name: string; avatar: string }
  uploadedAt: string
  usageCount: number
  alt?: string
}

interface ContentType {
  id: string
  name: string
  apiId: string
  description: string
  icon: string
  fields: ContentField[]
  entryCount: number
  lastModified: string
  createdBy: { name: string; avatar: string }
  isSystem: boolean
}

interface ContentField {
  id: string
  name: string
  apiId: string
  type: 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'media' | 'reference' | 'json' | 'enum' | 'location'
  required: boolean
  unique: boolean
  localized: boolean
  validation: Record<string, any>
  defaultValue: any
  helpText: string
}

interface Locale {
  code: string
  name: string
  flag: string
  isDefault: boolean
  fallback: string | null
  contentCount: number
  completionRate: number
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  headers: Record<string, string>
  secret: string
  isActive: boolean
  lastTriggered: string | null
  successRate: number
  totalCalls: number
}

// Mock data
const mockEntries: ContentEntry[] = [
  {
    id: '1',
    title: 'Getting Started with FreeFlow Platform',
    slug: 'getting-started-freeflow',
    contentType: 'Article',
    status: 'published',
    locale: 'en-US',
    locales: ['en-US', 'es-ES', 'de-DE', 'fr-FR'],
    version: 5,
    versions: [
      { id: 'v5', version: 5, createdAt: '2024-12-20T10:00:00Z', createdBy: { name: 'John Doe', avatar: '👨‍💻' }, changes: ['Updated introduction', 'Added new screenshot'], status: 'published' },
      { id: 'v4', version: 4, createdAt: '2024-12-18T14:30:00Z', createdBy: { name: 'Jane Smith', avatar: '👩‍💼' }, changes: ['Fixed typos', 'Updated links'], status: 'archived' },
      { id: 'v3', version: 3, createdAt: '2024-12-15T09:00:00Z', createdBy: { name: 'John Doe', avatar: '👨‍💻' }, changes: ['Major content revision'], status: 'archived' }
    ],
    author: { id: 'u1', name: 'John Doe', avatar: '👨‍💻', email: 'john@example.com' },
    fields: { body: '...', category: 'Guides', readTime: 8 },
    metadata: {
      createdAt: '2024-10-01T08:00:00Z',
      updatedAt: '2024-12-20T10:00:00Z',
      publishedAt: '2024-12-20T10:00:00Z',
      scheduledAt: null
    },
    seo: {
      metaTitle: 'Getting Started Guide | FreeFlow',
      metaDescription: 'Learn how to get started with FreeFlow platform in minutes',
      ogImage: '/images/og-getting-started.png',
      keywords: ['guide', 'tutorial', 'getting started', 'freeflow']
    },
    stats: { views: 12500, avgReadTime: 485, bounceRate: 23.5, shares: 342 },
    workflow: { stage: 'Published', assignee: null, dueDate: null, comments: 8 }
  },
  {
    id: '2',
    title: 'Advanced Workflow Automation',
    slug: 'advanced-workflow-automation',
    contentType: 'Article',
    status: 'in_review',
    locale: 'en-US',
    locales: ['en-US', 'es-ES'],
    version: 3,
    versions: [
      { id: 'v3', version: 3, createdAt: '2024-12-22T15:00:00Z', createdBy: { name: 'Alice Chen', avatar: '👩‍💻' }, changes: ['Added code examples'], status: 'draft' },
      { id: 'v2', version: 2, createdAt: '2024-12-20T11:00:00Z', createdBy: { name: 'Alice Chen', avatar: '👩‍💻' }, changes: ['Initial draft'], status: 'draft' }
    ],
    author: { id: 'u2', name: 'Alice Chen', avatar: '👩‍💻', email: 'alice@example.com' },
    fields: { body: '...', category: 'Advanced', readTime: 15 },
    metadata: {
      createdAt: '2024-12-15T10:00:00Z',
      updatedAt: '2024-12-22T15:00:00Z',
      publishedAt: null,
      scheduledAt: null
    },
    seo: {
      metaTitle: 'Advanced Workflow Automation | FreeFlow',
      metaDescription: 'Master workflow automation with advanced techniques',
      ogImage: null,
      keywords: ['automation', 'workflow', 'advanced']
    },
    stats: { views: 0, avgReadTime: 0, bounceRate: 0, shares: 0 },
    workflow: { stage: 'Review', assignee: 'Bob Smith', dueDate: '2024-12-25', comments: 3 }
  },
  {
    id: '3',
    title: 'Platform Security Best Practices',
    slug: 'security-best-practices',
    contentType: 'Article',
    status: 'scheduled',
    locale: 'en-US',
    locales: ['en-US', 'de-DE', 'ja-JP'],
    version: 2,
    versions: [
      { id: 'v2', version: 2, createdAt: '2024-12-21T09:00:00Z', createdBy: { name: 'Security Team', avatar: '🔒' }, changes: ['Final review'], status: 'draft' }
    ],
    author: { id: 'u3', name: 'Security Team', avatar: '🔒', email: 'security@example.com' },
    fields: { body: '...', category: 'Security', readTime: 12 },
    metadata: {
      createdAt: '2024-12-10T08:00:00Z',
      updatedAt: '2024-12-21T09:00:00Z',
      publishedAt: null,
      scheduledAt: '2024-12-28T09:00:00Z'
    },
    seo: {
      metaTitle: 'Security Best Practices | FreeFlow',
      metaDescription: 'Essential security practices for your FreeFlow deployment',
      ogImage: '/images/og-security.png',
      keywords: ['security', 'best practices', 'compliance']
    },
    stats: { views: 0, avgReadTime: 0, bounceRate: 0, shares: 0 },
    workflow: { stage: 'Scheduled', assignee: null, dueDate: '2024-12-28', comments: 5 }
  },
  {
    id: '4',
    title: 'API Integration Guide',
    slug: 'api-integration-guide',
    contentType: 'Documentation',
    status: 'published',
    locale: 'en-US',
    locales: ['en-US'],
    version: 8,
    versions: [
      { id: 'v8', version: 8, createdAt: '2024-12-19T16:00:00Z', createdBy: { name: 'Dev Team', avatar: '⚙️' }, changes: ['Updated API v3 endpoints'], status: 'published' }
    ],
    author: { id: 'u4', name: 'Dev Team', avatar: '⚙️', email: 'dev@example.com' },
    fields: { body: '...', category: 'API', readTime: 25 },
    metadata: {
      createdAt: '2024-06-01T08:00:00Z',
      updatedAt: '2024-12-19T16:00:00Z',
      publishedAt: '2024-12-19T16:00:00Z',
      scheduledAt: null
    },
    seo: {
      metaTitle: 'API Integration Guide | FreeFlow Docs',
      metaDescription: 'Complete guide to integrating with FreeFlow APIs',
      ogImage: '/images/og-api.png',
      keywords: ['api', 'integration', 'documentation', 'rest']
    },
    stats: { views: 45000, avgReadTime: 1200, bounceRate: 15.2, shares: 890 },
    workflow: { stage: 'Published', assignee: null, dueDate: null, comments: 24 }
  },
  {
    id: '5',
    title: 'Product Announcement: Q4 Features',
    slug: 'q4-features-announcement',
    contentType: 'Blog',
    status: 'draft',
    locale: 'en-US',
    locales: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
    version: 1,
    versions: [
      { id: 'v1', version: 1, createdAt: '2024-12-22T10:00:00Z', createdBy: { name: 'Marketing', avatar: '📣' }, changes: ['Initial draft'], status: 'draft' }
    ],
    author: { id: 'u5', name: 'Marketing', avatar: '📣', email: 'marketing@example.com' },
    fields: { body: '...', category: 'Announcements', readTime: 5 },
    metadata: {
      createdAt: '2024-12-22T10:00:00Z',
      updatedAt: '2024-12-22T10:00:00Z',
      publishedAt: null,
      scheduledAt: null
    },
    seo: {
      metaTitle: 'Q4 Features Announcement | FreeFlow Blog',
      metaDescription: 'Discover all the exciting new features coming in Q4',
      ogImage: null,
      keywords: ['announcement', 'features', 'q4', 'product']
    },
    stats: { views: 0, avgReadTime: 0, bounceRate: 0, shares: 0 },
    workflow: { stage: 'Draft', assignee: 'Jane Smith', dueDate: '2024-12-30', comments: 2 }
  }
]

const mockAssets: Asset[] = [
  {
    id: 'a1',
    filename: 'hero-banner.png',
    title: 'Hero Banner',
    description: 'Main hero banner for homepage',
    type: 'image',
    mimeType: 'image/png',
    size: 2456000,
    dimensions: { width: 1920, height: 1080 },
    url: '/images/hero-banner.png',
    thumbnailUrl: '/images/hero-banner-thumb.png',
    folder: 'Marketing',
    tags: ['hero', 'banner', 'homepage'],
    uploadedBy: { name: 'Design Team', avatar: '🎨' },
    uploadedAt: '2024-12-01T10:00:00Z',
    usageCount: 5,
    alt: 'FreeFlow platform hero banner'
  },
  {
    id: 'a2',
    filename: 'product-demo.mp4',
    title: 'Product Demo Video',
    description: '2-minute product demonstration',
    type: 'video',
    mimeType: 'video/mp4',
    size: 45000000,
    duration: 120,
    url: '/videos/product-demo.mp4',
    thumbnailUrl: '/videos/product-demo-thumb.jpg',
    folder: 'Videos',
    tags: ['demo', 'product', 'video'],
    uploadedBy: { name: 'Marketing', avatar: '📣' },
    uploadedAt: '2024-11-15T14:00:00Z',
    usageCount: 12
  },
  {
    id: 'a3',
    filename: 'whitepaper-2024.pdf',
    title: 'FreeFlow Whitepaper 2024',
    description: 'Technical whitepaper for enterprise customers',
    type: 'document',
    mimeType: 'application/pdf',
    size: 3200000,
    url: '/docs/whitepaper-2024.pdf',
    thumbnailUrl: '/docs/whitepaper-2024-thumb.png',
    folder: 'Documents',
    tags: ['whitepaper', 'enterprise', 'technical'],
    uploadedBy: { name: 'Product Team', avatar: '📦' },
    uploadedAt: '2024-10-20T09:00:00Z',
    usageCount: 28
  },
  {
    id: 'a4',
    filename: 'team-photo.jpg',
    title: 'Team Photo 2024',
    description: 'Company team photo for about page',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 1800000,
    dimensions: { width: 2400, height: 1600 },
    url: '/images/team-photo.jpg',
    thumbnailUrl: '/images/team-photo-thumb.jpg',
    folder: 'Company',
    tags: ['team', 'about', 'company'],
    uploadedBy: { name: 'HR Team', avatar: '👥' },
    uploadedAt: '2024-09-01T11:00:00Z',
    usageCount: 3,
    alt: 'FreeFlow team members'
  },
  {
    id: 'a5',
    filename: 'podcast-episode-42.mp3',
    title: 'Podcast Episode 42',
    description: 'Interview with industry experts',
    type: 'audio',
    mimeType: 'audio/mpeg',
    size: 28000000,
    duration: 2400,
    url: '/audio/podcast-ep42.mp3',
    thumbnailUrl: '/audio/podcast-ep42-cover.jpg',
    folder: 'Podcasts',
    tags: ['podcast', 'interview', 'episode'],
    uploadedBy: { name: 'Content Team', avatar: '🎙️' },
    uploadedAt: '2024-12-10T08:00:00Z',
    usageCount: 1
  }
]

const mockContentTypes: ContentType[] = [
  {
    id: 'ct1',
    name: 'Article',
    apiId: 'article',
    description: 'Long-form content with rich text and media',
    icon: '📄',
    fields: [
      { id: 'f1', name: 'Title', apiId: 'title', type: 'text', required: true, unique: true, localized: true, validation: { maxLength: 200 }, defaultValue: '', helpText: 'Article title' },
      { id: 'f2', name: 'Body', apiId: 'body', type: 'richtext', required: true, unique: false, localized: true, validation: {}, defaultValue: '', helpText: 'Main content' },
      { id: 'f3', name: 'Featured Image', apiId: 'featuredImage', type: 'media', required: false, unique: false, localized: false, validation: { allowedTypes: ['image'] }, defaultValue: null, helpText: 'Hero image' },
      { id: 'f4', name: 'Category', apiId: 'category', type: 'enum', required: true, unique: false, localized: false, validation: { options: ['Guides', 'Advanced', 'Security', 'API'] }, defaultValue: 'Guides', helpText: 'Content category' },
      { id: 'f5', name: 'Read Time', apiId: 'readTime', type: 'number', required: false, unique: false, localized: false, validation: { min: 1, max: 60 }, defaultValue: 5, helpText: 'Estimated read time in minutes' }
    ],
    entryCount: 45,
    lastModified: '2024-12-15T10:00:00Z',
    createdBy: { name: 'Admin', avatar: '⚙️' },
    isSystem: false
  },
  {
    id: 'ct2',
    name: 'Blog Post',
    apiId: 'blogPost',
    description: 'Short-form blog content',
    icon: '✍️',
    fields: [
      { id: 'f1', name: 'Title', apiId: 'title', type: 'text', required: true, unique: true, localized: true, validation: { maxLength: 150 }, defaultValue: '', helpText: 'Post title' },
      { id: 'f2', name: 'Content', apiId: 'content', type: 'richtext', required: true, unique: false, localized: true, validation: {}, defaultValue: '', helpText: 'Post content' },
      { id: 'f3', name: 'Author', apiId: 'author', type: 'reference', required: true, unique: false, localized: false, validation: { contentType: 'author' }, defaultValue: null, helpText: 'Post author' },
      { id: 'f4', name: 'Tags', apiId: 'tags', type: 'json', required: false, unique: false, localized: false, validation: {}, defaultValue: [], helpText: 'Post tags' }
    ],
    entryCount: 128,
    lastModified: '2024-12-20T08:00:00Z',
    createdBy: { name: 'Admin', avatar: '⚙️' },
    isSystem: false
  },
  {
    id: 'ct3',
    name: 'Documentation',
    apiId: 'documentation',
    description: 'Technical documentation pages',
    icon: '📚',
    fields: [
      { id: 'f1', name: 'Title', apiId: 'title', type: 'text', required: true, unique: true, localized: true, validation: {}, defaultValue: '', helpText: '' },
      { id: 'f2', name: 'Content', apiId: 'content', type: 'richtext', required: true, unique: false, localized: true, validation: {}, defaultValue: '', helpText: '' },
      { id: 'f3', name: 'Section', apiId: 'section', type: 'reference', required: true, unique: false, localized: false, validation: {}, defaultValue: null, helpText: '' },
      { id: 'f4', name: 'Order', apiId: 'order', type: 'number', required: true, unique: false, localized: false, validation: {}, defaultValue: 0, helpText: '' }
    ],
    entryCount: 89,
    lastModified: '2024-12-19T16:00:00Z',
    createdBy: { name: 'Dev Team', avatar: '⚙️' },
    isSystem: false
  },
  {
    id: 'ct4',
    name: 'Landing Page',
    apiId: 'landingPage',
    description: 'Marketing landing pages with flexible components',
    icon: '🎯',
    fields: [
      { id: 'f1', name: 'Title', apiId: 'title', type: 'text', required: true, unique: true, localized: true, validation: {}, defaultValue: '', helpText: '' },
      { id: 'f2', name: 'Sections', apiId: 'sections', type: 'json', required: true, unique: false, localized: true, validation: {}, defaultValue: [], helpText: '' },
      { id: 'f3', name: 'CTA', apiId: 'cta', type: 'json', required: false, unique: false, localized: true, validation: {}, defaultValue: null, helpText: '' }
    ],
    entryCount: 12,
    lastModified: '2024-12-18T11:00:00Z',
    createdBy: { name: 'Marketing', avatar: '📣' },
    isSystem: false
  }
]

const mockLocales: Locale[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', isDefault: true, fallback: null, contentCount: 274, completionRate: 100 },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸', isDefault: false, fallback: 'en-US', contentCount: 198, completionRate: 72 },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', isDefault: false, fallback: 'en-US', contentCount: 156, completionRate: 57 },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷', isDefault: false, fallback: 'en-US', contentCount: 142, completionRate: 52 },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', isDefault: false, fallback: 'en-US', contentCount: 89, completionRate: 32 },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', isDefault: false, fallback: 'en-US', contentCount: 67, completionRate: 24 }
]

const mockWebhooks: Webhook[] = [
  {
    id: 'wh1',
    name: 'Production Deploy',
    url: 'https://api.vercel.com/v1/deployments',
    events: ['entry.publish', 'entry.unpublish'],
    headers: { 'Authorization': 'Bearer ***' },
    secret: 'whsec_***',
    isActive: true,
    lastTriggered: '2024-12-22T10:30:00Z',
    successRate: 99.2,
    totalCalls: 1245
  },
  {
    id: 'wh2',
    name: 'Search Index Update',
    url: 'https://search.example.com/index',
    events: ['entry.publish', 'entry.update', 'entry.delete'],
    headers: { 'X-API-Key': '***' },
    secret: 'whsec_***',
    isActive: true,
    lastTriggered: '2024-12-22T09:15:00Z',
    successRate: 98.5,
    totalCalls: 3456
  },
  {
    id: 'wh3',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/***',
    events: ['entry.publish'],
    headers: {},
    secret: '',
    isActive: true,
    lastTriggered: '2024-12-21T16:00:00Z',
    successRate: 100,
    totalCalls: 567
  },
  {
    id: 'wh4',
    name: 'Analytics Sync',
    url: 'https://analytics.example.com/sync',
    events: ['entry.publish', 'asset.upload'],
    headers: { 'Authorization': 'Bearer ***' },
    secret: 'whsec_***',
    isActive: false,
    lastTriggered: '2024-12-15T08:00:00Z',
    successRate: 95.3,
    totalCalls: 234
  }
]

// Enhanced Content Mock Data
const mockContentAIInsights = [
  { id: '1', type: 'success' as const, title: 'Publishing Rate', description: '45 entries published this week. 30% above average!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Productivity' },
  { id: '2', type: 'info' as const, title: 'Localization', description: '85% of content translated to all target locales.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'i18n' },
  { id: '3', type: 'warning' as const, title: 'Draft Backlog', description: '12 drafts pending review for 7+ days.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Workflow' },
]

const mockContentCollaborators = [
  { id: '1', name: 'Content Lead', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Editorial', lastActive: 'Now' },
  { id: '2', name: 'Writer', avatar: '/avatars/writer.jpg', status: 'online' as const, role: 'Content', lastActive: '5m ago' },
  { id: '3', name: 'Translator', avatar: '/avatars/trans.jpg', status: 'away' as const, role: 'Localization', lastActive: '30m ago' },
]

const mockContentPredictions = [
  { id: '1', label: 'Entries', current: 1247, target: 1500, predicted: 1400, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Assets', current: 3560, target: 4000, predicted: 3800, confidence: 85, trend: 'up' as const },
  { id: '3', label: 'API Calls/Day', current: 125000, target: 150000, predicted: 140000, confidence: 78, trend: 'up' as const },
]

const mockContentActivities = [
  { id: '1', user: 'Content Lead', action: 'published', target: '5 new blog posts', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'Writer', action: 'drafted', target: 'product announcement', timestamp: '45m ago', type: 'info' as const },
  { id: '3', user: 'Translator', action: 'localized', target: '12 entries to Spanish', timestamp: '2h ago', type: 'info' as const },
]

const mockContentQuickActions = [
  { id: '1', label: 'New Entry', icon: 'FileText', shortcut: 'N', action: () => console.log('New entry') },
  { id: '2', label: 'Upload', icon: 'Upload', shortcut: 'U', action: () => console.log('Upload') },
  { id: '3', label: 'Publish', icon: 'Send', shortcut: 'P', action: () => console.log('Publish') },
  { id: '4', label: 'API Docs', icon: 'Code', shortcut: 'A', action: () => console.log('API docs') },
]

export default function ContentClient() {
  const [activeView, setActiveView] = useState<'entries' | 'assets' | 'types' | 'locales' | 'webhooks' | 'settings'>('entries')
  const [selectedEntry, setSelectedEntry] = useState<ContentEntry | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [localeFilter, setLocaleFilter] = useState<string>('all')
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Calculate stats
  const stats = useMemo(() => {
    const totalEntries = mockEntries.length
    const publishedEntries = mockEntries.filter(e => e.status === 'published').length
    const draftEntries = mockEntries.filter(e => e.status === 'draft').length
    const scheduledEntries = mockEntries.filter(e => e.status === 'scheduled').length
    const totalAssets = mockAssets.length
    const totalAssetSize = mockAssets.reduce((sum, a) => sum + a.size, 0)
    const contentTypes = mockContentTypes.length
    const locales = mockLocales.length
    const webhooksActive = mockWebhooks.filter(w => w.isActive).length
    const totalViews = mockEntries.reduce((sum, e) => sum + e.stats.views, 0)

    return {
      totalEntries,
      publishedEntries,
      draftEntries,
      scheduledEntries,
      totalAssets,
      totalAssetSize,
      contentTypes,
      locales,
      webhooksActive,
      totalViews
    }
  }, [])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return mockEntries.filter(e => {
      const matchesType = contentTypeFilter === 'all' || e.contentType === contentTypeFilter
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter
      const matchesLocale = localeFilter === 'all' || e.locales.includes(localeFilter)
      const matchesSearch = !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.slug.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesStatus && matchesLocale && matchesSearch
    })
  }, [contentTypeFilter, statusFilter, localeFilter, searchQuery])

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return mockAssets.filter(a => {
      const matchesType = assetTypeFilter === 'all' || a.type === assetTypeFilter
      const matchesSearch = !searchQuery ||
        a.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [assetTypeFilter, searchQuery])

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'in_review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️'
      case 'video': return '🎬'
      case 'audio': return '🎵'
      case 'document': return '📄'
      case 'archive': return '📦'
      default: return '📁'
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000000) return (bytes / 1000000000).toFixed(1) + ' GB'
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB'
    if (bytes >= 1000) return (bytes / 1000).toFixed(1) + ' KB'
    return bytes + ' B'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Content Management
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium rounded-full">
                Contentful Level
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Headless CMS with localization, versioning & webhooks</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white w-64"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity">
              + New Entry
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Entries</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalEntries}</div>
            <div className="text-xs text-green-600">{stats.publishedEntries} published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assets</div>
            <div className="text-2xl font-bold text-teal-600">{stats.totalAssets}</div>
            <div className="text-xs text-teal-600">{formatSize(stats.totalAssetSize)}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Content Types</div>
            <div className="text-2xl font-bold text-cyan-600">{stats.contentTypes}</div>
            <div className="text-xs text-cyan-600">{mockContentTypes.reduce((sum, ct) => sum + ct.fields.length, 0)} fields</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Locales</div>
            <div className="text-2xl font-bold text-blue-600">{stats.locales}</div>
            <div className="text-xs text-blue-600">{mockLocales.reduce((sum, l) => sum + l.contentCount, 0)} translations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Views</div>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalViews)}</div>
            <div className="text-xs text-purple-600">{stats.webhooksActive} webhooks active</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border dark:border-gray-700">
            <TabsTrigger value="entries" className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30">
              📝 Entries
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-teal-100 dark:data-[state=active]:bg-teal-900/30">
              🖼️ Assets
            </TabsTrigger>
            <TabsTrigger value="types" className="data-[state=active]:bg-cyan-100 dark:data-[state=active]:bg-cyan-900/30">
              🏗️ Content Types
            </TabsTrigger>
            <TabsTrigger value="locales" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
              🌍 Localization
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              🔗 Webhooks
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-900/30">
              ⚙️ Settings
            </TabsTrigger>
          </TabsList>

          {/* Entries Tab */}
          <TabsContent value="entries" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                {mockContentTypes.map(ct => (
                  <option key={ct.id} value={ct.name}>{ct.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
              <select
                value={localeFilter}
                onChange={(e) => setLocaleFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Locales</option>
                {mockLocales.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4">
              {filteredEntries.map(entry => (
                <Dialog key={entry.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded text-xs">
                              {entry.contentType}
                            </span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                              v{entry.version}
                            </span>
                            <div className="flex items-center gap-1">
                              {entry.locales.slice(0, 3).map(locale => {
                                const l = mockLocales.find(ml => ml.code === locale)
                                return <span key={locale} className="text-sm">{l?.flag}</span>
                              })}
                              {entry.locales.length > 3 && (
                                <span className="text-xs text-gray-500">+{entry.locales.length - 3}</span>
                              )}
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold dark:text-white">{entry.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">/{entry.slug}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <span className="text-lg">{entry.author.avatar}</span>
                              {entry.author.name}
                            </span>
                            <span>Updated {new Date(entry.metadata.updatedAt).toLocaleDateString()}</span>
                            {entry.workflow.stage !== 'Published' && entry.workflow.assignee && (
                              <span className="text-yellow-600">Assigned to {entry.workflow.assignee}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.status === 'published' && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <div>👁️ {formatNumber(entry.stats.views)}</div>
                              <div>🔗 {entry.stats.shares}</div>
                            </div>
                          )}
                          {entry.status === 'scheduled' && entry.metadata.scheduledAt && (
                            <div className="text-sm text-blue-600">
                              📅 {new Date(entry.metadata.scheduledAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{entry.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                          {entry.contentType}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">/{entry.slug}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Author</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{entry.author.avatar}</span>
                            <div>
                              <div className="font-medium dark:text-white">{entry.author.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{entry.author.email}</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Locales</div>
                          <div className="flex flex-wrap gap-2">
                            {entry.locales.map(locale => {
                              const l = mockLocales.find(ml => ml.code === locale)
                              return (
                                <span key={locale} className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                                  {l?.flag} {locale}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* SEO Preview */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm font-medium mb-2 dark:text-white">SEO Preview</div>
                        <div className="text-blue-600 font-medium">{entry.seo.metaTitle}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{entry.seo.metaDescription}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.seo.keywords.map(kw => (
                            <span key={kw} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Version History */}
                      <div>
                        <div className="text-sm font-medium mb-2 dark:text-white">Version History</div>
                        <div className="space-y-2">
                          {entry.versions.map(v => (
                            <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{v.createdBy.avatar}</span>
                                <div>
                                  <div className="text-sm dark:text-white">v{v.version} - {v.createdBy.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{v.changes.join(', ')}</div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(v.status)}`}>
                                {v.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                          Edit Entry
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          View API
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Duplicate
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                + Upload Asset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(asset => (
                <Dialog key={asset.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-6xl">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs capitalize">
                            {asset.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatSize(asset.size)}</span>
                        </div>
                        <h3 className="font-semibold dark:text-white truncate">{asset.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{asset.filename}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>📁 {asset.folder}</span>
                          <span>Used {asset.usageCount}x</span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{asset.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-6xl">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Filename</div>
                          <div className="font-mono dark:text-white">{asset.filename}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Size</div>
                          <div className="dark:text-white">{formatSize(asset.size)}</div>
                        </div>
                        {asset.dimensions && (
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Dimensions</div>
                            <div className="dark:text-white">{asset.dimensions.width} x {asset.dimensions.height}</div>
                          </div>
                        )}
                        {asset.duration && (
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Duration</div>
                            <div className="dark:text-white">{formatDuration(asset.duration)}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Uploaded by</div>
                          <div className="flex items-center gap-1 dark:text-white">
                            <span>{asset.uploadedBy.avatar}</span>
                            {asset.uploadedBy.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Upload date</div>
                          <div className="dark:text-white">{new Date(asset.uploadedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags</div>
                        <div className="flex flex-wrap gap-2">
                          {asset.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                          Copy URL
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Download
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                          Delete
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Content Types Tab */}
          <TabsContent value="types" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Content Types</h3>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                + Create Type
              </button>
            </div>

            <div className="grid gap-4">
              {mockContentTypes.map(ct => (
                <div key={ct.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{ct.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold dark:text-white">{ct.name}</h3>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono dark:text-gray-300">
                            {ct.apiId}
                          </span>
                          {ct.isSystem && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ct.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{ct.entryCount} entries</span>
                          <span>{ct.fields.length} fields</span>
                          <span>Updated {new Date(ct.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm dark:text-white">
                      Configure
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <div className="text-sm font-medium mb-2 dark:text-white">Fields</div>
                    <div className="flex flex-wrap gap-2">
                      {ct.fields.map(field => (
                        <span key={field.id} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-sm dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">{field.type}:</span> {field.name}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                          {field.localized && <span className="ml-1">🌍</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="locales" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Localization</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Add Locale
              </button>
            </div>

            <div className="grid gap-4">
              {mockLocales.map(locale => (
                <div key={locale.code} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{locale.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold dark:text-white">{locale.name}</h3>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono dark:text-gray-300">
                            {locale.code}
                          </span>
                          {locale.isDefault && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{locale.contentCount} entries</span>
                          {locale.fallback && <span>Fallback: {locale.fallback}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{locale.completionRate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">translated</div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${locale.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Webhooks</h3>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                + Create Webhook
              </button>
            </div>

            <div className="grid gap-4">
              {mockWebhooks.map(webhook => (
                <div key={webhook.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${webhook.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <h3 className="font-semibold dark:text-white">{webhook.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${webhook.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {webhook.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono truncate">{webhook.url}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {webhook.events.map(event => (
                          <span key={event} className="px-2 py-1 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{webhook.successRate}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">success rate</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatNumber(webhook.totalCalls)} calls
                      </div>
                    </div>
                  </div>
                  {webhook.lastTriggered && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                      Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Contentful Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-1">
                <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Settings</h3>
                {[
                  { id: 'general', label: 'General', icon: Settings },
                  { id: 'content', label: 'Content Model', icon: Layers },
                  { id: 'delivery', label: 'Delivery', icon: Cloud },
                  { id: 'localization', label: 'Localization', icon: GlobeIcon },
                  { id: 'api', label: 'API Access', icon: Code },
                  { id: 'advanced', label: 'Advanced', icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                      settingsTab === item.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Space Configuration</CardTitle>
                        <CardDescription>General settings for your content space</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Space Name</Label>
                            <Input defaultValue="Production Content" className="mt-1" />
                          </div>
                          <div>
                            <Label>Space ID</Label>
                            <Input defaultValue="spc_abcd1234" readOnly className="mt-1 bg-gray-50 dark:bg-gray-800" />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input defaultValue="Main production content management space" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Content Entries</p>
                            <p className="text-2xl font-bold">1,234</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Assets</p>
                            <p className="text-2xl font-bold">567</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Content Types</p>
                            <p className="text-2xl font-bold">12</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Environment Settings</CardTitle>
                        <CardDescription>Manage content environments</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Production', 'Staging', 'Development'].map((env, i) => (
                          <div key={env} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                              <div>
                                <p className="font-medium">{env}</p>
                                <p className="text-xs text-gray-500">{env.toLowerCase()}.cms.example.com</p>
                              </div>
                            </div>
                            <Badge className={i === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {i === 0 ? 'Primary' : 'Active'}
                            </Badge>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Environment
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Team & Permissions</CardTitle>
                        <CardDescription>Manage team access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-emerald-600">8</p>
                            <p className="text-sm text-gray-500">Admins</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">24</p>
                            <p className="text-sm text-gray-500">Editors</p>
                          </div>
                          <div className="p-4 border rounded-lg text-center">
                            <p className="text-2xl font-bold text-gray-600">12</p>
                            <p className="text-sm text-gray-500">Viewers</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          Manage Team Members
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Content Model Settings */}
                {settingsTab === 'content' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Model Settings</CardTitle>
                        <CardDescription>Configure content type behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Field Validation</p>
                            <p className="text-sm text-gray-500">Validate content before publishing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Required SEO Fields</p>
                            <p className="text-sm text-gray-500">Make SEO fields mandatory</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-generate Slugs</p>
                            <p className="text-sm text-gray-500">Create URL slugs from titles</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Slug Format</Label>
                          <Select defaultValue="kebab">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kebab">kebab-case (url-slug)</SelectItem>
                              <SelectItem value="snake">snake_case (url_slug)</SelectItem>
                              <SelectItem value="camel">camelCase (urlSlug)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Rich Text Editor</CardTitle>
                        <CardDescription>Configure rich text field behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Editor Mode</Label>
                          <Select defaultValue="rich">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rich">Rich Text (WYSIWYG)</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Embedded Entries</p>
                            <p className="text-sm text-gray-500">Allow embedding other entries</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Embedded Assets</p>
                            <p className="text-sm text-gray-500">Allow embedding images/videos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Max Rich Text Size</Label>
                          <Select defaultValue="500kb">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100kb">100 KB</SelectItem>
                              <SelectItem value="500kb">500 KB</SelectItem>
                              <SelectItem value="1mb">1 MB</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Versioning & History</CardTitle>
                        <CardDescription>Content version control</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Version History</p>
                            <p className="text-sm text-gray-500">Track all content changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Versions to Keep</Label>
                          <Select defaultValue="50">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">Last 10 versions</SelectItem>
                              <SelectItem value="25">Last 25 versions</SelectItem>
                              <SelectItem value="50">Last 50 versions</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Compare Versions</p>
                            <p className="text-sm text-gray-500">Side-by-side diff view</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Delivery Settings */}
                {settingsTab === 'delivery' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Delivery Network</CardTitle>
                        <CardDescription>CDN and caching configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable CDN</p>
                            <p className="text-sm text-gray-500">Global content delivery</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Cache TTL (seconds)</Label>
                          <Select defaultValue="3600">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="300">5 minutes</SelectItem>
                              <SelectItem value="3600">1 hour</SelectItem>
                              <SelectItem value="86400">24 hours</SelectItem>
                              <SelectItem value="604800">1 week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-500">Cache Hit Rate</p>
                            <p className="text-2xl font-bold text-emerald-600">98.5%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Avg Response Time</p>
                            <p className="text-2xl font-bold text-emerald-600">23ms</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Purge Cache
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Image Optimization</CardTitle>
                        <CardDescription>Automatic image processing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-optimize Images</p>
                            <p className="text-sm text-gray-500">Compress and resize on upload</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Default Format</Label>
                          <Select defaultValue="webp">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="webp">WebP (recommended)</SelectItem>
                              <SelectItem value="avif">AVIF (modern browsers)</SelectItem>
                              <SelectItem value="jpeg">JPEG (legacy)</SelectItem>
                              <SelectItem value="png">PNG (lossless)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quality</Label>
                          <Select defaultValue="80">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="60">60% (smaller files)</SelectItem>
                              <SelectItem value="80">80% (balanced)</SelectItem>
                              <SelectItem value="90">90% (high quality)</SelectItem>
                              <SelectItem value="100">100% (original)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Generate Responsive Images</p>
                            <p className="text-sm text-gray-500">Create multiple sizes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Preview Mode</CardTitle>
                        <CardDescription>Content preview configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Preview URL Pattern</Label>
                          <Input defaultValue="https://preview.example.com/api/preview?slug={{slug}}" className="mt-1 font-mono text-sm" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Live Preview</p>
                            <p className="text-sm text-gray-500">Real-time preview updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Preview Token TTL</Label>
                          <Select defaultValue="3600">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1800">30 minutes</SelectItem>
                              <SelectItem value="3600">1 hour</SelectItem>
                              <SelectItem value="86400">24 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Localization Settings */}
                {settingsTab === 'localization' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Default Locale</CardTitle>
                        <CardDescription>Primary language settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Primary Locale</Label>
                          <Select defaultValue="en-US">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="en-GB">English (UK)</SelectItem>
                              <SelectItem value="es-ES">Spanish</SelectItem>
                              <SelectItem value="fr-FR">French</SelectItem>
                              <SelectItem value="de-DE">German</SelectItem>
                              <SelectItem value="ja-JP">Japanese</SelectItem>
                              <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Fallback to Default</p>
                            <p className="text-sm text-gray-500">Use default locale for missing translations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Enabled Locales</CardTitle>
                        <CardDescription>Manage available languages</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { code: 'en-US', name: 'English (US)', entries: 1234, isDefault: true },
                          { code: 'es-ES', name: 'Spanish', entries: 892, isDefault: false },
                          { code: 'fr-FR', name: 'French', entries: 756, isDefault: false },
                          { code: 'de-DE', name: 'German', entries: 623, isDefault: false },
                          { code: 'ja-JP', name: 'Japanese', entries: 445, isDefault: false },
                        ].map((locale) => (
                          <div key={locale.code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{locale.code === 'en-US' ? '🇺🇸' : locale.code === 'es-ES' ? '🇪🇸' : locale.code === 'fr-FR' ? '🇫🇷' : locale.code === 'de-DE' ? '🇩🇪' : '🇯🇵'}</span>
                              <div>
                                <p className="font-medium">{locale.name}</p>
                                <p className="text-xs text-gray-500">{locale.entries} entries</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {locale.isDefault && <Badge className="bg-emerald-100 text-emerald-700">Default</Badge>}
                              <Switch defaultChecked />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Locale
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Translation Workflow</CardTitle>
                        <CardDescription>Automate translations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-translate</p>
                            <p className="text-sm text-gray-500">Use AI for initial translations</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Translation Provider</Label>
                          <Select defaultValue="deepl">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="deepl">DeepL (recommended)</SelectItem>
                              <SelectItem value="google">Google Translate</SelectItem>
                              <SelectItem value="azure">Azure Translator</SelectItem>
                              <SelectItem value="manual">Manual only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Review</p>
                            <p className="text-sm text-gray-500">Translations need approval</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* API Settings */}
                {settingsTab === 'api' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>Manage access tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Content Delivery API</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            cda_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                          <p className="text-xs text-gray-500 mt-2">Read-only access to published content</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Content Management API</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            cma_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                          <p className="text-xs text-gray-500 mt-2">Full read/write access</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Preview API</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="block w-full p-3 bg-gray-900 text-green-400 rounded font-mono text-sm overflow-x-auto">
                            preview_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </code>
                          <p className="text-xs text-gray-500 mt-2">Access to draft content</p>
                        </div>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Keys
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                        <CardDescription>Rate limits and security</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Rate Limit (requests/second)</Label>
                          <Select defaultValue="100">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="50">50 req/s</SelectItem>
                              <SelectItem value="100">100 req/s</SelectItem>
                              <SelectItem value="500">500 req/s</SelectItem>
                              <SelectItem value="unlimited">Unlimited (Enterprise)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Restrict API access by IP</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">CORS Enabled</p>
                            <p className="text-sm text-gray-500">Allow cross-origin requests</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Allowed Origins</Label>
                          <Input defaultValue="https://example.com, https://app.example.com" className="mt-1 font-mono text-sm" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>GraphQL Settings</CardTitle>
                        <CardDescription>GraphQL API configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable GraphQL API</p>
                            <p className="text-sm text-gray-500">Use GraphQL alongside REST</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Query Depth Limit</Label>
                          <Select defaultValue="10">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 levels</SelectItem>
                              <SelectItem value="10">10 levels</SelectItem>
                              <SelectItem value="15">15 levels</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Introspection</p>
                            <p className="text-sm text-gray-500">Allow schema introspection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="font-medium text-emerald-700 dark:text-emerald-300">GraphQL Playground</p>
                          <p className="text-sm text-gray-500">Test queries at: /graphql</p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Webhook Configuration</CardTitle>
                        <CardDescription>Real-time event notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Webhooks</p>
                            <p className="text-sm text-gray-500">Send events to external services</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Retry Policy</Label>
                          <Select defaultValue="3">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No retries</SelectItem>
                              <SelectItem value="3">3 retries (default)</SelectItem>
                              <SelectItem value="5">5 retries</SelectItem>
                              <SelectItem value="10">10 retries</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Full Payload</p>
                            <p className="text-sm text-gray-500">Send complete entry data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Secret Key (for signing)</Label>
                          <Input type="password" defaultValue="webhook_secret_key_xxx" className="mt-1 font-mono" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Import / Export</CardTitle>
                        <CardDescription>Backup and migrate content</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export Space</span>
                          </Button>
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Import Content</span>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Include Assets</p>
                            <p className="text-sm text-gray-500">Export media files</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Export Format</Label>
                          <Select defaultValue="json">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="yaml">YAML</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Audit Log</CardTitle>
                        <CardDescription>Track all changes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Audit Log</p>
                            <p className="text-sm text-gray-500">Log all content changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Log Retention</Label>
                          <Select defaultValue="1year">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30days">30 days</SelectItem>
                              <SelectItem value="90days">90 days</SelectItem>
                              <SelectItem value="1year">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full">
                          View Audit Log
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete All Draft Entries</p>
                              <p className="text-sm text-red-600">Remove all unpublished content</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Purge Unused Assets</p>
                              <p className="text-sm text-red-600">Delete orphaned media files</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              Purge
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700 dark:text-red-400">Delete Space</p>
                              <p className="text-sm text-red-600">Permanently delete this space</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
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
              insights={mockContentAIInsights}
              title="Content Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockContentCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockContentPredictions}
              title="Content Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockContentActivities}
            title="Content Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockContentQuickActions}
            variant="grid"
          />
        </div>
      </div>
    </div>
  )
}
