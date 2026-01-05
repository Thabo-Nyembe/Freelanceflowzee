'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type CourseStatus = 'draft' | 'published' | 'archived'
export type LessonType = 'video' | 'text' | 'quiz' | 'assignment' | 'live'
export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'expired'

export interface Course {
  id: string
  title: string
  description: string
  slug: string
  thumbnailUrl?: string
  previewVideoUrl?: string
  instructorId: string
  instructorName: string
  instructorAvatar?: string
  instructorBio?: string
  category: string
  subcategory?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  status: CourseStatus
  modules: CourseModule[]
  price: number
  currency: string
  discountPrice?: number
  isFree: boolean
  duration: number // minutes
  enrollmentCount: number
  rating: number
  reviewCount: number
  reviews: CourseReview[]
  requirements: string[]
  objectives: string[]
  tags: string[]
  certificate: boolean
  certificateTemplate?: string
  isPublic: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CourseModule {
  id: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
  isPublished: boolean
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description?: string
  type: LessonType
  content: LessonContent
  duration: number // minutes
  order: number
  isFree: boolean
  isPublished: boolean
  resources: LessonResource[]
}

export interface LessonContent {
  videoUrl?: string
  textContent?: string
  quiz?: QuizQuestion[]
  assignment?: AssignmentConfig
  liveSessionUrl?: string
  liveSessionDate?: string
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

export interface AssignmentConfig {
  instructions: string
  dueDate?: string
  maxScore: number
  allowLateSubmission: boolean
  attachmentRequired: boolean
}

export interface LessonResource {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'link' | 'file'
  url: string
  size?: number
}

export interface CourseReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  helpful: number
  createdAt: string
}

export interface Enrollment {
  id: string
  courseId: string
  courseTitle: string
  courseThumbnail?: string
  userId: string
  status: EnrollmentStatus
  progress: number
  completedLessons: string[]
  currentLesson?: string
  quizScores: Record<string, number>
  assignmentScores: Record<string, number>
  certificateUrl?: string
  enrolledAt: string
  completedAt?: string
  expiresAt?: string
}

export interface CourseStats {
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
  activeStudents: number
  completionRate: number
  avgRating: number
  totalRevenue: number
  topCourses: { id: string; title: string; enrollments: number }[]
  enrollmentTrend: { date: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more. Build real projects and become a full-stack developer.',
    slug: 'complete-web-development-bootcamp',
    thumbnailUrl: '/courses/web-dev.jpg',
    previewVideoUrl: '/courses/web-dev-preview.mp4',
    instructorId: 'user-1',
    instructorName: 'Alex Chen',
    instructorAvatar: '/avatars/alex.jpg',
    instructorBio: 'Senior developer with 10+ years experience',
    category: 'Development',
    subcategory: 'Web Development',
    level: 'beginner',
    language: 'English',
    status: 'published',
    modules: [
      {
        id: 'mod-1',
        title: 'Getting Started with HTML',
        order: 1,
        isPublished: true,
        lessons: [
          { id: 'les-1', moduleId: 'mod-1', title: 'Introduction to HTML', type: 'video', content: { videoUrl: '/videos/html-intro.mp4' }, duration: 15, order: 1, isFree: true, isPublished: true, resources: [] },
          { id: 'les-2', moduleId: 'mod-1', title: 'HTML Elements', type: 'video', content: { videoUrl: '/videos/html-elements.mp4' }, duration: 20, order: 2, isFree: false, isPublished: true, resources: [{ id: 'res-1', name: 'HTML Cheatsheet', type: 'pdf', url: '/resources/html-cheatsheet.pdf' }] },
          { id: 'les-3', moduleId: 'mod-1', title: 'HTML Quiz', type: 'quiz', content: { quiz: [{ id: 'q1', question: 'What does HTML stand for?', type: 'multiple_choice', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language'], correctAnswer: 'Hyper Text Markup Language', points: 10 }] }, duration: 10, order: 3, isFree: false, isPublished: true, resources: [] }
        ]
      },
      {
        id: 'mod-2',
        title: 'CSS Fundamentals',
        order: 2,
        isPublished: true,
        lessons: [
          { id: 'les-4', moduleId: 'mod-2', title: 'Introduction to CSS', type: 'video', content: { videoUrl: '/videos/css-intro.mp4' }, duration: 18, order: 1, isFree: false, isPublished: true, resources: [] }
        ]
      }
    ],
    price: 99.99,
    currency: 'USD',
    discountPrice: 49.99,
    isFree: false,
    duration: 2400,
    enrollmentCount: 15420,
    rating: 4.8,
    reviewCount: 3250,
    reviews: [
      { id: 'rev-1', userId: 'user-3', userName: 'Emily Johnson', rating: 5, comment: 'Excellent course! Very comprehensive.', helpful: 125, createdAt: '2024-03-10' }
    ],
    requirements: ['Basic computer skills', 'No programming experience needed'],
    objectives: ['Build websites from scratch', 'Master HTML, CSS and JavaScript', 'Create responsive designs'],
    tags: ['web development', 'html', 'css', 'javascript', 'react'],
    certificate: true,
    isPublic: true,
    publishedAt: '2024-01-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-15'
  },
  {
    id: 'course-2',
    title: 'Data Science Fundamentals',
    description: 'Master Python, pandas, and machine learning basics.',
    slug: 'data-science-fundamentals',
    thumbnailUrl: '/courses/data-science.jpg',
    instructorId: 'user-2',
    instructorName: 'Sarah Miller',
    category: 'Data Science',
    level: 'intermediate',
    language: 'English',
    status: 'published',
    modules: [],
    price: 149.99,
    currency: 'USD',
    isFree: false,
    duration: 1800,
    enrollmentCount: 8920,
    rating: 4.7,
    reviewCount: 1850,
    reviews: [],
    requirements: ['Basic Python knowledge'],
    objectives: ['Analyze data with pandas', 'Build ML models'],
    tags: ['data science', 'python', 'machine learning'],
    certificate: true,
    isPublic: true,
    publishedAt: '2024-02-01',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-10'
  }
]

const mockEnrollments: Enrollment[] = [
  {
    id: 'enroll-1',
    courseId: 'course-1',
    courseTitle: 'Complete Web Development Bootcamp',
    courseThumbnail: '/courses/web-dev.jpg',
    userId: 'user-4',
    status: 'active',
    progress: 35,
    completedLessons: ['les-1', 'les-2'],
    currentLesson: 'les-3',
    quizScores: {},
    assignmentScores: {},
    enrolledAt: '2024-03-01'
  }
]

const mockStats: CourseStats = {
  totalCourses: 45,
  publishedCourses: 38,
  totalEnrollments: 52400,
  activeStudents: 18500,
  completionRate: 68.5,
  avgRating: 4.6,
  totalRevenue: 425000,
  topCourses: [
    { id: 'course-1', title: 'Complete Web Development', enrollments: 15420 },
    { id: 'course-2', title: 'Data Science Fundamentals', enrollments: 8920 }
  ],
  enrollmentTrend: [
    { date: '2024-03-01', count: 420 },
    { date: '2024-03-08', count: 580 },
    { date: '2024-03-15', count: 510 }
  ]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseCoursesOptions {
  
}

export function useCourses(options: UseCoursesOptions = {}) {
  const {  } = options

  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCourses = useCallback(async () => {
    }, [])

  const updateCourse = useCallback(async (courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      ...updates,
      updatedAt: new Date().toISOString()
    } : c))
    return { success: true }
  }, [])

  const deleteCourse = useCallback(async (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId))
    return { success: true }
  }, [])

