/**
 * Project Templates API Routes
 *
 * REST endpoints for Project Templates:
 * GET - List templates, tasks, milestones, deliverables, pricing, usage, favorites, reviews, stats
 * POST - Create template, task, milestone, deliverable, pricing, use template, favorite, review
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
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
    const category = searchParams.get('category') as any
    const templateType = searchParams.get('template_type') as any
    const complexity = searchParams.get('complexity') as any
    const minRating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const isFeatured = searchParams.get('is_featured') === 'true'
    const isPopular = searchParams.get('is_popular') === 'true'
    const sortBy = searchParams.get('sort_by') as any || 'recent'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'templates': {
        if (search) {
          const result = await searchTemplates(search, limit)
          return NextResponse.json({ data: result })
        }
        if (category) {
          const result = await getTemplatesByCategory(category)
          return NextResponse.json({ data: result })
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
        const result = await getFeaturedTemplates(limit)
        return NextResponse.json({ data: result })
      }

      case 'popular': {
        const result = await getPopularTemplatesQuery(category || undefined, limit)
        return NextResponse.json({ data: result })
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
        const result = await getTemplateLibraryStats()
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Project Templates API error:', error)
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
    console.error('Project Templates API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Project Templates request' },
      { status: 500 }
    )
  }
}
