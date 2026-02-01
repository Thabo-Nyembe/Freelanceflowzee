// =====================================================
// KAZI Team Collaboration API - Project Route
// Individual project operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teamService } from '@/lib/teams/team-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('team-project');

// =====================================================
// GET - Get project details
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; projectId: string }> }
) {
  try {
    const { teamId, projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'tasks': {
        const status = searchParams.get('status') || undefined;
        const assigned_to = searchParams.get('assigned_to') || undefined;
        const tasks = await teamService.getTasks(teamId, user.id, {
          project_id: projectId,
          status,
          assigned_to,
        });
        return NextResponse.json({ tasks });
      }

      case 'comments': {
        const comments = await teamService.getComments(teamId, user.id, 'project', projectId);
        return NextResponse.json({ comments });
      }

      default: {
        const project = await teamService.getProject(teamId, projectId, user.id);
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const includeTasks = searchParams.get('include_tasks') === 'true';
        const includeComments = searchParams.get('include_comments') === 'true';

        const response: any = { project };

        if (includeTasks) {
          response.tasks = await teamService.getTasks(teamId, user.id, { project_id: projectId });
        }

        if (includeComments) {
          response.comments = await teamService.getComments(teamId, user.id, 'project', projectId);
        }

        return NextResponse.json(response);
      }
    }
  } catch (error) {
    logger.error('Project GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update project
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; projectId: string }> }
) {
  try {
    const { teamId, projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const project = await teamService.updateProject(teamId, projectId, user.id, body);
    return NextResponse.json({ project });
  } catch (error) {
    logger.error('Project PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete project
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; projectId: string }> }
) {
  try {
    const { teamId, projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await teamService.deleteProject(teamId, projectId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Project DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
