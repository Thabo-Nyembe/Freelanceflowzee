/**
 * Recurring Invoice API
 *
 * Manage recurring invoices and subscription billing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
import {
  createRecurringInvoice,
  updateRecurringInvoice,
  pauseRecurringInvoice,
  resumeRecurringInvoice,
  cancelRecurringInvoice,
  getRecurringInvoice,
  listRecurringInvoices,
  processRecurringInvoices,
  type RecurringInvoiceCreate,
  type RecurringInvoiceUpdate
} from '@/lib/invoicing/recurring-invoice-service'

const logger = createSimpleLogger('API-RecurringInvoice')

/**
 * POST /api/invoicing/recurring
 * Create a new recurring invoice or process actions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const data: RecurringInvoiceCreate = body.data
        if (!data.clientId || !data.clientEmail || !data.items || !data.billingCycle) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields: clientId, clientEmail, items, billingCycle' },
            { status: 400 }
          )
        }

        const recurring = await createRecurringInvoice(user.id, data)
        logger.info('Recurring invoice created', { id: recurring.id })

        return NextResponse.json({
          success: true,
          recurring
        })
      }

      case 'pause': {
        if (!body.recurringId) {
          return NextResponse.json(
            { success: false, error: 'recurringId is required' },
            { status: 400 }
          )
        }

        const paused = await pauseRecurringInvoice(body.recurringId, user.id, body.reason)

        return NextResponse.json({
          success: true,
          recurring: paused
        })
      }

      case 'resume': {
        if (!body.recurringId) {
          return NextResponse.json(
            { success: false, error: 'recurringId is required' },
            { status: 400 }
          )
        }

        const resumed = await resumeRecurringInvoice(body.recurringId, user.id)

        return NextResponse.json({
          success: true,
          recurring: resumed
        })
      }

      case 'cancel': {
        if (!body.recurringId) {
          return NextResponse.json(
            { success: false, error: 'recurringId is required' },
            { status: 400 }
          )
        }

        await cancelRecurringInvoice(body.recurringId, user.id)

        return NextResponse.json({
          success: true,
          message: 'Recurring invoice cancelled'
        })
      }

      case 'process': {
        // Manual trigger for processing (admin only)
        const result = await processRecurringInvoices()

        return NextResponse.json({
          success: true,
          result
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: create, pause, resume, cancel, process' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Recurring invoice API error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/invoicing/recurring
 * List recurring invoices or get specific one
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const recurring = await getRecurringInvoice(id, user.id)

      if (!recurring) {
        return NextResponse.json(
          { success: false, error: 'Recurring invoice not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        recurring
      })
    }

    // List recurring invoices
    const options = {
      isActive: searchParams.get('active') === 'true' ? true :
                searchParams.get('active') === 'false' ? false : undefined,
      clientId: searchParams.get('clientId') || undefined,
      billingCycle: searchParams.get('billingCycle') as string | null,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    const { invoices, total } = await listRecurringInvoices(user.id, options)

    return NextResponse.json({
      success: true,
      invoices,
      total,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        hasMore: options.offset + invoices.length < total
      }
    })
  } catch (error) {
    logger.error('Recurring invoice GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get recurring invoices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/invoicing/recurring
 * Update a recurring invoice
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recurringId, updates } = body

    if (!recurringId) {
      return NextResponse.json(
        { success: false, error: 'recurringId is required' },
        { status: 400 }
      )
    }

    const recurring = await updateRecurringInvoice(
      recurringId,
      user.id,
      updates as RecurringInvoiceUpdate
    )

    return NextResponse.json({
      success: true,
      recurring
    })
  } catch (error) {
    logger.error('Recurring invoice update error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update recurring invoice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
