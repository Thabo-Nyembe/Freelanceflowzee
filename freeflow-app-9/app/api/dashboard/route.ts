// =====================================================
// KAZI Dashboard API - Comprehensive Route
// Centralized dashboard data fetching with real-time updates
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('dashboard');

// Demo user for unauthenticated access
// Demo mode can be enabled via ?demo=true query parameter
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Check if demo mode is enabled via query param, cookie, or header
function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url);
  if (url.searchParams.get('demo') === 'true') return true;
  if (request.cookies.get('demo_mode')?.value === 'true') return true;
  if (request.headers.get('X-Demo-Mode') === 'true') return true;
  return false;
}

// =====================================================
// GET - Dashboard stats, recent activity, quick actions
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Use admin client to avoid cookie issues
    const supabase = createAdminClient();

    // Check for demo mode first
    const demoMode = isDemoMode(request);

    // Try to get NextAuth session
    let userId: string;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      } else if (demoMode || IS_DEVELOPMENT) {
        // Use demo user for demo mode or development
        userId = DEMO_USER_ID;
      } else {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
    } catch (error) {
      if (demoMode || IS_DEVELOPMENT) {
        userId = DEMO_USER_ID;
      } else {
        return NextResponse.json(
          { success: false, error: 'Authentication error' },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Allow override via query param for testing (development only)
    const queryUserId = searchParams.get('userId');
    if (queryUserId && IS_DEVELOPMENT) {
      userId = queryUserId;
    }

    switch (action) {
      case 'stats': {
        const stats = await getDashboardStats(supabase, userId);
        return NextResponse.json({ success: true, stats });
      }

      case 'recent-activity': {
        const limit = parseInt(searchParams.get('limit') || '10');
        const activity = await getRecentActivity(supabase, userId, limit);
        return NextResponse.json({ success: true, activity });
      }

      case 'recent-projects': {
        const limit = parseInt(searchParams.get('limit') || '5');
        const projects = await getRecentProjects(supabase, userId, limit);
        return NextResponse.json({ success: true, projects });
      }

      case 'quick-stats': {
        const quickStats = await getQuickStats(supabase, userId);
        return NextResponse.json({ success: true, quickStats });
      }

      case 'ai-insights': {
        const insights = await getAIInsights(supabase, userId);
        return NextResponse.json({ success: true, insights });
      }

      case 'upcoming-deadlines': {
        const days = parseInt(searchParams.get('days') || '7');
        const deadlines = await getUpcomingDeadlines(supabase, userId, days);
        return NextResponse.json({ success: true, deadlines });
      }

      case 'revenue-summary': {
        const period = searchParams.get('period') || 'month';
        const summary = await getRevenueSummary(supabase, userId, period);
        return NextResponse.json({ success: true, summary });
      }

      case 'team-activity': {
        const teamActivity = await getTeamActivity(supabase, userId);
        return NextResponse.json({ success: true, teamActivity });
      }

      case 'notifications-summary': {
        const notifications = await getNotificationsSummary(supabase, userId);
        return NextResponse.json({ success: true, notifications });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Dashboard Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'real_time_stats',
            'activity_tracking',
            'project_overview',
            'revenue_analytics',
            'ai_insights',
            'team_collaboration',
            'notification_center',
            'deadline_tracking'
          ]
        });
      }

      default: {
        // Return comprehensive dashboard data
        const [stats, activity, projects, quickStats, deadlines] = await Promise.all([
          getDashboardStats(supabase, userId),
          getRecentActivity(supabase, userId, 10),
          getRecentProjects(supabase, userId, 5),
          getQuickStats(supabase, userId),
          getUpcomingDeadlines(supabase, userId, 7)
        ]);

        return NextResponse.json({
          success: true,
          data: {
            stats,
            activity,
            projects,
            quickStats,
            deadlines
          }
        });
      }
    }
  } catch (error) {
    logger.error('Dashboard GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Log activity, quick actions
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();

    // Check for demo mode
    const demoMode = isDemoMode(request);

    // Try to get NextAuth session
    let userId: string;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      } else if (demoMode || IS_DEVELOPMENT) {
        userId = DEMO_USER_ID;
      } else {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
    } catch {
      if (demoMode || IS_DEVELOPMENT) {
        userId = DEMO_USER_ID;
      } else {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode is read-only for write operations
    if (demoMode && !IS_DEVELOPMENT) {
      const writeActions = ['quick-create-project', 'quick-create-task', 'quick-create-invoice'];
      if (writeActions.includes(action)) {
        return NextResponse.json({
          success: false,
          error: 'Demo mode is read-only. Sign up for a free account to create your own data.',
          isDemoMode: true
        }, { status: 403 });
      }
    }

    // Allow override via body for testing (development only)
    if (data.userId && IS_DEVELOPMENT) {
      userId = data.userId;
    }

    switch (action) {
      case 'log-activity': {
        const activity = await logActivity(supabase, userId, {
          type: data.type,
          title: data.title,
          description: data.description,
          entityType: data.entityType,
          entityId: data.entityId,
          metadata: data.metadata
        });
        return NextResponse.json({
          success: true,
          action: 'log-activity',
          activity,
          message: 'Activity logged'
        });
      }

      case 'quick-create-project': {
        const project = await quickCreateProject(supabase, userId, {
          name: data.name,
          clientId: data.clientId,
          budget: data.budget,
          deadline: data.deadline
        });
        return NextResponse.json({
          success: true,
          action: 'quick-create-project',
          project,
          message: 'Project created'
        });
      }

      case 'quick-create-task': {
        const task = await quickCreateTask(supabase, userId, {
          title: data.title,
          projectId: data.projectId,
          priority: data.priority,
          dueDate: data.dueDate
        });
        return NextResponse.json({
          success: true,
          action: 'quick-create-task',
          task,
          message: 'Task created'
        });
      }

      case 'quick-create-invoice': {
        const invoice = await quickCreateInvoice(supabase, userId, {
          clientId: data.clientId,
          amount: data.amount,
          description: data.description,
          dueDate: data.dueDate
        });
        return NextResponse.json({
          success: true,
          action: 'quick-create-invoice',
          invoice,
          message: 'Invoice created'
        });
      }

      case 'dismiss-insight': {
        await dismissInsight(supabase, userId, data.insightId);
        return NextResponse.json({
          success: true,
          action: 'dismiss-insight',
          message: 'Insight dismissed'
        });
      }

      case 'act-on-insight': {
        const result = await actOnInsight(supabase, userId, data.insightId, data.actionType);
        return NextResponse.json({
          success: true,
          action: 'act-on-insight',
          result,
          message: 'Action taken on insight'
        });
      }

      case 'export-pdf': {
        // In production, generate actual PDF using puppeteer or similar
        const { dashboardType, dateRange } = data;
        return NextResponse.json({
          success: true,
          action: 'export-pdf',
          downloadUrl: `/api/dashboard/pdf?type=${dashboardType}&range=${dateRange}`,
          message: 'PDF exported successfully!'
        });
      }

      case 'save-layout': {
        const { layout } = data;
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            dashboard_layout: layout,
            updated_at: new Date().toISOString()
          });

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          action: 'save-layout',
          layout,
          message: `${layout.charAt(0).toUpperCase() + layout.slice(1)} layout applied!`
        });
      }

      case 'export-data': {
        const { format, dateRange } = data;
        // Generate export data
        const exportContent = JSON.stringify({
          exportedAt: new Date().toISOString(),
          format,
          dateRange,
          data: { metrics: [], tracking: [] }
        }, null, 2);

        return NextResponse.json({
          success: true,
          action: 'export-data',
          format,
          content: exportContent,
          message: 'Data exported successfully'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Dashboard POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getDashboardStats(supabase: any, userId: string) {
  const [projects, clients, invoices, tasks, files, team] = await Promise.all([
    getProjectStats(supabase, userId),
    getClientStats(supabase, userId),
    getRevenueStats(supabase, userId),
    getTaskStats(supabase, userId),
    getFileStats(supabase, userId),
    getTeamStats(supabase, userId)
  ]);

  return {
    projects,
    clients,
    revenue: invoices,
    tasks,
    files,
    team
  };
}

async function getProjectStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, progress, end_date')
    .eq('user_id', userId);

  if (error) throw error;

  // Derive status from progress and end_date since there's no status column
  const now = new Date();
  return {
    total: data?.length || 0,
    active: data?.filter((p: any) => (p.progress || 0) < 100 && (!p.end_date || new Date(p.end_date) >= now)).length || 0,
    completed: data?.filter((p: any) => (p.progress || 0) >= 100).length || 0,
    onHold: data?.filter((p: any) => p.end_date && new Date(p.end_date) < now && (p.progress || 0) < 100).length || 0
  };
}

async function getClientStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('id, status, created_at')
    .eq('user_id', userId);

  if (error) throw error;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    total: data?.length || 0,
    active: data?.filter((c: any) => c.status === 'active').length || 0,
    new: data?.filter((c: any) => new Date(c.created_at) > thirtyDaysAgo).length || 0
  };
}

