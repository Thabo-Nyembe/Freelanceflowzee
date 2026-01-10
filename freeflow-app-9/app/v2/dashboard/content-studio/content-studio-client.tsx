'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  FileText, Plus, Search, Grid3X3, List, MoreVertical, Download, Copy, Trash2,
  Edit2, Eye, Clock, Settings, Zap, Upload,
  Globe, Languages, Calendar, CheckCircle, AlertTriangle, BarChart3, Link2, RefreshCw, History,
  FileCode, Database, Type, Hash, ToggleLeft, ImageIcon, Film, Music, MapPin, ExternalLink,
  Archive, Send, Palette, AlignLeft, Boxes, GitBranch,
  Shield, Sliders, Edit, Terminal, Activity, Target, FileSearch, FolderOpen, Tags, BookOpen
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




// ============================================================================
// TYPE DEFINITIONS - Contentful Level CMS
// ============================================================================

type EntryStatus = 'draft' | 'changed' | 'published' | 'archived' | 'scheduled'
type FieldType = 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'location' | 'media' | 'reference' | 'json' | 'array' | 'link'
type AssetType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
type LocaleStatus = 'active' | 'inactive' | 'fallback'

interface ContentEntry {
  id: string
  title: string
  slug: string
  content_type_id: string
  content_type_name: string
  status: EntryStatus
  created_at: string
  updated_at: string
  published_at: string | null
  scheduled_at: string | null
  created_by: string
  updated_by: string
  version: number
  locale: string
  locales_completed: string[]
  tags: string[]
  fields: Record<string, unknown>
  references: string[]
  referenced_by: string[]
}

interface ContentType {
  id: string
  name: string
  description: string
  display_field: string
  fields: ContentField[]
  entries_count: number
  created_at: string
  updated_at: string
  icon: string
  color: string
}

interface ContentField {
  id: string
  name: string
  type: FieldType
  required: boolean
  localized: boolean
  unique: boolean
  validation: FieldValidation | null
  appearance: string
  default_value: unknown
  help_text: string
}

interface FieldValidation {
  min?: number
  max?: number
  pattern?: string
  in?: string[]
  link_type?: string
  size?: { min?: number; max?: number }
}

interface MediaAsset {
  id: string
  filename: string
  title: string
  description: string
  content_type: string
  asset_type: AssetType
  size_bytes: number
  width?: number
  height?: number
  duration?: number
  url: string
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  uploaded_by: string
  tags: string[]
  metadata: Record<string, string>
  locales: { locale: string; title: string; description: string }[]
  used_in: string[]
}

interface Locale {
  id: string
  code: string
  name: string
  native_name: string
  status: LocaleStatus
  is_default: boolean
  fallback_code: string | null
  entries_count: number
  completion_percentage: number
  direction: 'ltr' | 'rtl'
}

interface Webhook {
  id: string
  name: string
  url: string
  topics: string[]
  filters: Record<string, string[]>
  active: boolean
  headers: Record<string, string>
  last_triggered_at: string | null
  success_count: number
  failure_count: number
}

interface VersionHistory {
  id: string
  entry_id: string
  version: number
  changed_fields: string[]
  changed_by: string
  changed_at: string
  change_type: 'created' | 'updated' | 'published' | 'unpublished' | 'archived'
  snapshot: Record<string, unknown>
}

// ============================================================================
// MOCK DATA - Contentful Level
// ============================================================================

const mockEntries: ContentEntry[] = [
  {
    id: '1',
    title: 'Welcome to Our Platform',
    slug: 'welcome-to-our-platform',
    content_type_id: '1',
    content_type_name: 'Blog Post',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    published_at: '2024-01-15T10:30:00Z',
    scheduled_at: null,
    created_by: 'admin@company.com',
    updated_by: 'editor@company.com',
    version: 12,
    locale: 'en-US',
    locales_completed: ['en-US', 'es-ES', 'fr-FR'],
    tags: ['featured', 'announcement'],
    fields: { body: '...', excerpt: '...', featuredImage: 'asset_1' },
    references: ['2', '3'],
    referenced_by: []
  },
  {
    id: '2',
    title: 'Product Launch 2024',
    slug: 'product-launch-2024',
    content_type_id: '1',
    content_type_name: 'Blog Post',
    status: 'draft',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    published_at: null,
    scheduled_at: null,
    created_by: 'writer@company.com',
    updated_by: 'writer@company.com',
    version: 5,
    locale: 'en-US',
    locales_completed: ['en-US'],
    tags: ['product', 'launch'],
    fields: { body: '...', excerpt: '...' },
    references: [],
    referenced_by: ['1']
  },
  {
    id: '3',
    title: 'About Our Team',
    slug: 'about-our-team',
    content_type_id: '2',
    content_type_name: 'Page',
    status: 'published',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-12T09:00:00Z',
    published_at: '2024-01-12T09:00:00Z',
    scheduled_at: null,
    created_by: 'admin@company.com',
    updated_by: 'admin@company.com',
    version: 8,
    locale: 'en-US',
    locales_completed: ['en-US', 'de-DE'],
    tags: ['about', 'team'],
    fields: { sections: [], hero: {} },
    references: [],
    referenced_by: ['1']
  },
  {
    id: '4',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content_type_id: '2',
    content_type_name: 'Page',
    status: 'changed',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-15T14:00:00Z',
    published_at: '2024-01-08T10:00:00Z',
    scheduled_at: null,
    created_by: 'legal@company.com',
    updated_by: 'legal@company.com',
    version: 15,
    locale: 'en-US',
    locales_completed: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'],
    tags: ['legal', 'policy'],
    fields: { content: '...' },
    references: [],
    referenced_by: []
  },
  {
    id: '5',
    title: 'Holiday Promotion',
    slug: 'holiday-promotion',
    content_type_id: '3',
    content_type_name: 'Campaign',
    status: 'scheduled',
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-14T11:30:00Z',
    published_at: null,
    scheduled_at: '2024-12-20T00:00:00Z',
    created_by: 'marketing@company.com',
    updated_by: 'marketing@company.com',
    version: 7,
    locale: 'en-US',
    locales_completed: ['en-US', 'es-ES'],
    tags: ['holiday', 'promotion', 'campaign'],
    fields: { banner: 'asset_2', cta: {} },
    references: [],
    referenced_by: []
  },
  {
    id: '6',
    title: 'Old Press Release',
    slug: 'old-press-release',
    content_type_id: '4',
    content_type_name: 'Press Release',
    status: 'archived',
    created_at: '2023-06-15T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    published_at: '2023-06-15T10:00:00Z',
    scheduled_at: null,
    created_by: 'pr@company.com',
    updated_by: 'admin@company.com',
    version: 3,
    locale: 'en-US',
    locales_completed: ['en-US'],
    tags: ['press', 'archived'],
    fields: { content: '...' },
    references: [],
    referenced_by: []
  }
]

