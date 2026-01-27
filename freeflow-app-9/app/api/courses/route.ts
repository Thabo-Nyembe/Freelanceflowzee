/**
 * KAZI Platform - Comprehensive Courses API
 *
 * Full-featured course/LMS management with database integration.
 * Supports CRUD operations, status management, sections, lectures,
 * enrollments, and analytics.
 *
 * @module app/api/courses/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('courses')

// ============================================================================
// TYPES
// ============================================================================

export type CourseCategory = 'development' | 'business' | 'design' | 'marketing' | 'data-science' | 'finance' | 'healthcare' | 'education' | 'technology' | 'other'
export type CourseStatus = 'draft' | 'published' | 'archived' | 'under_review' | 'suspended' | 'deleted' | 'pending_review'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all_levels'
export type CourseAccessType = 'public' | 'private' | 'restricted' | 'enterprise' | 'invitation_only'

interface Course {
  id: string
  user_id: string
  course_name: string
  description?: string
  course_category: CourseCategory
  status: CourseStatus
  level: CourseLevel
  instructor_name?: string
  instructor_email?: string
  instructor_bio?: string
  lecture_count: number
  module_count: number
  quiz_count: number
  assignment_count: number
  total_duration_hours: number
  student_count: number
  enrolled_count: number
  active_students: number
  completed_students: number
  dropped_students: number
  rating: number
  review_count: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
  completion_rate: number
  engagement_score: number
  video_watch_rate: number
  quiz_pass_rate: number
  assignment_submission_rate: number
  price: number
  original_price?: number
  discount_percentage: number
  currency: string
  total_revenue: number
  avg_revenue_per_student: number
  language: string
  subtitle_languages?: string[]
  has_certificates: boolean
  has_downloadable_resources: boolean
  has_lifetime_access: boolean
  has_mobile_access: boolean
  requirements?: string[]
  learning_outcomes?: string[]
  target_audience?: string
  is_published: boolean
  is_featured: boolean
  is_bestseller: boolean
  publish_date?: string
  access_type: CourseAccessType
  certification_pass_percentage: number
  testimonial_count: number
  share_count: number
  bookmark_count: number
  meta_title?: string
  meta_description?: string
  keywords?: string[]
  page_views: number
  unique_visitors: number
  conversion_rate: number
  avg_time_on_page_seconds: number
  has_discussion_forum: boolean
  has_qa_support: boolean
  has_live_sessions: boolean
  drm_enabled: boolean
  watermark_enabled: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// GET - List Courses / Get Single Course
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const courseId = searchParams.get('id')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'updated_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = await createClient()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        courses: getDemoCourses(),
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1
        }
      })
    }

    const userId = (session.user as any).authId || session.user.id

    // Single course fetch
    if (courseId) {
      const { data: course, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (error || !course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        course
      })
    }

    // Build query for course list
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })

    // Filter by user
    query = query.eq('user_id', userId)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('course_category', category)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (level && level !== 'all') {
      query = query.eq('level', level)
    }

    if (search) {
      query = query.or(`course_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: courses, error, count } = await query

    if (error) {
      logger.error('Courses query error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      )
    }

    // Get aggregate stats
    const aggregateStats = await getAggregateCourseStats(supabase, userId)

    return NextResponse.json({
      success: true,
      courses: courses || [],
      aggregate_stats: aggregateStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Courses GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Course
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()

    const supabase = await createClient()

    const {
      course_name,
      description,
      course_category = 'other',
      level = 'beginner',
      status = 'draft',
      instructor_name,
      instructor_email,
      instructor_bio,
      price = 0,
      original_price,
      discount_percentage = 0,
      currency = 'USD',
      language = 'English',
      has_certificates = true,
      has_downloadable_resources = true,
      has_lifetime_access = true,
      has_mobile_access = true,
      requirements = [],
      learning_outcomes = [],
      target_audience,
      meta_title,
      meta_description,
      keywords = [],
      access_type = 'public',
      certification_pass_percentage = 70,
      has_discussion_forum = true,
      has_qa_support = true,
      has_live_sessions = false,
      drm_enabled = false,
      watermark_enabled = false
    } = body

    // Validation
    if (!course_name || (typeof course_name === 'string' && course_name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Course name is required' },
        { status: 400 }
      )
    }

    // Create course
    const courseData = {
      user_id: userId,
      course_name: typeof course_name === 'string' ? course_name.trim() : course_name,
      description: description || '',
      course_category,
      level,
      status,
      instructor_name: instructor_name || '',
      instructor_email: instructor_email || '',
      instructor_bio: instructor_bio || '',
      lecture_count: 0,
      module_count: 0,
      quiz_count: 0,
      assignment_count: 0,
      total_duration_hours: 0,
      student_count: 0,
      enrolled_count: 0,
      active_students: 0,
      completed_students: 0,
      dropped_students: 0,
      rating: 0,
      review_count: 0,
      five_star_count: 0,
      four_star_count: 0,
      three_star_count: 0,
      two_star_count: 0,
      one_star_count: 0,
      completion_rate: 0,
      engagement_score: 0,
      video_watch_rate: 0,
      quiz_pass_rate: 0,
      assignment_submission_rate: 0,
      price,
      original_price: original_price || price,
      discount_percentage,
      currency,
      total_revenue: 0,
      avg_revenue_per_student: 0,
      language,
      has_certificates,
      has_downloadable_resources,
      has_lifetime_access,
      has_mobile_access,
      requirements: requirements || [],
      learning_outcomes: learning_outcomes || [],
      target_audience: target_audience || '',
      is_published: false,
      is_featured: false,
      is_bestseller: false,
      access_type,
      certification_pass_percentage,
      testimonial_count: 0,
      share_count: 0,
      bookmark_count: 0,
      meta_title: meta_title || course_name,
      meta_description: meta_description || description || '',
      keywords: keywords || [],
      page_views: 0,
      unique_visitors: 0,
      conversion_rate: 0,
      avg_time_on_page_seconds: 0,
      has_discussion_forum,
      has_qa_support,
      has_live_sessions,
      drm_enabled,
      watermark_enabled,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single()

    if (error) {
      logger.error('Course creation error', { error })
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      course,
      message: 'Course created successfully'
    }, { status: 201 })
  } catch (error) {
    logger.error('Courses POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Course
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('courses')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Course not found or permission denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'course_name', 'description', 'course_category', 'level', 'status',
      'instructor_name', 'instructor_email', 'instructor_bio',
      'price', 'original_price', 'discount_percentage', 'currency',
      'language', 'has_certificates', 'has_downloadable_resources',
      'has_lifetime_access', 'has_mobile_access', 'requirements',
      'learning_outcomes', 'target_audience', 'is_published', 'is_featured',
      'is_bestseller', 'publish_date', 'access_type', 'certification_pass_percentage',
      'meta_title', 'meta_description', 'keywords',
      'has_discussion_forum', 'has_qa_support', 'has_live_sessions',
      'drm_enabled', 'watermark_enabled'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Update course
    const { data: course, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Course update error', { error })
      return NextResponse.json(
        { error: 'Failed to update course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      course,
      message: 'Course updated successfully'
    })
  } catch (error) {
    logger.error('Courses PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Course
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('courses')
      .select('user_id, course_name')
      .eq('id', courseId)
      .single()

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json(
        { error: 'Course not found or permission denied' },
        { status: 403 }
      )
    }

    if (permanent) {
      // Permanent delete
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) {
        logger.error('Course deletion error', { error })
        return NextResponse.json(
          { error: 'Failed to delete course' },
          { status: 500 }
        )
      }
    } else {
      // Soft delete - mark as archived
      const { error } = await supabase
        .from('courses')
        .update({
          status: 'archived',
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)

      if (error) {
        logger.error('Course archive error', { error })
        return NextResponse.json(
          { error: 'Failed to archive course' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'Course deleted permanently' : 'Course archived successfully'
    })
  } catch (error) {
    logger.error('Courses DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getAggregateCourseStats(
  supabase: any,
  userId: string
) {
  try {
    const { count: total } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: published } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published')

    const { count: draft } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'draft')

    const { count: archived } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'archived')

    // Get total revenue and students
    const { data: revenueData } = await supabase
      .from('courses')
      .select('total_revenue, enrolled_count')
      .eq('user_id', userId)

    const totalRevenue = revenueData?.reduce((sum, c) => sum + (c.total_revenue || 0), 0) || 0
    const totalStudents = revenueData?.reduce((sum, c) => sum + (c.enrolled_count || 0), 0) || 0

    return {
      total: total || 0,
      by_status: {
        published: published || 0,
        draft: draft || 0,
        archived: archived || 0
      },
      total_revenue: totalRevenue,
      total_students: totalStudents
    }
  } catch (error) {
    logger.error('Error getting aggregate stats', { error })
    return {
      total: 0,
      by_status: { published: 0, draft: 0, archived: 0 },
      total_revenue: 0,
      total_students: 0
    }
  }
}

function getDemoCourses(): Partial<Course>[] {
  return [
    {
      id: 'demo-1',
      course_name: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, and Node.js',
      course_category: 'development',
      status: 'published',
      level: 'beginner',
      instructor_name: 'John Doe',
      price: 99.99,
      currency: 'USD',
      rating: 4.8,
      review_count: 1250,
      enrolled_count: 5000,
      total_revenue: 250000,
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      course_name: 'Advanced React Patterns',
      description: 'Master advanced React concepts and patterns',
      course_category: 'development',
      status: 'published',
      level: 'advanced',
      instructor_name: 'Jane Smith',
      price: 149.99,
      currency: 'USD',
      rating: 4.9,
      review_count: 800,
      enrolled_count: 2500,
      total_revenue: 187500,
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      course_name: 'Digital Marketing Masterclass',
      description: 'Learn SEO, SEM, Social Media Marketing and more',
      course_category: 'marketing',
      status: 'draft',
      level: 'intermediate',
      instructor_name: 'Mike Johnson',
      price: 79.99,
      currency: 'USD',
      rating: 0,
      review_count: 0,
      enrolled_count: 0,
      total_revenue: 0,
      created_at: new Date().toISOString()
    }
  ]
}