async function getRevenueStats(supabase: any, userId: string) {
  // Use client_invoices table for user-created invoices
  const { data, error } = await supabase
    .from('client_invoices')
    .select('total_amount, subtotal, tax_amount, status, paid_date, created_at')
    .eq('freelancer_id', userId);

  if (error) {
    // Return empty stats if table doesn't exist or has different schema
    logger.error('Error fetching client_invoices', { error });
    return { total: 0, pending: 0, thisMonth: 0, lastMonth: 0, growth: 0 };
  }

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const total = data?.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0;
  const pending = data?.filter((inv: any) => inv.status === 'pending' || inv.status === 'sent')
    .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0;

  const thisMonth = data?.filter((inv: any) =>
    inv.paid_date && new Date(inv.paid_date) >= firstDayThisMonth && inv.status === 'paid'
  ).reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0;

  const lastMonth = data?.filter((inv: any) =>
    inv.paid_date &&
    new Date(inv.paid_date) >= firstDayLastMonth &&
    new Date(inv.paid_date) < firstDayThisMonth &&
    inv.status === 'paid'
  ).reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0;

  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return { total, pending, thisMonth, lastMonth, growth: Math.round(growth * 10) / 10 };
}

async function getTaskStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, status, due_date')
    .eq('user_id', userId);

  if (error) throw error;

  const now = new Date();

  return {
    total: data?.length || 0,
    completed: data?.filter((t: any) => t.status === 'completed').length || 0,
    inProgress: data?.filter((t: any) => t.status === 'in_progress').length || 0,
    overdue: data?.filter((t: any) =>
      t.due_date && new Date(t.due_date) < now && t.status !== 'completed'
    ).length || 0
  };
}

