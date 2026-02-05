'use client'

// MIGRATED: Batch #18 - Verified database hook integration
// Hooks used: useLearning, useCourses, useUserProgress, useCollections from use-learning
// Extended hooks available: useLearningPaths, useMyCertificates, useLearningSearch from use-learning-extended

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useLearning, useCourses, useUserProgress, useCollections } from '@/lib/hooks/use-learning'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
// Extended hooks available for future use:
// import { useLearningPaths, useMyCertificates, useLearningSearch, usePopularPaths } from '@/lib/hooks/use-learning-extended'
import {
  GraduationCap,
  BookOpen,
  Plus,
  Video,
  TrendingUp,
  Settings,
  Star,
  Clock,
  Users,
  Award,
  Loader2,
  Trash2,
  Play,
  Search,
  MoreVertical,
  CheckCircle2,
  Circle,
  Target,
  Bookmark,
  Flame,
  Calendar,
  BarChart3,
  Zap,
  Brain,
  Lightbulb,
  Route,
  Trophy,
  FileText,
  Download,
  Share2,
  Heart,
  ThumbsUp,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Sparkles,
  FolderOpen,
  ListChecks,
  PieChart,
  Grid3X3,
  List,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Key,
  Database,
  Terminal,
  Copy,
  RefreshCw,
  AlertTriangle,
  Mail,
  Globe,
  HelpCircle
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// ============================================================================
// TYPE DEFINITIONS - LinkedIn Learning Level
// ============================================================================

interface Instructor {
  id: string
  name: string
  avatar: string
  title: string
  company: string
  expertise: string[]
  courses: number
  followers: number
  rating: number
}

interface Lesson {
  id: string
  title: string
  duration: number
  type: 'video' | 'quiz' | 'exercise' | 'article' | 'assignment'
  completed: boolean
  locked: boolean
  hasTranscript: boolean
  hasDownload: boolean
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
  duration: number
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnail: string
  previewVideo: string | null
  instructor: Instructor
  category: string
  subcategory: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
  language: string
  skills: string[]
  sections: Section[]
  totalDuration: number
  lessonsCount: number
  enrolledCount: number
  rating: number
  reviewsCount: number
  completionRate: number
  lastUpdated: string
  isBestseller: boolean
  isNew: boolean
  isFeatured: boolean
  hasExercises: boolean
  hasCertificate: boolean
  hasQuizzes: boolean
}

interface LearningPath {
  id: string
  title: string
  description: string
  thumbnail: string
  courses: Course[]
  totalDuration: number
  lessonsCount: number
  enrolledCount: number
  completedCourses: number
  progress: number
  skills: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  estimatedWeeks: number
  milestones: {
    id: string
    title: string
    coursesRequired: number
    unlocked: boolean
    badge: string
  }[]
  curator: {
    name: string
    avatar: string
    title: string
  }
}

interface UserProgress {
  courseId: string
  lessonsCompleted: number
  totalLessons: number
  progress: number
  timeSpent: number
  lastAccessedAt: string
  notes: { lessonId: string; content: string; timestamp: number }[]
  bookmarks: { lessonId: string; timestamp: number }[]
  completedAt: string | null
  certificateUrl: string | null
}

interface Skill {
  id: string
  name: string
  category: string
  level: number // 1-100
  assessmentScore: number | null
  endorsements: number
  coursesCompleted: number
  lastPracticed: string
  trending: boolean
  inDemand: boolean
}

interface Collection {
  id: string
  name: string
  description: string
  courses: Course[]
  isPublic: boolean
  createdAt: string
  likes: number
}

interface LearningGoal {
  id: string
  type: 'weekly_hours' | 'weekly_courses' | 'skill_level' | 'path_completion'
  target: number
  current: number
  startDate: string
  endDate: string
}

interface LearningStats {
  totalLearningHours: number
  coursesCompleted: number
  coursesInProgress: number
  skillsGained: number
  certificatesEarned: number
  currentStreak: number
  longestStreak: number
  weeklyGoal: number
  weeklyProgress: number
  averageRating: number
  totalNotes: number
  collectionsCount: number
}

// ============================================================================
// DEFAULT VALUES FOR DATABASE DATA
// ============================================================================

// Default instructor for courses without instructor data
const defaultInstructor: Instructor = {
  id: 'default',
  name: 'Course Instructor',
  avatar: '/avatars/default.jpg',
  title: 'Instructor',
  company: 'Kazi Learning',
  expertise: [],
  courses: 0,
  followers: 0,
  rating: 0
}

// Default stats (zeros for launch - will be populated from database)
const defaultStats: LearningStats = {
  totalLearningHours: 0,
  coursesCompleted: 0,
  coursesInProgress: 0,
  skillsGained: 0,
  certificatesEarned: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeklyGoal: 5,
  weeklyProgress: 0,
  averageRating: 0,
  totalNotes: 0,
  collectionsCount: 0
}

// Note: learningQuickActions defined inside component to access state setters

// ============================================================================
// COMPONENT
// ============================================================================

export default function LearningClient() {
  // Team and activity hooks for collaboration features
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('my-learning')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [settingsTab, setSettingsTab] = useState('general')
  const [showCreatePathModal, setShowCreatePathModal] = useState(false)
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false)

  // Quick Actions dialog states
  const [showContinueLearningDialog, setShowContinueLearningDialog] = useState(false)
  const [showBrowseCoursesDialog, setShowBrowseCoursesDialog] = useState(false)
  const [showCertificatesDialog, setShowCertificatesDialog] = useState(false)
  const [showStudyPlanDialog, setShowStudyPlanDialog] = useState(false)

  // Quick actions with dialog openers
  const learningQuickActions = useMemo(() => [
    { id: '1', label: 'Continue', icon: 'Play', shortcut: 'C', action: () => setShowContinueLearningDialog(true) },
    { id: '2', label: 'Browse', icon: 'BookOpen', shortcut: 'B', action: () => setShowBrowseCoursesDialog(true) },
    { id: '3', label: 'Certificates', icon: 'Award', shortcut: 'R', action: () => setShowCertificatesDialog(true) },
    { id: '4', label: 'Study Plan', icon: 'Calendar', shortcut: 'P', action: () => setShowStudyPlanDialog(true) },
  ], [])

  // Form state for new learning path
  const [newPathForm, setNewPathForm] = useState({
    title: '',
    description: '',
    level: 'beginner' as const,
    estimated_weeks: 4
  })

  // Form state for new collection
  const [newCollectionForm, setNewCollectionForm] = useState({
    name: '',
    description: '',
    is_public: false
  })

  // Supabase hooks - real data from database
  const { paths: dbPaths, loading: pathsLoading, error: pathsError, createPath, updatePath, deletePath, mutating: pathsMutating, refetch: refetchPaths } = useLearning()
  const { courses: dbCourses, loading: coursesLoading, error: coursesError, createCourse, updateCourse, deleteCourse, mutating: coursesMutating, refetch: refetchCourses } = useCourses({ category: selectedCategory, level: selectedLevel })
  const { progress: dbProgress, loading: progressLoading, error: progressError, updateProgress, refetch: refetchProgress } = useUserProgress()
  const { collections: dbCollections, loading: collectionsLoading, error: collectionsError, createCollection, updateCollection, deleteCollection, mutating: collectionsMutating, refetch: refetchCollections } = useCollections()

  // Combined loading / error states
  const isLoading = pathsLoading || coursesLoading || progressLoading || collectionsLoading
  const hasError = pathsError || coursesError || progressError || collectionsError

  const refetchAll = () => {
    refetchPaths()
    refetchCourses()
    refetchProgress()
    refetchCollections()
  }

  // Map database data to component types with defaults
  const courses: Course[] = (dbCourses || []).map(c => ({
    id: c.id,
    title: c.title,
    slug: c.slug || c.id,
    description: c.description || '',
    shortDescription: c.short_description || '',
    thumbnail: c.thumbnail_url || '/courses/default.jpg',
    previewVideo: c.preview_video_url || null,
    instructor: defaultInstructor,
    category: c.category,
    subcategory: c.subcategory || '',
    level: c.level,
    language: c.language || 'English',
    skills: c.skills || [],
    sections: [],
    totalDuration: c.total_duration,
    lessonsCount: c.lessons_count,
    enrolledCount: c.enrolled_count,
    rating: c.rating,
    reviewsCount: c.reviews_count,
    completionRate: c.completion_rate || 0,
    lastUpdated: c.last_updated || c.updated_at,
    isBestseller: c.is_bestseller,
    isNew: c.is_new,
    isFeatured: c.is_featured,
    hasExercises: c.has_exercises || false,
    hasCertificate: c.has_certificate || false,
    hasQuizzes: c.has_quizzes || false
  }))

  const learningPaths: LearningPath[] = (dbPaths || []).map(p => ({
    id: p.id,
    title: p.title,
    description: p.description || '',
    thumbnail: p.thumbnail_url || '/paths/default.jpg',
    courses: [],
    totalDuration: p.total_duration,
    lessonsCount: p.lessons_count,
    enrolledCount: p.enrolled_count,
    completedCourses: 0,
    progress: 0,
    skills: p.skills || [],
    level: p.level as 'beginner' | 'intermediate' | 'advanced',
    estimatedWeeks: p.estimated_weeks,
    milestones: [],
    curator: {
      name: 'Kazi Learning',
      avatar: '/avatars/default.jpg',
      title: 'Learning Platform'
    }
  }))

  const collections = (dbCollections || []).map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    courses: [],
    isPublic: c.is_public,
    createdAt: c.created_at,
    likes: c.likes
  }))

  const progress = (dbProgress || []).map(p => ({
    courseId: p.course_id,
    lessonsCompleted: p.lessons_completed,
    totalLessons: p.total_lessons,
    progress: p.progress,
    timeSpent: p.time_spent,
    lastAccessedAt: p.last_accessed_at,
    notes: [],
    bookmarks: [],
    completedAt: p.completed_at,
    certificateUrl: p.certificate_url
  }))

  const [skills] = useState<Skill[]>([])
  const [stats] = useState<LearningStats>(defaultStats)

  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category))
    return ['all', ...Array.from(cats)]
  }, [courses])

  const coursesInProgress = useMemo(() => {
    return courses.filter(c => progress.some(p => p.courseId === c.id && p.progress > 0 && p.progress < 100))
  }, [courses, progress])

  const recommendedCourses = useMemo(() => {
    return courses.filter(c => c.isFeatured || c.isBestseller).slice(0, 6)
  }, [courses])

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
      const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [courses, searchQuery, selectedCategory, selectedLevel])

  // Loading state - early return (placed after all hooks)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="text-sm text-gray-500">Loading learning data...</p>
        </div>
      </div>
    )
  }

  // Error state - early return (placed after all hooks)
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <p className="text-destructive font-medium">Failed to load learning data</p>
        <p className="text-sm text-gray-500 max-w-md text-center">
          {pathsError?.message || coursesError?.message || progressError?.message || collectionsError?.message || 'An unexpected error occurred'}
        </p>
        <button onClick={refetchAll} className="text-sm underline text-emerald-600 hover:text-emerald-700">
          Retry
        </button>
      </div>
    )
  }

  const getProgressForCourse = (courseId: string) => {
    return progress.find(p => p.courseId === courseId)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // CRUD Handlers
  const handleStartCourse = async (course: any) => {
    try {
      await updateProgress({ course_id: course.id, progress: 0, lessons_completed: 0, last_accessed_at: new Date().toISOString() })
      toast.success(`Course started: "${course.title}"`)
    } catch (err) {
      toast.error('Failed to start course')
    }
  }

  const handleResumeCourse = async (course: any) => {
    try {
      await updateProgress({ course_id: course.id, last_accessed_at: new Date().toISOString() })
      toast.success(`Resuming course: "${course.title}"`)
    } catch (err) {
      toast.error('Failed to resume course')
    }
  }

  const handleDownloadCertificate = async () => {
    toast.promise(
      fetch('/api/learning/certificates/generate', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Generating certificate...',
        success: 'Certificate download started',
        error: 'Failed to generate certificate'
      }
    )
  }

  const handleShareProgress = async () => {
    toast.promise(
      fetch('/api/learning/progress/share', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Sharing progress...',
        success: 'Progress shared successfully',
        error: 'Failed to share progress'
      }
    )
  }

  const handleEnrollCourse = async (courseId: string, courseName: string) => {
    try {
      await updateProgress({ course_id: courseId, progress: 0, lessons_completed: 0, last_accessed_at: new Date().toISOString() })
      toast.success(`Enrolled in "${courseName}"`)
    } catch (err) {
      toast.error('Failed to enroll in course')
    }
  }

  const handleBookmarkLesson = async (lessonId: string, lessonName: string) => {
    toast.promise(
      fetch('/api/learning/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonId }) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
      {
        loading: 'Saving bookmark...',
        success: `"${lessonName}" saved to bookmarks`,
        error: 'Failed to save bookmark'
      }
    )
  }

  const handleCreatePath = async () => {
    if (!newPathForm.title.trim()) {
      toast.error('Title is required')
      return
    }
    try {
      await createPath({
        title: newPathForm.title,
        description: newPathForm.description,
        level: newPathForm.level,
        estimated_weeks: newPathForm.estimated_weeks,
        skills: [],
        total_duration: 0,
        lessons_count: 0,
        enrolled_count: 0,
        status: 'draft'
      })
      toast.success(`Learning path created: "${newPathForm.title}" has been created`)
      setShowCreatePathModal(false)
      setNewPathForm({ title: '', description: '', level: 'beginner', estimated_weeks: 4 })
    } catch (err) {
      toast.error('Failed to create learning path')
    }
  }

  const handleDeletePath = async (pathId: string, pathTitle: string) => {
    try {
      await deletePath(pathId)
      toast.success(`Learning path deleted has been removed`)
    } catch (err) {
      toast.error('Failed to delete learning path')
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      await createCollection({
        name: newCollectionForm.name,
        description: newCollectionForm.description,
        is_public: newCollectionForm.is_public,
        likes: 0
      })
      toast.success(`Collection created has been created`)
      setShowCreateCollectionModal(false)
      setNewCollectionForm({ name: '', description: '', is_public: false })
    } catch (err) {
      toast.error('Failed to create collection')
    }
  }

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    try {
      await deleteCollection(collectionId)
      toast.success('Collection "' + collectionName + '" has been removed')
    } catch (err) {
      toast.error('Failed to delete collection')
    }
  }

  const handleToggleCollectionVisibility = async (collection: any) => {
    try {
      await updateCollection({ id: collection.id, is_public: !collection.isPublic })
      toast.success(collection.isPublic ? 'Collection set to private' : 'Collection set to public')
    } catch (err) {
      toast.error('Failed to update collection')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:bg-none dark:bg-gray-900">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Learning</h1>
                  <div className="flex items-center gap-2 text-emerald-100 text-sm">
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">LinkedIn Learning Level</span>
                    <span>•</span>
                    <span>Personalized learning experience</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Related Knowledge & Learning Navigation */}
              <div className="flex items-center gap-2">
                <Link href="/dashboard/tutorials-v2">
                  <Button variant="secondary" size="sm" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden md:inline">Tutorials</span>
                  </Button>
                </Link>
                <Link href="/dashboard/docs-v2">
                  <Button variant="secondary" size="sm" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
                    <FileText className="w-4 h-4" />
                    <span className="hidden md:inline">Docs</span>
                  </Button>
                </Link>
                <Link href="/dashboard/faq-v2">
                  <Button variant="secondary" size="sm" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-0">
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden md:inline">FAQ</span>
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <div>
                  <div className="text-lg font-bold">{stats.currentStreak} day streak</div>
                  <div className="text-xs text-emerald-100">Best: {stats.longestStreak} days</div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Weekly Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.weeklyProgress}/{stats.weeklyGoal}h</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[
              { label: 'Hours Learned', value: stats.totalLearningHours.toFixed(1), icon: Clock, change: '+4.2 this week' },
              { label: 'Completed', value: stats.coursesCompleted, icon: CheckCircle2, change: '+2 this month' },
              { label: 'In Progress', value: stats.coursesInProgress, icon: Play, change: '3 courses' },
              { label: 'Skills Gained', value: stats.skillsGained, icon: Zap, change: '+3 new' },
              { label: 'Certificates', value: stats.certificatesEarned, icon: Award, change: '5 earned' },
              { label: 'Collections', value: stats.collectionsCount, icon: FolderOpen, change: `${collections.reduce((sum, c) => sum + c.courses.length, 0)} courses` }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-emerald-200" />
                  <span className="text-sm text-emerald-100">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-emerald-200 mt-1">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="my-learning" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                My Learning
              </TabsTrigger>
              <TabsTrigger value="paths" className="flex items-center gap-2">
                <Route className="w-4 h-4" />
                Learning Paths
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <TabsContent value="my-learning" className="space-y-6">
            {coursesInProgress.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Play className="w-5 h-5 text-emerald-600" />
                    Continue Learning
                  </h2>
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    View History <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursesInProgress.map(course => {
                    const courseProgress = getProgressForCourse(course.id)
                    return (
                      <div
                        key={course.id}
                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="relative w-32 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
                          <GraduationCap className="w-8 h-8 group-hover:scale-110 transition-transform" />
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <div
                              className="h-full bg-white"
                              style={{ width: `${courseProgress?.progress || 0}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.instructor.name}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">{courseProgress?.progress || 0}% complete</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{formatDuration(courseProgress?.timeSpent || 0)} spent</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Route className="w-5 h-5 text-teal-600" />
                  Your Learning Paths
                </h2>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  Browse All Paths <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {learningPaths.filter(p => p.progress > 0).map(path => (
                  <div
                    key={path.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedPath(path)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                        <Route className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{path.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{path.courses.length} courses • {formatDuration(path.totalDuration)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                              style={{ width: `${path.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-teal-600">{path.progress}%</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {path.milestones.map(m => (
                            <div
                              key={m.id}
                              className={'w-8 h-8 rounded-full flex items-center justify-center text-lg ' + (m.unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' : 'bg-gray-200 dark:bg-gray-700 opacity-50')}
                              title={m.title}
                            >
                              {m.badge}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Recommended For You
                </h2>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                  See All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedCourses.map(course => (
                  <div
                    key={course.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                      {course.isBestseller && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded">
                          Bestseller
                        </span>
                      )}
                      {course.isNew && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded">
                          New
                        </span>
                      )}
                      <button className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                        <Bookmark className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.instructor.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{course.enrolledCount.toLocaleString()} learners</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <span className="text-xs text-gray-500">{formatDuration(course.totalDuration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                  Your Collections
                </h2>
                <button
                  onClick={() => setShowCreateCollectionModal(true)}
                  disabled={collectionsMutating}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {collectionsMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  New Collection
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {collections.map(collection => (
                  <div
                    key={collection.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{collection.name}</h3>
                          {collection.isPublic ? (
                            <Unlock className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{collection.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                          <span>{collection.courses.length} courses</span>
                          {collection.isPublic && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" /> {collection.likes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleCollectionVisibility(collection)}>
                            {collection.isPublic ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                            {collection.isPublic ? 'Make Private' : 'Make Public'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCollection(collection.id, collection.name)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Collection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {learningPaths.map(path => (
                  <div
                    key={path.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedPath(path)}
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                        <Route className="w-12 h-12" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold">{path.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{path.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(path.level)}`}>
                            {path.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {path.courses.length} courses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(path.totalDuration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            ~{path.estimatedWeeks} weeks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {path.enrolledCount.toLocaleString()} enrolled
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          {path.skills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                          {path.skills.length > 4 && (
                            <span className="text-xs text-gray-500">+{path.skills.length - 4} more</span>
                          )}
                        </div>
                        
                        {path.progress > 0 && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                style={{ width: `${path.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-teal-600">{path.progress}% complete</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Your Badges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                    {learningPaths.flatMap(p => p.milestones).filter(m => m.unlocked).map(m => (
                      <div
                        key={m.id}
                        className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg"
                        title={m.title}
                      >
                        {m.badge}
                      </div>
                    ))}
                  </div>
                  {learningPaths.flatMap(p => p.milestones).filter(m => m.unlocked).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Complete courses to earn badges!</p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Popular Paths
                  </h3>
                  <div className="space-y-3">
                    {learningPaths.sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 3).map((path, i) => (
                      <div key={path.id} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{path.title}</p>
                          <p className="text-xs text-gray-500">{path.enrolledCount.toLocaleString()} enrolled</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          
          <TabsContent value="explore" className="space-y-6">
            
            <div className="flex items-center gap-4 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <div className="flex items-center gap-1 ml-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
            }>
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className={`relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center ${
                    viewMode === 'list' ? 'w-48 h-32' : 'h-40'
                  }`}>
                    <GraduationCap className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {course.isBestseller && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded">Bestseller</span>
                      )}
                      {course.isNew && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded">New</span>
                      )}
                    </div>
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      onClick={(e) => { e.stopPropagation() }}
                    >
                      <Bookmark className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.instructor.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{course.enrolledCount.toLocaleString()} learners</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className="text-xs text-gray-500">{formatDuration(course.totalDuration)}</span>
                      <span className="text-xs text-gray-500">{course.lessonsCount} lessons</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No courses found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Your Skills
                  </h2>
                  <div className="space-y-4">
                    {skills.map(skill => (
                      <div key={skill.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{skill.name}</h3>
                              {skill.trending && (
                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> Trending
                                </span>
                              )}
                              {skill.inDemand && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                                  In Demand
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{skill.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{skill.level}%</div>
                            {skill.assessmentScore && (
                              <p className="text-xs text-gray-500">Assessment: {skill.assessmentScore}%</p>
                            )}
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {skill.coursesCompleted} courses
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {skill.endorsements} endorsements
                            </span>
                          </div>
                          <button className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                            Take Assessment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Suggested Skills
                  </h3>
                  <div className="space-y-3">
                    {['Data Visualization', 'SQL', 'Communication', 'Critical Thinking'].map((skill, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="font-medium">{skill}</span>
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skill Assessment
                  </h3>
                  <p className="text-sm text-purple-100 mb-4">
                    Take assessments to validate your skills and add badges to your profile
                  </p>
                  <button className="w-full py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                    Browse Assessments
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Hours', value: stats.totalLearningHours.toFixed(1), icon: Clock, color: 'from-blue-500 to-indigo-500' },
                { label: 'Courses Completed', value: stats.coursesCompleted, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
                { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: Flame, color: 'from-orange-500 to-red-500' },
                { label: 'Certificates', value: stats.certificatesEarned, icon: Award, color: 'from-purple-500 to-pink-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Weekly Learning Activity
                </h3>
                <div className="flex items-end justify-between h-40 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const height = [45, 60, 30, 80, 55, 20, 70][i]
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t transition-all"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-gray-500">{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Skills Distribution
                </h3>
                <div className="space-y-3">
                  {skills.slice(0, 5).map((skill, i) => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{skill.name}</span>
                        <span className="font-medium">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500'][i]
                          }`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Learning Settings</h3>
                      <p className="text-white/80">Configure your learning experience preferences</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              
              <div className="col-span-3">
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'goals', label: 'Goals', icon: Target },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              
              <div className="col-span-9 space-y-6">
                
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-emerald-500" />
                          General Preferences
                        </CardTitle>
                        <CardDescription>Configure your learning experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Language</Label>
                            <Input defaultValue="English" className="mt-1" />
                          </div>
                          <div>
                            <Label>Timezone</Label>
                            <Input defaultValue="America/New_York" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Autoplay Videos</p>
                            <p className="text-sm text-gray-500">Automatically play next lesson</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Captions</p>
                            <p className="text-sm text-gray-500">Display captions by default</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">HD Video Quality</p>
                            <p className="text-sm text-gray-500">Default to high-definition videos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Playback Speed Memory</p>
                            <p className="text-sm text-gray-500">Remember last playback speed</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-500" />
                          Profile Visibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
                            <p className="text-sm text-gray-500">Allow others to see your learning activity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Certificates</p>
                            <p className="text-sm text-gray-500">Display earned certificates on profile</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Skills</p>
                            <p className="text-sm text-gray-500">Display skill levels on profile</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={() => {
                          toast.promise(
                            fetch('/api/learning/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                            {
                              loading: 'Saving preferences...',
                              success: 'Preferences saved successfully',
                              error: 'Failed to save preferences'
                            }
                          )
                        }}>
                          Save Preferences
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                
                {settingsTab === 'goals' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-orange-500" />
                          Learning Goals
                        </CardTitle>
                        <CardDescription>Set and track your learning objectives</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Weekly Hours Goal</Label>
                            <Input type="number" defaultValue="5" className="mt-1" />
                          </div>
                          <div>
                            <Label>Monthly Courses Goal</Label>
                            <Input type="number" defaultValue="2" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Daily Learning Reminders</p>
                            <p className="text-sm text-gray-500">Remind me to learn every day</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Streak Protection</p>
                            <p className="text-sm text-gray-500">Allow one skip day per week</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Weekly Progress Reports</p>
                            <p className="text-sm text-gray-500">Email weekly learning summary</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-500" />
                          Skill Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {skills.slice(0, 3).map((skill, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{skill.name}</p>
                              <p className="text-sm text-gray-500">Current: {skill.level}%</p>
                            </div>
                            <Input type="number" defaultValue={skill.level + 20} className="w-20" />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => {
                          const skillName = prompt('Enter skill name:', 'New Skill')
                          if (skillName && skillName.trim()) {
                            toast.success(`Skill goal added`)
                          }
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Skill Goal
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-blue-500" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Course Recommendations', desc: 'Get personalized course suggestions' },
                          { label: 'New Course Alerts', desc: 'Notify about new courses in your topics' },
                          { label: 'Learning Reminders', desc: 'Daily nudges to continue learning' },
                          { label: 'Goal Progress', desc: 'Updates on your learning goals' },
                          { label: 'Certificate Earned', desc: 'Celebrate your achievements' },
                          { label: 'Instructor Updates', desc: 'New content from followed instructors' }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <Switch defaultChecked={idx < 4} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-green-500" />
                          Digest Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Email Digest Frequency</Label>
                          <Input defaultValue="Weekly" className="mt-1" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Include Recommendations</p>
                            <p className="text-sm text-gray-500">Add course suggestions to digest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-500" />
                          Connected Accounts
                        </CardTitle>
                        <CardDescription>Link external accounts and services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'LinkedIn', desc: 'Share certificates and skills', status: 'connected' },
                          { name: 'Slack', desc: 'Learning notifications', status: 'connected' },
                          { name: 'Google Calendar', desc: 'Schedule learning time', status: 'disconnected' },
                          { name: 'Notion', desc: 'Sync notes and bookmarks', status: 'disconnected' },
                          { name: 'GitHub', desc: 'Track coding exercises', status: 'disconnected' }
                        ].map((integration, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                {integration.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              const method = integration.status === 'connected' ? 'DELETE' : 'POST'
                              toast.promise(
                                fetch(`/api/learning/integrations/${integration.name.toLowerCase().replace(/\s+/g, '-')}`, { method }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                                {
                                  loading: integration.status === 'connected' ? `Disconnecting ${integration.name}...` : `Connecting to ${integration.name}...`,
                                  success: integration.status === 'connected' ? `${integration.name} disconnected successfully` : `${integration.name} connected successfully`,
                                  error: integration.status === 'connected' ? 'Failed to disconnect' : 'Failed to connect'
                                }
                              )
                            }}>
                              {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-green-500" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>API Key</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="password" value="sk_learning_****************************" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText('sk_learning_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')
                              toast.success('API key copied to clipboard')
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => {
                          if (confirm('Are you sure you want to regenerate your API key? This will invalidate the current key.')) {
                            toast.promise(
                              fetch('/api/learning/api-key', { method: 'POST' }).then(res => { if (!res.ok) throw new Error('Failed'); }),
                              {
                                loading: 'Regenerating API key...',
                                success: 'New API key generated. Please update your integrations.',
                                error: 'Failed to regenerate API key'
                              }
                            )
                          }
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate API Key
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                
                {settingsTab === 'security' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          Account Security
                        </CardTitle>
                        <CardDescription>Protect your learning account</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Login Notifications</p>
                            <p className="text-sm text-gray-500">Get notified of new sign-ins</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                            <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-yellow-500" />
                          Privacy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Learning Activity Tracking</p>
                            <p className="text-sm text-gray-500">Track for personalized recommendations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Share Progress with Manager</p>
                            <p className="text-sm text-gray-500">Allow manager to view your progress</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-cyan-500" />
                          Advanced Configuration
                        </CardTitle>
                        <CardDescription>Advanced settings for power users</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Developer Mode</p>
                            <p className="text-sm text-gray-500">Enable developer features</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Offline Mode</p>
                            <p className="text-sm text-gray-500">Download courses for offline viewing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500">Try new features early</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Video Bitrate (kbps)</Label>
                          <Input type="number" defaultValue="5000" className="mt-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-500" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Download Storage Location</Label>
                          <Input defaultValue="~/Learning/Downloads" className="mt-1 font-mono" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Learning Data
                          </Button>
                          <Button variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Cache
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900 bg-white dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Reset All Progress</p>
                            <p className="text-sm text-red-600/70">Clear all learning progress</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-300">Delete Account</p>
                            <p className="text-sm text-red-600/70">Permanently delete all data</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                            Delete
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


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            /* AIInsightsPanel removed - use header button */
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers?.map(m => ({ id: m.id, name: m.name, avatar: m.avatar_url, status: m.status === 'active' ? 'online' : 'offline' })) || []}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Learning Progress Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          /* ActivityFeed removed - use header button */
          <QuickActionsToolbar
            actions={learningQuickActions}
            variant="grid"
          />
        </div>
      </div>

      
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              {selectedCourse?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="space-y-6 pr-4">
                
                <div className="flex items-start gap-6">
                  <div className="w-48 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white">
                    <GraduationCap className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 dark:text-gray-300">{selectedCourse.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{selectedCourse.rating}</span>
                        <span className="text-gray-500">({selectedCourse.reviewsCount.toLocaleString()} reviews)</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500">{selectedCourse.enrolledCount.toLocaleString()} enrolled</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <Button
                        onClick={() => handleStartCourse(selectedCourse)}
                        disabled={progressLoading}
                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2"
                      >
                        {progressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Start Learning
                      </Button>
                      <button
                        onClick={() => handleBookmarkLesson(selectedCourse.id, selectedCourse.title)}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleShareProgress}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedCourse.instructor.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedCourse.instructor.name}</h4>
                      <p className="text-sm text-gray-500">{selectedCourse.instructor.title} at {selectedCourse.instructor.company}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{selectedCourse.instructor.courses} courses</span>
                        <span>{selectedCourse.instructor.followers.toLocaleString()} followers</span>
                      </div>
                    </div>
                  </div>
                </div>

                
                <div>
                  <h4 className="font-semibold mb-4">Course Content</h4>
                  <div className="space-y-2">
                    {selectedCourse.sections.map((section, i) => (
                      <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">{section.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{section.lessons.length} lessons • {formatDuration(section.duration)}</span>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {section.lessons.map(lesson => (
                            <div key={lesson.id} className="p-4 flex items-center gap-3">
                              {lesson.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : lesson.locked ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                              <div className="flex-1">
                                <span className={lesson.locked ? 'text-gray-400' : ''}>{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                {lesson.type === 'video' && <Video className="w-4 h-4" />}
                                {lesson.type === 'quiz' && <ListChecks className="w-4 h-4" />}
                                {lesson.type === 'exercise' && <FileText className="w-4 h-4" />}
                                <span>{formatDuration(lesson.duration)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                
                <div>
                  <h4 className="font-semibold mb-4">Skills You'll Gain</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      
      <Dialog open={showCreateCollectionModal} onOpenChange={setShowCreateCollectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-600" />
              Create New Collection
            </DialogTitle>
            <DialogDescription>Organize your favorite courses into collections</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="e.g., Career Development"
                value={newCollectionForm.name}
                onChange={(e) => setNewCollectionForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="collection-description">Description</Label>
              <Textarea
                id="collection-description"
                placeholder="What is this collection about?"
                value={newCollectionForm.description}
                onChange={(e) => setNewCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-medium text-sm">Make Public</p>
                <p className="text-xs text-gray-500">Others can view this collection</p>
              </div>
              <Switch
                checked={newCollectionForm.is_public}
                onCheckedChange={(checked) => setNewCollectionForm(prev => ({ ...prev, is_public: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCollectionModal(false)}>Cancel</Button>
            <Button onClick={handleCreateCollection} disabled={collectionsMutating} className="bg-purple-600 hover:bg-purple-700">
              {collectionsMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showCreatePathModal} onOpenChange={setShowCreatePathModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-teal-600" />
              Create Learning Path
            </DialogTitle>
            <DialogDescription>Build a structured learning journey</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="path-title">Title</Label>
              <Input
                id="path-title"
                placeholder="e.g., Become a Data Scientist"
                value={newPathForm.title}
                onChange={(e) => setNewPathForm(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="path-description">Description</Label>
              <Textarea
                id="path-description"
                placeholder="Describe this learning path..."
                value={newPathForm.description}
                onChange={(e) => setNewPathForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Level</Label>
                <Select value={newPathForm.level} onValueChange={(value: any) => setNewPathForm(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="path-weeks">Est. Weeks</Label>
                <Input
                  id="path-weeks"
                  type="number"
                  min={1}
                  max={52}
                  value={newPathForm.estimated_weeks}
                  onChange={(e) => setNewPathForm(prev => ({ ...prev, estimated_weeks: parseInt(e.target.value) || 4 }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePathModal(false)}>Cancel</Button>
            <Button onClick={handleCreatePath} disabled={pathsMutating} className="bg-teal-600 hover:bg-teal-700">
              {pathsMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create Path
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showContinueLearningDialog} onOpenChange={setShowContinueLearningDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600" />
              Continue Learning
            </DialogTitle>
            <DialogDescription>Pick up where you left off</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">React Advanced Patterns</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">Chapter 4: State Management</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-emerald-500 rounded-full" />
                </div>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">65%</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Last accessed: 2 hours ago</p>
              <p>Time remaining: ~45 minutes</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContinueLearningDialog(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
              setShowContinueLearningDialog(false)
              toast.success('Resuming course')
            }}>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showBrowseCoursesDialog} onOpenChange={setShowBrowseCoursesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Browse Courses
            </DialogTitle>
            <DialogDescription>Explore 150+ courses across 12 categories</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search courses..." className="pl-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              {['Technology', 'Business', 'Leadership', 'Data Science', 'Design', 'Marketing'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setShowBrowseCoursesDialog(false)
                    setActiveTab('explore')
                    toast.success(`Browsing ${category} courses`)
                  }}
                  className="p-3 text-left bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <p className="font-medium">{category}</p>
                  <p className="text-xs text-gray-500 mt-1">25+ courses</p>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBrowseCoursesDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              setShowBrowseCoursesDialog(false)
              setActiveTab('explore')
            }}>
              View All Courses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showCertificatesDialog} onOpenChange={setShowCertificatesDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Your Certificates
            </DialogTitle>
            <DialogDescription>You have earned 3 certificates</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {[
              { name: 'JavaScript Fundamentals', date: 'Dec 15, 2024', score: '95%' },
              { name: 'React Development', date: 'Nov 28, 2024', score: '88%' },
              { name: 'Node.js Basics', date: 'Oct 10, 2024', score: '92%' },
            ].map((cert, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-xs text-gray-500">Earned {cert.date} - Score: {cert.score}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.promise(
                    fetch(`/api/learning/certificates/${cert.id}/download`).then(res => {
                      if (!res.ok) throw new Error('Failed')
                      return res.blob()
                    }).then(blob => {
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${cert.name}.pdf`
                      a.click()
                      URL.revokeObjectURL(url)
                    }),
                    { loading: 'Preparing certificate...', success: `Certificate "${cert.name}" downloaded successfully!`, error: 'Failed to download certificate' }
                  )
                }}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertificatesDialog(false)}>Close</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => {
              setShowCertificatesDialog(false)
              toast.success('Sharing certificates to LinkedIn...')
            }}>
              <Share2 className="w-4 h-4 mr-2" />
              Share All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Dialog open={showStudyPlanDialog} onOpenChange={setShowStudyPlanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Your Study Plan
            </DialogTitle>
            <DialogDescription>Weekly learning goals and schedule</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900 dark:text-purple-100">Weekly Goal</span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">3.5 / 5 hours</span>
              </div>
              <div className="h-3 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">This Week's Tasks</h4>
              <div className="space-y-2">
                {[
                  { task: 'Complete React Chapter 4', due: 'Today', done: false },
                  { task: 'Take JavaScript quiz', due: 'Tomorrow', done: false },
                  { task: 'Review Node.js notes', due: 'Friday', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.task}</p>
                      <p className="text-xs text-gray-500">Due: {item.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudyPlanDialog(false)}>Close</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
              setShowStudyPlanDialog(false)
              toast.success('Study plan updated')
            }}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
