"use client"

import { useState } from 'react'
import {
  BentoGallery,
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Image,
  Plus,
  Search,
  Upload,
  Download,
  Share2,
  Eye,
  Star,
  Settings,
  Filter,
  Grid,
  List,
  Folder,
  TrendingUp
} from 'lucide-react'

/**
 * Gallery V2 - Groundbreaking Portfolio Showcase
 * Showcases image gallery with modern components
 */
export default function GalleryV2() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'photos' | 'designs'>('all')

  const galleryItems = [
    { id: '1', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', alt: 'Abstract Art', title: 'Abstract Composition', description: 'Digital art piece' },
    { id: '2', src: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=600', alt: 'Nature', title: 'Mountain Vista', description: 'Landscape photography' },
    { id: '3', src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600', alt: 'Design', title: 'UI Mockup', description: 'App interface design' },
    { id: '4', src: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600', alt: 'Architecture', title: 'Modern Building', description: 'Architectural photo' },
    { id: '5', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'Product', title: 'Product Shot', description: 'Commercial photography' },
    { id: '6', src: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600', alt: 'Branding', title: 'Brand Identity', description: 'Logo design' }
  ]

  const stats = [
    { label: 'Total Items', value: '234', change: 12.5, icon: <Image className="w-5 h-5" /> },
    { label: 'Views', value: '12.4K', change: 25.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Shares', value: '456', change: 15.2, icon: <Share2 className="w-5 h-5" /> },
    { label: 'Favorites', value: '89', change: 8.7, icon: <Star className="w-5 h-5" /> }
  ]

  const recentActivity = [
    { icon: <Upload className="w-5 h-5" />, title: 'New upload', description: 'Abstract Composition added', time: '1 hour ago', status: 'success' as const },
    { icon: <Share2 className="w-5 h-5" />, title: 'Image shared', description: 'Mountain Vista shared to portfolio', time: '3 hours ago', status: 'info' as const },
    { icon: <Star className="w-5 h-5" />, title: 'Favorited', description: 'UI Mockup added to favorites', time: '1 day ago', status: 'success' as const },
    { icon: <Download className="w-5 h-5" />, title: 'Downloaded', description: 'Product Shot downloaded', time: '2 days ago', status: 'info' as const }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-rose-50/40 dark:from-amber-950 dark:via-orange-950/30 dark:to-rose-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Image className="w-10 h-10 text-amber-600" />
              Gallery
            </h1>
            <p className="text-muted-foreground">Showcase your portfolio and creative work</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="amber" to="orange" onClick={() => console.log('Upload')}>
              <Upload className="w-5 h-5 mr-2" />
              Upload
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Upload className="w-6 h-6" />} title="Upload" description="Add images" onClick={() => console.log('Upload')} />
          <BentoQuickAction icon={<Folder className="w-6 h-6" />} title="Collections" description="Organize" onClick={() => console.log('Collections')} />
          <BentoQuickAction icon={<Share2 className="w-6 h-6" />} title="Share" description="Portfolio" onClick={() => console.log('Share')} />
          <BentoQuickAction icon={<Download className="w-6 h-6" />} title="Export" description="Download all" onClick={() => console.log('Export')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search gallery..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedCategory === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('all')}>All</PillButton>
            <PillButton variant={selectedCategory === 'photos' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('photos')}>Photos</PillButton>
            <PillButton variant={selectedCategory === 'designs' ? 'primary' : 'ghost'} onClick={() => setSelectedCategory('designs')}>Designs</PillButton>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <IconButton icon={<Grid />} ariaLabel="Grid view" variant={viewMode === 'grid' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} />
            <IconButton icon={<List />} ariaLabel="List view" variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoGallery title="🎨 My Portfolio" items={galleryItems} columns={3} />
          </div>
          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Uploads This Week" value="12" change={25.0} />
                <MiniKPI label="Avg. Views per Item" value="53" change={12.5} />
                <MiniKPI label="Engagement Rate" value="8.4%" change={8.3} />
                <MiniKPI label="Download Rate" value="156" change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
