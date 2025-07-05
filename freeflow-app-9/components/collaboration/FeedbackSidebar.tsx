'use client';

import React from 'react';
import { useCollaboration } from '@/hooks/collaboration/useCollaboration';
import { Feedback, Suggestion } from '@/lib/types/collaboration';

interface FeedbackSidebarProps {
  documentId: number;
}

const FeedbackSidebar: React.FC<FeedbackSidebarProps> = ({ documentId }) => {
  const { feedback, suggestions, loading, error } = useCollaboration(documentId);

  const renderFeedbackItem = (item: Feedback) => (
    <div key={`feedback-${item.id}`} className="p-4 mb-2 border rounded-lg shadow-sm">
      <p className="text-sm text-gray-600">{item.comment}</p>
      <p className="mt-2 text-xs text-gray-400">
        User {item.user_id.substring(0, 8)} - {new Date(item.created_at).toLocaleDateString()}
      </p>
    </div>
  );

  const renderSuggestionItem = (item: Suggestion) => (
    <div key={`suggestion-${item.id}`} className="p-4 mb-2 border rounded-lg shadow-sm bg-yellow-50">
      <p className="text-sm text-gray-800">
        <strong>Suggestion:</strong> {renderSuggestionText(item.suggestion_data)}
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Status: <span className="font-semibold">{item.status}</span>
      </p>
      <p className="mt-1 text-xs text-gray-400">
        User {item.user_id.substring(0, 8)} - {new Date(item.created_at).toLocaleDateString()}
      </p>
    </div>
  );

  const renderSuggestionText = (data: any) => {
    switch (data.type) {
      case 'insertion':
        return `Insert "${data.text}"`;
      case 'deletion':
        return `Delete "${data.text}"`;
      case 'replacement':
        return `Replace "${data.old_text}" with "${data.new_text}"`;
      default:
        return 'Complex change proposed.';
    }
  };

  if (loading) {
    return <div className="p-4">Loading feedback...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <aside className="w-80 h-full bg-gray-50 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Collaboration</h2>
      
      <h3 className="text-md font-semibold mb-2">Comments</h3>
      {feedback.length > 0 ? (
        feedback.map(renderFeedbackItem)
      ) : (
        <p className="text-sm text-gray-500">No comments yet.</p>
      )}

      <h3 className="text-md font-semibold mt-6 mb-2">Suggestions</h3>
      {suggestions.length > 0 ? (
        suggestions.map(renderSuggestionItem)
      ) : (
        <p className="text-sm text-gray-500">No suggestions yet.</p>
      )}
    </aside>
  );
};

export default FeedbackSidebar; 