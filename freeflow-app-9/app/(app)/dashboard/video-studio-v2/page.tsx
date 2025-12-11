"use client"

import { useState } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoChart,
  BentoGallery
} from '@/components/ui/bento-grid-advanced'
import {
  AIThinking,
  AIResult,
  AIResultCard
} from '@/components/ui/ai-components'
import {
  StatGrid,
  ProgressCard,
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
  Video,
  Play,
  Plus,
  Upload,
  Camera,
  Scissors,
  Sparkles,
  Brain,
  Eye,
  Download,
  Share2,
  TrendingUp,
  BarChart3,
  Settings,
  Film,
  Wand2,
  Target,
  Clock
} from 'lucide-react'

/**
 * Video Studio V2 - Groundbreaking Video Creation
 * Showcases video editing with AI components
 */
export default function VideoStudioV2() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'projects' | 'templates' | 'assets'>('projects')

  // Sample video projects
  const videoProjects = [
    {
      id: '1',
      title: 'Product Demo Video',
      description: 'Marketing video for new product launch',
      duration: 180,
      status: 'ready',
      views: 1245,
      likes: 89,
      thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400'
    },
    {
      id: '2',
      title: 'Client Testimonial',
      description: 'Customer success story',
      duration: 120,
      status: 'processing',
      views: 678,
      likes: 45,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
    },
    {
      id: '3',
      title: 'Tutorial Series Ep. 1',
      description: 'How to use our platform',
      duration: 240,
      status: 'ready',
      views: 2134,
      likes: 156,
      thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400'
    },
    {
      id: '4',
      title: 'Team Introduction',
      description: 'Meet our team video',
      duration: 90,
      status: 'draft',
      views: 0,
      likes: 0,
      thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'
    }
  ]

  // Video stats
  const stats = [
    {
      label: 'Total Videos',
      value: '24',
      change: 12.5,
      icon: <Video className="w-5 h-5" />
    },
    {
      label: 'Total Views',
      value: '12.4K',
      change: 25.3,
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: 'Engagement',
      value: '4.8%',
      change: 8.7,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Render Time',
      value: '2.3h',
      change: -15.2,
      icon: <Clock className="w-5 h-5" />
    }
  ]

  // AI Analysis Results
  const aiAnalysisResults = [
    {
      title: 'Engagement Score',
      description: 'Video performance above average',
      score: 92,
      confidence: 95,
      metadata: [
        { label: 'Watch Time', value: '85%' },
        { label: 'Completion Rate', value: '78%' }
      ]
    },
    {
      title: 'Quality Assessment',
      description: 'Professional-grade production',
      score: 88,
      confidence: 90,
      metadata: [
        { label: 'Resolution', value: '4K' },
        { label: 'Audio Quality', value: 'High' }
      ]
    },
    {
      title: 'SEO Optimization',
      description: 'Well optimized for search',
      score: 85,
      confidence: 88,
      metadata: [
        { label: 'Keywords', value: 'Optimized' },
        { label: 'Metadata', value: 'Complete' }
      ]
    }
  ]

  // Recent activity
  const recentActivity = [
    {
      icon: <Video className="w-5 h-5" />,
      title: 'Video rendered successfully',
      description: 'Product Demo Video is ready',
      time: '10 minutes ago',
      status: 'success' as const
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'AI enhancement completed',
      description: 'Auto-captions added to Tutorial video',
      time: '1 hour ago',
      status: 'success' as const
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: 'New asset uploaded',
      description: 'Background music added to library',
      time: '2 hours ago',
      status: 'info' as const
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: 'Video shared',
      description: 'Client Testimonial shared on social media',
      time: '3 hours ago',
      status: 'info' as const
    }
  ]

  const galleryItems = videoProjects.map(video => ({
    id: video.id,
    src: video.thumbnail,
    alt: video.title,
    title: video.title,
    description: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <Play className="w-3 h-3" />
      case 'processing': return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'draft': return <Pencil className="w-3 h-3" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/40 dark:from-purple-950 dark:via-pink-950/30 dark:to-rose-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Film className="w-10 h-10 text-purple-600" />
              Video Studio
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your video content
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Camera />}
              ariaLabel="Record"
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
              from="purple"
              to="pink"
              onClick={() => console.log('New video')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Video
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Tabs */}
        <div className="flex items-center gap-3">
          <PillButton
            variant={selectedTab === 'projects' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('projects')}
          >
            <Video className="w-4 h-4 mr-2" />
            My Videos
          </PillButton>
          <PillButton
            variant={selectedTab === 'templates' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('templates')}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Templates
          </PillButton>
          <PillButton
            variant={selectedTab === 'assets' ? 'primary' : 'ghost'}
            onClick={() => setSelectedTab('assets')}
          >
            <Layers className="w-4 h-4 mr-2" />
            Assets
          </PillButton>
        </div>

        {/* AI Processing State */}
        {isProcessing && (
          <BentoCard gradient="purple" className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <AIThinking
                variant="sparkles"
                message="AI is enhancing your video..."
              />
              <div className="text-center max-w-md">
                <p className="text-sm text-white/90">
                  Our AI is adding captions, improving audio, and optimizing your video for maximum engagement.
                </p>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Gallery */}
          <div className="lg:col-span-2 space-y-6">
            <BentoGallery
              title="📹 Recent Videos"
              items={galleryItems}
              columns={2}
            />

            {/* Video Projects List */}
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Video Projects</h3>
              <div className="space-y-4">
                {videoProjects.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{video.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(video.status)}`}>
                            {getStatusIcon(video.status)}
                            {video.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {video.views} views
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {video.likes} likes
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Edit', video.id)}
                        >
                          <Scissors className="w-3 h-3 mr-1" />
                          Edit
                        </ModernButton>
                        {video.status === 'ready' && (
                          <ModernButton
                            variant="primary"
                            size="sm"
                            onClick={() => console.log('Share', video.id)}
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
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
                  onClick={() => console.log('Record')}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Record Screen
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Upload')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsProcessing(true)
                    setTimeout(() => setIsProcessing(false), 3000)
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Enhance
                </ModernButton>
                <ModernButton
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => console.log('Templates')}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Use Template
                </ModernButton>
              </div>
            </BentoCard>

            {/* Progress Card */}
            <ProgressCard
              title="Render Queue"
              current={3}
              goal={10}
              icon={<Target className="w-5 h-5" />}
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
                <MiniKPI label="Avg. Watch Time" value="3:45" change={12.5} />
                <MiniKPI label="Completion Rate" value="78%" change={5.2} />
                <MiniKPI label="Engagement Rate" value="4.8%" change={8.7} />
                <MiniKPI label="Total Renders" value="156" change={-2.1} />
              </div>
            </BentoCard>
          </div>
        </div>

        {/* AI Analysis Results */}
        {!isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Video Analysis
              </h3>
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => console.log('Run analysis')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze All Videos
              </ModernButton>
            </div>

            <BentoGrid columns={3} gap="md">
              {aiAnalysisResults.map((analysis, index) => (
                <AIResultCard
                  key={index}
                  title={analysis.title}
                  description={analysis.description}
                  score={analysis.score}
                  confidence={analysis.confidence}
                  metadata={analysis.metadata}
                />
              ))}
            </BentoGrid>
          </div>
        )}

        {/* Performance Chart */}
        <BentoChart
          title="Video Performance Trend"
          subtitle="Monthly views and engagement"
          action={
            <ModernButton variant="ghost" size="sm">
              View Details
            </ModernButton>
          }
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <BarChart3 className="w-16 h-16 mx-auto text-purple-600" />
              <p className="text-muted-foreground">Chart visualization ready</p>
              <div className="flex gap-6 justify-center">
                <MiniKPI label="This Month" value="12.4K" change={25.3} />
                <MiniKPI label="Last Month" value="9.8K" change={12.1} />
              </div>
            </div>
          </div>
        </BentoChart>
      </div>
    </div>
  )
}

// Additional import to fix typing
import { RefreshCw, Pencil, Layers } from 'lucide-react'
