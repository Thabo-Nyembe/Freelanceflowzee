'use client';

import FeedbackSidebar from '@/components/collaboration/FeedbackSidebar';
import BlockEditor from '@/components/collaboration/BlockEditor';
import SuggestionModeToggle from '@/components/collaboration/SuggestionModeToggle';
import ImageViewer from '@/components/collaboration/ImageViewer';
import React, { useState } from 'react';
import { useCollaboration } from '@/hooks/collaboration/useCollaboration';

const CollaborationTestPage = () => {
  const MOCK_DOCUMENT_ID = 1;
  const [isSuggestionMode, setIsSuggestionMode] = useState(false);
  const { addFeedback } = useCollaboration(MOCK_DOCUMENT_ID);

  const handleImageComment = (comment: string, region: any) => {
    addFeedback({
      document_id: MOCK_DOCUMENT_ID,
      comment,
      target_type: 'image',
      target_id: 'image-1', // In a real app, this would be the image's unique ID
      context_data: {
        region,
      },
    });
    console.log('Image comment added:', { comment, region });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-8 flex flex-col items-start">
        <div className="mb-4">
          <SuggestionModeToggle 
            isSuggestionMode={isSuggestionMode}
            onToggle={setIsSuggestionMode}
          />
        </div>
        <div className="w-full">
          <BlockEditor isSuggestionMode={isSuggestionMode} />
        </div>
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Design Proof</h2>
            <ImageViewer 
                imageUrl="https://placehold.co/800x400" 
                onAddComment={handleImageComment} 
            />
        </div>
      </main>
      <FeedbackSidebar documentId={MOCK_DOCUMENT_ID} />
    </div>
  );
};

export default CollaborationTestPage; 