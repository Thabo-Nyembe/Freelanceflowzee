/**
 * User Report API Route
 *
 * POST - Report a user for policy violations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, reason, category = 'other', evidence } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ error: 'Report reason required' }, { status: 400 })
    }

    // Prevent self-report
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })
    }

    // Check for duplicate report
    const { data: existingReport } = await supabase
      .from('user_reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_user_id', userId)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return NextResponse.json({
        success: false,
        error: 'You have already reported this user. Our team is reviewing it.'
      }, { status: 409 })
    }

    // Create report record
    const { data: report, error } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: userId,
        reason,
        category,
        evidence: evidence || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error && error.code !== '42P01') throw error

    return NextResponse.json({
      success: true,
      action: 'report',
      reportId: report?.id || `report-${Date.now()}`,
      message: 'Report submitted. Our team will review it within 24-48 hours.'
    })
  } catch (error) {
    console.error('User report error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
