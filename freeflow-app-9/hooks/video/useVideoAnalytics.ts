'use client';

import { useState, useCallback } from 'react';

interface VideoAnalyticsProps {
  videoId: string;
  onError?: (error: Error) => void;
}

interface EngagementData {
  from?: number;
  to?: number;
  message?: string;
  code?: number;
}

export function useVideoAnalytics({ videoId, onError }: VideoAnalyticsProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    console.error('Video analytics error:', error);
    onError?.(error);
  }, [onError]);

  const startWatchSession = useCallback(async (duration: number) => {
    try {
      const response = await fetch('/api/video/analytics/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, duration }),
      });

      if (!response.ok) throw new Error('Failed to start watch session');

      const data = await response.json();
      setSessionId(data.sessionId);
    } catch (error) {
      handleError(error as Error);
    }
  }, [videoId, handleError]);

  const endWatchSession = useCallback(async (progress: number) => {
    if (!sessionId) return;

    try {
      await fetch('/api/video/analytics/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, progress }),
      });
    } catch (error) {
      handleError(error as Error);
    }
  }, [sessionId, handleError]);

  const trackEngagement = useCallback(async (
    action: 'play' | 'pause' | 'seek' | 'error' | 'complete',
    data?: EngagementData
  ) => {
    if (!sessionId) return;

    try {
      await fetch('/api/video/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          videoId,
          action,
          ...data,
        }),
      });
    } catch (error) {
      handleError(error as Error);
    }
  }, [sessionId, videoId, handleError]);

  return {
    startWatchSession,
    endWatchSession,
    trackEngagement,
  };
}
