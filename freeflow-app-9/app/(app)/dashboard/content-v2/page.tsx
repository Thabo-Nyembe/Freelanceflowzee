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
  FileText,
  Globe,
  Edit3,
  Eye,
  Clock,
  Users,
  Tag,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Archive,
  Trash2
} from 'lucide-react'

/**
 * Content V2 - Content Management System
 * Manages articles, pages, blog posts, and content workflow
 */
export default function ContentV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'article' | 'page' | 'blog'>('all')

  const stats = [
    { label: 'Total Content', value: '3,847', change: 28.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Published', value: '2,134', change: 15.2, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Total Views', value: '847K', change: 42.7, icon: <Eye className="w-5 h-5" /> },
    { label: 'Avg Read Time', value: '4.2m', change: 8.3, icon: <Clock className="w-5 h-5" /> }
  ]

  const contentItems = [
    {
      id: '1',
      title: '10 Tips for Better Product Design in 2024',
      type: 'blog',
      status: 'published',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      views: 34700,
      publishDate: '2024-02-10',
      lastUpdated: '2024-02-11',
      readTime: '8 min',
      tags: ['Design', 'UX', 'Tips'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      title: 'Getting Started with Our Platform',
      type: 'article',
      status: 'published',
      author: 'Michael Chen',
      avatar: 'MC',
      views: 28400,
      publishDate: '2024-02-09',
      lastUpdated: '2024-02-10',
      readTime: '5 min',
      tags: ['Tutorial', 'Getting Started'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      title: 'New Features Coming in Q2 2024',
      type: 'blog',
      status: 'scheduled',
      author: 'Emily Rodriguez',
      avatar: 'ER',
      views: 0,
      publishDate: '2024-04-01',
      lastUpdated: '2024-02-12',
      readTime: '6 min',
      tags: ['Product', 'Roadmap'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      title: 'Privacy Policy Updates',
      type: 'page',
      status: 'draft',
      author: 'David Park',
      avatar: 'DP',
      views: 0,
      publishDate: null,
      lastUpdated: '2024-02-12',
      readTime: '3 min',
      tags: ['Legal', 'Policy'],
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      title: 'How to Build a Successful Team',
      type: 'blog',
      status: 'published',
      author: 'Lisa Anderson',
      avatar: 'LA',
      views: 19200,
      publishDate: '2024-02-08',
      lastUpdated: '2024-02-09',
      readTime: '7 min',
      tags: ['Leadership', 'Team Building'],
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      title: 'API Documentation v2.0',
      type: 'article',
      status: 'published',
      author: 'James Wilson',
      avatar: 'JW',
      views: 15600,
      publishDate: '2024-02-07',
      lastUpdated: '2024-02-11',
      readTime: '12 min',
      tags: ['Technical', 'API', 'Docs'],
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '7',
      title: 'Customer Success Stories',
      type: 'page',
      status: 'published',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      views: 12700,
      publishDate: '2024-02-06',
      lastUpdated: '2024-02-10',
      readTime: '9 min',
      tags: ['Case Study', 'Success'],
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '8',
      title: 'Marketing Strategies for 2024',
      type: 'blog',
      status: 'draft',
      author: 'Michael Chen',
      avatar: 'MC',
      views: 0,
      publishDate: null,
      lastUpdated: '2024-02-12',
      readTime: '10 min',
      tags: ['Marketing', 'Strategy'],
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const topContent = [
    { rank: 1, name: 'Product Design Tips', avatar: '📝', value: '34.7K', change: 45.2 },
    { rank: 2, name: 'Platform Guide', avatar: '📚', value: '28.4K', change: 32.1 },
    { rank: 3, name: 'Team Building', avatar: '👥', value: '19.2K', change: 23.7 },
    { rank: 4, name: 'API Documentation', avatar: '💻', value: '15.6K', change: 18.9 },
    { rank: 5, name: 'Success Stories', avatar: '⭐', value: '12.7K', change: 12.3 }
  ]

  const recentActivity = [
    { icon: <Edit3 className="w-4 h-4" />, title: 'Updated Privacy Policy', time: '10m ago', type: 'info' as const },
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Published new blog post', time: '1h ago', type: 'success' as const },
    { icon: <Clock className="w-4 h-4" />, title: 'Scheduled Q2 announcement', time: '3h ago', type: 'warning' as const },
    { icon: <Archive className="w-4 h-4" />, title: 'Archived old content', time: '5h ago', type: 'info' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Published' }
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Draft' }
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Scheduled' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: status }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-emerald-600" />
              Content Management
            </h1>
            <p className="text-muted-foreground">Create, edit, and publish content across your platform</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => console.log('Create content')}>
            <Plus className="w-5 h-5 mr-2" />
            New Content
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Edit3 />} title="Draft" description="Work on drafts" onClick={() => setSelectedStatus('draft')} />
          <BentoQuickAction icon={<CheckCircle />} title="Published" description="View live" onClick={() => setSelectedStatus('published')} />
          <BentoQuickAction icon={<Clock />} title="Scheduled" description="Upcoming" onClick={() => setSelectedStatus('scheduled')} />
          <BentoQuickAction icon={<Archive />} title="Archive" description="Old content" onClick={() => console.log('Archive')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Content
          </PillButton>
          <PillButton variant={selectedStatus === 'published' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('published')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Published
          </PillButton>
          <PillButton variant={selectedStatus === 'draft' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('draft')}>
            <Edit3 className="w-4 h-4 mr-2" />
            Draft
          </PillButton>
          <PillButton variant={selectedStatus === 'scheduled' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('scheduled')}>
            <Clock className="w-4 h-4 mr-2" />
            Scheduled
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Content Items</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {contentItems.map((item) => {
                  const statusBadge = getStatusBadge(item.status)

                  return (
                    <div key={item.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{item.title}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-xs font-semibold`}>
                                  {item.avatar}
                                </div>
                                <span>{item.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span className="capitalize">{item.type}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.readTime}</span>
                              </div>
                              {item.views > 0 && (
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{(item.views / 1000).toFixed(1)}K views</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-muted text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            {item.publishDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Published {item.publishDate}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Last updated {item.lastUpdated}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <ModernButton variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Preview
                            </ModernButton>
                            <ModernButton variant="primary" size="sm">
                              <Edit3 className="w-3 h-3 mr-1" />
                              Edit
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Content Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Blog Posts</p>
                  </div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-green-600 mt-1">+23.4% this month</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Pages</p>
                  </div>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-xs text-green-600 mt-1">+15.2% this month</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit3 className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Articles</p>
                  </div>
                  <p className="text-2xl font-bold">2,258</p>
                  <p className="text-xs text-green-600 mt-1">+18.7% this month</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Total Views</p>
                  </div>
                  <p className="text-2xl font-bold">847K</p>
                  <p className="text-xs text-green-600 mt-1">+42.7% this month</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🔥 Most Popular" items={topContent} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Content" value="3,847" change={28.4} />
                <MiniKPI label="Published" value="2,134" change={15.2} />
                <MiniKPI label="Total Views" value="847K" change={42.7} />
                <MiniKPI label="Avg Read Time" value="4.2m" change={8.3} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Publishing Goal"
              value={89}
              target={100}
              label="Content published this month"
              color="from-emerald-500 to-teal-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Content by Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Published</span>
                    </div>
                    <span className="text-xs font-semibold">2,134 (55%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '55%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Draft</span>
                    </div>
                    <span className="text-xs font-semibold">1,247 (32%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-500 to-gray-400" style={{ width: '32%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Scheduled</span>
                    </div>
                    <span className="text-xs font-semibold">342 (9%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '9%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Archived</span>
                    </div>
                    <span className="text-xs font-semibold">124 (4%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '4%' }} />
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
