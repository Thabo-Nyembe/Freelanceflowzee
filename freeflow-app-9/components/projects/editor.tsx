'use client';

import { useState, useEffect, useCallback } from 'react';
import { Block, BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView, useBlockNote } from '@blocknote/react';
import { toast } from 'sonner';
import { transformTextWithAI } from '@/app/(app)/projects/actions';
import { TextSelectionToolbar } from '@/components/ai/text-selection-toolbar';
import '@blocknote/core/style.css';

interface EditorProps {
  onChange: (value: string) => void
  initialContent?: string
  editable?: boolean
}

// Gets the text from a block, or an array of blocks
const getBlocksText = (blocks: Block<any, any, any>[]): string => {
  return blocks.map(block => {
    if (!Array.isArray(block.content)) {
      return '';
    }
    let blockText = '';
    for (const inline of block.content) {
      if (inline.type === 'link') {
        // This is a hack because TS isn't narrowing the type correctly.
        const link = inline as any;
        if (Array.isArray(link.content)) {
          for (const linkContent of link.content) {
            blockText += linkContent.text || '';
          }
        }
      } else {
        const text = (inline as any).text;
        blockText += text || '';
      }
    }
    return blockText;
  }).join('\n');
};

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState<Block<any, any, any>[]>([]);

  const editor: BlockNoteEditor | null = useBlockNote({
    editable,
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    onTextCursorPositionChange: (editor) => {
      const selection = editor.getSelection();
      if (selection && selection.blocks.length > 0) {
        const text = getBlocksText(selection.blocks);
        if (text.length > 10) {
          const domSelection = window.getSelection();
          if (domSelection && !domSelection.isCollapsed) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setToolbarPosition({ top: window.scrollY + rect.top - 50, left: rect.left + rect.width / 2 });
            setToolbarVisible(true);
            setSelectedText(text);
            setSelectedBlocks(selection.blocks);
          } else {
            setToolbarVisible(false);
          }
        } else {
          setToolbarVisible(false);
        }
      } else {
        setToolbarVisible(false);
      }
    },
  });

  const handleTransform = async (command: 'improve' | 'professional' | 'summarize') => {
    if (!selectedText || !editor) return;

    setLoading(true);
    toast.info('AI is on the case...');
    const result = await transformTextWithAI(selectedText, command);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.transformedText) {
      editor.replaceBlocks(selectedBlocks, [{ content: result.transformedText }]);
      toast.success('Text transformed by AI!');
    }
    setToolbarVisible(false);
  };

  return (
    <div className="relative">
      <BlockNoteView editor={editor} theme="light" />
      <TextSelectionToolbar
        isVisible={toolbarVisible}
        position={toolbarPosition}
        onTransform={handleTransform}
        loading={loading}
      />
    </div>
  );
};

export default Editor
