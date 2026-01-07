'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTutorials, Tutorial, TutorialStats } from '@/lib/hooks/use-tutorials'
import { Search, Play, BookOpen, Clock, Users, Star, Award, CheckCircle, Lock, FileText, Video, Code, Bookmark, ChevronRight, Trophy, Target, TrendingUp, BarChart3, GraduationCap, Zap, Filter, Grid3X3, List, Heart, Download, Plus, Circle, Check, Settings, Bell, CreditCard, Shield, Palette, Globe, Flame, Medal, Sparkles, Mail, Smartphone, MoreHorizontal, Trash2, RefreshCw } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { CardDescription } from '@/components/ui/card'
import { Webhook, HardDrive, AlertOctagon, Key, Sliders } from 'lucide-react'

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

// Pluralsight/Udemy Level Types
interface Course {
  id: string
  title: string
  slug: string
  description: string
  longDescription: string
  thumbnail: string
  instructor: Instructor
  level: CourseLevel
  category: CourseCategory
  subcategory: string
  language: string
  status: 'published' | 'draft' | 'coming-soon'
  price: number
  discountPrice?: number
  duration: Duration
  chapters: Chapter[]
  skills: string[]
  prerequisites: string[]
  whatYouLearn: string[]
  requirements: string[]
  targetAudience: string[]
  certificate: boolean
  metrics: CourseMetrics
  tags: string[]
  lastUpdated: string
  createdAt: string
}

interface Instructor {
  id: string
  name: string
  avatar: string
  title: string
  bio: string
  rating: number
  studentsCount: number
  coursesCount: number
  verified: boolean
}

interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
  duration: number
  order: number
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'exercise' | 'project'
  duration: number
  isPreview: boolean
  isCompleted?: boolean
  resources?: Resource[]
}

interface Resource {
  id: string
  name: string
  type: 'pdf' | 'code' | 'link' | 'file'
  url: string
}

interface Duration {
  hours: number
  minutes: number
  totalMinutes: number
}

interface CourseMetrics {
  enrollments: number
  completions: number
  rating: number
  reviewsCount: number
  watchTime: number
  completionRate: number
}

interface LearningPath {
  id: string
  title: string
  description: string
  courses: string[]
  duration: Duration
  level: CourseLevel
  skills: string[]
  enrollments: number
}

interface UserProgress {
  courseId: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
  lastAccessed: string
  bookmarked: boolean
  notes: Note[]
}

interface Note {
  id: string
  lessonId: string
  content: string
  timestamp: number
  createdAt: string
}

interface Review {
  id: string
  courseId: string
  user: { name: string; avatar: string }
  rating: number
  title: string
  content: string
  helpful: number
  date: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  unlockedAt?: string
  category: 'learning' | 'social' | 'streak' | 'milestone'
  points: number
}

interface Subscription {
  id: string
  name: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  isCurrent: boolean
  coursesIncluded: number | 'unlimited'
}

interface LearningGoal {
  id: string
  name: string
  targetHours: number
  completedHours: number
  deadline: string
  status: 'on_track' | 'behind' | 'completed'
}