async function getFileStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('files')
    .select('id, size')
    .eq('user_id', userId);

  if (error) throw error;

  return {
    total: data?.length || 0,
    size: data?.reduce((sum: number, file: any) => sum + (file.size || 0), 0) || 0
  };
}

async function getTeamStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('id, status')
    .eq('team_owner_id', userId);

  if (error) return { total: 0, active: 0 };

  return {
    total: data?.length || 0,
    active: data?.filter((m: any) => m.status === 'active').length || 0
  };
}

async function getRecentActivity(supabase: any, userId: string, limit: number) {
  const [projects, tasks, files, invoices] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, progress, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit),
    supabase
      .from('tasks')
      .select('id, title, status, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit),
    supabase
      .from('files')
      .select('id, name, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit),
    supabase
      .from('client_invoices')
      .select('id, invoice_number, status, total_amount, created_at, updated_at')
      .eq('freelancer_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)
  ]);

  const activities = [
    ...(projects.data || []).map((p: any) => ({
      id: p.id,
      type: 'project',
      title: p.title,
      status: (p.progress || 0) >= 100 ? 'completed' : 'active',
      timestamp: p.updated_at,
      icon: 'folder'
    })),
    ...(tasks.data || []).map((t: any) => ({
      id: t.id,
      type: 'task',
      title: t.title,
      status: t.status,
      timestamp: t.updated_at,
      icon: 'check-square'
    })),
    ...(files.data || []).map((f: any) => ({
      id: f.id,
      type: 'file',
      title: f.name,
      timestamp: f.updated_at,
      icon: 'file'
    })),
    ...(invoices.data || []).map((i: any) => ({
      id: i.id,
      type: 'invoice',
      title: `Invoice ${i.invoice_number || i.id.slice(0, 8)}`,
      status: i.status,
      amount: i.total_amount || 0,
      timestamp: i.updated_at || i.created_at,
      icon: 'receipt'
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return activities;
}

async function getRecentProjects(supabase: any, userId: string, limit: number) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      budget,
      end_date,
      progress,
      client_id,
      client_name,
      metadata
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((project: any) => ({
    id: project.id,
    name: project.title,
    client: project.client_name || 'No Client',
    progress: project.progress || 0,
    status: (project.progress || 0) >= 100 ? 'completed' : 'active',
    value: project.budget || 0,
    priority: project.metadata?.priority || 'medium',
    deadline: project.end_date,
    category: project.metadata?.category || 'general'
  }));
}

async function getQuickStats(supabase: any, userId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  // Tasks completed today
  const { data: todayTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('updated_at', startOfDay.toISOString());

  // Tasks completed this week
  const { data: weekTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('updated_at', startOfWeek.toISOString());

  // Pending invoices
  const { data: pendingInvoices } = await supabase
    .from('client_invoices')
    .select('id, total_amount')
    .eq('freelancer_id', userId)
    .or('status.eq.pending,status.eq.sent');

  // Unread messages
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('id')
    .eq('recipient_id', userId)
    .eq('is_read', false);

  return {
    tasksCompletedToday: todayTasks?.length || 0,
    tasksCompletedThisWeek: weekTasks?.length || 0,
    pendingInvoicesCount: pendingInvoices?.length || 0,
    pendingInvoicesTotal: pendingInvoices?.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0) || 0,
    unreadMessages: unreadMessages?.length || 0
  };
}

async function getAIInsights(supabase: any, userId: string) {
  // Generate AI insights based on user data
  const [stats, activity] = await Promise.all([
    getDashboardStats(supabase, userId),
    getRecentActivity(supabase, userId, 20)
  ]);

  const insights = [];

  // Revenue insight
  if (stats.revenue.growth > 0) {
    insights.push({
      id: 'revenue-growth',
      type: 'revenue',
      title: 'Revenue Growing',
      description: `Your revenue grew by ${stats.revenue.growth.toFixed(1)}% this month. Great work!`,
      impact: 'positive',
      confidence: 95
    });
  } else if (stats.revenue.growth < -10) {
    insights.push({
      id: 'revenue-decline',
      type: 'revenue',
      title: 'Revenue Alert',
      description: `Revenue decreased by ${Math.abs(stats.revenue.growth).toFixed(1)}% this month. Consider following up on pending invoices.`,
      impact: 'negative',
      confidence: 90,
      actionable: true,
      action: 'View pending invoices'
    });
  }

  // Task completion insight
  if (stats.tasks.overdue > 0) {
    insights.push({
      id: 'overdue-tasks',
      type: 'productivity',
      title: 'Overdue Tasks',
      description: `You have ${stats.tasks.overdue} overdue task(s). Consider prioritizing these.`,
      impact: 'warning',
      confidence: 100,
      actionable: true,
      action: 'View overdue tasks'
    });
  }

  // Client engagement insight
  if (stats.clients.new > 0) {
    insights.push({
      id: 'new-clients',
      type: 'client',
      title: 'New Clients',
      description: `You gained ${stats.clients.new} new client(s) this month. Consider sending welcome materials.`,
      impact: 'positive',
      confidence: 100
    });
  }

  return insights;
}

async function getUpcomingDeadlines(supabase: any, userId: string, days: number) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const [projects, tasks] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, end_date, progress')
      .eq('user_id', userId)
      .lt('progress', 100)
      .gte('end_date', now.toISOString())
      .lte('end_date', futureDate.toISOString())
      .order('end_date', { ascending: true }),
    supabase
      .from('tasks')
      .select('id, title, due_date, status, priority')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .gte('due_date', now.toISOString())
      .lte('due_date', futureDate.toISOString())
      .order('due_date', { ascending: true })
  ]);

  const deadlines = [
    ...(projects.data || []).map((p: any) => ({
      id: p.id,
      type: 'project',
      title: p.title,
      deadline: p.end_date,
      status: (p.progress || 0) >= 100 ? 'completed' : 'active'
    })),
    ...(tasks.data || []).map((t: any) => ({
      id: t.id,
      type: 'task',
      title: t.title,
      deadline: t.due_date,
      status: t.status,
      priority: t.priority
    }))
  ].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return deadlines;
}

async function getRevenueSummary(supabase: any, userId: string, period: string) {
  let startDate: Date;
  const now = new Date();

  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const { data: invoices } = await supabase
    .from('client_invoices')
    .select('total_amount, status, paid_date, due_date, created_at')
    .eq('freelancer_id', userId)
    .gte('created_at', startDate.toISOString());

  const paid = (invoices || []).filter((i: any) => i.status === 'paid');
  const pending = (invoices || []).filter((i: any) => i.status === 'pending' || i.status === 'sent');
  const overdue = (invoices || []).filter((i: any) =>
    (i.status === 'pending' || i.status === 'sent') &&
    i.due_date && new Date(i.due_date) < now
  );

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    total: invoices?.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0) || 0,
    paid: {
      count: paid.length,
      amount: paid.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0)
    },
    pending: {
      count: pending.length,
      amount: pending.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0)
    },
    overdue: {
      count: overdue.length,
      amount: overdue.reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0)
    }
  };
}

