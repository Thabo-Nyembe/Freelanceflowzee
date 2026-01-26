'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import CommentPopover from './CommentPopover';

// Dynamically import react-syntax-highlighter to reduce initial bundle size (~200KB)
// This component is heavy and not needed for initial page render
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-900 rounded-lg p-4 text-gray-400 font-mono text-sm animate-pulse">
        Loading code viewer...
      </div>
    )
  }
);

interface CodeBlockViewerProps {
  code: string;
  language: string;
  onAddComment: (comment: string, selection: { from: number; to: number }) => void;
}

const CodeBlockViewer: React.FC<CodeBlockViewerProps> = ({ code, language, onAddComment }) => {
  const [selectedLines, setSelectedLines] = useState<{ from: number; to: number } | null>(null);
  const [lastSelected, setLastSelected] = useState<number | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [style, setStyle] = useState<Record<string, React.CSSProperties> | null>(null);

  // Dynamically import the style to further reduce bundle
  useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/prism').then((mod) => {
      setStyle(mod.atomDark);
    });
  }, []);

  const handleLineClick = (lineNumber: number, isShiftClick: boolean) => {
    setShowPopover(false);

    if (isShiftClick && lastSelected) {
      setSelectedLines({
        from: Math.min(lastSelected, lineNumber),
        to: Math.max(lastSelected, lineNumber),
      });
    } else {
      setSelectedLines({ from: lineNumber, to: lineNumber });
      setLastSelected(lineNumber);
    }
  };

  const handleCommentSubmit = (comment: string) => {
    if (selectedLines) {
      onAddComment(comment, selectedLines);
    }
    setShowPopover(false);
    setSelectedLines(null);
    setLastSelected(null);
  };

  const getLineProps = (lineNumber: number) => {
    const isSelected = selectedLines && lineNumber >= selectedLines.from && lineNumber <= selectedLines.to;
    return {
      'data-line-number': lineNumber,
      style: {
        display: 'block',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(255, 255, 0, 0.2)' : 'transparent',
      },
      onClick: (e: React.MouseEvent<HTMLElement>) => handleLineClick(lineNumber, e.shiftKey),
    };
  };

  if (!style) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 text-gray-400 font-mono text-sm">
        <pre>{code}</pre>
      </div>
    );
  }

  return (
    <div className="relative">
      <SyntaxHighlighter
        language={language}
        style={style}
        showLineNumbers
        wrapLines
        lineProps={getLineProps}
      >
        {code}
      </SyntaxHighlighter>

      {selectedLines && !showPopover && (
        <div className="absolute top-2 right-2">
            <button
                onClick={() => setShowPopover(true)}
                className="px-3 py-1 bg-white text-black rounded-md shadow"
            >
                Comment on lines {selectedLines.from}-{selectedLines.to}
            </button>
        </div>
      )}

      {showPopover && selectedLines && (
        <div className="absolute z-10" style={{ top: `${selectedLines.from * 1.5}em`, right: '1em' }}>
            <CommentPopover onComment={handleCommentSubmit} />
        </div>
      )}
    </div>
  );
};

export default CodeBlockViewer;
