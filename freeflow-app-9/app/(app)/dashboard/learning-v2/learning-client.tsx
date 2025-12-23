'use client'

import { useState, useMemo } from 'react'
import {
  GraduationCap,
  BookOpen,
  Plus,
  Video,
  TrendingUp,
  Settings,
  Eye,
  Star,
  Clock,
  Users,
  Award,
  X,
  Loader2,
  Trash2,
  Play,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Circle,
  Target,
  Bookmark,
  BookmarkCheck,
  Flame,
  Calendar,
  BarChart3,
  Zap,
  Brain,
  Lightbulb,
  Route,
  Trophy,
  Medal,
  FileText,
  Download,
  Share2,
  Heart,
  ThumbsUp,
  MessageSquare,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  FolderOpen,
  ListChecks,
  PieChart,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Grid3X3,
  List
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

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
// MOCK DATA
// ============================================================================

const mockInstructors: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    title: 'Senior Engineering Manager',
    company: 'Tech Corp',
    expertise: ['Leadership', 'Project Management', 'Agile'],
    courses: 28,
    followers: 125000,
    rating: 4.9
  },
  {
    id: 'inst-2',
    name: 'Michael Park',
    avatar: '/avatars/michael.jpg',
    title: 'Data Science Lead',
    company: 'DataFlow Inc',
    expertise: ['Python', 'Machine Learning', 'Data Analysis'],
    courses: 15,
    followers: 89000,
    rating: 4.8
  }
]

const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Leadership Foundations: Building High-Performance Teams',
    slug: 'leadership-foundations',
    description: 'Master the essential skills needed to lead teams effectively in modern workplaces. Learn how to motivate, communicate, and drive results.',
    shortDescription: 'Essential leadership skills for modern managers',
    thumbnail: '/courses/leadership.jpg',
    previewVideo: '/videos/leadership-preview.mp4',
    instructor: mockInstructors[0],
    category: 'Business',
    subcategory: 'Leadership',
    level: 'intermediate',
    language: 'English',
    skills: ['Team Leadership', 'Communication', 'Conflict Resolution', 'Strategic Thinking'],
    sections: [
      {
        id: 'sec-1',
        title: 'Introduction to Leadership',
        duration: 45,
        lessons: [
          { id: 'les-1', title: 'What Makes a Great Leader?', duration: 8, type: 'video', completed: true, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-2', title: 'Leadership Styles Overview', duration: 12, type: 'video', completed: true, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-3', title: 'Quiz: Leadership Fundamentals', duration: 10, type: 'quiz', completed: false, locked: false, hasTranscript: false, hasDownload: false },
          { id: 'les-4', title: 'Self-Assessment Exercise', duration: 15, type: 'exercise', completed: false, locked: false, hasTranscript: false, hasDownload: true }
        ]
      },
      {
        id: 'sec-2',
        title: 'Building Trust and Communication',
        duration: 60,
        lessons: [
          { id: 'les-5', title: 'The Trust Equation', duration: 10, type: 'video', completed: false, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-6', title: 'Active Listening Techniques', duration: 15, type: 'video', completed: false, locked: true, hasTranscript: true, hasDownload: true },
          { id: 'les-7', title: 'Giving Effective Feedback', duration: 20, type: 'video', completed: false, locked: true, hasTranscript: true, hasDownload: true },
          { id: 'les-8', title: 'Practice: Feedback Role-Play', duration: 15, type: 'exercise', completed: false, locked: true, hasTranscript: false, hasDownload: false }
        ]
      }
    ],
    totalDuration: 240,
    lessonsCount: 28,
    enrolledCount: 45230,
    rating: 4.8,
    reviewsCount: 3420,
    completionRate: 78,
    lastUpdated: '2024-12-15',
    isBestseller: true,
    isNew: false,
    isFeatured: true,
    hasExercises: true,
    hasCertificate: true,
    hasQuizzes: true
  },
  {
    id: 'course-2',
    title: 'Python for Data Science: Complete Bootcamp',
    slug: 'python-data-science',
    description: 'Learn Python programming from scratch and apply it to real-world data science projects. Covers pandas, numpy, matplotlib, and machine learning basics.',
    shortDescription: 'From Python basics to data science mastery',
    thumbnail: '/courses/python-ds.jpg',
    previewVideo: '/videos/python-preview.mp4',
    instructor: mockInstructors[1],
    category: 'Technology',
    subcategory: 'Data Science',
    level: 'beginner',
    language: 'English',
    skills: ['Python', 'Data Analysis', 'Pandas', 'NumPy', 'Matplotlib'],
    sections: [
      {
        id: 'sec-3',
        title: 'Python Fundamentals',
        duration: 90,
        lessons: [
          { id: 'les-9', title: 'Setting Up Your Environment', duration: 10, type: 'video', completed: true, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-10', title: 'Variables and Data Types', duration: 15, type: 'video', completed: true, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-11', title: 'Control Flow Statements', duration: 20, type: 'video', completed: true, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-12', title: 'Functions and Modules', duration: 25, type: 'video', completed: false, locked: false, hasTranscript: true, hasDownload: true },
          { id: 'les-13', title: 'Coding Challenge', duration: 20, type: 'exercise', completed: false, locked: false, hasTranscript: false, hasDownload: true }
        ]
      }
    ],
    totalDuration: 480,
    lessonsCount: 52,
    enrolledCount: 89450,
    rating: 4.9,
    reviewsCount: 8920,
    completionRate: 65,
    lastUpdated: '2024-12-20',
    isBestseller: true,
    isNew: true,
    isFeatured: true,
    hasExercises: true,
    hasCertificate: true,
    hasQuizzes: true
  },
  {
    id: 'course-3',
    title: 'Agile Project Management Professional',
    slug: 'agile-pm-professional',
    description: 'Master Agile methodologies including Scrum, Kanban, and SAFe. Prepare for professional certification.',
    shortDescription: 'Complete Agile and Scrum mastery course',
    thumbnail: '/courses/agile.jpg',
    previewVideo: null,
    instructor: mockInstructors[0],
    category: 'Business',
    subcategory: 'Project Management',
    level: 'intermediate',
    language: 'English',
    skills: ['Agile', 'Scrum', 'Kanban', 'SAFe', 'Sprint Planning'],
    sections: [],
    totalDuration: 360,
    lessonsCount: 42,
    enrolledCount: 34560,
    rating: 4.7,
    reviewsCount: 2890,
    completionRate: 72,
    lastUpdated: '2024-11-30',
    isBestseller: false,
    isNew: false,
    isFeatured: false,
    hasExercises: true,
    hasCertificate: true,
    hasQuizzes: true
  }
]

