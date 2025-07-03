import { useCallback, useEffect, useRef } from 'react';
import { VideoEventType } from '@/lib/types/video';

interface VideoAnalyticsOptions {
  videoId: string;
  onError?: (error: Error) => void;
}

interface WatchSession {
  startTime: Date;
  duration: number;
  progress: number;
}

export function useVideoAnalytics({ videoId, onError }: VideoAnalyticsOptions) {
  const watchSessionRef = useRef<WatchSession | null>(null);

  const trackEvent = useCallback(async (
    type: 'view' | 'watch_time' | 'engagement',
    data: Record<string, any>
  ) => {
    try {
      const response = await fetch(`/api/video/${videoId}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });

      if (!response.ok) {
        throw new Error('Failed to track video event');
      }
    } catch (error) {
      console.error('Error tracking video event:', error);
      onError?.(error as Error);
    }
  }, [videoId, onError]);

  const startWatchSession = useCallback((duration: number) => {
    watchSessionRef.current = {
      startTime: new Date(),
      duration,
      progress: 0,
    };
  }, []);

  const endWatchSession = useCallback((progress: number) => {
    const session = watchSessionRef.current;
    if (session) {
      const endTime = new Date();
      trackEvent('watch_time', {
        startTime: session.startTime,
        endTime,
        duration: session.duration,
        progress: Math.min(100, Math.max(0, progress)),
      });
      watchSessionRef.current = null;
    }
  }, [trackEvent]);

  const trackEngagement = useCallback((
    eventType: VideoEventType,
    data?: Record<string, any>
  ) => {
    trackEvent('engagement', {
      eventType,
      data: data || {},
    });
  }, [trackEvent]);

  // Track initial view
  useEffect(() => {
    trackEvent('view', {
      timestamp: new Date(),
      duration: 0,
      quality: 'auto',
      platform: navigator.platform,
    });
  }, [trackEvent]);

  return {
    startWatchSession,
    endWatchSession,
    trackEngagement,
  };
}
