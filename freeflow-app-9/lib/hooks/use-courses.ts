import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

export type CourseCategory = 'development' | 'business' | 'design' | 'marketing' | 'data-science' | 'finance' | 'healthcare' | 'education' | 'technology' | 'other'
export type CourseStatus = 'draft' | 'published' | 'archived' | 'under_review' | 'suspended' | 'deleted'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all_levels'
export type CourseAccessType = 'public' | 'private' | 'restricted' | 'enterprise' | 'invitation_only'

export interface Course {
  id: string
  user_id: string
  course_name: string
  description?: string
  course_category: CourseCategory
  status: CourseStatus
  level: CourseLevel

  // Instructor
  instructor_name?: string
  instructor_email?: string
  instructor_bio?: string

  // Structure
  lecture_count: number
  module_count: number
  quiz_count: number
  assignment_count: number
  total_duration_hours: number

  // Enrollment
  student_count: number
  enrolled_count: number
  active_students: number
  completed_students: number
  dropped_students: number

  // Ratings
  rating: number
  review_count: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number

  // Completion
  completion_rate: number
  avg_completion_time_hours?: number
  engagement_score: number
  video_watch_rate: number
  quiz_pass_rate: number
  assignment_submission_rate: number

  // Pricing
  price: number
  original_price?: number
  discount_percentage: number
  currency: string
  total_revenue: number
  avg_revenue_per_student: number

  // Content
  language: string
  subtitle_languages?: string[]
  has_certificates: boolean
  has_downloadable_resources: boolean
  has_lifetime_access: boolean
  has_mobile_access: boolean

  // Prerequisites
  prerequisites?: string[]
  requirements?: string[]
  learning_outcomes?: string[]
  target_audience?: string

  // Publishing
  is_published: boolean
  is_featured: boolean
  is_bestseller: boolean
  publish_date?: string
  last_content_update?: string

  // Access
  access_type: CourseAccessType
  enrollment_capacity?: number
  enrollment_deadline?: string
  course_start_date?: string
  course_end_date?: string

  // Certification
  certificate_template_id?: string
  certificate_criteria?: any
  certification_pass_percentage: number

  // Social proof
  testimonial_count: number
  share_count: number
  bookmark_count: number

  // Marketing
  promotional_video_url?: string
  thumbnail_url?: string
  preview_url?: string
  syllabus_url?: string

  // SEO
  slug?: string
  meta_title?: string
  meta_description?: string
  keywords?: string[]

  // Analytics
  page_views: number
  unique_visitors: number
  conversion_rate: number
  avg_time_on_page_seconds: number

  // Support
  has_discussion_forum: boolean
  has_qa_support: boolean
  has_live_sessions: boolean
  instructor_response_time_hours?: number

  // Protection
  drm_enabled: boolean
  download_limit?: number
  watermark_enabled: boolean

  // Compliance
  compliance_certifications?: string[]
  age_restriction?: number
  content_warnings?: string[]

  // Timestamps
  created_at: string
  updated_at: string
  deleted_at?: string

  // Metadata
  metadata?: any
  tags?: string[]
}

export function useCourses(filters?: {
  category?: CourseCategory | 'all'
  status?: CourseStatus | 'all'
  level?: CourseLevel | 'all'
}) {
  let query = useSupabaseQuery<Course>('courses')

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('course_category', filters.category)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.level && filters.level !== 'all') {
    query = query.eq('level', filters.level)
  }

  return query.order('created_at', { ascending: false })
}

export function useCreateCourse() {
  return useSupabaseMutation<Course>('courses', 'insert')
}

export function useUpdateCourse() {
  return useSupabaseMutation<Course>('courses', 'update')
}

export function useDeleteCourse() {
  return useSupabaseMutation<Course>('courses', 'delete')
}
