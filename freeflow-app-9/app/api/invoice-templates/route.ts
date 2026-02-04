/**
 * Invoice Templates API Routes
 *
 * REST endpoints for Invoice Templates:
 * GET - List all invoice templates with caching for better performance
 * POST - Create a new invoice template
 * PUT - Update an existing invoice template
 * DELETE - Delete an invoice template
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

const logger = createSimpleLogger('invoice-templates')

// Cached function for user's invoice templates (user-specific, 30 minutes cache)
const getCachedInvoiceTemplates = unstable_cache(
  async (userId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('user_id', userId)
      .order('usage_count', { ascending: false })

    if (error) throw error
    return data
  },
  ['invoice-templates'],
  { revalidate: 1800 } // 30 minutes
)

// Cached function for public/system invoice templates (static data, 1 hour cache)
const getCachedSystemInvoiceTemplates = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('is_system', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data
  },
  ['system-invoice-templates'],
  { revalidate: 3600 } // 1 hour
)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user' // 'user', 'system', 'all'
    const includeSystem = searchParams.get('include_system') === 'true'

    let result: any[] = []

    if (type === 'system') {
      // Get only system templates (cached)
      result = await getCachedSystemInvoiceTemplates() || []
    } else if (type === 'user') {
      // Get user's templates (cached by user)
      result = await getCachedInvoiceTemplates(user.id) || []

      if (includeSystem) {
        const systemTemplates = await getCachedSystemInvoiceTemplates() || []
        result = [...result, ...systemTemplates]
      }
    } else if (type === 'all') {
      // Get both user and system templates
      const userTemplates = await getCachedInvoiceTemplates(user.id) || []
      const systemTemplates = await getCachedSystemInvoiceTemplates() || []
      result = [...userTemplates, ...systemTemplates]
    }

    return NextResponse.json({ data: result }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    logger.error('Invoice Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch invoice templates' },
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
    const {
      name,
      description,
      items,
      tax_rate,
      discount,
      terms,
      notes,
      logo_url,
      header_text,
      footer_text,
      color_scheme,
      layout,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('invoice_templates')
      .insert({
        user_id: user.id,
        name,
        description,
        items: items || [],
        tax_rate: tax_rate || 0,
        discount: discount || 0,
        terms,
        notes,
        logo_url,
        header_text,
        footer_text,
        color_scheme,
        layout,
        usage_count: 0,
        is_system: false,
      })
      .select()
      .single()

    if (error) {
      logger.error('Create invoice template error', { error })
      return NextResponse.json(
        { error: 'Failed to create invoice template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    logger.error('Invoice Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to process invoice template request' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Only allow updates to user's own templates
    const { data, error } = await supabase
      .from('invoice_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Update invoice template error', { error })
      return NextResponse.json(
        { error: 'Template not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Invoice Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to update invoice template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Only allow deletion of user's own templates (not system templates)
    const { data: template } = await supabase
      .from('invoice_templates')
      .select('id, name, is_system')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (template.is_system) {
      return NextResponse.json({ error: 'Cannot delete system templates' }, { status: 403 })
    }

    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Delete invoice template error', { error })
      return NextResponse.json(
        { error: 'Failed to delete invoice template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" deleted successfully`,
    })
  } catch (error) {
    logger.error('Invoice Templates API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete invoice template' },
      { status: 500 }
    )
  }
}
