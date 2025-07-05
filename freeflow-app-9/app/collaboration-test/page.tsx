'use client';

import FeedbackSidebar from '@/components/collaboration/FeedbackSidebar';
import BlockEditor from '@/components/collaboration/BlockEditor';
import SuggestionModeToggle from '@/components/collaboration/SuggestionModeToggle';
import React, { useState } from 'react';

const CollaborationTestPage = () => {
  const MOCK_DOCUMENT_ID = 1;
  const [isSuggestionMode, setIsSuggestionMode] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-8 flex flex-col">
        <div className="mb-4 self-start">
          <SuggestionModeToggle 
            isSuggestionMode={isSuggestionMode}
            onToggle={setIsSuggestionMode}
          />
        </div>
        <BlockEditor />
      </main>
      <FeedbackSidebar documentId={MOCK_DOCUMENT_ID} />
    </div>
  );
};

export default CollaborationTestPage; 