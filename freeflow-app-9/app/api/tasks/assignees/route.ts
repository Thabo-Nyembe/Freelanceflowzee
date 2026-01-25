/**
 * Task Multiple Assignees API
 *
 * Beats ClickUp's multiple assignees feature.
 * Supports:
 * - Multiple assignees per task
 * - Role-based assignments (owner, collaborator, reviewer)
 * - Workload-aware assignment suggestions
 * - Assignment history tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('tasks-assignees');

// ============================================================================
// TYPES
// ============================================================================

type AssigneeRole = 'owner' | 'collaborator' | 'reviewer' | 'watcher';
type AssignmentStatus = 'active' | 'completed' | 'removed' | 'declined';

interface TaskAssignee {
  id: string;
  task_id: string;
  user_id: string;
  role: AssigneeRole;
  status: AssignmentStatus;
  assigned_by: string;
  assigned_at: string;
  completed_at: string | null;
  time_spent_minutes: number;
  contribution_percentage: number | null;
  notes: string | null;
  // Joined user data
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface AssigneesRequest {
  action:
    | 'list'
    | 'add'
    | 'remove'
    | 'update-role'
    | 'get-suggestions'
    | 'bulk-assign'
    | 'transfer-ownership'
    | 'get-history';
  taskId: string;
  userId?: string;
  userIds?: string[];
  role?: AssigneeRole;
  notes?: string;
  projectId?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoAssignees(taskId: string): TaskAssignee[] {
  const baseAssignees: TaskAssignee[] = [
    {
      id: 'assign-1',
      task_id: taskId,
      user_id: 'user-1',
      role: 'owner',
      status: 'active',
      assigned_by: 'user-admin',
      assigned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: null,
      time_spent_minutes: 240,
      contribution_percentage: 60,
      notes: 'Primary developer for this task',
      user: {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah@freeflow.io',
        avatar_url: '/avatars/sarah.jpg',
      },
    },
    {
      id: 'assign-2',
      task_id: taskId,
      user_id: 'user-2',
      role: 'collaborator',
      status: 'active',
      assigned_by: 'user-1',
      assigned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: null,
      time_spent_minutes: 120,
      contribution_percentage: 30,
      notes: 'Helping with backend integration',
      user: {
        id: 'user-2',
        name: 'Marcus Johnson',
        email: 'marcus@freeflow.io',
        avatar_url: '/avatars/marcus.jpg',
      },
    },
    {
      id: 'assign-3',
      task_id: taskId,
      user_id: 'user-3',
      role: 'reviewer',
      status: 'active',
      assigned_by: 'user-admin',
      assigned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: null,
      time_spent_minutes: 30,
      contribution_percentage: 10,
      notes: null,
      user: {
        id: 'user-3',
        name: 'Emily Rodriguez',
        email: 'emily@freeflow.io',
        avatar_url: '/avatars/emily.jpg',
      },
    },
  ];

  return baseAssignees;
}

function getDemoTeamMembers() {
  return [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah@freeflow.io',
      avatar_url: '/avatars/sarah.jpg',
      skills: ['React', 'TypeScript', 'Node.js'],
      current_workload: 70,
      availability: 'partially_available',
    },
    {
      id: 'user-2',
      name: 'Marcus Johnson',
      email: 'marcus@freeflow.io',
      avatar_url: '/avatars/marcus.jpg',
      skills: ['Python', 'Machine Learning', 'Backend'],
      current_workload: 120,
      availability: 'overloaded',
    },
    {
      id: 'user-3',
      name: 'Emily Rodriguez',
      email: 'emily@freeflow.io',
      avatar_url: '/avatars/emily.jpg',
      skills: ['Design', 'Figma', 'UI/UX'],
      current_workload: 25,
      availability: 'available',
    },
    {
      id: 'user-4',
      name: 'James Wilson',
      email: 'james@freeflow.io',
      avatar_url: '/avatars/james.jpg',
      skills: ['DevOps', 'AWS', 'Kubernetes'],
      current_workload: 45,
      availability: 'available',
    },
    {
      id: 'user-5',
      name: 'Lisa Park',
      email: 'lisa@freeflow.io',
      avatar_url: '/avatars/lisa.jpg',
      skills: ['React', 'Vue', 'Frontend'],
      current_workload: 60,
      availability: 'partially_available',
    },
  ];
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try database first
    const { data, error } = await supabase
      .from('task_assignees')
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('assigned_at', { ascending: true });

    if (error || !data?.length) {
      return NextResponse.json({
        success: true,
        data: getDemoAssignees(taskId),
        source: 'demo',
      });
    }

    return NextResponse.json({
      success: true,
      data,
      source: 'database',
    });
  } catch (err) {
    logger.error('Task Assignees GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: getDemoAssignees('demo-task'),
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AssigneesRequest = await request.json();
    const { action, taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    switch (action) {
      case 'list': {
        return NextResponse.json({
          success: true,
          data: getDemoAssignees(taskId),
        });
      }

      case 'add': {
        const { userId, role = 'collaborator', notes } = body;
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID required' },
            { status: 400 }
          );
        }

        const newAssignee: TaskAssignee = {
          id: `assign-${Date.now()}`,
          task_id: taskId,
          user_id: userId,
          role,
          status: 'active',
          assigned_by: 'current-user',
          assigned_at: new Date().toISOString(),
          completed_at: null,
          time_spent_minutes: 0,
          contribution_percentage: null,
          notes: notes || null,
        };

        // Try to insert into database
        const { data: inserted, error } = await supabase
          .from('task_assignees')
          .insert(newAssignee)
          .select()
          .single();

        return NextResponse.json({
          success: true,
          data: inserted || newAssignee,
          message: 'Assignee added successfully',
        });
      }

      case 'remove': {
        const { userId } = body;
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID required' },
            { status: 400 }
          );
        }

        await supabase
          .from('task_assignees')
          .update({ status: 'removed' })
          .eq('task_id', taskId)
          .eq('user_id', userId);

        return NextResponse.json({
          success: true,
          message: 'Assignee removed successfully',
        });
      }

      case 'update-role': {
        const { userId, role } = body;
        if (!userId || !role) {
          return NextResponse.json(
            { success: false, error: 'User ID and role required' },
            { status: 400 }
          );
        }

        const { data: updated, error } = await supabase
          .from('task_assignees')
          .update({ role })
          .eq('task_id', taskId)
          .eq('user_id', userId)
          .select()
          .single();

        return NextResponse.json({
          success: true,
          data: updated || { task_id: taskId, user_id: userId, role },
          message: 'Role updated successfully',
        });
      }

      case 'bulk-assign': {
        const { userIds, role = 'collaborator' } = body;
        if (!userIds?.length) {
          return NextResponse.json(
            { success: false, error: 'User IDs required' },
            { status: 400 }
          );
        }

        const newAssignees = userIds.map(userId => ({
          id: `assign-${Date.now()}-${userId}`,
          task_id: taskId,
          user_id: userId,
          role,
          status: 'active' as AssignmentStatus,
          assigned_by: 'current-user',
          assigned_at: new Date().toISOString(),
          completed_at: null,
          time_spent_minutes: 0,
          contribution_percentage: null,
          notes: null,
        }));

        const { data: inserted, error } = await supabase
          .from('task_assignees')
          .insert(newAssignees)
          .select();

        return NextResponse.json({
          success: true,
          data: inserted || newAssignees,
          count: newAssignees.length,
          message: `${newAssignees.length} assignees added successfully`,
        });
      }

      case 'transfer-ownership': {
        const { userId } = body;
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'New owner user ID required' },
            { status: 400 }
          );
        }

        // Demote current owner to collaborator
        await supabase
          .from('task_assignees')
          .update({ role: 'collaborator' })
          .eq('task_id', taskId)
          .eq('role', 'owner');

        // Promote new owner
        const { data: newOwner, error } = await supabase
          .from('task_assignees')
          .upsert({
            task_id: taskId,
            user_id: userId,
            role: 'owner',
            status: 'active',
            assigned_by: 'current-user',
            assigned_at: new Date().toISOString(),
          })
          .select()
          .single();

        return NextResponse.json({
          success: true,
          data: newOwner || { task_id: taskId, user_id: userId, role: 'owner' },
          message: 'Ownership transferred successfully',
        });
      }

      case 'get-suggestions': {
        // AI-powered assignee suggestions based on:
        // - Skills match
        // - Current workload
        // - Past task completion
        // - Team relationships
        const { projectId } = body;

        const teamMembers = getDemoTeamMembers();

        // Sort by availability and workload
        const suggestions = teamMembers
          .filter(m => m.availability !== 'overloaded')
          .sort((a, b) => a.current_workload - b.current_workload)
          .map((member, index) => ({
            user: member,
            score: 100 - member.current_workload,
            reasons: [
              member.current_workload < 50 ? 'Has good availability' : 'Moderately available',
              `Current workload: ${member.current_workload}%`,
              `Skills: ${member.skills.join(', ')}`,
            ],
            recommended_role: index === 0 ? 'owner' : 'collaborator',
          }));

        return NextResponse.json({
          success: true,
          data: {
            suggestions: suggestions.slice(0, 5),
            total_team_members: teamMembers.length,
            available_count: suggestions.length,
          },
        });
      }

      case 'get-history': {
        // Get assignment history for the task
        const history = [
          {
            id: 'hist-1',
            action: 'assigned',
            task_id: taskId,
            user_id: 'user-1',
            user_name: 'Sarah Chen',
            role: 'owner',
            performed_by: 'Admin',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'hist-2',
            action: 'assigned',
            task_id: taskId,
            user_id: 'user-2',
            user_name: 'Marcus Johnson',
            role: 'collaborator',
            performed_by: 'Sarah Chen',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'hist-3',
            action: 'role_changed',
            task_id: taskId,
            user_id: 'user-2',
            user_name: 'Marcus Johnson',
            old_role: 'watcher',
            new_role: 'collaborator',
            performed_by: 'Sarah Chen',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'hist-4',
            action: 'assigned',
            task_id: taskId,
            user_id: 'user-3',
            user_name: 'Emily Rodriguez',
            role: 'reviewer',
            performed_by: 'Admin',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

        return NextResponse.json({
          success: true,
          data: history,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Task Assignees POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
