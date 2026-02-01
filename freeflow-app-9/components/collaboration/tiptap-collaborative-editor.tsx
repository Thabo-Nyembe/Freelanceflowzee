'use client'

/**
 * Tiptap Collaborative Editor
 *
 * World-class real-time collaborative rich-text editor using:
 * - Tiptap for the editor framework
 * - Yjs for CRDT-based collaboration
 * - Supabase Realtime for synchronization
 * - IndexedDB for offline persistence
 *
 * This matches the A+++ Implementation Guide specification.
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
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
import { IndexeddbPersistence } from 'y-indexeddb'
import { Awareness } from 'y-protocols/awareness'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/use-current-user'
import { cn } from '@/lib/utils'
import {
  Bold, Italic, Underline, Strikethrough, Code,
  List, ListOrdered, CheckSquare, Quote, Heading1, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Undo, Redo,
  Users, Wifi, WifiOff, Cloud, CloudOff, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface TiptapCollaborativeEditorProps {
  documentId: string
  documentType?: 'document' | 'canvas' | 'notes' | 'project'
  placeholder?: string
  className?: string
  editable?: boolean
  showToolbar?: boolean
  showPresence?: boolean
  showConnectionStatus?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  onSave?: (content: string, html: string) => void
  onContentChange?: (content: string) => void
  onCollaboratorJoin?: (user: CollaboratorInfo) => void
  onCollaboratorLeave?: (userId: string) => void
}

interface CollaboratorInfo {
  id: string
  name: string
  email?: string
  avatar?: string
  color: string
  cursor?: { anchor: number; head: number }
  lastActive: number
}

interface ConnectionState {
  isConnected: boolean
  isSynced: boolean
  isOffline: boolean
  pendingChanges: number
  lastSyncAt: Date | null
}

// ============================================================================
// Color Generation for Collaborators
// ============================================================================

const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF7F50', '#87CEEB', '#DEB887',
  '#BC8F8F', '#9370DB', '#20B2AA', '#FF69B4', '#32CD32'
]

function generateUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length]
}

// ============================================================================
// Supabase Yjs Provider for Real-time Sync
// ============================================================================

class SupabaseCollaborationProvider {
  private ydoc: Y.Doc
  private awareness: Awareness
  private supabase: ReturnType<typeof createClient>
  private channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
  private idbPersistence: IndexeddbPersistence | null = null
  private documentId: string
  private isConnected = false
  private isSynced = false
  private pendingUpdates: Uint8Array[] = []
  private syncInterval: ReturnType<typeof setInterval> | null = null

  public onConnect?: () => void
  public onDisconnect?: () => void
  public onSync?: (synced: boolean) => void
  public onAwarenessChange?: (states: Map<number, any>) => void

  constructor(ydoc: Y.Doc, documentId: string, user: { id: string; name: string; avatar?: string }) {
    this.ydoc = ydoc
    this.documentId = documentId
    this.supabase = createClient()
    this.awareness = new Awareness(ydoc)

    const userColor = generateUserColor(user.id)

    // Set local awareness state
    this.awareness.setLocalState({
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        color: userColor
      },
      cursor: null,
      lastActive: Date.now()
    })

    // Setup IndexedDB for offline persistence
    this.idbPersistence = new IndexeddbPersistence(`kazi-doc-${documentId}`, ydoc)
    this.idbPersistence.on('synced', () => {
      console.log('[TiptapCollab] IndexedDB synced')
    })

    // Listen to document updates
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'remote') {
        this.pendingUpdates.push(update)
        this.broadcastUpdate(update)
      }
    })

    // Listen to awareness changes
    this.awareness.on('change', () => {
      const states = this.awareness.getStates()
      this.onAwarenessChange?.(states)
    })

    // Connect
    this.connect()
  }

  private async connect() {
    try {
      this.channel = this.supabase.channel(`doc:${this.documentId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: this.awareness.clientID.toString() }
        }
      })

      // Handle document updates from other clients
      this.channel.on('broadcast', { event: 'yjs-update' }, ({ payload }) => {
        if (payload.clientId !== this.awareness.clientID) {
          const update = this.base64ToUint8Array(payload.update)
          Y.applyUpdate(this.ydoc, update, 'remote')
        }
      })

      // Handle awareness updates
      this.channel.on('broadcast', { event: 'awareness' }, ({ payload }) => {
        if (payload.clientId !== this.awareness.clientID && payload.state) {
          // Update remote user's awareness state
          const states = new Map(this.awareness.getStates())
          states.set(payload.clientId, payload.state)
          this.onAwarenessChange?.(states)
        }
      })

      // Handle presence
      this.channel.on('presence', { event: 'sync' }, () => {
        console.log('[TiptapCollab] Presence synced')
      })

      await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true
          this.onConnect?.()

          // Track presence
          await this.channel?.track({
            clientId: this.awareness.clientID,
            joinedAt: Date.now()
          })

          // Initial sync
          await this.initialSync()
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false
          this.onDisconnect?.()
        }
      })

      // Periodic sync to server
      this.syncInterval = setInterval(() => {
        this.syncToServer()
      }, 5000)

    } catch (error) {
      console.error('[TiptapCollab] Connection error:', error)
      this.isConnected = false
    }
  }

  private async initialSync() {
    try {
      const { data, error } = await this.supabase
        .from('collaboration_documents')
        .select('state, version')
        .eq('id', this.documentId)
        .single()

      if (data?.state) {
        const remoteState = this.base64ToUint8Array(data.state)
        Y.applyUpdate(this.ydoc, remoteState, 'remote')
      }

      this.isSynced = true
      this.onSync?.(true)
    } catch (error) {
      console.error('[TiptapCollab] Initial sync error:', error)
      this.isSynced = true
      this.onSync?.(true)
    }
  }

  private async syncToServer() {
    if (!this.isConnected || this.pendingUpdates.length === 0) return

    try {
      const state = Y.encodeStateAsUpdate(this.ydoc)
      const stateBase64 = this.uint8ArrayToBase64(state)

      await this.supabase
        .from('collaboration_documents')
        .upsert({
          id: this.documentId,
          state: stateBase64,
          updated_at: new Date().toISOString()
        })

      this.pendingUpdates = []
    } catch (error) {
      console.error('[TiptapCollab] Sync to server error:', error)
    }
  }

  private broadcastUpdate(update: Uint8Array) {
    if (!this.channel || !this.isConnected) return

    this.channel.send({
      type: 'broadcast',
      event: 'yjs-update',
      payload: {
        clientId: this.awareness.clientID,
        update: this.uint8ArrayToBase64(update)
      }
    })
  }

  broadcastAwareness() {
    if (!this.channel || !this.isConnected) return

    this.channel.send({
      type: 'broadcast',
      event: 'awareness',
      payload: {
        clientId: this.awareness.clientID,
        state: this.awareness.getLocalState()
      }
    })
  }

  getAwareness(): Awareness {
    return this.awareness
  }

  getState(): ConnectionState {
    return {
      isConnected: this.isConnected,
      isSynced: this.isSynced,
      isOffline: !this.isConnected,
      pendingChanges: this.pendingUpdates.length,
      lastSyncAt: this.isSynced ? new Date() : null
    }
  }

  async forceSync() {
    await this.syncToServer()
  }

  destroy() {
    if (this.syncInterval) clearInterval(this.syncInterval)
    this.channel?.unsubscribe()
    this.idbPersistence?.destroy()
    this.awareness.destroy()
  }

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(uint8Array).toString('base64')
    }
    let binary = ''
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    return btoa(binary)
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'))
    }
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}

// ============================================================================
// Editor Toolbar Component
// ============================================================================

interface EditorToolbarProps {
  editor: ReturnType<typeof useEditor> | null
  className?: string
}

function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30', className)}>
      <TooltipProvider>
        {/* Text Formatting */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bold (⌘B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Italic (⌘I)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('strike')}
              onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('code')}
              onPressedChange={() => editor.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Code</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 1 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 2 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('heading', { level: 3 })}
              onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('taskList')}
              onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Task List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('blockquote')}
              onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Quote</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (⌘Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function TiptapCollaborativeEditor({
  documentId,
  documentType = 'document',
  placeholder = 'Start typing... Press "/" for commands',
  className,
  editable = true,
  showToolbar = true,
  showPresence = true,
  showConnectionStatus = true,
  autoSave = true,
  autoSaveInterval = 5000,
  onSave,
  onContentChange,
  onCollaboratorJoin,
  onCollaboratorLeave
}: TiptapCollaborativeEditorProps) {
  const { user } = useCurrentUser()
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<SupabaseCollaborationProvider | null>(null)

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isSynced: false,
    isOffline: true,
    pendingChanges: 0,
    lastSyncAt: null
  })
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([])

  // Initialize Yjs document and provider
  useEffect(() => {
    if (!documentId || !user) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new SupabaseCollaborationProvider(ydoc, documentId, {
      id: user.id,
      name: user.name || user.email || 'Anonymous',
      avatar: user.avatar_url
    })
    providerRef.current = provider

    provider.onConnect = () => {
      setConnectionState(prev => ({ ...prev, isConnected: true, isOffline: false }))
      toast.success('Connected to collaboration session')
    }

    provider.onDisconnect = () => {
      setConnectionState(prev => ({ ...prev, isConnected: false, isOffline: true }))
      toast.warning('Disconnected from collaboration session')
    }

    provider.onSync = (synced) => {
      setConnectionState(prev => ({ ...prev, isSynced: synced, lastSyncAt: new Date() }))
    }

    provider.onAwarenessChange = (states) => {
      const collabs: CollaboratorInfo[] = []
      const awareness = provider.getAwareness()

      states.forEach((state, clientId) => {
        if (state.user && clientId !== awareness.clientID) {
          collabs.push({
            id: state.user.id,
            name: state.user.name,
            email: state.user.email,
            avatar: state.user.avatar,
            color: state.user.color,
            cursor: state.cursor,
            lastActive: state.lastActive || Date.now()
          })
        }
      })

      // Detect joins/leaves
      const prevIds = collaborators.map(c => c.id)
      const newIds = collabs.map(c => c.id)

      newIds.forEach(id => {
        if (!prevIds.includes(id)) {
          const newUser = collabs.find(c => c.id === id)
          if (newUser) onCollaboratorJoin?.(newUser)
        }
      })

      prevIds.forEach(id => {
        if (!newIds.includes(id)) {
          onCollaboratorLeave?.(id)
        }
      })

      setCollaborators(collabs)
    }

    // Update state periodically
    const stateInterval = setInterval(() => {
      setConnectionState(provider.getState())
    }, 2000)

    return () => {
      clearInterval(stateInterval)
      provider.destroy()
      ydoc.destroy()
    }
  }, [documentId, user])

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false // Yjs handles history
      }),
      Placeholder.configure({
        placeholder
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
      // Only add collaboration if ydoc is ready
      ...(ydocRef.current ? [
        Collaboration.configure({
          document: ydocRef.current,
          field: 'prosemirror'
        }),
        CollaborationCursor.configure({
          provider: providerRef.current,
          user: user ? {
            name: user.name || user.email || 'Anonymous',
            color: generateUserColor(user.id)
          } : undefined
        })
      ] : [])
    ],
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4'
      }
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getText())
    }
  }, [ydocRef.current, providerRef.current, user])

  // Auto-save
  useEffect(() => {
    if (!autoSave || !editor || !onSave) return

    const saveInterval = setInterval(() => {
      if (editor && connectionState.pendingChanges > 0) {
        onSave(editor.getText(), editor.getHTML())
        providerRef.current?.forceSync()
      }
    }, autoSaveInterval)

    return () => clearInterval(saveInterval)
  }, [autoSave, autoSaveInterval, editor, onSave, connectionState.pendingChanges])

  // Manual save handler
  const handleSave = useCallback(() => {
    if (editor && onSave) {
      onSave(editor.getText(), editor.getHTML())
      providerRef.current?.forceSync()
      toast.success('Document saved')
    }
  }, [editor, onSave])

  return (
    <div className={cn('flex flex-col rounded-lg border bg-background', className)}>
      {/* Header with presence and status */}
      {(showPresence || showConnectionStatus) && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
          {/* Collaborators */}
          {showPresence && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {collaborators.slice(0, 5).map((collab) => (
                  <Tooltip key={collab.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={collab.avatar} alt={collab.name} />
                        <AvatarFallback style={{ backgroundColor: collab.color }}>
                          {collab.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      {collab.name}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {collaborators.length > 5 && (
                  <Badge variant="secondary" className="ml-2">
                    +{collaborators.length - 5}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {collaborators.length + 1} {collaborators.length === 0 ? 'editor' : 'editors'}
              </span>
            </div>
          )}

          {/* Connection status */}
          {showConnectionStatus && (
            <div className="flex items-center gap-3">
              {connectionState.pendingChanges > 0 && (
                <Badge variant="outline" className="text-yellow-600">
                  <CloudOff className="h-3 w-3 mr-1" />
                  {connectionState.pendingChanges} pending
                </Badge>
              )}
              {connectionState.isConnected ? (
                <Badge variant="outline" className="text-green-600">
                  <Wifi className="h-3 w-3 mr-1" />
                  {connectionState.isSynced ? 'Synced' : 'Syncing...'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && <EditorToolbar editor={editor} />}

      {/* Editor content */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Cursor styles for collaboration */}
      <style jsx global>{`
        .collaboration-cursor__caret {
          position: relative;
          margin-left: -1px;
          margin-right: -1px;
          border-left: 1px solid;
          border-right: 1px solid;
          word-break: normal;
          pointer-events: none;
        }

        .collaboration-cursor__label {
          position: absolute;
          top: -1.4em;
          left: -1px;
          font-size: 12px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          user-select: none;
          color: white;
          padding: 0.1rem 0.3rem;
          border-radius: 3px 3px 3px 0;
          white-space: nowrap;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

export default TiptapCollaborativeEditor
