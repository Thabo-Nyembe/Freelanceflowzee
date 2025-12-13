"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  GraduationCap, BookOpen, Video, TrendingUp, Plus,
  Play, Eye, Download, RefreshCw, Settings,
  CheckCircle, Clock, Star, Award
} from 'lucide-react'

type CourseStatus = 'draft' | 'published' | 'archived'
type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
type CourseFormat = 'video' | 'text' | 'interactive' | 'live' | 'mixed'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: CourseLevel
  format: CourseFormat
  status: CourseStatus
  category: string
  duration: number
  lessons: number
  totalEnrolled: number
  completed: number
  averageRating: number
  totalReviews: number
  price: number
  createdDate: string
  publishedDate?: string
  lastUpdated: string
  certificateAvailable: boolean
  tags: string[]
}

const courses: Course[] = [
  {
    id: 'LRN-2847',
    title: 'Complete Guide to Data Analytics',
    description: 'Master data analytics from basics to advanced techniques including visualization, statistical analysis, and machine learning fundamentals.',
    instructor: 'Dr. Sarah Johnson',
    level: 'intermediate',
    format: 'video',
    status: 'published',
    category: 'Data Science',
    duration: 1240,
    lessons: 45,
    totalEnrolled: 2847,
    completed: 1678,
    averageRating: 4.8,
    totalReviews: 892,
    price: 199,
    createdDate: '2024-01-01T10:00:00',
    publishedDate: '2024-01-05T09:00:00',
    lastUpdated: '2024-01-10T14:00:00',
    certificateAvailable: true,
    tags: ['Analytics', 'Data Science', 'Python', 'Visualization']
  },
  {
    id: 'LRN-2846',
    title: 'Advanced JavaScript & TypeScript',
    description: 'Deep dive into modern JavaScript and TypeScript covering advanced patterns, async programming, and framework integration.',
    instructor: 'Michael Chen',
    level: 'advanced',
    format: 'mixed',
    status: 'published',
    category: 'Programming',
    duration: 1680,
    lessons: 62,
    totalEnrolled: 3456,
    completed: 1847,
    averageRating: 4.9,
    totalReviews: 1247,
    price: 249,
    createdDate: '2023-12-15T11:00:00',
    publishedDate: '2024-01-01T09:00:00',
    lastUpdated: '2024-01-11T10:00:00',
    certificateAvailable: true,
    tags: ['JavaScript', 'TypeScript', 'Web Development', 'Advanced']
  },
  {
    id: 'LRN-2845',
    title: 'Introduction to Cloud Computing',
    description: 'Learn cloud fundamentals with hands-on AWS, Azure, and Google Cloud Platform experience.',
    instructor: 'Emily Rodriguez',
    level: 'beginner',
    format: 'interactive',
    status: 'published',
    category: 'Cloud & DevOps',
    duration: 960,
    lessons: 32,
    totalEnrolled: 4289,
    completed: 3156,
    averageRating: 4.7,
    totalReviews: 1678,
    price: 149,
    createdDate: '2023-12-01T09:00:00',
    publishedDate: '2023-12-10T10:00:00',
    lastUpdated: '2024-01-08T15:00:00',
    certificateAvailable: true,
    tags: ['Cloud', 'AWS', 'Azure', 'GCP', 'Beginner']
  },
  {
    id: 'LRN-2844',
    title: 'Machine Learning Masterclass',
    description: 'Comprehensive machine learning course covering algorithms, neural networks, and real-world applications.',
    instructor: 'Dr. David Kim',
    level: 'expert',
    format: 'video',
    status: 'published',
    category: 'AI & ML',
    duration: 2100,
    lessons: 78,
    totalEnrolled: 1847,
    completed: 567,
    averageRating: 4.9,
    totalReviews: 456,
    price: 349,
    createdDate: '2023-11-15T10:00:00',
    publishedDate: '2023-12-01T09:00:00',
    lastUpdated: '2024-01-05T12:00:00',
    certificateAvailable: true,
    tags: ['Machine Learning', 'AI', 'Neural Networks', 'Python', 'Expert']
  },
  {
    id: 'LRN-2843',
    title: 'Product Management Essentials',
    description: 'Learn product management fundamentals including roadmapping, user research, and agile methodologies.',
    instructor: 'Lisa Anderson',
    level: 'intermediate',
    format: 'mixed',
    status: 'published',
    category: 'Business',
    duration: 840,
    lessons: 28,
    totalEnrolled: 2156,
    completed: 1456,
    averageRating: 4.6,
    totalReviews: 689,
    price: 179,
    createdDate: '2023-12-20T11:00:00',
    publishedDate: '2024-01-03T09:00:00',
    lastUpdated: '2024-01-09T11:00:00',
    certificateAvailable: true,
    tags: ['Product Management', 'Agile', 'Strategy', 'Business']
  },
  {
    id: 'LRN-2842',
    title: 'UX Design Bootcamp',
    description: 'Hands-on UX design course covering research, wireframing, prototyping, and user testing.',
    instructor: 'Robert Martinez',
    level: 'beginner',
    format: 'interactive',
    status: 'published',
    category: 'Design',
    duration: 1120,
    lessons: 38,
    totalEnrolled: 3678,
    completed: 2489,
    averageRating: 4.8,
    totalReviews: 1456,
    price: 189,
    createdDate: '2023-11-20T10:00:00',
    publishedDate: '2023-12-05T09:00:00',
    lastUpdated: '2024-01-07T14:00:00',
    certificateAvailable: true,
    tags: ['UX Design', 'UI', 'Prototyping', 'Design Thinking']
  },
  {
    id: 'LRN-2841',
    title: 'Live Webinar Series: Tech Leadership',
    description: 'Monthly live sessions on technical leadership, team management, and engineering excellence.',
    instructor: 'Jennifer Taylor',
    level: 'advanced',
    format: 'live',
    status: 'published',
    category: 'Leadership',
    duration: 480,
    lessons: 12,
    totalEnrolled: 892,
    completed: 234,
    averageRating: 4.9,
    totalReviews: 178,
    price: 299,
    createdDate: '2024-01-05T09:00:00',
    publishedDate: '2024-01-08T10:00:00',
    lastUpdated: '2024-01-12T09:00:00',
    certificateAvailable: false,
    tags: ['Leadership', 'Management', 'Live', 'Tech']
  },
  {
    id: 'LRN-2840',
    title: 'Cybersecurity Fundamentals',
    description: 'Essential cybersecurity concepts covering threats, defenses, and best practices for secure development.',
    instructor: 'Thomas Wright',
    level: 'beginner',
    format: 'text',
    status: 'draft',
    category: 'Security',
    duration: 720,
    lessons: 24,
    totalEnrolled: 0,
    completed: 0,
    averageRating: 0,
    totalReviews: 0,
    price: 159,
    createdDate: '2024-01-10T11:00:00',
    lastUpdated: '2024-01-12T10:00:00',
    certificateAvailable: true,
    tags: ['Security', 'Cybersecurity', 'Best Practices', 'Draft']
  }
]