const mockLearningPaths: LearningPath[] = [
  {
    id: 'path-1',
    title: 'Become a Data Scientist',
    description: 'Master the skills needed to start your data science career. From Python basics to machine learning.',
    thumbnail: '/paths/data-scientist.jpg',
    courses: mockCourses,
    totalDuration: 1080,
    lessonsCount: 122,
    enrolledCount: 28450,
    completedCourses: 1,
    progress: 35,
    skills: ['Python', 'Data Analysis', 'Machine Learning', 'SQL', 'Statistics'],
    level: 'beginner',
    estimatedWeeks: 12,
    milestones: [
      { id: 'm-1', title: 'Python Proficient', coursesRequired: 1, unlocked: true, badge: '🐍' },
      { id: 'm-2', title: 'Data Explorer', coursesRequired: 2, unlocked: false, badge: '📊' },
      { id: 'm-3', title: 'ML Practitioner', coursesRequired: 3, unlocked: false, badge: '🤖' },
      { id: 'm-4', title: 'Data Scientist', coursesRequired: 4, unlocked: false, badge: '🎓' }
    ],
    curator: { name: 'LinkedIn Learning Team', avatar: '/avatars/linkedin.jpg', title: 'Content Team' }
  },
  {
    id: 'path-2',
    title: 'Engineering Manager Path',
    description: 'Transition from individual contributor to engineering manager with confidence.',
    thumbnail: '/paths/eng-manager.jpg',
    courses: [mockCourses[0], mockCourses[2]],
    totalDuration: 600,
    lessonsCount: 70,
    enrolledCount: 15230,
    completedCourses: 0,
    progress: 0,
    skills: ['Leadership', 'Team Management', 'Technical Strategy', 'Hiring'],
    level: 'intermediate',
    estimatedWeeks: 8,
    milestones: [
      { id: 'm-5', title: 'Team Lead', coursesRequired: 1, unlocked: false, badge: '👥' },
      { id: 'm-6', title: 'Manager Ready', coursesRequired: 2, unlocked: false, badge: '🚀' }
    ],
    curator: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', title: 'Senior Engineering Manager' }
  }
]

