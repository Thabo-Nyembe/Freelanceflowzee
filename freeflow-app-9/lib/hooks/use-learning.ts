// Hook for Learning management with CRUD operations
// Created: December 30, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
export type CourseStatus = 'draft' | 'published' | 'archived'

export interface Course {
  id: string
  user_id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  instructor_id: string | null
  category: string
  subcategory: string | null
  level: CourseLevel
  language: string
  skills: string[]
  total_duration: number
  lessons_count: number
  enrolled_count: number
  rating: number
  reviews_count: number
  completion_rate: number
  last_updated: string
  is_bestseller: boolean
  is_new: boolean
  is_featured: boolean
  has_exercises: boolean
  has_certificate: boolean
  has_quizzes: boolean
  status: CourseStatus
  metadata: any
  created_at: string
  updated_at: string
}

export interface LearningPath {
  id: string
  user_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  total_duration: number
  lessons_count: number
  enrolled_count: number
  skills: string[]
  level: CourseLevel
  estimated_weeks: number
  status: CourseStatus
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lessons_completed: number
  total_lessons: number
  progress: number
  time_spent: number
  last_accessed_at: string
  completed_at: string | null
  certificate_url: string | null
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  likes: number
  created_at: string
  updated_at: string
}

interface UseLearningOptions {
  category?: string
  level?: CourseLevel | 'all'
  status?: CourseStatus
  limit?: number
}

export function useLearning(options: UseLearningOptions = {}) {
  const { category, level, status, limit } = options

  const filters: Record<string, any> = {}
  if (category && category !== 'all') filters.category = category
  if (level && level !== 'all') filters.level = level
  if (status) filters.status = status

  const queryOptions: any = {
    table: 'learning_paths',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<LearningPath>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'learning_paths',
    onSuccess: refetch
  })

  return {
    paths: data,
    loading,
    error,
    mutating,
    createPath: create,
    updatePath: update,
    deletePath: remove,
    refetch
  }
}

export function useCourses(options: UseLearningOptions = {}) {
  const { category, level, limit } = options

  const filters: Record<string, any> = { status: 'published' }
  if (category && category !== 'all') filters.category = category
  if (level && level !== 'all') filters.level = level

  const queryOptions: any = {
    table: 'courses',
    filters,
    orderBy: { column: 'enrolled_count', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Course>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'courses',
    onSuccess: refetch
  })

  return {
    courses: data,
    loading,
    error,
    mutating,
    createCourse: create,
    updateCourse: update,
    deleteCourse: remove,
    refetch
  }
}

export function useUserProgress(courseId?: string) {
  const filters: Record<string, any> = {}
  if (courseId) filters.course_id = courseId

  const { data, loading, error, refetch } = useSupabaseQuery<UserProgress>({
    table: 'learning_user_progress',
    filters,
    orderBy: { column: 'last_accessed_at', ascending: false },
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'learning_user_progress',
    onSuccess: refetch
  })

  return {
    progress: data,
    loading,
    error,
    mutating,
    createProgress: create,
    updateProgress: update,
    deleteProgress: remove,
    refetch
  }
}

export function useCollections() {
  const { data, loading, error, refetch } = useSupabaseQuery<Collection>({
    table: 'learning_collections',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  })

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'learning_collections',
    onSuccess: refetch
  })

  return {
    collections: data,
    loading,
    error,
    mutating,
    createCollection: create,
    updateCollection: update,
    deleteCollection: remove,
    refetch
  }
}
