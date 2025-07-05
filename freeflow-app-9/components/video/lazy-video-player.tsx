'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the VideoPlayer component with a loading state
const VideoPlayer = dynamic(() => import('@/components/video/video-player'), {
  loading: () => (
    <div className="flex aspect-video w-full items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
    </div>
  ),
  ssr: false, // The video player is a client-side component
});

export default VideoPlayer; 