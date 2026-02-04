// =====================================================
// KAZI Analytics API - Comprehensive Route
// Full analytics with revenue, projects, clients, performance
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('analytics-comprehensive');

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// =====================================================
// GET - Fetch analytics data
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Use provided userId or demo user for public access
    const userId = searchParams.get('userId') || DEMO_USER_ID;

    // Calculate date range
    const dateRange = getDateRange(period, startDate, endDate);

    switch (action) {
      case 'overview': {
        const overview = await getAnalyticsOverview(supabase, userId, dateRange);
        return NextResponse.json({ success: true, overview });
      }

      case 'revenue': {
        const revenue = await getRevenueAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, revenue });
      }

      case 'projects': {
        const projects = await getProjectAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, projects });
      }

      case 'clients': {
        const clients = await getClientAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, clients });
      }

      case 'tasks': {
        const tasks = await getTaskAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, tasks });
      }

      case 'productivity': {
        const productivity = await getProductivityAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, productivity });
      }

      case 'time-tracking': {
        const timeTracking = await getTimeTrackingAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, timeTracking });
      }

      case 'team': {
        const team = await getTeamAnalytics(supabase, userId, dateRange);
        return NextResponse.json({ success: true, team });
      }

      case 'trends': {
        const granularity = searchParams.get('granularity') || 'day';
        const trends = await getTrendData(supabase, userId, dateRange, granularity);
        return NextResponse.json({ success: true, trends });
      }

      case 'comparisons': {
        const comparisons = await getComparisonData(supabase, userId, dateRange);
        return NextResponse.json({ success: true, comparisons });
      }

      case 'forecasts': {
        const forecasts = await getForecasts(supabase, userId);
        return NextResponse.json({ success: true, forecasts });
      }

      case 'top-performers': {
        const topPerformers = await getTopPerformers(supabase, userId, dateRange);
        return NextResponse.json({ success: true, topPerformers });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Analytics Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'revenue_analytics',
            'project_metrics',
            'client_insights',
            'task_analytics',
            'productivity_tracking',
            'time_tracking',
            'team_performance',
            'trend_analysis',
            'forecasting',
            'comparison_reports'
          ]
        });
      }

      default: {
        // Return comprehensive analytics
        const [overview, revenue, projects, clients, productivity] = await Promise.all([
          getAnalyticsOverview(supabase, userId, dateRange),
          getRevenueAnalytics(supabase, userId, dateRange),
          getProjectAnalytics(supabase, userId, dateRange),
          getClientAnalytics(supabase, userId, dateRange),
          getProductivityAnalytics(supabase, userId, dateRange)
        ]);

        return NextResponse.json({
          success: true,
          analytics: {
            overview,
            revenue,
            projects,
            clients,
            productivity,
            period,
            dateRange
          }
        });
      }
    }
  } catch (error) {
    logger.error('Analytics GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Generate reports, export data
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'generate-report': {
        const report = await generateReport(supabase, user.id, {
          type: data.type,
          period: data.period,
          startDate: data.startDate,
          endDate: data.endDate,
          format: data.format,
          includeCharts: data.includeCharts
        });
        return NextResponse.json({
          success: true,
          action: 'generate-report',
          report,
          message: 'Report generated'
        });
      }

      case 'schedule-report': {
        const schedule = await scheduleReport(supabase, user.id, {
          type: data.type,
          frequency: data.frequency,
          recipients: data.recipients,
          format: data.format
        });
        return NextResponse.json({
          success: true,
          action: 'schedule-report',
          schedule,
          message: 'Report scheduled'
        });
      }

      case 'export-data': {
        const exportJob = await exportAnalyticsData(supabase, user.id, {
          dataTypes: data.dataTypes,
          period: data.period,
          format: data.format
        });
        return NextResponse.json({
          success: true,
          action: 'export-data',
          exportJob,
          message: 'Export job started'
        });
      }

      case 'create-goal': {
        const goal = await createGoal(supabase, user.id, {
          type: data.type,
          target: data.target,
          period: data.period,
          description: data.description
        });
        return NextResponse.json({
          success: true,
          action: 'create-goal',
          goal,
          message: 'Goal created'
        });
      }

      case 'track-event': {
        await trackAnalyticsEvent(supabase, user.id, {
          eventType: data.eventType,
          eventData: data.eventData,
          metadata: data.metadata
        });
        return NextResponse.json({
          success: true,
          action: 'track-event',
          message: 'Event tracked'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Analytics POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

interface DateRange {
  start: Date;
  end: Date;
}

function getDateRange(period: string, startDate?: string | null, endDate?: string | null): DateRange {
  if (startDate && endDate) {
    return {
      start: new Date(startDate),
      end: new Date(endDate)
    };
  }

  const now = new Date();
  let start: Date;

  switch (period) {
    case 'day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end: now };
}

async function getAnalyticsOverview(supabase: any, userId: string, dateRange: DateRange) {
  const [projects, clients, revenue, tasks] = await Promise.all([
    getProjectStats(supabase, userId, dateRange),
    getClientStats(supabase, userId, dateRange),
    getRevenueStats(supabase, userId, dateRange),
    getTaskStats(supabase, userId, dateRange)
  ]);

  return {
    projects,
    clients,
    revenue,
    tasks,
    period: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString()
    }
  };
}

async function getProjectStats(supabase: any, userId: string, dateRange: DateRange) {
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status, budget, created_at')
    .eq('user_id', userId)
    .gte('created_at', dateRange.start.toISOString())
    .lte('created_at', dateRange.end.toISOString());

  const all = projects || [];

  return {
    total: all.length,
    active: all.filter((p: any) => p.status === 'active').length,
    completed: all.filter((p: any) => p.status === 'completed').length,
    totalValue: all.reduce((sum: number, p: any) => sum + (p.budget || 0), 0)
  };
}

async function getClientStats(supabase: any, userId: string, dateRange: DateRange) {
  const { data: clients } = await supabase
    .from('clients')
    .select('id, status, created_at')
    .eq('user_id', userId);

  const all = clients || [];
  const newInPeriod = all.filter((c: any) =>
    new Date(c.created_at) >= dateRange.start &&
    new Date(c.created_at) <= dateRange.end
  );

  return {
    total: all.length,
    active: all.filter((c: any) => c.status === 'active').length,
    newInPeriod: newInPeriod.length
  };
}

async function getRevenueStats(supabase: any, userId: string, dateRange: DateRange) {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, status, created_at, paid_at')
    .eq('user_id', userId);

  const all = invoices || [];

  const inPeriod = all.filter((i: any) =>
    new Date(i.created_at) >= dateRange.start &&
    new Date(i.created_at) <= dateRange.end
  );

  const paidInPeriod = all.filter((i: any) =>
    i.paid_at &&
    new Date(i.paid_at) >= dateRange.start &&
    new Date(i.paid_at) <= dateRange.end
  );

  return {
    totalInvoiced: inPeriod.reduce((sum: number, i: any) => sum + (i.total || 0), 0),
    totalPaid: paidInPeriod.reduce((sum: number, i: any) => sum + (i.total || 0), 0),
    pending: all.filter((i: any) => i.status === 'pending').reduce((sum: number, i: any) => sum + (i.total || 0), 0),
    invoiceCount: inPeriod.length,
    paidCount: paidInPeriod.length
  };
}

async function getTaskStats(supabase: any, userId: string, dateRange: DateRange) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, status, created_at, completed_at')
    .eq('user_id', userId);

  const all = tasks || [];

  const createdInPeriod = all.filter((t: any) =>
    new Date(t.created_at) >= dateRange.start &&
    new Date(t.created_at) <= dateRange.end
  );

  const completedInPeriod = all.filter((t: any) =>
    t.completed_at &&
    new Date(t.completed_at) >= dateRange.start &&
    new Date(t.completed_at) <= dateRange.end
  );

  return {
    total: all.length,
    created: createdInPeriod.length,
    completed: completedInPeriod.length,
    completionRate: createdInPeriod.length > 0
      ? Math.round((completedInPeriod.length / createdInPeriod.length) * 100)
      : 0
  };
}

async function getRevenueAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const all = invoices || [];

  // Group by month
  const byMonth: Record<string, { invoiced: number; paid: number; count: number }> = {};

  all.forEach((invoice: any) => {
    const date = new Date(invoice.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { invoiced: 0, paid: 0, count: 0 };
    }

    byMonth[monthKey].invoiced += invoice.total || 0;
    byMonth[monthKey].count += 1;

    if (invoice.status === 'paid') {
      byMonth[monthKey].paid += invoice.total || 0;
    }
  });

  // Group by client
  const byClient: Record<string, { total: number; count: number; clientId: string }> = {};

  all.forEach((invoice: any) => {
    const clientId = invoice.client_id || 'unknown';
    if (!byClient[clientId]) {
      byClient[clientId] = { total: 0, count: 0, clientId };
    }
    byClient[clientId].total += invoice.total || 0;
    byClient[clientId].count += 1;
  });

  const topClients = Object.values(byClient)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    summary: getRevenueStats(supabase, userId, dateRange),
    byMonth: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
    topClients,
    averageInvoiceValue: all.length > 0
      ? all.reduce((sum: number, i: any) => sum + (i.total || 0), 0) / all.length
      : 0
  };
}

async function getProjectAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const all = projects || [];

  // Status distribution
  const byStatus: Record<string, number> = {};
  all.forEach((p: any) => {
    byStatus[p.status || 'unknown'] = (byStatus[p.status || 'unknown'] || 0) + 1;
  });

  // Category distribution
  const byCategory: Record<string, number> = {};
  all.forEach((p: any) => {
    byCategory[p.category || 'uncategorized'] = (byCategory[p.category || 'uncategorized'] || 0) + 1;
  });

  // Average completion time for completed projects
  const completed = all.filter((p: any) => p.status === 'completed' && p.started_at && p.completed_at);
  const avgCompletionDays = completed.length > 0
    ? completed.reduce((sum: number, p: any) => {
        const days = (new Date(p.completed_at).getTime() - new Date(p.started_at).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / completed.length
    : 0;

  return {
    total: all.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
    averageCompletionDays: Math.round(avgCompletionDays),
    totalBudget: all.reduce((sum: number, p: any) => sum + (p.budget || 0), 0),
    onTimeRate: calculateOnTimeRate(all)
  };
}

function calculateOnTimeRate(projects: any[]): number {
  const withDeadlines = projects.filter(p => p.deadline && p.status === 'completed');
  if (withDeadlines.length === 0) return 100;

  const onTime = withDeadlines.filter(p => {
    const completed = p.completed_at ? new Date(p.completed_at) : new Date();
    return completed <= new Date(p.deadline);
  });

  return Math.round((onTime.length / withDeadlines.length) * 100);
}

async function getClientAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const [{ data: clients }, { data: invoices }, { data: projects }] = await Promise.all([
    supabase.from('clients').select('*').eq('user_id', userId),
    supabase.from('invoices').select('client_id, total, status').eq('user_id', userId),
    supabase.from('projects').select('client_id, status, budget').eq('user_id', userId)
  ]);

  const clientMetrics = (clients || []).map((client: any) => {
    const clientInvoices = (invoices || []).filter((i: any) => i.client_id === client.id);
    const clientProjects = (projects || []).filter((p: any) => p.client_id === client.id);

    return {
      id: client.id,
      name: client.name,
      totalRevenue: clientInvoices.reduce((sum: number, i: any) => sum + (i.total || 0), 0),
      projectCount: clientProjects.length,
      activeProjects: clientProjects.filter((p: any) => p.status === 'active').length,
      invoiceCount: clientInvoices.length,
      status: client.status
    };
  });

  // Sort by revenue
  clientMetrics.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

  return {
    total: clients?.length || 0,
    active: clients?.filter((c: any) => c.status === 'active').length || 0,
    topClients: clientMetrics.slice(0, 5),
    averageLifetimeValue: clientMetrics.length > 0
      ? clientMetrics.reduce((sum: number, c: any) => sum + c.totalRevenue, 0) / clientMetrics.length
      : 0,
    retentionRate: calculateRetentionRate(clients || [])
  };
}

function calculateRetentionRate(clients: any[]): number {
  // Simple retention: active clients / total clients
  if (clients.length === 0) return 100;
  const active = clients.filter(c => c.status === 'active').length;
  return Math.round((active / clients.length) * 100);
}

async function getTaskAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const all = tasks || [];

  // Status distribution
  const byStatus: Record<string, number> = {};
  all.forEach((t: any) => {
    byStatus[t.status || 'pending'] = (byStatus[t.status || 'pending'] || 0) + 1;
  });

  // Priority distribution
  const byPriority: Record<string, number> = {};
  all.forEach((t: any) => {
    byPriority[t.priority || 'medium'] = (byPriority[t.priority || 'medium'] || 0) + 1;
  });

  // Completion trends (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const completed = all.filter((t: any) =>
      t.completed_at && t.completed_at.startsWith(dateStr)
    ).length;

    last7Days.push({ date: dateStr, completed });
  }

  return {
    total: all.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byPriority: Object.entries(byPriority).map(([priority, count]) => ({ priority, count })),
    completionTrend: last7Days,
    averageTimeToComplete: calculateAverageTaskTime(all)
  };
}

