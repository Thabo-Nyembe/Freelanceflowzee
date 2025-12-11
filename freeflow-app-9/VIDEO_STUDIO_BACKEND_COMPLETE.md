# Video Studio Backend Infrastructure - Complete

## Summary

World-class video processing backend infrastructure has been built for the KAZI platform. This implementation uses FFmpeg for professional-grade video processing with job queues for background processing.

## Architecture

### Core Services

1. **FFmpeg Processor** (`lib/video/ffmpeg-processor.ts`)
   - Lazy-loaded FFmpeg with fallback to system installation
   - Video metadata extraction with FFprobe
   - Export with quality presets and codec configurations
   - Thumbnail generation (static and animated)
   - Audio extraction
   - Video compression with target size
   - Video concatenation
   - Watermark overlay
   - Video trimming

2. **Video Queue** (`lib/video/video-queue.ts`)
   - BullMQ-based job queue for background processing
   - Upstash Redis integration for serverless deployment
   - In-memory fallback for development
   - Progress tracking and status updates
   - Database integration for job persistence

3. **Caption Service** (`lib/video/caption-service.ts`)
   - OpenAI Whisper integration for transcription
   - SRT/VTT/JSON format generation
   - Multi-language translation with GPT-4
   - Burn captions into video (hardcode subtitles)

## API Endpoints

### `/api/video` - Main Index
- GET: Returns service status and endpoint documentation

### `/api/video/export`
- POST: Start video export with format conversion
- GET: Check export job status or get service info

**Features:**
- Multi-format: MP4, WebM, MOV, AVI, MKV
- Quality presets: low, medium, high, ultra
- Resolution: 720p, 1080p, 1440p, 4K, original
- Background processing with progress tracking
- Custom codec and bitrate configuration

### `/api/video/thumbnail`
- POST: Generate thumbnails from video
- GET: Service documentation

**Features:**
- Static thumbnails at specific timestamps
- Animated thumbnails (GIF/WebP)
- Auto-generate evenly distributed thumbnails
- Custom dimensions

### `/api/video/caption`
- POST: Generate, translate, or burn captions
- GET: Get project captions or service info

**Actions:**
- `transcribe`: AI transcription with Whisper
- `generate`: Create caption files from transcription
- `translate`: Translate captions to other languages
- `burn`: Hardcode captions into video

### `/api/video/compress`
- POST: Compress video to target size
- GET: Service documentation

**Presets:**
- `web`: Optimized for streaming (720p, 2Mbps)
- `mobile`: Optimized for mobile (480p, 1Mbps)
- `social`: Social media uploads (max 100MB)
- `email`: Email attachments (max 25MB)
- `archive`: Maximum compression

### `/api/video/trim`
- POST: Trim, cut, or extract video segments
- GET: Service documentation

**Actions:**
- `trim`: Extract single segment
- `cut`: Remove a section
- `extract`: Get multiple segments as files
- `split`: Divide at specific timestamps

### `/api/video/merge`
- POST: Merge, concatenate, or overlay videos
- GET: Service documentation

**Actions:**
- `concatenate`: Join multiple videos
- `watermark`: Add image overlay
- `picture-in-picture`: Overlay video in corner

### `/api/video/audio`
- POST: Extract, replace, or enhance audio
- GET: Service documentation

**Actions:**
- `extract`: Extract audio (MP3, AAC, WAV, FLAC, OGG)
- `replace`: Replace/mix audio tracks
- `remove`: Remove audio (silent video)
- `enhance`: Audio enhancement and normalization

## Database Schema

### video_captions table
```sql
- id UUID PRIMARY KEY
- project_id UUID (FK to video_projects)
- user_id UUID (FK to auth.users)
- language VARCHAR(10)
- is_translation BOOLEAN
- source_language VARCHAR(10)
- format VARCHAR(10)
- file_path TEXT
- transcription_text TEXT
- word_count INTEGER
- segment_count INTEGER
- duration DECIMAL
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

### video_projects additions
```sql
- has_captions BOOLEAN
- caption_language VARCHAR(10)
- transcription_data JSONB
- compressed_path TEXT
- compressed_size BIGINT
- compression_ratio DECIMAL
```

## Dependencies

```json
{
  "fluent-ffmpeg": "^2.1.3",
  "@ffmpeg-installer/ffmpeg": "^1.1.0",
  "@ffmpeg-installer/darwin-arm64": "^4.1.5",
  "bullmq": "^5.x",
  "@types/fluent-ffmpeg": "^2.1.26"
}
```

## Environment Variables

```env
# Video Processing
VIDEO_EXPORT_DIR=/tmp/video-exports
VIDEO_THUMBNAIL_DIR=/tmp/video-thumbnails
VIDEO_CAPTION_DIR=/tmp/video-captions
VIDEO_COMPRESS_DIR=/tmp/video-compressed
VIDEO_TRIM_DIR=/tmp/video-trimmed
VIDEO_MERGE_DIR=/tmp/video-merged
VIDEO_AUDIO_DIR=/tmp/video-audio

# Redis (for job queue)
UPSTASH_REDIS_URL=redis://...

# OpenAI (for captions)
OPENAI_API_KEY=sk-...
```

## Quality Presets

| Preset | Video Bitrate | Audio Bitrate | CRF |
|--------|---------------|---------------|-----|
| low    | 1000k         | 96k           | 28  |
| medium | 2500k         | 128k          | 23  |
| high   | 5000k         | 192k          | 18  |
| ultra  | 15000k        | 320k          | 15  |

## Resolution Presets

| Preset | Width | Height |
|--------|-------|--------|
| 720p   | 1280  | 720    |
| 1080p  | 1920  | 1080   |
| 1440p  | 2560  | 1440   |
| 4k     | 3840  | 2160   |

## Build Status

✅ All Video Studio APIs compile successfully
✅ Dynamic FFmpeg loading with fallback
✅ Row Level Security enabled on all tables
✅ TypeScript types for all interfaces

## Usage Examples

### Export Video
```typescript
const response = await fetch('/api/video/export', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 'uuid',
    format: 'mp4',
    quality: 'high',
    resolution: '1080p'
  })
})
```

### Generate Captions
```typescript
const response = await fetch('/api/video/caption', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 'uuid',
    action: 'transcribe',
    format: 'srt'
  })
})
```

### Compress for Social Media
```typescript
const response = await fetch('/api/video/compress', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 'uuid',
    preset: 'social'
  })
})
```

## Files Created

1. `lib/video/ffmpeg-processor.ts` - Core FFmpeg wrapper (~850 lines)
2. `lib/video/video-queue.ts` - Job queue system (~500 lines)
3. `lib/video/caption-service.ts` - Whisper transcription (~520 lines)
4. `app/api/video/route.ts` - API index
5. `app/api/video/export/route.ts` - Export endpoint
6. `app/api/video/thumbnail/route.ts` - Thumbnail endpoint
7. `app/api/video/caption/route.ts` - Caption endpoint
8. `app/api/video/compress/route.ts` - Compression endpoint
9. `app/api/video/trim/route.ts` - Trim endpoint
10. `app/api/video/merge/route.ts` - Merge endpoint
11. `app/api/video/audio/route.ts` - Audio endpoint
12. `supabase/migrations/20251211000001_video_captions_table.sql` - Database migration

## Next Steps

1. Run the database migration for video_captions table
2. Configure environment variables for production
3. Wire Video Studio UI components to these APIs
4. Add CDN integration for video delivery
5. Implement video analytics

---

**Date:** December 11, 2025
**Status:** Complete and Build Verified
