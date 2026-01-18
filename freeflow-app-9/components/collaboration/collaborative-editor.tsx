'use client'

/**
 * Collaborative Editor Components
 *
 * Provides collaborative editing using Yjs for real-time sync.
 * Uses a simple textarea-based editor for maximum compatibility.
 */

import React, { useEffect, useCallback, useRef, useState } from 'react'
import * as Y from 'yjs'
import { useYjsCollaborationContext } from './yjs-collaboration-provider'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Save,
  Hash,
  Code,
  Quote
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

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
  autofocus?: boolean
  onUpdate?: (content: { text: string }) => void
  onFocus?: () => void
  onBlur?: () => void
}

// ============================================================================
// Collaborative Markdown Editor Component
// ============================================================================

export function CollaborativeEditor({
  fragmentName = 'content',
  placeholder = 'Start typing...',
  className,
  editorClassName,
  toolbarClassName,
  showToolbar = true,
  editable = true,
  autofocus = false,
  onUpdate,
  onFocus,
  onBlur
}: CollaborativeEditorProps) {
  const collaboration = useYjsCollaborationContext()
  const [content, setContent] = useState('')
  const textRef = useRef<Y.Text | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null)

  // Initialize Yjs text binding
  useEffect(() => {
    if (!collaboration.isConnected || !collaboration.doc) return

    const yText = collaboration.doc.getText(fragmentName)
    textRef.current = yText
    setContent(yText.toString())

    // Create undo manager
    const um = new Y.UndoManager(yText)
    setUndoManager(um)

    // Observe changes
    const observer = () => {
      const newContent = yText.toString()
      setContent(newContent)
      onUpdate?.({ text: newContent })
    }

    yText.observe(observer)

    return () => {
      yText.unobserve(observer)
      um.destroy()
    }
  }, [collaboration.isConnected, collaboration.doc, fragmentName, onUpdate])

  // Handle text changes with proper diffing
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const yText = textRef.current
    if (!yText) return

    const oldValue = yText.toString()

    // Simple approach: delete all and insert new
    if (newValue !== oldValue) {
      yText.delete(0, oldValue.length)
      yText.insert(0, newValue)
    }
  }, [])

  // Toolbar actions
  const handleUndo = useCallback(() => {
    if (undoManager?.canUndo()) {
      undoManager.undo()
      toast.info('Undo')
    }
  }, [undoManager])

  const handleRedo = useCallback(() => {
    if (undoManager?.canRedo()) {
      undoManager.redo()
      toast.info('Redo')
    }
  }, [undoManager])

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea || !textRef.current) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = `${before}${selectedText}${after}`

    // Insert via Yjs
    textRef.current.delete(start, end - start)
    textRef.current.insert(start, newText)

    // Focus and set cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }, [content])

  const handleBold = () => insertMarkdown('**', '**')
  const handleItalic = () => insertMarkdown('*', '*')
  const handleCode = () => insertMarkdown('`', '`')
  const handleHeading = () => insertMarkdown('## ')
  const handleQuote = () => insertMarkdown('> ')
  const handleBulletList = () => insertMarkdown('- ')
  const handleNumberedList = () => insertMarkdown('1. ')

  // Handle loading state
  if (!collaboration.isConnected && !collaboration.isOffline) {
    return (
      <div className={cn('flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg', className)}>
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p>Connecting to collaboration server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className={cn('flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/50 dark:bg-gray-800/50', toolbarClassName)}>
          <Toggle
            size="sm"
            onPressedChange={() => handleUndo()}
            disabled={!undoManager?.canUndo()}
            title="Undo (Ctrl+Z)"
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={() => handleRedo()}
            disabled={!undoManager?.canRedo()}
            title="Redo (Ctrl+Y)"
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Toggle
            size="sm"
            onPressedChange={handleBold}
            title="Bold (**text**)"
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={handleItalic}
            title="Italic (*text*)"
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={handleCode}
            title="Code (`code`)"
            className="h-8 w-8 p-0"
          >
            <Code className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Toggle
            size="sm"
            onPressedChange={handleHeading}
            title="Heading (## )"
            className="h-8 w-8 p-0"
          >
            <Hash className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={handleQuote}
            title="Quote (> )"
            className="h-8 w-8 p-0"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={handleBulletList}
            title="Bullet List (- )"
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={handleNumberedList}
            title="Numbered List (1. )"
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          {/* Sync indicator */}
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
            {collaboration.isSynced && (
              <span className="flex items-center gap-1 text-green-600">
                <Save className="w-3 h-3" />
                Saved
              </span>
            )}
            {collaboration.isOffline && (
              <span className="flex items-center gap-1 text-amber-600">
                Offline
              </span>
            )}
          </div>
        </div>
      )}

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onFocus={() => {
          collaboration.setTyping(true)
          onFocus?.()
        }}
        onBlur={() => {
          collaboration.setTyping(false)
          onBlur?.()
        }}
        placeholder={placeholder}
        disabled={!editable || (!collaboration.isConnected && !collaboration.isOffline)}
        autoFocus={autofocus}
        className={cn(
          'w-full min-h-[300px] p-4 font-mono text-sm resize-none',
          'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
          'focus:outline-none focus:ring-0',
          'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed',
          editorClassName
        )}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50/50 dark:bg-gray-800/50 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>{content.length} characters</span>
          <span>{content.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          {collaboration.otherUsers.length > 0 && (
            <span className="flex items-center gap-1">
              {collaboration.otherUsers.length} collaborator{collaboration.otherUsers.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Simple Collaborative Text Area (for basic text)
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
  const [value, setValue] = useState('')
  const textRef = useRef<Y.Text | null>(null)

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

    const oldValue = yText.toString()
    if (newValue !== oldValue) {
      yText.delete(0, oldValue.length)
      yText.insert(0, newValue)
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
        'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}

export default CollaborativeEditor
