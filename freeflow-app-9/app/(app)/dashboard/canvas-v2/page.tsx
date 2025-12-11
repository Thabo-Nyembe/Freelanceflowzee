"use client"

import { useState } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoGallery,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Palette,
  Plus,
  Search,
  Grid,
  List,
  Share2,
  Download,
  Layers,
  Users,
  Eye,
  Star,
  Settings,
  Zap,
  Layout,
  FileImage,
  Maximize2,
  Copy,
  TrendingUp
} from 'lucide-react'

/**
 * Canvas V2 - Groundbreaking Design Studio
 * Showcases design tools with modern components
 */
export default function CanvasV2() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'shared'>('all')

  // Sample canvas projects
  const canvasProjects = [
    {
      id: '1',
      name: 'Brand Identity Design',
      description: 'Logo and visual identity',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      status: 'in-progress',
      artboards: 8,
      collaborators: 3,
      layers: 156,
      starred: true
    },
    {
      id: '2',
      name: 'UI/UX Wireframes',
      description: 'Mobile app wireframes',
      thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400',
      status: 'in-progress',
      artboards: 12,
      collaborators: 5,
      layers: 234,
      starred: false
    },
    {
      id: '3',
      name: 'Social Media Templates',
      description: 'Instagram & Facebook posts',
      thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400',
      status: 'completed',
      artboards: 20,
      collaborators: 2,
      layers: 89,
      starred: true
    },
    {
      id: '4',
      name: 'Presentation Deck',
      description: 'Investor pitch deck',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      status: 'shared',
      artboards: 15,
      collaborators: 4,
      layers: 178,
      starred: false
    }
  ]

  // Stats
  const stats = [
    {
      label: 'Total Projects',
      value: '24',
      change: 12.5,
      icon: <Layout className="w-5 h-5" />
    },
    {
      label: 'Artboards',
      value: '156',
      change: 25.3,
      icon: <Maximize2 className="w-5 h-5" />
    },
    {
      label: 'Collaborators',
      value: '18',
      change: 8.7,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Shared Designs',
      value: '42',
      change: 15.2,
      icon: <Share2 className="w-5 h-5" />
    }
  ]

  // Top projects by layers
  const topProjects = canvasProjects
    .sort((a, b) => b.layers - a.layers)
    .map((project, index) => ({
      rank: index + 1,
      name: project.name,
      value: `${project.layers} layers`,
      avatar: undefined,
      change: project.artboards - 5
    }))

  // Recent activity
  const recentActivity = [
    {
      icon: <Plus className="w-5 h-5" />,
      title: 'New project created',
      description: 'Brand Identity Design started',
      time: '2 hours ago',
      status: 'success' as const
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Collaborator added',
      description: 'Sarah joined UI/UX Wireframes',
      time: '4 hours ago',
      status: 'info' as const
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: 'Design shared',
      description: 'Social Media Templates shared with client',
      time: '1 day ago',
      status: 'success' as const
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'Export completed',
      description: 'Presentation Deck exported as PDF',
      time: '2 days ago',
      status: 'info' as const
    }
  ]

  const galleryItems = canvasProjects.map(project => ({
    id: project.id,
    src: project.thumbnail,
    alt: project.name,
    title: project.name,
    description: `${project.artboards} artboards • ${project.collaborators} collaborators`
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'shared': return 'bg-purple-100 text-purple-700'
      case 'archived': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/30 to-purple-50/40 dark:from-pink-950 dark:via-rose-950/30 dark:to-purple-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Palette className="w-10 h-10 text-pink-600" />
              Canvas Studio
            </h1>
            <p className="text-muted-foreground">
              Create stunning designs and collaborate in real-time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Zap />}
              ariaLabel="Templates"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="pink"
              to="purple"
              onClick={() => console.log('New canvas')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Canvas
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Templates Quick Actions */}
        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Start Templates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <BentoQuickAction
              icon={<Layout className="w-6 h-6" />}
              title="UI Design"
              description="App interfaces"
              onClick={() => console.log('UI Design')}
            />
            <BentoQuickAction
              icon={<FileImage className="w-6 h-6" />}
              title="Social Media"
              description="Posts & stories"
              onClick={() => console.log('Social Media')}
            />
            <BentoQuickAction
              icon={<Maximize2 className="w-6 h-6" />}
              title="Presentation"
              description="Slides & decks"
              onClick={() => console.log('Presentation')}
            />
            <BentoQuickAction
              icon={<Palette className="w-6 h-6" />}
              title="Illustration"
              description="Creative art"
              onClick={() => console.log('Illustration')}
            />
          </div>
        </BentoCard>

        {/* Search and View Options */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search canvases..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton
              variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('all')}
            >
              All Projects
            </PillButton>
            <PillButton
              variant={selectedFilter === 'recent' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('recent')}
            >
              Recent
            </PillButton>
            <PillButton
              variant={selectedFilter === 'shared' ? 'primary' : 'ghost'}
              onClick={() => setSelectedFilter('shared')}
            >
              Shared
            </PillButton>
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <IconButton
              icon={<Grid />}
              ariaLabel="Grid view"
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            />
            <IconButton
              icon={<List />}
              ariaLabel="List view"
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery View */}
            {viewMode === 'grid' && (
              <BentoGallery
                title="🎨 My Canvases"
                items={galleryItems}
                columns={2}
              />
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <BentoCard className="p-6">
                <h3 className="text-xl font-semibold mb-4">My Canvases</h3>
                <div className="space-y-4">
                  {canvasProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{project.name}</h4>
                            {project.starred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Maximize2 className="w-3 h-3" />
                              {project.artboards} artboards
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {project.collaborators} collaborators
                            </div>
                            <div className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {project.layers} layers
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Open', project.id)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Open
                          </ModernButton>
                          <ModernButton
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('Share', project.id)}
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ModernButton
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => console.log('New canvas')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Canvas
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Templates')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Browse Templates
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Import')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import Design
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Collaborate')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Invite Team
                </ModernButton>
              </div>
            </BentoCard>

            {/* Top Projects */}
            <RankingList
              title="📊 Most Complex Designs"
              items={topProjects}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Designs This Week" value="12" change={25.0} />
                <MiniKPI label="Avg. Artboards" value="8.5" change={12.5} />
                <MiniKPI label="Team Collaboration" value="94%" change={8.3} />
                <MiniKPI label="Export Rate" value="156" change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Design Tools Preview */}
        <BentoCard className="p-8">
          <div className="text-center space-y-4">
            <Palette className="w-16 h-16 mx-auto text-pink-600" />
            <h2 className="text-3xl font-bold">Professional Design Tools</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create stunning designs. Vector editing, layers, real-time collaboration, and powerful export options.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">∞</div>
                <div className="text-sm text-muted-foreground">Unlimited Artboards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-muted-foreground">Real-time Sync</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100+</div>
                <div className="text-sm text-muted-foreground">Export Formats</div>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  )
}
