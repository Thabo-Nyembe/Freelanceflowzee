/**
 * FreeFlow Collaboration Hooks
 *
 * World-class real-time collaboration system with:
 * - Yjs CRDT for conflict-free editing
 * - Supabase Realtime for synchronization
 * - Presence and awareness tracking
 * - Offline-first data persistence
 */

// Core collaboration hook - Yjs-based real-time editing
export {
  useYjsCollaboration,
  type DocumentType,
  type CollaboratorState,
  type CollaborationConfig,
  type CollaborationState,
  type ConflictInfo,
  type UseYjsCollaborationReturn,
  type VersionInfo
} from '../use-yjs-collaboration'

// Awareness hook - presence, cursors, selections
export {
  useCollaborationAwareness,
  type ActivityStatus,
  type UserPresence,
  type CursorPosition,
  type SelectionRange,
  type FocusIndicator,
  type DeviceInfo,
  type AwarenessConfig,
  type UseCollaborationAwarenessReturn
} from '../use-collaboration-awareness'

// Offline sync hook - IndexedDB persistence and sync
export {
  useOfflineSync,
  type ConnectionState,
  type SyncState,
  type ConflictResolution,
  type PendingChange,
  type SyncConflict,
  type SyncStatus,
  type OfflineSyncConfig,
  type SyncResult,
  type UseOfflineSyncReturn
} from '../use-offline-sync'

// Original collaboration hook (Supabase-based session management)
export {
  useCollaboration,
  type CollaborationSession,
  type SessionType,
  type SessionStatus,
  type AccessType,
  type UserRole
} from '../use-collaboration'

// Version history hook - document versioning and checkpoints
export {
  useVersionHistory,
  type DocumentVersion,
  type VersionHistoryState,
  type UseVersionHistoryOptions,
  type UseVersionHistoryReturn
} from '../use-version-history'