interface LearningNotification {
  id: string
  type: 'course_update' | 'reminder' | 'achievement' | 'promotion' | 'instructor'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all-levels'
type CourseCategory = 'development' | 'design' | 'business' | 'marketing' | 'data-science' | 'productivity' | 'it-security'

interface TutorialsClientProps {
  initialTutorials: Tutorial[]
  initialStats: TutorialStats
}

// Mock Data - Pluralsight Level
const mockInstructors: Instructor[] = [
  { id: 'i-1', name: 'Sarah Chen', avatar: 'SC', title: 'Senior Software Engineer', bio: '10+ years in web development', rating: 4.9, studentsCount: 125000, coursesCount: 15, verified: true },
  { id: 'i-2', name: 'Marcus Johnson', avatar: 'MJ', title: 'UX Design Lead', bio: 'Former Google designer', rating: 4.8, studentsCount: 89000, coursesCount: 8, verified: true },
  { id: 'i-3', name: 'Alex Rivera', avatar: 'AR', title: 'Data Scientist', bio: 'PhD in Machine Learning', rating: 4.7, studentsCount: 67000, coursesCount: 12, verified: true },
]

const mockCourses: Course[] = [
  {
    id: 'c-1',
    title: 'Complete React Developer Course 2024',
    slug: 'complete-react-developer-2024',
    description: 'Master React 18, Redux, Hooks, and modern web development from scratch to deployment.',
    longDescription: 'This comprehensive course takes you from React beginner to advanced developer. Learn component patterns, state management, testing, and real-world projects.',
    thumbnail: '',
    instructor: mockInstructors[0],
    level: 'all-levels',
    category: 'development',
    subcategory: 'Web Development',
    language: 'English',
    status: 'published',
    price: 99.99,
    discountPrice: 14.99,
    duration: { hours: 42, minutes: 30, totalMinutes: 2550 },
    chapters: [
      {
        id: 'ch-1', title: 'Getting Started with React', order: 1, duration: 120,
        lessons: [
          { id: 'l-1', title: 'Course Introduction', type: 'video', duration: 5, isPreview: true },
          { id: 'l-2', title: 'Setting Up Your Environment', type: 'video', duration: 15, isPreview: true },
          { id: 'l-3', title: 'Your First React Component', type: 'video', duration: 20, isPreview: false },
          { id: 'l-4', title: 'Understanding JSX', type: 'video', duration: 18, isPreview: false },
          { id: 'l-5', title: 'Chapter Quiz', type: 'quiz', duration: 10, isPreview: false },
        ]
      },
      {
        id: 'ch-2', title: 'React Fundamentals', order: 2, duration: 180,
        lessons: [
          { id: 'l-6', title: 'Props and State', type: 'video', duration: 25, isPreview: false },
          { id: 'l-7', title: 'Event Handling', type: 'video', duration: 20, isPreview: false },
          { id: 'l-8', title: 'Conditional Rendering', type: 'video', duration: 15, isPreview: false },
          { id: 'l-9', title: 'Lists and Keys', type: 'video', duration: 18, isPreview: false },
          { id: 'l-10', title: 'Hands-on Exercise', type: 'exercise', duration: 30, isPreview: false },
        ]
      },
      {
        id: 'ch-3', title: 'React Hooks Deep Dive', order: 3, duration: 240,
        lessons: [
          { id: 'l-11', title: 'useState Hook', type: 'video', duration: 25, isPreview: false },
          { id: 'l-12', title: 'useEffect Hook', type: 'video', duration: 30, isPreview: false },
          { id: 'l-13', title: 'Custom Hooks', type: 'video', duration: 35, isPreview: false },
          { id: 'l-14', title: 'useContext and useReducer', type: 'video', duration: 40, isPreview: false },
          { id: 'l-15', title: 'Build a Custom Hook Project', type: 'project', duration: 60, isPreview: false },
        ]
      },
    ],
    skills: ['React', 'JavaScript', 'Redux', 'TypeScript', 'Testing'],
    prerequisites: ['Basic HTML/CSS', 'JavaScript fundamentals'],
    whatYouLearn: [
      'Build powerful, fast, user-friendly and reactive web apps',
      'Apply for high-paid React developer positions',
      'Understand React Hooks and modern patterns',
      'Build real-world projects from scratch'
    ],
    requirements: ['A computer with internet access', 'No prior React knowledge needed'],
    targetAudience: ['Developers wanting to learn React', 'Bootcamp graduates', 'Anyone interested in web development'],
    certificate: true,
    metrics: { enrollments: 156000, completions: 89000, rating: 4.8, reviewsCount: 12500, watchTime: 2500000, completionRate: 57 },
    tags: ['react', 'javascript', 'web development', 'frontend'],
    lastUpdated: '2024-01-20',
    createdAt: '2023-06-15'
  },
  {
    id: 'c-2',
    title: 'UX/UI Design Masterclass',
    slug: 'ux-ui-design-masterclass',
    description: 'Learn professional UX/UI design from research to high-fidelity prototypes in Figma.',
    longDescription: 'Complete UX/UI design course covering user research, wireframing, prototyping, and design systems.',
    thumbnail: '',
    instructor: mockInstructors[1],
    level: 'beginner',
    category: 'design',
    subcategory: 'UX Design',
    language: 'English',
    status: 'published',
    price: 89.99,
    discountPrice: 12.99,
    duration: { hours: 28, minutes: 45, totalMinutes: 1725 },
    chapters: [
      {
        id: 'ch-4', title: 'Introduction to UX Design', order: 1, duration: 90,
        lessons: [
          { id: 'l-16', title: 'What is UX Design?', type: 'video', duration: 12, isPreview: true },
          { id: 'l-17', title: 'UX vs UI', type: 'video', duration: 10, isPreview: true },
          { id: 'l-18', title: 'Design Thinking Process', type: 'video', duration: 25, isPreview: false },
        ]
      },
      {
        id: 'ch-5', title: 'User Research', order: 2, duration: 150,
        lessons: [
          { id: 'l-19', title: 'Research Methods', type: 'video', duration: 30, isPreview: false },
          { id: 'l-20', title: 'User Interviews', type: 'video', duration: 25, isPreview: false },
          { id: 'l-21', title: 'Creating Personas', type: 'video', duration: 20, isPreview: false },
        ]
      },
    ],
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    prerequisites: ['No experience required'],
    whatYouLearn: ['Create professional UI designs', 'Conduct user research', 'Build interactive prototypes'],
    requirements: ['Computer with Figma installed'],
    targetAudience: ['Aspiring UX designers', 'Developers wanting to learn design'],
    certificate: true,
    metrics: { enrollments: 89000, completions: 52000, rating: 4.7, reviewsCount: 7800, watchTime: 1200000, completionRate: 58 },
    tags: ['ux', 'ui', 'design', 'figma'],
    lastUpdated: '2024-01-18',
    createdAt: '2023-08-20'
  },
  {
    id: 'c-3',
    title: 'Python for Data Science & Machine Learning',
    slug: 'python-data-science-ml',
    description: 'Complete data science bootcamp covering Python, Pandas, NumPy, Matplotlib, and Scikit-Learn.',
    longDescription: 'Learn data science and machine learning with Python. Cover data analysis, visualization, and predictive modeling.',
    thumbnail: '',
    instructor: mockInstructors[2],
    level: 'intermediate',
    category: 'data-science',
    subcategory: 'Machine Learning',
    language: 'English',
    status: 'published',
    price: 129.99,
    discountPrice: 16.99,
    duration: { hours: 56, minutes: 0, totalMinutes: 3360 },
    chapters: [
      {
        id: 'ch-6', title: 'Python Fundamentals', order: 1, duration: 180,
        lessons: [
          { id: 'l-22', title: 'Python Setup', type: 'video', duration: 10, isPreview: true },
          { id: 'l-23', title: 'Data Types', type: 'video', duration: 25, isPreview: false },
          { id: 'l-24', title: 'Functions', type: 'video', duration: 30, isPreview: false },
        ]
      },
    ],
    skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Data Visualization'],
    prerequisites: ['Basic programming knowledge'],
    whatYouLearn: ['Analyze data with Python', 'Build ML models', 'Create visualizations'],
    requirements: ['Computer with Python installed'],
    targetAudience: ['Data analysts', 'Developers', 'Students'],
    certificate: true,
    metrics: { enrollments: 234000, completions: 145000, rating: 4.9, reviewsCount: 18500, watchTime: 4500000, completionRate: 62 },
    tags: ['python', 'data science', 'machine learning', 'ai'],
    lastUpdated: '2024-01-22',
    createdAt: '2023-03-10'
  }
]

const mockLearningPaths: LearningPath[] = [
  { id: 'lp-1', title: 'Full-Stack Web Developer', description: 'Master frontend and backend development', courses: ['c-1', 'c-2'], duration: { hours: 120, minutes: 0, totalMinutes: 7200 }, level: 'beginner', skills: ['React', 'Node.js', 'Database', 'APIs'], enrollments: 45000 },
  { id: 'lp-2', title: 'Data Science Career Path', description: 'Become a professional data scientist', courses: ['c-3'], duration: { hours: 80, minutes: 0, totalMinutes: 4800 }, level: 'intermediate', skills: ['Python', 'ML', 'Statistics'], enrollments: 32000 },
]

const mockProgress: UserProgress[] = [
  { courseId: 'c-1', progress: 45, lessonsCompleted: 7, totalLessons: 15, lastAccessed: '2024-01-22', bookmarked: true, notes: [] },
  { courseId: 'c-2', progress: 12, lessonsCompleted: 2, totalLessons: 6, lastAccessed: '2024-01-20', bookmarked: false, notes: [] },
]

const mockReviews: Review[] = [
  { id: 'r-1', courseId: 'c-1', user: { name: 'John D.', avatar: 'JD' }, rating: 5, title: 'Best React course ever!', content: 'This course completely changed my career. The instructor explains complex concepts in simple terms.', helpful: 234, date: '2024-01-15' },
  { id: 'r-2', courseId: 'c-1', user: { name: 'Emily S.', avatar: 'ES' }, rating: 5, title: 'Comprehensive and practical', content: 'Loved the hands-on projects. I built 5 real apps during this course!', helpful: 189, date: '2024-01-12' },
]

const mockAchievements: Achievement[] = [
  { id: 'a-1', name: 'Fast Learner', description: 'Complete 5 courses in a month', icon: 'zap', progress: 3, maxProgress: 5, category: 'learning', points: 500 },
  { id: 'a-2', name: 'First Steps', description: 'Enroll in your first course', icon: 'trophy', progress: 1, maxProgress: 1, unlockedAt: '2024-01-10', category: 'milestone', points: 100 },
  { id: 'a-3', name: 'Study Streak', description: 'Learn for 7 days in a row', icon: 'flame', progress: 5, maxProgress: 7, category: 'streak', points: 250 },
  { id: 'a-4', name: 'Knowledge Sharer', description: 'Leave 10 helpful reviews', icon: 'heart', progress: 4, maxProgress: 10, category: 'social', points: 300 },
  { id: 'a-5', name: 'Course Completionist', description: 'Complete your first course', icon: 'award', progress: 1, maxProgress: 1, unlockedAt: '2024-01-15', category: 'milestone', points: 200 },
  { id: 'a-6', name: 'Deep Dive', description: 'Watch 100 hours of content', icon: 'clock', progress: 68, maxProgress: 100, category: 'learning', points: 1000 },
]

const mockSubscriptions: Subscription[] = [
  { id: 'sub-1', name: 'Free', price: 0, interval: 'monthly', features: ['Access to free courses', 'Community forums', 'Basic certificates'], isCurrent: false, coursesIncluded: 10 },
  { id: 'sub-2', name: 'Pro', price: 29.99, interval: 'monthly', features: ['Unlimited course access', 'Offline downloads', 'Priority support', 'Premium certificates', 'Exercise files'], isCurrent: true, coursesIncluded: 'unlimited' },
  { id: 'sub-3', name: 'Team', price: 49.99, interval: 'monthly', features: ['Everything in Pro', 'Team analytics', 'Admin dashboard', 'Custom learning paths', 'SSO integration'], isCurrent: false, coursesIncluded: 'unlimited' },
]

const mockGoals: LearningGoal[] = [
  { id: 'g-1', name: 'Complete React Course', targetHours: 42, completedHours: 18, deadline: '2024-02-28', status: 'on_track' },
  { id: 'g-2', name: 'Learn Python Basics', targetHours: 20, completedHours: 5, deadline: '2024-03-15', status: 'behind' },
  { id: 'g-3', name: 'UX Design Certification', targetHours: 28, completedHours: 28, deadline: '2024-01-20', status: 'completed' },
]

const mockNotifications: LearningNotification[] = [
  { id: 'n-1', type: 'course_update', title: 'New Content Available', message: 'React Developer Course has 3 new lessons!', isRead: false, createdAt: '2024-01-22T10:00:00Z' },
  { id: 'n-2', type: 'achievement', title: 'Achievement Unlocked!', message: 'You earned the "First Steps" badge!', isRead: true, createdAt: '2024-01-20T15:30:00Z' },
  { id: 'n-3', type: 'reminder', title: 'Learning Reminder', message: 'You haven\'t learned today. Keep your streak!', isRead: false, createdAt: '2024-01-22T09:00:00Z' },
  { id: 'n-4', type: 'promotion', title: 'Flash Sale!', message: 'All courses 85% off for the next 24 hours', isRead: false, createdAt: '2024-01-21T12:00:00Z' },
]

const categories: { id: CourseCategory; name: string; icon: React.ReactNode; count: number }[] = [
  { id: 'development', name: 'Development', icon: <Code className="w-4 h-4" />, count: 156 },
  { id: 'design', name: 'Design', icon: <BookOpen className="w-4 h-4" />, count: 89 },
  { id: 'business', name: 'Business', icon: <TrendingUp className="w-4 h-4" />, count: 124 },
  { id: 'data-science', name: 'Data Science', icon: <BarChart3 className="w-4 h-4" />, count: 78 },
  { id: 'marketing', name: 'Marketing', icon: <Target className="w-4 h-4" />, count: 67 },
  { id: 'it-security', name: 'IT & Security', icon: <Zap className="w-4 h-4" />, count: 45 },
]

// Competitive Upgrade Mock Data - Pluralsight/Udemy Level Learning Intelligence
const mockTutorialsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Course Completion', description: 'React Masterclass has 92% completion rate—top performing course!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
  { id: '2', type: 'warning' as const, title: 'Drop-off Alert', description: 'Module 4 of TypeScript course has 40% abandonment rate.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Retention' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Adding quizzes to video tutorials increases retention by 35%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockTutorialsCollaborators = [
  { id: '1', name: 'Lead Instructor', avatar: '/avatars/instructor.jpg', status: 'online' as const, role: 'Instructor' },
  { id: '2', name: 'Content Creator', avatar: '/avatars/creator.jpg', status: 'online' as const, role: 'Creator' },
  { id: '3', name: 'Learning Designer', avatar: '/avatars/designer.jpg', status: 'away' as const, role: 'Designer' },
]

const mockTutorialsPredictions = [
  { id: '1', title: 'Enrollment Forecast', prediction: 'AI/ML courses expected to see 60% enrollment increase Q1', confidence: 86, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Revenue Projection', prediction: 'Premium subscriptions on track for $45K this month', confidence: 83, trend: 'up' as const, impact: 'medium' as const },
]

const mockTutorialsActivities = [
  { id: '1', user: 'Lead Instructor', action: 'Published', target: 'Next.js 15 Advanced Course', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Student', action: 'Completed', target: 'React Fundamentals certification', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Content Creator', action: 'Uploaded', target: '12 new tutorial videos', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockTutorialsQuickActions = [
  { id: '1', label: 'New Course', icon: 'plus', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 800)),
    { loading: 'Creating new course...', success: 'Course created - Start adding content', error: 'Failed to create course' }
  ), variant: 'default' as const },
  { id: '2', label: 'Upload', icon: 'upload', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 1000)),
    { loading: 'Preparing upload...', success: 'Upload dialog ready', error: 'Failed to initialize upload' }
  ), variant: 'default' as const },
  { id: '3', label: 'Analytics', icon: 'barChart', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 900)),
    { loading: 'Loading course analytics...', success: 'Analytics dashboard loaded', error: 'Failed to load analytics' }
  ), variant: 'outline' as const },
]

