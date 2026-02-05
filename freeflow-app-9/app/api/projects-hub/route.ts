/**
 * Projects Hub API Routes
 *
 * REST endpoints for Projects Hub Management:
 * GET - List projects, templates, imports, sources, settings, stats
 * POST - Create project, template, import, connect source, save settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('projects-hub')
import {

  getProjects,
  getProjectStats,
  searchProjects,
  getProjectsByStatus,
  getRecentProjects,
  createProject,
  getTemplates,
  createTemplate,
  duplicateTemplate,
  toggleTemplateLike,
  incrementTemplateDownloads,
  getImportHistory,
  createImport,
  getImportSources,
  connectImportSource,
  getImportSettings,
  saveImportSettings
} from '@/lib/projects-hub-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const isStarred = searchParams.get('is_starred')
    const isPinned = searchParams.get('is_pinned')
    const sortField = searchParams.get('sort_field') as string | null
    const sortDirection = searchParams.get('sort_direction') as 'asc' | 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'projects': {
        const filters = {
          status: status ? status.split(',') : undefined,
          priority: priority ? priority.split(',') : undefined,
          category: category ? category.split(',') : undefined,
          search: search || undefined,
          isStarred: isStarred ? isStarred === 'true' : undefined,
          isPinned: isPinned ? isPinned === 'true' : undefined
        }
        const sort = sortField ? { field: sortField, direction: sortDirection || 'desc' } : undefined
        const { data, count } = await getProjects(user.id, filters, sort, limit, offset)
        return NextResponse.json({ data, count })
      }

      case 'stats': {
        const data = await getProjectStats(user.id)
        return NextResponse.json({ data })
      }

      case 'search': {
        if (!search) {
          return NextResponse.json({ error: 'search parameter required' }, { status: 400 })
        }
        const { data } = await searchProjects(user.id, search, limit)
        return NextResponse.json({ data })
      }

      case 'by-status': {
        if (!status) {
          return NextResponse.json({ error: 'status parameter required' }, { status: 400 })
        }
        const { data } = await getProjectsByStatus(user.id, status.split(',') as string[])
        return NextResponse.json({ data })
      }

      case 'recent': {
        const { data } = await getRecentProjects(user.id, limit)
        return NextResponse.json({ data })
      }

      case 'templates': {
        const { data } = await getTemplates(user.id)
        return NextResponse.json({ data })
      }

      case 'import-history': {
        const { data } = await getImportHistory(user.id, limit)
        return NextResponse.json({ data })
      }

      case 'import-sources': {
        const { data } = await getImportSources(user.id)
        return NextResponse.json({ data })
      }

      case 'import-settings': {
        const { data } = await getImportSettings(user.id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Projects Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Projects Hub data' },
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
      case 'create-project': {
        const { data, error } = await createProject(user.id, payload)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-template': {
        const { data, error } = await createTemplate(user.id, payload)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'duplicate-template': {
        const { data, error } = await duplicateTemplate(user.id, payload.template_id)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'toggle-template-like': {
        const { success, error } = await toggleTemplateLike(user.id, payload.template_id, payload.liked)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ success })
      }

      case 'download-template': {
        const { success, error } = await incrementTemplateDownloads(payload.template_id)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ success })
      }

      case 'create-import': {
        const { data, error } = await createImport(user.id, payload)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'connect-source': {
        const { data, error } = await connectImportSource(user.id, payload)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'save-import-settings': {
        const { data, error } = await saveImportSettings(user.id, payload)
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Projects Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Projects Hub request' },
      { status: 500 }
    )
  }
}
