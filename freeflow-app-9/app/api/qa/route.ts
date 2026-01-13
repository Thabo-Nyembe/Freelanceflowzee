import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'test_coverage_report': {
        const { data, error } = await supabase
          .from('test_results')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        const coverage = {
          total: (data || []).length,
          passed: (data || []).filter(t => t.status === 'passed').length,
          failed: (data || []).filter(t => t.status === 'failed').length,
          skipped: (data || []).filter(t => t.status === 'skipped').length,
          coveragePercentage: Math.round(((data || []).filter(t => t.status === 'passed').length / Math.max((data || []).length, 1)) * 100)
        }

        return NextResponse.json({ data: coverage, type: 'coverage' })
      }

      case 'execution_summary': {
        const { data, error } = await supabase
          .from('test_executions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        const summary = {
          totalExecutions: (data || []).length,
          averageDuration: Math.round((data || []).reduce((sum, e) => sum + (e.duration || 0), 0) / Math.max((data || []).length, 1)),
          successRate: Math.round(((data || []).filter(e => e.status === 'success').length / Math.max((data || []).length, 1)) * 100)
        }

        return NextResponse.json({ data: summary, type: 'execution_summary' })
      }

      case 'defect_report': {
        const { data, error } = await supabase
          .from('defects')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const report = {
          total: (data || []).length,
          critical: (data || []).filter(d => d.severity === 'critical').length,
          major: (data || []).filter(d => d.severity === 'major').length,
          minor: (data || []).filter(d => d.severity === 'minor').length,
          resolved: (data || []).filter(d => d.status === 'resolved').length
        }

        return NextResponse.json({ data: report, type: 'defect_report' })
      }

      case 'trend_analysis': {
        const { data, error } = await supabase
          .from('test_results')
          .select('created_at, status')
          .order('created_at', { ascending: false })
          .limit(500)

        if (error) throw error

        // Group by week
        const weeklyData: Record<string, { passed: number; failed: number }> = {}
        ;(data || []).forEach(t => {
          const week = new Date(t.created_at).toISOString().slice(0, 10)
          if (!weeklyData[week]) weeklyData[week] = { passed: 0, failed: 0 }
          if (t.status === 'passed') weeklyData[week].passed++
          else if (t.status === 'failed') weeklyData[week].failed++
        })

        return NextResponse.json({ data: weeklyData, type: 'trend_analysis' })
      }

      case 'export_all': {
        const [coverageRes, defectsRes, executionsRes] = await Promise.all([
          supabase.from('test_results').select('*'),
          supabase.from('defects').select('*'),
          supabase.from('test_executions').select('*')
        ])

        return NextResponse.json({
          coverage: coverageRes.data || [],
          defects: defectsRes.data || [],
          executions: executionsRes.data || [],
          exportedAt: new Date().toISOString()
        })
      }

      default: {
        const { data, error } = await supabase
          .from('test_cases')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error: any) {
    console.error('QA API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch QA data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'edit_test_case': {
        const { testCaseId, updates } = body
        const { data, error } = await supabase
          .from('test_cases')
          .update(updates)
          .eq('id', testCaseId)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'execute_test': {
        const { testCaseId } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('test_executions')
          .insert({
            test_case_id: testCaseId,
            user_id: user?.id,
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('QA API error:', error)
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