function calculateAverageTaskTime(tasks: any[]): number {
  const completed = tasks.filter(t => t.completed_at && t.created_at);
  if (completed.length === 0) return 0;

  const totalHours = completed.reduce((sum, t) => {
    const hours = (new Date(t.completed_at).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  return Math.round(totalHours / completed.length);
}

async function getProductivityAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const [tasks, timeEntries] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId),
    supabase.from('time_entries').select('*').eq('user_id', userId)
      .gte('start_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString())
  ]);

  const allTasks = tasks.data || [];
  const allTime = timeEntries.data || [];

  // Calculate productivity score
  const completedInPeriod = allTasks.filter((t: any) =>
    t.completed_at &&
    new Date(t.completed_at) >= dateRange.start &&
    new Date(t.completed_at) <= dateRange.end
  ).length;

  const totalHours = allTime.reduce((sum: number, t: any) => sum + ((t.duration || 0) / 3600), 0);
  const billableHours = allTime.filter((t: any) => t.billable).reduce((sum: number, t: any) => sum + ((t.duration || 0) / 3600), 0);

  return {
    tasksCompleted: completedInPeriod,
    totalHours: Math.round(totalHours * 10) / 10,
    billableHours: Math.round(billableHours * 10) / 10,
    billableRate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
    productivityScore: calculateProductivityScore(completedInPeriod, totalHours),
    focusTime: calculateFocusTime(allTime)
  };
}

