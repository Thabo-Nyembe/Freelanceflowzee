'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// ============================================================================
// UDEMY/COURSERA-LEVEL LMS - Learning Management System
// Features: Course builder, Curriculum, Quizzes, Analytics, Certificates
// ============================================================================

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnail: string
  previewVideo: string | null
  instructor: {
    id: string
    name: string
    avatar: string
    title: string
    bio: string
    rating: number
    studentCount: number
    courseCount: number
  }
  category: string
  subcategory: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
  language: string
  subtitles: string[]
  status: 'draft' | 'pending_review' | 'published' | 'archived'
  pricing: {
    type: 'free' | 'paid' | 'subscription'
    price: number
    originalPrice: number
    currency: string
    discount: number
    discountEndsAt: string | null
  }
  curriculum: Section[]
  requirements: string[]
  objectives: string[]
  targetAudience: string[]
  stats: {
    enrollments: number
    completions: number
    rating: number
    reviewCount: number
    totalHours: number
    lectureCount: number
    quizCount: number
    assignmentCount: number
    resourceCount: number
  }
  engagement: {
    avgWatchTime: number
    completionRate: number
    discussionPosts: number
    questionsAsked: number
  }
  revenue: {
    totalRevenue: number
    thisMonth: number
    lastMonth: number
    refunds: number
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

interface Section {
  id: string
  title: string
  description: string
  order: number
  lectures: Lecture[]
  duration: number
}

interface Lecture {
  id: string
  title: string
  type: 'video' | 'article' | 'quiz' | 'assignment' | 'resource'
  duration: number
  isPreview: boolean
  content: {
    videoUrl?: string
    articleHtml?: string
    quizId?: string
    assignmentId?: string
    resourceUrl?: string
  }
  order: number
  completionRate: number
}

interface Quiz {
  id: string
  title: string
  description: string
  courseId: string
  sectionId: string
  questions: QuizQuestion[]
  passingScore: number
  timeLimit: number | null
  attempts: number
  avgScore: number
  completions: number
}

interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'code'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  points: number
}

interface StudentProgress {
  id: string
  studentId: string
  studentName: string
  studentAvatar: string
  enrolledAt: string
  lastAccessedAt: string
  progress: number
  completedLectures: number
  totalLectures: number
  quizScores: { quizId: string; score: number; attempts: number }[]
  certificateEarned: boolean
  certificateId: string | null
}

