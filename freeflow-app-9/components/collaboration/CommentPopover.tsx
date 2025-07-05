'use client';

import React, { useState } from 'react';

interface CommentPopoverProps {
  onComment: (comment: string) => void;
}

const CommentPopover: React.FC<CommentPopoverProps> = ({ onComment }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onComment(comment);
      setComment('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CommentPopover; 