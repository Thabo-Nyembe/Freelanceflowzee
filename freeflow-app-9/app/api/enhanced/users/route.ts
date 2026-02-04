/**
 * Enhanced Users API - FreeFlow A+++ Implementation
 * Comprehensive user analytics and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('enhanced-users');

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'profile';
    const userId = searchParams.get('userId') || DEMO_USER_ID;

    switch (action) {
      case 'profile': {
        const profile = await getUserProfile(supabase, userId);
        return NextResponse.json({ success: true, data: profile });
      }

      case 'stats': {
        const stats = await getUserStats(supabase, userId);
        return NextResponse.json({ success: true, data: stats });
      }

      case 'activity': {
        const activity = await getUserActivity(supabase, userId);
        return NextResponse.json({ success: true, data: activity });
      }

      case 'engagement': {
        const engagement = await getUserEngagement(supabase, userId);
        return NextResponse.json({ success: true, data: engagement });
      }

      case 'preferences': {
        const prefs = await getUserPreferences(supabase, userId);
        return NextResponse.json({ success: true, data: prefs });
      }

      case 'team': {
        const team = await getTeamMembers(supabase, userId);
        return NextResponse.json({ success: true, data: team });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Enhanced Users Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'user_profile',
            'user_stats',
            'activity_tracking',
            'engagement_metrics',
            'preferences_management',
            'team_management'
          ]
        });
      }

      default: {
        const [profile, stats, activity] = await Promise.all([
          getUserProfile(supabase, userId),
          getUserStats(supabase, userId),
          getUserActivity(supabase, userId)
        ]);

        return NextResponse.json({
          success: true,
          data: { profile, stats, activity }
        });
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Enhanced Users GET error', { error: errorMessage });
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
      case 'update-profile': {
        const result = await updateUserProfile(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'update-preferences': {
        const result = await updateUserPreferences(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'track-activity': {
        await trackUserActivity(supabase, user.id, data);
        return NextResponse.json({ success: true, message: 'Activity tracked' });
      }

      case 'invite-team-member': {
        const result = await inviteTeamMember(supabase, user.id, data);
        return NextResponse.json({ success: true, data: result });
      }

      case 'update-team-member': {
        const result = await updateTeamMember(supabase, user.id, data);
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
    logger.error('Enhanced Users POST error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getUserProfile(supabase: any, userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!user) {
    return {
      id: userId,
      email: 'demo@example.com',
      name: 'Demo User',
      avatar_url: null,
      bio: null,
      location: null,
      website: null,
      created_at: new Date().toISOString()
    };
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.full_name,
    avatar_url: user.avatar_url,
    bio: user.bio,
    location: user.location,
    website: user.website,
    company: user.company,
    role: user.role,
    tier: user.tier || 'standard',
    created_at: user.created_at,
    verified: user.email_verified || false
  };
}

async function getUserStats(supabase: any, userId: string) {
  const [
    { count: projectsCount },
    { count: clientsCount },
    { count: tasksCount },
    { data: invoices },
    { data: timeEntries }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('invoices').select('total, status').eq('user_id', userId),
    supabase.from('time_entries').select('duration, billable').eq('user_id', userId)
  ]);

  const totalRevenue = (invoices || [])
    .filter((i: any) => i.status === 'paid')
    .reduce((sum: number, i: any) => sum + (i.total || 0), 0);

  const totalHours = (timeEntries || [])
    .reduce((sum: number, e: any) => sum + ((e.duration || 0) / 3600), 0);

  const billableHours = (timeEntries || [])
    .filter((e: any) => e.billable)
    .reduce((sum: number, e: any) => sum + ((e.duration || 0) / 3600), 0);

  return {
    projects: {
      total: projectsCount || 0
    },
    clients: {
      total: clientsCount || 0
    },
    tasks: {
      total: tasksCount || 0
    },
    revenue: {
      total: totalRevenue,
      invoiceCount: (invoices || []).length
    },
    time: {
      totalHours: Math.round(totalHours * 10) / 10,
      billableHours: Math.round(billableHours * 10) / 10,
      utilization: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0
    }
  };
}

async function getUserActivity(supabase: any, userId: string) {
  // Get recent activity from various sources
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: recentProjects },
    { data: recentTasks },
    { data: recentInvoices },
    { data: activityLogs }
  ] = await Promise.all([
    supabase.from('projects').select('id, name, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase.from('tasks').select('id, title, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase.from('invoices').select('id, invoice_number, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('activity_logs').select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  // Build activity timeline
  const activities: any[] = [];

  (recentProjects || []).forEach((p: any) => {
    activities.push({
      type: 'project',
      action: p.status === 'completed' ? 'completed' : 'updated',
      entity: { id: p.id, name: p.name },
      timestamp: p.updated_at
    });
  });

  (recentTasks || []).forEach((t: any) => {
    activities.push({
      type: 'task',
      action: t.status === 'completed' ? 'completed' : 'updated',
      entity: { id: t.id, name: t.title },
      timestamp: t.updated_at
    });
  });

  (recentInvoices || []).forEach((i: any) => {
    activities.push({
      type: 'invoice',
      action: 'created',
      entity: { id: i.id, name: i.invoice_number },
      timestamp: i.created_at
    });
  });

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    recentActivity: activities.slice(0, 10),
    activityCount: activities.length,
    logs: activityLogs || [],
    lastActive: activities.length > 0 ? activities[0].timestamp : null
  };
}

async function getUserEngagement(supabase: any, userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { count: loginCount },
    { count: projectsCreated },
    { count: tasksCompleted },
    { data: timeEntries }
  ] = await Promise.all([
    supabase.from('user_sessions').select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('projects').select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('tasks').select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', thirtyDaysAgo.toISOString()),
    supabase.from('time_entries').select('duration')
      .eq('user_id', userId)
      .gte('start_time', thirtyDaysAgo.toISOString())
  ]);

  const hoursTracked = (timeEntries || [])
    .reduce((sum: number, e: any) => sum + ((e.duration || 0) / 3600), 0);

  // Calculate engagement score
  let score = 0;
  score += Math.min((loginCount || 0) * 2, 30); // Up to 30 points for logins
  score += Math.min((projectsCreated || 0) * 10, 20); // Up to 20 points for projects
  score += Math.min((tasksCompleted || 0) * 2, 30); // Up to 30 points for tasks
  score += Math.min(hoursTracked * 0.5, 20); // Up to 20 points for hours

  return {
    score: Math.min(Math.round(score), 100),
    level: score > 80 ? 'power_user' : score > 50 ? 'active' : score > 20 ? 'regular' : 'casual',
    metrics: {
      loginCount: loginCount || 0,
      projectsCreated: projectsCreated || 0,
      tasksCompleted: tasksCompleted || 0,
      hoursTracked: Math.round(hoursTracked * 10) / 10
    },
    period: '30 days'
  };
}

async function getUserPreferences(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || {
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboard: {
      defaultView: 'overview',
      showMetrics: true,
      compactMode: false
    }
  };
}

async function getTeamMembers(supabase: any, userId: string) {
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*, user:users(*)')
    .eq('team_owner_id', userId);

  return {
    members: (teamMembers || []).map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      name: m.user?.name || m.user?.full_name || 'Unknown',
      email: m.user?.email,
      role: m.role,
      joinedAt: m.created_at
    })),
    count: (teamMembers || []).length
  };
}

async function updateUserProfile(supabase: any, userId: string, data: any) {
  const updates: any = {};

  if (data.name) updates.name = data.name;
  if (data.bio) updates.bio = data.bio;
  if (data.location) updates.location = data.location;
  if (data.website) updates.website = data.website;
  if (data.company) updates.company = data.company;
  if (data.avatar_url) updates.avatar_url = data.avatar_url;

  updates.updated_at = new Date().toISOString();

  const { data: result, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function updateUserPreferences(supabase: any, userId: string, data: any) {
  const { data: result, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function trackUserActivity(supabase: any, userId: string, data: any) {
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: data.action,
    entity_type: data.entityType,
    entity_id: data.entityId,
    metadata: data.metadata,
    created_at: new Date().toISOString()
  });
}

async function inviteTeamMember(supabase: any, ownerId: string, data: any) {
  const { data: result, error } = await supabase
    .from('team_invites')
    .insert({
      team_owner_id: ownerId,
      email: data.email,
      role: data.role || 'member',
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function updateTeamMember(supabase: any, ownerId: string, data: any) {
  const { data: result, error } = await supabase
    .from('team_members')
    .update({
      role: data.role,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.memberId)
    .eq('team_owner_id', ownerId)
    .select()
    .single();

  if (error) throw error;
  return result;
}
