'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type ContentType = 'video' | 'article' | 'quiz' | 'project' | 'live'

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar?: string
  thumbnail: string
  duration: number // minutes
  level: CourseLevel
  category: string
  tags: string[]
  rating: number
  reviewCount: number
  enrolledCount: number
  price: number
  isFree: boolean
  modules: CourseModule[]
  createdAt: string
  updatedAt: string
}

export interface CourseModule {
  id: string
  title: string
  duration: number
  lessons: Lesson[]
  isLocked: boolean
}

export interface Lesson {
  id: string
  title: string
  type: ContentType
  duration: number
  isCompleted: boolean
  videoUrl?: string
  articleContent?: string
}

export interface UserProgress {
  courseId: string
  completedLessons: string[]
  currentLesson?: string
  progressPercent: number
  lastAccessedAt: string
  certificateEarned: boolean
}

export interface LearningPath {
  id: string
  title: string
  description: string
  courses: string[]
  estimatedDuration: number
  level: CourseLevel
  skills: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedAt?: string
  progress: number
  requirement: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCourses: Course[] = [
  {
    id: 'course-1', title: 'Freelancing Fundamentals', description: 'Master the basics of freelancing', instructor: 'Alex Chen', thumbnail: '/courses/freelancing.jpg', duration: 180, level: 'beginner', category: 'Business', tags: ['freelancing', 'basics'], rating: 4.8, reviewCount: 245, enrolledCount: 1520, price: 0, isFree: true,
    modules: [
      { id: 'm1', title: 'Getting Started', duration: 45, lessons: [{ id: 'l1', title: 'Introduction', type: 'video', duration: 10, isCompleted: true }, { id: 'l2', title: 'Setting Up', type: 'article', duration: 15, isCompleted: false }], isLocked: false }
    ], createdAt: '2024-01-01', updatedAt: '2024-03-01'
  },
  {
    id: 'course-2', title: 'Advanced Client Management', description: 'Build lasting client relationships', instructor: 'Sarah Miller', thumbnail: '/courses/clients.jpg', duration: 240, level: 'advanced', category: 'Business', tags: ['clients', 'management'], rating: 4.9, reviewCount: 180, enrolledCount: 890, price: 49, isFree: false,
    modules: [], createdAt: '2024-02-01', updatedAt: '2024-03-15'
  },
  {
    id: 'course-3', title: 'UI/UX Design Mastery', description: 'Create stunning user experiences', instructor: 'Mike Johnson', thumbnail: '/courses/uiux.jpg', duration: 420, level: 'intermediate', category: 'Design', tags: ['ui', 'ux', 'design'], rating: 4.7, reviewCount: 320, enrolledCount: 2100, price: 79, isFree: false,
    modules: [], createdAt: '2024-01-15', updatedAt: '2024-03-01'
  }
]

const mockProgress: UserProgress[] = [
  { courseId: 'course-1', completedLessons: ['l1'], currentLesson: 'l2', progressPercent: 25, lastAccessedAt: new Date().toISOString(), certificateEarned: false }
]

const mockLearningPaths: LearningPath[] = [
  { id: 'path-1', title: 'Freelance Designer Path', description: 'Become a successful freelance designer', courses: ['course-1', 'course-3'], estimatedDuration: 600, level: 'beginner', skills: ['Design', 'Freelancing', 'Client Management'] }
]

const mockAchievements: Achievement[] = [
  { id: 'ach-1', title: 'First Course', description: 'Complete your first course', icon: 'award', earnedAt: '2024-02-15', progress: 1, requirement: 1 },
  { id: 'ach-2', title: 'Learning Streak', description: 'Learn for 7 days in a row', icon: 'flame', progress: 3, requirement: 7 },
  { id: 'ach-3', title: 'Quiz Master', description: 'Score 100% on 5 quizzes', icon: 'star', progress: 2, requirement: 5 }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseLearningHubOptions {
  
  category?: string
}

export function useLearningHub(options: UseLearningHubOptions = {}) {
  const {  category } = options

  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCourses = useCallback(async (filters?: { category?: string; level?: string; search?: string }) => {
    try {
      const response = await fetch('/api/courses')
      const result = await response.json()
      if (result.success) {
        setCourses(Array.isArray(result.courses) ? result.courses : [])
        return result.courses
      }
      setCourses([])
      return []
    } catch (err) {
      setCourses([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/learning/progress')
      const result = await response.json()
      if (result.success) {
        setProgress(result.progress || [])
        return result.progress
      }
      setProgress(mockProgress)
      return []
    } catch (err) {
      setProgress(mockProgress)
      return []
    }
  }, [])

  const enrollInCourse = useCallback(async (courseId: string) => {
    try {
      const response = await fetch('/api/learning/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })
      const result = await response.json()
      if (result.success) {
        const course = courses.find(c => c.id === courseId)
        if (course) setEnrolledCourses(prev => [...prev, course])
      }
      return result
    } catch (err) {
      const course = courses.find(c => c.id === courseId)
      if (course) setEnrolledCourses(prev => [...prev, course])
      return { success: true }
    }
  }, [courses])

  const completeLesson = useCallback(async (courseId: string, lessonId: string) => {
    try {
      const response = await fetch('/api/learning/complete-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, lessonId })
      })
      const result = await response.json()
      if (result.success) {
        setProgress(prev => prev.map(p =>
          p.courseId === courseId
            ? { ...p, completedLessons: [...p.completedLessons, lessonId], progressPercent: result.progressPercent || p.progressPercent + 10 }
            : p
        ))
      }
      return result
    } catch (err) {
      setProgress(prev => prev.map(p =>
        p.courseId === courseId
          ? { ...p, completedLessons: [...p.completedLessons, lessonId] }
          : p
      ))
      return { success: true }
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchCourses({ search: query, category })
  }, [fetchCourses, category])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchCourses({ category }), fetchProgress()])
    setLearningPaths(mockLearningPaths)
    setAchievements(mockAchievements)
  }, [fetchCourses, fetchProgress, category])

  useEffect(() => { refresh() }, [refresh])

  const featuredCourses = useMemo(() => courses.filter(c => c.rating >= 4.8).slice(0, 5), [courses])
  const freeCourses = useMemo(() => courses.filter(c => c.isFree), [courses])
  const coursesByCategory = useMemo(() => {
    const grouped: Record<string, Course[]> = {}
    courses.forEach(c => {
      if (!grouped[c.category]) grouped[c.category] = []
      grouped[c.category].push(c)
    })
    return grouped
  }, [courses])
  const totalLearningTime = useMemo(() => enrolledCourses.reduce((sum, c) => sum + c.duration, 0), [enrolledCourses])
  const earnedAchievements = useMemo(() => achievements.filter(a => a.earnedAt), [achievements])

  return {
    courses, enrolledCourses, progress, learningPaths, achievements, currentCourse,
    featuredCourses, freeCourses, coursesByCategory, totalLearningTime, earnedAchievements,
    isLoading, error, searchQuery,
    refresh, fetchCourses, enrollInCourse, completeLesson, search,
    setCurrentCourse
  }
}

export default useLearningHub
