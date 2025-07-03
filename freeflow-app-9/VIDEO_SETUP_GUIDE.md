# 🎥 FreeFlow Video Infrastructure Setup Guide

## 🚀 Overview

This guide will help you set up the complete video infrastructure for FreeFlow, transforming it into a professional video-enabled freelance platform similar to Cap.so.

## 📋 Prerequisites

- FreeFlow app already running (existing V2 database)
- Supabase project with admin access
- Mux account (sign up at [mux.com](https://mux.com))
- Node.js 18+ environment

## 🔧 Step 1: Database Migration

### Apply the Video Schema

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Migration Script**
   - Open the file: `scripts/V3_video_infrastructure_migration.sql`
   - Copy the entire content
   - Paste and execute in Supabase SQL Editor

3. **Verify Installation**
   ```sql
   -- Check if video tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'video%';
   
   -- Should return: videos, video_comments, video_shares, video_analytics, video_thumbnails
   ```

## 🔑 Step 2: Environment Configuration

### Set Up Mux API Keys

1. **Get Mux Credentials**
   - Log into your Mux account
   - Go to Settings → Access Tokens
   - Create a new token with Video permissions
   - Copy the Token ID and Token Secret

2. **Configure Environment Variables**
   Add these to your `.env.local` file:
   ```bash
   # Mux Configuration
   MUX_TOKEN_ID=your_mux_token_id_here
   MUX_TOKEN_SECRET=your_mux_token_secret_here
   MUX_WEBHOOK_SECRET=your_webhook_secret_here
   MUX_ENVIRONMENT=sandbox  # or "production"
   
   # Video Upload Settings
   NEXT_PUBLIC_MAX_VIDEO_SIZE_MB=500
   NEXT_PUBLIC_SUPPORTED_VIDEO_FORMATS=mp4,mov,avi,webm,mkv
   VIDEO_PROCESSING_TIMEOUT_MINUTES=30
   
   # Optional: Development
   VIDEO_DEBUG=true
   MOCK_MUX_API=false
   ```

3. **Verify Configuration**
   ```bash
   # Test the configuration
   npm run dev
   # Check console for any Mux connection errors
   ```

## 🛠️ Step 3: API Implementation

The core infrastructure is already set up in:
- `lib/video/config.ts` - Configuration management
- `lib/video/mux-client.ts` - Mux API client
- `lib/video/types.ts` - TypeScript definitions

### Next Steps (Automated by Todo List):

✅ **Completed:**
1. Video Infrastructure Setup
2. Database Schema & Types

🔄 **In Progress:**
3. Video Upload API Implementation

📅 **Upcoming:**
4. Screen Recording Component
5. Video Player with Mux
6. Real-time Status Polling
7. Video Sharing Routes
8. AI Transcription Integration

## 🎯 Key Features Enabled

### Core Video Management
- ✅ Mux integration for professional video processing
- ✅ Database schema with full video lifecycle
- ✅ TypeScript types for type-safe development
- ✅ Upload progress tracking
- ✅ Video status monitoring

### Advanced Features (In Development)
- 🔄 AI transcription and analysis
- 🔄 Real-time video processing status
- 🔄 Cap-style video sharing with permissions
- 🔄 Video analytics and engagement tracking
- 🔄 Timestamp-based video comments
- 🔄 Screen recording capabilities

### Integration with FreeFlow
- ✅ Seamless project integration
- ✅ Client video sharing workflows
- ✅ AI-powered video analysis
- ✅ Analytics dashboard integration

## 📊 Database Schema Overview

### Core Tables Created:
1. **`videos`** - Main video records with Mux integration
2. **`video_comments`** - Timestamp-based commenting system
3. **`video_shares`** - Access control and sharing management
4. **`video_analytics`** - Detailed viewing and engagement analytics
5. **`video_thumbnails`** - Multi-format thumbnail management

### Enhanced Projects Table:
- Added `video_count`, `total_video_duration_seconds`
- Added `video_settings` for project-level video configuration

## 🔗 API Endpoints (Auto-Generated)

The following API routes will be created automatically:

### Video Management
- `POST /api/video/upload` - Create upload URL
- `GET /api/video/[id]` - Get video details
- `PATCH /api/video/[id]` - Update video
- `DELETE /api/video/[id]` - Delete video

### Video Processing
- `GET /api/video/[id]/status` - Get processing status
- `POST /api/video/webhooks/mux` - Mux webhook handler

### Video Sharing
- `POST /api/video/[id]/share` - Create share link
- `GET /api/video/share/[shareId]` - Access shared video

### Video Analytics
- `POST /api/video/[id]/analytics` - Track viewing events
- `GET /api/video/[id]/analytics` - Get analytics data

## 🎬 Component Structure (Auto-Generated)

### Video Components
- `VideoUploader` - Drag & drop upload with progress
- `VideoPlayer` - Mux player with custom controls
- `VideoThumbnail` - Smart thumbnail with fallbacks
- `VideoComments` - Timestamp-based commenting
- `VideoShare` - Sharing modal with permissions

### Screen Recording
- `ScreenRecorder` - Browser-based screen capture
- `RecordingControls` - Start/stop/pause controls
- `RecordingPreview` - Real-time preview

### Analytics
- `VideoAnalytics` - Engagement metrics dashboard
- `ViewerMap` - Geographic viewer distribution
- `EngagementChart` - Time-series engagement data

## 🚨 Troubleshooting

### Common Issues

1. **Mux Authentication Errors**
   ```bash
   # Verify your environment variables
   echo $MUX_TOKEN_ID
   echo $MUX_TOKEN_SECRET
   ```

2. **Database Migration Errors**
   - Ensure you have admin access to Supabase
   - Check if the projects table exists from V2 migration
   - Verify all extensions are enabled

3. **Upload Issues**
   - Check file size limits
   - Verify supported formats
   - Test network connectivity to Mux

### Getting Help

- Check the browser console for detailed error messages
- Review Mux dashboard for processing status
- Monitor Supabase logs for database issues

## 🎉 What's Next?

Once this setup is complete, you'll have a solid foundation for:
1. **Professional Video Management** - Upload, process, and manage videos
2. **Client Collaboration** - Share videos with specific permissions
3. **Advanced Analytics** - Track engagement and viewer behavior
4. **AI Integration** - Automatic transcription and content analysis
5. **Screen Recording** - Capture and share screen recordings
6. **Project Integration** - Videos tied to specific client projects

The automated todo system will guide you through implementing each feature systematically.

---

**Ready to proceed?** The next task in the todo list will implement the video upload API endpoints! 