  const publishCourse = useCallback(async (courseId: string) => {
    return updateCourse(courseId, { status: 'published', publishedAt: new Date().toISOString() })
  }, [updateCourse])

  const unpublishCourse = useCallback(async (courseId: string) => {
    return updateCourse(courseId, { status: 'draft' })
  }, [updateCourse])

  const archiveCourse = useCallback(async (courseId: string) => {
    return updateCourse(courseId, { status: 'archived' })
  }, [updateCourse])

  const addModule = useCallback(async (courseId: string, module: Omit<CourseModule, 'id' | 'lessons'>) => {
    const newModule: CourseModule = { id: `mod-${Date.now()}`, lessons: [], ...module }
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      modules: [...c.modules, newModule].sort((a, b) => a.order - b.order)
    } : c))
    return { success: true, module: newModule }
  }, [])

  const updateModule = useCallback(async (courseId: string, moduleId: string, updates: Partial<CourseModule>) => {
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      modules: c.modules.map(m => m.id === moduleId ? { ...m, ...updates } : m)
    } : c))
    return { success: true }
  }, [])

  const deleteModule = useCallback(async (courseId: string, moduleId: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      modules: c.modules.filter(m => m.id !== moduleId)
    } : c))
    return { success: true }
  }, [])

  const addLesson = useCallback(async (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = { id: `les-${Date.now()}`, ...lesson }
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      modules: c.modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: [...m.lessons, newLesson].sort((a, b) => a.order - b.order)
      } : m),
      duration: c.duration + (lesson.duration || 0)
    } : c))
    return { success: true, lesson: newLesson }
  }, [])

  const updateLesson = useCallback(async (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      modules: c.modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
      } : m)
    } : c))
    return { success: true }
  }, [])

  const deleteLesson = useCallback(async (courseId: string, moduleId: string, lessonId: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      modules: c.modules.map(m => m.id === moduleId ? {
        ...m,
        lessons: m.lessons.filter(l => l.id !== lessonId)
      } : m)
    } : c))
    return { success: true }
  }, [])

  const enrollInCourse = useCallback(async (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course) return { success: false, error: 'Course not found' }

    const enrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      courseId,
      courseTitle: course.title,
      courseThumbnail: course.thumbnailUrl,
      userId: 'user-1',
      status: 'active',
      progress: 0,
      completedLessons: [],
      quizScores: {},
      assignmentScores: {},
      enrolledAt: new Date().toISOString()
    }
    setEnrollments(prev => [...prev, enrollment])
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      enrollmentCount: c.enrollmentCount + 1
    } : c))
    return { success: true, enrollment }
  }, [courses])

  const completeLesson = useCallback(async (enrollmentId: string, lessonId: string) => {
    setEnrollments(prev => prev.map(e => {
      if (e.id !== enrollmentId || e.completedLessons.includes(lessonId)) return e
      const newCompleted = [...e.completedLessons, lessonId]
      const course = courses.find(c => c.id === e.courseId)
      const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 1
      const progress = Math.round((newCompleted.length / totalLessons) * 100)
      return {
        ...e,
        completedLessons: newCompleted,
        progress,
        status: progress === 100 ? 'completed' as const : e.status,
        completedAt: progress === 100 ? new Date().toISOString() : undefined
      }
    }))
    return { success: true }
  }, [courses])

  const submitQuiz = useCallback(async (enrollmentId: string, lessonId: string, answers: Record<string, string>) => {
    // Calculate score based on answers
    const score = 85 // Mock score
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? {
      ...e,
      quizScores: { ...e.quizScores, [lessonId]: score }
    } : e))
    return { success: true, score }
  }, [])

  const submitAssignment = useCallback(async (enrollmentId: string, lessonId: string, submission: { content: string; attachments?: File[] }) => {
    // In real implementation, this would upload and submit
    return { success: true, submissionId: `sub-${Date.now()}` }
  }, [])

  const addReview = useCallback(async (courseId: string, rating: number, comment: string) => {
    const review: CourseReview = {
      id: `rev-${Date.now()}`,
      userId: 'user-1',
      userName: 'You',
      rating,
      comment,
      helpful: 0,
      createdAt: new Date().toISOString()
    }
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      reviews: [review, ...c.reviews],
      reviewCount: c.reviewCount + 1,
      rating: ((c.rating * c.reviewCount) + rating) / (c.reviewCount + 1)
    } : c))
    return { success: true, review }
  }, [])

  const markReviewHelpful = useCallback(async (courseId: string, reviewId: string) => {
    setCourses(prev => prev.map(c => c.id === courseId ? {
      ...c,
      reviews: c.reviews.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r)
    } : c))
    return { success: true }
  }, [])

  const searchCourses = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return courses.filter(c =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.tags.some(t => t.toLowerCase().includes(lowerQuery))
    )
  }, [courses])

  const filterCourses = useCallback((filters: {
    category?: string[]
    level?: string[]
    isFree?: boolean
    minRating?: number
  }) => {
    return courses.filter(c => {
      if (filters.category?.length && !filters.category.includes(c.category)) return false
      if (filters.level?.length && !filters.level.includes(c.level)) return false
      if (filters.isFree !== undefined && c.isFree !== filters.isFree) return false
      if (filters.minRating && c.rating < filters.minRating) return false
      return true
    })
  }, [courses])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchCourses()
  }, [fetchCourses])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const publishedCourses = useMemo(() => courses.filter(c => c.status === 'published'), [courses])
  const draftCourses = useMemo(() => courses.filter(c => c.status === 'draft'), [courses])
  const myCourses = useMemo(() => courses.filter(c => c.instructorId === 'user-1'), [courses])
  const myEnrollments = useMemo(() => enrollments.filter(e => e.userId === 'user-1'), [enrollments])
  const completedEnrollments = useMemo(() => enrollments.filter(e => e.status === 'completed'), [enrollments])
  const activeEnrollments = useMemo(() => enrollments.filter(e => e.status === 'active'), [enrollments])
  const popularCourses = useMemo(() => [...publishedCourses].sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 10), [publishedCourses])
  const topRatedCourses = useMemo(() => [...publishedCourses].sort((a, b) => b.rating - a.rating).slice(0, 10), [publishedCourses])

  return {
    courses, enrollments, currentCourse, currentLesson, stats,
    publishedCourses, draftCourses, myCourses, myEnrollments,
    completedEnrollments, activeEnrollments, popularCourses, topRatedCourses,
    isLoading, error,
    refresh, createCourse, updateCourse, deleteCourse,
    publishCourse, unpublishCourse, archiveCourse,
    addModule, updateModule, deleteModule,
    addLesson, updateLesson, deleteLesson,
    enrollInCourse, completeLesson, submitQuiz, submitAssignment,
    addReview, markReviewHelpful, searchCourses, filterCourses,
    setCurrentCourse, setCurrentLesson
  }
}

export default useCourses
