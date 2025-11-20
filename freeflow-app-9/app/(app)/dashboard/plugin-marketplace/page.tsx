'use client'

/**
 * World-Class Plugin Marketplace
 * Complete implementation of plugin ecosystem and marketplace
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Package, Download, Star, Search, Filter, Grid3x3, List,
  Zap, Shield, TrendingUp, Award, Share2, ExternalLink,
  CheckCircle, AlertCircle, DollarSign, Settings, Eye,
  Users, Clock, BarChart3, Play, RefreshCw, Info,
  Sparkles, Heart, MessageSquare, ChevronDown, Plus,
  Book, Code, Globe, Lock, Check, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Input } from '@/components/ui/input'
import {
  Plugin,
  PluginCategory,
  InstalledPlugin,
  PluginCollection
} from '@/lib/plugin-marketplace-types'
import {
  PLUGIN_CATEGORIES,
  MOCK_PLUGINS,
  MOCK_INSTALLED_PLUGINS,
  MOCK_COLLECTIONS,
  MOCK_MARKETPLACE_STATS,
  MOCK_PLUGIN_REVIEWS,
  formatInstalls,
  formatPrice,
  getRatingColor,
  getCompatibilityBadge,
  formatFileSize,
  formatDate,
  getRatingStars,
  isPluginInstalled,
  filterPlugins,
  sortPlugins
} from '@/lib/plugin-marketplace-utils'

type ViewMode = 'browse' | 'installed' | 'collections' | 'developer'
type LayoutMode = 'grid' | 'list'

export default function PluginMarketplacePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'name'>('popular')
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)

  const filteredPlugins = filterPlugins(
    MOCK_PLUGINS,
    {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery
    }
  )

  const sortedPlugins = sortPlugins(filteredPlugins, sortBy)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full text-sm font-medium mb-6 border border-emerald-500/30"
              >
                <Package className="w-4 h-4" />
                Plugin Marketplace
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {MOCK_MARKETPLACE_STATS.totalPlugins}+ Plugins
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Extend Your Platform
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover powerful plugins to enhance your workflow, automate tasks, and unlock new capabilities
              </p>
            </div>
          </ScrollReveal>

          {/* Stats Row */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Plugins', value: MOCK_MARKETPLACE_STATS.totalPlugins, icon: Package, color: 'emerald' },
                { label: 'Total Installs', value: formatInstalls(MOCK_MARKETPLACE_STATS.totalInstalls), icon: Download, color: 'teal' },
                { label: 'Developers', value: MOCK_MARKETPLACE_STATS.totalDevelopers, icon: Users, color: 'cyan' },
                { label: 'Avg Rating', value: MOCK_MARKETPLACE_STATS.avgRating.toFixed(1), icon: Star, color: 'yellow' }
              ].map((stat, index) => (
                <LiquidGlassCard key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 flex items-center justify-center shrink-0`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>

          {/* View Mode Tabs */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: 'browse' as ViewMode, label: 'Browse', icon: Package },
                { id: 'installed' as ViewMode, label: 'Installed', icon: CheckCircle },
                { id: 'collections' as ViewMode, label: 'Collections', icon: Grid3x3 },
                { id: 'developer' as ViewMode, label: 'Developer', icon: Code }
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant={viewMode === mode.id ? "default" : "outline"}
                  onClick={() => setViewMode(mode.id)}
                  className={viewMode === mode.id ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "border-gray-700 hover:bg-slate-800"}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </Button>
              ))}
            </div>
          </ScrollReveal>

          {/* Browse View */}
          {viewMode === 'browse' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <LiquidGlassCard className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search plugins..."
                          className="pl-10 bg-slate-900/50 border-gray-700"
                        />
                      </div>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 bg-slate-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="recent">Recently Updated</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={layoutMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setLayoutMode('grid')}
                        className={layoutMode === 'grid' ? 'bg-emerald-600' : 'border-gray-700'}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={layoutMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setLayoutMode('list')}
                        className={layoutMode === 'list' ? 'bg-emerald-600' : 'border-gray-700'}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className={selectedCategory === 'all' ? 'bg-emerald-600' : 'border-gray-700'}
                    >
                      All
                    </Button>
                    {PLUGIN_CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className={selectedCategory === category.id ? 'bg-emerald-600' : 'border-gray-700'}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Plugins Grid/List */}
              <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {sortedPlugins.map((plugin) => {
                  const installed = isPluginInstalled(plugin.id, MOCK_INSTALLED_PLUGINS)
                  const compatibility = getCompatibilityBadge(plugin.compatibility)
                  const ratingStars = getRatingStars(plugin.rating)

                  return (
                    <motion.div key={plugin.id} whileHover={{ scale: 1.02 }}>
                      <LiquidGlassCard className="p-6 h-full">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-3xl shrink-0">
                              {plugin.category === 'ai' && '🧠'}
                              {plugin.category === 'productivity' && '⚡'}
                              {plugin.category === 'integration' && '🔗'}
                              {plugin.category === 'automation' && '🤖'}
                              {plugin.category === 'analytics' && '📊'}
                              {plugin.category === 'creative' && '🎨'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate">{plugin.name}</h3>
                                {plugin.isVerified && (
                                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mb-1">{plugin.author.name}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: ratingStars.full }).map((_, i) => (
                                  <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                                {ratingStars.half && (
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 opacity-50" />
                                )}
                                <span className="text-xs text-gray-400 ml-1">
                                  {plugin.rating} ({plugin.reviewCount})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-400 line-clamp-2">{plugin.description}</p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {plugin.isFeatured && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {plugin.isTrending && (
                              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {plugin.isNew && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                New
                              </Badge>
                            )}
                            <Badge className={`bg-${compatibility.color}-500/20 text-${compatibility.color}-300 border-${compatibility.color}-500/30 text-xs`}>
                              {compatibility.label}
                            </Badge>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400 block">Installs</span>
                              <span className="text-white font-medium">{formatInstalls(plugin.installCount)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block">Version</span>
                              <span className="text-white font-medium">{plugin.version}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block">Size</span>
                              <span className="text-white font-medium">{formatFileSize(plugin.fileSize)}</span>
                            </div>
                          </div>

                          {/* Price & Install */}
                          <div className="pt-4 border-t border-gray-700 flex items-center justify-between gap-2">
                            <div className="text-lg font-bold text-white">
                              {formatPrice(plugin.pricing)}
                            </div>
                            <div className="flex gap-2">
                              {installed ? (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Installed
                                </Badge>
                              ) : (
                                <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                                  <Download className="w-3 h-3 mr-1" />
                                  Install
                                </Button>
                              )}
                              <Button variant="outline" size="icon" className="h-8 w-8 border-gray-700 hover:bg-slate-800">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Installed View */}
          {viewMode === 'installed' && (
            <div className="space-y-6">
              {MOCK_INSTALLED_PLUGINS.length === 0 ? (
                <LiquidGlassCard className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Plugins Installed</h3>
                  <p className="text-gray-400 mb-6">Start by browsing the marketplace</p>
                  <Button onClick={() => setViewMode('browse')} className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    Browse Plugins
                  </Button>
                </LiquidGlassCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_INSTALLED_PLUGINS.map((installed) => {
                    const plugin = MOCK_PLUGINS.find(p => p.id === installed.pluginId)
                    if (!plugin) return null

                    return (
                      <LiquidGlassCard key={installed.pluginId} className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-white mb-1">{plugin.name}</h3>
                              <p className="text-sm text-gray-400">v{installed.installedVersion}</p>
                            </div>
                            <Badge className={`bg-${installed.status === 'active' ? 'green' : 'yellow'}-500/20 text-${installed.status === 'active' ? 'green' : 'yellow'}-300 border-${installed.status === 'active' ? 'green' : 'yellow'}-500/30`}>
                              {installed.status}
                            </Badge>
                          </div>

                          {installed.usageStats && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400 block">Activations</span>
                                <span className="text-white font-medium">{installed.usageStats.activations}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Last Used</span>
                                <span className="text-white font-medium">{formatDate(installed.lastUsed!)}</span>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-gray-700 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 border-gray-700 hover:bg-slate-800">
                              <Settings className="w-3 h-3 mr-1" />
                              Settings
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-slate-800">
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-700 hover:bg-red-800">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Collections View */}
          {viewMode === 'collections' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_COLLECTIONS.map((collection) => (
                  <motion.div key={collection.id} whileHover={{ scale: 1.02 }}>
                    <LiquidGlassCard className="p-6 h-full">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-2xl">
                            {collection.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{collection.name}</h3>
                            <p className="text-xs text-gray-400">by {collection.curatedBy}</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400">{collection.description}</p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <span className="text-sm text-gray-400">{collection.plugins.length} plugins</span>
                          <Button size="sm" variant="outline" className="border-gray-700 hover:bg-slate-800">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Developer View */}
          {viewMode === 'developer' && (
            <div className="space-y-6">
              <LiquidGlassCard className="p-8 text-center">
                <Code className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Developer Portal</h3>
                <p className="text-gray-400 mb-6">
                  Build and publish plugins for the KAZI marketplace
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plugin
                  </Button>
                  <Button variant="outline" className="border-gray-700 hover:bg-slate-800">
                    <Book className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                </div>
              </LiquidGlassCard>

              {/* Developer Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Your Plugins', value: '3', icon: Package },
                  { label: 'Total Installs', value: '1.2K', icon: Download },
                  { label: 'Avg Rating', value: '4.7', icon: Star }
                ].map((stat, index) => (
                  <LiquidGlassCard key={index} className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
