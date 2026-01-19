'use client';

/**
 * Voice & Video Calls Hook
 *
 * A+++ Implementation - Complete Call Management
 * Features:
 * - Start/join/leave/end calls
 * - Audio/video controls
 * - Screen sharing
 * - Recording management
 * - Participant controls
 * - Real-time updates
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export type CallType = 'audio' | 'video' | 'screen_share';
export type CallStatus = 'ringing' | 'connecting' | 'active' | 'on_hold' | 'ended' | 'failed';
export type ParticipantRole = 'host' | 'co_host' | 'presenter' | 'attendee';
export type RecordingStatus = 'none' | 'starting' | 'recording' | 'paused' | 'stopped';

export interface Call {
  id: string;
  channelId: string;
  roomName: string;
  callType: CallType;
  status: CallStatus;
  initiatedBy: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  participants: CallParticipant[];
  settings: CallSettings;
  recording: RecordingInfo | null;
  metadata: CallMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface CallParticipant {
  id: string;
  callId: string;
  userId: string;
  role: ParticipantRole;
  status: string;
  joinedAt?: string;
  leftAt?: string;
  duration?: number;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  handRaised: boolean;
  speakingLevel: number;
  connectionQuality: string;
  device: {
    deviceType: string;
    browser?: string;
    os?: string;
  };
}

export interface CallSettings {
  maxParticipants: number;
  allowScreenShare: boolean;
  allowRecording: boolean;
  allowChat: boolean;
  allowHandRaise: boolean;
  allowReactions: boolean;
  allowVirtualBackground: boolean;
  allowNoiseCancellation: boolean;
  allowBreakoutRooms: boolean;
  allowLiveCaptions: boolean;
  enableWaitingRoom: boolean;
  muteOnJoin: boolean;
  videoOffOnJoin: boolean;
  enableE2EEncryption: boolean;
  autoRecord: boolean;
  maxDuration: number;
  qualityPreset: string;
}

export interface RecordingInfo {
  id: string;
  status: RecordingStatus;
  startedAt?: string;
  stoppedAt?: string;
  duration?: number;
  fileUrl?: string;
  transcriptUrl?: string;
}

export interface CallMetadata {
  title?: string;
  description?: string;
  scheduledAt?: string;
  agenda?: string[];
}

export interface LiveKitToken {
  token: string;
  roomName: string;
  serverUrl: string;
  participantIdentity: string;
  participantName: string;
}

export interface CreateCallOptions {
  channelId: string;
  callType?: CallType;
  title?: string;
  settings?: Partial<CallSettings>;
  inviteUserIds?: string[];
  scheduledAt?: string;
}

export interface JoinCallOptions {
  callId: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[];
}

// ============================================================================
// Hook
// ============================================================================

export function useVoiceVideo() {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [token, setToken] = useState<LiveKitToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local media state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  // Refs for cleanup
  const callIdRef = useRef<string | null>(null);

  // ==========================================================================
  // API Helpers
  // ==========================================================================

  const callApi = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const response = await fetch('/api/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...params }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }, []);

  // ==========================================================================
  // Call Management
  // ==========================================================================

  /**
   * Start a new call
   */
  const startCall = useCallback(async (options: CreateCallOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await callApi('create', options);

      setActiveCall(data.call);
      setToken(data.token);
      callIdRef.current = data.call.id;

      // Set initial media state based on call type
      setIsVideoEnabled(options.callType === 'video');
      setIsScreenSharing(options.callType === 'screen_share');

      toast.success('Call started');

      return { call: data.call, token: data.token };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start call';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [callApi]);

  /**
   * Join an existing call
   */
  const joinCall = useCallback(async (options: JoinCallOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await callApi('join', options);

      setActiveCall(data.call);
      setToken(data.token);
      callIdRef.current = data.call.id;

      setIsAudioEnabled(options.audioEnabled ?? true);
      setIsVideoEnabled(options.videoEnabled ?? false);

      toast.success('Joined call');

      return { call: data.call, token: data.token };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join call';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [callApi]);

  /**
   * Leave the current call
   */
  const leaveCall = useCallback(async () => {
    if (!activeCall) return;

    setIsLoading(true);
    setError(null);

    try {
      await callApi('leave', { callId: activeCall.id });

      setActiveCall(null);
      setToken(null);
      callIdRef.current = null;

      // Reset media state
      setIsAudioEnabled(true);
      setIsVideoEnabled(false);
      setIsScreenSharing(false);
      setIsRecording(false);
      setHandRaised(false);

      toast.success('Left call');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to leave call';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCall, callApi]);

  /**
   * End the current call (host only)
   */
  const endCall = useCallback(async () => {
    if (!activeCall) return;

    setIsLoading(true);
    setError(null);

    try {
      await callApi('end', { callId: activeCall.id });

      setActiveCall(null);
      setToken(null);
      callIdRef.current = null;

      toast.success('Call ended');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end call';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeCall, callApi]);

  // ==========================================================================
  // Media Controls
  // ==========================================================================

  /**
   * Toggle audio (mute/unmute)
   */
  const toggleAudio = useCallback(async () => {
    if (!activeCall) return;

    try {
      await callApi('toggle-mute', {
        callId: activeCall.id,
        mute: isAudioEnabled,
      });

      setIsAudioEnabled(!isAudioEnabled);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle audio';
      toast.error(message);
    }
  }, [activeCall, callApi, isAudioEnabled]);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(async () => {
    if (!activeCall) return;

    try {
      await callApi('update-participant', {
        callId: activeCall.id,
        updates: { videoEnabled: !isVideoEnabled },
      });

      setIsVideoEnabled(!isVideoEnabled);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle video';
      toast.error(message);
    }
  }, [activeCall, callApi, isVideoEnabled]);

  /**
   * Toggle screen sharing
   */
  const toggleScreenShare = useCallback(async () => {
    if (!activeCall) return;

    try {
      await callApi('update-participant', {
        callId: activeCall.id,
        updates: { screenShareEnabled: !isScreenSharing },
      });

      setIsScreenSharing(!isScreenSharing);

      if (!isScreenSharing) {
        toast.success('Screen sharing started');
      } else {
        toast.info('Screen sharing stopped');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle screen share';
      toast.error(message);
    }
  }, [activeCall, callApi, isScreenSharing]);

  /**
   * Toggle hand raise
   */
  const toggleHandRaise = useCallback(async () => {
    if (!activeCall) return;

    try {
      const data = await callApi('toggle-hand', { callId: activeCall.id });
      setHandRaised(data.handRaised);

      if (data.handRaised) {
        toast.info('Hand raised');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to raise hand';
      toast.error(message);
    }
  }, [activeCall, callApi]);

  // ==========================================================================
  // Participant Management
  // ==========================================================================

  /**
   * Mute a participant (host only)
   */
  const muteParticipant = useCallback(async (targetUserId: string) => {
    if (!activeCall) return;

    try {
      await callApi('toggle-mute', {
        callId: activeCall.id,
        targetUserId,
        mute: true,
      });

      toast.success('Participant muted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mute participant';
      toast.error(message);
    }
  }, [activeCall, callApi]);

  /**
   * Kick a participant (host only)
   */
  const kickParticipant = useCallback(async (targetUserId: string) => {
    if (!activeCall) return;

    try {
      await callApi('kick', {
        callId: activeCall.id,
        targetUserId,
      });

      toast.success('Participant removed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove participant';
      toast.error(message);
    }
  }, [activeCall, callApi]);

  /**
   * Promote participant to co-host
   */
  const promoteToCoHost = useCallback(async (targetUserId: string) => {
    if (!activeCall) return;

    try {
      await callApi('update-participant', {
        callId: activeCall.id,
        targetUserId,
        updates: { role: 'co_host' },
      });

      toast.success('Participant promoted to co-host');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to promote participant';
      toast.error(message);
    }
  }, [activeCall, callApi]);

  // ==========================================================================
  // Recording
  // ==========================================================================

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    if (!activeCall) return;

    try {
      const data = await callApi('start-recording', { callId: activeCall.id });
      setIsRecording(true);

      toast.success('Recording started');
      return data.recording;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      toast.error(message);
      throw err;
    }
  }, [activeCall, callApi]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async () => {
    if (!activeCall) return;

    try {
      const data = await callApi('stop-recording', { callId: activeCall.id });
      setIsRecording(false);

      toast.success('Recording saved');
      return data.recording;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop recording';
      toast.error(message);
      throw err;
    }
  }, [activeCall, callApi]);

  // ==========================================================================
  // Breakout Rooms
  // ==========================================================================

  /**
   * Create breakout rooms
   */
  const createBreakoutRooms = useCallback(async (
    rooms: Array<{ name: string; participantIds: string[] }>
  ) => {
    if (!activeCall) return;

    try {
      const data = await callApi('create-breakout-rooms', {
        callId: activeCall.id,
        rooms,
      });

      toast.success('Breakout rooms created');
      return data.rooms as BreakoutRoom[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create breakout rooms';
      toast.error(message);
      throw err;
    }
  }, [activeCall, callApi]);

  /**
   * Close all breakout rooms
   */
  const closeBreakoutRooms = useCallback(async () => {
    if (!activeCall) return;

    try {
      await callApi('close-breakout-rooms', { callId: activeCall.id });
      toast.success('Breakout rooms closed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close breakout rooms';
      toast.error(message);
      throw err;
    }
  }, [activeCall, callApi]);

  // ==========================================================================
  // Fetch Calls
  // ==========================================================================

  /**
   * Get a specific call
   */
  const getCall = useCallback(async (callId: string): Promise<Call | null> => {
    try {
      const response = await fetch(`/api/calls?callId=${callId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.call;
    } catch (err) {
      console.error('Failed to get call:', err);
      return null;
    }
  }, []);

  /**
   * Get active calls for a channel
   */
  const getChannelCalls = useCallback(async (channelId: string): Promise<Call[]> => {
    try {
      const response = await fetch(`/api/calls?channelId=${channelId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.calls;
    } catch (err) {
      console.error('Failed to get channel calls:', err);
      return [];
    }
  }, []);

  /**
   * Get user's active calls
   */
  const getActiveCalls = useCallback(async (): Promise<Call[]> => {
    try {
      const response = await fetch('/api/calls?active=true');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.calls;
    } catch (err) {
      console.error('Failed to get active calls:', err);
      return [];
    }
  }, []);

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  useEffect(() => {
    return () => {
      // Leave call on unmount if still active
      if (callIdRef.current) {
        fetch('/api/calls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'leave',
            callId: callIdRef.current,
          }),
        }).catch(console.error);
      }
    };
  }, []);

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State
    activeCall,
    token,
    isLoading,
    error,

    // Media state
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isRecording,
    handRaised,

    // Call management
    startCall,
    joinCall,
    leaveCall,
    endCall,

    // Media controls
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleHandRaise,

    // Participant management
    muteParticipant,
    kickParticipant,
    promoteToCoHost,

    // Recording
    startRecording,
    stopRecording,

    // Breakout rooms
    createBreakoutRooms,
    closeBreakoutRooms,

    // Fetch
    getCall,
    getChannelCalls,
    getActiveCalls,
  };
}

// ============================================================================
// Active Call Hook
// ============================================================================

export function useActiveCall() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCalls = async () => {
      try {
        const response = await fetch('/api/calls?active=true');
        const data = await response.json();

        if (response.ok) {
          setCalls(data.calls);
        }
      } catch (err) {
        console.error('Failed to fetch active calls:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveCalls();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchActiveCalls, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    calls,
    isLoading,
    hasActiveCall: calls.length > 0,
  };
}

export default useVoiceVideo;