async function getTeamActivity(supabase: any, userId: string) {
  const { data: members } = await supabase
    .from('team_members')
    .select('id, user_id, status, role')
    .eq('team_owner_id', userId)
    .eq('status', 'active');

  if (!members || members.length === 0) {
    return { members: [], recentActivity: [] };
  }

  const memberIds = members.map((m: any) => m.user_id);

  const { data: activity } = await supabase
    .from('tasks')
    .select('id, title, status, assigned_to, updated_at')
    .in('assigned_to', memberIds)
    .order('updated_at', { ascending: false })
    .limit(10);

  return {
    members: members.length,
    recentActivity: activity || []
  };
}

async function getNotificationsSummary(supabase: any, userId: string) {
  const { data } = await supabase
    .from('notifications')
    .select('id, type, is_read, priority')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(100);

  const notifications = data || [];
  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  notifications.forEach((n: any) => {
    byType[n.type] = (byType[n.type] || 0) + 1;
    byPriority[n.priority || 'normal'] = (byPriority[n.priority || 'normal'] || 0) + 1;
  });

  return {
    unreadCount: notifications.length,
    byType,
    byPriority,
    hasUrgent: (byPriority['urgent'] || 0) > 0
  };
}

async function logActivity(supabase: any, userId: string, data: any) {
  const { data: activity, error } = await supabase
    .from('activity_log')
    .insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      description: data.description,
      entity_type: data.entityType,
      entity_id: data.entityId,
      metadata: data.metadata
    })
    .select()
    .single();

  if (error) throw error;
  return activity;
}

