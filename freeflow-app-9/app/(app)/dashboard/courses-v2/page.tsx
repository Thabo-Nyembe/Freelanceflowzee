"use client"

import { useState } from 'react'
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Users,
  Clock,
  Star,
  CheckCircle2,
  PlayCircle,
  Award,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Video,
  FileText,
  Zap,
  BarChart3
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type CourseStatus = 'all' | 'published' | 'draft' | 'archived'
type CourseCategory = 'all' | 'development' | 'business' | 'design' | 'marketing' | 'data-science'

export default function CoursesV2Page() {
  const [status, setStatus] = useState<CourseStatus>('all')
  const [category, setCategory] = useState<CourseCategory>('all')

  const stats = [
    {
      label: 'Total Courses',
      value: '284',
      change: '+18.2%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      label: 'Active Students',
      value: '12.8K',
      change: '+24.7%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Completion Rate',
      value: '87.4%',
      change: '+12.4%',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-purple-600'
    },
    {
      label: 'Avg Rating',
      value: '4.7/5',
      change: '+8.2%',
      trend: 'up' as const,
      icon: Star,
      color: 'text-yellow-600'
    }
  ]

  const quickActions = [
    {
      label: 'New Course',
      description: 'Create course curriculum',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Upload Video',
      description: 'Add lecture content',
      icon: Video,
      color: 'from-red-500 to-pink-500'
    },
    {
      label: 'Course Analytics',
      description: 'View performance data',
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Export Reports',
      description: 'Download course data',
      icon: Download,
      color: 'from-orange-500 to-amber-500'
    },
    {
      label: 'Student Progress',
      description: 'Track completions',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500'
    },
    {
      label: 'Certificates',
      description: 'Issue credentials',
      icon: Award,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      label: 'Quick Enroll',
      description: 'Add students',
      icon: Zap,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      label: 'Resources',
      description: 'Course materials',
      icon: FileText,
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const courses = [
    {
      id: 'CRS-2847',
      title: 'Complete Web Development Bootcamp 2024',
      description: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB',
      category: 'development',
      instructor: 'Sarah Johnson',
      status: 'published',
      students: 2847,
      rating: 4.9,
      reviews: 847,
      duration: 42,
      lectures: 284,
      completionRate: 92.4,
      price: 99.99,
      lastUpdated: '2024-02-10',
      level: 'Beginner',
      language: 'English',
      enrolled: 3247
    },
    {
      id: 'CRS-2846',
      title: 'Advanced Machine Learning & AI',
      description: 'Deep learning, neural networks, and practical AI applications',
      category: 'data-science',
      instructor: 'Michael Chen',
      status: 'published',
      students: 1847,
      rating: 4.8,
      reviews: 524,
      duration: 56,
      lectures: 342,
      completionRate: 84.7,
      price: 149.99,
      lastUpdated: '2024-02-12',
      level: 'Advanced',
      language: 'English',
      enrolled: 2124
    },
    {
      id: 'CRS-2845',
      title: 'UI/UX Design Masterclass',
      description: 'Learn Figma, design principles, and user research methods',
      category: 'design',
      instructor: 'Emma Wilson',
      status: 'published',
      students: 1524,
      rating: 4.7,
      reviews: 412,
      duration: 28,
      lectures: 156,
      completionRate: 88.2,
      price: 79.99,
      lastUpdated: '2024-02-08',
      level: 'Intermediate',
      language: 'English',
      enrolled: 1847
    },
    {
      id: 'CRS-2844',
      title: 'Digital Marketing Strategy 2024',
      description: 'SEO, social media, content marketing, and analytics',
      category: 'marketing',
      instructor: 'David Park',
      status: 'published',
      students: 2124,
      rating: 4.6,
      reviews: 628,
      duration: 32,
      lectures: 187,
      completionRate: 86.5,
      price: 89.99,
      lastUpdated: '2024-02-14',
      level: 'Beginner',
      language: 'English',
      enrolled: 2547
    },
    {
      id: 'CRS-2843',
      title: 'Business Analytics with Python',
      description: 'Data analysis, visualization, and business intelligence',
      category: 'business',
      instructor: 'Lisa Anderson',
      status: 'published',
      students: 1247,
      rating: 4.8,
      reviews: 384,
      duration: 38,
      lectures: 224,
      completionRate: 89.7,
      price: 119.99,
      lastUpdated: '2024-02-11',
      level: 'Intermediate',
      language: 'English',
      enrolled: 1524
    },
    {
      id: 'CRS-2842',
      title: 'Mobile App Development with React Native',
      description: 'Build iOS and Android apps with React Native and Expo',
      category: 'development',
      instructor: 'Robert Taylor',
      status: 'draft',
      students: 0,
      rating: 0,
      reviews: 0,
      duration: 45,
      lectures: 267,
      completionRate: 0,
      price: 109.99,
      lastUpdated: '2024-02-13',
      level: 'Intermediate',
      language: 'English',
      enrolled: 0
    },
    {
      id: 'CRS-2841',
      title: 'Data Science Fundamentals',
      description: 'Statistics, probability, and data analysis with R',
      category: 'data-science',
      instructor: 'James Martinez',
      status: 'published',
      students: 1847,
      rating: 4.7,
      reviews: 547,
      duration: 40,
      lectures: 198,
      completionRate: 85.3,
      price: 94.99,
      lastUpdated: '2024-02-09',
      level: 'Beginner',
      language: 'English',
      enrolled: 2247
    },
    {
      id: 'CRS-2840',
      title: 'Graphic Design with Adobe Creative Suite',
      description: 'Photoshop, Illustrator, and InDesign mastery',
      category: 'design',
      instructor: 'Sarah Johnson',
      status: 'published',
      students: 1624,
      rating: 4.9,
      reviews: 492,
      duration: 35,
      lectures: 178,
      completionRate: 91.2,
      price: 84.99,
      lastUpdated: '2024-02-15',
      level: 'Beginner',
      language: 'English',
      enrolled: 1924
    },
    {
      id: 'CRS-2839',
      title: 'Financial Management for Entrepreneurs',
      description: 'Budgeting, forecasting, and financial decision making',
      category: 'business',
      instructor: 'Michael Chen',
      status: 'published',
      students: 984,
      rating: 4.5,
      reviews: 284,
      duration: 24,
      lectures: 124,
      completionRate: 82.4,
      price: 69.99,
      lastUpdated: '2024-02-07',
      level: 'Beginner',
      language: 'English',
      enrolled: 1247
    },
    {
      id: 'CRS-2838',
      title: 'Content Marketing & Copywriting',
      description: 'Write compelling copy and create content strategies',
      category: 'marketing',
      instructor: 'Emma Wilson',
      status: 'archived',
      students: 847,
      rating: 4.4,
      reviews: 247,
      duration: 18,
      lectures: 92,
      completionRate: 78.5,
      price: 59.99,
      lastUpdated: '2023-12-20',
      level: 'Beginner',
      language: 'English',
      enrolled: 847
    }
  ]

  const filteredCourses = courses.filter(course => {
    const statusMatch = status === 'all' || course.status === status
    const categoryMatch = category === 'all' || course.category === category
    return statusMatch && categoryMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2,
          label: 'Published'
        }
      case 'draft':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          label: 'Draft'
        }
      case 'archived':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: FileText,
          label: 'Archived'
        }
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: BookOpen,
          label: status
        }
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Advanced':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-green-600'
    if (rating >= 4.5) return 'text-blue-600'
    if (rating >= 4.0) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const recentActivity = [
    { label: 'New course published', time: '2 hours ago', color: 'text-green-600' },
    { label: '100 new enrollments', time: '5 hours ago', color: 'text-blue-600' },
    { label: 'Course updated', time: '1 day ago', color: 'text-purple-600' },
    { label: 'Certificate issued', time: '2 days ago', color: 'text-yellow-600' },
    { label: 'High rating received', time: '3 days ago', color: 'text-orange-600' }
  ]

  const topCoursesByStudents = [
    { label: 'Web Development Bootcamp', value: '3.2K students', color: 'bg-blue-500' },
    { label: 'Digital Marketing', value: '2.5K students', color: 'bg-green-500' },
    { label: 'Data Science Fundamentals', value: '2.2K students', color: 'bg-purple-500' },
    { label: 'Machine Learning & AI', value: '2.1K students', color: 'bg-cyan-500' },
    { label: 'Graphic Design', value: '1.9K students', color: 'bg-orange-500' }
  ]

  const completionRateData = {
    label: 'Avg Completion Rate',
    current: 87.4,
    target: 90,
    subtitle: 'Across all courses'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Course Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage educational courses</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Course
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setStatus('all')}
                  isActive={status === 'all'}
                  variant="default"
                >
                  All Courses
                </PillButton>
                <PillButton
                  onClick={() => setStatus('published')}
                  isActive={status === 'published'}
                  variant="default"
                >
                  Published
                </PillButton>
                <PillButton
                  onClick={() => setStatus('draft')}
                  isActive={status === 'draft'}
                  variant="default"
                >
                  Draft
                </PillButton>
                <PillButton
                  onClick={() => setStatus('archived')}
                  isActive={status === 'archived'}
                  variant="default"
                >
                  Archived
                </PillButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <PillButton
                  onClick={() => setCategory('all')}
                  isActive={category === 'all'}
                  variant="default"
                >
                  All Categories
                </PillButton>
                <PillButton
                  onClick={() => setCategory('development')}
                  isActive={category === 'development'}
                  variant="default"
                >
                  Development
                </PillButton>
                <PillButton
                  onClick={() => setCategory('business')}
                  isActive={category === 'business'}
                  variant="default"
                >
                  Business
                </PillButton>
                <PillButton
                  onClick={() => setCategory('design')}
                  isActive={category === 'design'}
                  variant="default"
                >
                  Design
                </PillButton>
                <PillButton
                  onClick={() => setCategory('marketing')}
                  isActive={category === 'marketing'}
                  variant="default"
                >
                  Marketing
                </PillButton>
                <PillButton
                  onClick={() => setCategory('data-science')}
                  isActive={category === 'data-science'}
                  variant="default"
                >
                  Data Science
                </PillButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course Catalog</h2>
              <div className="text-sm text-gray-600">
                {filteredCourses.length} courses
              </div>
            </div>

            <div className="space-y-3">
              {filteredCourses.map((course) => {
                const statusBadge = getStatusBadge(course.status)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">{course.id}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500 capitalize">{course.category.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getLevelBadge(course.level)}`}>
                          {course.level}
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Students</div>
                        <div className="font-semibold text-blue-600 text-lg">{course.enrolled.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rating</div>
                        <div className={`font-medium flex items-center gap-1 ${getRatingColor(course.rating)}`}>
                          <Star className="w-4 h-4 fill-current" />
                          {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Duration</div>
                        <div className="font-medium text-gray-900">{course.duration}h</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Price</div>
                        <div className="font-medium text-green-600">${course.price}</div>
                      </div>
                    </div>

                    {course.status === 'published' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-semibold text-gray-900">{course.completionRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          Instructor: <span className="font-medium text-gray-900">{course.instructor}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{course.lectures} lectures</span>
                      </div>
                      <div className="text-gray-500">Updated {course.lastUpdated}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProgressCard
              label={completionRateData.label}
              current={completionRateData.current}
              target={completionRateData.target}
              subtitle={completionRateData.subtitle}
            />

            <MiniKPI
              title="Active Students"
              value="12.8K"
              change="+24.7%"
              trend="up"
              subtitle="Currently enrolled"
            />

            <RankingList
              title="Most Popular"
              items={topCoursesByStudents}
            />

            <ActivityFeed
              title="Recent Activity"
              items={recentActivity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