const mockContentTypes: ContentType[] = [
  {
    id: '1',
    name: 'Blog Post',
    description: 'Articles and blog content',
    display_field: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'text', required: true, localized: true, unique: false, validation: { min: 1, max: 200 }, appearance: 'single-line', default_value: '', help_text: 'The title of the blog post' },
      { id: 'slug', name: 'Slug', type: 'text', required: true, localized: false, unique: true, validation: { pattern: '^[a-z0-9-]+$' }, appearance: 'slug', default_value: '', help_text: 'URL-friendly identifier' },
      { id: 'body', name: 'Body', type: 'richtext', required: true, localized: true, unique: false, validation: null, appearance: 'rich-text', default_value: '', help_text: 'Main content' },
      { id: 'excerpt', name: 'Excerpt', type: 'text', required: false, localized: true, unique: false, validation: { max: 500 }, appearance: 'multi-line', default_value: '', help_text: 'Short summary' },
      { id: 'featuredImage', name: 'Featured Image', type: 'media', required: false, localized: false, unique: false, validation: null, appearance: 'asset-picker', default_value: null, help_text: 'Main image for the post' },
      { id: 'author', name: 'Author', type: 'reference', required: true, localized: false, unique: false, validation: { link_type: 'Author' }, appearance: 'entry-picker', default_value: null, help_text: 'Post author' },
      { id: 'publishDate', name: 'Publish Date', type: 'date', required: false, localized: false, unique: false, validation: null, appearance: 'date-picker', default_value: null, help_text: 'Publication date' },
      { id: 'tags', name: 'Tags', type: 'array', required: false, localized: false, unique: false, validation: null, appearance: 'tag-input', default_value: [], help_text: 'Content tags' }
    ],
    entries_count: 45,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    icon: 'FileText',
    color: '#6366F1'
  },
  {
    id: '2',
    name: 'Page',
    description: 'Static pages with flexible sections',
    display_field: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'text', required: true, localized: true, unique: false, validation: null, appearance: 'single-line', default_value: '', help_text: '' },
      { id: 'slug', name: 'Slug', type: 'text', required: true, localized: false, unique: true, validation: null, appearance: 'slug', default_value: '', help_text: '' },
      { id: 'sections', name: 'Sections', type: 'array', required: false, localized: true, unique: false, validation: null, appearance: 'modular-content', default_value: [], help_text: '' },
      { id: 'seo', name: 'SEO', type: 'json', required: false, localized: true, unique: false, validation: null, appearance: 'object', default_value: {}, help_text: '' }
    ],
    entries_count: 28,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
    icon: 'Layout',
    color: '#EC4899'
  },
  {
    id: '3',
    name: 'Campaign',
    description: 'Marketing campaigns and promotions',
    display_field: 'name',
    fields: [
      { id: 'name', name: 'Campaign Name', type: 'text', required: true, localized: true, unique: false, validation: null, appearance: 'single-line', default_value: '', help_text: '' },
      { id: 'banner', name: 'Banner', type: 'media', required: true, localized: true, unique: false, validation: null, appearance: 'asset-picker', default_value: null, help_text: '' },
      { id: 'startDate', name: 'Start Date', type: 'date', required: true, localized: false, unique: false, validation: null, appearance: 'date-picker', default_value: null, help_text: '' },
      { id: 'endDate', name: 'End Date', type: 'date', required: true, localized: false, unique: false, validation: null, appearance: 'date-picker', default_value: null, help_text: '' },
      { id: 'cta', name: 'Call to Action', type: 'json', required: false, localized: true, unique: false, validation: null, appearance: 'object', default_value: {}, help_text: '' }
    ],
    entries_count: 12,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    icon: 'Zap',
    color: '#10B981'
  },
  {
    id: '4',
    name: 'Press Release',
    description: 'Official press releases and announcements',
    display_field: 'headline',
    fields: [
      { id: 'headline', name: 'Headline', type: 'text', required: true, localized: true, unique: false, validation: null, appearance: 'single-line', default_value: '', help_text: '' },
      { id: 'content', name: 'Content', type: 'richtext', required: true, localized: true, unique: false, validation: null, appearance: 'rich-text', default_value: '', help_text: '' },
      { id: 'releaseDate', name: 'Release Date', type: 'date', required: true, localized: false, unique: false, validation: null, appearance: 'date-picker', default_value: null, help_text: '' }
    ],
    entries_count: 8,
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    icon: 'Send',
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Author',
    description: 'Content authors and contributors',
    display_field: 'name',
    fields: [
      { id: 'name', name: 'Full Name', type: 'text', required: true, localized: false, unique: false, validation: null, appearance: 'single-line', default_value: '', help_text: '' },
      { id: 'bio', name: 'Biography', type: 'richtext', required: false, localized: true, unique: false, validation: null, appearance: 'rich-text', default_value: '', help_text: '' },
      { id: 'avatar', name: 'Avatar', type: 'media', required: false, localized: false, unique: false, validation: null, appearance: 'asset-picker', default_value: null, help_text: '' },
      { id: 'social', name: 'Social Links', type: 'json', required: false, localized: false, unique: false, validation: null, appearance: 'object', default_value: {}, help_text: '' }
    ],
    entries_count: 15,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    icon: 'User',
    color: '#8B5CF6'
  }
]

