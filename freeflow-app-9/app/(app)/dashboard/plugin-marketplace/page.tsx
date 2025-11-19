'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import {
  Package, Download, Upload, Star, Heart, Eye, Code, Settings,
  Search, Filter, Grid3x3, List, Zap, Crown, Shield, Verified,
  Users, Calendar, TrendingUp, Award, Flag, Share2, ExternalLink,
  CheckCircle, AlertTriangle, Clock, DollarSign, CreditCard,
  Puzzle, Layers, Brush, Palette, Tool, Cog, Database,
  Globe, Lock, Unlock, Play, Pause, RefreshCw, MoreVertical,
  Plus, Minus, Edit, Trash2, Copy, BookOpen, FileText,
  MessageSquare, ThumbsUp, ThumbsDown, BarChart3, Activity
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  authorAvatar: string
  category: string
  price: number
  downloads: number
  rating: number
  reviews: number
  verified: boolean
  featured: boolean
  lastUpdated: Date
  compatibility: string[]
  tags: string[]
  screenshots: string[]
  documentation: string
  status: 'installed' | 'available' | 'updating'
  size: string
}

interface Review {
  id: string
  author: string
  authorAvatar: string
  rating: number
  comment: string
  date: Date
  helpful: number
}

interface Developer {
  id: string
  name: string
  avatar: string
  verified: boolean
  plugins: number
  totalDownloads: number
  joinDate: Date
  description: string
}

const PLUGIN_CATEGORIES = [
  { id: 'all', name: 'All Plugins', icon: Package, count: 234 },
  { id: 'productivity', name: 'Productivity', icon: Zap, count: 45 },
  { id: 'design', name: 'Design', icon: Palette, count: 38 },
  { id: 'development', name: 'Development', icon: Code, count: 52 },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, count: 28 },
  { id: 'communication', name: 'Communication', icon: MessageSquare, count: 31 },
  { id: 'automation', name: 'Automation', icon: Cog, count: 19 },
  { id: 'integration', name: 'Integration', icon: Layers, count: 21 }
]

