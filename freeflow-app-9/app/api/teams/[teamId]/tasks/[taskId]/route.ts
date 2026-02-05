// =====================================================
// KAZI Team Collaboration API - Task Route
// Individual task operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teamService } from '@/lib/teams/team-service';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/demo-mode';

const logger = createSimpleLogger('team-task');

// =====================================================
// GET - Get task details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; taskId: string }> }
) {
  try {
    const { teamId, taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'comments': {
        const comments = await teamService.getComments(teamId, user.id, 'task', taskId);
        return NextResponse.json({ comments });
      }

      case 'subtasks': {
        const tasks = await teamService.getTasks(teamId, user.id, {});
        const subtasks = tasks.filter(t => t.parent_task_id === taskId);
        return NextResponse.json({ subtasks });
      }

      default: {
        const task = await teamService.getTask(teamId, taskId, user.id);
        if (!task) {
          return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const includeComments = searchParams.get('include_comments') === 'true';
        const includeSubtasks = searchParams.get('include_subtasks') === 'true';

        const response: any = { task };

        if (includeComments) {
          response.comments = await teamService.getComments(teamId, user.id, 'task', taskId);
        }

        if (includeSubtasks) {
          const allTasks = await teamService.getTasks(teamId, user.id, {});
          response.subtasks = allTasks.filter(t => t.parent_task_id === taskId);
        }

        return NextResponse.json(response);
      }
    }
  } catch (error) {
    logger.error('Task GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update task
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; taskId: string }> }
) {
  try {
    const { teamId, taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const task = await teamService.updateTask(teamId, taskId, user.id, body);
    return NextResponse.json({ task });
  } catch (error) {
    logger.error('Task PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Quick task updates
// =====================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; taskId: string }> }
) {
  try {
    const { teamId, taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Quick status toggle
    if (body.toggle === 'complete') {
      const currentTask = await teamService.getTask(teamId, taskId, user.id);
      if (currentTask) {
        const newStatus = currentTask.status === 'done' ? 'todo' : 'done';
        const task = await teamService.updateTask(teamId, taskId, user.id, { status: newStatus });
        return NextResponse.json({ task });
      }
    }

    // Quick assign
    if (body.assign_to !== undefined) {
      const task = await teamService.assignTask(teamId, taskId, user.id, body.assign_to);
      return NextResponse.json({ task });
    }

    // Partial update
    const task = await teamService.updateTask(teamId, taskId, user.id, body);
    return NextResponse.json({ task });
  } catch (error) {
    logger.error('Task PATCH error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete task
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; taskId: string }> }
) {
  try {
    const { teamId, taskId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await teamService.deleteTask(teamId, taskId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Task DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}
