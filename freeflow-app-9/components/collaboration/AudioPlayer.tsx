'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import CommentPopover from './CommentPopover';

interface AudioPlayerProps {
  audioUrl: string;
  onAddComment: (comment: string, timestamp: number) => void;
}

// WaveSurfer is dynamically imported to reduce initial bundle size (~100KB)
// The library is only loaded when an audio player component is rendered
const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onAddComment }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wavesurferRef = useRef<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!waveformRef.current) return;

    let wavesurfer: unknown;

    // Dynamically import wavesurfer.js to reduce initial bundle
    const loadWaveSurfer = async () => {
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default;

        if (!waveformRef.current) return;

        wavesurfer = WaveSurfer.create({
          container: waveformRef.current,
          waveColor: 'rgb(200, 200, 200)',
          progressColor: 'rgb(100, 100, 100)',
          url: audioUrl,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
        });

        wavesurferRef.current = wavesurfer;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ws = wavesurfer as any;
        ws.on('audioprocess', (time: number) => setCurrentTime(time));
        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('seeking', (time: number) => setCurrentTime(time));
        ws.on('interaction', () => {
          ws.play();
          setShowPopover(true);
        });
        ws.on('ready', () => setIsLoading(false));
      } catch (error) {
        console.error('Failed to load WaveSurfer:', error);
        setIsLoading(false);
      }
    };

    loadWaveSurfer();

    return () => {
      if (wavesurferRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (wavesurferRef.current as any).destroy();
      }
    };
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, []);

  const handleCommentSubmit = useCallback((comment: string) => {
    onAddComment(comment, currentTime);
    setShowPopover(false);
  }, [onAddComment, currentTime]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      {isLoading && (
        <div className="h-20 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Loading audio waveform...
          </div>
        </div>
      )}
      <div ref={waveformRef} className={isLoading ? 'invisible h-0' : ''} />
      <div className="mt-4 flex items-center space-x-4 relative">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="font-mono text-gray-700">{formatTime(currentTime)}</div>

        {showPopover && (
          <div className="absolute top-12 left-0 z-10">
            <CommentPopover onComment={handleCommentSubmit} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
