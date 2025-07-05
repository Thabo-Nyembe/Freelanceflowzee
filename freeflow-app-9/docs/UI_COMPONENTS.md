# UI Components Documentation

This document provides an overview of the Cap-inspired UI components created for the FreeFlow application.

## 1. ShareHeader

- **Location**: `components/video/share-header.tsx`
- **Purpose**: Provides a consistent header for the video page, displaying key information and actions.
- **Features**:
  - Displays the video title.
  - Shows the author's avatar, name, and a link to their profile.
  - Includes a "Share" button which opens the `VideoShareDialog`.
  - Provides a "Back to Dashboard" link.
- **Usage**:
  ```tsx
  import { ShareHeader } from '@/components/video/share-header';
  
  <ShareHeader video={videoData} author={authorData} />
  ```

## 2. Skeleton & Loading States

### 2.1. Skeleton Component

- **Location**: `components/ui/skeleton.tsx`
- **Purpose**: A generic, reusable component to create placeholder loading states. It renders a simple, animated, greyed-out block.
- **Usage**:
  ```tsx
  import { Skeleton } from '@/components/ui/skeleton';

  <Skeleton className="h-10 w-1/2" />
  ```

### 2.2. VideoPageSkeleton

- **Location**: `components/video/video-page-skeleton.tsx`
- **Purpose**: A specific loading state for the main video page (`/video/[id]`). It uses the `Skeleton` component to create a high-fidelity placeholder that mimics the layout of the final page.
- **Features**:
  - Placeholder for the `ShareHeader`.
  - Placeholder for the video player.
  - Placeholders for the metadata and comments sections.
- **Usage**: Typically used with `React.Suspense`.
  ```tsx
  import { Suspense } from 'react';
  import { VideoPageSkeleton } from '@/components/video/video-page-skeleton';

  <Suspense fallback={<VideoPageSkeleton />}>
    {/* Page content */}
  </Suspense>
  ```

## 3. VideoMetadata

- **Location**: `components/video/video-metadata.tsx`
- **Purpose**: Displays detailed information about a video in a structured and clean layout.
- **Features**:
  - "About this video" title.
  - Displays view count and upload date with icons.
  - Renders the video description using `@tailwindcss/typography` for nice formatting.
- **Usage**:
  ```tsx
  import { VideoMetadata } from '@/components/video/video-metadata';

  <VideoMetadata video={videoData} />
  ```

## 4. LazyVideoPlayer

- **Location**: `components/video/lazy-video-player.tsx`
- **Purpose**: A wrapper component that lazy-loads the main `VideoPlayer` using `next/dynamic`. This is a performance optimization that prevents the heavy video player code from being included in the initial page bundle.
- **Features**:
  - Shows a loading spinner while the player is being loaded.
  - Disables Server-Side Rendering (SSR) for the player since it's a client-only component.
- **Usage**: Use this component in place of the standard `VideoPlayer` on pages where the player is not the most critical initial element.
  ```tsx
  import LazyVideoPlayer from '@/components/video/lazy-video-player';

  <LazyVideoPlayer playbackId={video.mux_playback_id} />
  ``` 