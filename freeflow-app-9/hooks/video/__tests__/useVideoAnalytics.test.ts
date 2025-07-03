import { renderHook, act } from '@testing-library/react';
import { useVideoAnalytics } from '../useVideoAnalytics';

// Mock fetch
global.fetch = jest.fn();

describe('useVideoAnalytics', () => {
  const mockVideoId = 'test-video-id';
  const mockError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should track initial view on mount', async () => {
    renderHook(() => useVideoAnalytics({ videoId: mockVideoId, onError: mockError }));

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/video/${mockVideoId}/analytics`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"type":"view"'),
      })
    );
  });

  it('should track watch session', async () => {
    const { result } = renderHook(() =>
      useVideoAnalytics({ videoId: mockVideoId, onError: mockError })
    );

    // Start watch session
    await act(async () => {
      result.current.startWatchSession(300);
    });

    // End watch session with 50% progress
    await act(async () => {
      result.current.endWatchSession(50);
    });

    // Check if watch_time event was tracked
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/video/${mockVideoId}/analytics`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"type":"watch_time"'),
      })
    );

    const lastCall = (global.fetch as jest.Mock).mock.calls.slice(-1)[0];
    const body = JSON.parse(lastCall[1].body);
    expect(body.data.progress).toBe(50);
    expect(body.data.duration).toBe(300);
  });

  it('should track engagement events', async () => {
    const { result } = renderHook(() =>
      useVideoAnalytics({ videoId: mockVideoId, onError: mockError })
    );

    // Track a seek event
    await act(async () => {
      result.current.trackEngagement('seek', { from: 30, to: 60 });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/video/${mockVideoId}/analytics`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"type":"engagement"'),
      })
    );

    const lastCall = (global.fetch as jest.Mock).mock.calls.slice(-1)[0];
    const body = JSON.parse(lastCall[1].body);
    expect(body.data.eventType).toBe('seek');
    expect(body.data.data).toEqual({ from: 30, to: 60 });
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    (global.fetch as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() =>
      useVideoAnalytics({ videoId: mockVideoId, onError: mockError })
    );

    // Try to track an event
    await act(async () => {
      result.current.trackEngagement('play');
    });

    expect(mockError).toHaveBeenCalledWith(error);
  });

  it('should handle non-OK responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const { result } = renderHook(() =>
      useVideoAnalytics({ videoId: mockVideoId, onError: mockError })
    );

    // Try to track an event
    await act(async () => {
      result.current.trackEngagement('play');
    });

    expect(mockError).toHaveBeenCalledWith(
      expect.any(Error)
    );
  });

  it('should clean up watch session on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useVideoAnalytics({ videoId: mockVideoId, onError: mockError })
    );

    // Start watch session
    await act(async () => {
      result.current.startWatchSession(300);
    });

    // Unmount should trigger endWatchSession
    await act(async () => {
      unmount();
    });

    // Check if watch_time event was tracked
    const watchTimeCall = (global.fetch as jest.Mock).mock.calls.find(
      call => JSON.parse(call[1].body).type === 'watch_time'
    );
    expect(watchTimeCall).toBeTruthy();
  });
}); 