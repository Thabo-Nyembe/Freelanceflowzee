// =====================================================
// KAZI Team Collaboration API - Main Route
// Team management, members, and invitations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teamService } from '@/lib/teams/team-service';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('teams');

// =====================================================
// GET - List user's teams
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'invitations': {
        // Get pending invitations for user's email
        const { data: invitations } = await supabase
          .from('team_invitations')
          .select(`
            *,
            team:teams (
              id,
              name,
              avatar_url
            )
          `)
          .eq('email', user.email)
          .eq('status', 'pending');

        return NextResponse.json({ invitations: invitations || [] });
      }

      default: {
        const teams = await teamService.getUserTeams(user.id);
        return NextResponse.json({ teams });
      }
    }
  } catch (error: any) {
    logger.error('Teams GET error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create team or handle actions
// =====================================================
export async function POST(request: NextRequest) {
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
        const team = await teamService.createTeam(user.id, {
          name: data.name,
          description: data.description,
          avatar_url: data.avatar_url,
          industry: data.industry,
          size: data.size,
          settings: data.settings,
        });
        return NextResponse.json({ team }, { status: 201 });
      }

      case 'accept-invitation': {
        const member = await teamService.acceptInvitation(data.token, user.id);
        return NextResponse.json({ member, message: 'Invitation accepted' });
      }

      case 'decline-invitation': {
        await teamService.declineInvitation(data.token);
        return NextResponse.json({ success: true, message: 'Invitation declined' });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Teams POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
