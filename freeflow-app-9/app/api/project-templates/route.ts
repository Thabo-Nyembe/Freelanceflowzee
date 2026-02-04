/**
 * Project Templates API Routes
 *
 * REST endpoints for Project Templates:
 * GET - List templates, tasks, milestones, deliverables, pricing, usage, favorites, reviews, stats
 * POST - Create template, task, milestone, deliverable, pricing, use template, favorite, review
 */

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('project-templates')
import {

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}
  getTemplates,
  createTemplate,
  getFeaturedTemplates,
  getPopularTemplatesQuery,
  getUserTemplates,
  searchTemplates,
  getTemplatesByCategory,
  getTemplateTasks,
  createTemplateTask,
  getTemplateMilestones,
  createTemplateMilestone,
  getTemplateDeliverables,
  createTemplateDeliverable,
  getTemplatePricing,
  createPricingTier,
  applyTemplateToProject,
  getTemplateUsage,
  getUserTemplateUsage,
  favoriteTemplate,
  getUserFavorites,
  reviewTemplate,
  getTemplateReviews,
  getTemplateLibraryStats
} from '@/lib/project-templates-queries'

// Cached function for featured templates (static data, 1 hour cache)
const getCachedFeaturedTemplates = unstable_cache(
  async (limit: number) => {
    return getFeaturedTemplates(limit)
  },
  ['featured-templates'],
  { revalidate: 3600 } // 1 hour
)

// Cached function for popular templates (static data, 30 minutes cache)
const getCachedPopularTemplates = unstable_cache(
  async (category: string | undefined, limit: number) => {
    return getPopularTemplatesQuery(category, limit)
  },
  ['popular-templates'],
  { revalidate: 1800 } // 30 minutes
)

// Cached function for template library stats (static data, 1 hour cache)
const getCachedTemplateLibraryStats = unstable_cache(
  async () => {
    return getTemplateLibraryStats()
  },
  ['template-library-stats'],
  { revalidate: 3600 } // 1 hour
)

// Cached function for templates by category (static data, 30 minutes cache)
const getCachedTemplatesByCategory = unstable_cache(
  async (category: string) => {
    return getTemplatesByCategory(category as string)
  },
  ['templates-by-category'],
  { revalidate: 1800 } // 30 minutes
)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'templates'
    const templateId = searchParams.get('template_id')
    const category = searchParams.get('category') as string | null
    const templateType = searchParams.get('template_type') as string | null
    const complexity = searchParams.get('complexity') as string | null
    const minRating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('is_featured') === 'true'
    const isPopular = searchParams.get('is_popular') === 'true'
    const sortBy = searchParams.get('sort_by') as string | null || 'recent'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'templates': {
        if (search) {
          const result = await searchTemplates(search, limit)
          return NextResponse.json({ data: result })
        }
        if (category) {
          const result = await getCachedTemplatesByCategory(category)
          return NextResponse.json({ data: result }, {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
          })
        }
        const filters: any = {}
        if (templateType) filters.type = templateType
        if (complexity) filters.complexity = complexity
        if (minRating) filters.min_rating = minRating
        if (maxPrice) filters.max_price = maxPrice
        if (tags && tags.length > 0) filters.tags = tags
        if (isFeatured) filters.is_featured = true
        if (isPopular) filters.is_popular = true
        const result = await getTemplates(
          Object.keys(filters).length > 0 ? filters : undefined,
          sortBy,
          limit
        )
        return NextResponse.json({ data: result })
      }

      case 'featured': {
        const result = await getCachedFeaturedTemplates(limit)
        return NextResponse.json({ data: result }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        })
      }

      case 'popular': {
        const result = await getCachedPopularTemplates(category || undefined, limit)
        return NextResponse.json({ data: result }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        })
      }

      case 'user-templates': {
        const result = await getUserTemplates(user.id)
        return NextResponse.json({ data: result })
      }

      case 'tasks': {
        if (!templateId) {
          return NextResponse.json({ error: 'template_id required' }, { status: 400 })
        }
        const result = await getTemplateTasks(templateId)
        return NextResponse.json({ data: result })
      }

      case 'milestones': {
        if (!templateId) {
          return NextResponse.json({ error: 'template_id required' }, { status: 400 })
        }
        const result = await getTemplateMilestones(templateId)
        return NextResponse.json({ data: result })
      }

      case 'deliverables': {
        if (!templateId) {
          return NextResponse.json({ error: 'template_id required' }, { status: 400 })
        }
        const result = await getTemplateDeliverables(templateId)
        return NextResponse.json({ data: result })
      }

      case 'pricing': {
        if (!templateId) {
          return NextResponse.json({ error: 'template_id required' }, { status: 400 })
        }
        const result = await getTemplatePricing(templateId)
        return NextResponse.json({ data: result })
      }

      case 'usage': {
        if (templateId) {
          const result = await getTemplateUsage(templateId, limit)
          return NextResponse.json({ data: result })
        }
        const result = await getUserTemplateUsage(user.id, limit)
        return NextResponse.json({ data: result })
      }

      case 'favorites': {
        const result = await getUserFavorites(user.id)
        return NextResponse.json({ data: result })
      }

      case 'reviews': {
        if (!templateId) {
          return NextResponse.json({ error: 'template_id required' }, { status: 400 })
        }
        const result = await getTemplateReviews(templateId, limit)
        return NextResponse.json({ data: result })
      }

      case 'stats': {
        const result = await getCachedTemplateLibraryStats()
        return NextResponse.json({ data: result }, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Project Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Project Templates data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-template': {
        const result = await createTemplate(payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-task': {
        const result = await createTemplateTask(payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-milestone': {
        const result = await createTemplateMilestone(payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-deliverable': {
        const result = await createTemplateDeliverable(payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-pricing': {
        const result = await createPricingTier(payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'use-template': {
        const result = await applyTemplateToProject(
          payload.template_id,
          payload.project_id,
          payload.customizations
        )
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'favorite': {
        const result = await favoriteTemplate(
          payload.template_id,
          payload.folder,
          payload.notes
        )
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'review': {
        const result = await reviewTemplate(
          payload.template_id,
          payload.rating,
          payload.title,
          payload.comment,
          payload.project_type,
          payload.project_size
        )
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Project Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Project Templates request' },
      { status: 500 }
    )
  }
}