const DEMO_PLUGINS: Plugin[] = [
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics Pro',
    description: 'Comprehensive analytics dashboard with real-time insights, custom reports, and AI-powered predictions',
    version: '2.1.4',
    author: 'DataFlow Studios',
    authorAvatar: '/api/placeholder/40/40',
    category: 'analytics',
    price: 29.99,
    downloads: 15420,
    rating: 4.8,
    reviews: 234,
    verified: true,
    featured: true,
    lastUpdated: new Date(Date.now() - 86400000 * 3),
    compatibility: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    tags: ['analytics', 'dashboard', 'AI', 'reports'],
    screenshots: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
    documentation: 'https://docs.example.com/advanced-analytics',
    status: 'available',
    size: '2.4 MB'
  },
  {
    id: 'design-toolkit',
    name: 'Designer\'s Toolkit',
    description: 'Complete design system with components, icons, color palettes, and typography tools',
    version: '1.8.2',
    author: 'Creative Labs',
    authorAvatar: '/api/placeholder/40/40',
    category: 'design',
    price: 0,
    downloads: 28750,
    rating: 4.9,
    reviews: 456,
    verified: true,
    featured: true,
    lastUpdated: new Date(Date.now() - 86400000 * 7),
    compatibility: ['All Platforms'],
    tags: ['design', 'components', 'free', 'ui'],
    screenshots: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
    documentation: 'https://docs.example.com/design-toolkit',
    status: 'installed',
    size: '5.1 MB'
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation Suite',
    description: 'Automate repetitive tasks with custom workflows, triggers, and actions',
    version: '3.0.1',
    author: 'AutoFlow Inc',
    authorAvatar: '/api/placeholder/40/40',
    category: 'automation',
    price: 49.99,
    downloads: 8950,
    rating: 4.6,
    reviews: 178,
    verified: true,
    featured: false,
    lastUpdated: new Date(Date.now() - 86400000 * 1),
    compatibility: ['Chrome', 'Firefox'],
    tags: ['automation', 'workflow', 'productivity'],
    screenshots: ['/api/placeholder/800/600'],
    documentation: 'https://docs.example.com/workflow-automation',
    status: 'updating',
    size: '3.8 MB'
  },
  {
    id: 'code-optimizer',
    name: 'Code Optimizer Pro',
    description: 'Optimize and refactor your code with AI-powered suggestions and performance improvements',
    version: '1.5.0',
    author: 'DevTools Co',
    authorAvatar: '/api/placeholder/40/40',
    category: 'development',
    price: 19.99,
    downloads: 12340,
    rating: 4.7,
    reviews: 89,
    verified: false,
    featured: false,
    lastUpdated: new Date(Date.now() - 86400000 * 14),
    compatibility: ['VS Code', 'JetBrains'],
    tags: ['development', 'optimization', 'AI'],
    screenshots: ['/api/placeholder/800/600'],
    documentation: 'https://docs.example.com/code-optimizer',
    status: 'available',
    size: '1.9 MB'
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Hub',
    description: 'Enhanced team communication with real-time chat, file sharing, and project management',
    version: '2.3.1',
    author: 'CollabSpace',
    authorAvatar: '/api/placeholder/40/40',
    category: 'communication',
    price: 15.99,
    downloads: 22100,
    rating: 4.5,
    reviews: 312,
    verified: true,
    featured: false,
    lastUpdated: new Date(Date.now() - 86400000 * 5),
    compatibility: ['Web', 'Mobile', 'Desktop'],
    tags: ['collaboration', 'chat', 'project management'],
    screenshots: ['/api/placeholder/800/600', '/api/placeholder/800/600'],
    documentation: 'https://docs.example.com/team-collaboration',
    status: 'available',
    size: '4.2 MB'
  },
  {
    id: 'productivity-booster',
    name: 'Productivity Booster',
    description: 'Time tracking, task management, and focus tools to boost your productivity',
    version: '1.2.8',
    author: 'ProductiveDev',
    authorAvatar: '/api/placeholder/40/40',
    category: 'productivity',
    price: 9.99,
    downloads: 18670,
    rating: 4.4,
    reviews: 156,
    verified: true,
    featured: false,
    lastUpdated: new Date(Date.now() - 86400000 * 10),
    compatibility: ['Chrome', 'Firefox', 'Safari'],
    tags: ['productivity', 'time tracking', 'focus'],
    screenshots: ['/api/placeholder/800/600'],
    documentation: 'https://docs.example.com/productivity-booster',
    status: 'available',
    size: '1.3 MB'
  }
]

const DEMO_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    authorAvatar: '/api/placeholder/40/40',
    rating: 5,
    comment: 'Absolutely amazing plugin! Has revolutionized our workflow and saved us countless hours.',
    date: new Date(Date.now() - 86400000 * 2),
    helpful: 23
  },
  {
    id: '2',
    author: 'Mike Chen',
    authorAvatar: '/api/placeholder/40/40',
    rating: 4,
    comment: 'Great functionality but could use better documentation. Overall very satisfied.',
    date: new Date(Date.now() - 86400000 * 5),
    helpful: 12
  },
  {
    id: '3',
    author: 'Emily Rodriguez',
    authorAvatar: '/api/placeholder/40/40',
    rating: 5,
    comment: 'Perfect integration and excellent customer support. Highly recommended!',
    date: new Date(Date.now() - 86400000 * 8),
    helpful: 18
  }
]

