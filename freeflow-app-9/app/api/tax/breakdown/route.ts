import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/tax/breakdown
 * Get tax deductions breakdown by category for a given tax year
 * Query params:
 *   - year: tax year (defaults to current year)
 *   - status: filter by status (pending, approved, rejected)
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
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('tax_deductions')
      .select('category, deductible_amount, is_approved')
      .eq('user_id', user.id)
      .eq('tax_year', year)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: deductions, error } = await query

    if (error) {
      console.error('Tax breakdown fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tax breakdown' },
        { status: 500 }
      )
    }

    // Group by category and sum amounts
    const breakdown: Record<string, { total: number; approved: number; pending: number; count: number }> = {}

    deductions?.forEach((deduction) => {
      const category = deduction.category || 'uncategorized'
      const amount = parseFloat(deduction.deductible_amount.toString())

      if (!breakdown[category]) {
        breakdown[category] = { total: 0, approved: 0, pending: 0, count: 0 }
      }

      breakdown[category].total += amount
      breakdown[category].count++

      if (deduction.is_approved) {
        breakdown[category].approved += amount
      } else {
        breakdown[category].pending += amount
      }
    })

    // Convert to array and sort by total descending
    const breakdownArray = Object.entries(breakdown)
      .map(([category, data]) => ({
        category,
        ...data
      }))
      .sort((a, b) => b.total - a.total)

    // Calculate overall totals
    const totals = {
      total_deductions: breakdownArray.reduce((sum, cat) => sum + cat.total, 0),
      approved_deductions: breakdownArray.reduce((sum, cat) => sum + cat.approved, 0),
      pending_deductions: breakdownArray.reduce((sum, cat) => sum + cat.pending, 0),
      total_count: breakdownArray.reduce((sum, cat) => sum + cat.count, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        year,
        categories: breakdownArray,
        totals
      }
    })
  } catch (error) {
    console.error('Tax breakdown GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
