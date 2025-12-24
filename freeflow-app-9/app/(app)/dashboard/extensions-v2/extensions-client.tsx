'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Puzzle,
  Download,
  Star,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Settings,
  RefreshCw,
  Trash2,
  Edit,
  ExternalLink,
  Eye,
  Code,
  Package,
  Layers,
  Grid3X3,
  List,
  Heart,
  Share2,
  Flag,
  MessageSquare,
  Image,
  Globe,
  Lock,
  Unlock,
  Zap,
  Sparkles,
  Award,
  Verified,
  Store,
  Tag
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Extension {
  id: string
  name: string
  description: string
  longDescription: string
  version: string
  developer: string
  developerVerified: boolean
  category: 'productivity' | 'developer' | 'social' | 'entertainment' | 'utilities' | 'themes' | 'shopping' | 'security'
  status: 'published' | 'pending' | 'rejected' | 'unlisted'
  installStatus: 'installed' | 'not_installed' | 'disabled'
  icon: string
  screenshots: string[]
  rating: number
  reviewCount: number
  installCount: number
  weeklyUsers: number
  size: string
  permissions: string[]
  features: string[]
  lastUpdated: string
  createdAt: string
  website?: string
  supportUrl?: string
  privacyPolicy?: string
  isFeatured: boolean
  isEditorsPick: boolean
  tags: string[]
}

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpful: number
  developerReply?: string
}

