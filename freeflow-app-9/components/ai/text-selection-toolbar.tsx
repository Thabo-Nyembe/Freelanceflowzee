"use client";

import { Button } from '@/components/ui/button';
import { Pen, Briefcase, AlignCenter, Loader2 } from 'lucide-react';

interface TextSelectionToolbarProps {
  isVisible: boolean;
  position: { top: number; left: number };
  onTransform: (command: 'improve' | 'professional' | 'summarize') => void;
  loading: boolean;
}

export function TextSelectionToolbar({ isVisible, position, onTransform, loading }: TextSelectionToolbarProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute z-50 bg-white shadow-lg rounded-lg p-1 flex items-center space-x-1 border border-gray-200"
      style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
    >
      {loading ? (
        <div className="flex items-center px-4 py-1 text-sm">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Working...</span>
        </div>
      ) : (
        <>
          <Button variant="ghost" size="sm" onClick={() => onTransform('improve')}>
            <Pen className="h-4 w-4 mr-1" />
            Improve
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onTransform('professional')}>
            <Briefcase className="h-4 w-4 mr-1" />
            Professional
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onTransform('summarize')}>
            <AlignCenter className="h-4 w-4 mr-1" />
            Summarize
          </Button>
        </>
      )}
    </div>
  );
}