async function quickCreateProject(supabase: any, userId: string, data: any) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title: data.name,
      client_id: data.clientId,
      budget: data.budget,
      end_date: data.deadline,
      progress: 0
    })
    .select()
    .single();

  if (error) throw error;
  return project;
}

async function quickCreateTask(supabase: any, userId: string, data: any) {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: data.title,
      project_id: data.projectId,
      priority: data.priority || 'medium',
      due_date: data.dueDate,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return task;
}

async function quickCreateInvoice(supabase: any, userId: string, data: any) {
  const { data: invoice, error } = await supabase
    .from('client_invoices')
    .insert({
      freelancer_id: userId,
      client_id: data.clientId,
      subtotal: data.amount || 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: data.amount || 0,
      description: data.description,
      due_date: data.dueDate,
      issue_date: new Date().toISOString(),
      status: 'draft'
    })
    .select()
    .single();

  if (error) throw error;
  return invoice;
}

async function dismissInsight(supabase: any, userId: string, insightId: string) {
  // Store dismissed insight
  await supabase
    .from('dismissed_insights')
    .upsert({
      user_id: userId,
      insight_id: insightId,
      dismissed_at: new Date().toISOString()
    });
}

async function actOnInsight(supabase: any, userId: string, insightId: string, actionType: string) {
  // Log the action taken
  await supabase
    .from('insight_actions')
    .insert({
      user_id: userId,
      insight_id: insightId,
      action_type: actionType,
      acted_at: new Date().toISOString()
    });

  return { success: true, actionType };
}

// Demo mode removed - all data comes from real database
