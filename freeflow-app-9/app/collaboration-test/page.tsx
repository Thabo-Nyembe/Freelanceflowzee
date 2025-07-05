'use client';

import FeedbackSidebar from '@/components/collaboration/FeedbackSidebar';
import React from 'react';

const CollaborationTestPage = () => {
  // Using a mock document ID for demonstration purposes.
  // In a real application, this would come from the page's props or URL.
  const MOCK_DOCUMENT_ID = 1;

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Document Content Area</h1>
        <p>This is where the main document or asset (video, text, etc.) would be displayed.</p>
        <p>The sidebar to the right shows the feedback and suggestions for this document.</p>
      </main>
      <FeedbackSidebar documentId={MOCK_DOCUMENT_ID} />
    </div>
  );
};

export default CollaborationTestPage; 