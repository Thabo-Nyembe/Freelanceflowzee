"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  FileText,
  Plus,
  Image,
  Video,
  Mic,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  TrendingUp,
  Share2,
  Award,
  Zap
} from 'lucide-react'

/**
 * Content Studio V2 - Groundbreaking Content Creation & Management
 * Showcases content management features with modern components
 */
export default function ContentStudioV2() {
  const [selectedType, setSelectedType] = useState<'all' | 'blog' | 'video' | 'social'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all')

  const stats = [
    { label: 'Total Content', value: '342', change: 25.3, icon: <FileText className="w-5 h-5" /> },
    { label: 'Published', value: '247', change: 18.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Scheduled', value: '42', change: 12.5, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Total Views', value: '124K', change: 32.1, icon: <Eye className="w-5 h-5" /> }
  ]

  const contentItems = [
    {
      id: '1',
      title: '10 Tips for Better Productivity',
      type: 'Blog Post',
      status: 'published',
      publishDate: '2 days ago',
      views: 8470,
      engagement: 89,
      thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=225&fit=crop'
    },
    {
      id: '2',
      title: 'Product Demo Video',
      type: 'Video',
      status: 'scheduled',
      scheduledDate: 'Tomorrow 9:00 AM',
      views: 0,
      engagement: 0,
      thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=225&fit=crop'
    },
    {
      id: '3',
      title: 'Social Media Campaign',
      type: 'Social',
      status: 'draft',
      lastEdited: '5 hours ago',
      views: 0,
      engagement: 0,
      thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop'
    },
    {
      id: '4',
      title: 'Customer Success Podcast',
      type: 'Podcast',
      status: 'published',
      publishDate: '1 week ago',
      views: 12470,
      engagement: 247,
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=225&fit=crop'
    }
  ]

  const contentCalendar = [
    { date: 'Today', items: 2, type: 'Publishing 2 posts' },
    { date: 'Tomorrow', items: 3, type: '1 video, 2 social posts' },
    { date: 'This Week', items: 8, type: 'Mixed content' },
    { date: 'Next Week', items: 12, type: 'Campaign launch' }
  ]

  const contentTypes = [
    { name: 'Blog Posts', count: 124, color: 'from-blue-500 to-cyan-500', icon: <FileText className="w-5 h-5" /> },
    { name: 'Videos', count: 67, color: 'from-purple-500 to-pink-500', icon: <Video className="w-5 h-5" /> },
    { name: 'Social Media', count: 89, color: 'from-green-500 to-emerald-500', icon: <Image className="w-5 h-5" /> },
    { name: 'Podcasts', count: 34, color: 'from-orange-500 to-red-500', icon: <Mic className="w-5 h-5" /> }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Content published', description: '10 Tips for Better Productivity', time: '2 days ago', status: 'success' as const },
    { icon: <Edit className="w-5 h-5" />, title: 'Draft updated', description: 'Social Media Campaign edited', time: '5 hours ago', status: 'info' as const },
    { icon: <Calendar className="w-5 h-5" />, title: 'Content scheduled', description: 'Product Demo Video scheduled', time: '1 day ago', status: 'info' as const },
    { icon: <Share2 className="w-5 h-5" />, title: 'Content shared', description: 'Customer Success Podcast shared', time: '3 days ago', status: 'success' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Blog Post': return <FileText className="w-4 h-4" />
      case 'Video': return <Video className="w-4 h-4" />
      case 'Social': return <Image className="w-4 h-4" />
      case 'Podcast': return <Mic className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-emerald-600" />
              Content Studio
            </h1>
            <p className="text-muted-foreground">Create, manage, and publish content</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => console.log('New content')}>
            <Plus className="w-5 h-5 mr-2" />
            Create Content
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<FileText />} title="Blog Post" description="Write article" onClick={() => console.log('Blog')} />
          <BentoQuickAction icon={<Video />} title="Video" description="Upload video" onClick={() => console.log('Video')} />
          <BentoQuickAction icon={<Image />} title="Social Post" description="Quick share" onClick={() => console.log('Social')} />
          <BentoQuickAction icon={<Mic />} title="Podcast" description="Audio content" onClick={() => console.log('Podcast')} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PillButton variant={selectedType === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedType('all')}>
            All Content
          </PillButton>
          <PillButton variant={selectedType === 'blog' ? 'primary' : 'ghost'} onClick={() => setSelectedType('blog')}>
            <FileText className="w-4 h-4 mr-2" />
            Blog
          </PillButton>
          <PillButton variant={selectedType === 'video' ? 'primary' : 'ghost'} onClick={() => setSelectedType('video')}>
            <Video className="w-4 h-4 mr-2" />
            Video
          </PillButton>
          <PillButton variant={selectedType === 'social' ? 'primary' : 'ghost'} onClick={() => setSelectedType('social')}>
            <Image className="w-4 h-4 mr-2" />
            Social
          </PillButton>
          <div className="w-px h-6 bg-border" />
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All
          </PillButton>
          <PillButton variant={selectedStatus === 'draft' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('draft')}>
            Drafts
          </PillButton>
          <PillButton variant={selectedStatus === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('scheduled')}>
            Scheduled
          </PillButton>
          <PillButton variant={selectedStatus === 'published' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('published')}>
            Published
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Content Library</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="text-xs px-2 py-1 rounded-md bg-black/70 text-white flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        {item.status === 'published' && (
                          <>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {item.engagement} engaged
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.publishDate}
                            </span>
                          </>
                        )}
                        {item.status === 'scheduled' && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.scheduledDate}
                          </span>
                        )}
                        {item.status === 'draft' && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Edited {item.lastEdited}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', item.id)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </ModernButton>
                        {item.status === 'published' && (
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', item.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                        )}
                        {item.status === 'draft' && (
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Publish', item.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Publish
                          </ModernButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Content Calendar
              </h3>
              <div className="space-y-3">
                {contentCalendar.map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.date}</span>
                      <span className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700">
                        {item.items} items
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Types</h3>
              <div className="space-y-3">
                {contentTypes.map((type) => (
                  <div key={type.name} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center text-white`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{type.name}</p>
                        <p className="text-xs text-muted-foreground">{type.count} items</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Engagement" value="89" change={25.3} />
                <MiniKPI label="Publishing Rate" value="12/week" change={18.7} />
                <MiniKPI label="Total Reach" value="124K" change={32.1} />
                <MiniKPI label="Content ROI" value="3.2x" change={15.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