interface Review {
  id: string
  studentId: string
  studentName: string
  studentAvatar: string
  rating: number
  title: string
  content: string
  createdAt: string
  helpfulCount: number
  instructorResponse: string | null
  instructorResponseAt: string | null
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp 2024',
    slug: 'complete-web-development-bootcamp-2024',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, MongoDB and more to become a full-stack web developer',
    shortDescription: 'Become a full-stack web developer from scratch',
    thumbnail: '💻',
    previewVideo: 'https://example.com/preview.mp4',
    instructor: {
      id: 'i1',
      name: 'Dr. Angela Yu',
      avatar: '👩‍💻',
      title: 'Lead Instructor',
      bio: '10+ years of experience teaching programming',
      rating: 4.9,
      studentCount: 1500000,
      courseCount: 12
    },
    category: 'Development',
    subcategory: 'Web Development',
    level: 'all_levels',
    language: 'English',
    subtitles: ['English', 'Spanish', 'Portuguese', 'German', 'French'],
    status: 'published',
    pricing: {
      type: 'paid',
      price: 84.99,
      originalPrice: 199.99,
      currency: 'USD',
      discount: 58,
      discountEndsAt: '2024-12-31'
    },
    curriculum: [
      {
        id: 's1',
        title: 'Introduction to Web Development',
        description: 'Get started with the basics',
        order: 1,
        duration: 120,
        lectures: [
          { id: 'l1', title: 'Welcome to the Course', type: 'video', duration: 5, isPreview: true, content: {}, order: 1, completionRate: 98 },
          { id: 'l2', title: 'How the Internet Works', type: 'video', duration: 15, isPreview: true, content: {}, order: 2, completionRate: 95 },
          { id: 'l3', title: 'Setting Up Your Environment', type: 'video', duration: 20, isPreview: false, content: {}, order: 3, completionRate: 92 },
          { id: 'l4', title: 'Quiz: Web Basics', type: 'quiz', duration: 10, isPreview: false, content: {}, order: 4, completionRate: 88 }
        ]
      },
      {
        id: 's2',
        title: 'HTML Fundamentals',
        description: 'Master the structure of web pages',
        order: 2,
        duration: 180,
        lectures: [
          { id: 'l5', title: 'HTML Document Structure', type: 'video', duration: 25, isPreview: false, content: {}, order: 1, completionRate: 85 },
          { id: 'l6', title: 'HTML Tags Deep Dive', type: 'video', duration: 35, isPreview: false, content: {}, order: 2, completionRate: 82 },
          { id: 'l7', title: 'Forms and Inputs', type: 'video', duration: 30, isPreview: false, content: {}, order: 3, completionRate: 78 },
          { id: 'l8', title: 'Project: Personal Portfolio', type: 'assignment', duration: 60, isPreview: false, content: {}, order: 4, completionRate: 65 }
        ]
      }
    ],
    requirements: ['No programming experience needed', 'A computer with internet access', 'Eagerness to learn'],
    objectives: ['Build websites from scratch', 'Master HTML, CSS, JavaScript', 'Create React applications', 'Work with databases'],
    targetAudience: ['Beginners with no experience', 'Career changers', 'Students looking to learn coding'],
    stats: {
      enrollments: 245000,
      completions: 89000,
      rating: 4.8,
      reviewCount: 78500,
      totalHours: 65,
      lectureCount: 450,
      quizCount: 45,
      assignmentCount: 32,
      resourceCount: 120
    },
    engagement: {
      avgWatchTime: 42,
      completionRate: 36.3,
      discussionPosts: 125000,
      questionsAsked: 45000
    },
    revenue: {
      totalRevenue: 8500000,
      thisMonth: 245000,
      lastMonth: 228000,
      refunds: 12500
    },
    seo: {
      metaTitle: 'Complete Web Development Bootcamp | Learn Coding',
      metaDescription: 'Become a full-stack web developer with this comprehensive bootcamp',
      keywords: ['web development', 'coding', 'programming', 'javascript', 'react']
    },
    createdAt: '2023-01-15',
    updatedAt: '2024-12-20',
    publishedAt: '2023-02-01'
  },
  {
    id: '2',
    title: 'Machine Learning A-Z: AI, Python & R',
    slug: 'machine-learning-az',
    description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts',
    shortDescription: 'Master Machine Learning with Python and R',
    thumbnail: '🤖',
    previewVideo: null,
    instructor: {
      id: 'i2',
      name: 'Kirill Eremenko',
      avatar: '👨‍🔬',
      title: 'Data Scientist',
      bio: 'Data Science expert with real-world experience',
      rating: 4.7,
      studentCount: 890000,
      courseCount: 8
    },
    category: 'Data Science',
    subcategory: 'Machine Learning',
    level: 'intermediate',
    language: 'English',
    subtitles: ['English', 'Spanish', 'Japanese'],
    status: 'published',
    pricing: {
      type: 'paid',
      price: 94.99,
      originalPrice: 189.99,
      currency: 'USD',
      discount: 50,
      discountEndsAt: null
    },
    curriculum: [
      {
        id: 's1',
        title: 'Data Preprocessing',
        description: 'Prepare data for ML models',
        order: 1,
        duration: 90,
        lectures: [
          { id: 'l1', title: 'Importing Libraries', type: 'video', duration: 15, isPreview: true, content: {}, order: 1, completionRate: 96 },
          { id: 'l2', title: 'Handling Missing Data', type: 'video', duration: 25, isPreview: false, content: {}, order: 2, completionRate: 89 }
        ]
      }
    ],
    requirements: ['Basic Python knowledge', 'Basic math understanding'],
    objectives: ['Build ML models', 'Understand algorithms', 'Make predictions'],
    targetAudience: ['Data analysts', 'Python developers', 'Students'],
    stats: {
      enrollments: 156000,
      completions: 45000,
      rating: 4.7,
      reviewCount: 42000,
      totalHours: 44,
      lectureCount: 310,
      quizCount: 28,
      assignmentCount: 15,
      resourceCount: 85
    },
    engagement: {
      avgWatchTime: 38,
      completionRate: 28.8,
      discussionPosts: 78000,
      questionsAsked: 32000
    },
    revenue: {
      totalRevenue: 4200000,
      thisMonth: 125000,
      lastMonth: 118000,
      refunds: 8200
    },
    seo: {
      metaTitle: 'Machine Learning A-Z | Python & R',
      metaDescription: 'Learn ML from scratch with hands-on projects',
      keywords: ['machine learning', 'python', 'data science', 'AI']
    },
    createdAt: '2022-06-10',
    updatedAt: '2024-12-15',
    publishedAt: '2022-07-01'
  },
  {
    id: '3',
    title: 'iOS App Development with Swift',
    slug: 'ios-app-development-swift',
    description: 'Build iOS apps from scratch using Swift and SwiftUI',
    shortDescription: 'Create beautiful iOS apps with Swift',
    thumbnail: '📱',
    previewVideo: null,
    instructor: {
      id: 'i3',
      name: 'Chris Ching',
      avatar: '👨‍💻',
      title: 'iOS Developer',
      bio: 'Apple developer with 15+ years experience',
      rating: 4.8,
      studentCount: 320000,
      courseCount: 5
    },
    category: 'Development',
    subcategory: 'Mobile Development',
    level: 'beginner',
    language: 'English',
    subtitles: ['English'],
    status: 'draft',
    pricing: {
      type: 'paid',
      price: 0,
      originalPrice: 149.99,
      currency: 'USD',
      discount: 0,
      discountEndsAt: null
    },
    curriculum: [],
    requirements: ['Mac computer', 'Xcode installed'],
    objectives: ['Build iOS apps', 'Publish to App Store'],
    targetAudience: ['Aspiring iOS developers'],
    stats: {
      enrollments: 0,
      completions: 0,
      rating: 0,
      reviewCount: 0,
      totalHours: 35,
      lectureCount: 180,
      quizCount: 0,
      assignmentCount: 0,
      resourceCount: 0
    },
    engagement: {
      avgWatchTime: 0,
      completionRate: 0,
      discussionPosts: 0,
      questionsAsked: 0
    },
    revenue: {
      totalRevenue: 0,
      thisMonth: 0,
      lastMonth: 0,
      refunds: 0
    },
    seo: {
      metaTitle: 'iOS Development with Swift',
      metaDescription: 'Learn iOS app development from scratch',
      keywords: ['ios', 'swift', 'app development', 'mobile']
    },
    createdAt: '2024-12-01',
    updatedAt: '2024-12-22',
    publishedAt: null
  }
]