interface ExtensionCategory {
  id: string
  name: string
  icon: string
  count: number
  color: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockExtensions: Extension[] = [
  {
    id: '1',
    name: 'Dark Mode Pro',
    description: 'Enable dark mode on any website with one click',
    longDescription: 'Dark Mode Pro automatically converts any website to a beautiful dark theme. Reduce eye strain, save battery, and enjoy a consistent dark experience across the web.',
    version: '3.2.1',
    developer: 'NightOwl Labs',
    developerVerified: true,
    category: 'utilities',
    status: 'published',
    installStatus: 'installed',
    icon: '🌙',
    screenshots: [],
    rating: 4.8,
    reviewCount: 12450,
    installCount: 2500000,
    weeklyUsers: 890000,
    size: '1.2 MB',
    permissions: ['Read and change all your data on websites you visit'],
    features: ['Auto dark mode', 'Custom themes', 'Scheduled switching', 'Site exceptions'],
    lastUpdated: '2024-12-20',
    createdAt: '2022-03-15',
    website: 'https://darkmodepro.io',
    isFeatured: true,
    isEditorsPick: true,
    tags: ['dark mode', 'accessibility', 'themes']
  },
  {
    id: '2',
    name: 'Grammar Guardian',
    description: 'AI-powered grammar and spell checker for better writing',
    longDescription: 'Grammar Guardian uses advanced AI to check your spelling, grammar, and writing style in real-time. Works on Gmail, Docs, social media, and more.',
    version: '5.1.0',
    developer: 'WriteRight Inc',
    developerVerified: true,
    category: 'productivity',
    status: 'published',
    installStatus: 'installed',
    icon: '✍️',
    screenshots: [],
    rating: 4.7,
    reviewCount: 34560,
    installCount: 5800000,
    weeklyUsers: 2100000,
    size: '3.8 MB',
    permissions: ['Read and change all your data on websites you visit', 'Display notifications'],
    features: ['Grammar checking', 'Spell check', 'Style suggestions', 'Tone detector'],
    lastUpdated: '2024-12-22',
    createdAt: '2021-08-10',
    website: 'https://grammarguardian.com',
    isFeatured: true,
    isEditorsPick: false,
    tags: ['writing', 'grammar', 'productivity']
  },
  {
    id: '3',
    name: 'Password Vault',
    description: 'Secure password manager with auto-fill',
    longDescription: 'Password Vault securely stores all your passwords and auto-fills them when needed. Features include password generator, breach alerts, and secure sharing.',
    version: '8.0.2',
    developer: 'SecureKey Technologies',
    developerVerified: true,
    category: 'security',
    status: 'published',
    installStatus: 'not_installed',
    icon: '🔐',
    screenshots: [],
    rating: 4.9,
    reviewCount: 89230,
    installCount: 12000000,
    weeklyUsers: 4500000,
    size: '5.2 MB',
    permissions: ['Read and change all your data on websites you visit', 'Manage your apps'],
    features: ['Password storage', 'Auto-fill', 'Password generator', 'Breach monitoring'],
    lastUpdated: '2024-12-24',
    createdAt: '2019-05-20',
    website: 'https://passwordvault.io',
    isFeatured: true,
    isEditorsPick: true,
    tags: ['security', 'passwords', 'privacy']
  },
  {
    id: '4',
    name: 'Tab Manager Plus',
    description: 'Organize, save, and manage browser tabs efficiently',
    longDescription: 'Tab Manager Plus helps you organize hundreds of tabs with ease. Features include tab groups, session saving, tab search, and memory optimization.',
    version: '2.4.0',
    developer: 'ProductivityTools',
    developerVerified: false,
    category: 'productivity',
    status: 'published',
    installStatus: 'installed',
    icon: '📑',
    screenshots: [],
    rating: 4.5,
    reviewCount: 8920,
    installCount: 890000,
    weeklyUsers: 320000,
    size: '0.8 MB',
    permissions: ['Read your browsing history', 'Manage your tabs'],
    features: ['Tab groups', 'Session save', 'Tab search', 'Memory saver'],
    lastUpdated: '2024-12-18',
    createdAt: '2023-01-10',
    isFeatured: false,
    isEditorsPick: false,
    tags: ['tabs', 'productivity', 'organization']
  },
  {
    id: '5',
    name: 'AdBlock Ultimate',
    description: 'Block ads, trackers, and malware across the web',
    longDescription: 'AdBlock Ultimate removes all types of ads including video ads, banners, and pop-ups. Also blocks trackers and protects against malware.',
    version: '4.8.1',
    developer: 'AdFree Foundation',
    developerVerified: true,
    category: 'security',
    status: 'published',
    installStatus: 'disabled',
    icon: '🛡️',
    screenshots: [],
    rating: 4.6,
    reviewCount: 156780,
    installCount: 25000000,
    weeklyUsers: 8900000,
    size: '2.1 MB',
    permissions: ['Read and change all your data on websites you visit', 'Block content on any page'],
    features: ['Ad blocking', 'Tracker blocking', 'Malware protection', 'Custom filters'],
    lastUpdated: '2024-12-21',
    createdAt: '2018-11-05',
    website: 'https://adblockultimate.org',
    isFeatured: true,
    isEditorsPick: true,
    tags: ['ads', 'privacy', 'security']
  },
  {
    id: '6',
    name: 'Screenshot Master',
    description: 'Capture, annotate, and share screenshots instantly',
    longDescription: 'Screenshot Master lets you capture full pages, visible area, or selected regions. Annotate with arrows, text, and shapes, then share instantly.',
    version: '3.1.0',
    developer: 'CaptureTech',
    developerVerified: true,
    category: 'utilities',
    status: 'published',
    installStatus: 'not_installed',
    icon: '📸',
    screenshots: [],
    rating: 4.4,
    reviewCount: 5670,
    installCount: 450000,
    weeklyUsers: 180000,
    size: '1.5 MB',
    permissions: ['Capture visible content', 'Store data locally'],
    features: ['Full page capture', 'Annotations', 'Cloud sync', 'Quick share'],
    lastUpdated: '2024-12-15',
    createdAt: '2023-06-20',
    isFeatured: false,
    isEditorsPick: false,
    tags: ['screenshot', 'capture', 'productivity']
  },
  {
    id: '7',
    name: 'Video Speed Controller',
    description: 'Control video playback speed on any website',
    longDescription: 'Video Speed Controller lets you speed up, slow down, or skip through videos on any website. Perfect for learning, entertainment, and productivity.',
    version: '1.8.0',
    developer: 'MediaTools',
    developerVerified: false,
    category: 'entertainment',
    status: 'published',
    installStatus: 'not_installed',
    icon: '⏩',
    screenshots: [],
    rating: 4.7,
    reviewCount: 23450,
    installCount: 1200000,
    weeklyUsers: 560000,
    size: '0.3 MB',
    permissions: ['Access video content'],
    features: ['Speed control', 'Keyboard shortcuts', 'Skip silence', 'Loop sections'],
    lastUpdated: '2024-12-10',
    createdAt: '2022-09-15',
    isFeatured: false,
    isEditorsPick: true,
    tags: ['video', 'speed', 'media']
  },
  {
    id: '8',
    name: 'Color Picker Pro',
    description: 'Pick colors from any webpage with precision',
    longDescription: 'Color Picker Pro is the ultimate tool for designers. Pick any color from a webpage, view color palettes, and export in multiple formats.',
    version: '2.0.5',
    developer: 'DesignTools Studio',
    developerVerified: true,
    category: 'developer',
    status: 'published',
    installStatus: 'installed',
    icon: '🎨',
    screenshots: [],
    rating: 4.8,
    reviewCount: 7890,
    installCount: 680000,
    weeklyUsers: 290000,
    size: '0.5 MB',
    permissions: ['Read page content'],
    features: ['Eyedropper', 'Color palettes', 'Format conversion', 'Color history'],
    lastUpdated: '2024-12-19',
    createdAt: '2023-02-28',
    website: 'https://colorpickerpro.dev',
    isFeatured: false,
    isEditorsPick: false,
    tags: ['design', 'colors', 'developer']
  }
]

const mockReviews: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'John D.', rating: 5, title: 'Best dark mode extension!', content: 'Works perfectly on every site I visit. Love the scheduling feature.', createdAt: '2024-12-20', helpful: 234 },
  { id: 'r2', userId: 'u2', userName: 'Sarah M.', rating: 4, title: 'Great but needs improvement', content: 'Overall excellent but sometimes breaks on complex sites.', createdAt: '2024-12-18', helpful: 89, developerReply: 'Thanks for the feedback! We\'re working on better compatibility.' },
  { id: 'r3', userId: 'u3', userName: 'Mike R.', rating: 5, title: 'Life changing!', content: 'My eyes thank me every day. Can\'t browse without it now.', createdAt: '2024-12-15', helpful: 156 }
]

