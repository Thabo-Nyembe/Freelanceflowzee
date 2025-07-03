# Video Analytics Documentation

This document describes the video analytics implementation in the FreeFlow platform, including the database schema, API endpoints, and usage guidelines.

## Database Schema

The video analytics system uses several tables to track different aspects of video engagement:

### video_views
- Tracks individual video view events
- Fields:
  - `id`: UUID (primary key)
  - `video_id`: UUID (references videos.id)
  - `user_id`: UUID (references users.id, nullable)
  - `timestamp`: Timestamp with timezone
  - `duration`: Integer (seconds)
  - `quality`: Text (video quality)
  - `platform`: Text (viewing platform)

### video_watch_time
- Records detailed watch time sessions
- Fields:
  - `id`: UUID (primary key)
  - `video_id`: UUID (references videos.id)
  - `user_id`: UUID (references users.id, nullable)
  - `start_time`: Timestamp with timezone
  - `end_time`: Timestamp with timezone
  - `duration`: Integer (seconds)
  - `progress`: Integer (0-100)

### video_engagement_events
- Stores user interaction events
- Fields:
  - `id`: UUID (primary key)
  - `video_id`: UUID (references videos.id)
  - `user_id`: UUID (references users.id, nullable)
  - `event_type`: Text (play, pause, seek, etc.)
  - `data`: JSONB (additional event data)
  - `timestamp`: Timestamp with timezone

### video_daily_analytics
- Aggregated daily statistics
- Fields:
  - `id`: UUID (primary key)
  - `video_id`: UUID (references videos.id)
  - `date`: Date
  - `total_views`: Integer
  - `unique_viewers`: Integer
  - `average_watch_time`: Integer (seconds)
  - `completion_rate`: Integer (0-100)
  - `engagement_score`: Float

## API Endpoints

### POST /api/video/[id]/analytics
Tracks video analytics events.

**Request Body:**
```typescript
{
  type: 'view' | 'watch_time' | 'engagement';
  data: {
    // For type: 'view'
    duration?: number;
    quality?: string;
    platform?: string;
    
    // For type: 'watch_time'
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    progress?: number;
    
    // For type: 'engagement'
    eventType?: VideoEventType;
    data?: Record<string, any>;
  }
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

### GET /api/video/[id]/analytics
Retrieves analytics data for a video.

**Response:**
```typescript
{
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
  engagementByType: Record<string, number>;
}
```

## React Hook Usage

The `useVideoAnalytics` hook provides a simple interface for tracking video events:

```typescript
import { useVideoAnalytics } from '@/hooks/video/useVideoAnalytics';

function VideoPlayer({ videoId }) {
  const { startWatchSession, endWatchSession, trackEngagement } = useVideoAnalytics({
    videoId,
    onError: (error) => console.error('Analytics error:', error),
  });

  // Track video playback
  const handlePlay = () => {
    startWatchSession(videoDuration);
    trackEngagement('play');
  };

  const handlePause = () => {
    const progress = (currentTime / duration) * 100;
    endWatchSession(progress);
    trackEngagement('pause');
  };

  // Track seeking
  const handleSeek = (from: number, to: number) => {
    trackEngagement('seek', { from, to });
  };
}
```

## Analytics Dashboard

The analytics dashboard (`/video/[id]/analytics`) provides:

1. Summary metrics:
   - Total views
   - Unique viewers
   - Average watch time
   - Completion rate

2. Visualizations:
   - Views over time (line chart)
   - Engagement breakdown (bar chart)

## Security Considerations

1. Row-Level Security (RLS) policies ensure users can only:
   - View analytics for their own videos
   - View analytics for public videos
   - Track events for videos they have permission to watch

2. Data validation using Zod schemas prevents invalid data

3. Rate limiting on analytics endpoints prevents abuse

## Performance Optimization

1. Aggregated tables (`video_daily_analytics`) for faster querying

2. Indexes on frequently queried columns:
   - `video_id`
   - `user_id`
   - `timestamp`
   - `date`

3. Batch processing for engagement events

## Error Handling

1. API endpoints include comprehensive error handling:
   - Invalid data validation
   - Database errors
   - Permission errors

2. Client-side error handling through the `onError` callback

3. Failed analytics events are logged for debugging

## Testing

1. API route tests:
   - Event tracking
   - Data retrieval
   - Error cases

2. Hook tests:
   - Event tracking
   - Session management
   - Error handling

3. Integration tests:
   - Video player integration
   - Dashboard rendering 