function calculateProductivityScore(tasksCompleted: number, hoursWorked: number): number {
  if (hoursWorked === 0) return 0;
  // Simple formula: tasks per hour * 10, capped at 100
  const score = (tasksCompleted / hoursWorked) * 10;
  return Math.min(Math.round(score * 10), 100);
}

function calculateFocusTime(timeEntries: any[]): number {
  // Sessions longer than 25 minutes
  const focusSessions = timeEntries.filter(t => (t.duration || 0) >= 1500);
  return focusSessions.reduce((sum, t) => sum + ((t.duration || 0) / 3600), 0);
}

async function getTimeTrackingAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const { data: entries } = await supabase
    .from('time_entries')
    .select('*, projects(name)')
    .eq('user_id', userId)
    .gte('start_time', dateRange.start.toISOString())
    .lte('start_time', dateRange.end.toISOString())
    .order('start_time', { ascending: false });

  const all = entries || [];

  // Group by project
  const byProject: Record<string, { hours: number; projectName: string }> = {};
  all.forEach((entry: any) => {
    const projectId = entry.project_id || 'no-project';
    const projectName = entry.projects?.name || 'No Project';

    if (!byProject[projectId]) {
      byProject[projectId] = { hours: 0, projectName };
    }
    byProject[projectId].hours += (entry.duration || 0) / 3600;
  });

  // Group by day
  const byDay: Record<string, number> = {};
  all.forEach((entry: any) => {
    const day = new Date(entry.start_time).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + ((entry.duration || 0) / 3600);
  });

  return {
    totalHours: all.reduce((sum: number, e: any) => sum + ((e.duration || 0) / 3600), 0),
    entriesCount: all.length,
    byProject: Object.entries(byProject)
      .map(([projectId, data]) => ({ projectId, ...data }))
      .sort((a, b) => b.hours - a.hours),
    byDay: Object.entries(byDay).map(([date, hours]) => ({ date, hours })),
    averageSessionLength: all.length > 0
      ? all.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / all.length / 60
      : 0 // in minutes
  };
}

