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
  } catch (error) {
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
  } catch (error) {
    logger.error('Teams POST error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Partial update team
// =====================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');
    const body = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify user is team owner or admin
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only team owners and admins can update team settings' }, { status: 403 });
    }

    // Remove protected fields
    const { id: _id, owner_id: _ownerId, created_at: _createdAt, ...updateData } = body;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      logger.error('Teams PATCH error', { error, teamId });
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      throw error;
    }

    logger.info('Team updated', { teamId, fields: Object.keys(updateData) });
    return NextResponse.json({ team: data, message: 'Team updated successfully' });
  } catch (error) {
    logger.error('Teams PATCH error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to update team' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Full update or member management
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');
    const action = searchParams.get('action');
    const body = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Verify user is team owner or admin
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    switch (action) {
      case 'update-member-role': {
        const { memberId, role } = body;
        if (!memberId || !role) {
          return NextResponse.json({ error: 'memberId and role are required' }, { status: 400 });
        }

        // Only owner can change roles
        if (membership.role !== 'owner' && role === 'admin') {
          return NextResponse.json({ error: 'Only team owner can assign admin role' }, { status: 403 });
        }

        const { data, error } = await supabase
          .from('team_members')
          .update({ role, updated_at: new Date().toISOString() })
          .eq('team_id', teamId)
          .eq('user_id', memberId)
          .select()
          .single();

        if (error) throw error;

        logger.info('Member role updated', { teamId, memberId, role });
        return NextResponse.json({ member: data, message: 'Member role updated' });
      }

      case 'remove-member': {
        const { memberId } = body;
        if (!memberId) {
          return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
        }

        // Can't remove the owner
        const { data: targetMember } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', memberId)
          .single();

        if (targetMember?.role === 'owner') {
          return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 });
        }

        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('team_id', teamId)
          .eq('user_id', memberId);

        if (error) throw error;

        logger.info('Member removed from team', { teamId, memberId });
        return NextResponse.json({ success: true, message: 'Member removed from team' });
      }

      case 'invite-member': {
        const { email, role = 'member' } = body;
        if (!email) {
          return NextResponse.json({ error: 'email is required' }, { status: 400 });
        }

        // Create invitation
        const token = `invite_${crypto.randomUUID()}`;
        const { data, error } = await supabase
          .from('team_invitations')
          .insert({
            team_id: teamId,
            email,
            role,
            token,
            invited_by: user.id,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        logger.info('Team invitation sent', { teamId, email });
        return NextResponse.json({ invitation: data, message: 'Invitation sent' });
      }

      case 'transfer-ownership': {
        if (membership.role !== 'owner') {
          return NextResponse.json({ error: 'Only owner can transfer ownership' }, { status: 403 });
        }

        const { newOwnerId } = body;
        if (!newOwnerId) {
          return NextResponse.json({ error: 'newOwnerId is required' }, { status: 400 });
        }

        // Update team owner
        await supabase
          .from('teams')
          .update({ owner_id: newOwnerId, updated_at: new Date().toISOString() })
          .eq('id', teamId);

        // Update member roles
        await supabase
          .from('team_members')
          .update({ role: 'admin' })
          .eq('team_id', teamId)
          .eq('user_id', user.id);

        await supabase
          .from('team_members')
          .update({ role: 'owner' })
          .eq('team_id', teamId)
          .eq('user_id', newOwnerId);

        logger.info('Team ownership transferred', { teamId, newOwnerId });
        return NextResponse.json({ success: true, message: 'Ownership transferred' });
      }

      default: {
        // Full team update
        const { id: _id, owner_id: _ownerId, created_at: _createdAt, ...updateData } = body;
        updateData.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('teams')
          .update(updateData)
          .eq('id', teamId)
          .select()
          .single();

        if (error) throw error;

        logger.info('Team fully updated', { teamId });
        return NextResponse.json({ team: data, message: 'Team updated' });
      }
    }
  } catch (error) {
    logger.error('Teams PUT error', { error });
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete team or leave team
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('id');
    const action = searchParams.get('action');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Get user's membership
    const { data: membership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
    }

    if (action === 'leave') {
      // Leave team (not allowed for owner)
      if (membership.role === 'owner') {
        return NextResponse.json({
          error: 'Team owner cannot leave. Transfer ownership first or delete the team.'
        }, { status: 400 });
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      logger.info('User left team', { teamId, userId: user.id });
      return NextResponse.json({ success: true, message: 'You have left the team' });
    }

    // Delete team (owner only)
    if (membership.role !== 'owner') {
      return NextResponse.json({ error: 'Only team owner can delete the team' }, { status: 403 });
    }

    // Delete all team invitations first
    await supabase
      .from('team_invitations')
      .delete()
      .eq('team_id', teamId);

    // Delete all team members
    await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    // Delete the team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;

    logger.info('Team deleted', { teamId });
    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    logger.error('Teams DELETE error', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to delete team' },
      { status: 500 }
    );
  }
}
