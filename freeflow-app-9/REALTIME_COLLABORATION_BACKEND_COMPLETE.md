# KAZI Real-Time Collaboration - Backend Complete

## Overview

World-class real-time collaboration infrastructure enabling seamless multi-user editing with conflict-free data synchronization, rich awareness protocol, comprehensive activity logging, and offline-first capabilities.

## Architecture

```
lib/collaboration/
├── crdt-service.ts            # Conflict-free replicated data types
├── awareness-service.ts       # Advanced user awareness protocol
├── activity-log-service.ts    # Activity logging & audit trail
└── offline-sync-service.ts    # Offline-first synchronization

Existing Infrastructure (already present):
├── lib/websocket/socket-server.ts     # Socket.IO server
├── hooks/use-websocket.ts             # WebSocket client hook
├── hooks/use-realtime.ts              # Supabase Realtime hooks
├── lib/messages-realtime.ts           # Message-specific realtime
└── components/collaboration/          # 57+ collaboration UI components
```

## Services Implemented

### 1. CRDT Service (`lib/collaboration/crdt-service.ts`)

Conflict-free replicated data types for seamless multi-user editing without conflicts.

**Implemented CRDTs:**

- **CRDTText**: Based on YATA/Yjs algorithm for text editing
  - Character-level insertions and deletions
  - Position tracking with unique IDs
  - Tombstone-based deletion
  - Automatic conflict resolution

- **CRDTMap**: Last-Writer-Wins Register for key-value data
  - Timestamp-based conflict resolution
  - NodeId tie-breaking
  - Efficient updates

- **CRDTCounter**: PN-Counter for numeric values
  - Increment/decrement operations
  - Per-node tracking
  - Always consistent

**Key Features:**
```typescript
// Vector Clock operations
createVectorClock()
incrementClock(clock, nodeId)
mergeClock(clockA, clockB)
compareClock(clockA, clockB)
isConcurrent(clockA, clockB)

// Document Manager
const manager = new CRDTDocumentManager(nodeId)
manager.createTextDocument(docId, initialContent)
manager.createMapDocument(docId, initialState)
manager.createCounterDocument(docId, initialValue)
manager.applyRemoteOperation(docId, operation)
manager.handleSyncMessage(message)
```

### 2. Awareness Service (`lib/collaboration/awareness-service.ts`)

Rich real-time awareness of collaborators with comprehensive state tracking.

**User Awareness State:**
```typescript
interface UserAwareness {
  // Identity
  userId, userName, userColor, userAvatar

  // Position
  cursor: CursorState | null
  selection: SelectionState | null

  // Activity
  activity: 'active' | 'viewing' | 'idle' | 'away' | 'offline'
  lastActive: Date

  // Focus
  focus: FocusState | null  // viewport, region, element

  // Device
  device: DeviceInfo  // type, os, browser, screen

  // Edit state
  editState: EditState | null  // typing, drawing, undo/redo
}
```

**Key Features:**
- Cursor position with smooth interpolation
- Selection highlighting
- Activity state with automatic transitions (active → idle → away)
- Focus tracking (viewport, region, element)
- Device information
- Edit state (typing, drawing, etc.)
- Undo/redo stack tracking per user
- 60fps cursor updates with throttling
- Heartbeat for presence detection

**Usage:**
```typescript
const awareness = new AwarenessManager(docId, userId, userName, avatar)

// Update local state
awareness.updateCursor({ x, y, line, column })
awareness.updateSelection({ start, end, type: 'text' })
awareness.updateFocus({ target: 'document', viewport: {...} })
awareness.updateEditState({ action: 'typing', isTyping: true })

// Subscribe to remote users
awareness.setOnUpdate(users => console.log('Users changed'))
awareness.setOnUserJoin(user => console.log(`${user.userName} joined`))
awareness.setOnUserLeave(userId => console.log(`User left`))

// Get users
awareness.getAllUsers()       // Map<string, UserAwareness>
awareness.getActiveUsers()    // Active/viewing users
awareness.getUsersInRegion('section-1')
```

