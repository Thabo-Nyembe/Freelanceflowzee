/**
 * Voice/Video Calls API
 *
 * A+++ Implementation - Slack/Zoom-Level Calling
 * Features:
 * - Start/join/leave/end calls
 * - Participant management
 * - Recording controls
 * - Breakout rooms
 * - Call analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createVoiceVideoService,
  CreateCallOptions,
  JoinCallOptions,
} from '@/lib/livekit/voice-video-service';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('calls-api');

// ============================================================================
// POST - Call Actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    const voiceVideoService = createVoiceVideoService();

    switch (action) {
      case 'create': {
        const options: CreateCallOptions = {
          channelId: params.channelId,
          callType: params.callType || 'audio',
          title: params.title,
          settings: params.settings,
          inviteUserIds: params.inviteUserIds,
          scheduledAt: params.scheduledAt,
        };

        const call = await voiceVideoService.createCall(user.id, options);

        // Get token for creator
        const token = await voiceVideoService.generateToken(
          user.id,
          call.roomName,
          true
        );

        return NextResponse.json({
          success: true,
          call,
          token,
        });
      }

      case 'join': {
        const options: JoinCallOptions = {
          callId: params.callId,
          audioEnabled: params.audioEnabled ?? true,
          videoEnabled: params.videoEnabled ?? false,
        };

        const { call, token } = await voiceVideoService.joinCall(user.id, options);

        return NextResponse.json({
          success: true,
          call,
          token,
        });
      }

      case 'leave': {
        const call = await voiceVideoService.leaveCall(user.id, params.callId);

        return NextResponse.json({
          success: true,
          call,
        });
      }

      case 'end': {
        const call = await voiceVideoService.endCall(params.callId, user.id);

        return NextResponse.json({
          success: true,
          call,
        });
      }

      case 'update-participant': {
        const participant = await voiceVideoService.updateParticipant(
          params.callId,
          params.targetUserId || user.id,
          params.updates
        );

        return NextResponse.json({
          success: true,
          participant,
        });
      }

      case 'toggle-mute': {
        await voiceVideoService.toggleMute(
          params.callId,
          params.targetUserId || user.id,
          user.id,
          params.mute
        );

        return NextResponse.json({
          success: true,
        });
      }

      case 'kick': {
        await voiceVideoService.kickParticipant(
          params.callId,
          params.targetUserId,
          user.id
        );

        return NextResponse.json({
          success: true,
        });
      }

      case 'toggle-hand': {
        const handRaised = await voiceVideoService.toggleHandRaise(
          params.callId,
          user.id
        );

        return NextResponse.json({
          success: true,
          handRaised,
        });
      }

      case 'start-recording': {
        const recording = await voiceVideoService.startRecording(
          params.callId,
          user.id
        );

        return NextResponse.json({
          success: true,
          recording,
        });
      }

      case 'stop-recording': {
        const recording = await voiceVideoService.stopRecording(
          params.callId,
          user.id
        );

        return NextResponse.json({
          success: true,
          recording,
        });
      }

      case 'create-breakout-rooms': {
        const rooms = await voiceVideoService.createBreakoutRooms(
          params.callId,
          user.id,
          params.rooms
        );

        return NextResponse.json({
          success: true,
          rooms,
        });
      }

      case 'close-breakout-rooms': {
        await voiceVideoService.closeBreakoutRooms(params.callId, user.id);

        return NextResponse.json({
          success: true,
        });
      }

      case 'get-token': {
        const call = voiceVideoService.getCall(params.callId);
        if (!call) {
          return NextResponse.json({ error: 'Call not found' }, { status: 404 });
        }

        const participant = call.participants.find(p => p.userId === user.id);
        if (!participant) {
          return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
        }

        const token = await voiceVideoService.generateToken(
          user.id,
          call.roomName,
          participant.role === 'host'
        );

        return NextResponse.json({
          success: true,
          token,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Failed to process call request', { error });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process call request' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get Calls
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const channelId = searchParams.get('channelId');
    const active = searchParams.get('active') === 'true';

    const voiceVideoService = createVoiceVideoService();

    // Get specific call
    if (callId) {
      let call = voiceVideoService.getCall(callId);

      // Try to load from database if not in memory
      if (!call) {
        call = await voiceVideoService.loadCall(callId) || undefined;
      }

      if (!call) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        call,
      });
    }

    // Get channel calls
    if (channelId) {
      const calls = voiceVideoService.getChannelCalls(channelId);

      return NextResponse.json({
        success: true,
        calls,
      });
    }

    // Get user's active calls
    if (active) {
      const calls = voiceVideoService.getUserActiveCalls(user.id);

      return NextResponse.json({
        success: true,
        calls,
      });
    }

    // Get all calls from database
    const { data: calls, error: dbError } = await supabase
      .from('calls')
      .select(`
        *,
        participants:call_participants(*)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      calls,
    });
  } catch (error) {
    logger.error('Failed to fetch calls', { error });
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { callId, ...updates } = body;

    if (!callId) {
      return NextResponse.json({ error: 'Call ID required' }, { status: 400 });
    }

    //Update call in database
    const { data, error } = await supabase
      .from('calls')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', callId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, call: data });

  } catch (error) {
    logger.error('Failed to update call', { error });
    return NextResponse.json(
      { error: 'Failed to update call' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json({ error: 'Call ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('id', callId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Call deleted successfully' });

  } catch (error) {
    logger.error('Failed to delete call', { error });
    return NextResponse.json(
      { error: 'Failed to delete call' },
      { status: 500 }
    );
  }
}