async function getTeamAnalytics(supabase: any, userId: string, dateRange: DateRange) {
  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_owner_id', userId);

  if (!members || members.length === 0) {
    return {
      teamSize: 0,
      members: [],
      teamProductivity: 0
    };
  }

  const memberIds = members.map((m: any) => m.user_id);

  const { data: tasks } = await supabase
    .from('tasks')
    .select('assigned_to, status, completed_at')
    .in('assigned_to', memberIds);

  // Calculate per-member stats
  const memberStats = members.map((member: any) => {
    const memberTasks = (tasks || []).filter((t: any) => t.assigned_to === member.user_id);
    const completed = memberTasks.filter((t: any) => t.status === 'completed');

    return {
      id: member.id,
      userId: member.user_id,
      role: member.role,
      tasksAssigned: memberTasks.length,
      tasksCompleted: completed.length,
      completionRate: memberTasks.length > 0
        ? Math.round((completed.length / memberTasks.length) * 100)
        : 0
    };
  });

  return {
    teamSize: members.length,
    members: memberStats,
    teamProductivity: memberStats.length > 0
      ? Math.round(memberStats.reduce((sum, m) => sum + m.completionRate, 0) / memberStats.length)
      : 0
  };
}

async function getTrendData(supabase: any, userId: string, dateRange: DateRange, granularity: string) {
  // Generate date points based on granularity
  const points: string[] = [];
  const current = new Date(dateRange.start);

  while (current <= dateRange.end) {
    points.push(current.toISOString().split('T')[0]);

    switch (granularity) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  const [{ data: tasks }, { data: invoices }] = await Promise.all([
    supabase.from('tasks').select('status, created_at, completed_at').eq('user_id', userId),
    supabase.from('invoices').select('total, status, created_at').eq('user_id', userId)
  ]);

  return {
    labels: points,
    datasets: {
      tasksCreated: points.map(date => (tasks || []).filter((t: any) => t.created_at?.startsWith(date)).length),
      tasksCompleted: points.map(date => (tasks || []).filter((t: any) => t.completed_at?.startsWith(date)).length),
      revenue: points.map(date => (invoices || [])
        .filter((i: any) => i.created_at?.startsWith(date) && i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.total || 0), 0))
    }
  };
}

