/**
 * Categories API Routes
 *
 * REST endpoints for Categories:
 * GET - List all categories with caching for better performance
 * POST - Create a new category
 */

import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('categories')

// Cached function for categories (static data, 1 hour cache)
const getCachedCategories = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },
  ['categories'],
  { revalidate: 3600 } // 1 hour
)

// Cached function for categories with count (static data, 30 minutes cache)
const getCachedCategoriesWithCount = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        project_templates (count),
        projects (count)
      `)
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },
  ['categories-with-count'],
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
    const withCount = searchParams.get('with_count') === 'true'
    const type = searchParams.get('type') // 'project', 'template', 'invoice', etc.

    let result

    if (withCount) {
      result = await getCachedCategoriesWithCount()
    } else {
      result = await getCachedCategories()
    }

    // Filter by type if specified
    if (type && result) {
      result = result.filter((cat: any) => cat.type === type || !cat.type)
    }

    return NextResponse.json({ data: result }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    logger.error('Categories API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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
    const { name, description, slug, type, icon, color, parent_id } = body

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        type,
        icon,
        color,
        parent_id,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Create category error', { error })
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    logger.error('Categories API error', { error })
    return NextResponse.json(
      { error: 'Failed to process category request' },
      { status: 500 }
    )
  }
}
