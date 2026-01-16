'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Settings, BookOpen, Users, BarChart3, GraduationCap, PlayCircle,
  FileText, Award, Bell, Key, Webhook, Mail, Shield, Lock, Cpu, CreditCard, DollarSign, Video,
  Upload, Download, Trash2, Copy, AlertOctagon, RefreshCw, Zap, Link2,
  MessageSquare, CheckCircle, Eye, Edit, Plus, Loader2
} from 'lucide-react'
import { useCourses as useCoursesExtended } from '@/lib/hooks/use-courses-extended'
import { type CourseStatus as DBCourseStatus, type CourseLevel as DBCourseLevel, type CourseCategory as DBCourseCategory } from '@/lib/hooks/use-courses'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

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

// Enhanced Courses Mock Data
const mockCoursesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Course Performance', description: 'Python Masterclass completion rate up 18% this month. Students love the new exercises.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'info' as const, title: 'Engagement Alert', description: 'Module 4 has highest drop-off rate. Consider adding more interactive content.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Content' },
  { id: '3', type: 'warning' as const, title: 'Q&A Backlog', description: '15 student questions unanswered for more than 48 hours.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Support' },
]

const mockCoursesCollaborators = [
  { id: '1', name: 'Lead Instructor', avatar: '/avatars/instructor.jpg', status: 'online' as const, role: 'Course Creator', lastActive: 'Now' },
  { id: '2', name: 'TA Sarah', avatar: '/avatars/ta.jpg', status: 'online' as const, role: 'Teaching Assistant', lastActive: '5m ago' },
  { id: '3', name: 'Content Editor', avatar: '/avatars/editor.jpg', status: 'away' as const, role: 'Video Production', lastActive: '1h ago' },
]

