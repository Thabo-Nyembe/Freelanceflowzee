import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get tax summary
    const summary = await taxService.getTaxSummary(user.id, year, supabase)

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Tax summary error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tax summary' },
      { status: 500 }
    )
  }
}