const stats = [
  {
    label: 'Total Courses',
    value: '247',
    change: 18.5,
    trend: 'up' as const,
    icon: BookOpen
  },
  {
    label: 'Total Students',
    value: '42.5K',
    change: 32.7,
    trend: 'up' as const,
    icon: GraduationCap
  },
  {
    label: 'Completion Rate',
    value: '68.3%',
    change: 5.8,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Avg Rating',
    value: '4.7/5',
    change: 3.2,
    trend: 'up' as const,
    icon: Star
  }
]

const quickActions = [
  { label: 'Create Course', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Upload Content', icon: Video, gradient: 'from-green-500 to-emerald-600' },
  { label: 'View Analytics', icon: TrendingUp, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Reports', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Course Settings', icon: Settings, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Preview Course', icon: Eye, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Manage Instructors', icon: GraduationCap, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Course published', details: 'Tech Leadership webinar series launched', time: '4 hours ago' },
  { action: 'High enrollment', details: 'Cloud Computing course reached 4K students', time: '1 day ago' },
  { action: 'Perfect rating', details: 'Machine Learning Masterclass got 5-star review', time: '2 days ago' },
  { action: 'Course updated', details: 'JavaScript course added 5 new lessons', time: '3 days ago' },
  { action: 'Milestone reached', details: 'Data Analytics course 1K completions', time: '1 week ago' }
]

const topCourses = [
  { name: 'Intro to Cloud Computing', metric: '4,289 students' },
  { name: 'UX Design Bootcamp', metric: '3,678 students' },
  { name: 'Advanced JavaScript', metric: '3,456 students' },
  { name: 'Complete Data Analytics', metric: '2,847 students' },
  { name: 'Product Management', metric: '2,156 students' }
]

export default function LearningV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'popular' | 'beginner'>('all')

  const filteredCourses = courses.filter(course => {
    if (viewMode === 'all') return true
    if (viewMode === 'published') return course.status === 'published'
    if (viewMode === 'popular') return course.totalEnrolled > 2500
    if (viewMode === 'beginner') return course.level === 'beginner'
    return true
  })

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'archived': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: CourseStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'archived': return <BookOpen className="w-3 h-3" />
      default: return <BookOpen className="w-3 h-3" />
    }
  }

  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case 'beginner': return 'bg-green-50 text-green-600 border-green-100'
      case 'intermediate': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'advanced': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'expert': return 'bg-red-50 text-red-600 border-red-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getFormatColor = (format: CourseFormat) => {
    switch (format) {
      case 'video': return 'bg-red-50 text-red-600 border-red-100'
      case 'text': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'interactive': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'live': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'mixed': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getLevelGradient = (level: CourseLevel) => {
    switch (level) {
      case 'beginner': return 'from-green-500 to-emerald-600'
      case 'intermediate': return 'from-blue-500 to-cyan-600'
      case 'advanced': return 'from-purple-500 to-pink-600'
      case 'expert': return 'from-red-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const calculateCompletionRate = (completed: number, enrolled: number) => {
    if (enrolled === 0) return 0
    return Math.round((completed / enrolled) * 100)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Learning
            </h1>
            <p className="text-gray-600 mt-2">Manage courses and educational content</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Course
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Courses"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Published"
            isActive={viewMode === 'published'}
            onClick={() => setViewMode('published')}
          />
          <PillButton
            label="Popular"
            isActive={viewMode === 'popular'}
            onClick={() => setViewMode('popular')}
          />
          <PillButton
            label="Beginner"
            isActive={viewMode === 'beginner'}
            onClick={() => setViewMode('beginner')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Courses'}
              {viewMode === 'published' && 'Published Courses'}
              {viewMode === 'popular' && 'Popular Courses'}
              {viewMode === 'beginner' && 'Beginner Courses'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredCourses.length} total)
              </span>
            </h2>

            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)} flex items-center gap-1`}>
                        {getStatusIcon(course.status)}
                        {course.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFormatColor(course.format)}`}>
                        {course.format}
                      </span>
                      {course.certificateAvailable && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-600 border-yellow-100 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Certificate
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.id} • By {course.instructor} • {course.category}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getLevelGradient(course.level)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDuration(course.duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Lessons</p>
                    <p className="text-sm font-semibold text-gray-900">{course.lessons}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Students</p>
                    <p className="text-sm font-semibold text-gray-900">{course.totalEnrolled.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(course.price)}</p>
                  </div>
                </div>

                {/* Rating */}
                {course.status === 'published' && course.totalReviews > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {renderStars(course.averageRating)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{course.averageRating}</span>
                      <span className="text-sm text-gray-600">({course.totalReviews.toLocaleString()} reviews)</span>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {course.status === 'published' && course.totalEnrolled > 0 && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Completion Rate</span>
                        <span>{calculateCompletionRate(course.completed, course.totalEnrolled)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getLevelGradient(course.level)} rounded-full transition-all`}
                          style={{ width: `${calculateCompletionRate(course.completed, course.totalEnrolled)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Course Level Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Course Levels</h3>
              <div className="space-y-3">
                {[
                  { level: 'beginner', count: 98, percentage: 40 },
                  { level: 'intermediate', count: 79, percentage: 32 },
                  { level: 'advanced', count: 52, percentage: 21 },
                  { level: 'expert', count: 18, percentage: 7 }
                ].map((item) => (
                  <div key={item.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.level}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getLevelGradient(item.level as CourseLevel)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Courses */}
            <RankingList
              title="Most Enrolled"
              items={topCourses}
              gradient="from-emerald-500 to-teal-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Certificates Issued"
              value="12.4K"
              change={28.5}
              trend="up"
            />

            <ProgressCard
              title="Monthly Goal"
              current={18}
              target={25}
              label="courses published"
              gradient="from-emerald-500 to-teal-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