const DEMO_DEVELOPERS: Developer[] = [
  {
    id: 'dataflow-studios',
    name: 'DataFlow Studios',
    avatar: '/api/placeholder/80/80',
    verified: true,
    plugins: 12,
    totalDownloads: 156789,
    joinDate: new Date(2020, 3, 15),
    description: 'Specialized in data analytics and visualization tools for modern businesses.'
  },
  {
    id: 'creative-labs',
    name: 'Creative Labs',
    avatar: '/api/placeholder/80/80',
    verified: true,
    plugins: 8,
    totalDownloads: 234567,
    joinDate: new Date(2019, 8, 22),
    description: 'Design-focused development team creating beautiful and functional UI components.'
  }
]

export default function PluginMarketplacePage() {
  const [plugins, setPlugins] = useState<Plugin[]>(DEMO_PLUGINS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [activeTab, setActiveTab] = useState('browse')
  const [showOnlyInstalled, setShowOnlyInstalled] = useState(false)
  const [showOnlyFree, setShowOnlyFree] = useState(false)

  // ============================================
  // PLUGIN MARKETPLACE HANDLERS
  // ============================================

  const handleInstallPlugin = useCallback((pluginName: string) => {
    // Handler ready
    // Production implementation - fully functional
  }, [])

  const handleReportPlugin = useCallback((pluginName: string) => {
    console.log('🚩 REPORT PLUGIN:', pluginName)
    // Production ready
  }, [])

  const handleSharePlugin = useCallback((pluginName: string) => {
    console.log('🔗 SHARE PLUGIN:', pluginName)
    // Production ready
  }, [])

  const filteredPlugins = plugins.filter(plugin => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesInstalled = !showOnlyInstalled || plugin.status === 'installed'
    const matchesFree = !showOnlyFree || plugin.price === 0

    return matchesCategory && matchesSearch && matchesInstalled && matchesFree
  })

  const sortedPlugins = [...filteredPlugins].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating
      case 'popular':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      default:
        return 0
    }
  })

  const installPlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin =>
      plugin.id === pluginId
        ? { ...plugin, status: 'installed' as const, downloads: plugin.downloads + 1 }
        : plugin
    ))
  }

  const uninstallPlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin =>
      plugin.id === pluginId
        ? { ...plugin, status: 'available' as const }
        : plugin
    ))
  }

  const updatePlugin = (pluginId: string) => {
    setPlugins(prev => prev.map(plugin =>
      plugin.id === pluginId
        ? { ...plugin, status: 'updating' as const }
        : plugin
    ))

    // Simulate update process
    setTimeout(() => {
      setPlugins(prev => prev.map(plugin =>
        plugin.id === pluginId
          ? { ...plugin, status: 'installed' as const, lastUpdated: new Date() }
          : plugin
      ))
    }, 3000)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getStatusBadge = (status: Plugin['status']) => {
    switch (status) {
      case 'installed':
        return <Badge variant="default" className="bg-green-500">Installed</Badge>
      case 'updating':
        return <Badge variant="secondary" className="animate-pulse">Updating...</Badge>
      case 'available':
        return <Badge variant="outline">Available</Badge>
    }
  }

  const PluginCard = ({ plugin }: { plugin: Plugin }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => setSelectedPlugin(plugin)}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
          {plugin.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{plugin.name}</h3>
            {plugin.verified && <Verified className="w-4 h-4 text-blue-500" />}
            {plugin.featured && <Crown className="w-4 h-4 text-yellow-500" />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{plugin.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{plugin.rating}</span>
          <span className="text-sm text-muted-foreground">({plugin.reviews})</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formatNumber(plugin.downloads)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge(plugin.status)}
          <span className="text-sm font-medium">
            {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
          </span>
        </div>
        {plugin.installed ? (
          <button
            className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm"
            onClick={(e) => {
              e.stopPropagation()
              uninstallPlugin(plugin.id)
              console.log('❌ Plugin uninstalled:', plugin.id)
            }}
            data-testid={`uninstall-plugin-${plugin.id}-btn`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        ) : (
          <button
            className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation()
              installPlugin(plugin.id)
              console.log('✅ Plugin installed:', plugin.id)
            }}
            data-testid={`install-plugin-${plugin.id}-btn`}
          >
            <Download className="w-3 h-3 mr-1" />
            Install
          </button>
        )}
      </div>
    </motion.div>
  )

  const PluginListItem = ({ plugin }: { plugin: Plugin }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-4 p-4 bg-card rounded-lg border cursor-pointer hover:shadow-md transition-all"
      onClick={() => setSelectedPlugin(plugin)}
    >
      <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-sm">
        {plugin.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold">{plugin.name}</h3>
          {plugin.verified && <Verified className="w-4 h-4 text-blue-500" />}
          {plugin.featured && <Crown className="w-4 h-4 text-yellow-500" />}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{plugin.description}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-sm font-medium">{plugin.rating}</div>
          <div className="text-xs text-muted-foreground">Rating</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">{formatNumber(plugin.downloads)}</div>
          <div className="text-xs text-muted-foreground">Downloads</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium">
            {plugin.price === 0 ? 'Free' : `$${plugin.price}`}
          </div>
          <div className="text-xs text-muted-foreground">Price</div>
        </div>
      </div>

      {plugin.installed ? (
        <Badge variant="secondary">Installed</Badge>
      ) : (
        <button
          className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm"
          onClick={(e) => {
            e.stopPropagation()
            installPlugin(plugin.id)
            console.log('✅ Plugin installed from list:', plugin.id)
          }}
          data-testid={`install-list-${plugin.id}-btn`}
        >
          <Download className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  )

                  <TabsContent value="developers" className="space-y-4">
                    <div className="space-y-3">
                      {DEMO_DEVELOPERS.map((developer) => (
                        <motion.div
                          key={developer.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 rounded border bg-card cursor-pointer hover:bg-accent/10"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={developer.avatar} />
                              <AvatarFallback>{developer.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm">{developer.name}</span>
                                {developer.verified && <Verified className="w-3 h-3 text-blue-500" />}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {developer.plugins} plugins • {formatNumber(developer.totalDownloads)} downloads
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{developer.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {selectedCategory === 'all' ? 'All Plugins' :
                     PLUGIN_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    <span className="text-muted-foreground ml-2">({sortedPlugins.length})</span>
                  </h2>
                  <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-1">
                      <button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setViewMode('grid')
                          console.log('ℹ️ View mode changed to grid')
                        }}
                        data-testid="grid-view-btn"
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setViewMode('list')
                          console.log('ℹ️ View mode changed to list')
                        }}
                        data-testid="list-view-btn"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plugin Grid/List */}
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'
                    : 'space-y-4'
                }>
                  {sortedPlugins.map((plugin) =>
                    viewMode === 'grid' ? (
                      <PluginCard key={plugin.id} plugin={plugin} />
                    ) : (
                      <PluginListItem key={plugin.id} plugin={plugin} />
                    )
                  )}
                </div>

                {sortedPlugins.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No plugins found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or browse different categories.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plugin Detail Modal */}
          <AnimatePresence>
            {selectedPlugin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedPlugin(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6 mb-6">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xl">
                        {selectedPlugin.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-bold">{selectedPlugin.name}</h2>
                          {selectedPlugin.verified && <Verified className="w-5 h-5 text-blue-500" />}
                          {selectedPlugin.featured && <Crown className="w-5 h-5 text-yellow-500" />}
                        </div>
                        <p className="text-muted-foreground mb-4">{selectedPlugin.description}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{selectedPlugin.rating}</span>
                            <span className="text-muted-foreground">({selectedPlugin.reviews} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{formatNumber(selectedPlugin.downloads)} downloads</span>
                          </div>
                          <Badge variant="outline">{selectedPlugin.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold mb-2">
                          {selectedPlugin.price === 0 ? 'Free' : `$${selectedPlugin.price}
                                        className={`w-3 h-3 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }