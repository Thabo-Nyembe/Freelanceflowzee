// Training V2 - Docebo Level Learning Management System
// Comprehensive LMS with courses, learning paths, certifications, and gamification
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Award,
  Target,
  Users,
  Clock,
  Play,
  CheckCircle2,
  Star,
  Trophy,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Plus,
  Settings,
  BarChart3,
  Zap,
  Medal,
  Crown,
  Flame,
  Brain,
  Laptop,
  Shield,
  Lightbulb,
  ChevronRight,
  Lock,
  Unlock,
  Download,
  Share2,
  MessageSquare,
  ThumbsUp,
  Eye,
  LayoutGrid,
  List,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  ExternalLink,
  Key,
  Webhook,
  Database,
  Trash2,
  RefreshCw,
  Palette,
  AlertOctagon,
  Link2,
  Mail,
  Bell,
  Globe,
  Upload,
  Copy,
  Archive,
  BellRing,
  Slack,
  MessageCircle,
  Layers,
  Package,
  Inbox,
  Layout,
  Type,
  FileQuestion,
  Timer,
  Volume2,
  Subtitles,
  Monitor,
  Smartphone,
  PenTool,
  Gauge,
  AlertTriangle,
} from 'lucide-react'

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

import {
  trainingAIInsights,
  trainingCollaborators,
  trainingPredictions,
  trainingActivities,
  trainingQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type CourseStatus = 'draft' | 'published' | 'archived'
type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue'
type ContentType = 'video' | 'document' | 'quiz' | 'assignment' | 'webinar' | 'scorm'
type CourseCategory = 'technical' | 'leadership' | 'compliance' | 'soft_skills' | 'product' | 'onboarding'
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface Instructor {
  id: string
  name: string
  title: string
  avatar?: string
  courses: number
  rating: number
  students: number
}

interface Course {
  id: string
  title: string
  description: string
  category: CourseCategory
  status: CourseStatus
  difficulty: DifficultyLevel
  instructor: Instructor
  duration: string // e.g., "4h 30m"
  modules: Module[]
  enrollments: number
  rating: number
  reviews: number
  thumbnail?: string
  tags: string[]
  price?: number
  isFeatured: boolean
  isMandatory: boolean
  dueDate?: string
  prerequisites: string[]
  skills: string[]
  certificationId?: string
  createdAt: string
  updatedAt: string
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
  duration: string
  order: number
}

interface Lesson {
  id: string
  title: string
  type: ContentType
  duration: string
  order: number
  isPreview: boolean
}

interface LearningPath {
  id: string
  title: string
  description: string
  courses: Course[]
  duration: string
  enrollments: number
  completionRate: number
  skills: string[]
  level: DifficultyLevel
  certificationId?: string
}

interface Enrollment {
  id: string
  userId: string
  courseId: string
  course: Course
  status: EnrollmentStatus
  progress: number
  startedAt: string
  completedAt?: string
  lastAccessedAt: string
  timeSpent: string
  score?: number
  certificateUrl?: string
}

interface Certification {
  id: string
  name: string
  description: string
  requirements: string[]
  validityPeriod: string
  earnedCount: number
  badgeUrl?: string
}

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  points: number
  coursesCompleted: number
  badges: number
  streak: number
}

interface LearningStats {
  totalCourses: number
  enrolledCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLearningTime: string
  averageScore: number
  certificationsEarned: number
  currentStreak: number
  points: number
  rank: number
}

// Mock data
const mockInstructors: Instructor[] = [
  { id: 'i1', name: 'Dr. Sarah Chen', title: 'Senior Technical Lead', courses: 12, rating: 4.9, students: 2456 },
  { id: 'i2', name: 'Michael Foster', title: 'Leadership Coach', courses: 8, rating: 4.8, students: 1823 },
  { id: 'i3', name: 'Emily Rodriguez', title: 'Compliance Expert', courses: 5, rating: 4.7, students: 3421 },
]

const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Advanced TypeScript Development',
    description: 'Master TypeScript with advanced patterns, generics, and best practices for enterprise applications.',
    category: 'technical',
    status: 'published',
    difficulty: 'advanced',
    instructor: mockInstructors[0],
    duration: '12h 30m',
    modules: [
      { id: 'm1', title: 'TypeScript Fundamentals Review', lessons: [], duration: '2h', order: 1 },
      { id: 'm2', title: 'Advanced Generics', lessons: [], duration: '3h', order: 2 },
      { id: 'm3', title: 'Design Patterns in TypeScript', lessons: [], duration: '4h', order: 3 },
    ],
    enrollments: 856,
    rating: 4.9,
    reviews: 234,
    tags: ['typescript', 'programming', 'frontend'],
    isFeatured: true,
    isMandatory: false,
    prerequisites: ['JavaScript Fundamentals'],
    skills: ['TypeScript', 'Software Design', 'Code Quality'],
    certificationId: 'cert1',
    createdAt: '2024-08-15',
    updatedAt: '2024-12-20'
  },
  {
    id: 'c2',
    title: 'Leadership Excellence Program',
    description: 'Develop essential leadership skills including communication, delegation, and team management.',
    category: 'leadership',
    status: 'published',
    difficulty: 'intermediate',
    instructor: mockInstructors[1],
    duration: '8h 15m',
    modules: [
      { id: 'm4', title: 'Leadership Foundations', lessons: [], duration: '2h', order: 1 },
      { id: 'm5', title: 'Effective Communication', lessons: [], duration: '3h', order: 2 },
      { id: 'm6', title: 'Team Building', lessons: [], duration: '3h', order: 3 },
    ],
    enrollments: 1243,
    rating: 4.8,
    reviews: 456,
    tags: ['leadership', 'management', 'soft-skills'],
    isFeatured: true,
    isMandatory: false,
    prerequisites: [],
    skills: ['Leadership', 'Communication', 'Team Management'],
    createdAt: '2024-06-10',
    updatedAt: '2024-12-18'
  },
  {
    id: 'c3',
    title: 'Data Privacy & Compliance 2024',
    description: 'Annual compliance training covering GDPR, CCPA, and company data handling policies.',
    category: 'compliance',
    status: 'published',
    difficulty: 'beginner',
    instructor: mockInstructors[2],
    duration: '2h 45m',
    modules: [
      { id: 'm7', title: 'Introduction to Data Privacy', lessons: [], duration: '45m', order: 1 },
      { id: 'm8', title: 'GDPR Requirements', lessons: [], duration: '1h', order: 2 },
      { id: 'm9', title: 'Company Policies', lessons: [], duration: '1h', order: 3 },
    ],
    enrollments: 4521,
    rating: 4.5,
    reviews: 892,
    tags: ['compliance', 'gdpr', 'privacy', 'mandatory'],
    isFeatured: false,
    isMandatory: true,
    dueDate: '2025-01-31',
    prerequisites: [],
    skills: ['Data Privacy', 'Compliance', 'Risk Management'],
    certificationId: 'cert2',
    createdAt: '2024-01-05',
    updatedAt: '2024-12-01'
  },
  {
    id: 'c4',
    title: 'New Employee Onboarding',
    description: 'Welcome to the team! Learn about our culture, tools, and processes to get started.',
    category: 'onboarding',
    status: 'published',
    difficulty: 'beginner',
    instructor: mockInstructors[1],
    duration: '4h 00m',
    modules: [
      { id: 'm10', title: 'Company Overview', lessons: [], duration: '1h', order: 1 },
      { id: 'm11', title: 'Tools & Systems', lessons: [], duration: '1.5h', order: 2 },
      { id: 'm12', title: 'Team & Culture', lessons: [], duration: '1.5h', order: 3 },
    ],
    enrollments: 2341,
    rating: 4.7,
    reviews: 567,
    tags: ['onboarding', 'new-hire', 'culture'],
    isFeatured: false,
    isMandatory: true,
    prerequisites: [],
    skills: ['Company Knowledge', 'Tools Proficiency'],
    createdAt: '2024-01-01',
    updatedAt: '2024-11-15'
  },
  {
    id: 'c5',
    title: 'Effective Communication Skills',
    description: 'Master the art of professional communication in various workplace scenarios.',
    category: 'soft_skills',
    status: 'published',
    difficulty: 'intermediate',
    instructor: mockInstructors[1],
    duration: '6h 00m',
    modules: [],
    enrollments: 1567,
    rating: 4.6,
    reviews: 321,
    tags: ['communication', 'soft-skills', 'presentation'],
    isFeatured: false,
    isMandatory: false,
    prerequisites: [],
    skills: ['Communication', 'Presentation', 'Writing'],
    createdAt: '2024-03-20',
    updatedAt: '2024-10-10'
  },
]

const mockLearningPaths: LearningPath[] = [
  {
    id: 'lp1',
    title: 'Full-Stack Developer Path',
    description: 'Become a proficient full-stack developer with this comprehensive learning track.',
    courses: mockCourses.filter(c => c.category === 'technical'),
    duration: '45h',
    enrollments: 456,
    completionRate: 34,
    skills: ['Frontend', 'Backend', 'Database', 'DevOps'],
    level: 'intermediate',
    certificationId: 'cert3'
  },
  {
    id: 'lp2',
    title: 'Management Track',
    description: 'Prepare for leadership roles with essential management and leadership skills.',
    courses: mockCourses.filter(c => c.category === 'leadership'),
    duration: '24h',
    enrollments: 234,
    completionRate: 45,
    skills: ['Leadership', 'Management', 'Strategy'],
    level: 'advanced'
  },
]

const mockEnrollments: Enrollment[] = [
  {
    id: 'e1',
    userId: 'u1',
    courseId: 'c1',
    course: mockCourses[0],
    status: 'in_progress',
    progress: 65,
    startedAt: '2024-11-15',
    lastAccessedAt: '2024-12-22',
    timeSpent: '8h 15m',
    score: 87
  },
  {
    id: 'e2',
    userId: 'u1',
    courseId: 'c3',
    course: mockCourses[2],
    status: 'completed',
    progress: 100,
    startedAt: '2024-12-01',
    completedAt: '2024-12-15',
    lastAccessedAt: '2024-12-15',
    timeSpent: '2h 45m',
    score: 95,
    certificateUrl: '/certificates/cert2.pdf'
  },
  {
    id: 'e3',
    userId: 'u1',
    courseId: 'c4',
    course: mockCourses[3],
    status: 'not_started',
    progress: 0,
    startedAt: '2024-12-20',
    lastAccessedAt: '2024-12-20',
    timeSpent: '0m'
  },
]

const mockCertifications: Certification[] = [
  { id: 'cert1', name: 'TypeScript Professional', description: 'Demonstrates advanced TypeScript proficiency', requirements: ['Complete Advanced TypeScript Development', 'Pass final exam with 85%+'], validityPeriod: '2 years', earnedCount: 234 },
  { id: 'cert2', name: 'Data Privacy Certified', description: 'Certified in data privacy compliance', requirements: ['Complete Data Privacy & Compliance 2024', 'Pass compliance exam'], validityPeriod: '1 year', earnedCount: 3421 },
  { id: 'cert3', name: 'Full-Stack Developer', description: 'Certified full-stack development skills', requirements: ['Complete Full-Stack Developer Path', 'Submit portfolio project'], validityPeriod: '3 years', earnedCount: 156 },
]

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u2', name: 'Alex Thompson', points: 12450, coursesCompleted: 24, badges: 15, streak: 45 },
  { rank: 2, userId: 'u3', name: 'Sarah Miller', points: 11230, coursesCompleted: 22, badges: 13, streak: 32 },
  { rank: 3, userId: 'u4', name: 'James Wilson', points: 10890, coursesCompleted: 20, badges: 12, streak: 28 },
  { rank: 4, userId: 'u1', name: 'You', points: 8750, coursesCompleted: 15, badges: 9, streak: 12 },
  { rank: 5, userId: 'u5', name: 'Emily Chen', points: 8230, coursesCompleted: 14, badges: 8, streak: 18 },
]

const mockStats: LearningStats = {
  totalCourses: mockCourses.length,
  enrolledCourses: mockEnrollments.length,
  completedCourses: mockEnrollments.filter(e => e.status === 'completed').length,
  inProgressCourses: mockEnrollments.filter(e => e.status === 'in_progress').length,
  totalLearningTime: '28h 45m',
  averageScore: 91,
  certificationsEarned: 2,
  currentStreak: 12,
  points: 8750,
  rank: 4
}

// Helper functions
const getCategoryIcon = (category: CourseCategory) => {
  const icons: Record<CourseCategory, typeof Brain> = {
    technical: Laptop,
    leadership: Crown,
    compliance: Shield,
    soft_skills: Lightbulb,
    product: Target,
    onboarding: Users
  }
  return icons[category]
}

const getCategoryColor = (category: CourseCategory): string => {
  const colors: Record<CourseCategory, string> = {
    technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    leadership: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    compliance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    soft_skills: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    product: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    onboarding: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
  }
  return colors[category]
}

const getDifficultyColor = (level: DifficultyLevel): string => {
  const colors: Record<DifficultyLevel, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-orange-100 text-orange-700',
    expert: 'bg-red-100 text-red-700'
  }
  return colors[level]
}

const getEnrollmentStatusColor = (status: EnrollmentStatus): string => {
  const colors: Record<EnrollmentStatus, string> = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700'
  }
  return colors[status]
}

interface TrainingClientProps {
  initialPrograms?: any[]
}

export default function TrainingClient({ initialPrograms }: TrainingClientProps) {
  const [activeTab, setActiveTab] = useState('catalog')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [settingsTab, setSettingsTab] = useState('general')

  // Filter courses
  const filteredCourses = useMemo(() => {
    let result = [...mockCourses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query)) ||
        course.skills.some(skill => skill.toLowerCase().includes(query))
      )
    }

    if (categoryFilter !== 'all') {
      result = result.filter(course => course.category === categoryFilter)
    }

    if (difficultyFilter !== 'all') {
      result = result.filter(course => course.difficulty === difficultyFilter)
    }

    return result
  }, [searchQuery, categoryFilter, difficultyFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Center</h1>
              <p className="text-gray-600 dark:text-gray-400">Docebo-level LMS platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 text-orange-700">
              <Flame className="w-4 h-4" />
              <span className="font-medium">{mockStats.currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">{mockStats.points.toLocaleString()} pts</span>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Enrolled</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.enrolledCourses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Play className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">In Progress</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.inProgressCourses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Completed</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.completedCourses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Learning Time</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.totalLearningTime}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Avg Score</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.averageScore}%</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-gray-500">Certificates</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.certificationsEarned}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Medal className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-gray-500">Rank</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">#{mockStats.rank}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-500">Streak</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.currentStreak}d</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="catalog" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Course Catalog
            </TabsTrigger>
            <TabsTrigger value="my-learning" className="gap-2">
              <Play className="w-4 h-4" />
              My Learning
            </TabsTrigger>
            <TabsTrigger value="paths" className="gap-2">
              <Target className="w-4 h-4" />
              Learning Paths
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Award className="w-4 h-4" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Course Catalog Tab */}
          <TabsContent value="catalog" className="space-y-4">
            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search courses, skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as CourseCategory | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="leadership">Leadership</option>
                    <option value="compliance">Compliance</option>
                    <option value="soft_skills">Soft Skills</option>
                    <option value="product">Product</option>
                    <option value="onboarding">Onboarding</option>
                  </select>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as DifficultyLevel | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredCourses.map((course) => {
                const CategoryIcon = getCategoryIcon(course.category)
                return (
                  <Card
                    key={course.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="h-32 bg-gradient-to-br from-emerald-400 to-green-600 relative">
                      {course.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {course.isMandatory && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                          Required
                        </Badge>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <CategoryIcon className="w-8 h-8 text-white/90" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(course.category)}>{course.category.replace('_', ' ')}</Badge>
                        <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{course.description}</p>

                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollments.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {course.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{course.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">{course.instructor.name}</span>
                        </div>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Enroll
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* My Learning Tab */}
          <TabsContent value="my-learning" className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Continue Learning</h3>
            <div className="space-y-3">
              {mockEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{enrollment.course.title}</h4>
                          <Badge className={getEnrollmentStatusColor(enrollment.status)}>{enrollment.status.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span>{enrollment.course.instructor.name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {enrollment.timeSpent} spent
                          </span>
                          {enrollment.score && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {enrollment.score}% score
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={enrollment.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{enrollment.progress}%</span>
                        </div>
                      </div>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLearningPaths.map((path) => (
                <Card key={path.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(path.level)}>{path.level}</Badge>
                      {path.certificationId && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                          <Award className="w-3 h-3 mr-1" />
                          Certification
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{path.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{path.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {path.courses.length} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {path.enrollments} enrolled
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {path.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>

                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Start Learning Path
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockCertifications.map((cert) => (
                <Card key={cert.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{cert.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{cert.description}</p>
                    <div className="text-sm text-gray-500 mb-4">
                      <div>Valid for: {cert.validityPeriod}</div>
                      <div>{cert.earnedCount.toLocaleString()} earned</div>
                    </div>
                    <Button variant="outline" className="w-full">View Requirements</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Learners This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLeaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.userId === 'u1' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                        entry.rank === 3 ? 'bg-amber-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? <Crown className="w-5 h-5" /> :
                          entry.rank === 2 ? <Medal className="w-5 h-5" /> :
                          <Medal className="w-5 h-5" />
                        ) : entry.rank}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{entry.name}</div>
                        <div className="text-sm text-gray-500">
                          {entry.coursesCompleted} courses • {entry.badges} badges • {entry.streak}d streak
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-600">{entry.points.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Learning Settings</h2>
                <p className="text-sm text-gray-500">Configure your learning platform preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'learning', icon: BookOpen, label: 'Learning' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'integrations', icon: Link2, label: 'Integrations' },
                        { id: 'gamification', icon: Trophy, label: 'Gamification' },
                        { id: 'advanced', icon: Gauge, label: 'Advanced' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
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
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Display Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select defaultValue="grid">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="compact">Compact View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Courses Per Page</Label>
                            <Select defaultValue="12">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="6">6 courses</SelectItem>
                                <SelectItem value="12">12 courses</SelectItem>
                                <SelectItem value="24">24 courses</SelectItem>
                                <SelectItem value="48">48 courses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Progress Bars</div>
                            <div className="text-sm text-gray-500">Display course progress on cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Difficulty Badges</div>
                            <div className="text-sm text-gray-500">Display difficulty level on course cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Dark Mode for Player</div>
                            <div className="text-sm text-gray-500">Use dark theme in video player</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Language & Region
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
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
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="cet">Central European Time (CET)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-Translate Content</div>
                            <div className="text-sm text-gray-500">Automatically translate course descriptions</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="h-5 w-5" />
                          Accessibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">High Contrast Mode</div>
                            <div className="text-sm text-gray-500">Increase visual contrast for better readability</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Keyboard Navigation</div>
                            <div className="text-sm text-gray-500">Enable enhanced keyboard shortcuts</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Screen Reader Optimization</div>
                            <div className="text-sm text-gray-500">Optimize interface for screen readers</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Learning Settings */}
                {settingsTab === 'learning' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5" />
                          Video Player
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Playback Speed</Label>
                            <Select defaultValue="1">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.5">0.5x</SelectItem>
                                <SelectItem value="0.75">0.75x</SelectItem>
                                <SelectItem value="1">1x (Normal)</SelectItem>
                                <SelectItem value="1.25">1.25x</SelectItem>
                                <SelectItem value="1.5">1.5x</SelectItem>
                                <SelectItem value="2">2x</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Video Quality</Label>
                            <Select defaultValue="auto">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Auto</SelectItem>
                                <SelectItem value="1080p">1080p HD</SelectItem>
                                <SelectItem value="720p">720p</SelectItem>
                                <SelectItem value="480p">480p</SelectItem>
                                <SelectItem value="360p">360p</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Subtitles className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">Auto-Enable Subtitles</div>
                              <div className="text-sm text-gray-500">Show captions automatically when available</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <PlayCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Autoplay Next Lesson</div>
                              <div className="text-sm text-gray-500">Automatically play the next lesson</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Volume2 className="h-5 w-5 text-purple-500" />
                            <div>
                              <div className="font-medium">Remember Volume</div>
                              <div className="text-sm text-gray-500">Remember volume level across sessions</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Timer className="h-5 w-5" />
                          Progress & Tracking
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Completion Threshold</Label>
                            <Select defaultValue="90">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="80">80% watched</SelectItem>
                                <SelectItem value="90">90% watched</SelectItem>
                                <SelectItem value="95">95% watched</SelectItem>
                                <SelectItem value="100">100% watched</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Session Timeout</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Track Offline Learning</div>
                            <div className="text-sm text-gray-500">Sync offline progress when back online</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Resume Where Left Off</div>
                            <div className="text-sm text-gray-500">Automatically resume from last position</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileQuestion className="h-5 w-5" />
                          Assessments
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Quiz Attempts</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 attempt</SelectItem>
                                <SelectItem value="3">3 attempts</SelectItem>
                                <SelectItem value="5">5 attempts</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Passing Score</Label>
                            <Select defaultValue="70">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60">60%</SelectItem>
                                <SelectItem value="70">70%</SelectItem>
                                <SelectItem value="80">80%</SelectItem>
                                <SelectItem value="90">90%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Correct Answers</div>
                            <div className="text-sm text-gray-500">Display correct answers after quiz completion</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Randomize Questions</div>
                            <div className="text-sm text-gray-500">Shuffle question order for each attempt</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Course Updates</div>
                            <div className="text-sm text-gray-500">New lessons, content updates</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Due Date Reminders</div>
                            <div className="text-sm text-gray-500">Reminders for mandatory training deadlines</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Certification Expiry</div>
                            <div className="text-sm text-gray-500">Alerts when certifications are about to expire</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Weekly Progress Digest</div>
                            <div className="text-sm text-gray-500">Summary of your learning progress</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Course Recommendations</div>
                            <div className="text-sm text-gray-500">Personalized course suggestions</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BellRing className="h-5 w-5" />
                          Push Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Learning Reminders</div>
                            <div className="text-sm text-gray-500">Daily reminders to continue learning</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Achievement Unlocked</div>
                            <div className="text-sm text-gray-500">Notify when you earn badges or certificates</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Streak Alerts</div>
                            <div className="text-sm text-gray-500">Reminders to maintain your learning streak</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Reminder Time</Label>
                          <Select defaultValue="9am">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8am">8:00 AM</SelectItem>
                              <SelectItem value="9am">9:00 AM</SelectItem>
                              <SelectItem value="12pm">12:00 PM</SelectItem>
                              <SelectItem value="6pm">6:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Slack className="h-5 w-5" />
                          Slack Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                              <Slack className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-medium">Slack Connected</div>
                              <div className="text-sm text-gray-500">#learning channel</div>
                            </div>
                            <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <Button variant="outline" size="sm">Configure Channel</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Share Completions</div>
                            <div className="text-sm text-gray-500">Post to Slack when you complete courses</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Share Certificates</div>
                            <div className="text-sm text-gray-500">Post to Slack when you earn certificates</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link2 className="h-5 w-5" />
                          Connected Services
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'LinkedIn Learning', icon: Layers, description: 'Import completed courses', connected: true, color: 'text-blue-500' },
                          { name: 'Coursera', icon: GraduationCap, description: 'Sync course progress', connected: false, color: 'text-blue-600' },
                          { name: 'Udemy Business', icon: BookOpen, description: 'Import course catalog', connected: true, color: 'text-purple-500' },
                          { name: 'Zoom', icon: Video, description: 'Webinar integration', connected: true, color: 'text-blue-400' },
                          { name: 'Google Workspace', icon: Globe, description: 'Calendar & SSO', connected: true, color: 'text-green-500' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <integration.icon className={`h-6 w-6 ${integration.color}`} />
                              <div>
                                <div className="font-medium">{integration.name}</div>
                                <div className="text-sm text-gray-500">{integration.description}</div>
                              </div>
                            </div>
                            {integration.connected ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">Connected</Badge>
                                <Button variant="ghost" size="sm">Configure</Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm">Connect</Button>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">API Key</div>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              lms_live_•••••••••••••••••••••••
                            </code>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">8,234</div>
                            <div className="text-sm text-gray-500">API Calls (30 days)</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">32ms</div>
                            <div className="text-sm text-gray-500">Avg Response Time</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Documentation
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border rounded-lg divide-y">
                          {[
                            { url: 'https://api.company.com/webhooks/lms', events: ['course.completed', 'cert.earned'], status: 'active' },
                            { url: 'https://hr.company.com/training-sync', events: ['enrollment.created'], status: 'active' },
                          ].map((webhook, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{webhook.url}</code>
                                <div className="flex items-center gap-2 mt-2">
                                  {webhook.events.map(event => (
                                    <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">{webhook.status}</Badge>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Gamification Settings */}
                {settingsTab === 'gamification' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Points & Rewards
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Points System</div>
                            <div className="text-sm text-gray-500">Earn points for completing courses and activities</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Course Completion Points</Label>
                            <Select defaultValue="100">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50 points</SelectItem>
                                <SelectItem value="100">100 points</SelectItem>
                                <SelectItem value="200">200 points</SelectItem>
                                <SelectItem value="500">500 points</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Quiz Perfect Score Bonus</Label>
                            <Select defaultValue="50">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="25">25 bonus</SelectItem>
                                <SelectItem value="50">50 bonus</SelectItem>
                                <SelectItem value="100">100 bonus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Flame className="h-5 w-5" />
                          Streaks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Streak Tracking</div>
                            <div className="text-sm text-gray-500">Track consecutive days of learning</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Minimum Daily Activity</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 minute</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="10">10 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Streak Freeze Days</Label>
                            <Select defaultValue="2">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0 days</SelectItem>
                                <SelectItem value="1">1 day</SelectItem>
                                <SelectItem value="2">2 days</SelectItem>
                                <SelectItem value="3">3 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                              <Flame className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium">Current Streak</div>
                              <div className="text-sm text-gray-500">{mockStats.currentStreak} days</div>
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Medal className="h-5 w-5" />
                          Leaderboards
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show on Leaderboard</div>
                            <div className="text-sm text-gray-500">Display your progress on public leaderboard</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Display Name</div>
                            <div className="text-sm text-gray-500">Show real name instead of username</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Compete in Team Challenges</div>
                            <div className="text-sm text-gray-500">Participate in team-based competitions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockStats.enrolledCourses}</div>
                            <div className="text-sm text-gray-500">Enrollments</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockStats.completedCourses}</div>
                            <div className="text-sm text-gray-500">Completed</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">4.8 GB</div>
                            <div className="text-sm text-gray-500">Downloaded</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export Learning Data
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Upload className="h-4 w-4 mr-2" />
                            Import Transcript
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5" />
                          Offline Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Offline Downloads</div>
                            <div className="text-sm text-gray-500">Download courses for offline viewing</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Download Quality</Label>
                          <Select defaultValue="720p">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="480p">480p (Save space)</SelectItem>
                              <SelectItem value="720p">720p (Balanced)</SelectItem>
                              <SelectItem value="1080p">1080p (Best quality)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Max Storage</Label>
                          <Select defaultValue="10gb">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2gb">2 GB</SelectItem>
                              <SelectItem value="5gb">5 GB</SelectItem>
                              <SelectItem value="10gb">10 GB</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Downloaded Content
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Reset Progress</div>
                            <div className="text-sm text-gray-500">Reset all course progress (keeps certificates)</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Delete Learning History</div>
                            <div className="text-sm text-gray-500">Permanently delete all learning data</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Revoke All Certificates</div>
                            <div className="text-sm text-gray-500">Remove all earned certifications</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <Archive className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
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
              insights={trainingAIInsights}
              title="Training Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={trainingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={trainingPredictions}
              title="Learning Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={trainingActivities}
            title="Training Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={trainingQuickActions}
            variant="grid"
          />
        </div>

        {/* Course Detail Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedCourse && (
              <>
                <div className="h-40 -mx-6 -mt-6 mb-4 bg-gradient-to-br from-emerald-400 to-green-600 relative">
                  {selectedCourse.isFeatured && (
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(selectedCourse.category)}>{selectedCourse.category.replace('_', ' ')}</Badge>
                    <Badge className={getDifficultyColor(selectedCourse.difficulty)}>{selectedCourse.difficulty}</Badge>
                    {selectedCourse.isMandatory && <Badge className="bg-red-100 text-red-700">Required</Badge>}
                  </div>
                  <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-400">{selectedCourse.description}</p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {selectedCourse.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {selectedCourse.enrollments.toLocaleString()} enrolled
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {selectedCourse.rating} ({selectedCourse.reviews} reviews)
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{selectedCourse.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{selectedCourse.instructor.name}</div>
                      <div className="text-sm text-gray-500">{selectedCourse.instructor.title}</div>
                      <div className="text-xs text-gray-500">{selectedCourse.instructor.courses} courses • {selectedCourse.instructor.students.toLocaleString()} students</div>
                    </div>
                  </div>

                  {selectedCourse.modules.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Course Content</h4>
                      <div className="space-y-2">
                        {selectedCourse.modules.map((module) => (
                          <div key={module.id} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{module.title}</span>
                              <span className="text-sm text-gray-500">{module.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-3">Skills You Will Learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedCourse.prerequisites.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Prerequisites</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {selectedCourse.prerequisites.map(prereq => (
                          <li key={prereq}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Enroll Now
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