async function getComparisonData(supabase: any, userId: string, currentRange: DateRange) {
  // Calculate previous period
  const duration = currentRange.end.getTime() - currentRange.start.getTime();
  const previousStart = new Date(currentRange.start.getTime() - duration);
  const previousEnd = new Date(currentRange.start.getTime() - 1);

  const [current, previous] = await Promise.all([
    getAnalyticsOverview(supabase, userId, currentRange),
    getAnalyticsOverview(supabase, userId, { start: previousStart, end: previousEnd })
  ]);

  return {
    current,
    previous,
    changes: {
      revenue: calculateChange(current.revenue.totalPaid, previous.revenue.totalPaid),
      projects: calculateChange(current.projects.total, previous.projects.total),
      clients: calculateChange(current.clients.total, previous.clients.total),
      tasks: calculateChange(current.tasks.completed, previous.tasks.completed)
    }
  };
}

function calculateChange(current: number, previous: number): { value: number; percentage: number } {
  const change = current - previous;
  const percentage = previous > 0 ? Math.round((change / previous) * 100) : 0;
  return { value: change, percentage };
}

async function getForecasts(supabase: any, userId: string) {
  // Simple forecasting based on historical data
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, created_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(12);

  const monthlyRevenue = (invoices || []).reduce((acc: Record<string, number>, i: any) => {
    const month = i.created_at?.substring(0, 7);
    if (month) {
      acc[month] = (acc[month] || 0) + (i.total || 0);
    }
    return acc;
  }, {});

  const values = Object.values(monthlyRevenue);
  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  // Simple growth rate
  const growthRate = values.length >= 2
    ? ((values[0] - values[values.length - 1]) / values[values.length - 1]) / values.length
    : 0;

  const forecastMonths = 3;
  const forecasts = [];

  for (let i = 1; i <= forecastMonths; i++) {
    const forecastDate = new Date();
    forecastDate.setMonth(forecastDate.getMonth() + i);

    forecasts.push({
      month: forecastDate.toISOString().substring(0, 7),
      predictedRevenue: Math.round(average * (1 + growthRate * i)),
      confidence: Math.max(50, 90 - (i * 10))
    });
  }

  return {
    monthlyAverage: Math.round(average),
    growthRate: Math.round(growthRate * 100),
    forecasts
  };
}

