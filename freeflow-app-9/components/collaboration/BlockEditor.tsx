'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CommentPopover from './CommentPopover';
import { useCollaboration } from '@/hooks/collaboration/useCollaboration';
import { Insertion, Deletion } from '@/lib/tiptap/suggestions';

// In a real app, this would be passed in as a prop
const MOCK_DOCUMENT_ID = 1;

interface BlockEditorProps {
  isSuggestionMode?: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ isSuggestionMode = false }) => {
  const [isCommentPopoverVisible, setIsCommentPopoverVisible] = useState(false);
  const { addFeedback } = useCollaboration(MOCK_DOCUMENT_ID);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Insertion,
      Deletion,
    ],
    content: `
      <h2>
        Welcome to your Collaboration Hub
      </h2>
      <p>
        This is a block-based editor. Try toggling <strong>Suggestion Mode</strong> and pasting some text.
      </p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  });
  
  useEffect(() => {
    if (!editor) return;

    editor.setOptions({
      editorProps: {
        ...editor.props.editorProps,
        handlePaste: (view, event, slice) => {
          if (isSuggestionMode) {
            const { state, dispatch } = view;
            const { tr } = state;
            tr.replaceSelection(slice);
            tr.addMark(tr.selection.from, tr.selection.to, view.state.schema.marks.insertion.create());
            dispatch(tr);
            return true;
          }
          return false;
        },
        handleDrop: (view, event, slice, moved) => {
          if (isSuggestionMode) {
            const { state, dispatch } = view;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (!coordinates) return false;
            
            const pos = coordinates.pos;
            const tr = state.tr.insert(pos, slice.content);
            tr.addMark(pos, pos + slice.content.size, view.state.schema.marks.insertion.create());
            dispatch(tr);
            return true;
          }
          return false;
        }
      }
    });
  }, [isSuggestionMode, editor]);

  const handleComment = async (comment: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    await addFeedback({
      document_id: MOCK_DOCUMENT_ID,
      comment,
      target_type: 'text',
      target_id: 'block-1', // In a real app, each block would have a unique ID
      context_data: {
        selection: selectedText,
      }
    });
    
    setIsCommentPopoverVisible(false);
    // Refocus the editor after commenting
    editor.commands.focus();
  };

  return (
    <div className="editor-container bg-white rounded-md border border-gray-200 shadow-sm p-4 relative">
      {editor && (
        <BubbleMenu 
            editor={editor} 
            tippyOptions={{ duration: 100 }} 
            shouldShow={({ editor, from, to }) => {
                return from !== to && !isCommentPopoverVisible
            }}
        >
          <button
            onClick={() => setIsCommentPopoverVisible(true)}
            className="bg-black text-white px-3 py-1 rounded-md"
          >
            Comment
          </button>
        </BubbleMenu>
      )}
      
      {editor && isCommentPopoverVisible && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ 
            duration: 100, 
            placement: 'bottom', 
            appendTo: 'parent',
            onHide: () => setIsCommentPopoverVisible(false)
          }} 
          className="w-64"
        >
          <CommentPopover onComment={handleComment} />
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export default BlockEditor; 