export default function TutorialsClient({ initialTutorials, initialStats }: TutorialsClientProps) {
  const { tutorials, stats } = useTutorials(initialTutorials, initialStats)
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [activeChapter, setActiveChapter] = useState<string | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showAchievementDialog, setShowAchievementDialog] = useState(false)

  const filteredCourses = useMemo(() => {
    let filtered = [...mockCourses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.skills.some(s => s.toLowerCase().includes(query)) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory)
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(c => c.level === levelFilter)
    }

    return filtered
  }, [searchQuery, selectedCategory, levelFilter])

  const getLevelColor = (level: CourseLevel) => {
    const colors: Record<CourseLevel, string> = {
      'beginner': 'bg-green-100 text-green-700',
      'intermediate': 'bg-blue-100 text-blue-700',
      'advanced': 'bg-orange-100 text-orange-700',
      'all-levels': 'bg-purple-100 text-purple-700',
    }
    return colors[level]
  }

  const formatDuration = (duration: Duration) => {
    if (duration.hours > 0) {
      return `${duration.hours}h ${duration.minutes}m`
    }
    return `${duration.minutes}m`
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )

  // Handlers
  const handleCreateTutorial = () => toast.info('Create', { description: 'Opening editor...' })
  const handlePublishTutorial = (n: string) => toast.success('Published', { description: `"${n}" is live` })
  const handleStartTutorial = (n: string) => toast.info('Starting', { description: `Loading "${n}"...` })
  const handleCompleteTutorial = (n: string) => toast.success('Completed', { description: `Finished "${n}"!` })
  const handleMyList = () => {
    toast.info('My List', { description: 'Opening your saved courses...' })
  }
  const handleQuickAction = (actionLabel: string) => {
    toast.promise(new Promise(r => setTimeout(r, 500)), { loading: `Performing ${actionLabel.toLowerCase()}...`, success: `${actionLabel} completed`, error: `Failed to complete ${actionLabel}` })
  }
  const handleMarkAllRead = () => {
    toast.success('Notifications', { description: 'All notifications marked as read' })
  }
  const handleChangePhoto = () => {
    toast.info('Change Photo', { description: 'Opening photo upload dialog...' })
  }
  const handleUpgradePlan = (planName: string) => {
    toast.info('Upgrade Plan', { description: `Upgrading to ${planName} plan...` })
  }
  const handleAddPaymentMethod = () => {
    toast.info('Add Payment', { description: 'Opening payment method form...' })
  }
  const handleConnectService = (serviceName: string) => {
    toast.info('Connect Service', { description: `Connecting to ${serviceName}...` })
  }
  const handleCopyApiKey = () => {
    toast.success('Copied', { description: 'API key copied to clipboard' })
  }
  const handleRegenerateApiKey = () => {
    toast.warning('Regenerate API Key', { description: 'Generating new API key...' })
  }
  const handleDownloadData = () => {
    toast.info('Download Data', { description: 'Preparing your data export...' })
  }
  const handleClearHistory = () => {
    toast.success('History Cleared', { description: 'Watch history has been cleared' })
  }
  const handleResetProgress = () => {
    toast.warning('Reset Progress', { description: 'Resetting all course progress...' })
  }
  const handleDeleteAccount = () => {
    toast.error('Delete Account', { description: 'Please confirm account deletion' })
  }
  const handleEnrollCourse = (courseName: string) => {
    toast.success('Enrolled', { description: `Successfully enrolled in "${courseName}"` })
  }
  const handleCreateGoal = () => {
    toast.success('Goal Created', { description: 'Your learning goal has been set' })
    setShowGoalDialog(false)
  }

  const CourseCard = ({ course }: { course: Course }) => {
    const progress = mockProgress.find(p => p.courseId === course.id)

    return (
      <Card className="hover:shadow-lg transition-all cursor-pointer border-gray-200 hover:border-rose-300 overflow-hidden group" onClick={() => setSelectedCourse(course)}>
        <div className="h-40 bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center relative">
          <GraduationCap className="w-16 h-16 text-white/30" />
          {progress && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <Progress value={progress.progress} className="h-1" />
              <span className="text-xs text-white">{progress.progress}% complete</span>
            </div>
          )}
          {course.discountPrice && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
              SALE
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">{course.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{course.instructor.name}</p>

          <div className="flex items-center gap-2 mt-2">
            {renderStars(course.metrics.rating)}
            <span className="text-sm font-semibold">{course.metrics.rating}</span>
            <span className="text-xs text-gray-500">({course.metrics.reviewsCount.toLocaleString()})</span>
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(course.duration)}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(course.metrics.enrollments / 1000).toFixed(0)}K</span>
            <Badge className={`${getLevelColor(course.level)} text-xs`}>{course.level}</Badge>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              {course.discountPrice ? (
                <>
                  <span className="text-lg font-bold text-gray-900">${course.discountPrice}</span>
                  <span className="text-sm text-gray-400 line-through">${course.price}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">${course.price}</span>
              )}
            </div>
            {course.certificate && (
              <Badge variant="outline" className="text-xs"><Award className="w-3 h-3 mr-1" />Certificate</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <GraduationCap className="w-8 h-8" />
                Learning Hub
              </h1>
              <p className="text-rose-100 mt-1">Master new skills with expert-led courses</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0" onClick={handleMyList}>
                <Bookmark className="w-4 h-4 mr-2" />
                My List
              </Button>
              <Button className="bg-white text-rose-600 hover:bg-rose-50" onClick={handleCreateTutorial}>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for courses, skills, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-0 shadow-lg rounded-xl text-gray-900"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{mockCourses.length * 45}</div>
              <div className="text-rose-100 text-sm">Total Courses</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{mockProgress.length}</div>
              <div className="text-rose-100 text-sm">In Progress</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">12</div>
              <div className="text-rose-100 text-sm">Completed</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">5</div>
              <div className="text-rose-100 text-sm">Certificates</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="browse" className="gap-2"><BookOpen className="w-4 h-4" />Browse</TabsTrigger>
              <TabsTrigger value="my-learning" className="gap-2"><Play className="w-4 h-4" />My Learning</TabsTrigger>
              <TabsTrigger value="paths" className="gap-2"><Target className="w-4 h-4" />Learning Paths</TabsTrigger>
              <TabsTrigger value="certificates" className="gap-2"><Trophy className="w-4 h-4" />Certificates</TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2"><Medal className="w-4 h-4" />Achievements</TabsTrigger>
              <TabsTrigger value="goals" className="gap-2"><Target className="w-4 h-4" />Goals</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
              <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" />Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <div className="flex border rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-rose-100 text-rose-700' : 'bg-white dark:bg-gray-800'}`}><Grid3X3 className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-rose-100 text-rose-700' : 'bg-white dark:bg-gray-800'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-8">
            {/* Browse Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning Library</h2>
                  <p className="text-rose-100">Udemy-level course catalog with personalized recommendations</p>
                  <p className="text-rose-200 text-xs mt-1">Video tutorials • Interactive exercises • Certifications</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCourses.length}</p>
                    <p className="text-rose-200 text-sm">Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{categories.length}</p>
                    <p className="text-rose-200 text-sm">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCourses.reduce((s, c) => s + c.lessons, 0)}</p>
                    <p className="text-rose-200 text-sm">Lessons</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Search, label: 'Search', color: 'text-rose-600 dark:text-rose-400' },
                { icon: Star, label: 'Top Rated', color: 'text-yellow-600 dark:text-yellow-400' },
                { icon: Clock, label: 'New', color: 'text-blue-600 dark:text-blue-400' },
                { icon: TrendingUp, label: 'Trending', color: 'text-green-600 dark:text-green-400' },
                { icon: Bookmark, label: 'Saved', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Award, label: 'Certified', color: 'text-amber-600 dark:text-amber-400' },
                { icon: Users, label: 'Popular', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Filter, label: 'Filter', color: 'text-gray-600 dark:text-gray-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200" onClick={() => handleQuickAction(action.label)}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Categories */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'bg-rose-600' : ''}>All Categories</Button>
                {categories.map(cat => (
                  <Button key={cat.id} variant={selectedCategory === cat.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(cat.id)} className={selectedCategory === cat.id ? 'bg-rose-600' : ''}>
                    {cat.icon}<span className="ml-1">{cat.name}</span><span className="ml-1 text-xs opacity-60">({cat.count})</span>
                  </Button>
                ))}
              </div>
            </section>

            {/* Course Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-gray-400 font-normal ml-2">({filteredCourses.length})</span>
                </h2>
              </div>
              {filteredCourses.length === 0 ? (
                <Card><CardContent className="p-12 text-center"><GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3><p className="text-gray-500">Try adjusting your search or filters</p></CardContent></Card>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {filteredCourses.map(course => (<CourseCard key={course.id} course={course} />))}
                </div>
              )}
            </section>
          </TabsContent>

          {/* My Learning Tab */}
          <TabsContent value="my-learning" className="space-y-6">
            {/* My Learning Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">My Learning Dashboard</h2>
                  <p className="text-blue-100">Coursera-level progress tracking and learning analytics</p>
                  <p className="text-blue-200 text-xs mt-1">Resume courses • Track progress • Set goals</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProgress.length}</p>
                    <p className="text-blue-200 text-sm">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-blue-200 text-sm">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">156h</p>
                    <p className="text-blue-200 text-sm">Total Time</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-rose-100 rounded-lg"><Play className="w-5 h-5 text-rose-600" /></div><div><div className="text-2xl font-bold">{mockProgress.length}</div><div className="text-sm text-gray-500">In Progress</div></div></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div><div><div className="text-2xl font-bold">12</div><div className="text-sm text-gray-500">Completed</div></div></div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div><div><div className="text-2xl font-bold">156h</div><div className="text-sm text-gray-500">Total Watch Time</div></div></div></CardContent></Card>
            </div>

            {mockProgress.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><Play className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No courses in progress</h3><p className="text-gray-500 mb-4">Start learning by enrolling in a course</p><Button className="bg-rose-600" onClick={() => setActiveTab('browse')}>Browse Courses</Button></CardContent></Card>
            ) : (
              <div className="space-y-4">
                {mockProgress.map(p => {
                  const course = mockCourses.find(c => c.id === p.courseId)
                  if (!course) return null
                  return (
                    <Card key={p.courseId} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCourse(course)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center"><GraduationCap className="w-8 h-8 text-white/50" /></div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{course.title}</h3>
                            <p className="text-sm text-gray-500">{course.instructor.name}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Progress value={p.progress} className="flex-1 h-2" />
                              <span className="text-sm font-medium">{p.progress}%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{p.lessonsCompleted} of {p.totalLessons} lessons • Last accessed {p.lastAccessed}</p>
                          </div>
                          <Button size="sm" className="bg-rose-600" onClick={(e) => { e.stopPropagation(); handleStartTutorial(course.title) }}><Play className="w-4 h-4 mr-1" />Continue</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            {/* Learning Paths Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning Paths</h2>
                  <p className="text-emerald-100">LinkedIn Learning-level guided career development</p>
                  <p className="text-emerald-200 text-xs mt-1">Curated sequences • Career tracks • Skill progression</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockLearningPaths.length}</p>
                    <p className="text-emerald-200 text-sm">Paths</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockLearningPaths.reduce((s, p) => s + p.courses.length, 0)}</p>
                    <p className="text-emerald-200 text-sm">Total Courses</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockLearningPaths.map(path => (
                <Card key={path.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-24 bg-gradient-to-r from-rose-600 to-purple-600 p-4 flex items-end">
                    <div><h3 className="text-xl font-bold text-white">{path.title}</h3><p className="text-white/80 text-sm">{path.description}</p></div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{path.courses.length} courses</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{path.duration.hours}h</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(path.enrollments / 1000).toFixed(0)}K enrolled</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map(skill => (<Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            {/* Certificates Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Certificates & Credentials</h2>
                  <p className="text-amber-100">Credly-level verified credentials and digital badges</p>
                  <p className="text-amber-200 text-xs mt-1">Blockchain verified • Shareable • Industry recognized</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-amber-200 text-sm">Certificates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-amber-200 text-sm">Available</p>
                  </div>
                </div>
              </div>
            </div>

            <Card><CardContent className="p-12 text-center"><Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">Your Certificates</h3><p className="text-gray-500 mb-4">Complete courses to earn certificates</p><Button className="bg-rose-600" onClick={() => setActiveTab('browse')}>Find Courses</Button></CardContent></Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Achievements Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Achievements & Badges</h2>
                  <p className="text-violet-100">Xbox-level gamification with rewards and milestones</p>
                  <p className="text-violet-200 text-xs mt-1">Streaks • XP points • Leaderboards • Special badges</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-violet-200 text-sm">Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">2,450</p>
                    <p className="text-violet-200 text-sm">XP Points</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-rose-600">{mockAchievements.filter(a => a.unlockedAt).length}</div><div className="text-sm text-gray-500">Unlocked</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-amber-600">{mockAchievements.reduce((acc, a) => acc + (a.unlockedAt ? a.points : 0), 0)}</div><div className="text-sm text-gray-500">Total Points</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-blue-600">{mockAchievements.filter(a => !a.unlockedAt).length}</div><div className="text-sm text-gray-500">In Progress</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-green-600">5</div><div className="text-sm text-gray-500">Day Streak</div></CardContent></Card>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockAchievements.map(achievement => (
                <Card key={achievement.id} className={`${achievement.unlockedAt ? 'border-amber-300 bg-amber-50' : 'opacity-75'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.unlockedAt ? 'bg-amber-100' : 'bg-gray-100'}`}>
                        {achievement.icon === 'zap' && <Zap className={`w-6 h-6 ${achievement.unlockedAt ? 'text-amber-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'trophy' && <Trophy className={`w-6 h-6 ${achievement.unlockedAt ? 'text-amber-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'flame' && <Flame className={`w-6 h-6 ${achievement.unlockedAt ? 'text-amber-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'heart' && <Heart className={`w-6 h-6 ${achievement.unlockedAt ? 'text-amber-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'award' && <Award className={`w-6 h-6 ${achievement.unlockedAt ? 'text-amber-600' : 'text-gray-400'}`} />}
                        {achievement.icon === 'clock' && <Clock className={`w-6 h-6 ${achievement.unlockedAt ? 'text-amber-600' : 'text-gray-400'}`} />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <Badge variant="outline" className="text-xs">{achievement.points} pts</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                    {!achievement.unlockedAt && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span><span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      </div>
                    )}
                    {achievement.unlockedAt && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mt-2"><CheckCircle className="w-3 h-3" />Unlocked {achievement.unlockedAt}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            {/* Goals Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning Goals</h2>
                  <p className="text-cyan-100">Duolingo-level goal setting with streaks and reminders</p>
                  <p className="text-cyan-200 text-xs mt-1">Daily targets • Weekly goals • Long-term milestones</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockGoals.length}</p>
                    <p className="text-cyan-200 text-sm">Active Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockGoals.filter(g => g.completed).length}</p>
                    <p className="text-cyan-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button className="bg-rose-600" onClick={() => setShowGoalDialog(true)}><Plus className="w-4 h-4 mr-2" />Set New Goal</Button>
            </div>
            <div className="space-y-4">
              {mockGoals.map(goal => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${goal.status === 'completed' ? 'bg-green-100' : goal.status === 'behind' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <Target className={`w-5 h-5 ${goal.status === 'completed' ? 'text-green-600' : goal.status === 'behind' ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{goal.name}</h4>
                          <p className="text-sm text-gray-500">Due: {goal.deadline}</p>
                        </div>
                      </div>
                      <Badge className={goal.status === 'completed' ? 'bg-green-100 text-green-700' : goal.status === 'behind' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>{goal.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                        <span>{goal.completedHours}h of {goal.targetHours}h</span><span>{Math.round((goal.completedHours / goal.targetHours) * 100)}%</span>
                      </div>
                      <Progress value={(goal.completedHours / goal.targetHours) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Notifications</CardTitle>
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Mark All Read</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockNotifications.map(notification => (
                    <div key={notification.id} className={`flex items-start gap-4 p-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'achievement' ? 'bg-amber-100' : notification.type === 'promotion' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {notification.type === 'course_update' && <RefreshCw className="w-5 h-5 text-blue-600" />}
                        {notification.type === 'achievement' && <Trophy className="w-5 h-5 text-amber-600" />}
                        {notification.type === 'reminder' && <Bell className="w-5 h-5 text-blue-600" />}
                        {notification.type === 'promotion' && <Sparkles className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><h4 className="font-semibold">{notification.title}</h4>{!notification.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}</div>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.createdAt}</p>
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Udemy Level */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning Preferences</h2>
                  <p className="text-slate-300">Customize your learning experience and notifications</p>
                  <p className="text-slate-400 text-xs mt-1">Display • Notifications • Privacy • Integrations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">EN</p>
                    <p className="text-slate-400 text-sm">Language</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">1x</p>
                    <p className="text-slate-400 text-sm">Speed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'subscription', label: 'Subscription', icon: CreditCard },
                        { id: 'learning', label: 'Learning', icon: GraduationCap },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Learning Stats Sidebar */}
                <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Learning Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">156h</div>
                      <div className="text-xs opacity-80">Total Watch Time</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">12</div>
                        <div className="text-xs opacity-80">Completed</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">5</div>
                        <div className="text-xs opacity-80">Day Streak</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Monthly Goal</span>
                        <span>18/30 hours</span>
                      </div>
                      <Progress value={60} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-rose-600" />
                          Profile Settings
                        </CardTitle>
                        <CardDescription>Manage your profile information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-20 h-20"><AvatarFallback className="text-2xl">JD</AvatarFallback></Avatar>
                          <div className="space-y-2">
                            <Button variant="outline" onClick={handleChangePhoto}>Change Photo</Button>
                            <p className="text-xs text-gray-500">JPG, PNG. Max 2MB</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input defaultValue="John Doe" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue="john@example.com" type="email" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Headline</Label>
                            <Input placeholder="Software Developer" />
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <Input placeholder="https://yoursite.com" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Input defaultValue="Passionate learner and developer" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Preferences
                        </CardTitle>
                        <CardDescription>Configure your account preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="pst">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Profile Publicly</div>
                            <div className="text-sm text-gray-500">Let others find and view your profile</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Courses on Profile</div>
                            <div className="text-sm text-gray-500">Display enrolled courses publicly</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Control email notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Course Updates</div>
                            <div className="text-sm text-gray-500">New content in enrolled courses</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Weekly Digest</div>
                            <div className="text-sm text-gray-500">Summary of your learning progress</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Promotions & Sales</div>
                            <div className="text-sm text-gray-500">Special offers and discounts</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Instructor Messages</div>
                            <div className="text-sm text-gray-500">Direct messages from instructors</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-purple-600" />
                          Push Notifications
                        </CardTitle>
                        <CardDescription>Mobile and browser notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Learning Reminders</div>
                            <div className="text-sm text-gray-500">Daily study reminders</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Achievement Alerts</div>
                            <div className="text-sm text-gray-500">When you earn badges</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Live Session Reminders</div>
                            <div className="text-sm text-gray-500">Upcoming live events</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Streak Reminders</div>
                            <div className="text-sm text-gray-500">Don't break your streak!</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'subscription' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          Your Plan
                        </CardTitle>
                        <CardDescription>Manage your subscription</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {mockSubscriptions.map(sub => (
                            <div key={sub.id} className={`p-4 border rounded-lg ${sub.isCurrent ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'dark:border-gray-700'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-lg">{sub.name}</h4>
                                {sub.isCurrent && <Badge className="bg-rose-600">Current</Badge>}
                              </div>
                              <div className="text-2xl font-bold mb-2">
                                ${sub.price}
                                <span className="text-sm text-gray-500 font-normal">/{sub.interval}</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">
                                {sub.coursesIncluded === 'unlimited' ? 'Unlimited courses' : `${sub.coursesIncluded} courses`}
                              </p>
                              <ul className="space-y-1 mb-4">
                                {sub.features.map((f, i) => (
                                  <li key={i} className="text-sm flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />{f}
                                  </li>
                                ))}
                              </ul>
                              {!sub.isCurrent && <Button variant="outline" className="w-full" onClick={() => handleUpgradePlan(sub.name)}>Upgrade</Button>}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          Payment Methods
                        </CardTitle>
                        <CardDescription>Manage your payment options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">VISA</span>
                            </div>
                            <div>
                              <div className="font-medium">•••• •••• •••• 4242</div>
                              <div className="text-sm text-gray-500">Expires 12/25</div>
                            </div>
                          </div>
                          <Badge variant="outline">Default</Badge>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleAddPaymentMethod}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'learning' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-rose-600" />
                          Video Preferences
                        </CardTitle>
                        <CardDescription>Customize your video experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Quality</Label>
                            <Select defaultValue="auto">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Auto</SelectItem>
                                <SelectItem value="1080p">1080p HD</SelectItem>
                                <SelectItem value="720p">720p</SelectItem>
                                <SelectItem value="480p">480p</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Playback Speed</Label>
                            <Select defaultValue="1x">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.5x">0.5x</SelectItem>
                                <SelectItem value="0.75x">0.75x</SelectItem>
                                <SelectItem value="1x">1x (Normal)</SelectItem>
                                <SelectItem value="1.25x">1.25x</SelectItem>
                                <SelectItem value="1.5x">1.5x</SelectItem>
                                <SelectItem value="2x">2x</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Autoplay Next Lesson</div>
                            <div className="text-sm text-gray-500">Automatically play the next lesson</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Captions</div>
                            <div className="text-sm text-gray-500">Display subtitles when available</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Download for Offline</div>
                            <div className="text-sm text-gray-500">Enable offline viewing (Pro plan)</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Learning Goals
                        </CardTitle>
                        <CardDescription>Set and track your learning goals</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Daily Goal</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Reminder Time</Label>
                            <Input type="time" defaultValue="09:00" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Weekend Reminders</div>
                            <div className="text-sm text-gray-500">Send reminders on weekends</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Streak Protection</div>
                            <div className="text-sm text-gray-500">Freeze streaks on rest days</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-indigo-600" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>Manage third-party integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                              <span className="text-white font-bold">G</span>
                            </div>
                            <div>
                              <div className="font-medium">Google Calendar</div>
                              <div className="text-sm text-gray-500">Sync learning schedule</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">L</span>
                            </div>
                            <div>
                              <div className="font-medium">LinkedIn</div>
                              <div className="text-sm text-gray-500">Share certificates</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                              <span className="text-white font-bold">S</span>
                            </div>
                            <div>
                              <div className="font-medium">Slack</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleConnectService('Slack')}>Connect</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">Z</span>
                            </div>
                            <div>
                              <div className="font-medium">Zoom</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleConnectService('Zoom')}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API credentials</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="learn_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleCopyApiKey}>Copy</Button>
                            <Button variant="outline" onClick={handleRegenerateApiKey}>Regenerate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable API Access</div>
                            <div className="text-sm text-gray-500">Allow third-party apps to access your data</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-600" />
                          Appearance
                        </CardTitle>
                        <CardDescription>Customize the look and feel</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Color Theme</Label>
                          <Select defaultValue="system">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Accent Color</Label>
                          <div className="flex gap-2">
                            {['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'].map(color => (
                              <button key={color} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Compact Mode</div>
                            <div className="text-sm text-gray-500">Reduce spacing throughout</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Animations</div>
                            <div className="text-sm text-gray-500">Enable smooth animations</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Privacy & Security
                        </CardTitle>
                        <CardDescription>Manage your privacy settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-500">Add extra security to your account</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Login Alerts</div>
                            <div className="text-sm text-gray-500">Email me when there's a new login</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Progress Publicly</div>
                            <div className="text-sm text-gray-500">Display learning progress on profile</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={handleDownloadData}>
                            <Download className="w-4 h-4 mr-2" />
                            Download My Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleClearHistory}>
                            <HardDrive className="w-4 h-4 mr-2" />
                            Clear Watch History
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Reset Progress</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Clear all course progress and history</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleResetProgress}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete Account</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete your account and data</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                            <Trash2 className="w-4 h-4 mr-2" />
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockTutorialsAIInsights}
              title="Learning Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockTutorialsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockTutorialsPredictions}
              title="Learning Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockTutorialsActivities}
            title="Learning Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockTutorialsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Course Detail Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedCourse && (
            <div className="flex flex-col h-full">
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center"><GraduationCap className="w-10 h-10 text-white/50" /></div>
                  <div className="flex-1">
                    <Badge className={getLevelColor(selectedCourse.level)}>{selectedCourse.level}</Badge>
                    <DialogTitle className="text-xl mt-1">{selectedCourse.title}</DialogTitle>
                    <p className="text-gray-500 text-sm mt-1">{selectedCourse.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">{renderStars(selectedCourse.metrics.rating)}<span className="font-semibold ml-1">{selectedCourse.metrics.rating}</span><span className="text-gray-500 text-sm">({selectedCourse.metrics.reviewsCount.toLocaleString()} reviews)</span></div>
                      <span className="text-sm text-gray-500">{selectedCourse.metrics.enrollments.toLocaleString()} students</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedCourse.discountPrice ? (<><div className="text-2xl font-bold text-gray-900">${selectedCourse.discountPrice}</div><div className="text-sm text-gray-400 line-through">${selectedCourse.price}</div></>) : (<div className="text-2xl font-bold text-gray-900">${selectedCourse.price}</div>)}
                    <Button className="mt-2 bg-rose-600 w-full" onClick={() => handleEnrollCourse(selectedCourse.title)}>Enroll Now</Button>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 py-4">
                <Tabs defaultValue="curriculum">
                  <TabsList className="mb-4">
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="instructor">Instructor</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="curriculum" className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{selectedCourse.chapters.length} chapters • {selectedCourse.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)} lessons</span>
                      <span>Total: {formatDuration(selectedCourse.duration)}</span>
                    </div>
                    {selectedCourse.chapters.map(chapter => (
                      <div key={chapter.id} className="border rounded-lg overflow-hidden">
                        <button onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
                          <div className="flex items-center gap-3">
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeChapter === chapter.id ? 'rotate-90' : ''}`} />
                            <span className="font-medium">{chapter.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{chapter.lessons.length} lessons • {chapter.duration}min</span>
                        </button>
                        {activeChapter === chapter.id && (
                          <div className="divide-y">
                            {chapter.lessons.map((lesson, idx) => (
                              <div key={lesson.id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                                <div className="w-6 text-center text-sm text-gray-400">{idx + 1}</div>
                                {lesson.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                                {lesson.type === 'quiz' && <FileText className="w-4 h-4 text-gray-400" />}
                                {lesson.type === 'exercise' && <Code className="w-4 h-4 text-gray-400" />}
                                {lesson.type === 'project' && <Target className="w-4 h-4 text-gray-400" />}
                                <span className="flex-1">{lesson.title}</span>
                                {lesson.isPreview && <Badge className="bg-green-100 text-green-700 text-xs">Preview</Badge>}
                                <span className="text-sm text-gray-500">{lesson.duration}min</span>
                                {!lesson.isPreview && <Lock className="w-4 h-4 text-gray-300" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">What you'll learn</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCourse.whatYouLearn.map((item, i) => (<div key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{item}</div>))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Skills you'll gain</h3>
                      <div className="flex flex-wrap gap-2">{selectedCourse.skills.map(skill => (<Badge key={skill} variant="outline">{skill}</Badge>))}</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Requirements</h3>
                      <ul className="space-y-1">{selectedCourse.requirements.map((req, i) => (<li key={i} className="flex items-center gap-2 text-sm"><Circle className="w-2 h-2 fill-gray-400" />{req}</li>))}</ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="instructor" className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16"><AvatarFallback className="text-lg">{selectedCourse.instructor.avatar}</AvatarFallback></Avatar>
                      <div>
                        <div className="flex items-center gap-2"><h3 className="font-semibold text-lg">{selectedCourse.instructor.name}</h3>{selectedCourse.instructor.verified && <Badge className="bg-blue-100 text-blue-700 text-xs">Verified</Badge>}</div>
                        <p className="text-gray-500">{selectedCourse.instructor.title}</p>
                        <p className="text-sm text-gray-600 mt-2">{selectedCourse.instructor.bio}</p>
                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{selectedCourse.instructor.rating} Rating</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" />{(selectedCourse.instructor.studentsCount / 1000).toFixed(0)}K Students</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-gray-400" />{selectedCourse.instructor.coursesCount} Courses</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center"><div className="text-4xl font-bold">{selectedCourse.metrics.rating}</div><div className="flex justify-center mt-1">{renderStars(selectedCourse.metrics.rating)}</div><div className="text-sm text-gray-500 mt-1">{selectedCourse.metrics.reviewsCount.toLocaleString()} reviews</div></div>
                      <div className="flex-1 space-y-1">{[5,4,3,2,1].map(star => (<div key={star} className="flex items-center gap-2"><span className="text-sm w-3">{star}</span><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><Progress value={star === 5 ? 72 : star === 4 ? 20 : 8/star} className="h-2 flex-1" /></div>))}</div>
                    </div>
                    {mockReviews.filter(r => r.courseId === selectedCourse.id).map(review => (
                      <Card key={review.id}><CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar><AvatarFallback>{review.user.avatar}</AvatarFallback></Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="font-semibold">{review.user.name}</span><span className="text-sm text-gray-500">{review.date}</span></div>
                            <div className="flex items-center gap-1 mt-1">{renderStars(review.rating)}</div>
                            <h4 className="font-medium mt-2">{review.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{review.content}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <button className="flex items-center gap-1 hover:text-gray-700"><Heart className="w-4 h-4" />Helpful ({review.helpful})</button>
                            </div>
                          </div>
                        </div>
                      </CardContent></Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Set New Learning Goal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Goal Name</Label><Input placeholder="Complete React Course" className="mt-1" /></div>
            <div><Label>Target Hours</Label><Input type="number" placeholder="40" className="mt-1" /></div>
            <div><Label>Deadline</Label><Input type="date" className="mt-1" /></div>
            <div><Label>Related Course</Label>
              <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>
                {mockCourses.map(c => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}
              </SelectContent></Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-gray-500" /><span className="text-sm">Enable reminder notifications</span></div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleCreateGoal}>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
