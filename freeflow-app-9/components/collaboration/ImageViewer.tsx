'use client';

import React, { useState, useRef, MouseEvent } from 'react';
import CommentPopover from './CommentPopover';

interface ImageViewerProps {
  imageUrl: string;
  onAddComment: (comment: string, region: Region) => void;
}

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, onAddComment }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCoords = (e: MouseEvent): { x: number, y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setShowPopover(false);
    setRegion(null);
    const { x, y } = getCoords(e);
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(e);
    const newRegion: Region = {
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    };
    setRegion(newRegion);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (region && region.width > 5 && region.height > 5) {
      setShowPopover(true);
    }
  };

  const handleCommentSubmit = (comment: string) => {
    if (region) {
      onAddComment(comment, region);
    }
    setShowPopover(false);
    setRegion(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: 'crosshair'  }}
    >
      <img src={imageUrl} alt="design-proof" className="select-none" />

      {region && (
        <div
          className="absolute border-2 border-red-500 bg-red-500 bg-opacity-30"
          style={{ left: region.x,
            top: region.y,
            width: region.width,
            height: region.height,
           }}
        />
      )}

      {showPopover && region && (
        <div
          className="absolute"
          style={{ left: region.x + region.width + 5,
            top: region.y,
           }}
        >
          <CommentPopover onComment={handleCommentSubmit} />
        </div>
      )}
    </div>
  );
};

export default ImageViewer; 