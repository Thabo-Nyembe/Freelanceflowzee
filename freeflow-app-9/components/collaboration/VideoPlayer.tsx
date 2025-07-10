'use client';

import React, { useState, useRef, SyntheticEvent } from 'react';
import CommentPopover from './CommentPopover';

interface VideoPlayerProps {
  videoUrl: string;
  onAddComment: (comment: string, timestamp: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onAddComment }) => {
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handlePlayPause = () => {
    setIsPaused(videoRef.current?.paused ?? true);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleAddCommentClick = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setShowPopover(true);
  };

  const handleCommentSubmit = (comment: string) => {
    onAddComment(comment, currentTime);
    setShowPopover(false);
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full rounded-lg"
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlayPause}
        onPause={handlePlayPause}
      />
      <div className="mt-2 flex items-center space-x-4">
        <button
          onClick={handleAddCommentClick}
          disabled={!isPaused}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
        >
          Comment at {formatTime(currentTime)}
        </button>
      </div>

      {showPopover && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <CommentPopover onComment={handleCommentSubmit} />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 