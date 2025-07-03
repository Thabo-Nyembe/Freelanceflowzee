import { createMocks } from 'node-mocks-http';
import { POST, GET } from '../route';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Analytics API Route', () => {
  const mockVideoId = 'test-video-id';
  const mockUserId = 'test-user-id';
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock cookies
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue({ value: 'test-cookie' }),
      set: jest.fn(),
      delete: jest.fn(),
    });

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { id: mockUserId } } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: mockVideoId, user_id: mockUserId },
        }),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      }),
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('POST /api/video/[id]/analytics', () => {
    it('should track video view', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'view',
          data: {
            duration: 300,
            quality: 'hd',
            platform: 'web',
          },
        },
        query: {
          id: mockVideoId,
        },
      });

      await POST(req, { params: { id: mockVideoId } });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('track_video_view', {
        _video_id: mockVideoId,
        _user_id: mockUserId,
        _duration: 300,
        _quality: 'hd',
        _platform: 'web',
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should track watch time', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 5000);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'watch_time',
          data: {
            startTime,
            endTime,
            duration: 300,
            progress: 75,
          },
        },
        query: {
          id: mockVideoId,
        },
      });

      await POST(req, { params: { id: mockVideoId } });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('record_watch_time', {
        _video_id: mockVideoId,
        _user_id: mockUserId,
        _start_time: startTime,
        _end_time: endTime,
        _duration: 300,
        _progress: 75,
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should track engagement event', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'engagement',
          data: {
            eventType: 'seek',
            data: { from: 30, to: 60 },
          },
        },
        query: {
          id: mockVideoId,
        },
      });

      await POST(req, { params: { id: mockVideoId } });

      expect(mockSupabase.from).toHaveBeenCalledWith('video_engagement_events');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        video_id: mockVideoId,
        user_id: mockUserId,
        event_type: 'seek',
        data: { from: 30, to: 60 },
      });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should handle invalid event type', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          type: 'invalid',
          data: {},
        },
        query: {
          id: mockVideoId,
        },
      });

      await POST(req, { params: { id: mockVideoId } });
      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe('GET /api/video/[id]/analytics', () => {
    it('should return analytics data', async () => {
      const mockAnalytics = {
        totalViews: 100,
        uniqueViewers: 50,
        averageWatchTime: 180,
        completionRate: 75,
        engagementScore: 8.5,
        viewsByDay: [
          { date: '2024-03-01', views: 30 },
          { date: '2024-03-02', views: 40 },
        ],
        engagementByType: {
          play: 80,
          pause: 60,
          seek: 20,
        },
      };

      mockSupabase.from().select.mockImplementation((query) => {
        if (query === '*') {
          return {
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  total_views: 30,
                  unique_viewers: 20,
                  average_watch_time: 180,
                  completion_rate: 75,
                  engagement_score: 8.5,
                  date: '2024-03-01',
                },
                {
                  total_views: 40,
                  unique_viewers: 30,
                  average_watch_time: 180,
                  completion_rate: 75,
                  engagement_score: 8.5,
                  date: '2024-03-02',
                },
              ],
            }),
          };
        }
        return {
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({
            data: [
              { event_type: 'play', count: 80 },
              { event_type: 'pause', count: 60 },
              { event_type: 'seek', count: 20 },
            ],
          }),
        };
      });

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: mockVideoId,
        },
      });

      await GET(req, { params: { id: mockVideoId } });

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(mockAnalytics);
    });

    it('should handle video not found', async () => {
      mockSupabase.from().select.mockImplementation(() => ({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
      }));

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          id: 'non-existent-id',
        },
      });

      await GET(req, { params: { id: 'non-existent-id' } });
      expect(res._getStatusCode()).toBe(404);
    });
  });
}); 