const mockCategories: ExtensionCategory[] = [
  { id: '1', name: 'Productivity', icon: '⚡', count: 2450, color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Developer Tools', icon: '🛠️', count: 1890, color: 'from-purple-500 to-pink-500' },
  { id: '3', name: 'Security', icon: '🔒', count: 980, color: 'from-green-500 to-emerald-500' },
  { id: '4', name: 'Social & Communication', icon: '💬', count: 1560, color: 'from-orange-500 to-amber-500' },
  { id: '5', name: 'Entertainment', icon: '🎮', count: 2100, color: 'from-pink-500 to-rose-500' },
  { id: '6', name: 'Utilities', icon: '🔧', count: 3200, color: 'from-teal-500 to-cyan-500' },
  { id: '7', name: 'Shopping', icon: '🛒', count: 780, color: 'from-indigo-500 to-purple-500' },
  { id: '8', name: 'Themes', icon: '🎨', count: 1450, color: 'from-rose-500 to-pink-500' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCategoryColor = (category: Extension['category']): string => {
  const colors: Record<Extension['category'], string> = {
    productivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    developer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    social: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    entertainment: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    utilities: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    themes: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
    shopping: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    security: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }
  return colors[category]
}

const getInstallStatusColor = (status: Extension['installStatus']): string => {
  const colors: Record<Extension['installStatus'], string> = {
    installed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    not_installed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    disabled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return colors[status]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExtensionsClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Stats calculations
  const stats = useMemo(() => {
    const totalExtensions = mockExtensions.length
    const installedCount = mockExtensions.filter(e => e.installStatus === 'installed').length
    const totalInstalls = mockExtensions.reduce((acc, e) => acc + e.installCount, 0)
    const featuredCount = mockExtensions.filter(e => e.isFeatured).length
    const avgRating = mockExtensions.reduce((acc, e) => acc + e.rating, 0) / totalExtensions
    const totalUsers = mockExtensions.reduce((acc, e) => acc + e.weeklyUsers, 0)
    const editorsPickCount = mockExtensions.filter(e => e.isEditorsPick).length
    const securityExtensions = mockExtensions.filter(e => e.category === 'security').length

    return {
      totalExtensions,
      installedCount,
      totalInstalls,
      featuredCount,
      avgRating,
      totalUsers,
      editorsPickCount,
      securityExtensions
    }
  }, [])

  // Filtered extensions
  const filteredExtensions = useMemo(() => {
    return mockExtensions.filter(ext => {
      const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.developer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || ext.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter])

  const installedExtensions = mockExtensions.filter(e => e.installStatus === 'installed' || e.installStatus === 'disabled')
  const featuredExtensions = mockExtensions.filter(e => e.isFeatured)
  const editorsPickExtensions = mockExtensions.filter(e => e.isEditorsPick)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Extensions</h1>
                <p className="text-sm text-muted-foreground">Chrome Web Store level marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search extensions..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex border rounded-lg">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Submit Extension
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Extensions', value: stats.totalExtensions.toString(), change: 12.5, icon: Puzzle, color: 'from-blue-500 to-cyan-500' },
            { label: 'Installed', value: stats.installedCount.toString(), change: 8.3, icon: Download, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Installs', value: formatNumber(stats.totalInstalls), change: 25.0, icon: Users, color: 'from-purple-500 to-pink-500' },
            { label: 'Featured', value: stats.featuredCount.toString(), change: 5.0, icon: Star, color: 'from-yellow-500 to-orange-500' },
            { label: 'Avg Rating', value: stats.avgRating.toFixed(1), change: 2.5, icon: Award, color: 'from-orange-500 to-amber-500' },
            { label: 'Weekly Users', value: formatNumber(stats.totalUsers), change: 15.0, icon: TrendingUp, color: 'from-teal-500 to-cyan-500' },
            { label: 'Editor\'s Pick', value: stats.editorsPickCount.toString(), change: 10.0, icon: Verified, color: 'from-indigo-500 to-purple-500' },
            { label: 'Security', value: stats.securityExtensions.toString(), change: 8.0, icon: Shield, color: 'from-rose-500 to-pink-500' }
          ].map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="discover" className="gap-2">
              <Store className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="installed" className="gap-2">
              <Download className="w-4 h-4" />
              Installed ({installedExtensions.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              <Star className="w-4 h-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="developer" className="gap-2">
              <Code className="w-4 h-4" />
              Developer
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All
              </Button>
              {mockCategories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={categoryFilter === cat.name.toLowerCase().replace(' & ', '_').replace(' ', '_') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.name.toLowerCase().replace(' & ', '_').replace(' ', '_'))}
                  className="gap-1"
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Editor's Picks */}
            {editorsPickExtensions.length > 0 && categoryFilter === 'all' && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Verified className="w-5 h-5 text-blue-500" />
                  Editor's Picks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {editorsPickExtensions.map((ext) => (
                    <Card key={ext.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedExtension(ext)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl">
                            {ext.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <h3 className="font-semibold truncate">{ext.name}</h3>
                              {ext.developerVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{ext.developer}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ext.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{ext.rating}</span>
                            <span className="text-xs text-muted-foreground">({formatNumber(ext.reviewCount)})</span>
                          </div>
                          <Badge className={getInstallStatusColor(ext.installStatus)}>{ext.installStatus.replace('_', ' ')}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Extensions */}
            <div>
              <h2 className="text-xl font-bold mb-4">All Extensions</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                {filteredExtensions.map((ext) => (
                  <Card key={ext.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedExtension(ext)}>
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                      <div className={`${viewMode === 'grid' ? 'flex items-start gap-3 mb-3' : 'flex items-center gap-3 flex-1'}`}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                          {ext.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold truncate">{ext.name}</h3>
                            {ext.developerVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                            {ext.isFeatured && <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{ext.developer}</p>
                          {viewMode === 'list' && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{ext.description}</p>}
                        </div>
                      </div>
                      {viewMode === 'grid' && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ext.description}</p>
                      )}
                      <div className={`${viewMode === 'grid' ? '' : 'flex items-center gap-4'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getCategoryColor(ext.category)}>{ext.category}</Badge>
                          <span className="text-xs text-muted-foreground">{formatNumber(ext.installCount)} users</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{ext.rating}</span>
                          </div>
                          {ext.installStatus === 'installed' ? (
                            <Button size="sm" variant="outline">Manage</Button>
                          ) : (
                            <Button size="sm">Add</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Installed Tab */}
          <TabsContent value="installed" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Installed Extensions</h2>
                <p className="text-sm text-muted-foreground">Manage your installed extensions</p>
              </div>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Check for Updates
              </Button>
            </div>

            <div className="grid gap-4">
              {installedExtensions.map((ext) => (
                <Card key={ext.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl">
                          {ext.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ext.name}</h3>
                            {ext.developerVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                            <Badge className={getInstallStatusColor(ext.installStatus)}>{ext.installStatus}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{ext.developer} • v{ext.version}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ext.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{ext.size}</p>
                          <p className="text-xs text-muted-foreground">Updated {ext.lastUpdated}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={ext.installStatus === 'installed'} />
                          <Button variant="ghost" size="icon" onClick={() => setSelectedExtension(ext)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {ext.permissions.map((perm, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{perm}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredExtensions.map((ext) => (
                <Card key={ext.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedExtension(ext)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-4xl">
                        {ext.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{ext.name}</h3>
                          {ext.developerVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                          {ext.isEditorsPick && <Badge className="bg-blue-100 text-blue-800">Editor's Pick</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{ext.developer}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{ext.description}</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-xl font-bold">{formatNumber(ext.installCount)}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <p className="text-xl font-bold">{ext.rating}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatNumber(ext.reviewCount)} reviews</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-xl font-bold">{formatNumber(ext.weeklyUsers)}</p>
                        <p className="text-xs text-muted-foreground">Weekly</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {ext.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
                        ))}
                      </div>
                      <Button>
                        {ext.installStatus === 'installed' ? 'Manage' : 'Add to Chrome'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCategories.map((cat) => (
                <Card key={cat.id} className="cursor-pointer hover:shadow-md transition-shadow group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.count.toLocaleString()} extensions</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Developer Tab */}
          <TabsContent value="developer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Developer Dashboard
                  </CardTitle>
                  <CardDescription>Manage your published extensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Published Extensions</p>
                  </div>
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Extension
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Resources for extension developers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <span className="font-medium">Documentation</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <span className="font-medium">API Reference</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <span className="font-medium">Sample Extensions</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer">
                    <span className="font-medium">Developer Forum</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Extension Settings</CardTitle>
                <CardDescription>Configure extension behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-update extensions</p>
                    <p className="text-sm text-muted-foreground">Automatically install extension updates</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Developer mode</p>
                    <p className="text-sm text-muted-foreground">Enable loading unpacked extensions</p>
                  </div>
                  <Switch checked={false} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Site access warnings</p>
                    <p className="text-sm text-muted-foreground">Show warnings when extensions access sensitive sites</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Extension analytics</p>
                    <p className="text-sm text-muted-foreground">Help improve extensions by sharing usage data</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Extension Detail Dialog */}
      <Dialog open={!!selectedExtension} onOpenChange={() => setSelectedExtension(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedExtension?.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  {selectedExtension?.name}
                  {selectedExtension?.developerVerified && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                </div>
                <p className="text-sm font-normal text-muted-foreground">{selectedExtension?.developer}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedExtension && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(selectedExtension.category)}>{selectedExtension.category}</Badge>
                  <Badge className={getInstallStatusColor(selectedExtension.installStatus)}>{selectedExtension.installStatus.replace('_', ' ')}</Badge>
                  {selectedExtension.isFeatured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                  {selectedExtension.isEditorsPick && <Badge className="bg-blue-100 text-blue-800">Editor's Pick</Badge>}
                </div>

                <p className="text-muted-foreground">{selectedExtension.longDescription}</p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{formatNumber(selectedExtension.installCount)}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <p className="text-2xl font-bold">{selectedExtension.rating}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatNumber(selectedExtension.reviewCount)} reviews</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{formatNumber(selectedExtension.weeklyUsers)}</p>
                    <p className="text-xs text-muted-foreground">Weekly Users</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold">{selectedExtension.size}</p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedExtension.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="font-semibold mb-3">Permissions</h3>
                  <div className="space-y-2">
                    {selectedExtension.permissions.map((perm, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h3 className="font-semibold mb-3">Reviews</h3>
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{review.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{review.userName}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                        </div>
                        <p className="font-medium text-sm mb-1">{review.title}</p>
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                        {review.developerReply && (
                          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs font-medium mb-1">Developer Reply</p>
                            <p className="text-sm">{review.developerReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  {selectedExtension.installStatus === 'installed' ? (
                    <>
                      <Button variant="outline" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Options
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Add to Chrome
                    </Button>
                  )}
                  <Button variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
