/**
 * Enhanced Projects API - FreeFlow A+++ Implementation
 * Comprehensive project analytics and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { predictProjectHealth } from '@/lib/analytics/predictive-engine';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('enhanced-projects');

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const userId = searchParams.get('userId') || DEMO_USER_ID;
    const projectId = searchParams.get('projectId');

    switch (action) {
      case 'list': {
        const projects = await getProjectsList(supabase, userId, searchParams);
        return NextResponse.json({ success: true, data: projects });
      }

      case 'detail': {
        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }
        const project = await getProjectDetail(supabase, userId, projectId);
        return NextResponse.json({ success: true, data: project });
      }

      case 'stats': {
        const stats = await getProjectsStats(supabase, userId);
        return NextResponse.json({ success: true, data: stats });
      }

      case 'health': {
        const health = await getProjectsHealth(supabase, userId, projectId);
        return NextResponse.json({ success: true, data: health });
      }

      case 'timeline': {
        const timeline = await getProjectTimeline(supabase, userId, projectId);
        return NextResponse.json({ success: true, data: timeline });
      }

      case 'milestones': {
        const milestones = await getProjectMilestones(supabase, userId, projectId);
        return NextResponse.json({ success: true, data: milestones });
      }

      case 'tasks': {
        const tasks = await getProjectTasks(supabase, userId, projectId);
        return NextResponse.json({ success: true, data: tasks });
      }

      case 'analytics': {
        const analytics = await getProjectAnalytics(supabase, userId);
        return NextResponse.json({ success: true, data: analytics });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Enhanced Projects Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'project_listing',
            'project_detail',
            'project_stats',
            'health_prediction',
            'timeline_management',
            'milestone_tracking',
            'task_management',
            'project_analytics'
          ]
        });
      }

      default: {
        const [projects, stats] = await Promise.all([
          getProjectsList(supabase, userId, searchParams),
          getProjectsStats(supabase, userId)
        ]);

        return NextResponse.json({
          success: true,
          data: { projects, stats }
        });
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Enhanced Projects GET error', { error: errorMessage });
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
      case 'create': {
        const result = await createProject(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'update': {
        const result = await updateProject(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'update-status': {
        const result = await updateProjectStatus(supabase, user.id, data.projectId, data.status);
        return NextResponse.json({ success: true, data: result });
      }

      case 'add-milestone': {
        const result = await addMilestone(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'update-milestone': {
        const result = await updateMilestone(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'add-task': {
        const result = await addTask(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'track-time': {
        const result = await trackProjectTime(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'archive': {
        const result = await archiveProject(supabase, user.id, data.projectId);
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Enhanced Projects POST error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getProjectsList(supabase: any, userId: string, searchParams: URLSearchParams) {
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;

  let query = supabase
    .from('projects')
    .select('*, client:clients(id, name, email)', { count: 'exact' })
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  if (category) {
    query = query.eq('category', category);
  }

  query = query.order(sortBy, { ascending: sortOrder })
    .range(offset, offset + limit - 1);

  const { data: projects, count, error } = await query;

  if (error) throw error;

  return {
    projects: (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name || p.title,
      description: p.description,
      status: p.status,
      category: p.category,
      budget: p.budget,
      spent: p.spent || 0,
      progress: p.progress || 0,
      client: p.client,
      startDate: p.start_date,
      deadline: p.deadline,
      createdAt: p.created_at
    })),
    total: count || 0,
    limit,
    offset
  };
}

async function getProjectDetail(supabase: any, userId: string, projectId: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      tasks(*),
      milestones(*),
      time_entries(*)
    `)
    .eq('user_id', userId)
    .eq('id', projectId)
    .single();

  if (error) throw error;

  if (!project) {
    throw new Error('Project not found');
  }

  const tasks = project.tasks || [];
  const milestones = project.milestones || [];
  const timeEntries = project.time_entries || [];

  const totalHours = timeEntries.reduce((sum: number, e: any) =>
    sum + ((e.duration || 0) / 3600), 0
  );

  return {
    id: project.id,
    name: project.name || project.title,
    description: project.description,
    status: project.status,
    category: project.category,
    budget: project.budget,
    spent: project.spent || 0,
    progress: project.progress || 0,
    client: project.client,
    startDate: project.start_date,
    deadline: project.deadline,
    completedAt: project.completed_at,
    createdAt: project.created_at,
    stats: {
      tasksTotal: tasks.length,
      tasksCompleted: tasks.filter((t: any) => t.status === 'completed').length,
      milestonesTotal: milestones.length,
      milestonesCompleted: milestones.filter((m: any) => m.status === 'completed').length,
      hoursTracked: Math.round(totalHours * 10) / 10
    },
    tasks: tasks.slice(0, 10),
    milestones,
    metadata: project.metadata || {}
  };
}

async function getProjectsStats(supabase: any, userId: string) {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('status, budget, progress, deadline, completed_at, created_at')
    .eq('user_id', userId);

  if (error) throw error;

  const all = projects || [];

  // Status breakdown
  const byStatus: Record<string, number> = {};
  all.forEach((p: any) => {
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
  });

  // Active projects
  const active = all.filter((p: any) =>
    ['active', 'in_progress', 'planning'].includes(p.status)
  );

  // Completed this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const completedThisMonth = all.filter((p: any) =>
    p.status === 'completed' &&
    p.completed_at &&
    new Date(p.completed_at) >= thisMonth
  );

  // On-time rate
  const completedWithDeadlines = all.filter((p: any) =>
    p.status === 'completed' && p.deadline && p.completed_at
  );
  const onTime = completedWithDeadlines.filter((p: any) =>
    new Date(p.completed_at) <= new Date(p.deadline)
  );

  // Average progress of active projects
  const avgProgress = active.length > 0
    ? active.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / active.length
    : 0;

  // Total budget
  const totalBudget = all.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

  return {
    total: all.length,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    active: active.length,
    completedThisMonth: completedThisMonth.length,
    avgProgress: Math.round(avgProgress),
    onTimeRate: completedWithDeadlines.length > 0
      ? Math.round((onTime.length / completedWithDeadlines.length) * 100)
      : 100,
    totalBudget,
    upcomingDeadlines: all.filter((p: any) => {
      if (!p.deadline || p.status === 'completed') return false;
      const deadline = new Date(p.deadline);
      const now = new Date();
      const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7 && daysUntil > 0;
    }).length
  };
}

async function getProjectsHealth(supabase: any, userId: string, projectId: string | null) {
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

  if (projectId) {
    return healthMetrics[0];
  }

  // Summary for all projects
  return {
    projects: healthMetrics,
    summary: {
      total: healthMetrics.length,
      excellent: healthMetrics.filter(p => p.overallHealth === 'excellent').length,
      good: healthMetrics.filter(p => p.overallHealth === 'good').length,
      atRisk: healthMetrics.filter(p => p.overallHealth === 'at-risk').length,
      critical: healthMetrics.filter(p => p.overallHealth === 'critical').length,
      avgScore: healthMetrics.length > 0
        ? Math.round(healthMetrics.reduce((sum, p) => sum + p.healthScore, 0) / healthMetrics.length)
        : 0
    }
  };
}

async function getProjectTimeline(supabase: any, userId: string, projectId: string | null) {
  if (!projectId) {
    // Return timeline for all active projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, title, start_date, deadline, status, progress')
      .eq('user_id', userId)
      .in('status', ['active', 'in_progress', 'planning'])
      .order('deadline', { ascending: true });

    return {
      projects: (projects || []).map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        startDate: p.start_date,
        endDate: p.deadline,
        progress: p.progress || 0,
        status: p.status
      }))
    };
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*, milestones(*)')
    .eq('user_id', userId)
    .eq('id', projectId)
    .single();

  if (!project) {
    throw new Error('Project not found');
  }

  return {
    project: {
      id: project.id,
      name: project.name || project.title,
      startDate: project.start_date,
      endDate: project.deadline,
      progress: project.progress || 0
    },
    milestones: (project.milestones || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      dueDate: m.due_date,
      status: m.status,
      completedAt: m.completed_at
    }))
  };
}

async function getProjectMilestones(supabase: any, userId: string, projectId: string | null) {
  if (!projectId) {
    // Return upcoming milestones across all projects
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*, project:projects(id, name, title)')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(10);

    return (milestones || []).filter((m: any) => m.project?.id)
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        dueDate: m.due_date,
        status: m.status,
        projectId: m.project.id,
        projectName: m.project.name || m.project.title
      }));
  }

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true });

  return milestones || [];
}

async function getProjectTasks(supabase: any, userId: string, projectId: string | null) {
  if (!projectId) {
    // Return all tasks for user
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, project:projects(id, name, title)')
      .eq('user_id', userId)
      .neq('status', 'completed')
      .order('due_date', { ascending: true })
      .limit(20);

    return (tasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      projectId: t.project?.id,
      projectName: t.project?.name || t.project?.title
    }));
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return tasks || [];
}

async function getProjectAnalytics(supabase: any, userId: string) {
  const { data: projects } = await supabase
    .from('projects')
    .select('category, budget, status, created_at, completed_at, deadline')
    .eq('user_id', userId);

  const all = projects || [];

  // By category
  const byCategory: Record<string, { count: number; budget: number }> = {};
  all.forEach((p: any) => {
    const cat = p.category || 'Other';
    if (!byCategory[cat]) {
      byCategory[cat] = { count: 0, budget: 0 };
    }
    byCategory[cat].count++;
    byCategory[cat].budget += p.budget || 0;
  });

  // Monthly trend (last 6 months)
  const monthlyData: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyData[d.toISOString().substring(0, 7)] = 0;
  }

  all.forEach((p: any) => {
    const month = p.created_at?.substring(0, 7);
    if (monthlyData.hasOwnProperty(month)) {
      monthlyData[month]++;
    }
  });

  // Completion time analysis
  const completed = all.filter((p: any) => p.status === 'completed' && p.created_at && p.completed_at);
  const completionTimes = completed.map((p: any) => {
    const days = (new Date(p.completed_at).getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days;
  });

  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : 0;

  return {
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      ...data
    })),
    monthlyTrend: Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    completionAnalysis: {
      avgDays: Math.round(avgCompletionTime),
      fastest: completionTimes.length > 0 ? Math.round(Math.min(...completionTimes)) : 0,
      slowest: completionTimes.length > 0 ? Math.round(Math.max(...completionTimes)) : 0
    }
  };
}

async function createProject(supabase: any, userId: string, data: any) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: data.name,
      title: data.name,
      description: data.description,
      category: data.category,
      budget: data.budget,
      client_id: data.clientId,
      start_date: data.startDate || new Date().toISOString(),
      deadline: data.deadline,
      status: 'planning',
      progress: 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return project;
}

async function updateProject(supabase: any, userId: string, data: any) {
  const updates: any = {
    updated_at: new Date().toISOString()
  };

  if (data.name) updates.name = data.name;
  if (data.title) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.category) updates.category = data.category;
  if (data.budget !== undefined) updates.budget = data.budget;
  if (data.progress !== undefined) updates.progress = data.progress;
  if (data.deadline) updates.deadline = data.deadline;

  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', data.projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return project;
}

async function updateProjectStatus(supabase: any, userId: string, projectId: string, status: string) {
  const updates: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
    updates.progress = 100;
  }

  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return project;
}

async function addMilestone(supabase: any, userId: string, data: any) {
  const { data: milestone, error } = await supabase
    .from('milestones')
    .insert({
      project_id: data.projectId,
      name: data.name,
      description: data.description,
      due_date: data.dueDate,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return milestone;
}

async function updateMilestone(supabase: any, userId: string, data: any) {
  const updates: any = {
    updated_at: new Date().toISOString()
  };

  if (data.name) updates.name = data.name;
  if (data.status) {
    updates.status = data.status;
    if (data.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
  }
  if (data.dueDate) updates.due_date = data.dueDate;

  const { data: milestone, error } = await supabase
    .from('milestones')
    .update(updates)
    .eq('id', data.milestoneId)
    .select()
    .single();

  if (error) throw error;
  return milestone;
}

async function addTask(supabase: any, userId: string, data: any) {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      project_id: data.projectId,
      title: data.title,
      description: data.description,
      priority: data.priority || 'medium',
      due_date: data.dueDate,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return task;
}

async function trackProjectTime(supabase: any, userId: string, data: any) {
  const { data: entry, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: userId,
      project_id: data.projectId,
      task_id: data.taskId,
      description: data.description,
      duration: data.duration, // in seconds
      billable: data.billable ?? true,
      start_time: data.startTime || new Date().toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return entry;
}

async function archiveProject(supabase: any, userId: string, projectId: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return project;
}