const mockAssets: MediaAsset[] = [
  {
    id: '1',
    filename: 'hero-banner.jpg',
    title: 'Homepage Hero Banner',
    description: 'Main banner image for the homepage',
    content_type: 'image/jpeg',
    asset_type: 'image',
    size_bytes: 2456789,
    width: 1920,
    height: 1080,
    url: '/images/hero-banner.jpg',
    thumbnail_url: '/images/hero-banner-thumb.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    uploaded_by: 'designer@company.com',
    tags: ['hero', 'homepage', 'banner'],
    metadata: { photographer: 'John Doe', copyright: '2024 Company Inc.' },
    locales: [
      { locale: 'en-US', title: 'Homepage Hero Banner', description: 'Main banner for homepage' },
      { locale: 'es-ES', title: 'Banner Principal', description: 'Banner principal de la página' }
    ],
    used_in: ['1', '3']
  },
  {
    id: '2',
    filename: 'product-demo.mp4',
    title: 'Product Demo Video',
    description: 'Product demonstration video',
    content_type: 'video/mp4',
    asset_type: 'video',
    size_bytes: 45678901,
    width: 1920,
    height: 1080,
    duration: 180,
    url: '/videos/product-demo.mp4',
    thumbnail_url: '/videos/product-demo-thumb.jpg',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    uploaded_by: 'video@company.com',
    tags: ['product', 'demo', 'video'],
    metadata: {},
    locales: [{ locale: 'en-US', title: 'Product Demo', description: 'Demo video' }],
    used_in: ['5']
  },
  {
    id: '3',
    filename: 'team-photo.png',
    title: 'Team Photo 2024',
    description: 'Company team photo',
    content_type: 'image/png',
    asset_type: 'image',
    size_bytes: 3456789,
    width: 2400,
    height: 1600,
    url: '/images/team-photo.png',
    thumbnail_url: '/images/team-photo-thumb.png',
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
    uploaded_by: 'hr@company.com',
    tags: ['team', 'company', 'about'],
    metadata: {},
    locales: [{ locale: 'en-US', title: 'Team Photo', description: 'Our team' }],
    used_in: ['3']
  },
  {
    id: '4',
    filename: 'brand-guidelines.pdf',
    title: 'Brand Guidelines 2024',
    description: 'Official brand guidelines document',
    content_type: 'application/pdf',
    asset_type: 'document',
    size_bytes: 8901234,
    url: '/docs/brand-guidelines.pdf',
    thumbnail_url: null,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    uploaded_by: 'design@company.com',
    tags: ['brand', 'guidelines', 'document'],
    metadata: { version: '2.0', pages: '45' },
    locales: [{ locale: 'en-US', title: 'Brand Guidelines', description: 'Brand identity document' }],
    used_in: []
  },
  {
    id: '5',
    filename: 'podcast-episode.mp3',
    title: 'Podcast Episode 42',
    description: 'Latest podcast episode',
    content_type: 'audio/mpeg',
    asset_type: 'audio',
    size_bytes: 34567890,
    duration: 2400,
    url: '/audio/podcast-42.mp3',
    thumbnail_url: null,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    uploaded_by: 'podcast@company.com',
    tags: ['podcast', 'audio', 'episode'],
    metadata: { episode: '42', season: '3' },
    locales: [{ locale: 'en-US', title: 'Episode 42', description: 'Latest episode' }],
    used_in: []
  }
]

