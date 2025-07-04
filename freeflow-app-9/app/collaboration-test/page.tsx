'use client';

import FeedbackSidebar from '@/components/collaboration/FeedbackSidebar';
import BlockEditor from '@/components/collaboration/BlockEditor';
import SuggestionModeToggle from '@/components/collaboration/SuggestionModeToggle';
import ImageViewer from '@/components/collaboration/ImageViewer';
import VideoPlayer from '@/components/collaboration/VideoPlayer';
import AudioPlayer from '@/components/collaboration/AudioPlayer';
import CodeBlockViewer from '@/components/collaboration/CodeBlockViewer';
import React, { useState } from 'react';
import { useCollaboration } from '@/hooks/collaboration/useCollaboration';

const CollaborationTestPage = () => {
  const MOCK_DOCUMENT_ID = 1;
  const [isSuggestionMode, setIsSuggestionMode] = useState(false);
  const { addFeedback } = useCollaboration(MOCK_DOCUMENT_ID);

  const handleImageComment = (comment: string, region: any) => addFeedback({ document_id: MOCK_DOCUMENT_ID, comment, target_type: 'image', target_id: 'image-1', context_data: { region } });
  const handleVideoComment = (comment: string, timestamp: number) => addFeedback({ document_id: MOCK_DOCUMENT_ID, comment, target_type: 'video', target_id: 'video-1', context_data: { timestamp: formatTime(timestamp) } });
  const handleAudioComment = (comment: string, timestamp: number) => addFeedback({ document_id: MOCK_DOCUMENT_ID, comment, target_type: 'audio', target_id: 'audio-1', context_data: { timestamp: formatTime(timestamp) } });
  const handleCodeComment = (comment: string, selection: { from: number; to: number }) => addFeedback({ document_id: MOCK_DOCUMENT_ID, comment, target_type: 'code', target_id: 'code-block-1', context_data: { code_selection: selection } });

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const sampleCode = `function greet(name) {\n  // A simple greeting function\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));`;

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-8 flex flex-col items-start overflow-y-auto space-y-8">
        <div>
          <SuggestionModeToggle isSuggestionMode={isSuggestionMode} onToggle={setIsSuggestionMode} />
        </div>
        <div className="w-full">
          <BlockEditor isSuggestionMode={isSuggestionMode} />
        </div>
        
        <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Code Review</h2>
            <CodeBlockViewer code={sampleCode} language="javascript" onAddComment={handleCodeComment} />
        </div>

        <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Audio Proof</h2>
            <AudioPlayer audioUrl="https://wavesurfer-js.org/example/media/demo.wav" onAddComment={handleAudioComment} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div>
                <h2 className="text-xl font-bold mb-4">Video Proof</h2>
                <VideoPlayer videoUrl="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" onAddComment={handleVideoComment} />
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4">Design Proof</h2>
                <ImageViewer imageUrl="https://placehold.co/800x450" onAddComment={handleImageComment} />
            </div>
        </div>
      </main>
      <FeedbackSidebar documentId={MOCK_DOCUMENT_ID} />
    </div>
  );
};

export default CollaborationTestPage; 