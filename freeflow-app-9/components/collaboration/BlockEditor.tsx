'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CommentPopover from './CommentPopover';
import SuggestionActionPopover from './SuggestionActionPopover';
import { useCollaboration } from '@/hooks/collaboration/useCollaboration';
import { Insertion, Deletion } from '@/lib/tiptap/suggestions';

const MOCK_DOCUMENT_ID = 1;

interface BlockEditorProps {
  isSuggestionMode?: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ isSuggestionMode = false }) => {
  const [isCommentPopoverVisible, setIsCommentPopoverVisible] = useState(false);
  const { addFeedback, addSuggestion, updateSuggestionStatus } = useCollaboration(MOCK_DOCUMENT_ID);

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
        This is a block-based editor. Here is an <ins>insertion</ins> and a <del>deletion</del>. Click on them to accept or reject.
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
        handleTextInput: (view, from, to, text) => {
          if (isSuggestionMode) {
            addSuggestion({ type: 'insertion', position: from, text }, 'block-1');
            const { state, dispatch } = view;
            const tr = state.tr.replaceWith(from, to, state.schema.text(text));
            tr.addMark(from, from + text.length, state.schema.marks.insertion.create());
            dispatch(tr);
            return true;
          }
          return false;
        },
        handleKeyDown: (view, event) => {
          if (isSuggestionMode && (event.key === 'Backspace' || event.key === 'Delete')) {
            const { state, dispatch } = view;
            const { from, to, empty } = state.selection;
            
            if (empty) {
                const pos = event.key === 'Backspace' ? from - 1 : to;
                if (pos >= 0 && pos < state.doc.content.size) {
                    const text = state.doc.textBetween(pos, pos + 1);
                    addSuggestion({ type: 'deletion', start: pos, end: pos + 1, text }, 'block-1');
                    const tr = state.tr.addMark(pos, pos + 1, state.schema.marks.deletion.create());
                    dispatch(tr.setSelection(state.selection));
                }
            } else {
                const text = state.doc.textBetween(from, to);
                addSuggestion({ type: 'deletion', start: from, end: to, text }, 'block-1');
                const tr = state.tr.addMark(from, to, state.schema.marks.deletion.create());
                dispatch(tr.setSelection(state.selection));
            }
            
            return true;
          }
          return false;
        },
        handlePaste: (view, event, slice) => {
            if (isSuggestionMode) {
                const text = slice.content.textBetween(0, slice.content.size);
                addSuggestion({ type: 'insertion', position: view.state.selection.from, text }, 'block-1');
                const { state, dispatch } = view;
                const { tr } = state;
                tr.replaceSelection(slice);
                tr.addMark(tr.selection.from, tr.selection.to, view.state.schema.marks.insertion.create());
                dispatch(tr);
                return true;
            }
            return false;
        },
      }
    });
  }, [isSuggestionMode, editor, addSuggestion]);


  const handleComment = async (comment: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    await addFeedback({
      document_id: MOCK_DOCUMENT_ID,
      comment,
      target_type: 'text',
      target_id: 'block-1',
      context_data: {
        selection: selectedText,
      }
    });
    
    setIsCommentPopoverVisible(false);
    editor.commands.focus();
  };

  const handleAcceptSuggestion = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (editor.isActive('deletion')) {
      editor.chain().focus().deleteRange({ from, to }).run();
    }
    editor.chain().focus().unsetInsertion().unsetDeletion().run();
    console.log("Suggestion accepted. In a real app, we'd call updateSuggestionStatus here.");
  };

  const handleRejectSuggestion = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (editor.isActive('insertion')) {
        editor.chain().focus().deleteRange({ from, to }).run();
    }
    editor.chain().focus().unsetInsertion().unsetDeletion().run();
    console.log("Suggestion rejected. In a real app, we'd call updateSuggestionStatus here.");
  };

  return (
    <div className="editor-container bg-white rounded-md border border-gray-200 shadow-sm p-4 relative">
        {editor && (
            <>
                {/* Comment BubbleMenu and Popover Logic */}
                
                {/* Suggestion Action BubbleMenu */}
                <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100, placement: 'top' }}
                    shouldShow={({ editor }) => editor.isActive('insertion') || editor.isActive('deletion')}
                >
                    <SuggestionActionPopover
                        onAccept={handleAcceptSuggestion}
                        onReject={handleRejectSuggestion}
                    />
                </BubbleMenu>
            </>
        )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default BlockEditor; 