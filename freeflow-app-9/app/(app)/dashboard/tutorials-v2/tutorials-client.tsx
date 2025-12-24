'use client'

import { useState, useMemo } from 'react'
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
import { createTutorial, deleteTutorial, publishTutorial, archiveTutorial, enrollInTutorial } from '@/app/actions/tutorials'
import { Search, Play, BookOpen, Clock, Users, Star, Award, CheckCircle, Lock, PlayCircle, FileText, Video, Code, MessageSquare, Bookmark, BookmarkCheck, ChevronRight, Trophy, Target, TrendingUp, BarChart3, GraduationCap, Zap, Filter, Grid3X3, List, Heart, Share2, Download, Plus, ArrowRight, Circle, Check } from 'lucide-react'

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

const categories: { id: CourseCategory; name: string; icon: React.ReactNode; count: number }[] = [
  { id: 'development', name: 'Development', icon: <Code className="w-4 h-4" />, count: 156 },
  { id: 'design', name: 'Design', icon: <BookOpen className="w-4 h-4" />, count: 89 },
  { id: 'business', name: 'Business', icon: <TrendingUp className="w-4 h-4" />, count: 124 },
  { id: 'data-science', name: 'Data Science', icon: <BarChart3 className="w-4 h-4" />, count: 78 },
  { id: 'marketing', name: 'Marketing', icon: <Target className="w-4 h-4" />, count: 67 },
  { id: 'it-security', name: 'IT & Security', icon: <Zap className="w-4 h-4" />, count: 45 },
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
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0">
                <Bookmark className="w-4 h-4 mr-2" />
                My List
              </Button>
              <Button className="bg-white text-rose-600 hover:bg-rose-50">
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
                          <Button size="sm" className="bg-rose-600"><Play className="w-4 h-4 mr-1" />Continue</Button>
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
            <Card><CardContent className="p-12 text-center"><Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">Your Certificates</h3><p className="text-gray-500 mb-4">Complete courses to earn certificates</p><Button className="bg-rose-600" onClick={() => setActiveTab('browse')}>Find Courses</Button></CardContent></Card>
          </TabsContent>
        </Tabs>
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
                    <Button className="mt-2 bg-rose-600 w-full">Enroll Now</Button>
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
    </div>
  )
}
