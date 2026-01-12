/**
 * Admin Overview API Routes
 *
 * REST endpoints for Admin Dashboard:
 * GET - Dashboard stats, analytics, CRM, invoicing, marketing, operations, automation, alerts
 * POST - Create analytics event/report/goal, deal, contact, invoice, lead, campaign, team member, workflow, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getDashboardStats,
  getAnalyticsEvents,
  trackAnalyticsEvent,
  generateAnalyticsReport,
  getAnalyticsReports,
  createAnalyticsGoal,
  getActiveAnalyticsGoals,
  getDeals,
  getDealsByStage,
  getHighValueDeals,
  createDeal,
  getContacts,
  getHotContacts,
  createContact,
  logActivity,
  getInvoices,
  getOverdueInvoices,
  createInvoice,
  recordPayment,
  getLeads,
  getHotLeads,
  createLead,
  getCampaigns,
  getActiveCampaigns,
  createEmailCampaign,
  getTeamMembers,
  createTeamMember,
  logAdminActivity,
  getActivityLog,
  getWorkflows,
  getActiveWorkflows,
  createWorkflow,
  executeWorkflow,
  getIntegrations,
  createIntegration,
  getAdminAlerts,
  createAdminAlert,
  getUnacknowledgedAlertCount,
  getRevenueAnalytics,
  getPipelineMetrics,
  getPlatformConfig
} from '@/lib/admin-overview-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard-stats'
    const days = parseInt(searchParams.get('days') || '30')
    const stage = searchParams.get('stage') as any
    const minValue = searchParams.get('min_value') ? parseFloat(searchParams.get('min_value')!) : undefined
    const minScore = searchParams.get('min_score') ? parseInt(searchParams.get('min_score')!) : undefined
    const includeAll = searchParams.get('include_all') === 'true'

    switch (type) {
      case 'dashboard-stats': {
        const result = await getDashboardStats(user.id)
        return NextResponse.json({ data: result })
      }

      case 'analytics-events': {
        const result = await getAnalyticsEvents(user.id, days)
        return NextResponse.json({ data: result })
      }

      case 'analytics-reports': {
        const result = await getAnalyticsReports(user.id)
        return NextResponse.json({ data: result })
      }

      case 'analytics-goals': {
        const result = await getActiveAnalyticsGoals(user.id)
        return NextResponse.json({ data: result })
      }

      case 'revenue-analytics': {
        const result = await getRevenueAnalytics(user.id, days)
        return NextResponse.json({ data: result })
      }

      case 'pipeline-metrics': {
        const result = await getPipelineMetrics(user.id)
        return NextResponse.json({ data: result })
      }

      case 'deals': {
        if (stage) {
          const result = await getDealsByStage(user.id, stage)
          return NextResponse.json({ data: result })
        }
        const result = await getDeals(user.id)
        return NextResponse.json({ data: result })
      }

      case 'high-value-deals': {
        const result = await getHighValueDeals(user.id, minValue || 10000)
        return NextResponse.json({ data: result })
      }

      case 'contacts': {
        const result = await getContacts(user.id)
        return NextResponse.json({ data: result })
      }

      case 'hot-contacts': {
        const result = await getHotContacts(user.id, minScore)
        return NextResponse.json({ data: result })
      }

      case 'invoices': {
        const result = await getInvoices(user.id)
        return NextResponse.json({ data: result })
      }

      case 'overdue-invoices': {
        const result = await getOverdueInvoices(user.id)
        return NextResponse.json({ data: result })
      }

      case 'leads': {
        const result = await getLeads(user.id)
        return NextResponse.json({ data: result })
      }

      case 'hot-leads': {
        const result = await getHotLeads(user.id, minScore)
        return NextResponse.json({ data: result })
      }

      case 'campaigns': {
        const result = await getCampaigns(user.id)
        return NextResponse.json({ data: result })
      }

      case 'active-campaigns': {
        const result = await getActiveCampaigns(user.id)
        return NextResponse.json({ data: result })
      }

      case 'team-members': {
        const result = await getTeamMembers(user.id)
        return NextResponse.json({ data: result })
      }

      case 'activity-log': {
        const result = await getActivityLog(user.id, days)
        return NextResponse.json({ data: result })
      }

      case 'workflows': {
        const result = await getWorkflows(user.id)
        return NextResponse.json({ data: result })
      }

      case 'active-workflows': {
        const result = await getActiveWorkflows(user.id)
        return NextResponse.json({ data: result })
      }

      case 'integrations': {
        const result = await getIntegrations(user.id)
        return NextResponse.json({ data: result })
      }

      case 'alerts': {
        const result = await getAdminAlerts(user.id, includeAll)
        return NextResponse.json({ data: result })
      }

      case 'alert-count': {
        const result = await getUnacknowledgedAlertCount(user.id)
        return NextResponse.json({ data: { count: result } })
      }

      case 'platform-config': {
        const result = await getPlatformConfig(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Admin Overview data' },
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
    const { action, ...payload } = body

    switch (action) {
      case 'track-event': {
        const result = await trackAnalyticsEvent(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'generate-report': {
        const result = await generateAnalyticsReport(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-goal': {
        const result = await createAnalyticsGoal(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-deal': {
        const result = await createDeal(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-contact': {
        const result = await createContact(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'log-activity': {
        const result = await logActivity(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-invoice': {
        const result = await createInvoice(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'record-payment': {
        const result = await recordPayment(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-lead': {
        const result = await createLead(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-campaign': {
        const result = await createEmailCampaign(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-team-member': {
        const result = await createTeamMember(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'log-admin-activity': {
        const result = await logAdminActivity(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-workflow': {
        const result = await createWorkflow(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'execute-workflow': {
        const result = await executeWorkflow(payload.workflow_id)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-integration': {
        const result = await createIntegration(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-alert': {
        const result = await createAdminAlert(user.id, payload)
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin Overview API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Admin Overview request' },
      { status: 500 }
    )
  }
}
