'use client';

import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import CommentPopover from './CommentPopover';

interface AudioPlayerProps {
  audioUrl: string;
  onAddComment: (comment: string, timestamp: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, onAddComment }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(200, 200, 200)',
      progressColor: 'rgb(100, 100, 100)',
      url: audioUrl,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
    });
    wavesurferRef.current = wavesurfer;

    wavesurfer.on('audioprocess', (time) => setCurrentTime(time));
    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('seeking', (time) => setCurrentTime(time));
    wavesurfer.on('interaction', () => {
        wavesurfer.play();
        setShowPopover(true);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    wavesurferRef.current?.playPause();
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleCommentSubmit = (comment: string) => {
    onAddComment(comment, currentTime);
    setShowPopover(false);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div ref={waveformRef} />
      <div className="mt-4 flex items-center space-x-4 relative">
        <button
          onClick={handlePlayPause}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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