### 3. Activity Log Service (`lib/collaboration/activity-log-service.ts`)

Comprehensive activity tracking and audit trail with undo/redo support.

**Activity Types:**
- **Document**: created, opened, saved, renamed, deleted, exported
- **Edit**: text_insert, text_delete, object_add, object_move, undo, redo
- **Collaboration**: user_joined, user_left, typing, conflict
- **Comment**: created, replied, resolved, reaction
- **Permission**: granted, revoked, changed
- **Version**: created, restored, named

**Key Features:**
```typescript
const activityLog = new ActivityLogManager(
  documentId, sessionId, userId, userName, userColor
)

// Log activities
activityLog.logTextInsert(text, position, previousState)
activityLog.logTextDelete(deletedText, position, previousState)
activityLog.logObjectAdd(elementId, elementType, data)
activityLog.logObjectMove(elementId, type, fromPos, toPos)
activityLog.logUserJoined({ userId, userName })
activityLog.logCommentCreated(commentId, text, position)
activityLog.logVersionCreated(versionId, versionName)

// Undo/Redo (per user)
const entry = activityLog.undo()  // Returns undone entry
const entry = activityLog.redo()  // Returns redone entry
const state = activityLog.getUndoRedoState()

// Query
activityLog.getRecentActivity(50)
activityLog.getEntriesForUser(userId)
activityLog.getEntriesByType('edit.text_insert')

// Analytics
activityLog.getSummary('day')  // By category, user, type
```

**Activity Entry Structure:**
```typescript
interface ActivityLogEntry {
  id, documentId, sessionId
  type: ActivityType
  category: ActivityCategory
  description: string
  userId, userName, userColor
  changes: ActivityChange[]
  previousState, newState    // For undo/redo
  affectedElements: string[]
  position: { start, end, line, column }
  timestamp: Date
}
```

### 4. Offline Sync Service (`lib/collaboration/offline-sync-service.ts`)

Offline-first synchronization with IndexedDB storage and conflict resolution.

**Features:**
- Local-first with IndexedDB persistence
- Automatic sync when connection restores
- Conflict detection and resolution
- Delta compression for bandwidth optimization
- Batch syncing
- Retry logic with exponential backoff

**Storage:**
- Documents store
- Operations queue
- Conflicts store
- Metadata store

**Sync Configuration:**
```typescript
const syncConfig = {
  autoSync: true,
  syncInterval: 5000,        // 5 seconds
  maxRetries: 3,
  batchSize: 50,
  compressionEnabled: true,
  conflictResolution: 'merge', // 'local-wins' | 'remote-wins' | 'merge' | 'manual'
  offlineStorageQuota: 100     // MB
}
```

**Usage:**
```typescript
const sync = new OfflineSyncManager(config)
await sync.init()

// Document management
await sync.createDocument(id, type, initialState, userId)
await sync.getDocument(id)

// Queue operations
await sync.queueOperation(documentId, operation)

// Manual sync
await sync.sync()

// Status
const status = await sync.getStatus()
// { connectionState, syncState, pendingOperations, conflicts, ... }

// Conflict handling
await sync.resolveConflict(conflictId, 'merge', userId)

// Callbacks
sync.setOnConnectionChange(state => console.log(state))
sync.setOnSyncStateChange(state => console.log(state))
sync.setOnConflictDetected(conflict => handleConflict(conflict))
```

**Connection States:**
- `online`: Connected to server
- `offline`: No connection
- `connecting`: Establishing connection
- `syncing`: Sync in progress

**Sync States:**
- `idle`: No pending operations
- `syncing`: Sync in progress
- `error`: Sync failed
- `conflict`: Unresolved conflicts exist

## Database Migration Needed

Create a migration for the activity log table:

