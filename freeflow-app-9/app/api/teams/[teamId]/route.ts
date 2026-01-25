// =====================================================
// KAZI Team Collaboration API - Single Team Route
// Individual team operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teamService } from '@/lib/teams/team-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('team');

// =====================================================
// GET - Get team details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'members': {
        const members = await teamService.getMembers(teamId, user.id);
        return NextResponse.json({ members });
      }

      case 'projects': {
        const status = searchParams.get('status') || undefined;
        const lead_id = searchParams.get('lead_id') || undefined;
        const projects = await teamService.getProjects(teamId, user.id, { status, lead_id });
        return NextResponse.json({ projects });
      }

      case 'tasks': {
        const project_id = searchParams.get('project_id') || undefined;
        const status = searchParams.get('status') || undefined;
        const assigned_to = searchParams.get('assigned_to') || undefined;
        const priority = searchParams.get('priority') || undefined;
        const tasks = await teamService.getTasks(teamId, user.id, {
          project_id,
          status,
          assigned_to,
          priority,
        });
        return NextResponse.json({ tasks });
      }

      case 'activity': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const entityType = searchParams.get('entity_type') || undefined;
        const activity = await teamService.getActivity(teamId, user.id, limit, entityType);
        return NextResponse.json({ activity });
      }

      case 'stats': {
        const stats = await teamService.getTeamStats(teamId, user.id);
        return NextResponse.json({ stats });
      }

      default: {
        const team = await teamService.getTeam(teamId);
        if (!team) {
          return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        // Check if user is member
        const member = await teamService.getMemberPermission(teamId, user.id);
        if (!member) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const includeMembers = searchParams.get('include_members') === 'true';
        const includeStats = searchParams.get('include_stats') === 'true';

        const response: any = { team, membership: member };

        if (includeMembers) {
          response.members = await teamService.getMembers(teamId, user.id);
        }

        if (includeStats) {
          response.stats = await teamService.getTeamStats(teamId, user.id);
        }

        return NextResponse.json(response);
      }
    }
  } catch (error: any) {
    logger.error('Team GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update team
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const team = await teamService.updateTeam(teamId, user.id, body);
    return NextResponse.json({ team });
  } catch (error: any) {
    logger.error('Team PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update team' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Team actions (invite, create project/task, etc.)
// =====================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      // Member operations
      case 'invite': {
        const invitation = await teamService.inviteMember(teamId, user.id, {
          email: data.email,
          role: data.role,
          message: data.message,
        });
        return NextResponse.json({ invitation }, { status: 201 });
      }

      case 'update-member-role': {
        const member = await teamService.updateMemberRole(
          teamId,
          user.id,
          data.member_id,
          data.role
        );
        return NextResponse.json({ member });
      }

      case 'remove-member': {
        await teamService.removeMember(teamId, user.id, data.member_id);
        return NextResponse.json({ success: true });
      }

      case 'leave': {
        await teamService.leaveTeam(teamId, user.id);
        return NextResponse.json({ success: true });
      }

      // Project operations
      case 'create-project': {
        const project = await teamService.createProject(teamId, user.id, {
          name: data.name,
          description: data.description,
          status: data.status,
          priority: data.priority,
          start_date: data.start_date,
          due_date: data.due_date,
          budget: data.budget,
          client_id: data.client_id,
          lead_member_id: data.lead_member_id,
          tags: data.tags,
        });
        return NextResponse.json({ project }, { status: 201 });
      }

      case 'update-project': {
        const project = await teamService.updateProject(teamId, data.project_id, user.id, data.updates);
        return NextResponse.json({ project });
      }

      case 'delete-project': {
        await teamService.deleteProject(teamId, data.project_id, user.id);
        return NextResponse.json({ success: true });
      }

      // Task operations
      case 'create-task': {
        const task = await teamService.createTask(teamId, user.id, {
          title: data.title,
          description: data.description,
          project_id: data.project_id,
          parent_task_id: data.parent_task_id,
          status: data.status,
          priority: data.priority,
          assigned_to: data.assigned_to,
          due_date: data.due_date,
          estimated_hours: data.estimated_hours,
          tags: data.tags,
          checklist: data.checklist,
        });
        return NextResponse.json({ task }, { status: 201 });
      }

      case 'update-task': {
        const task = await teamService.updateTask(teamId, data.task_id, user.id, data.updates);
        return NextResponse.json({ task });
      }

      case 'delete-task': {
        await teamService.deleteTask(teamId, data.task_id, user.id);
        return NextResponse.json({ success: true });
      }

      case 'assign-task': {
        const task = await teamService.assignTask(teamId, data.task_id, user.id, data.assignee_id);
        return NextResponse.json({ task });
      }

      case 'reorder-tasks': {
        await teamService.reorderTasks(teamId, user.id, data.task_orders);
        return NextResponse.json({ success: true });
      }

      // Comment operations
      case 'add-comment': {
        const comment = await teamService.addComment(
          teamId,
          user.id,
          data.entity_type,
          data.entity_id,
          data.content,
          data.parent_id,
          data.mentions,
          data.attachments
        );
        return NextResponse.json({ comment }, { status: 201 });
      }

      case 'add-reaction': {
        const comment = await teamService.addReaction(teamId, user.id, data.comment_id, data.emoji);
        return NextResponse.json({ comment });
      }

      case 'remove-reaction': {
        const comment = await teamService.removeReaction(teamId, user.id, data.comment_id, data.emoji);
        return NextResponse.json({ comment });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Team POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete team
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await teamService.deleteTeam(teamId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Team DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete team' },
      { status: 500 }
    );
  }
}
