/**
 * Late Fees API
 *
 * Manage late payment fees and penalties
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
import {
  calculateLateFee,
  applyLateFee,
  waiveLateFee,
  getLateFeeHistory,
  processOverdueInvoices,
  getLateFeeConfig,
  updateLateFeeConfig,
  getLateFeeStats,
  type LateFeeConfig
} from '@/lib/invoicing/late-fee-service'

const logger = createSimpleLogger('API-LateFees')

/**
 * GET /api/invoicing/late-fees
 * Get late fee information
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
    const action = searchParams.get('action') || 'config'
    const invoiceId = searchParams.get('invoiceId')

    switch (action) {
      case 'config': {
        const config = await getLateFeeConfig(user.id)
        return NextResponse.json({
          success: true,
          config
        })
      }

      case 'calculate': {
        if (!invoiceId) {
          return NextResponse.json(
            { success: false, error: 'invoiceId is required for calculation' },
            { status: 400 }
          )
        }

        const calculation = await calculateLateFee(invoiceId, user.id)
        return NextResponse.json({
          success: true,
          calculation
        })
      }

      case 'history': {
        if (!invoiceId) {
          return NextResponse.json(
            { success: false, error: 'invoiceId is required for history' },
            { status: 400 }
          )
        }

        const history = await getLateFeeHistory(invoiceId)
        return NextResponse.json({
          success: true,
          history
        })
      }

      case 'stats': {
        const period = searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year' || 'month'
        const stats = await getLateFeeStats(user.id, period)
        return NextResponse.json({
          success: true,
          stats,
          period
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: ['config', 'calculate', 'history', 'stats']
          },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Late fees GET error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get late fee information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invoicing/late-fees
 * Apply late fees or process actions
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
      case 'apply': {
        if (!body.invoiceId) {
          return NextResponse.json(
            { success: false, error: 'invoiceId is required' },
            { status: 400 }
          )
        }

        const result = await applyLateFee(body.invoiceId, user.id, body.customAmount)
        logger.info('Late fee applied', {
          invoiceId: body.invoiceId,
          amount: result.amount
        })

        return NextResponse.json({
          success: true,
          lateFee: result
        })
      }

      case 'waive': {
        if (!body.lateFeeId) {
          return NextResponse.json(
            { success: false, error: 'lateFeeId is required' },
            { status: 400 }
          )
        }

        const waived = await waiveLateFee(body.lateFeeId, user.id, body.reason)
        logger.info('Late fee waived', {
          lateFeeId: body.lateFeeId,
          reason: body.reason
        })

        return NextResponse.json({
          success: true,
          lateFee: waived
        })
      }

      case 'process': {
        // Manual trigger for processing overdue invoices
        const result = await processOverdueInvoices(user.id)
        logger.info('Processed overdue invoices', {
          processed: result.processed,
          feesApplied: result.feesApplied
        })

        return NextResponse.json({
          success: true,
          result
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: ['apply', 'waive', 'process']
          },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Late fees POST error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Late fee operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/invoicing/late-fees
 * Update late fee configuration
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
    const { config } = body

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'config object is required' },
        { status: 400 }
      )
    }

    // Validate config
    const validTypes = ['percentage', 'fixed', 'compound']
    if (config.type && !validTypes.includes(config.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid fee type. Use: percentage, fixed, compound' },
        { status: 400 }
      )
    }

    if (config.rate !== undefined && (config.rate < 0 || config.rate > 100)) {
      return NextResponse.json(
        { success: false, error: 'Rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (config.gracePeriodDays !== undefined && config.gracePeriodDays < 0) {
      return NextResponse.json(
        { success: false, error: 'Grace period cannot be negative' },
        { status: 400 }
      )
    }

    const updatedConfig = await updateLateFeeConfig(user.id, config as Partial<LateFeeConfig>)
    logger.info('Late fee config updated', { userId: user.id })

    return NextResponse.json({
      success: true,
      config: updatedConfig
    })
  } catch (error) {
    logger.error('Late fees PUT error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update late fee configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
