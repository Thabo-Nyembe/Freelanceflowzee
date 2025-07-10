'use client';

import React from 'react';

interface SuggestionActionPopoverProps {
  onAccept: () => void;
  onReject: () => void;
}

const SuggestionActionPopover: React.FC<SuggestionActionPopoverProps> = ({ onAccept, onReject }) => {
  return (
    <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-md border">
      <button
        onClick={onAccept}
        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Accept
      </button>
      <button
        onClick={onReject}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Reject
      </button>
    </div>
  );
};

export default SuggestionActionPopover; 