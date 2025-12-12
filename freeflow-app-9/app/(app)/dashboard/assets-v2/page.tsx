"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Package,
  Download,
  Upload,
  Share2,
  Link2,
  Eye,
  Tag,
  Star,
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Code,
  Archive,
  TrendingUp,
  DollarSign,
  Users,
  MoreVertical,
  Search,
  Filter,
  Grid3x3,
  List
} from 'lucide-react'

/**
 * Assets V2 - Digital Assets Management
 * Manages brand assets, design resources, and downloadable files
 */
export default function AssetsV2() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'brand' | 'design' | 'code' | 'templates'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const stats = [
    { label: 'Total Assets', value: '4,247', change: 18.4, icon: <Package className="w-5 h-5" /> },
    { label: 'Downloads', value: '124K', change: 32.7, icon: <Download className="w-5 h-5" /> },
    { label: 'Total Value', value: '$2.4M', change: 24.3, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Active Users', value: '847', change: 15.8, icon: <Users className="w-5 h-5" /> }
  ]

  const assets = [
    {
      id: '1',
      name: 'Brand Logo Pack',
      type: 'brand',
      category: 'Logos',
      files: 24,
      size: '12.4 MB',
      downloads: 8470,
      value: 2500,
      format: 'SVG, PNG',
      license: 'Premium',
      thumbnail: '🎨',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'UI Component Library',
      type: 'design',
      category: 'Components',
      files: 156,
      size: '45.7 MB',
      downloads: 6920,
      value: 4999,
      format: 'Figma, Sketch',
      license: 'Premium',
      thumbnail: '🎯',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'React Templates',
      type: 'code',
      category: 'Templates',
      files: 34,
      size: '89.2 MB',
      downloads: 4560,
      value: 7900,
      format: 'React, TS',
      license: 'MIT',
      thumbnail: '⚛️',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'Icon Set Pro',
      type: 'design',
      category: 'Icons',
      files: 892,
      size: '23.1 MB',
      downloads: 12700,
      value: 1900,
      format: 'SVG, PNG',
      license: 'Premium',
      thumbnail: '✨',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Marketing Templates',
      type: 'templates',
      category: 'Marketing',
      files: 67,
      size: '156 MB',
      downloads: 5430,
      value: 3500,
      format: 'PSD, AI',
      license: 'Premium',
      thumbnail: '📊',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      name: 'Photography Bundle',
      type: 'brand',
      category: 'Photos',
      files: 247,
      size: '2.4 GB',
      downloads: 3890,
      value: 5900,
      format: 'JPG, RAW',
      license: 'Commercial',
      thumbnail: '📸',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '7',
      name: 'Video Assets Pack',
      type: 'brand',
      category: 'Video',
      files: 45,
      size: '5.7 GB',
      downloads: 2340,
      value: 8900,
      format: 'MP4, MOV',
      license: 'Premium',
      thumbnail: '🎬',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '8',
      name: 'Code Snippets Library',
      type: 'code',
      category: 'Snippets',
      files: 423,
      size: '12.3 MB',
      downloads: 6780,
      value: 1200,
      format: 'JS, TS, CSS',
      license: 'MIT',
      thumbnail: '💻',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const collections = [
    { id: '1', name: 'Brand Identity', assets: 247, downloads: '24.7K', color: 'from-blue-500 to-cyan-500' },
    { id: '2', name: 'Design System', assets: 189, downloads: '18.9K', color: 'from-purple-500 to-pink-500' },
    { id: '3', name: 'Marketing Materials', assets: 156, downloads: '15.6K', color: 'from-green-500 to-emerald-500' },
    { id: '4', name: 'Developer Tools', assets: 423, downloads: '42.3K', color: 'from-orange-500 to-red-500' },
    { id: '5', name: 'Photo Library', assets: 892, downloads: '89.2K', color: 'from-pink-500 to-rose-500' },
    { id: '6', name: 'Templates', assets: 134, downloads: '13.4K', color: 'from-indigo-500 to-purple-500' }
  ]

  const topAssets = [
    { rank: 1, name: 'Icon Set Pro', avatar: '✨', value: '12.7K', change: 42.3 },
    { rank: 2, name: 'Brand Logo Pack', avatar: '🎨', value: '8.47K', change: 32.1 },
    { rank: 3, name: 'UI Components', avatar: '🎯', value: '6.92K', change: 28.7 },
    { rank: 4, name: 'Code Snippets', avatar: '💻', value: '6.78K', change: 24.5 },
    { rank: 5, name: 'Marketing Templates', avatar: '📊', value: '5.43K', change: 18.9 }
  ]

  const recentActivity = [
    { icon: <Download className="w-4 h-4" />, title: 'Icon Set downloaded', time: '5m ago', type: 'success' as const },
    { icon: <Upload className="w-4 h-4" />, title: 'New assets uploaded', time: '1h ago', type: 'info' as const },
    { icon: <Share2 className="w-4 h-4" />, title: 'Brand pack shared', time: '3h ago', type: 'warning' as const },
    { icon: <Star className="w-4 h-4" />, title: 'Template favorited', time: '5h ago', type: 'info' as const }
  ]

  const getLicenseBadge = (license: string) => {
    switch (license) {
      case 'Premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Commercial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'MIT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-purple-600" />
              Digital Assets
            </h1>
            <p className="text-muted-foreground">Manage brand assets, design resources, and templates</p>
          </div>
          <GradientButton from="purple" to="pink" onClick={() => console.log('Upload')}>
            <Upload className="w-5 h-5 mr-2" />
            Upload Assets
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Package />} title="All Assets" description="Browse all" onClick={() => setSelectedCategory('all')} />
          <BentoQuickAction icon={<ImageIcon />} title="Brand" description="Identity" onClick={() => setSelectedCategory('brand')} />
          <BentoQuickAction icon={<Code />} title="Code" description="Snippets" onClick={() => setSelectedCategory('code')} />
          <BentoQuickAction icon={<FileText />} title="Templates" description="Ready-made" onClick={() => setSelectedCategory('templates')} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>
              All Assets
            </PillButton>
            <PillButton variant={selectedCategory === 'brand' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('brand')}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Brand
            </PillButton>
            <PillButton variant={selectedCategory === 'design' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('design')}>
              Design
            </PillButton>
            <PillButton variant={selectedCategory === 'code' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('code')}>
              <Code className="w-4 h-4 mr-2" />
              Code
            </PillButton>
            <PillButton variant={selectedCategory === 'templates' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('templates')}>
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </PillButton>
          </div>
          <div className="flex items-center gap-2">
            <ModernButton variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid3x3 className="w-4 h-4" />
            </ModernButton>
            <ModernButton variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Asset Library</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors group">
                      <div className="space-y-3">
                        <div className={`aspect-video rounded-lg bg-gradient-to-r ${asset.color} flex items-center justify-center text-6xl`}>
                          {asset.thumbnail}
                        </div>
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{asset.name}</h4>
                              <p className="text-xs text-muted-foreground">{asset.category} • {asset.format}</p>
                            </div>
                            <ModernButton variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-3 h-3" />
                            </ModernButton>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLicenseBadge(asset.license)}`}>
                              {asset.license}
                            </span>
                            <span className="text-xs text-muted-foreground">{asset.files} files</span>
                            <span className="text-xs text-muted-foreground">{asset.size}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>{(asset.downloads / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>${(asset.value / 1000).toFixed(1)}K value</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Share2 className="w-3 h-3" />
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Star className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${asset.color} flex items-center justify-center text-3xl flex-shrink-0`}>
                          {asset.thumbnail}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{asset.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getLicenseBadge(asset.license)}`}>
                              {asset.license}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{asset.category} • {asset.format} • {asset.files} files • {asset.size}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>{(asset.downloads / 1000).toFixed(1)}K downloads</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${(asset.value / 1000).toFixed(1)}K value</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </ModernButton>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Collections</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => console.log('Open collection', collection.id)}
                    className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${collection.color} flex items-center justify-center text-white mb-3`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold mb-1">{collection.name}</h4>
                    <p className="text-xs text-muted-foreground">{collection.assets} assets</p>
                    <p className="text-xs text-muted-foreground">{collection.downloads} downloads</p>
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="📥 Most Downloaded" items={topAssets} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Asset Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Assets" value="4,247" change={18.4} />
                <MiniKPI label="Downloads" value="124K" change={32.7} />
                <MiniKPI label="Total Value" value="$2.4M" change={24.3} />
                <MiniKPI label="Active Users" value="847" change={15.8} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Download Goal"
              value={124}
              target={150}
              label="K downloads this month"
              color="from-purple-500 to-pink-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Asset Categories</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Brand Assets</span>
                    </div>
                    <span className="text-xs font-semibold">1,247</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '29%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Design Resources</span>
                    </div>
                    <span className="text-xs font-semibold">1,892</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Code Assets</span>
                    </div>
                    <span className="text-xs font-semibold">892</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '21%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Templates</span>
                    </div>
                    <span className="text-xs font-semibold">216</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
