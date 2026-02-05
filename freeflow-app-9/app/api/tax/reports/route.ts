import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('tax-reports')

/**
 * GET /api/tax/reports
 * Generate tax reports (quarterly or annual)
 * Query params:
 *   - year: tax year (required)
 *   - type: 'quarterly' or 'annual' (defaults to 'annual')
 *   - quarter: 1-4 (required if type='quarterly')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const type = searchParams.get('type') || 'annual'
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : null

    // Validate quarterly request
    if (type === 'quarterly' && (!quarter || quarter < 1 || quarter > 4)) {
      return NextResponse.json(
        { error: 'Valid quarter (1-4) required for quarterly reports' },
        { status: 400 }
      )
    }

    // Calculate date range
    let startDate: string
    let endDate: string

    if (type === 'quarterly' && quarter) {
      const quarterStartMonth = (quarter - 1) * 3
      startDate = `${year}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`
      const endMonth = quarterStartMonth + 3
      const lastDay = new Date(year, endMonth, 0).getDate()
      endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`
    } else {
      startDate = `${year}-01-01`
      endDate = `${year}-12-31`
    }

    // Fetch tax calculations for period
    const { data: calculations, error: calcError } = await supabase
      .from('tax_calculations')
      .select('*')
      .eq('user_id', user.id)
      .gte('calculated_at', startDate)
      .lte('calculated_at', endDate)
      .order('calculated_at', { ascending: true })

    if (calcError) {
      logger.error('Tax calculations fetch error', { error: calcError })
      return NextResponse.json(
        { error: 'Failed to fetch tax calculations' },
        { status: 500 }
      )
    }

    // Fetch deductions for period
    const { data: deductions, error: deductError } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_year', year)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .eq('is_approved', true)

    if (deductError) {
      logger.error('Tax deductions fetch error', { error: deductError })
      return NextResponse.json(
        { error: 'Failed to fetch tax deductions' },
        { status: 500 }
      )
    }

    // Calculate totals
    const totalTaxPaid = calculations?.reduce((sum, calc) =>
      sum + parseFloat(calc.tax_amount.toString()), 0) || 0

    const totalDeductions = deductions?.reduce((sum, ded) =>
      sum + parseFloat(ded.deductible_amount.toString()), 0) || 0

    const totalRevenue = calculations?.reduce((sum, calc) =>
      sum + parseFloat(calc.subtotal.toString()), 0) || 0

    // Estimate tax savings (assuming 25% marginal tax rate)
    const estimatedSavings = totalDeductions * 0.25

    // Get tax profile for additional context
    const { data: profile } = await supabase
      .from('user_tax_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Build report
    const report = {
      period: {
        type,
        year,
        quarter: type === 'quarterly' ? quarter : null,
        start_date: startDate,
        end_date: endDate
      },
      summary: {
        total_revenue: totalRevenue,
        total_tax_paid: totalTaxPaid,
        total_deductions: totalDeductions,
        estimated_tax_savings: estimatedSavings,
        effective_tax_rate: totalRevenue > 0 ? (totalTaxPaid / totalRevenue) * 100 : 0,
        transaction_count: calculations?.length || 0,
        deduction_count: deductions?.length || 0
      },
      calculations: calculations || [],
      deductions: deductions || [],
      profile: {
        business_structure: profile?.business_structure || 'unknown',
        filing_frequency: profile?.tax_filing_frequency || 'unknown',
        primary_country: profile?.primary_country || 'unknown',
        primary_state: profile?.primary_state || null
      },
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: report
    })
  } catch (error) {
    logger.error('Tax reports GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
