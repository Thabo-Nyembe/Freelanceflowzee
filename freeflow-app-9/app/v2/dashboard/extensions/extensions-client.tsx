'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Puzzle,
  Download,
  Star,
  Users,
  Shield,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink,
  Code,
  Package,
  Layers,
  Grid3X3,
  List,
  Share2,
  Flag,
  Globe,
  Lock,
  Sparkles,
  Award,
  Verified,
  Store,
  Key,
  Database,
  Bell,
  BellRing,
  Mail,
  AlertOctagon,
  Copy,
  Archive,
  Layout,
  Gauge,
  Upload,
  History,
  Cpu,
  HardDrive,
  Fingerprint,
  ScanEye,
  Network,
  Unplug,
  Filter,
  Zap,
  RotateCcw,
  Check,
  X
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

// Enhanced Competitive Upgrade Mock Data
const mockExtensionsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Popular Extension', description: 'Analytics Pro became most installed extension this week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Trending' },
  { id: '2', type: 'warning' as const, title: 'Update Available', description: '3 installed extensions have security updates available.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'New Category', description: 'AI & Automation category added with 12 new extensions.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Discovery' },
]

const mockExtensionsCollaborators = [
  { id: '1', name: 'Extensions Lead', avatar: '/avatars/ext.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'online' as const, role: 'Dev' },
  { id: '3', name: 'QA Engineer', avatar: '/avatars/qa.jpg', status: 'away' as const, role: 'QA' },
]

const mockExtensionsPredictions = [
  { id: '1', title: 'Extension Adoption', prediction: 'AI extensions projected to grow 40% next quarter', confidence: 82, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Compatibility', prediction: 'All extensions compatible with next platform version', confidence: 95, trend: 'stable' as const, impact: 'medium' as const },
]

const mockExtensionsActivities = [
  { id: '1', user: 'Admin', action: 'Installed', target: 'Advanced Reporting extension', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Developer', action: 'Updated', target: 'API Connector to v2.1', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Disabled', target: 'deprecated Theme Pack', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// Quick actions are now defined inside the component with useState dialog triggers

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExtensionsClient() {
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [browseDialogOpen, setBrowseDialogOpen] = useState(false)
  const [checkUpdatesDialogOpen, setCheckUpdatesDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)

  // Additional dialog states
  const [submitExtensionDialogOpen, setSubmitExtensionDialogOpen] = useState(false)
  const [createExtensionDialogOpen, setCreateExtensionDialogOpen] = useState(false)
  const [clearCacheDialogOpen, setClearCacheDialogOpen] = useState(false)
  const [exportDataDialogOpen, setExportDataDialogOpen] = useState(false)
  const [selectFolderDialogOpen, setSelectFolderDialogOpen] = useState(false)
  const [packExtensionDialogOpen, setPackExtensionDialogOpen] = useState(false)
  const [regenerateKeyDialogOpen, setRegenerateKeyDialogOpen] = useState(false)
  const [viewDocsDialogOpen, setViewDocsDialogOpen] = useState(false)
  const [exportSettingsDialogOpen, setExportSettingsDialogOpen] = useState(false)
  const [importSettingsDialogOpen, setImportSettingsDialogOpen] = useState(false)
  const [viewHistoryDialogOpen, setViewHistoryDialogOpen] = useState(false)
  const [disableAllDialogOpen, setDisableAllDialogOpen] = useState(false)
  const [removeAllDialogOpen, setRemoveAllDialogOpen] = useState(false)
  const [resetDefaultsDialogOpen, setResetDefaultsDialogOpen] = useState(false)
  const [extensionOptionsDialogOpen, setExtensionOptionsDialogOpen] = useState(false)
  const [removeExtensionDialogOpen, setRemoveExtensionDialogOpen] = useState(false)
  const [shareExtensionDialogOpen, setShareExtensionDialogOpen] = useState(false)
  const [reportExtensionDialogOpen, setReportExtensionDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [extensionToDelete, setExtensionToDelete] = useState<Extension | null>(null)

  // Submit extension form state
  const [submitExtensionName, setSubmitExtensionName] = useState('')
  const [submitExtensionDescription, setSubmitExtensionDescription] = useState('')
  const [submitExtensionCategory, setSubmitExtensionCategory] = useState('')
  const [submitExtensionVersion, setSubmitExtensionVersion] = useState('')
  const [submitExtensionUrl, setSubmitExtensionUrl] = useState('')

  // Report extension form state
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')

  // Extension options form state
  const [optionAutoUpdate, setOptionAutoUpdate] = useState(true)
  const [optionSiteAccess, setOptionSiteAccess] = useState('all')
  const [optionIncognito, setOptionIncognito] = useState(false)

  // Import settings state
  const [importFile, setImportFile] = useState<File | null>(null)

  // Pack extension state
  const [packSourceDir, setPackSourceDir] = useState('')
  const [packPrivateKey, setPackPrivateKey] = useState('')

  // API key visibility
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey] = useState('ext_dev_sk_1234567890abcdef1234567890abcdef')

  // Browse dialog state
  const [browseCategory, setBrowseCategory] = useState('all')
  const [browseSortBy, setBrowseSortBy] = useState('popular')
  const [browseRatingFilter, setBrowseRatingFilter] = useState('any')

  // Check updates dialog state
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const [updateResults, setUpdateResults] = useState<{ name: string; currentVersion: string; newVersion: string; hasUpdate: boolean }[]>([])
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>([])

  // Manage dialog state
  const [manageAction, setManageAction] = useState<'enable' | 'disable' | 'uninstall' | null>(null)
  const [selectedManagedExtensions, setSelectedManagedExtensions] = useState<string[]>([])

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

  // Handlers
  const handleInstallExtension = (extensionName: string) => {
    /* TODO: Implement extension installation logic for ${extensionName} */
  }

  const handleUninstallExtension = (extensionName: string) => {
    if (confirm(`Are you sure you want to uninstall ${extensionName}? This action cannot be undone.`)) {
      /* TODO: Implement extension uninstallation logic */
    }
  }

  const handleEnableExtension = (extensionName: string) => {
    /* TODO: Implement extension enabling logic for ${extensionName} */
  }

  const handleDisableExtension = (extensionName: string) => {
    /* TODO: Implement extension disabling logic for ${extensionName} */
  }

  const handleConfigureExtension = (extensionName: string) => {
    /* TODO: Implement opening extension settings for ${extensionName} */
  }

  // Browse dialog handlers
  const handleBrowseApply = () => {
    setCategoryFilter(browseCategory)
    setBrowseDialogOpen(false)
    toast.success('Filters applied', {
      description: `Showing ${browseCategory === 'all' ? 'all categories' : browseCategory} sorted by ${browseSortBy}`
    })
  }

  // Check updates handlers
  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true)
    setUpdateResults([])
    setSelectedUpdates([])

    // Simulate checking for updates
    setTimeout(() => {
      const results = installedExtensions.map(ext => ({
        name: ext.name,
        currentVersion: ext.version,
        newVersion: Math.random() > 0.5 ? `${parseInt(ext.version.split('.')[0]) + 1}.0.0` : ext.version,
        hasUpdate: Math.random() > 0.5
      }))
      setUpdateResults(results)
      setIsCheckingUpdates(false)
    }, 2000)
  }

  const handleInstallUpdates = () => {
    if (selectedUpdates.length === 0) {
      toast.error('No updates selected', {
        description: 'Please select at least one extension to update'
      })
      return
    }

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Installing ${selectedUpdates.length} update(s)...`,
        success: `Successfully updated ${selectedUpdates.length} extension(s)`,
        error: 'Failed to install updates'
      }
    )
    setCheckUpdatesDialogOpen(false)
    setSelectedUpdates([])
  }

  const toggleUpdateSelection = (name: string) => {
    setSelectedUpdates(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  // Manage extensions handlers
  const handleManageAction = () => {
    if (selectedManagedExtensions.length === 0) {
      toast.error('No extensions selected', {
        description: 'Please select at least one extension to manage'
      })
      return
    }

    const actionText = manageAction === 'enable' ? 'Enabling' : manageAction === 'disable' ? 'Disabling' : 'Uninstalling'
    const successText = manageAction === 'enable' ? 'enabled' : manageAction === 'disable' ? 'disabled' : 'uninstalled'

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: `${actionText} ${selectedManagedExtensions.length} extension(s)...`,
        success: `Successfully ${successText} ${selectedManagedExtensions.length} extension(s)`,
        error: `Failed to ${manageAction} extensions`
      }
    )
    setManageDialogOpen(false)
    setSelectedManagedExtensions([])
    setManageAction(null)
  }

  const toggleManagedExtension = (id: string) => {
    setSelectedManagedExtensions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Submit extension handler
  const handleSubmitExtension = () => {
    if (!submitExtensionName || !submitExtensionDescription || !submitExtensionCategory || !submitExtensionVersion) {
      toast.error('Missing required fields', {
        description: 'Please fill in all required fields'
      })
      return
    }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Submitting extension for review...',
        success: `${submitExtensionName} has been submitted for review`,
        error: 'Failed to submit extension'
      }
    )
    setSubmitExtensionDialogOpen(false)
    setSubmitExtensionName('')
    setSubmitExtensionDescription('')
    setSubmitExtensionCategory('')
    setSubmitExtensionVersion('')
    setSubmitExtensionUrl('')
  }

  // Create extension handler
  const handleCreateExtension = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Creating extension project...',
        success: 'Extension project created successfully',
        error: 'Failed to create extension'
      }
    )
    setCreateExtensionDialogOpen(false)
  }

  // Clear cache handler
  const handleClearCache = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Clearing extension cache...',
        success: 'Extension cache cleared (156 MB freed)',
        error: 'Failed to clear cache'
      }
    )
    setClearCacheDialogOpen(false)
  }

  // Export data handler
  const handleExportData = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Exporting extension data...',
        success: 'Extension data exported to extensions-data.json',
        error: 'Failed to export data'
      }
    )
    setExportDataDialogOpen(false)
  }

  // Select folder handler
  const handleSelectFolder = () => {
    /* TODO: Implement folder selection for loading unpacked extensions */
    setSelectFolderDialogOpen(false)
  }

  // Pack extension handler
  const handlePackExtension = () => {
    if (!packSourceDir) {
      toast.error('Source directory required', {
        description: 'Please specify the extension source directory'
      })
      return
    }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Packing extension...',
        success: 'Extension packed to my-extension.crx',
        error: 'Failed to pack extension'
      }
    )
    setPackExtensionDialogOpen(false)
    setPackSourceDir('')
    setPackPrivateKey('')
  }

  // Regenerate API key handler
  const handleRegenerateKey = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Regenerating API key...',
        success: 'New API key generated successfully',
        error: 'Failed to regenerate key'
      }
    )
    setRegenerateKeyDialogOpen(false)
  }

  // Copy API key handler
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied', {
      description: 'API key has been copied to clipboard'
    })
  }

  // View docs handler
  const handleViewDocs = () => {
    /* TODO: Implement opening developer documentation in a new tab */
    setViewDocsDialogOpen(false)
  }

  // Export settings handler
  const handleExportSettings = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Exporting settings...',
        success: 'Settings exported to extension-settings.json',
        error: 'Failed to export settings'
      }
    )
    setExportSettingsDialogOpen(false)
  }

  // Import settings handler
  const handleImportSettings = () => {
    if (!importFile) {
      toast.error('No file selected', {
        description: 'Please select a settings file to import'
      })
      return
    }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Importing settings...',
        success: 'Settings imported successfully',
        error: 'Failed to import settings'
      }
    )
    setImportSettingsDialogOpen(false)
    setImportFile(null)
  }

  // View history handler
  const handleViewHistory = () => {
    setViewHistoryDialogOpen(true)
  }

  // Disable all extensions handler
  const handleDisableAll = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Disabling all extensions...',
        success: `All ${installedExtensions.length} extensions have been disabled`,
        error: 'Failed to disable extensions'
      }
    )
    setDisableAllDialogOpen(false)
  }

  // Remove all extensions handler
  const handleRemoveAll = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Removing all extensions...',
        success: `All ${installedExtensions.length} extensions have been removed`,
        error: 'Failed to remove extensions'
      }
    )
    setRemoveAllDialogOpen(false)
  }

  // Reset to defaults handler
  const handleResetDefaults = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Resetting to defaults...',
        success: 'All extension settings have been reset to defaults',
        error: 'Failed to reset settings'
      }
    )
    setResetDefaultsDialogOpen(false)
  }

  // Extension options save handler
  const handleSaveExtensionOptions = () => {
    /* TODO: Implement saving extension options to persistent storage */
    setExtensionOptionsDialogOpen(false)
  }

  // Remove single extension handler
  const handleRemoveExtension = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Removing ${selectedExtension?.name}...`,
        success: `${selectedExtension?.name} has been removed`,
        error: 'Failed to remove extension'
      }
    )
    setRemoveExtensionDialogOpen(false)
    setSelectedExtension(null)
  }

  // Share extension handler
  const handleShareExtension = (method: string) => {
    const extensionUrl = `https://extensions.freeflow.app/${selectedExtension?.id || ''}`
    navigator.clipboard.writeText(extensionUrl)
    toast.success('Link copied', {
      description: `Extension link copied to clipboard for sharing via ${method}`
    })
    setShareExtensionDialogOpen(false)
  }

  // Report extension handler
  const handleReportExtension = () => {
    if (!reportReason) {
      toast.error('Reason required', {
        description: 'Please select a reason for reporting'
      })
      return
    }
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Submitting report...',
        success: 'Report submitted. We will review this extension.',
        error: 'Failed to submit report'
      }
    )
    setReportExtensionDialogOpen(false)
    setReportReason('')
    setReportDetails('')
  }

  // Delete extension from installed list handler
  const handleDeleteFromInstalled = (ext: Extension) => {
    setExtensionToDelete(ext)
    setConfirmDeleteDialogOpen(true)
  }

  const confirmDeleteExtension = () => {
    if (extensionToDelete) {
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1500)),
        {
          loading: `Removing ${extensionToDelete.name}...`,
          success: `${extensionToDelete.name} has been removed`,
          error: 'Failed to remove extension'
        }
      )
    }
    setConfirmDeleteDialogOpen(false)
    setExtensionToDelete(null)
  }

  // Quick actions with dialog triggers
  const quickActions = [
    {
      id: '1',
      label: 'Browse All',
      icon: 'grid',
      action: () => setBrowseDialogOpen(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Check Updates',
      icon: 'refresh',
      action: () => {
        setCheckUpdatesDialogOpen(true)
        handleCheckUpdates()
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Manage',
      icon: 'settings',
      action: () => setManageDialogOpen(true),
      variant: 'outline' as const
    },
  ]

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
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white" onClick={() => setSubmitExtensionDialogOpen(true)}>
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
            {/* Discover Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Extension Marketplace</h2>
                  <p className="text-violet-100">VS Code Marketplace-level extensibility</p>
                  <p className="text-violet-200 text-xs mt-1">Curated • Verified • Enterprise-ready</p>
                  <p className="text-violet-200 text-xs mt-1">Auto-updates • Sandboxed • Reviews</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockExtensions.length}</p>
                    <p className="text-violet-200 text-sm">Extensions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockExtensions.filter(e => e.isInstalled).length}</p>
                    <p className="text-violet-200 text-sm">Installed</p>
                  </div>
                </div>
              </div>
            </div>
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
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedExtension(ext); setManageDialogOpen(true); }}>Manage</Button>
                          ) : (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleInstallExtension(ext.name); }}>Add</Button>
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
              <Button variant="outline" className="gap-2" onClick={() => { setCheckUpdatesDialogOpen(true); handleCheckUpdates(); }}>
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
                          <Switch checked={ext.installStatus === 'installed'} onCheckedChange={(checked) => { checked ? handleEnableExtension(ext.name) : handleDisableExtension(ext.name); }} />
                          <Button variant="ghost" size="icon" onClick={() => setSelectedExtension(ext)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteFromInstalled(ext)}>
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
                      <Button onClick={(e) => { e.stopPropagation(); ext.installStatus === 'installed' ? setManageDialogOpen(true) : handleInstallExtension(ext.name); }}>
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
                  <Button className="w-full gap-2" onClick={() => setCreateExtensionDialogOpen(true)}>
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
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => setViewDocsDialogOpen(true)}>
                    <span className="font-medium">Documentation</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => setViewDocsDialogOpen(true)}>
                    <span className="font-medium">API Reference</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => setViewDocsDialogOpen(true)}>
                    <span className="font-medium">Sample Extensions</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => setViewDocsDialogOpen(true)}>
                    <span className="font-medium">Developer Forum</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Extension Settings</h2>
                <p className="text-sm text-gray-500">Configure your extension platform preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'permissions', icon: Shield, label: 'Permissions' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'performance', icon: Gauge, label: 'Performance' },
                        { id: 'developer', icon: Code, label: 'Developer' },
                        { id: 'advanced', icon: Cpu, label: 'Advanced' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
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
                          <Layout className="h-5 w-5" />
                          Display Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select defaultValue="grid">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="compact">Compact View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Extensions Per Page</Label>
                            <Select defaultValue="20">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 extensions</SelectItem>
                                <SelectItem value="20">20 extensions</SelectItem>
                                <SelectItem value="50">50 extensions</SelectItem>
                                <SelectItem value="100">100 extensions</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Ratings</div>
                            <div className="text-sm text-gray-500">Display star ratings on extension cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Install Counts</div>
                            <div className="text-sm text-gray-500">Display user counts on extension cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Verified Badges</div>
                            <div className="text-sm text-gray-500">Display developer verification badges</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="h-5 w-5" />
                          Update Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-update Extensions</div>
                            <div className="text-sm text-gray-500">Automatically install extension updates</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Update Check Frequency</Label>
                          <Select defaultValue="daily">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Every Hour</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Pre-release Updates</div>
                            <div className="text-sm text-gray-500">Receive beta and pre-release updates</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Regional Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Store Region</Label>
                            <Select defaultValue="us">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="eu">Europe</SelectItem>
                                <SelectItem value="asia">Asia Pacific</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Site Access Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Click to Activate</div>
                            <div className="text-sm text-gray-500">Require manual activation on each site</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Site Access Warnings</div>
                            <div className="text-sm text-gray-500">Show warnings when accessing sensitive sites</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Block Extensions on Secure Sites</div>
                            <div className="text-sm text-gray-500">Disable extensions on banking and payment sites</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Site Access</Label>
                          <Select defaultValue="on_click">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_sites">All Sites</SelectItem>
                              <SelectItem value="on_click">On Click Only</SelectItem>
                              <SelectItem value="specific">Specific Sites</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Permission Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Review Permissions on Update</div>
                            <div className="text-sm text-gray-500">Show permission changes when extensions update</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Block High-Risk Permissions</div>
                            <div className="text-sm text-gray-500">Warn before installing extensions with sensitive permissions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Incognito Mode Access</div>
                            <div className="text-sm text-gray-500">Allow extensions to run in incognito mode</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Fingerprint className="h-5 w-5" />
                          Privacy Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Block Data Collection</div>
                            <div className="text-sm text-gray-500">Prevent extensions from collecting browsing data</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Extension Analytics</div>
                            <div className="text-sm text-gray-500">Share anonymous usage data to improve extensions</div>
                          </div>
                          <Switch />
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
                          <Bell className="h-5 w-5" />
                          Extension Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Update Available</div>
                            <div className="text-sm text-gray-500">Notify when extension updates are available</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Permission Changes</div>
                            <div className="text-sm text-gray-500">Alert when extensions request new permissions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Security Alerts</div>
                            <div className="text-sm text-gray-500">Warn about compromised or malicious extensions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Featured Extensions</div>
                            <div className="text-sm text-gray-500">Get notified about editor's picks</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Weekly Store Digest</div>
                            <div className="text-sm text-gray-500">Receive weekly roundup of new extensions</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Developer Updates</div>
                            <div className="text-sm text-gray-500">News about your published extensions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Review Responses</div>
                            <div className="text-sm text-gray-500">When developers reply to your reviews</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BellRing className="h-5 w-5" />
                          Push Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <BellRing className="h-6 w-6 text-purple-600" />
                            <div>
                              <div className="font-medium">Push Notifications</div>
                              <div className="text-sm text-gray-500">Enabled for this browser</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Critical Alerts Only</div>
                            <div className="text-sm text-gray-500">Only receive security-related notifications</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Performance Settings */}
                {settingsTab === 'performance' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5" />
                          Resource Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{installedExtensions.length}</div>
                            <div className="text-sm text-gray-500">Active</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">45 MB</div>
                            <div className="text-sm text-gray-500">Memory Used</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">12%</div>
                            <div className="text-sm text-gray-500">CPU Impact</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Lazy Loading</div>
                            <div className="text-sm text-gray-500">Only load extensions when needed</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Suspend Inactive Extensions</div>
                            <div className="text-sm text-gray-500">Pause extensions not used in 30 minutes</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Hardware Acceleration</div>
                            <div className="text-sm text-gray-500">Use GPU for extension rendering</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="h-5 w-5" />
                          Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Extension Storage</span>
                            <span className="text-sm text-gray-500">156 MB of 500 MB</span>
                          </div>
                          <Progress value={31} className="h-2" />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setClearCacheDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear Cache
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setExportDataDialogOpen(true)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Export Data
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Storage Limit</Label>
                          <Select defaultValue="500">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 MB</SelectItem>
                              <SelectItem value="250">250 MB</SelectItem>
                              <SelectItem value="500">500 MB</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5" />
                          Network
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Limit Background Data</div>
                            <div className="text-sm text-gray-500">Restrict extension network usage</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Offline Mode</div>
                            <div className="text-sm text-gray-500">Allow extensions to work without internet</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Developer Settings */}
                {settingsTab === 'developer' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Developer Mode
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-3">
                            <Code className="h-6 w-6 text-yellow-600" />
                            <div>
                              <div className="font-medium">Developer Mode</div>
                              <div className="text-sm text-gray-500">Load unpacked extensions</div>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Load Unpacked</div>
                            <div className="text-sm text-gray-500">Load extensions from local directory</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectFolderDialogOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Select Folder
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Pack Extension</div>
                            <div className="text-sm text-gray-500">Create distributable package</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setPackExtensionDialogOpen(true)}>
                            <Package className="h-4 w-4 mr-2" />
                            Pack
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ScanEye className="h-5 w-5" />
                          Debugging
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Service Worker Logging</div>
                            <div className="text-sm text-gray-500">Log background script activity</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Error Reporting</div>
                            <div className="text-sm text-gray-500">Show extension errors in console</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Network Inspection</div>
                            <div className="text-sm text-gray-500">Monitor extension network requests</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">Developer API Key</div>
                            <Button variant="outline" size="sm" onClick={() => setRegenerateKeyDialogOpen(true)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              {showApiKey ? apiKey : 'ext_dev_•••••••••••••••••••••••'}
                            </code>
                            <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setViewDocsDialogOpen(true)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Documentation
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
                          <Database className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockExtensions.length}</div>
                            <div className="text-sm text-gray-500">Extensions</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{installedExtensions.length}</div>
                            <div className="text-sm text-gray-500">Installed</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">156 MB</div>
                            <div className="text-sm text-gray-500">Storage</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setExportSettingsDialogOpen(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Settings
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setImportSettingsDialogOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Import Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Extension History
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Keep Installation History</div>
                            <div className="text-sm text-gray-500">Track installed and removed extensions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>History Retention</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setViewHistoryDialogOpen(true)}>
                          <History className="h-4 w-4 mr-2" />
                          View Full History
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Disable All Extensions</div>
                            <div className="text-sm text-gray-500">Temporarily disable all installed extensions</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setDisableAllDialogOpen(true)}>
                            <Unplug className="h-4 w-4 mr-2" />
                            Disable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Remove All Extensions</div>
                            <div className="text-sm text-gray-500">Uninstall all extensions permanently</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setRemoveAllDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Reset to Defaults</div>
                            <div className="text-sm text-gray-500">Reset all extension settings to defaults</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setResetDefaultsDialogOpen(true)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
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
              insights={mockExtensionsAIInsights}
              title="Extensions Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockExtensionsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockExtensionsPredictions}
              title="Extension Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockExtensionsActivities}
            title="Extension Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>
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
                      <Button variant="outline" className="flex-1" onClick={() => setExtensionOptionsDialogOpen(true)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Options
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-600" onClick={() => setRemoveExtensionDialogOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1" onClick={() => handleInstallExtension(selectedExtension.name)}>
                      <Download className="w-4 h-4 mr-2" />
                      Add to Chrome
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShareExtensionDialogOpen(true)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setReportExtensionDialogOpen(true)}>
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Browse All Extensions Dialog */}
      <Dialog open={browseDialogOpen} onOpenChange={setBrowseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Browse Extensions
            </DialogTitle>
            <DialogDescription>
              Filter and browse the extension marketplace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={browseCategory} onValueChange={setBrowseCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="developer">Developer Tools</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="social">Social & Communication</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="themes">Themes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={browseSortBy} onValueChange={setBrowseSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="updated">Recently Updated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select value={browseRatingFilter} onValueChange={setBrowseRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Minimum rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  <SelectItem value="3.0">3.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Quick Filters</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrowseCategory('all')
                    setBrowseSortBy('popular')
                    setBrowseRatingFilter('4.5')
                  }}
                >
                  <Star className="w-3 h-3 mr-1" />
                  Top Rated
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrowseCategory('all')
                    setBrowseSortBy('newest')
                    setBrowseRatingFilter('any')
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  New Arrivals
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrowseCategory('security')
                    setBrowseSortBy('popular')
                    setBrowseRatingFilter('any')
                  }}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Security
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBrowseCategory('developer')
                    setBrowseSortBy('popular')
                    setBrowseRatingFilter('any')
                  }}
                >
                  <Code className="w-3 h-3 mr-1" />
                  Developer
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrowseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBrowseApply}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check Updates Dialog */}
      <Dialog open={checkUpdatesDialogOpen} onOpenChange={setCheckUpdatesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Check for Updates
            </DialogTitle>
            <DialogDescription>
              Check and install updates for your installed extensions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isCheckingUpdates ? (
              <div className="flex flex-col items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                <p className="text-sm text-muted-foreground">Checking for updates...</p>
                <Progress value={45} className="w-48 mt-4" />
              </div>
            ) : updateResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">
                      {updateResults.filter(r => r.hasUpdate).length} update(s) available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUpdates.length} selected for update
                    </p>
                  </div>
                  {updateResults.filter(r => r.hasUpdate).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allWithUpdates = updateResults.filter(r => r.hasUpdate).map(r => r.name)
                        setSelectedUpdates(allWithUpdates)
                      }}
                    >
                      Select All
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {updateResults.map((result) => (
                      <div
                        key={result.name}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          result.hasUpdate ? 'bg-muted/30' : 'bg-muted/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {result.hasUpdate && (
                            <Checkbox
                              checked={selectedUpdates.includes(result.name)}
                              onCheckedChange={() => toggleUpdateSelection(result.name)}
                            />
                          )}
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-muted-foreground">
                              v{result.currentVersion}
                              {result.hasUpdate && (
                                <span className="text-green-600 ml-2">
                                  → v{result.newVersion}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div>
                          {result.hasUpdate ? (
                            <Badge className="bg-green-100 text-green-800">Update Available</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Check className="w-3 h-3 mr-1" />
                              Up to date
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Check className="w-12 h-12 text-green-500 mb-4" />
                <p>All extensions are up to date</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckUpdatesDialogOpen(false)}>
              Close
            </Button>
            {!isCheckingUpdates && updateResults.filter(r => r.hasUpdate).length > 0 && (
              <Button onClick={handleInstallUpdates} disabled={selectedUpdates.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Install Selected ({selectedUpdates.length})
              </Button>
            )}
            {!isCheckingUpdates && (
              <Button variant="outline" onClick={handleCheckUpdates}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Check Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Extensions Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Manage Extensions
            </DialogTitle>
            <DialogDescription>
              Enable, disable, or uninstall multiple extensions at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Label className="mr-2">Action:</Label>
              <div className="flex gap-2">
                <Button
                  variant={manageAction === 'enable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setManageAction('enable')}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Enable
                </Button>
                <Button
                  variant={manageAction === 'disable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setManageAction('disable')}
                >
                  <Unplug className="w-4 h-4 mr-1" />
                  Disable
                </Button>
                <Button
                  variant={manageAction === 'uninstall' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setManageAction('uninstall')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Uninstall
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedManagedExtensions.length} of {installedExtensions.length} selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedManagedExtensions(installedExtensions.map(e => e.id))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedManagedExtensions([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {installedExtensions.map((ext) => (
                  <div
                    key={ext.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedManagedExtensions.includes(ext.id)
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                    onClick={() => toggleManagedExtension(ext.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedManagedExtensions.includes(ext.id)}
                        onCheckedChange={() => toggleManagedExtension(ext.id)}
                      />
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-xl">
                        {ext.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ext.name}</p>
                          {ext.developerVerified && (
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ext.developer} • v{ext.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getInstallStatusColor(ext.installStatus)}>
                        {ext.installStatus}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{ext.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {manageAction && selectedManagedExtensions.length > 0 && (
              <div className={`p-4 rounded-lg ${
                manageAction === 'uninstall'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}>
                <p className={`text-sm ${manageAction === 'uninstall' ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>
                  {manageAction === 'enable' && `${selectedManagedExtensions.length} extension(s) will be enabled and become active.`}
                  {manageAction === 'disable' && `${selectedManagedExtensions.length} extension(s) will be disabled but remain installed.`}
                  {manageAction === 'uninstall' && `Warning: ${selectedManagedExtensions.length} extension(s) will be permanently removed.`}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setManageDialogOpen(false)
              setSelectedManagedExtensions([])
              setManageAction(null)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleManageAction}
              disabled={!manageAction || selectedManagedExtensions.length === 0}
              variant={manageAction === 'uninstall' ? 'destructive' : 'default'}
            >
              {manageAction === 'enable' && <Zap className="w-4 h-4 mr-2" />}
              {manageAction === 'disable' && <Unplug className="w-4 h-4 mr-2" />}
              {manageAction === 'uninstall' && <Trash2 className="w-4 h-4 mr-2" />}
              {manageAction ? `${manageAction.charAt(0).toUpperCase() + manageAction.slice(1)} Selected` : 'Select an Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Extension Dialog */}
      <Dialog open={submitExtensionDialogOpen} onOpenChange={setSubmitExtensionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Submit Extension
            </DialogTitle>
            <DialogDescription>
              Submit your extension for review and publication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Extension Name *</Label>
                <Input
                  placeholder="My Awesome Extension"
                  value={submitExtensionName}
                  onChange={(e) => setSubmitExtensionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Version *</Label>
                <Input
                  placeholder="1.0.0"
                  value={submitExtensionVersion}
                  onChange={(e) => setSubmitExtensionVersion(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={submitExtensionCategory} onValueChange={setSubmitExtensionCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="developer">Developer Tools</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="social">Social & Communication</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="themes">Themes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe what your extension does..."
                value={submitExtensionDescription}
                onChange={(e) => setSubmitExtensionDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Website URL (optional)</Label>
              <Input
                placeholder="https://myextension.com"
                value={submitExtensionUrl}
                onChange={(e) => setSubmitExtensionUrl(e.target.value)}
              />
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your extension will be reviewed within 3-5 business days. Make sure it complies with our developer guidelines.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitExtensionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitExtension}>
              <Upload className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Extension Dialog */}
      <Dialog open={createExtensionDialogOpen} onOpenChange={setCreateExtensionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Create New Extension
            </DialogTitle>
            <DialogDescription>
              Set up a new extension project with boilerplate code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input placeholder="my-extension" />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select defaultValue="basic">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Extension</SelectItem>
                  <SelectItem value="popup">Popup Extension</SelectItem>
                  <SelectItem value="content">Content Script</SelectItem>
                  <SelectItem value="background">Background Service</SelectItem>
                  <SelectItem value="full">Full Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Include TypeScript</div>
                <div className="text-sm text-muted-foreground">Add TypeScript configuration</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Include Tests</div>
                <div className="text-sm text-muted-foreground">Add test framework setup</div>
              </div>
              <Switch />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateExtensionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExtension}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Cache Dialog */}
      <Dialog open={clearCacheDialogOpen} onOpenChange={setClearCacheDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Clear Extension Cache
            </DialogTitle>
            <DialogDescription>
              This will clear all cached data for installed extensions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Total cache size:</span>
                <span className="font-medium">156 MB</span>
              </div>
              <div className="flex justify-between">
                <span>Extensions affected:</span>
                <span className="font-medium">{installedExtensions.length}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Clearing cache may temporarily affect extension performance as data is rebuilt.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearCacheDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClearCache}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={exportDataDialogOpen} onOpenChange={setExportDataDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Export Extension Data
            </DialogTitle>
            <DialogDescription>
              Export all extension data and settings to a file
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select defaultValue="json">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="zip">Compressed (.zip)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Include:</Label>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Extension settings</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Local storage data</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Sync data</span>
                <Checkbox />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDataDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Folder Dialog */}
      <Dialog open={selectFolderDialogOpen} onOpenChange={setSelectFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Load Unpacked Extension
            </DialogTitle>
            <DialogDescription>
              Select a folder containing your unpacked extension
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your extension folder here, or click to browse
              </p>
              <Button variant="outline" onClick={() => { /* TODO: Implement file browser for extension folder selection */ }}>Browse Files</Button>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Developer Mode must be enabled to load unpacked extensions. The folder must contain a valid manifest.json file.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSelectFolder}>
              <Upload className="w-4 h-4 mr-2" />
              Load Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pack Extension Dialog */}
      <Dialog open={packExtensionDialogOpen} onOpenChange={setPackExtensionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Pack Extension
            </DialogTitle>
            <DialogDescription>
              Create a distributable .crx package from your extension source
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Extension Source Directory *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="/path/to/extension"
                  value={packSourceDir}
                  onChange={(e) => setPackSourceDir(e.target.value)}
                />
                <Button variant="outline" onClick={() => setPackSourceDir('/Users/dev/my-extension')}>Browse</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Private Key File (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="/path/to/key.pem"
                  value={packPrivateKey}
                  onChange={(e) => setPackPrivateKey(e.target.value)}
                />
                <Button variant="outline" onClick={() => setPackPrivateKey('/Users/dev/extension.pem')}>Browse</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank to generate a new key. Use existing key to update an extension.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackExtensionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePackExtension}>
              <Package className="w-4 h-4 mr-2" />
              Pack Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={regenerateKeyDialogOpen} onOpenChange={setRegenerateKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Regenerate API Key
            </DialogTitle>
            <DialogDescription>
              Create a new API key for your developer account
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Regenerating your API key will invalidate the current key. Any applications using the current key will need to be updated.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenerateKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerateKey}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Documentation Dialog */}
      <Dialog open={viewDocsDialogOpen} onOpenChange={setViewDocsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Developer Resources
            </DialogTitle>
            <DialogDescription>
              Access documentation and resources for extension development
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-muted/30" onClick={handleViewDocs}>
                <CardContent className="p-4">
                  <Code className="w-8 h-8 text-purple-500 mb-2" />
                  <h3 className="font-medium">Getting Started</h3>
                  <p className="text-sm text-muted-foreground">Learn the basics of extension development</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/30" onClick={handleViewDocs}>
                <CardContent className="p-4">
                  <Key className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">API Reference</h3>
                  <p className="text-sm text-muted-foreground">Complete API documentation</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/30" onClick={handleViewDocs}>
                <CardContent className="p-4">
                  <Package className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-medium">Sample Extensions</h3>
                  <p className="text-sm text-muted-foreground">Example code and templates</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-muted/30" onClick={handleViewDocs}>
                <CardContent className="p-4">
                  <Users className="w-8 h-8 text-orange-500 mb-2" />
                  <h3 className="font-medium">Developer Forum</h3>
                  <p className="text-sm text-muted-foreground">Community support and discussions</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDocsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Settings Dialog */}
      <Dialog open={exportSettingsDialogOpen} onOpenChange={setExportSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Settings
            </DialogTitle>
            <DialogDescription>
              Export your extension platform settings to a file
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <Label>What to export:</Label>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Display preferences</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Update settings</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Permission settings</span>
                <Checkbox defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span>Notification preferences</span>
                <Checkbox defaultChecked />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Settings Dialog */}
      <Dialog open={importSettingsDialogOpen} onOpenChange={setImportSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Settings
            </DialogTitle>
            <DialogDescription>
              Import extension platform settings from a file
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your settings file here, or click to browse
              </p>
              <Button variant="outline" onClick={() => setImportFile(new File([], 'settings.json'))}>
                Browse Files
              </Button>
              {importFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {importFile.name}
                </p>
              )}
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Importing settings will overwrite your current preferences.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportSettingsDialogOpen(false); setImportFile(null); }}>
              Cancel
            </Button>
            <Button onClick={handleImportSettings} disabled={!importFile}>
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View History Dialog */}
      <Dialog open={viewHistoryDialogOpen} onOpenChange={setViewHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Extension History
            </DialogTitle>
            <DialogDescription>
              View your extension installation and removal history
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] py-4">
            <div className="space-y-3">
              {[
                { action: 'Installed', extension: 'Dark Mode Pro', date: '2024-12-20', version: '3.2.1' },
                { action: 'Updated', extension: 'Grammar Guardian', date: '2024-12-18', version: '5.1.0' },
                { action: 'Removed', extension: 'Old Tab Manager', date: '2024-12-15', version: '1.0.0' },
                { action: 'Installed', extension: 'Tab Manager Plus', date: '2024-12-10', version: '2.4.0' },
                { action: 'Disabled', extension: 'AdBlock Ultimate', date: '2024-12-08', version: '4.8.1' },
                { action: 'Installed', extension: 'Color Picker Pro', date: '2024-12-05', version: '2.0.5' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.action === 'Installed' ? 'bg-green-500' :
                      item.action === 'Updated' ? 'bg-blue-500' :
                      item.action === 'Removed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{item.extension}</p>
                      <p className="text-sm text-muted-foreground">{item.action} v{item.version}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable All Extensions Dialog */}
      <Dialog open={disableAllDialogOpen} onOpenChange={setDisableAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <Unplug className="w-5 h-5" />
              Disable All Extensions
            </DialogTitle>
            <DialogDescription>
              Temporarily disable all installed extensions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will disable {installedExtensions.length} extension(s). You can re-enable them individually later.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisableAll}>
              <Unplug className="w-4 h-4 mr-2" />
              Disable All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove All Extensions Dialog */}
      <Dialog open={removeAllDialogOpen} onOpenChange={setRemoveAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Remove All Extensions
            </DialogTitle>
            <DialogDescription>
              Permanently uninstall all extensions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Warning: This action cannot be undone</p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    All {installedExtensions.length} extension(s) will be permanently removed along with their data.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset to Defaults Dialog */}
      <Dialog open={resetDefaultsDialogOpen} onOpenChange={setResetDefaultsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RefreshCw className="w-5 h-5" />
              Reset to Defaults
            </DialogTitle>
            <DialogDescription>
              Reset all extension settings to their default values
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will reset all settings including:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>- Display preferences</li>
                <li>- Update settings</li>
                <li>- Permission configurations</li>
                <li>- Notification preferences</li>
                <li>- Developer settings</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDefaultsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetDefaults}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extension Options Dialog */}
      <Dialog open={extensionOptionsDialogOpen} onOpenChange={setExtensionOptionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Extension Options
            </DialogTitle>
            <DialogDescription>
              Configure settings for {selectedExtension?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Auto-update</div>
                <div className="text-sm text-muted-foreground">Automatically update this extension</div>
              </div>
              <Switch checked={optionAutoUpdate} onCheckedChange={setOptionAutoUpdate} />
            </div>
            <div className="space-y-2">
              <Label>Site Access</Label>
              <Select value={optionSiteAccess} onValueChange={setOptionSiteAccess}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  <SelectItem value="click">On Click</SelectItem>
                  <SelectItem value="specific">Specific Sites Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">Allow in Incognito</div>
                <div className="text-sm text-muted-foreground">Enable in private browsing mode</div>
              </div>
              <Switch checked={optionIncognito} onCheckedChange={setOptionIncognito} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtensionOptionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExtensionOptions}>
              <Check className="w-4 h-4 mr-2" />
              Save Options
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Extension Dialog */}
      <Dialog open={removeExtensionDialogOpen} onOpenChange={setRemoveExtensionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Remove Extension
            </DialogTitle>
            <DialogDescription>
              Remove {selectedExtension?.name} from your browser
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will permanently remove {selectedExtension?.name} and all its data. This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveExtensionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveExtension}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Extension Dialog */}
      <Dialog open={shareExtensionDialogOpen} onOpenChange={setShareExtensionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Extension
            </DialogTitle>
            <DialogDescription>
              Share {selectedExtension?.name} with others
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Label className="text-xs text-muted-foreground mb-2 block">Extension Link</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm overflow-hidden text-ellipsis">
                  https://extensions.freeflow.io/ext/{selectedExtension?.id}
                </code>
                <Button variant="outline" size="sm" onClick={() => handleShareExtension('clipboard')}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => handleShareExtension('Email')}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleShareExtension('Twitter')}>
                <Globe className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareExtensionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Extension Dialog */}
      <Dialog open={reportExtensionDialogOpen} onOpenChange={setReportExtensionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Report Extension
            </DialogTitle>
            <DialogDescription>
              Report {selectedExtension?.name} for policy violations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Reason for Report *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malware">Malware or Security Issue</SelectItem>
                  <SelectItem value="privacy">Privacy Violation</SelectItem>
                  <SelectItem value="misleading">Misleading Information</SelectItem>
                  <SelectItem value="spam">Spam or Scam</SelectItem>
                  <SelectItem value="copyright">Copyright Infringement</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Details (optional)</Label>
              <Textarea
                placeholder="Provide more details about the issue..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReportExtensionDialogOpen(false); setReportReason(''); setReportDetails(''); }}>
              Cancel
            </Button>
            <Button onClick={handleReportExtension}>
              <Flag className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Extension Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirm Removal
            </DialogTitle>
            <DialogDescription>
              Remove {extensionToDelete?.name} from your browser
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will permanently remove {extensionToDelete?.name} and all its data. This action cannot be undone.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmDeleteDialogOpen(false); setExtensionToDelete(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteExtension}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Extension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