const mockSkills: Skill[] = [
  { id: 'skill-1', name: 'Python', category: 'Programming', level: 75, assessmentScore: 82, endorsements: 23, coursesCompleted: 3, lastPracticed: '2024-12-22', trending: true, inDemand: true },
  { id: 'skill-2', name: 'Leadership', category: 'Business', level: 60, assessmentScore: null, endorsements: 15, coursesCompleted: 2, lastPracticed: '2024-12-20', trending: false, inDemand: true },
  { id: 'skill-3', name: 'Data Analysis', category: 'Data', level: 45, assessmentScore: 68, endorsements: 8, coursesCompleted: 1, lastPracticed: '2024-12-18', trending: true, inDemand: true },
  { id: 'skill-4', name: 'Project Management', category: 'Business', level: 55, assessmentScore: 72, endorsements: 12, coursesCompleted: 2, lastPracticed: '2024-12-15', trending: false, inDemand: false },
  { id: 'skill-5', name: 'Machine Learning', category: 'AI', level: 30, assessmentScore: null, endorsements: 5, coursesCompleted: 1, lastPracticed: '2024-12-10', trending: true, inDemand: true }
]

const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'Career Development Essentials',
    description: 'Courses to advance your career',
    courses: mockCourses.slice(0, 2),
    isPublic: true,
    createdAt: '2024-12-01',
    likes: 45
  },
  {
    id: 'col-2',
    name: 'Technical Skills 2025',
    description: 'Must-have tech skills for the new year',
    courses: mockCourses,
    isPublic: false,
    createdAt: '2024-12-15',
    likes: 0
  }
]

const mockStats: LearningStats = {
  totalLearningHours: 47.5,
  coursesCompleted: 8,
  coursesInProgress: 3,
  skillsGained: 12,
  certificatesEarned: 5,
  currentStreak: 7,
  longestStreak: 21,
  weeklyGoal: 5,
  weeklyProgress: 3.5,
  averageRating: 4.8,
  totalNotes: 34,
  collectionsCount: 2
}

const mockProgress: UserProgress[] = [
  {
    courseId: 'course-1',
    lessonsCompleted: 4,
    totalLessons: 28,
    progress: 14,
    timeSpent: 45,
    lastAccessedAt: '2024-12-22T14:30:00Z',
    notes: [{ lessonId: 'les-1', content: 'Key insight: Leaders serve their teams', timestamp: 120 }],
    bookmarks: [{ lessonId: 'les-2', timestamp: 340 }],
    completedAt: null,
    certificateUrl: null
  },
  {
    courseId: 'course-2',
    lessonsCompleted: 5,
    totalLessons: 52,
    progress: 10,
    timeSpent: 85,
    lastAccessedAt: '2024-12-23T09:15:00Z',
    notes: [],
    bookmarks: [],
    completedAt: null,
    certificateUrl: null
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function LearningClient() {
  const [activeTab, setActiveTab] = useState('my-learning')
  const [courses] = useState<Course[]>(mockCourses)
  const [learningPaths] = useState<LearningPath[]>(mockLearningPaths)
  const [skills] = useState<Skill[]>(mockSkills)
  const [collections] = useState<Collection[]>(mockCollections)
  const [stats] = useState<LearningStats>(mockStats)
  const [progress] = useState<UserProgress[]>(mockProgress)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
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
              {/* Streak Badge */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <div>
                  <div className="text-lg font-bold">{stats.currentStreak} day streak</div>
                  <div className="text-xs text-emerald-100">Best: {stats.longestStreak} days</div>
                </div>
              </div>
              {/* Weekly Goal */}
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

          {/* Quick Stats */}
          <div className="grid grid-cols-6 gap-4">
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

      {/* Main Content */}
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

          {/* My Learning Tab */}
          <TabsContent value="my-learning" className="space-y-6">
            {/* Continue Learning */}
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

            {/* Learning Paths Progress */}
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
                        {/* Milestones */}
                        <div className="flex items-center gap-2 mt-3">
                          {path.milestones.map(m => (
                            <div
                              key={m.id}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                                m.unlocked
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                                  : 'bg-gray-200 dark:bg-gray-700 opacity-50'
                              }`}
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

            {/* Recommended For You */}
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

            {/* Collections */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                  Your Collections
                </h2>
                <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
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
                      <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Paths List */}
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
                        {/* Skills */}
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
                        {/* Progress if enrolled */}
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

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Your Badges
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
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

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-6">
            {/* Filters */}
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

            {/* Course Grid */}
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

          {/* Skills Tab */}
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

          {/* Analytics Tab */}
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
        </Tabs>
      </div>

      {/* Course Detail Dialog */}
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
                {/* Course Header */}
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
                      <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Start Learning
                      </button>
                      <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                      <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
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

                {/* Course Content */}
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

                {/* Skills */}
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
    </div>
  )
}