const mockCoursesPredictions = [
  { id: '1', label: 'Enrollments', current: 2847, target: 3500, predicted: 3200, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Completion Rate', current: 68, target: 75, predicted: 72, confidence: 78, trend: 'up' as const },
  { id: '3', label: 'Revenue', current: 28450, target: 35000, predicted: 32000, confidence: 85, trend: 'up' as const },
]

const mockCoursesActivities = [
  { id: '1', user: 'Lead Instructor', action: 'published', target: 'new lecture in Python Advanced', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'TA Sarah', action: 'answered', target: '8 student questions', timestamp: '30m ago', type: 'info' as const },
  { id: '3', user: 'Content Editor', action: 'uploaded', target: '3 new video lessons', timestamp: '2h ago', type: 'info' as const },
]

// Quick actions will be defined inside the component to access state setters

export default function CoursesClient() {
  const [activeView, setActiveView] = useState<'courses' | 'curriculum' | 'students' | 'analytics' | 'reviews'>('courses')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false)
  const [showEditCourseDialog, setShowEditCourseDialog] = useState(false)
  const [showDeleteCourseDialog, setShowDeleteCourseDialog] = useState(false)
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false)
  const [showAddLectureDialog, setShowAddLectureDialog] = useState(false)
  const [showCreateQuizDialog, setShowCreateQuizDialog] = useState(false)
  const [showViewAnalyticsDialog, setShowViewAnalyticsDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  // Quick actions with proper dialog handlers
  const coursesQuickActions = [
    { id: '1', label: 'New Course', icon: 'BookOpen', shortcut: 'C', action: () => setShowCreateCourseDialog(true) },
    { id: '2', label: 'Add Lecture', icon: 'PlayCircle', shortcut: 'L', action: () => setShowAddLectureDialog(true) },
    { id: '3', label: 'Create Quiz', icon: 'FileText', shortcut: 'Q', action: () => setShowCreateQuizDialog(true) },
    { id: '4', label: 'View Analytics', icon: 'BarChart3', shortcut: 'A', action: () => setShowViewAnalyticsDialog(true) },
  ]

  // Supabase hooks
  const { courses: dbCourses, isLoading: coursesLoading, refresh: refreshCourses } = useCoursesExtended({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined
  })

  // Course form state
  const [courseForm, setCourseForm] = useState({
    course_name: '',
    description: '',
    course_category: 'development' as DBCourseCategory,
    level: 'beginner' as DBCourseLevel,
    status: 'draft' as DBCourseStatus,
    instructor_name: '',
    instructor_email: '',
    instructor_bio: '',
    price: 0,
    original_price: 0,
    discount_percentage: 0,
    currency: 'USD',
    language: 'English',
    has_certificates: true,
    has_downloadable_resources: true,
    has_lifetime_access: true,
    has_mobile_access: true,
    requirements: [] as string[],
    learning_outcomes: [] as string[],
    target_audience: '',
    meta_title: '',
    meta_description: '',
    keywords: [] as string[]
  })

  // Section form state
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    order: 1
  })

  // Lecture form state
  const [lectureForm, setLectureForm] = useState({
    title: '',
    type: 'video' as 'video' | 'article' | 'quiz' | 'assignment' | 'resource',
    duration: 0,
    isPreview: false
  })

  // Reset form helpers
  const resetCourseForm = () => {
    setCourseForm({
      course_name: '',
      description: '',
      course_category: 'development',
      level: 'beginner',
      status: 'draft',
      instructor_name: '',
      instructor_email: '',
      instructor_bio: '',
      price: 0,
      original_price: 0,
      discount_percentage: 0,
      currency: 'USD',
      language: 'English',
      has_certificates: true,
      has_downloadable_resources: true,
      has_lifetime_access: true,
      has_mobile_access: true,
      requirements: [],
      learning_outcomes: [],
      target_audience: '',
      meta_title: '',
      meta_description: '',
      keywords: []
    })
  }

  const resetSectionForm = () => {
    setSectionForm({ title: '', description: '', order: 1 })
  }

  const resetLectureForm = () => {
    setLectureForm({ title: '', type: 'video', duration: 0, isPreview: false })
  }

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

  // Handlers
  const handleCreateCourse = async () => {
    if (!courseForm.course_name) {
      toast.error('Please enter a course name')
      return
    }

    setIsSubmitting(true)
    toast.success('Creating course...'"` })

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: courseForm.course_name,
          description: courseForm.description || undefined,
          course_category: courseForm.course_category,
          level: courseForm.level,
          status: courseForm.status,
          instructor_name: courseForm.instructor_name || undefined,
          instructor_email: courseForm.instructor_email || undefined,
          instructor_bio: courseForm.instructor_bio || undefined,
          price: courseForm.price,
          original_price: courseForm.original_price || undefined,
          discount_percentage: courseForm.discount_percentage,
          currency: courseForm.currency,
          language: courseForm.language,
          has_certificates: courseForm.has_certificates,
          has_downloadable_resources: courseForm.has_downloadable_resources,
          has_lifetime_access: courseForm.has_lifetime_access,
          has_mobile_access: courseForm.has_mobile_access,
          requirements: courseForm.requirements,
          learning_outcomes: courseForm.learning_outcomes,
          target_audience: courseForm.target_audience || undefined,
          meta_title: courseForm.meta_title || undefined,
          meta_description: courseForm.meta_description || undefined,
          keywords: courseForm.keywords
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course')
      }

      toast.success('Course created successfully'"`
      })
      setShowCreateCourseDialog(false)
      resetCourseForm()
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to create course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      course_name: course.title,
      description: course.description,
      course_category: course.category.toLowerCase().replace(' ', '-') as DBCourseCategory,
      level: course.level,
      status: course.status,
      instructor_name: course.instructor.name,
      instructor_email: '',
      instructor_bio: course.instructor.bio,
      price: course.pricing.price,
      original_price: course.pricing.originalPrice,
      discount_percentage: course.pricing.discount,
      currency: course.pricing.currency,
      language: course.language,
      has_certificates: true,
      has_downloadable_resources: true,
      has_lifetime_access: true,
      has_mobile_access: true,
      requirements: course.requirements,
      learning_outcomes: course.objectives,
      target_audience: course.targetAudience.join(', '),
      meta_title: course.seo.metaTitle,
      meta_description: course.seo.metaDescription,
      keywords: course.seo.keywords
    })
    setSelectedCourse(course)
    setShowEditCourseDialog(true)
  }

  const handleUpdateCourse = async () => {
    if (!selectedCourse || !courseForm.course_name) {
      toast.error('Please enter a course name')
      return
    }

    setIsSubmitting(true)
    toast.success('Updating course...'"` })

    try {
      const response = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCourse.id,
          course_name: courseForm.course_name,
          description: courseForm.description || undefined,
          course_category: courseForm.course_category,
          level: courseForm.level,
          status: courseForm.status,
          instructor_name: courseForm.instructor_name || undefined,
          instructor_email: courseForm.instructor_email || undefined,
          instructor_bio: courseForm.instructor_bio || undefined,
          price: courseForm.price,
          original_price: courseForm.original_price || undefined,
          discount_percentage: courseForm.discount_percentage,
          currency: courseForm.currency,
          language: courseForm.language,
          has_certificates: courseForm.has_certificates,
          has_downloadable_resources: courseForm.has_downloadable_resources,
          has_lifetime_access: courseForm.has_lifetime_access,
          has_mobile_access: courseForm.has_mobile_access,
          requirements: courseForm.requirements,
          learning_outcomes: courseForm.learning_outcomes,
          target_audience: courseForm.target_audience || undefined,
          meta_title: courseForm.meta_title || undefined,
          meta_description: courseForm.meta_description || undefined,
          keywords: courseForm.keywords
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course')
      }

      toast.success('Course updated successfully'"`
      })
      setShowEditCourseDialog(false)
      resetCourseForm()
      setSelectedCourse(null)
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to update course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    setIsSubmitting(true)
    toast.success('Deleting course...'"` })

    try {
      const response = await fetch(`/api/courses?id=${courseToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course')
      }

      toast.success('Course deleted'"`
      })
      setShowDeleteCourseDialog(false)
      setCourseToDelete(null)
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to delete course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDeleteCourse = (course: Course) => {
    setCourseToDelete(course)
    setShowDeleteCourseDialog(true)
  }

  const handlePublishCourse = async (course: Course) => {
    setIsSubmitting(true)
    toast.success('Publishing course...'" live` })

    try {
      const response = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: course.id,
          status: 'published',
          is_published: true,
          publish_date: new Date().toISOString()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish course')
      }

      toast.success('Course published'" is now live`
      })
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to publish course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleArchiveCourse = async (course: Course) => {
    setIsSubmitting(true)
    toast.success('Archiving course...'"` })

    try {
      const response = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: course.id,
          status: 'archived',
          is_published: false
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to archive course')
      }

      toast.success('Course archived'" has been archived`
      })
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to archive course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnrollCourse = async (course: Course) => {
    setIsSubmitting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to enroll')
        return
      }

      // Create enrollment in course_enrollments table
      const { error } = await supabase.from('course_enrollments').insert({
        user_id: user.id,
        course_id: course.id,
        status: 'active',
        progress_percent: 0,
        enrolled_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success('Enrolled!'"`
      })
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to enroll')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartLesson = async (lecture: Lecture) => {
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to start a lesson')
        return
      }

      // Track lesson start in course_progress table
      await supabase.from('course_progress').upsert({
        user_id: user.id,
        lesson_id: lecture.id,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })

      toast.info('Starting lesson'"...`
      })
    } catch (error: any) {
      toast.error('Failed to start lesson')
    }
  }

  const handleCompleteCourse = async (course: Course) => {
    setIsSubmitting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Update enrollment status to completed
      const { error } = await supabase
        .from('course_enrollments')
        .update({ status: 'completed', completed_at: new Date().toISOString(), progress_percent: 100 })
        .eq('user_id', user.id)
        .eq('course_id', course.id)

      if (error) throw error

      toast.success('Course completed!')
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to complete course')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadCertificate = async (course: Course) => {
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Generate certificate URL or trigger download
      toast.success('Download started')
    } catch (error: any) {
      toast.error('Failed to download certificate')
    }
  }

  const handleAddSection = async () => {
    if (!selectedCourse || !sectionForm.title) {
      toast.error('Please enter a section title')
      return
    }

    setIsSubmitting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()

      const { error } = await supabase.from('course_modules').insert({
        course_id: selectedCourse.id,
        title: sectionForm.title,
        description: sectionForm.description || null,
        order: sectionForm.order
      })

      if (error) throw error

      toast.success('Section added'" to the course`
      })
      setShowAddSectionDialog(false)
      resetSectionForm()
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to add section')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddLecture = async (sectionId: string) => {
    if (!lectureForm.title) {
      toast.error('Please enter a lecture title')
      return
    }

    setIsSubmitting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()

      const { error } = await supabase.from('course_lessons').insert({
        module_id: sectionId,
        title: lectureForm.title,
        type: lectureForm.type,
        duration_minutes: lectureForm.duration,
        is_preview: lectureForm.isPreview,
        order: 1
      })

      if (error) throw error

      toast.success('Lecture added'" to the section`
      })
      setShowAddLectureDialog(false)
      resetLectureForm()
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to add lecture')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespondToReview = async (reviewId: string, response: string) => {
    setIsSubmitting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client'); const supabase = createClient()

      const { error } = await supabase
        .from('course_reviews')
        .update({
          instructor_response: response,
          instructor_response_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (error) throw error

      toast.success('Response posted')
      refreshCourses()
    } catch (error: any) {
      toast.error('Failed to post response')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
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
            <Button
              onClick={() => setShowCreateCourseDialog(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Course
            </Button>
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
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            {/* Courses Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Course Library</h2>
                  <p className="text-orange-100">Udemy-level course management</p>
                  <p className="text-orange-200 text-xs mt-1">Curriculum builder • Student tracking • Certificates</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCourses.length}</p>
                    <p className="text-orange-200 text-sm">Courses</p>
                  </div>
                </div>
              </div>
            </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
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
                        <Button
                          onClick={() => handleEditCourse(course)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Course
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (course.status === 'draft') {
                              handlePublishCourse(course)
                            } else {
                              toast.info('Opening preview...'"` })
                            }
                          }}
                          disabled={isSubmitting}
                        >
                          {course.status === 'draft' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Publish
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setActiveView('analytics')}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleConfirmDeleteCourse(course)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                <Button
                  onClick={() => setShowAddSectionDialog(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  disabled={isSubmitting || !selectedCourse}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Section
                </Button>
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
                    <Button
                      variant="outline"
                      onClick={() => setShowAddLectureDialog(true)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-500 text-sm"
                      disabled={isSubmitting}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lecture
                    </Button>
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
                      <Button
                        variant="link"
                        className="mt-2 p-0 h-auto text-sm text-indigo-600 hover:underline"
                        onClick={() => {
                          const response = prompt('Enter your response to this review:')
                          if (response) {
                            handleRespondToReview(review.id, response)
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Reply to this review
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab - Coursera/Udemy-level LMS configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: BookOpen, label: 'General' },
                        { id: 'pricing', icon: DollarSign, label: 'Pricing' },
                        { id: 'certificates', icon: Award, label: 'Certificates' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'integrations', icon: Zap, label: 'Integrations' },
                        { id: 'advanced', icon: Lock, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-500" />
                          Platform Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Platform Name</Label>
                            <Input defaultValue="FreeFlow Academy" />
                          </div>
                          <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="learning@freeflow.io" type="email" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="pt">Portuguese</SelectItem>
                                <SelectItem value="zh">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Allow Course Pre-orders</p>
                              <p className="text-sm text-muted-foreground">Let students purchase courses before release</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Show Course Progress</p>
                              <p className="text-sm text-muted-foreground">Display progress bars on course cards</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Enable Course Reviews</p>
                              <p className="text-sm text-muted-foreground">Allow students to rate and review courses</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-500" />
                          Content Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Video Quality</Label>
                            <Select defaultValue="1080p">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="480p">480p</SelectItem>
                                <SelectItem value="720p">720p HD</SelectItem>
                                <SelectItem value="1080p">1080p Full HD</SelectItem>
                                <SelectItem value="4k">4K Ultra HD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Upload Size (MB)</Label>
                            <Input type="number" defaultValue="500" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Video Autoplay</p>
                            <p className="text-sm text-muted-foreground">Auto-play next lecture when current ends</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Allow Content Download</p>
                            <p className="text-sm text-muted-foreground">Let students download videos for offline viewing</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'pricing' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          Pricing Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="inr">INR (₹)</SelectItem>
                                <SelectItem value="brl">BRL (R$)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Minimum Course Price</Label>
                            <Input type="number" defaultValue="9.99" />
                          </div>
                          <div className="space-y-2">
                            <Label>Platform Commission (%)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Payment Processing Fee (%)</Label>
                            <Input type="number" defaultValue="2.9" />
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Enable Coupons</p>
                              <p className="text-sm text-muted-foreground">Allow instructors to create discount coupons</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Enable Bundles</p>
                              <p className="text-sm text-muted-foreground">Allow course bundle sales at discounted prices</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-500" />
                          Payment Gateways
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Stripe', description: 'Credit cards, Apple Pay, Google Pay', connected: true },
                            { name: 'PayPal', description: 'PayPal balance and cards', connected: true },
                            { name: 'Razorpay', description: 'UPI, Net Banking, Cards (India)', connected: false },
                            { name: 'Crypto', description: 'Bitcoin, Ethereum, USDC', connected: false }
                          ].map(gateway => (
                            <div key={gateway.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{gateway.name}</p>
                                  <p className="text-sm text-muted-foreground">{gateway.description}</p>
                                </div>
                              </div>
                              <Badge variant={gateway.connected ? 'default' : 'secondary'}>
                                {gateway.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-orange-500" />
                          Refund Policy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Refund Window (days)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Completion Threshold (%)</Label>
                            <Input type="number" defaultValue="20" />
                            <p className="text-xs text-muted-foreground">No refund if progress exceeds this</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-approve Refunds</p>
                            <p className="text-sm text-muted-foreground">Automatically approve refunds within policy</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'certificates' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          Certificate Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Certificates</p>
                            <p className="text-sm text-muted-foreground">Issue completion certificates to students</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Require Quiz Completion</p>
                            <p className="text-sm text-muted-foreground">Students must pass all quizzes to get certificate</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Digital Signatures</p>
                            <p className="text-sm text-muted-foreground">Add instructor signatures to certificates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Minimum Passing Score (%)</Label>
                          <Input type="number" defaultValue="70" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-500" />
                          Certificate Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {['Classic', 'Modern', 'Professional', 'Minimal', 'Academic', 'Custom'].map(template => (
                            <div key={template} className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              template === 'Modern' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}>
                              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded mb-2 flex items-center justify-center">
                                <Award className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium text-center">{template}</p>
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-indigo-300 transition-colors">
                          <Upload className="w-4 h-4 inline-block mr-2" />
                          Upload Custom Template
                        </button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Verification
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Public Verification Page</p>
                            <p className="text-sm text-muted-foreground">Allow employers to verify certificates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">LinkedIn Integration</p>
                            <p className="text-sm text-muted-foreground">Let students add to LinkedIn profile</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">QR Code Verification</p>
                            <p className="text-sm text-muted-foreground">Include QR code for instant verification</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-blue-500" />
                          Student Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Course Enrollment</p>
                            <p className="text-sm text-muted-foreground">Notify when enrolled in a new course</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Content Available</p>
                            <p className="text-sm text-muted-foreground">Notify when instructor adds new lectures</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Quiz Reminders</p>
                            <p className="text-sm text-muted-foreground">Remind to complete pending quizzes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Certificate Ready</p>
                            <p className="text-sm text-muted-foreground">Notify when certificate is available</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Course Completion</p>
                            <p className="text-sm text-muted-foreground">Celebrate course completion with email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-500" />
                          Instructor Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Enrollment</p>
                            <p className="text-sm text-muted-foreground">Notify when student enrolls in course</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Review</p>
                            <p className="text-sm text-muted-foreground">Notify when student leaves a review</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Question</p>
                            <p className="text-sm text-muted-foreground">Notify when student asks a question</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Revenue Reports</p>
                            <p className="text-sm text-muted-foreground">Weekly/monthly revenue summaries</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-green-500" />
                          Email Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {['Welcome Email', 'Enrollment Confirmation', 'Course Completion', 'Certificate Issued', 'Review Request', 'Refund Processed'].map(template => (
                            <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{template}</span>
                              </div>
                              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Edit</button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-red-500" />
                          Video Hosting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Native Hosting', description: 'Host videos on FreeFlow servers', connected: true },
                            { name: 'Vimeo', description: 'Professional video hosting', connected: true },
                            { name: 'YouTube', description: 'Unlisted YouTube videos', connected: false },
                            { name: 'Wistia', description: 'Business video platform', connected: false }
                          ].map(host => (
                            <div key={host.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{host.name}</p>
                                  <p className="text-sm text-muted-foreground">{host.description}</p>
                                </div>
                              </div>
                              <Badge variant={host.connected ? 'default' : 'secondary'}>
                                {host.connected ? 'Active' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          Analytics & Marketing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Google Analytics', description: 'Track student behavior', connected: true },
                            { name: 'Facebook Pixel', description: 'Retargeting and ads', connected: true },
                            { name: 'Mailchimp', description: 'Email marketing automation', connected: false },
                            { name: 'ConvertKit', description: 'Creator email marketing', connected: false },
                            { name: 'Hotjar', description: 'Heatmaps and recordings', connected: false }
                          ].map(tool => (
                            <div key={tool.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Link2 className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{tool.name}</p>
                                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                                </div>
                              </div>
                              <Badge variant={tool.connected ? 'default' : 'outline'}>
                                {tool.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-500" />
                          Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Send real-time notifications to external services</p>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-app.com/webhooks/courses" />
                        </div>
                        <div className="space-y-2">
                          <Label>Events to Send</Label>
                          <div className="flex flex-wrap gap-2">
                            {['enrollment', 'completion', 'review', 'refund', 'certificate'].map(event => (
                              <Badge key={event} variant="secondary" className="cursor-pointer hover:bg-indigo-100">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-blue-500" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="lms_live_••••••••••••••••••••" readOnly className="font-mono" />
                            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable API Access</p>
                            <p className="text-sm text-muted-foreground">Allow external applications to access data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                          </div>
                          <Input type="number" defaultValue="1000" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-green-500" />
                          SCORM & xAPI
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SCORM Support</p>
                            <p className="text-sm text-muted-foreground">Import SCORM 1.2 and 2004 packages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">xAPI (Tin Can)</p>
                            <p className="text-sm text-muted-foreground">Track learning experiences with xAPI</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>LRS Endpoint</Label>
                          <Input placeholder="https://your-lrs.com/xapi" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-500" />
                          Security & Privacy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Video DRM Protection</p>
                            <p className="text-sm text-muted-foreground">Protect videos with DRM encryption</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Watermark Videos</p>
                            <p className="text-sm text-muted-foreground">Add student email as watermark</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">IP-based Restrictions</p>
                            <p className="text-sm text-muted-foreground">Limit access by geographic location</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Data Retention (months)</Label>
                          <Input type="number" defaultValue="24" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Archive All Courses</p>
                            <p className="text-sm text-muted-foreground">Move all courses to archive</p>
                          </div>
                          <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            Archive
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Reset All Progress</p>
                            <p className="text-sm text-muted-foreground">Clear all student progress data</p>
                          </div>
                          <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Reset
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Export All Data</p>
                            <p className="text-sm text-muted-foreground">Download courses, students, and analytics</p>
                          </div>
                          <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockCoursesAIInsights}
              title="Course Intelligence"
              onInsightAction={(insight) => toast.info(insight.title`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCoursesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCoursesPredictions}
              title="Learning Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCoursesActivities}
            title="Course Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={coursesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCreateCourseDialog} onOpenChange={setShowCreateCourseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Create New Course
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="course_name">Course Name *</Label>
                <Input
                  id="course_name"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  value={courseForm.course_name}
                  onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={courseForm.course_category}
                  onValueChange={(value) => setCourseForm({ ...courseForm, course_category: value as DBCourseCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={courseForm.level}
                  onValueChange={(value) => setCourseForm({ ...courseForm, level: value as DBCourseLevel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="all_levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="e.g., English"
                  value={courseForm.language}
                  onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price</Label>
                <Input
                  id="original_price"
                  type="number"
                  placeholder="0.00"
                  value={courseForm.original_price}
                  onChange={(e) => setCourseForm({ ...courseForm, original_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="0"
                  value={courseForm.discount_percentage}
                  onChange={(e) => setCourseForm({ ...courseForm, discount_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor_name">Instructor Name</Label>
              <Input
                id="instructor_name"
                placeholder="Your name"
                value={courseForm.instructor_name}
                onChange={(e) => setCourseForm({ ...courseForm, instructor_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                placeholder="Who is this course for?"
                value={courseForm.target_audience}
                onChange={(e) => setCourseForm({ ...courseForm, target_audience: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={courseForm.has_certificates}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, has_certificates: checked })}
                />
                <Label>Certificates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={courseForm.has_downloadable_resources}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, has_downloadable_resources: checked })}
                />
                <Label>Downloadable Resources</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={courseForm.has_lifetime_access}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, has_lifetime_access: checked })}
                />
                <Label>Lifetime Access</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateCourseDialog(false); resetCourseForm() }}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditCourseDialog} onOpenChange={setShowEditCourseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-indigo-500" />
              Edit Course
            </DialogTitle>
            <DialogDescription>
              Update course details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit_course_name">Course Name *</Label>
                <Input
                  id="edit_course_name"
                  placeholder="e.g., Complete Web Development Bootcamp"
                  value={courseForm.course_name}
                  onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_category">Category</Label>
                <Select
                  value={courseForm.course_category}
                  onValueChange={(value) => setCourseForm({ ...courseForm, course_category: value as DBCourseCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                placeholder="Describe what students will learn..."
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit_level">Level</Label>
                <Select
                  value={courseForm.level}
                  onValueChange={(value) => setCourseForm({ ...courseForm, level: value as DBCourseLevel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="all_levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={courseForm.status}
                  onValueChange={(value) => setCourseForm({ ...courseForm, status: value as DBCourseStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit_price">Price</Label>
                <Input
                  id="edit_price"
                  type="number"
                  placeholder="0.00"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_original_price">Original Price</Label>
                <Input
                  id="edit_original_price"
                  type="number"
                  placeholder="0.00"
                  value={courseForm.original_price}
                  onChange={(e) => setCourseForm({ ...courseForm, original_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_discount">Discount %</Label>
                <Input
                  id="edit_discount"
                  type="number"
                  placeholder="0"
                  value={courseForm.discount_percentage}
                  onChange={(e) => setCourseForm({ ...courseForm, discount_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditCourseDialog(false); resetCourseForm(); setSelectedCourse(null) }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Update Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={showDeleteCourseDialog} onOpenChange={setShowDeleteCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Course
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{courseToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteCourseDialog(false); setCourseToDelete(null) }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              Add Section
            </DialogTitle>
            <DialogDescription>
              Add a new section to the course curriculum
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section_title">Section Title *</Label>
              <Input
                id="section_title"
                placeholder="e.g., Introduction to Web Development"
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section_description">Description</Label>
              <Textarea
                id="section_description"
                placeholder="What will this section cover?"
                value={sectionForm.description}
                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section_order">Order</Label>
              <Input
                id="section_order"
                type="number"
                placeholder="1"
                value={sectionForm.order}
                onChange={(e) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddSectionDialog(false); resetSectionForm() }}>
              Cancel
            </Button>
            <Button onClick={handleAddSection} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lecture Dialog */}
      <Dialog open={showAddLectureDialog} onOpenChange={setShowAddLectureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-500" />
              Add Lecture
            </DialogTitle>
            <DialogDescription>
              Add a new lecture to the section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lecture_title">Lecture Title *</Label>
              <Input
                id="lecture_title"
                placeholder="e.g., Welcome to the Course"
                value={lectureForm.title}
                onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="lecture_type">Type</Label>
                <Select
                  value={lectureForm.type}
                  onValueChange={(value) => setLectureForm({ ...lectureForm, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lecture_duration">Duration (minutes)</Label>
                <Input
                  id="lecture_duration"
                  type="number"
                  placeholder="10"
                  value={lectureForm.duration}
                  onChange={(e) => setLectureForm({ ...lectureForm, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={lectureForm.isPreview}
                onCheckedChange={(checked) => setLectureForm({ ...lectureForm, isPreview: checked })}
              />
              <Label>Available as Free Preview</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddLectureDialog(false); resetLectureForm() }}>
              Cancel
            </Button>
            <Button onClick={() => handleAddLecture('')} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Lecture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Quiz Dialog */}
      <Dialog open={showCreateQuizDialog} onOpenChange={setShowCreateQuizDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Create Quiz
            </DialogTitle>
            <DialogDescription>
              Create a new quiz to test student knowledge
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quiz_title">Quiz Title *</Label>
              <Input
                id="quiz_title"
                placeholder="e.g., Module 1 Assessment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz_description">Description</Label>
              <Textarea
                id="quiz_description"
                placeholder="Describe what this quiz covers..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  placeholder="70"
                  defaultValue={70}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  placeholder="30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quiz Type</Label>
              <Select defaultValue="multiple_choice">
                <SelectTrigger>
                  <SelectValue placeholder="Select quiz type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="mixed">Mixed Question Types</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateQuizDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast.success('Quiz created successfully')
              setShowCreateQuizDialog(false)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Analytics Dialog */}
      <Dialog open={showViewAnalyticsDialog} onOpenChange={setShowViewAnalyticsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Course Analytics
            </DialogTitle>
            <DialogDescription>
              View detailed analytics for your courses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalStudents.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCompletions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Completions</p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Quick Insights</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {stats.publishedCourses} of {stats.totalCourses} courses published
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {stats.totalHours} total hours of content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {stats.totalReviews} student reviews received
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewAnalyticsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setActiveView('analytics')
              setShowViewAnalyticsDialog(false)
            }}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Analytics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