```sql
CREATE TABLE collaboration_activity_log (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  user_avatar TEXT,
  changes JSONB DEFAULT '[]',
  previous_state JSONB,
  new_state JSONB,
  affected_elements TEXT[] DEFAULT ARRAY[]::TEXT[],
  position JSONB,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL,
  server_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_document ON collaboration_activity_log(document_id);
CREATE INDEX idx_activity_log_user ON collaboration_activity_log(user_id);
CREATE INDEX idx_activity_log_type ON collaboration_activity_log(activity_type);
CREATE INDEX idx_activity_log_timestamp ON collaboration_activity_log(timestamp);

ALTER TABLE collaboration_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities they're part of"
  ON collaboration_activity_log FOR SELECT
  USING (
    user_id = auth.uid() OR
    document_id IN (
      SELECT document_id FROM collaboration_sessions
      WHERE user_id = auth.uid()
    )
  );
```

## Integration Example

```typescript
import { CRDTDocumentManager, generateNodeId } from '@/lib/collaboration/crdt-service'
import { AwarenessManager } from '@/lib/collaboration/awareness-service'
import { ActivityLogManager } from '@/lib/collaboration/activity-log-service'
import { OfflineSyncManager } from '@/lib/collaboration/offline-sync-service'

// Initialize
const nodeId = generateNodeId()
const sessionId = `session_${Date.now()}`

// CRDT for conflict-free editing
const crdt = new CRDTDocumentManager(nodeId)
const textDoc = crdt.createTextDocument('doc-1', 'Initial content')

// Awareness for presence
const awareness = new AwarenessManager('doc-1', userId, userName)

// Activity log for audit trail
const activityLog = new ActivityLogManager('doc-1', sessionId, userId, userName, '#FF6B6B')

// Offline sync
const sync = new OfflineSyncManager({ autoSync: true })
await sync.init()

// Connect everything
crdt.setSyncCallback(async (message) => {
  // Broadcast via WebSocket/Supabase Realtime
  await supabase.channel('doc-1').send(message)
})

awareness.setBroadcastCallback((update) => {
  supabase.channel('doc-1').send(update)
})

activityLog.setSyncCallback(async (entries) => {
  await saveActivityBatch(entries)
})

sync.setServerSyncCallback(async (operations) => {
  // Send to server and receive remote operations
  const response = await fetch('/api/collaboration/sync', {
    method: 'POST',
    body: JSON.stringify({ operations })
  })
  return response.json()
})

// Handle text edit
function onTextChange(change) {
  const op = textDoc.insert(change.position, change.text)
  activityLog.logTextInsert(change.text, change.position)
  sync.queueOperation('doc-1', op)
}

// Handle cursor move
function onCursorMove(position) {
  awareness.updateCursor(position)
}
```

## Existing Infrastructure Used

The new services integrate with existing infrastructure:

- **Socket.IO** (`lib/websocket/socket-server.ts`): Real-time message transport
- **Supabase Realtime** (`hooks/use-realtime.ts`): Database subscriptions
- **Presence Hook** (`hooks/use-collaboration.ts`): User presence tracking
- **Collaboration UI** (`components/collaboration/`): 57+ existing components

## Performance Optimizations

1. **Cursor Throttling**: 16ms (~60fps) for smooth updates
2. **Selection Throttling**: 100ms to reduce bandwidth
3. **Focus Throttling**: 200ms for viewport changes
4. **Batch Syncing**: Up to 50 operations per batch
5. **Delta Compression**: Combine consecutive text operations
6. **Vector Clock Comparison**: O(n) where n = number of nodes
7. **IndexedDB Indexes**: Fast queries on documentId, status, timestamp

## Build Status

- Build: **SUCCESS**
- All services compiled without errors
- No new dependencies required (uses native APIs)

## Summary

The real-time collaboration backend now provides:

| Feature | Status |
|---------|--------|
| CRDT Text Editing | Implemented |
| CRDT Map/Object | Implemented |
| CRDT Counter | Implemented |
| Vector Clocks | Implemented |
| User Awareness | Implemented |
| Cursor Sync | Implemented |
| Selection Sync | Implemented |
| Focus Tracking | Implemented |
| Activity Logging | Implemented |
| Undo/Redo Per User | Implemented |
| Offline Storage | Implemented |
| Auto Sync | Implemented |
| Conflict Detection | Implemented |
| Conflict Resolution | Implemented |
| Delta Compression | Implemented |