const mockLocales: Locale[] = [
  { id: '1', code: 'en-US', name: 'English (US)', native_name: 'English', status: 'active', is_default: true, fallback_code: null, entries_count: 156, completion_percentage: 100, direction: 'ltr' },
  { id: '2', code: 'es-ES', name: 'Spanish', native_name: 'Español', status: 'active', is_default: false, fallback_code: 'en-US', entries_count: 142, completion_percentage: 91, direction: 'ltr' },
  { id: '3', code: 'fr-FR', name: 'French', native_name: 'Français', status: 'active', is_default: false, fallback_code: 'en-US', entries_count: 128, completion_percentage: 82, direction: 'ltr' },
  { id: '4', code: 'de-DE', name: 'German', native_name: 'Deutsch', status: 'active', is_default: false, fallback_code: 'en-US', entries_count: 98, completion_percentage: 63, direction: 'ltr' },
  { id: '5', code: 'ja-JP', name: 'Japanese', native_name: '日本語', status: 'active', is_default: false, fallback_code: 'en-US', entries_count: 76, completion_percentage: 49, direction: 'ltr' },
  { id: '6', code: 'ar-SA', name: 'Arabic', native_name: 'العربية', status: 'inactive', is_default: false, fallback_code: 'en-US', entries_count: 0, completion_percentage: 0, direction: 'rtl' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: EntryStatus): string => {
  const colors: Record<EntryStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    changed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    published: 'bg-green-100 text-green-800 border-green-200',
    archived: 'bg-red-100 text-red-800 border-red-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colors[status]
}

const getAssetTypeColor = (type: AssetType): string => {
  const colors: Record<AssetType, string> = {
    image: 'bg-purple-100 text-purple-800',
    video: 'bg-pink-100 text-pink-800',
    audio: 'bg-orange-100 text-orange-800',
    document: 'bg-blue-100 text-blue-800',
    archive: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return colors[type]
}

const getFieldTypeIcon = (type: FieldType) => {
  const icons: Record<FieldType, React.ReactNode> = {
    text: <Type className="w-4 h-4" />,
    richtext: <AlignLeft className="w-4 h-4" />,
    number: <Hash className="w-4 h-4" />,
    boolean: <ToggleLeft className="w-4 h-4" />,
    date: <Calendar className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    media: <ImageIcon className="w-4 h-4" />,
    reference: <Link2 className="w-4 h-4" />,
    json: <FileCode className="w-4 h-4" />,
    array: <Boxes className="w-4 h-4" />,
    link: <ExternalLink className="w-4 h-4" />
  }
  return icons[type]
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA
// ============================================================================

const mockContentAIInsights = [
  { id: '1', type: 'success' as const, title: 'Content Performance', description: 'Published content engagement up 28% this week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'SEO Optimization', description: '15 entries could benefit from keyword optimization.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'SEO' },
  { id: '3', type: 'warning' as const, title: 'Draft Backlog', description: '23 drafts pending review for over 7 days.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Workflow' },
]

const mockContentCollaborators = [
  { id: '1', name: 'Content Manager', avatar: '/avatars/content.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Editor', avatar: '/avatars/editor.jpg', status: 'online' as const, role: 'Editor' },
  { id: '3', name: 'Designer', avatar: '/avatars/design.jpg', status: 'away' as const, role: 'Designer' },
]

const mockContentPredictions = [
  { id: '1', title: 'Publishing Velocity', prediction: 'On track to publish 40 entries this month', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Content Gaps', prediction: 'Tutorial content category needs 8 more entries', confidence: 90, trend: 'stable' as const, impact: 'medium' as const },
]

const mockContentActivities = [
  { id: '1', user: 'Editor', action: 'Published', target: 'Getting Started Guide v2', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Manager', action: 'Scheduled', target: '5 blog posts for next week', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Archived', target: '12 outdated entries', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions will be defined inside component to use state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContentStudioClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<ContentEntry | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false)
  const [showBulkPublishDialog, setShowBulkPublishDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Quick actions defined inside component to use state setters
  const contentQuickActions = [
    { id: '1', label: 'New Entry', icon: 'plus', action: () => setShowNewEntryDialog(true), variant: 'default' as const },
    { id: '2', label: 'Bulk Publish', icon: 'upload', action: () => setShowBulkPublishDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export All', icon: 'download', action: () => setShowExportDialog(true), variant: 'outline' as const },
  ]

  // Dashboard stats
  const stats = useMemo(() => ({
    totalEntries: mockEntries.length,
    published: mockEntries.filter(e => e.status === 'published').length,
    drafts: mockEntries.filter(e => e.status === 'draft').length,
    scheduled: mockEntries.filter(e => e.status === 'scheduled').length,
    contentTypes: mockContentTypes.length,
    assets: mockAssets.length,
    totalAssets: mockAssets.length,
    locales: mockLocales.filter(l => l.status === 'active').length,
    avgLocalization: Math.round(mockLocales.reduce((sum, l) => sum + l.completion_percentage, 0) / mockLocales.length),
    apiCalls: '45.2K'
  }), [])

  // Filtered data
  const filteredEntries = useMemo(() => {
    return mockEntries.filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.slug.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset =>
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Handlers
  const handleCreateContent = () => {
    toast.info('Create Content', {
      description: 'Opening content editor...'
    })
  }

  const handlePublishContent = (contentId: string) => {
    toast.success('Content published', {
      description: 'Content is now live'
    })
  }

  const handleScheduleContent = (contentId: string) => {
    toast.info('Schedule Content', {
      description: 'Opening scheduler...'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Content Studio</h1>
                <p className="text-purple-200 mt-1">Contentful-level headless CMS</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-white text-purple-700 hover:bg-gray-100">
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Entries', value: stats.totalEntries, icon: FileText, color: 'from-purple-500 to-pink-500', change: '+12' },
            { label: 'Published', value: stats.published, icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: '+5' },
            { label: 'Drafts', value: stats.drafts, icon: Edit2, color: 'from-yellow-500 to-orange-500', change: '+3' },
            { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'from-blue-500 to-cyan-500', change: '+1' },
            { label: 'Content Types', value: stats.contentTypes, icon: Boxes, color: 'from-indigo-500 to-purple-500', change: '5' },
            { label: 'Assets', value: stats.assets, icon: ImageIcon, color: 'from-pink-500 to-rose-500', change: '+8' },
            { label: 'Locales', value: stats.locales, icon: Globe, color: 'from-teal-500 to-green-500', change: '5' },
            { label: 'Localization', value: `${stats.avgLocalization}%`, icon: Languages, color: 'from-orange-500 to-red-500', change: '+2%' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg">Content</TabsTrigger>
            <TabsTrigger value="types" className="rounded-lg">Content Types</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg">Media</TabsTrigger>
            <TabsTrigger value="localization" className="rounded-lg">Localization</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Dashboard Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Dashboard</h3>
                  <Badge className="bg-white/20 text-white border-0">Overview</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Monitor your content performance, track publishing activity, and manage your headless CMS from one central hub.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalEntries}</div>
                    <div className="text-xs text-white/70">Total Entries</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.published}</div>
                    <div className="text-xs text-white/70">Published</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.drafts}</div>
                    <div className="text-xs text-white/70">Drafts</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.scheduled}</div>
                    <div className="text-xs text-white/70">Scheduled</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'New Entry', color: 'from-purple-500 to-pink-500' },
                    { icon: Upload, label: 'Upload Media', color: 'from-blue-500 to-cyan-500' },
                    { icon: Boxes, label: 'New Content Type', color: 'from-green-500 to-emerald-500' },
                    { icon: Globe, label: 'Add Locale', color: 'from-orange-500 to-amber-500' },
                    { icon: FileSearch, label: 'Search Content', color: 'from-violet-500 to-purple-500' },
                    { icon: History, label: 'View History', color: 'from-pink-500 to-rose-500' },
                    { icon: Send, label: 'Publish All', color: 'from-teal-500 to-green-500' },
                    { icon: RefreshCw, label: 'Sync Changes', color: 'from-indigo-500 to-blue-500' },
                  ].map((action, idx) => (
                    <button key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Content */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Recent Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockEntries.slice(0, 5).map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{entry.title}</p>
                            <p className="text-xs text-gray-500">{entry.content_type_name} · v{entry.version}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(entry.updated_at)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {entry.locales_completed.slice(0, 3).map(locale => (
                              <span key={locale} className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                {locale.split('-')[0]}
                              </span>
                            ))}
                            {entry.locales_completed.length > 3 && (
                              <span className="text-xs text-gray-500">+{entry.locales_completed.length - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Types Overview */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-purple-600" />
                    Content Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockContentTypes.map(type => (
                      <div
                        key={type.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setSelectedContentType(type)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${type.color}20` }}
                          >
                            <FileText className="w-4 h-4" style={{ color: type.color }} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{type.name}</span>
                        </div>
                        <Badge variant="outline">{type.entries_count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Localization Progress */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Localization Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {mockLocales.filter(l => l.status === 'active').map(locale => (
                    <div key={locale.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{locale.code === 'ja-JP' ? '🇯🇵' : locale.code === 'de-DE' ? '🇩🇪' : locale.code === 'fr-FR' ? '🇫🇷' : locale.code === 'es-ES' ? '🇪🇸' : '🇺🇸'}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{locale.code.split('-')[0].toUpperCase()}</span>
                        </div>
                        {locale.is_default && <Badge className="bg-purple-100 text-purple-800 text-xs">Default</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{locale.native_name}</p>
                      <Progress value={locale.completion_percentage} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{locale.completion_percentage}% · {locale.entries_count} entries</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            {/* Content Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Entries</h3>
                  <Badge className="bg-white/20 text-white border-0">{filteredEntries.length} Items</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Browse, search, and manage all your content entries. Filter by status, content type, or tags to find what you need.
                </p>
              </div>
            </div>

            {/* Content Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  Content Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'New Entry', color: 'from-indigo-500 to-violet-500' },
                    { icon: Edit2, label: 'Edit Selected', color: 'from-blue-500 to-cyan-500' },
                    { icon: Copy, label: 'Duplicate', color: 'from-green-500 to-emerald-500' },
                    { icon: Archive, label: 'Archive', color: 'from-orange-500 to-amber-500' },
                    { icon: Send, label: 'Publish', color: 'from-violet-500 to-purple-500' },
                    { icon: Languages, label: 'Translate', color: 'from-pink-500 to-rose-500' },
                    { icon: Tags, label: 'Manage Tags', color: 'from-teal-500 to-green-500' },
                    { icon: Download, label: 'Export', color: 'from-gray-500 to-slate-500' },
                  ].map((action, idx) => (
                    <button key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as EntryStatus | 'all')}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="changed">Changed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredEntries.map(entry => (
                <Card
                  key={entry.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                        <Badge variant="outline">{entry.content_type_name}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{entry.title}</h3>
                    <p className="text-sm text-gray-500 font-mono mb-3">/{entry.slug}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>v{entry.version} · {entry.updated_by.split('@')[0]}</span>
                      <span>{formatDate(entry.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-3">
                      {entry.locales_completed.map(locale => (
                        <span key={locale} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {locale.split('-')[0]}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Types Tab */}
          <TabsContent value="types" className="space-y-6 mt-6">
            {/* Content Types Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Boxes className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Models</h3>
                  <Badge className="bg-white/20 text-white border-0">{mockContentTypes.length} Types</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Define and manage your content structure. Create custom content types with flexible fields to model any type of content.
                </p>
              </div>
            </div>

            {/* Content Types Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  Model Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'New Type', color: 'from-emerald-500 to-teal-500' },
                    { icon: Copy, label: 'Clone Type', color: 'from-blue-500 to-cyan-500' },
                    { icon: GitBranch, label: 'Add Field', color: 'from-green-500 to-emerald-500' },
                    { icon: Link2, label: 'Add Reference', color: 'from-orange-500 to-amber-500' },
                    { icon: Eye, label: 'Preview', color: 'from-violet-500 to-purple-500' },
                    { icon: Download, label: 'Export Schema', color: 'from-pink-500 to-rose-500' },
                    { icon: Upload, label: 'Import Schema', color: 'from-teal-500 to-green-500' },
                    { icon: BookOpen, label: 'Documentation', color: 'from-gray-500 to-slate-500' },
                  ].map((action, idx) => (
                    <button key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Content Models</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Content Type
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockContentTypes.map(type => (
                <Card
                  key={type.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedContentType(type)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <FileText className="w-6 h-6" style={{ color: type.color }} />
                      </div>
                      <Badge variant="outline">{type.entries_count} entries</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.fields.slice(0, 4).map(field => (
                        <div key={field.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {getFieldTypeIcon(field.type)}
                          <span className="text-gray-600 dark:text-gray-400">{field.name}</span>
                        </div>
                      ))}
                      {type.fields.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500">
                          +{type.fields.length - 4}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6 mt-6">
            {/* Media Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <ImageIcon className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Media Library</h3>
                  <Badge className="bg-white/20 text-white border-0">{mockAssets.length} Assets</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Upload, organize, and manage all your media assets. Support for images, videos, audio, and documents.
                </p>
              </div>
            </div>

            {/* Media Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-600" />
                  Media Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Upload, label: 'Upload Files', color: 'from-pink-500 to-rose-500' },
                    { icon: FolderOpen, label: 'New Folder', color: 'from-blue-500 to-cyan-500' },
                    { icon: Edit2, label: 'Edit Metadata', color: 'from-green-500 to-emerald-500' },
                    { icon: Tags, label: 'Manage Tags', color: 'from-orange-500 to-amber-500' },
                    { icon: Download, label: 'Download', color: 'from-violet-500 to-purple-500' },
                    { icon: Copy, label: 'Copy URL', color: 'from-teal-500 to-green-500' },
                    { icon: Trash2, label: 'Delete', color: 'from-red-500 to-pink-500' },
                    { icon: RefreshCw, label: 'Reprocess', color: 'from-gray-500 to-slate-500' },
                  ].map((action, idx) => (
                    <button key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Assets
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <Card
                  key={asset.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800 overflow-hidden"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    {asset.asset_type === 'image' ? <ImageIcon className="w-12 h-12 text-gray-400" /> :
                     asset.asset_type === 'video' ? <Film className="w-12 h-12 text-gray-400" /> :
                     asset.asset_type === 'audio' ? <Music className="w-12 h-12 text-gray-400" /> :
                     <FileText className="w-12 h-12 text-gray-400" />}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getAssetTypeColor(asset.asset_type)}>{asset.asset_type}</Badge>
                      <span className="text-xs text-gray-500">{formatBytes(asset.size_bytes)}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{asset.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{asset.filename}</p>
                    {asset.width && asset.height && (
                      <p className="text-xs text-gray-400 mt-1">{asset.width} × {asset.height}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6 mt-6">
            {/* Localization Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Localization</h3>
                  <Badge className="bg-white/20 text-white border-0">{mockLocales.length} Locales</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Manage translations and localized content. Track completion progress and ensure global readiness.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockLocales.filter(l => l.status === 'active').length}</div>
                    <div className="text-xs text-white/70">Active Locales</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.avgLocalization}%</div>
                    <div className="text-xs text-white/70">Avg Completion</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">LTR/RTL</div>
                    <div className="text-xs text-white/70">Directions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-xs text-white/70">Fallbacks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Localization Quick Actions */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Localization Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'Add Locale', color: 'from-blue-500 to-cyan-500' },
                    { icon: Languages, label: 'Auto Translate', color: 'from-green-500 to-emerald-500' },
                    { icon: Target, label: 'Set Fallback', color: 'from-orange-500 to-amber-500' },
                    { icon: Activity, label: 'Track Progress', color: 'from-violet-500 to-purple-500' },
                    { icon: Download, label: 'Export XLIFF', color: 'from-pink-500 to-rose-500' },
                    { icon: Upload, label: 'Import XLIFF', color: 'from-teal-500 to-green-500' },
                    { icon: CheckCircle, label: 'Validate', color: 'from-emerald-500 to-green-500' },
                    { icon: RefreshCw, label: 'Sync All', color: 'from-gray-500 to-slate-500' },
                  ].map((action, idx) => (
                    <button key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Locales</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Locale
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockLocales.map(locale => (
                <Card key={locale.id} className="border-0 shadow-sm dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {locale.code === 'ja-JP' ? '🇯🇵' : locale.code === 'de-DE' ? '🇩🇪' : locale.code === 'fr-FR' ? '🇫🇷' : locale.code === 'es-ES' ? '🇪🇸' : locale.code === 'ar-SA' ? '🇸🇦' : '🇺🇸'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{locale.name}</h3>
                          <p className="text-sm text-gray-500">{locale.native_name}</p>
                        </div>
                      </div>
                      <Badge className={locale.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {locale.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Locale Code</span>
                        <code className="font-mono text-gray-900 dark:text-white">{locale.code}</code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Direction</span>
                        <span className="text-gray-900 dark:text-white uppercase">{locale.direction}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Entries</span>
                        <span className="text-gray-900 dark:text-white">{locale.entries_count}</span>
                      </div>
                      {locale.fallback_code && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Fallback</span>
                          <code className="font-mono text-gray-900 dark:text-white">{locale.fallback_code}</code>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion</span>
                        <span>{locale.completion_percentage}%</span>
                      </div>
                      <Progress value={locale.completion_percentage} className="h-2" />
                    </div>

                    {locale.is_default && (
                      <div className="mt-4 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                        <p className="text-xs text-purple-700 dark:text-purple-300">Default locale for this space</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs with Sidebar */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Content Studio Settings</h3>
                  <Badge className="bg-purple-500/20 text-purple-300 border-0">Contentful Level</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your content management system settings, API access, localization, webhooks, and security options.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.contentTypes}</div>
                    <div className="text-xs text-white/70">Content Types</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalAssets}</div>
                    <div className="text-xs text-white/70">Media Assets</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.locales}</div>
                    <div className="text-xs text-white/70">Locales</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.apiCalls}</div>
                    <div className="text-xs text-white/70">API Calls/Day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm dark:bg-gray-800">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                        { id: 'api', label: 'API Access', icon: Database, description: 'Keys & endpoints' },
                        { id: 'webhooks', label: 'Webhooks', icon: Zap, description: 'Event triggers' },
                        { id: 'localization', label: 'Localization', icon: Globe, description: 'Languages' },
                        { id: 'security', label: 'Security', icon: Shield, description: 'Access control' },
                        { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-l-4 border-purple-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-purple-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
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
                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-purple-600" />
                          Content Settings
                        </CardTitle>
                        <CardDescription>Configure content management preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-save Drafts</p>
                            <p className="text-sm text-gray-500">Automatically save drafts every 30 seconds</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Version History</p>
                            <p className="text-sm text-gray-500">Keep history of all content changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Review</p>
                            <p className="text-sm text-gray-500">Require approval before publishing</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Rich Text Editor</p>
                            <p className="text-sm text-gray-500">Enable advanced text formatting</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Edit className="w-5 h-5 text-blue-600" />
                          Editorial Workflow
                        </CardTitle>
                        <CardDescription>Configure content review process</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Multi-stage Review</p>
                            <p className="text-sm text-gray-500">Enable draft → review → publish workflow</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Scheduled Publishing</p>
                            <p className="text-sm text-gray-500">Allow scheduling content for future publish</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* API Access */}
                {settingsTab === 'api' && (
                  <>
                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-purple-600" />
                          API Credentials
                        </CardTitle>
                        <CardDescription>Manage your API keys and endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Space ID</p>
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                            space_Qx7K9mN3pL2wE5
                          </code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Delivery API Key</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded flex-1">
                              •••••••••••••••••••••
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText('cs_delivery_xxxxxxxxxxxxx'); toast.success('Delivery API Key Copied', { description: 'Key copied to clipboard' }); }}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Management API Key</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded flex-1">
                              •••••••••••••••••••••
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText('cs_management_xxxxxxxxxxxxx'); toast.success('Management API Key Copied', { description: 'Key copied to clipboard' }); }}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate Keys
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            API Docs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-green-600" />
                          API Endpoints
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Delivery API</p>
                          <code className="text-sm font-mono">https://cdn.contentful.com</code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Content Management API</p>
                          <code className="text-sm font-mono">https://api.contentful.com</code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">Preview API</p>
                          <code className="text-sm font-mono">https://preview.contentful.com</code>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <p className="text-sm text-gray-500 mb-1">GraphQL API</p>
                          <code className="text-sm font-mono">https://graphql.contentful.com</code>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Webhooks */}
                {settingsTab === 'webhooks' && (
                  <Card className="border-0 shadow-sm dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Webhooks
                      </CardTitle>
                      <CardDescription>Configure event triggers for external integrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-2">No webhooks configured</p>
                        <p className="text-sm mb-4">Webhooks notify external systems when content changes</p>
                        <Button variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Localization */}
                {settingsTab === 'localization' && (
                  <Card className="border-0 shadow-sm dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        Localization Settings
                      </CardTitle>
                      <CardDescription>Configure supported languages and locales</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇺🇸</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">English (US)</p>
                            <p className="text-sm text-gray-500">Default locale</p>
                          </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">Default</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇪🇸</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Spanish</p>
                            <p className="text-sm text-gray-500">Enabled</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇫🇷</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">French</p>
                            <p className="text-sm text-gray-500">Enabled</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🇩🇪</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">German</p>
                            <p className="text-sm text-gray-500">Disabled</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Locale
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Security */}
                {settingsTab === 'security' && (
                  <Card className="border-0 shadow-sm dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Configure access control and permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Require 2FA for all users</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
                          <p className="text-sm text-gray-500">Restrict API access by IP</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                          <p className="text-sm text-gray-500">Track all user actions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Content Encryption</p>
                          <p className="text-sm text-gray-500">Encrypt sensitive fields</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-amber-600" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Power user features and configurations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Custom Extensions</p>
                            <p className="text-sm text-gray-500">Enable custom field extensions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">GraphQL Playground</p>
                            <p className="text-sm text-gray-500">Enable GraphQL explorer</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500">Access experimental features</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Content</p>
                            <p className="text-sm text-gray-500">Remove all entries and content types</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Space</p>
                            <p className="text-sm text-gray-500">Reset entire space to defaults</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
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
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
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
            actions={contentQuickActions}
            variant="grid"
          />
        </div>

        {/* Entry Detail Dialog */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Entry Details</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedEntry.status)}>{selectedEntry.status}</Badge>
                    <Badge variant="outline">{selectedEntry.content_type_name}</Badge>
                    <Badge variant="outline">v{selectedEntry.version}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEntry.title}</h3>
                    <p className="text-gray-500 font-mono">/{selectedEntry.slug}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedEntry.created_at)}</p>
                      <p className="text-xs text-gray-500">{selectedEntry.created_by}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedEntry.updated_at)}</p>
                      <p className="text-xs text-gray-500">{selectedEntry.updated_by}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Locales</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.locales_completed.map(locale => (
                        <Badge key={locale} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {locale}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedEntry.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Entry
                    </Button>
                    {selectedEntry.status === 'draft' && (
                      <Button variant="outline" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Content Type Detail Dialog */}
        <Dialog open={!!selectedContentType} onOpenChange={() => setSelectedContentType(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Content Type Details</DialogTitle>
            </DialogHeader>
            {selectedContentType && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedContentType.color}20` }}
                    >
                      <FileText className="w-8 h-8" style={{ color: selectedContentType.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedContentType.name}</h3>
                      <p className="text-gray-500">{selectedContentType.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Entries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContentType.entries_count}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Fields</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContentType.fields.length}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Fields</p>
                    <div className="space-y-2">
                      {selectedContentType.fields.map(field => (
                        <div key={field.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              {getFieldTypeIcon(field.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{field.name}</p>
                              <p className="text-xs text-gray-500">{field.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {field.required && <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>}
                            {field.localized && <Badge className="bg-blue-100 text-blue-800 text-xs">Localized</Badge>}
                            {field.unique && <Badge className="bg-purple-100 text-purple-800 text-xs">Unique</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Content Type
                  </Button>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Asset Detail Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Asset Details</DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4 p-4">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                  {selectedAsset.asset_type === 'image' ? <ImageIcon className="w-16 h-16 text-gray-400" /> :
                   selectedAsset.asset_type === 'video' ? <Film className="w-16 h-16 text-gray-400" /> :
                   selectedAsset.asset_type === 'audio' ? <Music className="w-16 h-16 text-gray-400" /> :
                   <FileText className="w-16 h-16 text-gray-400" />}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getAssetTypeColor(selectedAsset.asset_type)}>{selectedAsset.asset_type}</Badge>
                  <span className="text-sm text-gray-500">{formatBytes(selectedAsset.size_bytes)}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAsset.title}</h3>
                  <p className="text-gray-500 font-mono text-sm">{selectedAsset.filename}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedAsset.width && (
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Dimensions</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedAsset.width} × {selectedAsset.height}</p>
                    </div>
                  )}
                  {selectedAsset.duration && (
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">{Math.floor(selectedAsset.duration / 60)}:{(selectedAsset.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Uploaded</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedAsset.created_at)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Used in</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedAsset.used_in.length} entries</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Entry Dialog */}
        <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Create New Entry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Type</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  {mockContentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <Input placeholder="Enter entry title..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                <Input placeholder="entry-slug" className="font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Locale</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800">
                  {mockLocales.filter(l => l.status === 'active').map(locale => (
                    <option key={locale.id} value={locale.code}>{locale.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewEntryDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
                  toast.success('Entry created', { description: 'New entry has been created successfully' })
                  setShowNewEntryDialog(false)
                }}>
                  Create Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Publish Dialog */}
        <Dialog open={showBulkPublishDialog} onOpenChange={setShowBulkPublishDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-600" />
                Bulk Publish Content
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">Publish Multiple Entries</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">This will publish all selected draft entries. Make sure content has been reviewed.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Entries to Publish</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockEntries.filter(e => e.status === 'draft' || e.status === 'changed').map(entry => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{entry.title}</p>
                        <p className="text-xs text-gray-500">{entry.content_type_name}</p>
                      </div>
                      <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowBulkPublishDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => {
                  toast.success('Content published', { description: 'Selected entries have been published' })
                  setShowBulkPublishDialog(false)
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Selected
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Export Content
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'json', label: 'JSON', description: 'Structured data format' },
                    { id: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
                    { id: 'xml', label: 'XML', description: 'Markup language format' },
                    { id: 'yaml', label: 'YAML', description: 'Human-readable format' },
                  ].map(format => (
                    <label key={format.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input type="radio" name="format" value={format.id} defaultChecked={format.id === 'json'} className="mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{format.label}</p>
                        <p className="text-xs text-gray-500">{format.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Types</label>
                <div className="space-y-2">
                  {mockContentTypes.map(type => (
                    <label key={type.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-gray-900 dark:text-white">{type.name}</span>
                      <Badge variant="outline" className="ml-auto">{type.entries_count}</Badge>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Include</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-gray-700 dark:text-gray-300">Include media assets</span>
                  </label>
                  <label className="flex items-center gap-3 p-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-gray-700 dark:text-gray-300">Include localized content</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                  toast.success('Export started', { description: 'Your export is being prepared for download' })
                  setShowExportDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Start Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
