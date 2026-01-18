'use client'

/**
 * Collaborative Rich Text Editor
 *
 * Uses TipTap with Yjs for real-time collaborative editing
 * with cursor positions, selections, and user presence.
 */

import React, { useEffect, useMemo, useCallback } from 'react'
import { useEditor, EditorContent, BubbleMenu, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import * as Y from 'yjs'
import { useYjsCollaborationContext } from './yjs-collaboration-provider'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckSquare,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'

// ============================================================================
// Types
// ============================================================================

interface CollaborativeEditorProps {
  fragmentName?: string
  placeholder?: string
  className?: string
  editorClassName?: string
  toolbarClassName?: string
  showToolbar?: boolean
  showBubbleMenu?: boolean
  editable?: boolean
  autofocus?: boolean | 'start' | 'end' | 'all' | number | null
  onUpdate?: (content: { html: string; json: any; text: string }) => void
  onSelectionUpdate?: (selection: { from: number; to: number }) => void
  onFocus?: () => void
  onBlur?: () => void
}

// ============================================================================
// Toolbar Button Component
// ============================================================================

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

function ToolbarButton({ onClick, isActive, disabled, children, title }: ToolbarButtonProps) {
  return (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={() => onClick()}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Toggle>
  )
}

// ============================================================================
// Editor Toolbar Component
// ============================================================================

interface EditorToolbarProps {
  editor: Editor | null
  className?: string
}

function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/50', className)}>
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive('taskList')}
        title="Task List"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Block Elements */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        isActive={editor.isActive('link')}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Enter image URL:')
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }}
        title="Image"
      >
        <ImageIcon className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

// ============================================================================
// Bubble Menu Component
// ============================================================================

interface EditorBubbleMenuProps {
  editor: Editor | null
}

function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
        isActive={editor.isActive('link')}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
    </BubbleMenu>
  )
}

// ============================================================================
// Main Collaborative Editor Component
// ============================================================================

export function CollaborativeEditor({
  fragmentName = 'document',
  placeholder = 'Start typing...',
  className,
  editorClassName,
  toolbarClassName,
  showToolbar = true,
  showBubbleMenu = true,
  editable = true,
  autofocus = false,
  onUpdate,
  onSelectionUpdate,
  onFocus,
  onBlur
}: CollaborativeEditorProps) {
  const collaboration = useYjsCollaborationContext()

  // Get the XML fragment for the document
  const fragment = useMemo(() => {
    return collaboration.doc?.getXmlFragment(fragmentName)
  }, [collaboration.doc, fragmentName])

  // Create awareness provider for cursor sync
  const awareness = useMemo(() => {
    return collaboration.provider?.getAwareness()
  }, [collaboration.provider])

  // Initialize TipTap editor with collaboration extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false // Disable history - Yjs handles undo/redo
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Link.configure({
        openOnClick: false
      }),
      Image,
      Placeholder.configure({
        placeholder
      }),
      // Yjs Collaboration
      ...(fragment ? [
        Collaboration.configure({
          document: collaboration.doc!,
          field: fragmentName
        })
      ] : []),
      // Collaboration Cursors
      ...(awareness ? [
        CollaborationCursor.configure({
          provider: {
            awareness
          },
          user: {
            name: collaboration.currentUser.name,
            color: collaboration.currentUser.color || '#3B82F6'
          }
        })
      ] : [])
    ],
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      onUpdate?.({
        html: editor.getHTML(),
        json: editor.getJSON(),
        text: editor.getText()
      })
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      onSelectionUpdate?.({ from, to })
    },
    onFocus: () => {
      collaboration.setTyping(true)
      onFocus?.()
    },
    onBlur: () => {
      collaboration.setTyping(false)
      onBlur?.()
    }
  }, [fragment, awareness])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  // Handle offline state
  if (!collaboration.isConnected && !collaboration.isOffline) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-50 rounded-lg', className)}>
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p>Connecting to collaboration server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      {showToolbar && <EditorToolbar editor={editor} className={toolbarClassName} />}

      {/* Bubble Menu */}
      {showBubbleMenu && <EditorBubbleMenu editor={editor} />}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none',
          editorClassName
        )}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50/50 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {editor && (
            <>
              <span>{editor.storage.characterCount?.words() || 0} words</span>
              <span>{editor.storage.characterCount?.characters() || 0} characters</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {collaboration.isOffline && (
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Offline
            </span>
          )}
          {collaboration.isSynced && (
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Saved
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Simple Collaborative Text Area (no rich text)
// ============================================================================

interface CollaborativeTextAreaProps {
  textName?: string
  placeholder?: string
  className?: string
  rows?: number
  disabled?: boolean
  onChange?: (value: string) => void
}

export function CollaborativeTextArea({
  textName = 'content',
  placeholder = 'Start typing...',
  className,
  rows = 4,
  disabled = false,
  onChange
}: CollaborativeTextAreaProps) {
  const collaboration = useYjsCollaborationContext()
  const [value, setValue] = React.useState('')
  const textRef = React.useRef<Y.Text | null>(null)

  useEffect(() => {
    if (!collaboration.isConnected || !collaboration.doc) return

    const yText = collaboration.doc.getText(textName)
    textRef.current = yText
    setValue(yText.toString())

    const observer = () => {
      const newValue = yText.toString()
      setValue(newValue)
      onChange?.(newValue)
    }

    yText.observe(observer)

    return () => {
      yText.unobserve(observer)
    }
  }, [collaboration.isConnected, collaboration.doc, textName, onChange])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const yText = textRef.current
    if (!yText) return

    // Calculate the diff and apply it
    const oldValue = yText.toString()

    if (newValue.length > oldValue.length) {
      // Text was added
      const insertPos = e.target.selectionStart - (newValue.length - oldValue.length)
      const insertText = newValue.slice(insertPos, insertPos + (newValue.length - oldValue.length))
      yText.insert(insertPos, insertText)
    } else if (newValue.length < oldValue.length) {
      // Text was deleted
      const deletePos = e.target.selectionStart
      const deleteCount = oldValue.length - newValue.length
      yText.delete(deletePos, deleteCount)
    }
  }

  return (
    <textarea
      value={value}
      onChange={handleChange}
      onFocus={() => collaboration.setTyping(true)}
      onBlur={() => collaboration.setTyping(false)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled || !collaboration.isConnected}
      className={cn(
        'w-full px-3 py-2 border rounded-lg resize-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}

export default CollaborativeEditor