const mockQuizzes: Quiz[] = [
  {
    id: 'q1',
    title: 'Web Basics Quiz',
    description: 'Test your understanding of web fundamentals',
    courseId: '1',
    sectionId: 's1',
    questions: [
      { id: 'qq1', type: 'multiple_choice', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'], correctAnswer: 'Hyper Text Markup Language', explanation: 'HTML = Hyper Text Markup Language', points: 10 },
      { id: 'qq2', type: 'true_false', question: 'CSS is used for styling web pages', correctAnswer: 'true', explanation: 'CSS handles presentation and layout', points: 10 }
    ],
    passingScore: 70,
    timeLimit: 15,
    attempts: 12500,
    avgScore: 82,
    completions: 11200
  }
]

const mockStudentProgress: StudentProgress[] = [
  {
    id: 'sp1',
    studentId: 's1',
    studentName: 'John Smith',
    studentAvatar: '👨‍🎓',
    enrolledAt: '2024-11-15',
    lastAccessedAt: '2024-12-22',
    progress: 78,
    completedLectures: 351,
    totalLectures: 450,
    quizScores: [{ quizId: 'q1', score: 95, attempts: 1 }],
    certificateEarned: false,
    certificateId: null
  },
  {
    id: 'sp2',
    studentId: 's2',
    studentName: 'Sarah Johnson',
    studentAvatar: '👩‍🎓',
    enrolledAt: '2024-10-01',
    lastAccessedAt: '2024-12-21',
    progress: 100,
    completedLectures: 450,
    totalLectures: 450,
    quizScores: [{ quizId: 'q1', score: 100, attempts: 1 }],
    certificateEarned: true,
    certificateId: 'cert-12345'
  },
  {
    id: 'sp3',
    studentId: 's3',
    studentName: 'Mike Chen',
    studentAvatar: '👨‍💻',
    enrolledAt: '2024-12-01',
    lastAccessedAt: '2024-12-22',
    progress: 25,
    completedLectures: 112,
    totalLectures: 450,
    quizScores: [],
    certificateEarned: false,
    certificateId: null
  }
]

const mockReviews: Review[] = [
  {
    id: 'r1',
    studentId: 's2',
    studentName: 'Sarah Johnson',
    studentAvatar: '👩‍🎓',
    rating: 5,
    title: 'Best course I ever took!',
    content: 'This course completely changed my career. The instructor explains everything clearly and the projects are amazing.',
    createdAt: '2024-12-15',
    helpfulCount: 234,
    instructorResponse: 'Thank you Sarah! So happy to hear about your success!',
    instructorResponseAt: '2024-12-16'
  },
  {
    id: 'r2',
    studentId: 's1',
    studentName: 'John Smith',
    studentAvatar: '👨‍🎓',
    rating: 4,
    title: 'Great content, could use more examples',
    content: 'Overall excellent course. Would love to see more real-world project examples.',
    createdAt: '2024-12-10',
    helpfulCount: 89,
    instructorResponse: null,
    instructorResponseAt: null
  }
]

export default function CoursesClient() {
  const [activeView, setActiveView] = useState<'courses' | 'curriculum' | 'students' | 'analytics' | 'reviews'>('courses')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Stats
  const stats = useMemo(() => {
    const totalCourses = mockCourses.length
    const publishedCourses = mockCourses.filter(c => c.status === 'published').length
    const totalStudents = mockCourses.reduce((sum, c) => sum + c.stats.enrollments, 0)
    const totalRevenue = mockCourses.reduce((sum, c) => sum + c.revenue.totalRevenue, 0)
    const avgRating = mockCourses.filter(c => c.stats.rating > 0).reduce((sum, c) => sum + c.stats.rating, 0) / mockCourses.filter(c => c.stats.rating > 0).length || 0
    const totalCompletions = mockCourses.reduce((sum, c) => sum + c.stats.completions, 0)
    const totalHours = mockCourses.reduce((sum, c) => sum + c.stats.totalHours, 0)
    const totalReviews = mockCourses.reduce((sum, c) => sum + c.stats.reviewCount, 0)

    return { totalCourses, publishedCourses, totalStudents, totalRevenue, avgRating, totalCompletions, totalHours, totalReviews }
  }, [])

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return mockCourses.filter(c => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter
      const matchesSearch = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [statusFilter, categoryFilter, searchQuery])

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'pending_review': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'all_levels': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Course Management
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full">
                Udemy Level
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Create, manage & analyze your courses</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white w-64"
            />
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
              + Create Course
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Courses</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalCourses}</div>
            <div className="text-xs text-green-600">{stats.publishedCourses} published</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalStudents)}</div>
            <div className="text-xs text-purple-600">{formatNumber(stats.totalCompletions)} completions</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-xs text-green-600">{stats.totalHours}h of content</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Rating</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)} ★</div>
            <div className="text-xs text-yellow-600">{formatNumber(stats.totalReviews)} reviews</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border dark:border-gray-700">
            <TabsTrigger value="courses" className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30">
              📚 Courses
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
              📋 Curriculum
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
              👥 Students
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              📊 Analytics
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-900/30">
              ⭐ Reviews
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="Development">Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredCourses.map(course => (
                <Dialog key={course.id}>
                  <DialogTrigger asChild>
                    <div
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-5xl">{course.thumbnail}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(course.status)}`}>
                              {course.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getLevelColor(course.level)}`}>
                              {course.level.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs dark:text-gray-300">
                              {course.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold dark:text-white">{course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.shortDescription}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              {course.instructor.avatar} {course.instructor.name}
                            </span>
                            <span>{course.stats.totalHours}h total</span>
                            <span>{course.stats.lectureCount} lectures</span>
                            {course.stats.rating > 0 && (
                              <span className="flex items-center gap-1 text-yellow-600">
                                ★ {course.stats.rating.toFixed(1)} ({formatNumber(course.stats.reviewCount)})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {course.pricing.type === 'paid' && (
                            <div>
                              <div className="text-xl font-bold text-green-600">{formatCurrency(course.pricing.price)}</div>
                              {course.pricing.discount > 0 && (
                                <div className="text-sm text-gray-500 line-through">{formatCurrency(course.pricing.originalPrice)}</div>
                              )}
                            </div>
                          )}
                          {course.pricing.type === 'free' && (
                            <div className="text-xl font-bold text-green-600">Free</div>
                          )}
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(course.stats.enrollments)} students
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-3xl">{course.thumbnail}</span>
                        {course.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Course Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-indigo-600">{formatNumber(course.stats.enrollments)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Enrollments</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{course.engagement.completionRate}%</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Completion</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-yellow-600">{course.stats.rating.toFixed(1)} ★</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(course.stats.reviewCount)} reviews</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">{formatCurrency(course.revenue.totalRevenue)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                        </div>
                      </div>

                      {/* Instructor */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{course.instructor.avatar}</span>
                          <div>
                            <div className="font-semibold dark:text-white">{course.instructor.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{course.instructor.title}</div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span>★ {course.instructor.rating}</span>
                              <span>{formatNumber(course.instructor.studentCount)} students</span>
                              <span>{course.instructor.courseCount} courses</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Curriculum Preview */}
                      {course.curriculum.length > 0 && (
                        <div>
                          <div className="font-semibold mb-3 dark:text-white">Curriculum Preview</div>
                          <div className="space-y-2">
                            {course.curriculum.map(section => (
                              <div key={section.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                                  <span className="font-medium dark:text-white">{section.title}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {section.lectures.length} lectures • {formatDuration(section.duration)}
                                  </span>
                                </div>
                                <div className="p-2">
                                  {section.lectures.slice(0, 3).map(lecture => (
                                    <div key={lecture.id} className="flex items-center justify-between px-2 py-1.5 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span>{lecture.type === 'video' ? '🎬' : lecture.type === 'quiz' ? '📝' : '📄'}</span>
                                        <span className="dark:text-gray-300">{lecture.title}</span>
                                        {lecture.isPreview && (
                                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">Preview</span>
                                        )}
                                      </div>
                                      <span className="text-gray-500 dark:text-gray-400">{formatDuration(lecture.duration)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Objectives */}
                      {course.objectives.length > 0 && (
                        <div>
                          <div className="font-semibold mb-2 dark:text-white">What You'll Learn</div>
                          <div className="grid grid-cols-2 gap-2">
                            {course.objectives.map((obj, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-green-500">✓</span>
                                <span className="dark:text-gray-300">{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                          Edit Course
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Preview
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                          Analytics
                        </button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold dark:text-white">Curriculum Builder</h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                  + Add Section
                </button>
              </div>
              {mockCourses[0].curriculum.map((section, sIdx) => (
                <div key={section.id} className="mb-4 border dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 cursor-move">⋮⋮</span>
                      <span className="font-medium dark:text-white">Section {sIdx + 1}: {section.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {section.lectures.length} lectures • {formatDuration(section.duration)}
                      </span>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">✏️</button>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">🗑️</button>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    {section.lectures.map((lecture, lIdx) => (
                      <div key={lecture.id} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-900 rounded border dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 cursor-move">⋮⋮</span>
                          <span>{lecture.type === 'video' ? '🎬' : lecture.type === 'quiz' ? '📝' : lecture.type === 'assignment' ? '📋' : '📄'}</span>
                          <span className="dark:text-white">{lecture.title}</span>
                          {lecture.isPreview && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs">Preview</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(lecture.duration)}</span>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">✏️</button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-500 text-sm">
                      + Add Lecture
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Student Progress</h3>
              <div className="space-y-4">
                {mockStudentProgress.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{student.studentAvatar}</span>
                      <div>
                        <div className="font-medium dark:text-white">{student.studentName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Enrolled {new Date(student.enrolledAt).toLocaleDateString()} • Last active {new Date(student.lastAccessedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-lg font-semibold dark:text-white">{student.progress}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{student.completedLectures}/{student.totalLectures} lectures</div>
                      </div>
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${student.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      {student.certificateEarned && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded text-xs">
                          🎓 Certified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Revenue Overview</h3>
                <div className="space-y-4">
                  {mockCourses.filter(c => c.status === 'published').map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{course.thumbnail}</span>
                        <div>
                          <div className="font-medium text-sm dark:text-white">{course.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatNumber(course.stats.enrollments)} students
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{formatCurrency(course.revenue.totalRevenue)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(course.revenue.thisMonth)} this month
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Engagement Metrics</h3>
                <div className="space-y-4">
                  {mockCourses.filter(c => c.status === 'published').map(course => (
                    <div key={course.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm dark:text-white">{course.title}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{course.engagement.completionRate}% completion</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${course.engagement.completionRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{course.engagement.avgWatchTime}m avg watch time</span>
                        <span>{formatNumber(course.engagement.discussionPosts)} discussions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold dark:text-white">Recent Reviews</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</span>
                  {renderStars(stats.avgRating)}
                  <span className="text-gray-500 dark:text-gray-400">({formatNumber(stats.totalReviews)} reviews)</span>
                </div>
              </div>
              <div className="space-y-4">
                {mockReviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{review.studentAvatar}</span>
                        <div>
                          <div className="font-medium dark:text-white">{review.studentName}</div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">👍 {review.helpfulCount}</span>
                    </div>
                    <h4 className="font-medium mb-1 dark:text-white">{review.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.content}</p>
                    {review.instructorResponse && (
                      <div className="mt-3 ml-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Instructor Response</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.instructorResponse}</p>
                      </div>
                    )}
                    {!review.instructorResponse && (
                      <button className="mt-2 text-sm text-indigo-600 hover:underline">Reply to this review</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
