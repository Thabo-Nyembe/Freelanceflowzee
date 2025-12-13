'use client'

import { useState } from 'react'
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Plus,
  Play,
  Eye,
  Star,
  MessageSquare,
  Users,
  Download,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Code,
  Video,
  FileText,
  Award,
  Target
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type TutorialStatus = 'published' | 'draft' | 'scheduled' | 'archived'
type TutorialLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type TutorialFormat = 'video' | 'text' | 'interactive' | 'mixed'

interface Tutorial {
  id: string
  title: string
  description: string
  status: TutorialStatus
  level: TutorialLevel
  format: TutorialFormat
  duration: number
  lessons: number
  author: string
  publishedAt: string
  views: number
  enrollments: number
  completions: number
  rating: number
  reviews: number
  likes: number
  comments: number
  tags: string[]
  prerequisites: string[]
}

export default function TutorialsPage() {
  const [viewMode, setViewMode] = useState<'all' | TutorialStatus>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | TutorialLevel>('all')

  const tutorials: Tutorial[] = [
    {
      id: 'TUT-2847',
      title: 'Complete Beginner\'s Guide to the Platform',
      description: 'Learn everything you need to get started from scratch',
      status: 'published',
      level: 'beginner',
      format: 'video',
      duration: 120,
      lessons: 12,
      author: 'Sarah Johnson',
      publishedAt: '2024-01-10',
      views: 8473,
      enrollments: 2847,
      completions: 1678,
      rating: 4.8,
      reviews: 456,
      likes: 847,
      comments: 234,
      tags: ['beginner', 'getting-started', 'basics'],
      prerequisites: []
    },
    {
      id: 'TUT-2848',
      title: 'Advanced API Integration Techniques',
      description: 'Master complex API integration patterns and best practices',
      status: 'published',
      level: 'advanced',
      format: 'mixed',
      duration: 180,
      lessons: 15,
      author: 'Mike Chen',
      publishedAt: '2024-01-08',
      views: 4567,
      enrollments: 1234,
      completions: 567,
      rating: 4.9,
      reviews: 234,
      likes: 567,
      comments: 123,
      tags: ['api', 'advanced', 'integration'],
      prerequisites: ['Basic API knowledge', 'REST fundamentals']
    },
    {
      id: 'TUT-2849',
      title: 'Building Dashboards Like a Pro',
      description: 'Create stunning, data-driven dashboards step by step',
      status: 'published',
      level: 'intermediate',
      format: 'interactive',
      duration: 90,
      lessons: 8,
      author: 'Emily Davis',
      publishedAt: '2024-01-12',
      views: 6234,
      enrollments: 1847,
      completions: 923,
      rating: 4.7,
      reviews: 178,
      likes: 423,
      comments: 89,
      tags: ['dashboard', 'data-viz', 'intermediate'],
      prerequisites: ['Platform basics']
    },
    {
      id: 'TUT-2850',
      title: 'Security Best Practices',
      description: 'Comprehensive guide to securing your applications',
      status: 'published',
      level: 'expert',
      format: 'text',
      duration: 240,
      lessons: 20,
      author: 'David Wilson',
      publishedAt: '2024-01-05',
      views: 3456,
      enrollments: 892,
      completions: 234,
      rating: 4.9,
      reviews: 145,
      likes: 345,
      comments: 67,
      tags: ['security', 'best-practices', 'expert'],
      prerequisites: ['Advanced platform knowledge', 'Security fundamentals']
    },
    {
      id: 'TUT-2851',
      title: 'Quick Start: Your First Project',
      description: '15-minute guide to creating your first project',
      status: 'published',
      level: 'beginner',
      format: 'video',
      duration: 15,
      lessons: 3,
      author: 'Tom Anderson',
      publishedAt: '2024-01-14',
      views: 12847,
      enrollments: 4567,
      completions: 3456,
      rating: 4.6,
      reviews: 567,
      likes: 1234,
      comments: 345,
      tags: ['quick-start', 'project', 'beginner'],
      prerequisites: []
    },
    {
      id: 'TUT-2852',
      title: 'Performance Optimization Masterclass',
      description: 'Advanced techniques for optimizing application performance',
      status: 'draft',
      level: 'expert',
      format: 'mixed',
      duration: 300,
      lessons: 25,
      author: 'Lisa Brown',
      publishedAt: '2024-02-01',
      views: 234,
      enrollments: 45,
      completions: 0,
      rating: 0,
      reviews: 0,
      likes: 23,
      comments: 5,
      tags: ['performance', 'optimization', 'expert'],
      prerequisites: ['Advanced development skills', 'Platform architecture']
    }
  ]

  const filteredTutorials = tutorials.filter(tutorial => {
    if (viewMode !== 'all' && tutorial.status !== viewMode) return false
    if (levelFilter !== 'all' && tutorial.level !== levelFilter) return false
    return true
  })

  const totalTutorials = tutorials.length
  const publishedTutorials = tutorials.filter(t => t.status === 'published').length
  const totalEnrollments = tutorials.reduce((sum, t) => sum + t.enrollments, 0)
  const avgCompletionRate = (tutorials.reduce((sum, t) => sum + (t.completions / t.enrollments), 0) / tutorials.length) * 100

  const getStatusColor = (status: TutorialStatus) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'scheduled': return 'text-blue-600 bg-blue-50'
      case 'archived': return 'text-slate-600 bg-slate-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getLevelColor = (level: TutorialLevel) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50'
      case 'intermediate': return 'text-blue-600 bg-blue-50'
      case 'advanced': return 'text-orange-600 bg-orange-50'
      case 'expert': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getFormatIcon = (format: TutorialFormat) => {
    switch (format) {
      case 'video': return <Video className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'interactive': return <Code className="w-4 h-4" />
      case 'mixed': return <Play className="w-4 h-4" />
      default: return <GraduationCap className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-900 via-pink-800 to-fuchsia-900 bg-clip-text text-transparent mb-2">
            Tutorials
          </h1>
          <p className="text-slate-600">Interactive learning content and step-by-step guides</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Tutorials',
              value: totalTutorials.toString(),
              icon: GraduationCap,
              trend: { value: 15, isPositive: true },
              color: 'rose'
            },
            {
              label: 'Published',
              value: publishedTutorials.toString(),
              icon: CheckCircle2,
              trend: { value: 12, isPositive: true },
              color: 'pink'
            },
            {
              label: 'Enrollments',
              value: totalEnrollments.toLocaleString(),
              icon: Users,
              trend: { value: 28, isPositive: true },
              color: 'fuchsia'
            },
            {
              label: 'Completion Rate',
              value: `${avgCompletionRate.toFixed(0)}%`,
              icon: Award,
              trend: { value: 8, isPositive: true },
              color: 'purple'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'New Tutorial',
              description: 'Create content',
              icon: Plus,
              gradient: 'from-rose-500 to-pink-600',
              onClick: () => console.log('New tutorial')
            },
            {
              title: 'View Published',
              description: 'Live tutorials',
              icon: Play,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Published')
            },
            {
              title: 'Analytics',
              description: 'View metrics',
              icon: BarChart3,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Enrollments',
              description: 'User progress',
              icon: Users,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Enrollments')
            },
            {
              title: 'Certificates',
              description: 'Completion awards',
              icon: Award,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Certificates')
            },
            {
              title: 'Categories',
              description: 'Organize content',
              icon: Target,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Categories')
            },
            {
              title: 'Settings',
              description: 'Configure',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Export',
              description: 'Download data',
              icon: Download,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Export')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Tutorials"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Published"
              isActive={viewMode === 'published'}
              onClick={() => setViewMode('published')}
            />
            <PillButton
              label="Draft"
              isActive={viewMode === 'draft'}
              onClick={() => setViewMode('draft')}
            />
            <PillButton
              label="Scheduled"
              isActive={viewMode === 'scheduled'}
              onClick={() => setViewMode('scheduled')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Levels"
              isActive={levelFilter === 'all'}
              onClick={() => setLevelFilter('all')}
            />
            <PillButton
              label="Beginner"
              isActive={levelFilter === 'beginner'}
              onClick={() => setLevelFilter('beginner')}
            />
            <PillButton
              label="Intermediate"
              isActive={levelFilter === 'intermediate'}
              onClick={() => setLevelFilter('intermediate')}
            />
            <PillButton
              label="Advanced"
              isActive={levelFilter === 'advanced'}
              onClick={() => setLevelFilter('advanced')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Tutorials List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="w-5 h-5 text-rose-600" />
                      <h3 className="font-semibold text-slate-900">{tutorial.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{tutorial.description}</p>
                    <p className="text-xs text-slate-500">Tutorial ID: {tutorial.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tutorial.status)}`}>
                      {tutorial.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(tutorial.level)}`}>
                      {tutorial.level}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Format</p>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(tutorial.format)}
                      <span className="text-sm font-medium text-slate-900 capitalize">{tutorial.format}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{tutorial.duration} min</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Lessons</p>
                    <span className="text-sm font-medium text-slate-900">{tutorial.lessons}</span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Author</p>
                    <span className="text-sm font-medium text-slate-900">{tutorial.author}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Enrollments</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {tutorial.enrollments.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Completions</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {tutorial.completions.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Views</p>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">
                        {tutorial.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {tutorial.rating > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Rating</span>
                      <span className="text-xs font-medium text-slate-900">
                        {tutorial.rating}/5.0 ({tutorial.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(tutorial.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {tutorial.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Prerequisites</p>
                    <ul className="space-y-1">
                      {tutorial.prerequisites.map((prereq, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {tutorial.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-rose-600 hover:to-pink-700 transition-all">
                    Start Learning
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Preview
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Total Enrollments */}
            <MiniKPI
              label="Total Enrollments"
              value={totalEnrollments.toLocaleString()}
              icon={Users}
              trend={{ value: 28, isPositive: true }}
              className="bg-gradient-to-br from-rose-500 to-pink-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={[
                {
                  id: '1',
                  title: 'Tutorial completed',
                  description: 'Quick Start guide',
                  timestamp: '5 minutes ago',
                  type: 'success'
                },
                {
                  id: '2',
                  title: 'New enrollment',
                  description: 'API Integration tutorial',
                  timestamp: '15 minutes ago',
                  type: 'info'
                },
                {
                  id: '3',
                  title: 'Tutorial published',
                  description: 'Beginner\'s Guide',
                  timestamp: '2 hours ago',
                  type: 'success'
                },
                {
                  id: '4',
                  title: '5-star rating received',
                  description: 'Security Best Practices',
                  timestamp: '3 hours ago',
                  type: 'success'
                }
              ]}
            />

            {/* Popular Tutorials */}
            <RankingList
              title="Most Popular"
              items={[
                { label: 'Quick Start', value: '4.6k', rank: 1 },
                { label: 'Beginner Guide', value: '2.8k', rank: 2 },
                { label: 'Dashboard Pro', value: '1.8k', rank: 3 },
                { label: 'API Integration', value: '1.2k', rank: 4 },
                { label: 'Security Practices', value: '892', rank: 5 }
              ]}
            />

            {/* Learning Progress */}
            <ProgressCard
              title="Avg Completion Rate"
              progress={avgCompletionRate}
              subtitle="Across all tutorials"
              color="rose"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
