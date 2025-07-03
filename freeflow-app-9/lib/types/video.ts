import { z } from 'zod';

// Analytics Event Types
export const VideoEventType = z.enum(['play', 'pause', 'seek', 'complete', 'error']);
export type VideoEventType = z.infer<typeof VideoEventType>;

// Analytics Data Schemas
export const VideoViewSchema = z.object({
  videoId: z.string(),
  userId: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
  duration: z.number(),
  quality: z.string().optional(),
  platform: z.string().optional(),
});
export type VideoView = z.infer<typeof VideoViewSchema>;

export const VideoWatchTimeSchema = z.object({
  videoId: z.string(),
  userId: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  duration: z.number(),
  progress: z.number().min(0).max(100),
});
export type VideoWatchTime = z.infer<typeof VideoWatchTimeSchema>;

export const VideoEngagementEventSchema = z.object({
  videoId: z.string(),
  userId: z.string().optional(),
  eventType: VideoEventType,
  timestamp: z.date().default(() => new Date()),
  data: z.record(z.unknown()).optional(),
});
export type VideoEngagementEvent = z.infer<typeof VideoEngagementEventSchema>;

// Analytics Response Types
export const VideoAnalyticsSummarySchema = z.object({
  totalViews: z.number(),
  uniqueViewers: z.number(),
  averageWatchTime: z.number(),
  completionRate: z.number(),
  engagementScore: z.number(),
  viewsByDay: z.array(z.object({
    date: z.string(),
    views: z.number(),
  })),
  engagementByType: z.record(z.number()),
});
export type VideoAnalyticsSummary = z.infer<typeof VideoAnalyticsSummarySchema>; 