async function getTopPerformers(supabase: any, userId: string, dateRange: DateRange) {
  // Top clients by revenue
  const { data: invoices } = await supabase
    .from('invoices')
    .select('client_id, total, clients(name)')
    .eq('user_id', userId)
    .eq('status', 'paid');

  const clientRevenue: Record<string, { name: string; total: number }> = {};
  (invoices || []).forEach((i: any) => {
    const clientId = i.client_id || 'unknown';
    if (!clientRevenue[clientId]) {
      clientRevenue[clientId] = { name: i.clients?.name || 'Unknown', total: 0 };
    }
    clientRevenue[clientId].total += i.total || 0;
  });

  const topClients = Object.entries(clientRevenue)
    .map(([id, data]) => ({ clientId: id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Top projects by value
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, budget, status')
    .eq('user_id', userId)
    .order('budget', { ascending: false })
    .limit(5);

  return {
    topClients,
    topProjects: projects || []
  };
}

async function generateReport(supabase: any, userId: string, options: any) {
  // Create report job
  const { data, error } = await supabase
    .from('report_jobs')
    .insert({
      user_id: userId,
      type: options.type,
      period: options.period,
      start_date: options.startDate,
      end_date: options.endDate,
      format: options.format || 'pdf',
      include_charts: options.includeCharts ?? true,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function scheduleReport(supabase: any, userId: string, options: any) {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert({
      user_id: userId,
      type: options.type,
      frequency: options.frequency,
      recipients: options.recipients,
      format: options.format || 'pdf',
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function exportAnalyticsData(supabase: any, userId: string, options: any) {
  const { data, error } = await supabase
    .from('export_jobs')
    .insert({
      user_id: userId,
      data_types: options.dataTypes,
      period: options.period,
      format: options.format || 'csv',
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function createGoal(supabase: any, userId: string, options: any) {
  const { data, error } = await supabase
    .from('analytics_goals')
    .insert({
      user_id: userId,
      type: options.type,
      target: options.target,
      period: options.period,
      description: options.description,
      current_value: 0,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function trackAnalyticsEvent(supabase: any, userId: string, event: any) {
  await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_type: event.eventType,
      event_data: event.eventData,
      metadata: event.metadata
    });
}

// Demo mode removed - all data comes from real database
