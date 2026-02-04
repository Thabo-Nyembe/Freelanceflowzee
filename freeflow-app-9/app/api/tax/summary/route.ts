/**
 * Tax Summary API
 *
 * Get comprehensive tax summary and analytics
 *
 * GET /api/tax/summary - Get tax summary for a year
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('tax-api')
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  return (
    request.nextUrl.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

/**
 * Get tax summary for a year
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const demoMode = isDemoMode(request)

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // If demo mode, use demo user ID
      if (demoMode) {
        const searchParams = request.nextUrl.searchParams
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

        // Return demo tax summary
        return NextResponse.json({
          success: true,
          demo: true,
          summary: {
            year,
            totalIncome: 368400,
            totalExpenses: 87600,
            netProfit: 280800,
            estimatedTax: 70200,
            quarterlyPayments: [
              { quarter: 'Q1', amount: 17550, paid: true, dueDate: `${year}-04-15` },
              { quarter: 'Q2', amount: 17550, paid: true, dueDate: `${year}-06-15` },
              { quarter: 'Q3', amount: 17550, paid: year < new Date().getFullYear(), dueDate: `${year}-09-15` },
              { quarter: 'Q4', amount: 17550, paid: false, dueDate: `${year}-01-15` }
            ],
            deductions: {
              homeOffice: 4800,
              equipment: 12500,
              software: 3200,
              professional: 5600,
              travel: 8400,
              marketing: 6200
            },
            incomeByCategory: [
              { category: 'Project Revenue', amount: 285000 },
              { category: 'Retainer Fees', amount: 68400 },
              { category: 'Consulting', amount: 15000 }
            ],
            expensesByCategory: [
              { category: 'Software & Tools', amount: 18500 },
              { category: 'Contractors', amount: 32000 },
              { category: 'Office Expenses', amount: 14600 },
              { category: 'Marketing', amount: 12500 },
              { category: 'Travel', amount: 10000 }
            ]
          },
          providers: { status: 'connected' }
        })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get tax summary
    const summary = await taxService.getTaxSummary(user.id, year)

    // Get provider status
    const providerStatus = taxService.getProviderStatus()

    return NextResponse.json({
      success: true,
      summary: {
        year,
        ...summary
      },
      providers: providerStatus
    })

  } catch (error) {
    logger.error('Tax summary error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tax summary' },
      { status: 500 }
    )
  }
}
