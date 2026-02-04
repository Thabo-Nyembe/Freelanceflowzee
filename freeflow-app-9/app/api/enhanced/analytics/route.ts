/**
 * Enhanced Analytics API - FreeFlow A+++ Implementation
 * Comprehensive analytics with predictive insights and real-time metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  calculateChurnRisk,
  detectUpsellOpportunities,
  predictProjectHealth,
  type Client
} from '@/lib/analytics/predictive-engine';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('enhanced-analytics');

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';
    const userId = searchParams.get('userId') || DEMO_USER_ID;
    const timeRange = searchParams.get('timeRange') || 'month';

    switch (action) {
      case 'overview': {
        const overview = await getEnhancedOverview(supabase, userId, timeRange);
        return NextResponse.json({ success: true, data: overview });
      }

      case 'performance': {
        const performance = await getPerformanceMetrics(supabase, userId, timeRange);
        return NextResponse.json({ success: true, data: performance });
      }

      case 'revenue-forecast': {
        const forecast = await getRevenueForecast(supabase, userId);
        return NextResponse.json({ success: true, data: forecast });
      }

      case 'client-health': {
        const clientId = searchParams.get('clientId');
        const health = await getClientHealth(supabase, userId, clientId);
        return NextResponse.json({ success: true, data: health });
      }

      case 'project-health': {
        const projectId = searchParams.get('projectId');
        const health = await getProjectHealthMetrics(supabase, userId, projectId);
        return NextResponse.json({ success: true, data: health });
      }

      case 'churn-risk': {
        const churnData = await getChurnRiskAnalysis(supabase, userId);
        return NextResponse.json({ success: true, data: churnData });
      }

      case 'upsell-opportunities': {
        const opportunities = await getUpsellOpportunities(supabase, userId);
        return NextResponse.json({ success: true, data: opportunities });
      }

      case 'real-time': {
        const realtime = await getRealTimeMetrics(supabase, userId);
        return NextResponse.json({ success: true, data: realtime });
      }

      case 'trends': {
        const trends = await getTrendAnalysis(supabase, userId, timeRange);
        return NextResponse.json({ success: true, data: trends });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Enhanced Analytics Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'performance_metrics',
            'revenue_forecasting',
            'client_health_scoring',
            'project_health_prediction',
            'churn_risk_analysis',
            'upsell_detection',
            'real_time_metrics',
            'trend_analysis'
          ]
        });
      }

      default: {
        // Return comprehensive enhanced analytics
        const [overview, performance, forecast, churn] = await Promise.all([
          getEnhancedOverview(supabase, userId, timeRange),
          getPerformanceMetrics(supabase, userId, timeRange),
          getRevenueForecast(supabase, userId),
          getChurnRiskAnalysis(supabase, userId)
        ]);

        return NextResponse.json({
          success: true,
          data: {
            overview,
            performance,
            forecast,
            churnAnalysis: churn,
            timeRange
          }
        });
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Enhanced Analytics GET error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

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
      case 'record-event': {
        await recordAnalyticsEvent(supabase, user.id, data);
        return NextResponse.json({ success: true, message: 'Event recorded' });
      }

      case 'calculate-health': {
        const health = await calculateProjectHealth(supabase, user.id, data.projectId);
        return NextResponse.json({ success: true, data: health });
      }

      case 'analyze-client': {
        const analysis = await analyzeClientValue(supabase, user.id, data.clientId);
        return NextResponse.json({ success: true, data: analysis });
      }

      case 'generate-forecast': {
        const forecast = await generateCustomForecast(supabase, user.id, data);
        return NextResponse.json({ success: true, data: forecast });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Enhanced Analytics POST error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
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

function getDateRange(timeRange: string): DateRange {
  const now = new Date();
  let start: Date;

  switch (timeRange) {
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

async function getEnhancedOverview(supabase: any, userId: string, timeRange: string) {
  const dateRange = getDateRange(timeRange);

  // Get real data from database
  const [projectsResult, clientsResult, invoicesResult, tasksResult] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', userId),
    supabase.from('clients').select('*').eq('user_id', userId),
    supabase.from('invoices').select('*').eq('user_id', userId),
    supabase.from('tasks').select('*').eq('user_id', userId)
  ]);

  const projects = projectsResult.data || [];
  const clients = clientsResult.data || [];
  const invoices = invoicesResult.data || [];
  const tasks = tasksResult.data || [];

  // Calculate metrics
  const totalRevenue = invoices
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (i.total || 0), 0);

  const periodInvoices = invoices.filter((i: any) =>
    new Date(i.created_at) >= dateRange.start &&
    new Date(i.created_at) <= dateRange.end
  );

  const periodRevenue = periodInvoices
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (i.total || 0), 0);

  const activeProjects = projects.filter((p: any) =>
    ['active', 'in_progress', 'planning'].includes(p.status)
  ).length;

  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return {
    revenue: {
      total: totalRevenue,
      period: periodRevenue,
      growth: calculateGrowthRate(invoices, dateRange),
      pending: invoices
        .filter((i: any) => i.status === 'pending')
        .reduce((sum: number, i: any) => sum + (i.total || 0), 0)
    },
    projects: {
      total: projects.length,
      active: activeProjects,
      completed: projects.filter((p: any) => p.status === 'completed').length,
      onTrack: calculateOnTrackPercentage(projects)
    },
    clients: {
      total: clients.length,
      active: clients.filter((c: any) => c.status === 'active').length,
      newThisMonth: clients.filter((c: any) =>
        new Date(c.created_at) >= dateRange.start
      ).length
    },
    tasks: {
      total: tasks.length,
      completed: completedTasks,
      completionRate: Math.round(completionRate),
      overdue: tasks.filter((t: any) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length
    },
    efficiency: {
      projectCompletionRate: calculateProjectCompletionRate(projects),
      avgProjectDuration: calculateAvgProjectDuration(projects),
      clientRetention: calculateClientRetention(clients)
    }
  };
}

function calculateGrowthRate(invoices: any[], dateRange: DateRange): number {
  const currentPeriod = invoices.filter(i =>
    i.status === 'paid' &&
    new Date(i.created_at) >= dateRange.start &&
    new Date(i.created_at) <= dateRange.end
  );

  const periodDuration = dateRange.end.getTime() - dateRange.start.getTime();
  const previousStart = new Date(dateRange.start.getTime() - periodDuration);
  const previousEnd = new Date(dateRange.start.getTime() - 1);

  const previousPeriod = invoices.filter(i =>
    i.status === 'paid' &&
    new Date(i.created_at) >= previousStart &&
    new Date(i.created_at) <= previousEnd
  );

  const currentTotal = currentPeriod.reduce((sum, i) => sum + (i.total || 0), 0);
  const previousTotal = previousPeriod.reduce((sum, i) => sum + (i.total || 0), 0);

  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
}

function calculateOnTrackPercentage(projects: any[]): number {
  const activeProjects = projects.filter(p =>
    ['active', 'in_progress'].includes(p.status) && p.deadline
  );

  if (activeProjects.length === 0) return 100;

  const onTrack = activeProjects.filter(p => {
    const progress = p.progress || 0;
    const startDate = new Date(p.start_date || p.created_at);
    const deadline = new Date(p.deadline);
    const now = new Date();

    const totalDuration = deadline.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    const expectedProgress = (elapsed / totalDuration) * 100;

    return progress >= expectedProgress - 10; // 10% tolerance
  });

  return Math.round((onTrack.length / activeProjects.length) * 100);
}

function calculateProjectCompletionRate(projects: any[]): number {
  const withDeadlines = projects.filter(p => p.deadline && p.status === 'completed');
  if (withDeadlines.length === 0) return 100;

  const onTime = withDeadlines.filter(p => {
    const completed = p.completed_at ? new Date(p.completed_at) : new Date();
    return completed <= new Date(p.deadline);
  });

  return Math.round((onTime.length / withDeadlines.length) * 100);
}

function calculateAvgProjectDuration(projects: any[]): number {
  const completed = projects.filter(p =>
    p.status === 'completed' && p.start_date && p.completed_at
  );

  if (completed.length === 0) return 0;

  const totalDays = completed.reduce((sum, p) => {
    const days = Math.ceil(
      (new Date(p.completed_at).getTime() - new Date(p.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  return Math.round(totalDays / completed.length);
}

function calculateClientRetention(clients: any[]): number {
  if (clients.length === 0) return 100;
  const active = clients.filter(c => c.status === 'active').length;
  return Math.round((active / clients.length) * 100);
}

async function getPerformanceMetrics(supabase: any, userId: string, timeRange: string) {
  const dateRange = getDateRange(timeRange);

  const [projectsResult, timeEntriesResult, tasksResult] = await Promise.all([
    supabase.from('projects').select('*').eq('user_id', userId),
    supabase.from('time_entries').select('*')
      .eq('user_id', userId)
      .gte('start_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString()),
    supabase.from('tasks').select('*').eq('user_id', userId)
  ]);

  const projects = projectsResult.data || [];
  const timeEntries = timeEntriesResult.data || [];
  const tasks = tasksResult.data || [];

  const totalHours = timeEntries.reduce((sum: number, e: any) =>
    sum + ((e.duration || 0) / 3600), 0
  );

  const billableHours = timeEntries
    .filter((e: any) => e.billable)
    .reduce((sum: number, e: any) => sum + ((e.duration || 0) / 3600), 0);

  const completedTasks = tasks.filter((t: any) =>
    t.completed_at &&
    new Date(t.completed_at) >= dateRange.start &&
    new Date(t.completed_at) <= dateRange.end
  );

  return {
    productivity: {
      totalHours: Math.round(totalHours * 10) / 10,
      billableHours: Math.round(billableHours * 10) / 10,
      utilizationRate: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
      tasksCompleted: completedTasks.length,
      avgTaskTime: calculateAvgTaskTime(completedTasks)
    },
    quality: {
      projectCompletionRate: calculateProjectCompletionRate(projects),
      onTimeDelivery: calculateOnTrackPercentage(projects),
      avgRevisions: calculateAvgRevisions(projects),
      clientSatisfaction: 4.5 // From feedback/ratings when available
    },
    efficiency: {
      revenuePerHour: billableHours > 0 ?
        (await calculateRevenueForPeriod(supabase, userId, dateRange)) / billableHours : 0,
      projectsPerMonth: projects.filter((p: any) =>
        new Date(p.created_at) >= dateRange.start
      ).length,
      avgProjectValue: calculateAvgProjectValue(projects)
    }
  };
}

function calculateAvgTaskTime(tasks: any[]): number {
  const completed = tasks.filter(t => t.completed_at && t.created_at);
  if (completed.length === 0) return 0;

  const totalHours = completed.reduce((sum, t) => {
    const hours = (new Date(t.completed_at).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  return Math.round(totalHours / completed.length);
}

function calculateAvgRevisions(projects: any[]): number {
  const withRevisions = projects.filter(p => typeof p.revision_count === 'number');
  if (withRevisions.length === 0) return 0;
  const total = withRevisions.reduce((sum, p) => sum + (p.revision_count || 0), 0);
  return Math.round((total / withRevisions.length) * 10) / 10;
}

async function calculateRevenueForPeriod(supabase: any, userId: string, dateRange: DateRange): Promise<number> {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, status, paid_at')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('paid_at', dateRange.start.toISOString())
    .lte('paid_at', dateRange.end.toISOString());

  return (invoices || []).reduce((sum: number, i: any) => sum + (i.total || 0), 0);
}

function calculateAvgProjectValue(projects: any[]): number {
  if (projects.length === 0) return 0;
  const total = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  return Math.round(total / projects.length);
}

async function getRevenueForecast(supabase: any, userId: string) {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, created_at, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(24);

  // Group by month
  const monthlyRevenue: Record<string, number> = {};
  (invoices || []).forEach((i: any) => {
    if (i.status === 'paid') {
      const month = i.created_at?.substring(0, 7);
      if (month) {
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (i.total || 0);
      }
    }
  });

  const values = Object.values(monthlyRevenue);
  const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  // Calculate growth rate using linear regression
  let growthRate = 0;
  if (values.length >= 2) {
    const recent = values.slice(0, Math.min(3, values.length));
    const older = values.slice(Math.min(3, values.length));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

    growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) : 0;
  }

  // Generate 6-month forecast
  const forecasts = [];
  for (let i = 1; i <= 6; i++) {
    const forecastDate = new Date();
    forecastDate.setMonth(forecastDate.getMonth() + i);

    const baseAmount = average * (1 + growthRate * (i / 2));
    const optimistic = baseAmount * 1.15;
    const pessimistic = baseAmount * 0.85;

    forecasts.push({
      month: forecastDate.toISOString().substring(0, 7),
      monthName: forecastDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
      predicted: Math.round(baseAmount),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
      confidence: Math.max(50, 90 - (i * 5))
    });
  }

  return {
    historical: Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    forecast: forecasts,
    metrics: {
      monthlyAverage: Math.round(average),
      growthRate: Math.round(growthRate * 100),
      totalProjected: forecasts.reduce((sum, f) => sum + f.predicted, 0)
    }
  };
}

async function getClientHealth(supabase: any, userId: string, clientId: string | null) {
  let clients;

  if (clientId) {
    const { data } = await supabase
      .from('clients')
      .select('*, projects(*), invoices(*)')
      .eq('user_id', userId)
      .eq('id', clientId)
      .single();
    clients = data ? [data] : [];
  } else {
    const { data } = await supabase
      .from('clients')
      .select('*, projects(*), invoices(*)')
      .eq('user_id', userId);
    clients = data || [];
  }

  const healthScores = clients.map((client: any) => {
    const projects = client.projects || [];
    const invoices = client.invoices || [];

    // Calculate health metrics
    const activeProjects = projects.filter((p: any) =>
      ['active', 'in_progress'].includes(p.status)
    ).length;

    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const totalRevenue = invoices
      .filter((i: any) => i.status === 'paid')
      .reduce((sum: number, i: any) => sum + (i.total || 0), 0);

    const latePayments = invoices.filter((i: any) =>
      i.status === 'overdue' || (i.due_date && new Date(i.due_date) < new Date() && i.status === 'pending')
    ).length;

    // Calculate days since last activity
    const lastActivity = getLastActivityDate(client, projects);

    const healthScore = calculateClientHealthScore({
      activeProjects,
      completedProjects,
      totalRevenue,
      latePayments,
      lastActivity
    });

    return {
      clientId: client.id,
      clientName: client.name,
      healthScore,
      healthLevel: healthScore > 80 ? 'excellent' : healthScore > 60 ? 'good' : healthScore > 40 ? 'at-risk' : 'critical',
      metrics: {
        activeProjects,
        completedProjects,
        totalRevenue,
        latePayments,
        daysSinceLastActivity: lastActivity ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : null
      }
    };
  });

  return clientId ? healthScores[0] : healthScores;
}

function getLastActivityDate(client: any, projects: any[]): Date | null {
  const dates: Date[] = [];

  if (client.updated_at) dates.push(new Date(client.updated_at));

  projects.forEach((p: any) => {
    if (p.updated_at) dates.push(new Date(p.updated_at));
    if (p.completed_at) dates.push(new Date(p.completed_at));
  });

  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map(d => d.getTime())));
}

function calculateClientHealthScore(metrics: {
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  latePayments: number;
  lastActivity: Date | null;
}): number {
  let score = 50; // Base score

  // Engagement bonus
  if (metrics.activeProjects > 0) score += 15;
  if (metrics.completedProjects > 0) score += 10;
  if (metrics.completedProjects > 5) score += 10;

  // Revenue bonus
  if (metrics.totalRevenue > 0) score += 10;
  if (metrics.totalRevenue > 10000) score += 5;

  // Late payment penalty
  score -= metrics.latePayments * 10;

  // Inactivity penalty
  if (metrics.lastActivity) {
    const daysSince = Math.floor((Date.now() - metrics.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 30) score -= 10;
    if (daysSince > 60) score -= 15;
    if (daysSince > 90) score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

async function getProjectHealthMetrics(supabase: any, userId: string, projectId: string | null) {
  let projects;

  if (projectId) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('id', projectId)
      .single();
    projects = data ? [data] : [];
  } else {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'in_progress', 'planning']);
    projects = data || [];
  }

  const healthMetrics = projects.map((project: any) => {
    const projectData = {
      startDate: new Date(project.start_date || project.created_at),
      dueDate: new Date(project.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: project.budget || 0,
      spent: project.spent || 0,
      progress: project.progress || 0,
      milestones: project.milestone_count || 5,
      completedMilestones: project.completed_milestones || 0,
      communicationCount: project.communication_count || 0,
      lastUpdate: new Date(project.updated_at || project.created_at),
      teamSize: project.team_size || 1,
      revisionCount: project.revision_count || 0,
      clientResponseTime: project.avg_response_time || 24
    };

    const health = predictProjectHealth(project.id, projectData);

    return {
      projectId: project.id,
      projectName: project.name || project.title,
      ...health
    };
  });

  return projectId ? healthMetrics[0] : healthMetrics;
}

async function getChurnRiskAnalysis(supabase: any, userId: string) {
  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects(*), invoices(*)')
    .eq('user_id', userId)
    .eq('status', 'active');

  const riskAnalysis = (clients || []).map((client: any) => {
    const projects = client.projects || [];
    const invoices = client.invoices || [];

    const clientData: Client = {
      id: client.id,
      name: client.name,
      email: client.email,
      tier: client.tier || 'standard',
      lastActivity: client.updated_at ? new Date(client.updated_at) : undefined,
      communicationCount: client.communication_count || 0,
      projectCount: projects.length,
      completedProjects: projects.filter((p: any) => p.status === 'completed').length,
      totalProjects: projects.length,
      latePayments: invoices.filter((i: any) => i.status === 'overdue').length,
      averageRating: client.average_rating || 4.5,
      contractEnd: client.contract_end ? new Date(client.contract_end) : undefined,
      revenue: invoices
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.total || 0), 0),
      projectsPerMonth: calculateProjectsPerMonth(projects),
      features: {
        aiAccess: client.ai_access || false,
        prioritySupport: client.priority_support || false,
        customBranding: client.custom_branding || false
      },
      requestedFeatures: client.requested_features || []
    };

    const risk = calculateChurnRisk(clientData);

    return {
      clientId: client.id,
      clientName: client.name,
      ...risk
    };
  });

  // Sort by risk score descending
  riskAnalysis.sort((a: any, b: any) => b.score - a.score);

  return {
    clients: riskAnalysis,
    summary: {
      total: riskAnalysis.length,
      highRisk: riskAnalysis.filter((c: any) => c.level === 'high').length,
      mediumRisk: riskAnalysis.filter((c: any) => c.level === 'medium').length,
      lowRisk: riskAnalysis.filter((c: any) => c.level === 'low').length,
      averageScore: riskAnalysis.length > 0 ?
        Math.round(riskAnalysis.reduce((sum: number, c: any) => sum + c.score, 0) / riskAnalysis.length) : 0
    }
  };
}

function calculateProjectsPerMonth(projects: any[]): number {
  if (projects.length === 0) return 0;

  const dates = projects.map(p => new Date(p.created_at));
  const oldest = new Date(Math.min(...dates.map(d => d.getTime())));
  const months = Math.max(1, (Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24 * 30));

  return projects.length / months;
}

async function getUpsellOpportunities(supabase: any, userId: string) {
  const { data: clients } = await supabase
    .from('clients')
    .select('*, projects(*), invoices(*)')
    .eq('user_id', userId)
    .eq('status', 'active');

  const allOpportunities: any[] = [];

  (clients || []).forEach((client: any) => {
    const projects = client.projects || [];
    const invoices = client.invoices || [];

    const clientData: Client = {
      id: client.id,
      name: client.name,
      email: client.email,
      tier: client.tier || 'standard',
      communicationCount: client.communication_count || 0,
      projectCount: projects.length,
      completedProjects: projects.filter((p: any) => p.status === 'completed').length,
      totalProjects: projects.length,
      latePayments: invoices.filter((i: any) => i.status === 'overdue').length,
      averageRating: client.average_rating || 4.5,
      revenue: invoices
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.total || 0), 0),
      projectsPerMonth: calculateProjectsPerMonth(projects),
      features: {
        aiAccess: client.ai_access || false,
        prioritySupport: client.priority_support || false,
        customBranding: client.custom_branding || false
      },
      requestedFeatures: client.requested_features || []
    };

    const opportunities = detectUpsellOpportunities(clientData);

    opportunities.forEach(opp => {
      allOpportunities.push({
        ...opp,
        clientId: client.id,
        clientName: client.name
      });
    });
  });

  // Sort by potential value
  allOpportunities.sort((a, b) => (b.confidence * b.estimatedRevenue) - (a.confidence * a.estimatedRevenue));

  return {
    opportunities: allOpportunities,
    summary: {
      total: allOpportunities.length,
      totalPotentialRevenue: allOpportunities.reduce((sum, o) => sum + o.estimatedRevenue, 0),
      byType: {
        tierUpgrade: allOpportunities.filter(o => o.type === 'tier_upgrade').length,
        featureAddon: allOpportunities.filter(o => o.type === 'feature_addon').length,
        volumeDiscount: allOpportunities.filter(o => o.type === 'volume_discount').length,
        bundledServices: allOpportunities.filter(o => o.type === 'bundled_services').length
      }
    }
  };
}

async function getRealTimeMetrics(supabase: any, userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    { data: todayInvoices },
    { data: activeTasks },
    { data: pendingApprovals },
    { data: todayTimeEntries }
  ] = await Promise.all([
    supabase.from('invoices').select('total, status')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString()),
    supabase.from('tasks').select('*')
      .eq('user_id', userId)
      .eq('status', 'in_progress'),
    supabase.from('projects').select('*')
      .eq('user_id', userId)
      .eq('status', 'pending_approval'),
    supabase.from('time_entries').select('duration')
      .eq('user_id', userId)
      .gte('start_time', today.toISOString())
  ]);

  return {
    today: {
      revenue: (todayInvoices || [])
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.total || 0), 0),
      invoicesSent: (todayInvoices || []).length,
      hoursTracked: (todayTimeEntries || [])
        .reduce((sum: number, e: any) => sum + ((e.duration || 0) / 3600), 0)
    },
    current: {
      activeTasks: (activeTasks || []).length,
      pendingApprovals: (pendingApprovals || []).length
    },
    timestamp: now.toISOString()
  };
}

async function getTrendAnalysis(supabase: any, userId: string, timeRange: string) {
  const months = timeRange === 'year' ? 12 : timeRange === 'quarter' ? 3 : 6;

  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: projects } = await supabase
    .from('projects')
    .select('status, created_at, completed_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Generate monthly data points
  const monthlyData: Record<string, { revenue: number; projects: number; completed: number }> = {};

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = date.toISOString().substring(0, 7);
    monthlyData[key] = { revenue: 0, projects: 0, completed: 0 };
  }

  (invoices || []).forEach((i: any) => {
    const month = i.created_at?.substring(0, 7);
    if (monthlyData[month] && i.status === 'paid') {
      monthlyData[month].revenue += i.total || 0;
    }
  });

  (projects || []).forEach((p: any) => {
    const createdMonth = p.created_at?.substring(0, 7);
    if (monthlyData[createdMonth]) {
      monthlyData[createdMonth].projects += 1;
    }

    if (p.completed_at) {
      const completedMonth = p.completed_at.substring(0, 7);
      if (monthlyData[completedMonth]) {
        monthlyData[completedMonth].completed += 1;
      }
    }
  });

  const trends = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    data: trends,
    analysis: {
      revenueTrend: calculateTrendDirection(trends.map(t => t.revenue)),
      projectsTrend: calculateTrendDirection(trends.map(t => t.projects)),
      completionTrend: calculateTrendDirection(trends.map(t => t.completed))
    }
  };
}

function calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';

  const recent = values.slice(-3);
  const older = values.slice(0, -3);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;

  const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}

async function recordAnalyticsEvent(supabase: any, userId: string, data: any) {
  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: data.eventType,
    event_data: data.eventData,
    metadata: data.metadata,
    created_at: new Date().toISOString()
  });
}

async function calculateProjectHealth(supabase: any, userId: string, projectId: string) {
  return getProjectHealthMetrics(supabase, userId, projectId);
}

async function analyzeClientValue(supabase: any, userId: string, clientId: string) {
  const [health, churn, upsell] = await Promise.all([
    getClientHealth(supabase, userId, clientId),
    getChurnRiskAnalysis(supabase, userId),
    getUpsellOpportunities(supabase, userId)
  ]);

  const clientChurn = (churn as Record<string, unknown>).clients?.find((c: any) => c.clientId === clientId);
  const clientUpsell = (upsell as Record<string, unknown>).opportunities?.filter((o: any) => o.clientId === clientId);

  return {
    health,
    churnRisk: clientChurn,
    upsellOpportunities: clientUpsell,
    lifetimeValue: health?.metrics?.totalRevenue || 0
  };
}

async function generateCustomForecast(supabase: any, userId: string, data: any) {
  const forecast = await getRevenueForecast(supabase, userId);

  // Apply custom parameters if provided
  if (data.growthRate) {
    forecast.forecast = forecast.forecast.map((f: any, i: number) => ({
      ...f,
      predicted: Math.round(f.predicted * (1 + (data.growthRate / 100) * (i + 1))),
      optimistic: Math.round(f.optimistic * (1 + (data.growthRate / 100) * (i + 1))),
      pessimistic: Math.round(f.pessimistic * (1 + (data.growthRate / 100) * (i + 1)))
    }));
  }

  return forecast;
}
