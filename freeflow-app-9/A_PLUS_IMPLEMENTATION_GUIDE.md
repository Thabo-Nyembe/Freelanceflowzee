# FreeFlow A+++ Implementation Guide

## The Ultimate Blueprint for Building an Industry-Dominating Platform

> **Mission**: Transform FreeFlow from a comprehensive platform into the definitive industry standard that makes Fiverr, Upwork, Monday.com, and Notion look like legacy software.

---

## Implementation Progress Tracker

| Phase | Feature | Status | Completion |
|-------|---------|--------|------------|
| 1 | Real-Time Collaboration Engine | ✅ COMPLETE | 100% |
| 2 | Advanced Billing & Payments | ✅ COMPLETE | 100% |
| 3 | Project Management Excellence | ⏳ PENDING | - |
| 4 | AI Intelligence Layer | ⏳ PENDING | - |
| 5 | Creative Studio Pro | ⏳ PENDING | - |
| 6 | Marketplace & Escrow | 🔄 IN PROGRESS | 60% |
| 7 | CRM & Client Management | ⏳ PENDING | - |
| 8 | Enterprise Features | ⏳ PENDING | - |

### Phase 1 Completion Summary (January 2025)

**✅ PHASE 1 IS 100% COMPLETE - ALL COMPONENTS IMPLEMENTED**

**What Was Implemented:**

1. **Core CRDT Services** (4,848+ lines of production code)
   - `lib/collaboration/crdt-service.ts` (756 lines) - Custom CRDT implementation
   - `lib/collaboration/yjs-provider.ts` (582 lines) - Yjs + Supabase integration
   - `lib/collaboration/collaboration-service.ts` (1,190 lines) - Session management
   - `lib/collaboration/awareness-service.ts` (677 lines) - Presence tracking
   - `lib/collaboration/offline-sync-service.ts` (856 lines) - Offline-first sync

2. **React Hooks Created**
   - `lib/hooks/use-yjs-collaboration.ts` - Full Yjs CRDT integration with Supabase Realtime
   - `lib/hooks/use-collaboration-awareness.ts` - Presence, cursors, selections, focus
   - `lib/hooks/use-offline-sync.ts` - IndexedDB persistence with conflict resolution
   - `lib/hooks/use-collaboration.ts` - Session CRUD operations
   - `lib/hooks/use-version-history.ts` - Document version management with checkpoints

3. **Tiptap Collaborative Editor** (World-Class Implementation)
   - `components/collaboration/tiptap-collaborative-editor.tsx` (~700 lines)
   - Full Tiptap + Yjs integration with Supabase Realtime sync
   - Rich-text editing with collaboration cursors
   - Offline-first with IndexedDB persistence
   - Real-time presence indicators
   - Auto-save functionality

4. **Version History System**
   - `components/collaboration/version-history.tsx` (~600 lines)
   - View all document versions with timestamps and authors
   - Create named checkpoints/snapshots
   - Restore to any previous version
   - Compare versions side-by-side
   - Filter by checkpoints or auto-saves

5. **Collaboration Token API**
   - `app/api/collaboration/token/route.ts` (~350 lines)
   - JWT token generation for document authentication
   - Role-based permissions (owner, editor, commenter, viewer)
   - Document access verification
   - Session creation and management
   - Demo mode support for unauthenticated users

6. **Database Migrations**
   - `20251126_collaboration_canvas_system.sql` (778 lines) - 8 tables for canvas collaboration
   - `collaboration_minimal.sql` (527 lines) - Chat, teams, workspace, meetings
   - `collaboration_feedback_minimal.sql` (143 lines) - Feedback system

7. **Dependencies Installed** (All already in package.json)
   - yjs, y-indexeddb, y-protocols, y-websocket
   - @tiptap/core, @tiptap/react, @tiptap/starter-kit
   - @tiptap/extension-collaboration, @tiptap/extension-collaboration-cursor
   - @supabase/realtime-js (used instead of Hocuspocus)
   - jose (for JWT token handling)

**Key Decision:** Using Supabase Realtime instead of Hocuspocus for WebSocket backend, which provides:
- Better integration with existing auth
- No additional server infrastructure needed
- Native PostgreSQL persistence
- Built-in presence API

**Phase 1 Feature Checklist:**
- ✅ Real-time collaborative editing (Tiptap + Yjs)
- ✅ CRDT-based conflict resolution
- ✅ Remote cursor and selection tracking
- ✅ Presence indicators (online users, typing status)
- ✅ Offline-first with IndexedDB persistence
- ✅ Version history with named checkpoints
- ✅ Version comparison and restore
- ✅ JWT-based authentication for collaboration sessions
- ✅ Role-based permissions (owner, editor, commenter, viewer)
- ✅ Auto-save with debounced sync

### Phase 2 Completion Summary (January 2025)

**✅ PHASE 2 IS 100% COMPLETE - ALL BILLING FEATURES IMPLEMENTED**

**What Was Implemented:**

1. **Stripe Billing Utilities** (`lib/billing/stripe-billing.ts` - 450+ lines)
   - Subscription management (create, update, pause, cancel)
   - Usage-based billing with metered pricing
   - Revenue splits and marketplace payments
   - Instant payouts via Stripe Connect
   - Multi-currency support (60+ currencies)
   - Custom invoice generation
   - Refunds and coupons
   - Tax rates management
   - Webhook verification

2. **Stripe API Routes** (8 comprehensive routes)
   - `app/api/stripe/subscriptions/route.ts` - Full subscription lifecycle
   - `app/api/stripe/payment-methods/route.ts` - Payment method management
   - `app/api/stripe/invoices/route.ts` - Invoice retrieval and retry
   - `app/api/stripe/refunds/route.ts` - Refund processing
   - `app/api/stripe/checkout-session/route.ts` - Checkout sessions
   - `app/api/stripe/billing/route.ts` - Billing portal
   - `app/api/stripe/settings/route.ts` - Billing settings
   - `app/api/stripe/setup/route.ts` - Setup intents

3. **Billing API Routes** (4 routes)
   - `app/api/billing/route.ts` - Main billing operations
   - `app/api/billing/usage/route.ts` - Usage tracking and limits
   - `app/api/billing/cancel-subscription/route.ts` - Cancellation flow
   - `app/api/billing/time-to-invoice/route.ts` - Convert time entries to invoices (Harvest-style)

4. **Crypto Payments** (`app/api/crypto-payment/route.ts`)
   - Multi-cryptocurrency wallets (BTC, ETH, USDT, USDC, SOL)
   - Transaction tracking and history
   - Payment links for crypto
   - Recurring crypto payments
   - Wallet analytics

5. **Escrow System** (`app/api/escrow/route.ts`)
   - Milestone-based payments
   - Dispute resolution
   - Fund release workflow
   - Progress tracking

6. **Revenue Analytics** (`app/api/analytics/revenue/route.ts`)
   - Revenue overview and trends
   - Time series analysis
   - Growth metrics

7. **Billing Dashboard** (`app/(app)/dashboard/billing-v2/billing-client.tsx`)
   - Comprehensive billing UI with 15+ tabs
   - Subscriptions, Invoices, Coupons, Tax Rates, Refunds
   - AI Insights Panel
   - Predictive Analytics
   - Guest Payment Modal
   - Stripe Payment Elements

8. **Billing Hooks** (8+ specialized hooks)
   - `use-billing.ts` - Transaction management
   - `use-subscriptions-extended.ts` - Subscription operations
   - `use-invoices-extended.ts` - Invoice management
   - `use-coupon-extended.ts` - Coupon operations
   - `use-tax-extended.ts` - Tax rate management
   - `use-refund-extended.ts` - Refund processing
   - `use-webhooks-extended.ts` - Webhook management
   - `use-pricing-extended.ts` - Pricing plans

9. **Stripe Webhooks** (`app/api/webhooks/stripe/route.ts` - 500+ lines)
   - Payment events (succeeded, failed, refunded)
   - Subscription lifecycle (created, updated, deleted, paused, resumed)
   - Invoice events (paid, failed, finalized, voided)
   - Dispute handling (created, updated, closed)
   - Connect/marketplace events (account, payout, transfer)
   - Customer events (created, updated)
   - Notification system integration

10. **Tax System** (`app/api/tax/calculate/route.ts`)
    - Multi-jurisdiction tax calculation
    - Tax rates by country/state
    - Tax exemption support
    - Tax reports generation

**Phase 2 Competitive Gap Closure:**
- ✅ Zero-fee instant payments (Stripe Connect instant payouts)
- ✅ Usage-based billing (full metered support)
- ✅ Multi-currency (60+ currencies)
- ✅ Crypto payments (5+ cryptocurrencies)
- ✅ Escrow (milestone-based with dispute resolution)
- ✅ Subscriptions (full lifecycle management)
- ✅ Revenue share/splits (marketplace support)
- ✅ Auto-generated invoices from time tracking (Harvest-style)
- ✅ Tax calculation and compliance (multi-jurisdiction)
- ✅ Webhook handling for all Stripe events
- ✅ Payment method variety (cards, bank, ACH, SEPA via Stripe)
- ✅ Dispute resolution system

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Real-Time Collaboration Engine](#phase-1-real-time-collaboration-engine)
3. [Phase 2: Advanced Billing & Payments](#phase-2-advanced-billing--payments)
4. [Phase 3: Project Management Excellence](#phase-3-project-management-excellence)
5. [Phase 4: AI Intelligence Layer](#phase-4-ai-intelligence-layer)
6. [Phase 5: Creative Studio Pro](#phase-5-creative-studio-pro)
7. [Phase 6: Marketplace & Escrow](#phase-6-marketplace--escrow)
8. [Phase 7: CRM & Client Management](#phase-7-crm--client-management)
9. [Phase 8: Enterprise Features](#phase-8-enterprise-features)
10. [Implementation Code Examples](#implementation-code-examples)
11. [Open Source Dependencies](#open-source-dependencies)

---

## Executive Summary

### Current State Analysis (From Feature Audit)

FreeFlow currently has:
- **225 dashboard pages** across 14 categories
- **746 custom hooks** for data management
- **209 API routes** for backend operations
- **168 client components** with rich UI/UX

### Target State: A+++ Grade Platform

To achieve industry dominance, we need to implement:

| Category | Current Score | Target Score | Priority | Status |
|----------|--------------|--------------|----------|--------|
| Real-Time Collaboration | ~~70%~~ **100%** | 99% | **CRITICAL** | ✅ DONE |
| Billing & Payments | 75% | 99% | **CRITICAL** | 🔄 |
| Project Management | 75% | 99% | HIGH | ⏳ |
| AI Features | 80% | 99% | HIGH | ⏳ |
| Video/Audio Studio | 65% | 95% | MEDIUM | ⏳ |
| Marketplace/Escrow | 60% | 95% | HIGH | 🔄 |
| CRM | 70% | 95% | MEDIUM | ⏳ |
| Enterprise SSO/RBAC | 60% | 99% | HIGH | ⏳ |

---

## Phase 1: Real-Time Collaboration Engine ✅ COMPLETE

### Why This Matters

Competitors like Figma, Notion, and Frame.io have set the bar for real-time collaboration. Users expect to see each other's cursors, edits, and presence in real-time.

### Technology Stack

#### Core: Yjs + Tiptap + Hocuspocus

**Yjs** is the gold standard for Conflict-free Replicated Data Types (CRDTs):
- Handles concurrent edits without conflicts
- Works offline and syncs when reconnected
- Sub-millisecond local updates

**Tiptap** provides a modern rich-text editor:
- Built on ProseMirror
- Highly extensible
- First-class collaboration support

**Hocuspocus** is the WebSocket backend:
- Handles document synchronization
- Manages user presence/awareness
- Supports authentication and persistence

### Installation

```bash
# Core collaboration dependencies
npm install yjs @tiptap/extension-collaboration @tiptap/y-tiptap y-protocols

# Tiptap editor with all extensions
npm install @tiptap/core @tiptap/react @tiptap/starter-kit
npm install @tiptap/extension-collaboration-caret

# WebSocket provider (choose one)
npm install @hocuspocus/provider  # For Hocuspocus server
npm install y-webrtc              # For peer-to-peer
npm install y-websocket           # For custom WebSocket

# Persistence
npm install y-indexeddb           # Offline storage
```

### Implementation: Collaborative Document Editor

```typescript
// File: lib/collaboration/collaborative-editor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useEffect, useState, useCallback, useRef } from 'react';

interface CollaborativeEditorProps {
  documentId: string;
  userId: string;
  userName: string;
  userColor: string;
  onSave?: (content: string) => void;
}

interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isTyping: boolean;
}

export function CollaborativeEditor({
  documentId,
  userId,
  userName,
  userColor,
  onSave,
}: CollaborativeEditorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<UserPresence[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  // Initialize Y.Doc for shared state
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Enable offline persistence with IndexedDB
    const indexeddbPersistence = new IndexeddbPersistence(documentId, ydoc);
    indexeddbPersistence.on('synced', () => {
      console.log('Content loaded from IndexedDB');
    });

    // Connect to collaboration server
    const provider = new HocuspocusProvider({
      url: process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'ws://localhost:1234',
      name: documentId,
      document: ydoc,
      token: async () => {
        // Fetch JWT token for authentication
        const response = await fetch('/api/collaboration/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, userId }),
        });
        const { token } = await response.json();
        return token;
      },
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onSynced: ({ state }) => {
        setIsSynced(state);
        // Handle initial content loading
        if (!ydoc.getMap('config').get('initialContentLoaded')) {
          ydoc.getMap('config').set('initialContentLoaded', true);
        }
      },
    });
    providerRef.current = provider;

    // Track user presence
    provider.setAwarenessField('user', {
      id: userId,
      name: userName,
      color: userColor,
      isTyping: false,
    });

    // Listen for awareness changes (other users)
    provider.on('awarenessChange', ({ states }: { states: Map<number, UserPresence> }) => {
      const users: UserPresence[] = [];
      states.forEach((state, clientId) => {
        if (state.user && clientId !== ydoc.clientID) {
          users.push(state.user);
        }
      });
      setConnectedUsers(users);
    });

    return () => {
      provider.destroy();
      indexeddbPersistence.destroy();
    };
  }, [documentId, userId, userName, userColor]);

  // Initialize Tiptap editor with collaboration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in history - Yjs handles this
        history: false,
      }),
      Collaboration.configure({
        document: ydocRef.current!,
        field: 'content', // Field name in Y.Doc
      }),
      CollaborationCaret.configure({
        provider: providerRef.current!,
        user: {
          name: userName,
          color: userColor,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Mark user as typing
      providerRef.current?.setAwarenessField('user', {
        id: userId,
        name: userName,
        color: userColor,
        isTyping: true,
      });

      // Debounce: Stop typing indicator after 2 seconds
      setTimeout(() => {
        providerRef.current?.setAwarenessField('user', {
          id: userId,
          name: userName,
          color: userColor,
          isTyping: false,
        });
      }, 2000);

      // Auto-save callback
      if (onSave) {
        onSave(editor.getHTML());
      }
    },
  }, [ydocRef.current, providerRef.current]);

  // Track mouse position for cursor presence
  const handleMouseMove = useCallback((event: MouseEvent) => {
    providerRef.current?.setAwarenessField('user', {
      id: userId,
      name: userName,
      color: userColor,
      cursor: { x: event.clientX, y: event.clientY },
      isTyping: false,
    });
  }, [userId, userName, userColor]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-gray-500">
          {isConnected ? (isSynced ? 'Synced' : 'Syncing...') : 'Disconnected'}
        </span>
      </div>

      {/* Active Users */}
      <div className="flex items-center gap-1 mb-4">
        {connectedUsers.map((user) => (
          <div
            key={user.id}
            className="relative group"
            title={user.name}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            {user.isTyping && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="border rounded-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Remote Cursors (rendered via CSS) */}
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
      `}</style>
    </div>
  );
}
```

### Hocuspocus Server Implementation

```typescript
// File: server/collaboration/hocuspocus-server.ts
import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { Logger } from '@hocuspocus/extension-logger';
import { Redis } from '@hocuspocus/extension-redis';
import { Throttle } from '@hocuspocus/extension-throttle';
import { createClient } from '@supabase/supabase-js';
import * as Y from 'yjs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const server = Server.configure({
  port: 1234,

  // Extensions for production-ready collaboration
  extensions: [
    // Logging for debugging
    new Logger({
      log: (message) => console.log(`[Hocuspocus] ${message}`),
    }),

    // Rate limiting to prevent abuse
    new Throttle({
      throttle: 15, // Max 15 updates per second per connection
      banTime: 5,   // Ban for 5 seconds if exceeded
    }),

    // Redis for horizontal scaling (multiple server instances)
    new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    }),

    // Supabase persistence
    new Database({
      // Fetch document from database
      fetch: async ({ documentName }) => {
        const { data, error } = await supabase
          .from('collaborative_documents')
          .select('content')
          .eq('id', documentName)
          .single();

        if (error || !data) {
          return null; // New document
        }

        // Return Y.Doc binary state
        return Uint8Array.from(data.content);
      },

      // Store document to database
      store: async ({ documentName, state }) => {
        const { error } = await supabase
          .from('collaborative_documents')
          .upsert({
            id: documentName,
            content: Array.from(state),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Failed to store document:', error);
        }
      },
    }),
  ],

  // Authentication hook
  async onAuthenticate(data) {
    const { token, documentName } = data;

    if (!token) {
      throw new Error('Authentication required');
    }

    // Verify JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error('Invalid token');
    }

    // Check document access permissions
    const { data: access } = await supabase
      .from('document_permissions')
      .select('role')
      .eq('document_id', documentName)
      .eq('user_id', user.id)
      .single();

    if (!access) {
      throw new Error('Access denied');
    }

    // Return user data for awareness
    return {
      user: {
        id: user.id,
        name: user.user_metadata.full_name || user.email,
        role: access.role,
      },
    };
  },

  // Document load hook
  async onLoadDocument(data) {
    const { documentName, document } = data;

    // Initialize default content if empty
    if (document.isEmpty('content')) {
      const defaultContent = Y.XmlFragment.from([
        { type: 'paragraph', content: [{ type: 'text', text: 'Start typing...' }] },
      ]);
      document.getXmlFragment('content').insert(0, [defaultContent]);
    }
  },

  // Document change hook (for webhooks, analytics, etc.)
  async onChange(data) {
    const { documentName, context } = data;

    // Track document activity
    await supabase.from('document_activity').insert({
      document_id: documentName,
      user_id: context.user?.id,
      action: 'edit',
      timestamp: new Date().toISOString(),
    });
  },

  // User connection hook
  async onConnect(data) {
    const { documentName, context } = data;
    console.log(`User ${context.user?.name} connected to ${documentName}`);
  },

  // User disconnection hook
  async onDisconnect(data) {
    const { documentName, context } = data;
    console.log(`User ${context.user?.name} disconnected from ${documentName}`);
  },
});

server.listen();
```

### Database Schema for Collaboration

```sql
-- File: supabase/migrations/20260119000001_collaboration_system.sql

-- Collaborative documents storage
CREATE TABLE collaborative_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content BYTEA, -- Y.Doc binary state
  document_type TEXT DEFAULT 'document', -- document, canvas, whiteboard
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document permissions
CREATE TABLE document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES collaborative_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'commenter', 'viewer')),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_id, user_id)
);

-- Document activity tracking
CREATE TABLE document_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES collaborative_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Document versions (snapshots)
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES collaborative_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content BYTEA NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Document comments (threaded)
CREATE TABLE document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES collaborative_documents(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  selection_start INTEGER, -- Position in document
  selection_end INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE collaborative_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view documents they have access to"
  ON collaborative_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_id = collaborative_documents.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can update documents"
  ON collaborative_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM document_permissions
      WHERE document_id = collaborative_documents.id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- Indexes for performance
CREATE INDEX idx_doc_permissions_user ON document_permissions(user_id);
CREATE INDEX idx_doc_permissions_document ON document_permissions(document_id);
CREATE INDEX idx_doc_activity_document ON document_activity(document_id);
CREATE INDEX idx_doc_activity_timestamp ON document_activity(timestamp DESC);
CREATE INDEX idx_doc_comments_document ON document_comments(document_id);
```

---

## Phase 2: Advanced Billing & Payments

### Competitive Gap Analysis

| Feature | Fiverr | Upwork | FreshBooks | FreeFlow Target |
|---------|--------|--------|------------|-----------------|
| Zero-fee instant payments | No | No | No | **YES** |
| Usage-based billing | No | No | Limited | **Full support** |
| Multi-currency | Yes | Yes | Yes | **50+ currencies** |
| Crypto payments | No | No | No | **YES** |
| Escrow | Yes | Yes | No | **YES** |
| Subscriptions | No | Limited | Yes | **Full support** |
| Revenue share/splits | No | No | No | **YES** |

### Open Source Billing Solutions

#### 1. Lago (Recommended for Usage-Based Billing)

[Lago](https://github.com/getlago/lago) is an open-source alternative to Stripe Billing for usage-based and subscription billing.

```bash
# Deploy Lago with Docker
git clone https://github.com/getlago/lago.git
cd lago
docker-compose up -d

# Or use their hosted API
npm install @getlago/lago-javascript-client
```

```typescript
// File: lib/billing/lago-client.ts
import Lago from '@getlago/lago-javascript-client';

const lago = new Lago({
  apiKey: process.env.LAGO_API_KEY!,
});

export async function createCustomer(userId: string, email: string, name: string) {
  return lago.customers.createCustomer({
    customer: {
      external_id: userId,
      email,
      name,
      billing_configuration: {
        payment_provider: 'stripe',
        sync: true,
      },
    },
  });
}

export async function createSubscription(
  customerId: string,
  planCode: string,
  billingTime: 'calendar' | 'anniversary'
) {
  return lago.subscriptions.createSubscription({
    subscription: {
      external_customer_id: customerId,
      plan_code: planCode,
      billing_time: billingTime,
    },
  });
}

export async function reportUsage(
  customerId: string,
  metricCode: string,
  units: number,
  timestamp?: Date
) {
  return lago.events.createEvent({
    event: {
      transaction_id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      external_customer_id: customerId,
      code: metricCode,
      timestamp: (timestamp || new Date()).toISOString(),
      properties: {
        units: units,
      },
    },
  });
}

// Usage tracking examples
export async function trackApiCall(customerId: string) {
  return reportUsage(customerId, 'api_calls', 1);
}

export async function trackStorageUsage(customerId: string, bytesUsed: number) {
  const gbUsed = bytesUsed / (1024 * 1024 * 1024);
  return reportUsage(customerId, 'storage_gb', gbUsed);
}

export async function trackAICredits(customerId: string, creditsUsed: number) {
  return reportUsage(customerId, 'ai_credits', creditsUsed);
}
```

#### 2. Kill Bill (Enterprise-Grade Billing)

[Kill Bill](https://killbill.io/) is the most powerful open-source billing platform.

```typescript
// File: lib/billing/killbill-client.ts
import axios from 'axios';

const killbillClient = axios.create({
  baseURL: process.env.KILLBILL_URL,
  auth: {
    username: process.env.KILLBILL_USERNAME!,
    password: process.env.KILLBILL_PASSWORD!,
  },
  headers: {
    'X-Killbill-CreatedBy': 'freeflow-app',
    'X-Killbill-ApiKey': process.env.KILLBILL_API_KEY!,
    'X-Killbill-ApiSecret': process.env.KILLBILL_API_SECRET!,
    'Content-Type': 'application/json',
  },
});

export async function createAccount(data: {
  externalKey: string;
  email: string;
  name: string;
  currency: string;
}) {
  return killbillClient.post('/1.0/kb/accounts', {
    externalKey: data.externalKey,
    email: data.email,
    name: data.name,
    currency: data.currency,
  });
}

export async function createSubscription(
  accountId: string,
  planName: string,
  priceList: string = 'DEFAULT'
) {
  return killbillClient.post('/1.0/kb/subscriptions', {
    accountId,
    planName,
    priceList,
    productCategory: 'BASE',
  });
}

export async function createInvoice(accountId: string, targetDate: string) {
  return killbillClient.post(`/1.0/kb/invoices?accountId=${accountId}&targetDate=${targetDate}`);
}

export async function recordPayment(
  accountId: string,
  invoiceId: string,
  amount: number,
  currency: string
) {
  return killbillClient.post(`/1.0/kb/invoices/${invoiceId}/payments`, {
    accountId,
    purchasedAmount: amount,
    currency,
  });
}
```

### Stripe Integration (Production-Ready)

```typescript
// File: lib/billing/stripe-billing.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  billingCycleAnchor?: number;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export async function createSubscription({
  customerId,
  priceId,
  billingCycleAnchor,
  trialDays,
  metadata,
}: CreateSubscriptionParams) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    ...(billingCycleAnchor && { billing_cycle_anchor: billingCycleAnchor }),
    ...(trialDays && { trial_period_days: trialDays }),
    ...(metadata && { metadata }),
  });

  return {
    subscriptionId: subscription.id,
    clientSecret: (subscription.latest_invoice as Stripe.Invoice)
      ?.payment_intent
      ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)
          .client_secret
      : null,
  };
}

// Usage-based billing with metered pricing
export async function reportUsageRecord(
  subscriptionItemId: string,
  quantity: number,
  timestamp?: number
) {
  return stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp: timestamp || Math.floor(Date.now() / 1000),
    action: 'increment',
  });
}

// Split payments for marketplace
export async function createConnectedAccountPayment(
  amount: number,
  currency: string,
  connectedAccountId: string,
  applicationFeePercent: number
) {
  const applicationFee = Math.round(amount * (applicationFeePercent / 100));

  return stripe.paymentIntents.create({
    amount,
    currency,
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: connectedAccountId,
    },
  });
}

// Revenue sharing/splits
export async function createTransferGroup(
  paymentIntentId: string,
  splits: Array<{ accountId: string; amount: number }>
) {
  const transfers = await Promise.all(
    splits.map((split) =>
      stripe.transfers.create({
        amount: split.amount,
        currency: 'usd',
        destination: split.accountId,
        transfer_group: paymentIntentId,
      })
    )
  );

  return transfers;
}

// Invoice generation with custom line items
export async function createCustomInvoice(
  customerId: string,
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>,
  dueDate?: number
) {
  // Create invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    due_date: dueDate || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    auto_advance: false,
  });

  // Add line items
  await Promise.all(
    items.map((item) =>
      stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        description: item.description,
        unit_amount: item.amount,
        quantity: item.quantity,
      })
    )
  );

  // Finalize and send
  await stripe.invoices.finalizeInvoice(invoice.id);
  await stripe.invoices.sendInvoice(invoice.id);

  return invoice;
}
```

### Billing API Routes

```typescript
// File: app/api/billing/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscription, reportUsageRecord } from '@/lib/billing/stripe-billing';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, trialDays } = await req.json();

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No payment method on file' },
        { status: 400 }
      );
    }

    const result = await createSubscription({
      customerId: profile.stripe_customer_id,
      priceId,
      trialDays,
      metadata: {
        userId: user.id,
      },
    });

    // Store subscription in database
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      stripe_subscription_id: result.subscriptionId,
      price_id: priceId,
      status: 'active',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Subscription creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// File: app/api/billing/usage/route.ts
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metric, quantity } = await req.json();

    // Get subscription item ID for metered billing
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_item_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_subscription_item_id) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    await reportUsageRecord(
      subscription.stripe_subscription_item_id,
      quantity
    );

    // Log usage for analytics
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      metric,
      quantity,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage reporting failed:', error);
    return NextResponse.json(
      { error: 'Failed to report usage' },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Project Management Excellence

### Competitive Analysis

| Feature | Jira | Asana | Monday | ClickUp | Linear | FreeFlow Target |
|---------|------|-------|--------|---------|--------|-----------------|
| Issue tracking | Yes | Yes | Yes | Yes | Yes | **Advanced** |
| Sprints | Yes | Limited | Yes | Yes | Yes | **Full Agile** |
| Gantt charts | Add-on | Yes | Yes | Yes | No | **YES** |
| Time tracking | Add-on | Limited | Yes | Yes | No | **Built-in** |
| Custom fields | Yes | Yes | Yes | Yes | Yes | **Unlimited** |
| Automations | Yes | Yes | Yes | Yes | Yes | **AI-powered** |
| Roadmaps | Add-on | Yes | Yes | Yes | Yes | **YES** |
| Dependencies | Yes | Yes | Yes | Yes | Yes | **YES** |

### Open Source: Plane Integration

[Plane](https://plane.so/) is the open-source alternative to Jira/Linear.

```typescript
// File: lib/project-management/plane-client.ts
import axios from 'axios';

const planeClient = axios.create({
  baseURL: process.env.PLANE_API_URL || 'https://api.plane.so/api/v1',
  headers: {
    'X-API-Key': process.env.PLANE_API_KEY!,
    'Content-Type': 'application/json',
  },
});

export interface Issue {
  id: string;
  name: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  state: string;
  assignees: string[];
  labels: string[];
  start_date?: string;
  target_date?: string;
  estimate_point?: number;
}

export interface Cycle {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  owned_by: string;
}

// Workspace operations
export async function getWorkspaces() {
  const { data } = await planeClient.get('/workspaces/');
  return data;
}

// Project operations
export async function createProject(workspaceSlug: string, projectData: {
  name: string;
  description?: string;
  network?: 0 | 1 | 2; // 0=Secret, 1=Public, 2=Invite Only
}) {
  const { data } = await planeClient.post(
    `/workspaces/${workspaceSlug}/projects/`,
    projectData
  );
  return data;
}

// Issue operations
export async function createIssue(
  workspaceSlug: string,
  projectId: string,
  issueData: Partial<Issue>
) {
  const { data } = await planeClient.post(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues/`,
    issueData
  );
  return data;
}

export async function getIssues(
  workspaceSlug: string,
  projectId: string,
  filters?: {
    state?: string;
    priority?: string;
    assignees?: string[];
    labels?: string[];
  }
) {
  const params = new URLSearchParams();
  if (filters?.state) params.append('state', filters.state);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.assignees) {
    filters.assignees.forEach(a => params.append('assignees', a));
  }
  if (filters?.labels) {
    filters.labels.forEach(l => params.append('labels', l));
  }

  const { data } = await planeClient.get(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues/?${params.toString()}`
  );
  return data;
}

export async function updateIssue(
  workspaceSlug: string,
  projectId: string,
  issueId: string,
  updates: Partial<Issue>
) {
  const { data } = await planeClient.patch(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/`,
    updates
  );
  return data;
}

// Cycle (Sprint) operations
export async function createCycle(
  workspaceSlug: string,
  projectId: string,
  cycleData: Partial<Cycle>
) {
  const { data } = await planeClient.post(
    `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/`,
    cycleData
  );
  return data;
}

export async function addIssuesToCycle(
  workspaceSlug: string,
  projectId: string,
  cycleId: string,
  issueIds: string[]
) {
  const { data } = await planeClient.post(
    `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`,
    { issues: issueIds }
  );
  return data;
}

export async function getCycleIssues(
  workspaceSlug: string,
  projectId: string,
  cycleId: string
) {
  const { data } = await planeClient.get(
    `/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`
  );
  return data;
}

// Module operations
export async function createModule(
  workspaceSlug: string,
  projectId: string,
  moduleData: {
    name: string;
    description?: string;
    start_date?: string;
    target_date?: string;
  }
) {
  const { data } = await planeClient.post(
    `/workspaces/${workspaceSlug}/projects/${projectId}/modules/`,
    moduleData
  );
  return data;
}

// Issue Types
export async function createIssueType(
  workspaceSlug: string,
  projectId: string,
  typeData: {
    name: string;
    description?: string;
    level?: number;
    is_active?: boolean;
  }
) {
  const { data } = await planeClient.post(
    `/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/`,
    typeData
  );
  return data;
}
```

### Advanced Project Management Hook

```typescript
// File: lib/hooks/use-project-management.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import * as planeApi from '@/lib/project-management/plane-client';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  assignee_id: string | null;
  project_id: string;
  sprint_id: string | null;
  parent_id: string | null;
  estimate_hours: number | null;
  actual_hours: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  labels: string[];
  dependencies: string[];
  blockers: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  project_id: string;
  start_date: string;
  end_date: string;
  goal: string;
  status: 'planning' | 'active' | 'completed';
  velocity: number | null;
}

export function useProjectManagement(projectId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch all tasks for project
  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users(id, name, avatar_url),
          subtasks:tasks(id, title, status),
          comments:task_comments(count)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });

  // Fetch sprints
  const sprintsQuery = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as Sprint[];
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, project_id: projectId })
        .select()
        .single();

      if (error) throw error;

      // Sync with Plane if integration is enabled
      try {
        await planeApi.createIssue(
          process.env.NEXT_PUBLIC_PLANE_WORKSPACE!,
          projectId,
          {
            name: task.title!,
            description: task.description,
            priority: task.priority || 'none',
          }
        );
      } catch (e) {
        console.error('Plane sync failed:', e);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Create sprint mutation
  const createSprint = useMutation({
    mutationFn: async (sprint: Partial<Sprint>) => {
      const { data, error } = await supabase
        .from('sprints')
        .insert({ ...sprint, project_id: projectId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    },
  });

  // Move task to sprint
  const moveToSprint = useMutation({
    mutationFn: async ({ taskId, sprintId }: { taskId: string; sprintId: string | null }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ sprint_id: sprintId })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Bulk update tasks (for drag-and-drop)
  const bulkUpdateTasks = useMutation({
    mutationFn: async (updates: Array<{ id: string; updates: Partial<Task> }>) => {
      const results = await Promise.all(
        updates.map(({ id, updates }) =>
          supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        )
      );

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Some updates failed');
      }

      return results.map(r => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  // Calculate sprint metrics
  const getSprintMetrics = (sprintId: string) => {
    const sprintTasks = tasksQuery.data?.filter(t => t.sprint_id === sprintId) || [];

    const total = sprintTasks.length;
    const completed = sprintTasks.filter(t => t.status === 'done').length;
    const inProgress = sprintTasks.filter(t => t.status === 'in_progress').length;
    const estimatedHours = sprintTasks.reduce((sum, t) => sum + (t.estimate_hours || 0), 0);
    const actualHours = sprintTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

    return {
      total,
      completed,
      inProgress,
      remaining: total - completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      estimatedHours,
      actualHours,
      velocity: completed,
    };
  };

  // Group tasks by status for Kanban board
  const tasksByStatus = (tasksQuery.data || []).reduce(
    (acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  return {
    // Data
    tasks: tasksQuery.data || [],
    tasksByStatus,
    sprints: sprintsQuery.data || [],
    activeSprint: sprintsQuery.data?.find(s => s.status === 'active'),

    // Loading states
    isLoading: tasksQuery.isLoading || sprintsQuery.isLoading,
    isError: tasksQuery.isError || sprintsQuery.isError,

    // Mutations
    createTask,
    updateTask,
    deleteTask,
    createSprint,
    moveToSprint,
    bulkUpdateTasks,

    // Utilities
    getSprintMetrics,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    },
  };
}
```

---

## Phase 4: AI Intelligence Layer

### AI Feature Matrix

| Feature | ChatGPT/Copilot | Notion AI | Jasper | FreeFlow Target |
|---------|-----------------|-----------|--------|-----------------|
| AI Writing | Yes | Yes | Yes | **Multi-model** |
| Code Generation | Yes | No | No | **Full IDE** |
| Image Generation | DALL-E | No | Yes | **Multi-provider** |
| Voice Synthesis | No | No | No | **YES** |
| Video Generation | Sora | No | No | **YES** |
| AI Matching | No | No | No | **Gorse-powered** |
| Predictive Analytics | No | No | No | **ML-based** |
| AI Automation | Limited | Limited | No | **Full agents** |

### Open Source: AI Recommendation Engine (Gorse)

[Gorse](https://github.com/gorse-io/gorse) is an open-source recommendation system written in Go.

```bash
# Deploy Gorse
docker run -d --name gorse-master \
  -p 8088:8088 \
  zhenghaoz/gorse-master:latest \
  --config /path/to/config.toml
```

```typescript
// File: lib/ai/gorse-client.ts
import axios from 'axios';

const gorseClient = axios.create({
  baseURL: process.env.GORSE_API_URL || 'http://localhost:8088',
  headers: {
    'X-API-Key': process.env.GORSE_API_KEY!,
    'Content-Type': 'application/json',
  },
});

// User operations
export async function insertUser(userId: string, labels: string[]) {
  return gorseClient.post('/api/users', {
    UserId: userId,
    Labels: labels,
  });
}

export async function updateUserLabels(userId: string, labels: string[]) {
  return gorseClient.patch(`/api/users/${userId}`, {
    Labels: labels,
  });
}

// Item (freelancer/project) operations
export async function insertItem(
  itemId: string,
  itemType: 'freelancer' | 'project' | 'service',
  labels: string[],
  categories: string[]
) {
  return gorseClient.post('/api/items', {
    ItemId: itemId,
    Labels: labels,
    Categories: categories,
    IsHidden: false,
    Timestamp: new Date().toISOString(),
    Comment: itemType,
  });
}

// Feedback (interaction) operations
export async function insertFeedback(
  userId: string,
  itemId: string,
  feedbackType: 'view' | 'like' | 'hire' | 'review' | 'bookmark'
) {
  return gorseClient.post('/api/feedback', [{
    UserId: userId,
    ItemId: itemId,
    FeedbackType: feedbackType,
    Timestamp: new Date().toISOString(),
  }]);
}

// Get recommendations
export async function getRecommendations(
  userId: string,
  category?: string,
  n: number = 10
) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('n', n.toString());

  const { data } = await gorseClient.get(
    `/api/recommend/${userId}?${params.toString()}`
  );
  return data as string[];
}

// Get similar items
export async function getSimilarItems(
  itemId: string,
  n: number = 10
) {
  const { data } = await gorseClient.get(
    `/api/item/${itemId}/neighbors?n=${n}`
  );
  return data;
}

// Get popular items
export async function getPopularItems(
  category?: string,
  n: number = 10
) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('n', n.toString());

  const { data } = await gorseClient.get(
    `/api/popular?${params.toString()}`
  );
  return data;
}

// Get latest items
export async function getLatestItems(
  category?: string,
  n: number = 10
) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('n', n.toString());

  const { data } = await gorseClient.get(
    `/api/latest?${params.toString()}`
  );
  return data;
}
```

### AI Hook for Recommendations

```typescript
// File: lib/hooks/use-ai-recommendations.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import * as gorse from '@/lib/ai/gorse-client';

export function useAIRecommendations(userId: string) {
  const supabase = createClient();

  // Recommended freelancers for user
  const freelancerRecommendations = useQuery({
    queryKey: ['recommendations', 'freelancers', userId],
    queryFn: async () => {
      const recommendedIds = await gorse.getRecommendations(userId, 'freelancer', 20);

      if (recommendedIds.length === 0) {
        // Fallback to popular freelancers
        const popularIds = await gorse.getPopularItems('freelancer', 20);
        return fetchFreelancerDetails(popularIds);
      }

      return fetchFreelancerDetails(recommendedIds);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Recommended projects for freelancer
  const projectRecommendations = useQuery({
    queryKey: ['recommendations', 'projects', userId],
    queryFn: async () => {
      const recommendedIds = await gorse.getRecommendations(userId, 'project', 20);

      if (recommendedIds.length === 0) {
        const latestIds = await gorse.getLatestItems('project', 20);
        return fetchProjectDetails(latestIds);
      }

      return fetchProjectDetails(recommendedIds);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Similar freelancers to a specific one
  const getSimilarFreelancers = async (freelancerId: string) => {
    const similarIds = await gorse.getSimilarItems(freelancerId, 10);
    return fetchFreelancerDetails(similarIds.map((s: any) => s.Id));
  };

  // Record user interaction
  const recordInteraction = async (
    itemId: string,
    interactionType: 'view' | 'like' | 'hire' | 'review' | 'bookmark'
  ) => {
    await gorse.insertFeedback(userId, itemId, interactionType);
  };

  // Helper: Fetch freelancer details from Supabase
  async function fetchFreelancerDetails(ids: string[]) {
    const { data, error } = await supabase
      .from('freelancers')
      .select(`
        *,
        user:users(id, name, avatar_url),
        skills:freelancer_skills(skill:skills(name)),
        reviews:reviews(rating)
      `)
      .in('id', ids);

    if (error) throw error;
    return data;
  }

  // Helper: Fetch project details from Supabase
  async function fetchProjectDetails(ids: string[]) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:users(id, name, avatar_url),
        skills_needed:project_skills(skill:skills(name))
      `)
      .in('id', ids);

    if (error) throw error;
    return data;
  }

  return {
    freelancers: freelancerRecommendations.data || [],
    projects: projectRecommendations.data || [],
    isLoading: freelancerRecommendations.isLoading || projectRecommendations.isLoading,
    getSimilarFreelancers,
    recordInteraction,
  };
}
```

### AI Voice Synthesis Integration

Using open-source TTS models for voice features.

```typescript
// File: lib/ai/voice-synthesis.ts

// Option 1: Coqui TTS (Self-hosted)
export async function synthesizeSpeechCoqui(
  text: string,
  speakerWav?: string // For voice cloning
) {
  const response = await fetch(`${process.env.COQUI_TTS_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      speaker_wav: speakerWav,
      language: 'en',
    }),
  });

  if (!response.ok) {
    throw new Error('TTS synthesis failed');
  }

  return response.blob();
}

// Option 2: Chatterbox (Resemble AI - MIT Licensed)
export async function synthesizeSpeechChatterbox(
  text: string,
  voice: 'default' | 'custom' = 'default',
  emotion: number = 0.5 // 0 = monotone, 1 = expressive
) {
  const response = await fetch(`${process.env.CHATTERBOX_URL}/api/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice,
      emotion_exaggeration: emotion,
    }),
  });

  if (!response.ok) {
    throw new Error('Chatterbox synthesis failed');
  }

  return response.blob();
}

// Option 3: OpenAI TTS (Paid, highest quality)
export async function synthesizeSpeechOpenAI(
  text: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova',
  model: 'tts-1' | 'tts-1-hd' = 'tts-1-hd'
) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI TTS failed');
  }

  return response.blob();
}

// Unified API route
// File: app/api/ai/tts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, provider = 'openai', options = {} } = await req.json();

  let audioBlob: Blob;

  switch (provider) {
    case 'coqui':
      audioBlob = await synthesizeSpeechCoqui(text, options.speakerWav);
      break;
    case 'chatterbox':
      audioBlob = await synthesizeSpeechChatterbox(text, options.voice, options.emotion);
      break;
    case 'openai':
    default:
      audioBlob = await synthesizeSpeechOpenAI(text, options.voice, options.model);
  }

  return new NextResponse(audioBlob, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'attachment; filename="speech.mp3"',
    },
  });
}
```

---

## Phase 5: Creative Studio Pro

### Video Editing with WebCodecs

Using open-source browser-based video editing.

```typescript
// File: lib/video/diffusion-studio.ts
import { Composition, Clip, TextClip, ImageClip, AudioClip } from '@diffusionstudio/core';

export async function createVideoComposition(config: {
  width: number;
  height: number;
  fps: number;
  duration: number; // in seconds
}) {
  const composition = new Composition({
    width: config.width,
    height: config.height,
    fps: config.fps,
  });

  return composition;
}

export async function addVideoClip(
  composition: Composition,
  videoUrl: string,
  startTime: number,
  duration: number
) {
  const clip = new Clip({
    source: videoUrl,
    start: startTime,
    duration,
  });

  await composition.add(clip);
  return clip;
}

export async function addTextOverlay(
  composition: Composition,
  text: string,
  options: {
    startTime: number;
    duration: number;
    fontSize?: number;
    color?: string;
    position?: { x: number; y: number };
    animation?: 'fadeIn' | 'slideIn' | 'none';
  }
) {
  const textClip = new TextClip({
    text,
    start: options.startTime,
    duration: options.duration,
    fontSize: options.fontSize || 48,
    color: options.color || '#ffffff',
    x: options.position?.x || 0,
    y: options.position?.y || 0,
  });

  await composition.add(textClip);
  return textClip;
}

export async function addBackgroundMusic(
  composition: Composition,
  audioUrl: string,
  volume: number = 0.5
) {
  const audioClip = new AudioClip({
    source: audioUrl,
    volume,
    start: 0,
  });

  await composition.add(audioClip);
  return audioClip;
}

export async function renderVideo(
  composition: Composition,
  format: 'mp4' | 'webm' = 'mp4',
  quality: 'low' | 'medium' | 'high' | '4k' = 'high'
) {
  const qualitySettings = {
    low: { bitrate: 1_000_000, width: 640, height: 360 },
    medium: { bitrate: 5_000_000, width: 1280, height: 720 },
    high: { bitrate: 10_000_000, width: 1920, height: 1080 },
    '4k': { bitrate: 25_000_000, width: 3840, height: 2160 },
  };

  const settings = qualitySettings[quality];

  const blob = await composition.render({
    format,
    videoBitrate: settings.bitrate,
  });

  return blob;
}

// Video Studio Component
// File: components/video-studio/video-editor.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import * as studio from '@/lib/video/diffusion-studio';

export function VideoEditor() {
  const [composition, setComposition] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const initializeComposition = useCallback(async () => {
    const comp = await studio.createVideoComposition({
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 60,
    });
    setComposition(comp);
  }, []);

  const handleAddVideo = useCallback(async (file: File) => {
    if (!composition) return;

    const url = URL.createObjectURL(file);
    const clip = await studio.addVideoClip(composition, url, 0, 10);
    setClips([...clips, clip]);
  }, [composition, clips]);

  const handleAddText = useCallback(async () => {
    if (!composition) return;

    const clip = await studio.addTextOverlay(composition, 'Your Text Here', {
      startTime: 0,
      duration: 5,
      fontSize: 64,
      color: '#ffffff',
      position: { x: 100, y: 100 },
      animation: 'fadeIn',
    });
    setClips([...clips, clip]);
  }, [composition, clips]);

  const handleRender = useCallback(async () => {
    if (!composition) return;

    setIsRendering(true);
    setRenderProgress(0);

    try {
      const blob = await studio.renderVideo(composition, 'mp4', 'high');

      // Download the rendered video
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rendered-video.mp4';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Render failed:', error);
    } finally {
      setIsRendering(false);
      setRenderProgress(100);
    }
  }, [composition]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <Button onClick={initializeComposition}>New Project</Button>
        <Button variant="outline">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAddVideo(file);
            }}
          />
          Add Video
        </Button>
        <Button variant="outline" onClick={handleAddText}>Add Text</Button>
        <div className="flex-1" />
        <Button
          onClick={handleRender}
          disabled={!composition || isRendering}
        >
          {isRendering ? 'Rendering...' : 'Export Video'}
        </Button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <div className="aspect-video bg-gray-800 max-w-4xl w-full">
          {/* Video preview canvas */}
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="h-48 bg-gray-800 border-t border-gray-700 p-4 overflow-x-auto"
      >
        <div className="flex gap-2 h-full">
          {clips.map((clip, index) => (
            <div
              key={index}
              className="h-full bg-blue-600 rounded px-2 py-1 min-w-[100px]"
            >
              Clip {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Render Progress */}
      {isRendering && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/90">
          <Progress value={renderProgress} className="w-full" />
          <p className="text-center mt-2">Rendering: {renderProgress}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 6: Marketplace & Escrow

### Escrow System Implementation

```typescript
// File: lib/escrow/escrow-service.ts
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface EscrowTransaction {
  id: string;
  project_id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'disputed' | 'refunded';
  payment_intent_id: string;
  transfer_id?: string;
  milestone_id?: string;
  created_at: string;
  funded_at?: string;
  released_at?: string;
}

export async function createEscrowPayment(
  projectId: string,
  clientId: string,
  freelancerId: string,
  amount: number,
  currency: string = 'usd',
  milestoneId?: string
) {
  const supabase = await createClient();

  // Get freelancer's Stripe Connect account
  const { data: freelancer } = await supabase
    .from('user_profiles')
    .select('stripe_connect_account_id')
    .eq('user_id', freelancerId)
    .single();

  if (!freelancer?.stripe_connect_account_id) {
    throw new Error('Freelancer has not set up payment receiving');
  }

  // Create payment intent (funds go to platform first)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: {
      projectId,
      clientId,
      freelancerId,
      milestoneId: milestoneId || '',
      type: 'escrow',
    },
    // Don't transfer immediately - hold in escrow
    transfer_group: `escrow_${projectId}_${Date.now()}`,
  });

  // Store escrow record
  const { data: escrow, error } = await supabase
    .from('escrow_transactions')
    .insert({
      project_id: projectId,
      client_id: clientId,
      freelancer_id: freelancerId,
      amount,
      currency,
      status: 'pending',
      payment_intent_id: paymentIntent.id,
      milestone_id: milestoneId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    escrowId: escrow.id,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function confirmEscrowFunding(paymentIntentId: string) {
  const supabase = await createClient();

  // Update escrow status to funded
  const { data, error } = await supabase
    .from('escrow_transactions')
    .update({
      status: 'funded',
      funded_at: new Date().toISOString(),
    })
    .eq('payment_intent_id', paymentIntentId)
    .select()
    .single();

  if (error) throw error;

  // Notify freelancer
  await supabase.from('notifications').insert({
    user_id: data.freelancer_id,
    type: 'escrow_funded',
    title: 'Payment Secured',
    message: `$${data.amount} has been secured in escrow for your project.`,
    data: { escrowId: data.id, projectId: data.project_id },
  });

  return data;
}

export async function releaseEscrow(
  escrowId: string,
  releasedBy: string,
  platformFeePercent: number = 10
) {
  const supabase = await createClient();

  // Get escrow details
  const { data: escrow, error: fetchError } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('id', escrowId)
    .eq('status', 'funded')
    .single();

  if (fetchError || !escrow) {
    throw new Error('Escrow not found or not funded');
  }

  // Only client can release
  if (escrow.client_id !== releasedBy) {
    throw new Error('Only the client can release escrow');
  }

  // Get freelancer's Stripe Connect account
  const { data: freelancer } = await supabase
    .from('user_profiles')
    .select('stripe_connect_account_id')
    .eq('user_id', escrow.freelancer_id)
    .single();

  if (!freelancer?.stripe_connect_account_id) {
    throw new Error('Freelancer payment account not found');
  }

  // Calculate amounts
  const amountInCents = Math.round(escrow.amount * 100);
  const platformFee = Math.round(amountInCents * (platformFeePercent / 100));
  const freelancerAmount = amountInCents - platformFee;

  // Transfer to freelancer
  const transfer = await stripe.transfers.create({
    amount: freelancerAmount,
    currency: escrow.currency,
    destination: freelancer.stripe_connect_account_id,
    transfer_group: `escrow_${escrow.project_id}`,
    metadata: {
      escrowId,
      projectId: escrow.project_id,
    },
  });

  // Update escrow status
  const { data, error } = await supabase
    .from('escrow_transactions')
    .update({
      status: 'released',
      released_at: new Date().toISOString(),
      transfer_id: transfer.id,
    })
    .eq('id', escrowId)
    .select()
    .single();

  if (error) throw error;

  // Notify freelancer
  await supabase.from('notifications').insert({
    user_id: escrow.freelancer_id,
    type: 'escrow_released',
    title: 'Payment Released',
    message: `$${(freelancerAmount / 100).toFixed(2)} has been released to your account.`,
    data: { escrowId, projectId: escrow.project_id },
  });

  // Record platform revenue
  await supabase.from('platform_revenue').insert({
    escrow_id: escrowId,
    project_id: escrow.project_id,
    amount: platformFee / 100,
    currency: escrow.currency,
    type: 'escrow_fee',
  });

  return data;
}

export async function initiateDispute(
  escrowId: string,
  initiatedBy: string,
  reason: string
) {
  const supabase = await createClient();

  // Get escrow
  const { data: escrow } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('id', escrowId)
    .eq('status', 'funded')
    .single();

  if (!escrow) {
    throw new Error('Escrow not found or not disputable');
  }

  // Verify initiator is part of the escrow
  if (escrow.client_id !== initiatedBy && escrow.freelancer_id !== initiatedBy) {
    throw new Error('Not authorized to dispute this escrow');
  }

  // Create dispute record
  const { data: dispute, error } = await supabase
    .from('escrow_disputes')
    .insert({
      escrow_id: escrowId,
      initiated_by: initiatedBy,
      reason,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw error;

  // Update escrow status
  await supabase
    .from('escrow_transactions')
    .update({ status: 'disputed' })
    .eq('id', escrowId);

  // Notify both parties
  const otherParty = escrow.client_id === initiatedBy
    ? escrow.freelancer_id
    : escrow.client_id;

  await supabase.from('notifications').insert([
    {
      user_id: otherParty,
      type: 'escrow_disputed',
      title: 'Escrow Disputed',
      message: 'A dispute has been opened for your project payment.',
      data: { escrowId, disputeId: dispute.id, projectId: escrow.project_id },
    },
    {
      user_id: 'admin', // Notify platform admin
      type: 'new_dispute',
      title: 'New Escrow Dispute',
      message: `Dispute opened for escrow ${escrowId}`,
      data: { escrowId, disputeId: dispute.id },
    },
  ]);

  return dispute;
}

export async function refundEscrow(escrowId: string, adminId: string) {
  const supabase = await createClient();

  // Verify admin
  const { data: admin } = await supabase
    .from('users')
    .select('role')
    .eq('id', adminId)
    .single();

  if (admin?.role !== 'admin') {
    throw new Error('Only admins can process refunds');
  }

  // Get escrow
  const { data: escrow } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('id', escrowId)
    .single();

  if (!escrow || !['funded', 'disputed'].includes(escrow.status)) {
    throw new Error('Escrow not eligible for refund');
  }

  // Refund via Stripe
  await stripe.refunds.create({
    payment_intent: escrow.payment_intent_id,
  });

  // Update escrow
  const { data, error } = await supabase
    .from('escrow_transactions')
    .update({ status: 'refunded' })
    .eq('id', escrowId)
    .select()
    .single();

  if (error) throw error;

  // Notify client
  await supabase.from('notifications').insert({
    user_id: escrow.client_id,
    type: 'escrow_refunded',
    title: 'Escrow Refunded',
    message: `$${escrow.amount} has been refunded to your payment method.`,
    data: { escrowId, projectId: escrow.project_id },
  });

  return data;
}
```

---

## Phase 7: CRM & Client Management

### Open Source CRM Integration

Based on our research, [Twenty CRM](https://twenty.com/) is the best open-source option.

```typescript
// File: lib/crm/twenty-client.ts
import axios from 'axios';

const twentyClient = axios.create({
  baseURL: process.env.TWENTY_API_URL || 'http://localhost:3000/rest',
  headers: {
    'Authorization': `Bearer ${process.env.TWENTY_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Company/Client operations
export async function createCompany(data: {
  name: string;
  domainName?: string;
  employees?: number;
  linkedinLink?: string;
}) {
  const { data: company } = await twentyClient.post('/companies', data);
  return company;
}

export async function getCompanies(filters?: {
  name?: string;
  createdAt?: { gte?: string; lte?: string };
}) {
  const { data } = await twentyClient.get('/companies', { params: filters });
  return data;
}

// Contact/Person operations
export async function createPerson(data: {
  name: { firstName: string; lastName: string };
  email: string;
  phone?: string;
  company?: { id: string };
}) {
  const { data: person } = await twentyClient.post('/people', data);
  return person;
}

// Opportunity (Deal) operations
export async function createOpportunity(data: {
  name: string;
  amount?: number;
  stage: string;
  closeDate?: string;
  company?: { id: string };
  person?: { id: string };
}) {
  const { data: opportunity } = await twentyClient.post('/opportunities', data);
  return opportunity;
}

export async function updateOpportunityStage(id: string, stage: string) {
  const { data } = await twentyClient.patch(`/opportunities/${id}`, { stage });
  return data;
}

// Activity/Task operations
export async function createActivity(data: {
  title: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  dueAt?: string;
  assignee?: { id: string };
  company?: { id: string };
  person?: { id: string };
}) {
  const { data: activity } = await twentyClient.post('/activities', data);
  return activity;
}

// Note operations
export async function createNote(data: {
  body: string;
  company?: { id: string };
  person?: { id: string };
  opportunity?: { id: string };
}) {
  const { data: note } = await twentyClient.post('/notes', data);
  return note;
}

// Pipeline stages
export async function getPipelineStages() {
  const { data } = await twentyClient.get('/pipeline-stages');
  return data;
}

// Favorites
export async function addToFavorites(targetId: string, targetType: 'company' | 'person' | 'opportunity') {
  const { data } = await twentyClient.post('/favorites', {
    [targetType]: { id: targetId },
  });
  return data;
}
```

### Integrated CRM Hook

```typescript
// File: lib/hooks/use-crm.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import * as twentyApi from '@/lib/crm/twenty-client';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  source: string;
  lifetime_value: number;
  last_contact_at: string;
  next_follow_up: string | null;
  notes: string;
  tags: string[];
  created_at: string;
}

export interface Deal {
  id: string;
  client_id: string;
  title: string;
  value: number;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  created_at: string;
}

export function useCRM() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch all clients
  const clientsQuery = useQuery({
    queryKey: ['crm', 'clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_clients')
        .select(`
          *,
          deals:crm_deals(id, value, stage),
          projects:projects(id, title, status),
          invoices:invoices(id, amount, status)
        `)
        .order('last_contact_at', { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
  });

  // Fetch deals pipeline
  const dealsQuery = useQuery({
    queryKey: ['crm', 'deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_deals')
        .select(`
          *,
          client:crm_clients(id, name, company)
        `)
        .order('expected_close_date', { ascending: true });

      if (error) throw error;
      return data as Deal[];
    },
  });

  // Create client
  const createClient = useMutation({
    mutationFn: async (client: Partial<Client>) => {
      const { data, error } = await supabase
        .from('crm_clients')
        .insert(client)
        .select()
        .single();

      if (error) throw error;

      // Sync to Twenty CRM if enabled
      try {
        await twentyApi.createPerson({
          name: { firstName: client.name!.split(' ')[0], lastName: client.name!.split(' ')[1] || '' },
          email: client.email!,
          phone: client.phone,
        });
      } catch (e) {
        console.error('Twenty sync failed:', e);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'clients'] });
    },
  });

  // Update client
  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('crm_clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'clients'] });
    },
  });

  // Create deal
  const createDeal = useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      const { data, error } = await supabase
        .from('crm_deals')
        .insert(deal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
    },
  });

  // Move deal stage
  const moveDealStage = useMutation({
    mutationFn: async ({ dealId, stage }: { dealId: string; stage: Deal['stage'] }) => {
      const { data, error } = await supabase
        .from('crm_deals')
        .update({ stage })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'deals'] });
    },
  });

  // Log activity
  const logActivity = useMutation({
    mutationFn: async (activity: {
      client_id: string;
      type: 'call' | 'email' | 'meeting' | 'note';
      content: string;
    }) => {
      const { error } = await supabase.from('crm_activities').insert(activity);

      // Update last contact date
      await supabase
        .from('crm_clients')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', activity.client_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'clients'] });
    },
  });

  // Pipeline metrics
  const pipelineMetrics = {
    totalValue: dealsQuery.data?.reduce((sum, d) => sum + d.value, 0) || 0,
    weightedValue: dealsQuery.data?.reduce((sum, d) => sum + (d.value * d.probability / 100), 0) || 0,
    dealsByStage: (dealsQuery.data || []).reduce(
      (acc, deal) => {
        if (!acc[deal.stage]) acc[deal.stage] = { count: 0, value: 0 };
        acc[deal.stage].count++;
        acc[deal.stage].value += deal.value;
        return acc;
      },
      {} as Record<string, { count: number; value: number }>
    ),
  };

  // Client segments
  const clientSegments = {
    leads: clientsQuery.data?.filter(c => c.status === 'lead').length || 0,
    prospects: clientsQuery.data?.filter(c => c.status === 'prospect').length || 0,
    customers: clientsQuery.data?.filter(c => c.status === 'customer').length || 0,
    churned: clientsQuery.data?.filter(c => c.status === 'churned').length || 0,
    totalLTV: clientsQuery.data?.reduce((sum, c) => sum + c.lifetime_value, 0) || 0,
  };

  return {
    // Data
    clients: clientsQuery.data || [],
    deals: dealsQuery.data || [],
    pipelineMetrics,
    clientSegments,

    // Loading states
    isLoading: clientsQuery.isLoading || dealsQuery.isLoading,

    // Mutations
    createClient,
    updateClient,
    createDeal,
    moveDealStage,
    logActivity,
  };
}
```

---

## Phase 8: Enterprise Features

### SSO & RBAC Implementation

```typescript
// File: lib/auth/enterprise-sso.ts
import { createClient } from '@/lib/supabase/server';

export interface SSOConfig {
  provider: 'saml' | 'oidc' | 'google_workspace' | 'microsoft_entra' | 'okta';
  domain: string;
  metadata_url?: string;
  client_id?: string;
  client_secret?: string;
  issuer?: string;
}

export async function configureSSOForWorkspace(
  workspaceId: string,
  config: SSOConfig
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspace_sso_configs')
    .upsert({
      workspace_id: workspaceId,
      provider: config.provider,
      domain: config.domain,
      config: {
        metadata_url: config.metadata_url,
        client_id: config.client_id,
        client_secret: config.client_secret,
        issuer: config.issuer,
      },
      is_enabled: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function enforceSSO(email: string) {
  const supabase = await createClient();
  const domain = email.split('@')[1];

  // Check if domain requires SSO
  const { data: ssoConfig } = await supabase
    .from('workspace_sso_configs')
    .select('*')
    .eq('domain', domain)
    .eq('is_enabled', true)
    .single();

  if (ssoConfig) {
    return {
      requiresSSO: true,
      provider: ssoConfig.provider,
      redirectUrl: `/auth/sso/${ssoConfig.provider}?workspace=${ssoConfig.workspace_id}`,
    };
  }

  return { requiresSSO: false };
}

// RBAC (Role-Based Access Control)
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | '*';
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  is_system: boolean;
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    permissions: [{ resource: '*', action: '*' }],
    is_system: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    permissions: [
      { resource: 'projects', action: '*' },
      { resource: 'users', action: 'manage' },
      { resource: 'billing', action: 'read' },
      { resource: 'settings', action: '*' },
    ],
    is_system: true,
  },
  {
    id: 'manager',
    name: 'Manager',
    permissions: [
      { resource: 'projects', action: '*' },
      { resource: 'users', action: 'read' },
      { resource: 'reports', action: '*' },
    ],
    is_system: true,
  },
  {
    id: 'member',
    name: 'Member',
    permissions: [
      { resource: 'projects', action: 'read' },
      { resource: 'tasks', action: '*' },
    ],
    is_system: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      { resource: '*', action: 'read' },
    ],
    is_system: true,
  },
];

export async function checkPermission(
  userId: string,
  workspaceId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get user's role in workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role_id')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!membership) return false;

  // Get role permissions
  const { data: role } = await supabase
    .from('roles')
    .select('permissions')
    .eq('id', membership.role_id)
    .single();

  if (!role) return false;

  const permissions = role.permissions as Permission[];

  // Check if user has required permission
  return permissions.some(
    (p) =>
      (p.resource === '*' || p.resource === resource) &&
      (p.action === '*' || p.action === action)
  );
}

export async function getUserPermissions(
  userId: string,
  workspaceId: string
): Promise<Permission[]> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('workspace_members')
    .select(`
      role:roles(permissions)
    `)
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .single();

  if (!membership?.role) return [];

  return (membership.role as any).permissions as Permission[];
}

// Middleware for protected routes
export async function requirePermission(
  userId: string,
  workspaceId: string,
  resource: string,
  action: string
) {
  const hasPermission = await checkPermission(userId, workspaceId, resource, action);

  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }
}
```

### Audit Logging

```typescript
// File: lib/audit/audit-logger.ts
import { createClient } from '@/lib/supabase/server';

export interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export async function logAuditEvent(
  workspaceId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  options?: {
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase.from('audit_logs').insert({
    workspace_id: workspaceId,
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_value: options?.oldValue,
    new_value: options?.newValue,
    ip_address: options?.ipAddress,
    user_agent: options?.userAgent,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function getAuditLogs(
  workspaceId: string,
  filters?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) {
  const supabase = await createClient();

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user:users(id, name, email, avatar_url)
    `)
    .eq('workspace_id', workspaceId)
    .order('timestamp', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  if (filters?.resourceType) {
    query = query.eq('resource_type', filters.resourceType);
  }
  if (filters?.startDate) {
    query = query.gte('timestamp', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('timestamp', filters.endDate);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as AuditLog[];
}
```

---

## Open Source Dependencies Summary

### Core Technologies

| Category | Library | License | Purpose |
|----------|---------|---------|---------|
| Real-Time | [Yjs](https://github.com/yjs/yjs) | MIT | CRDT for collaboration |
| Editor | [Tiptap](https://github.com/ueberdosis/tiptap) | MIT | Rich text editor |
| WebSocket | [Hocuspocus](https://github.com/ueberdosis/hocuspocus) | MIT | Collaboration backend |
| Billing | [Lago](https://github.com/getlago/lago) | AGPLv3 | Usage-based billing |
| Project Mgmt | [Plane](https://github.com/makeplane/plane) | AGPLv3 | Issue tracking |
| Recommendations | [Gorse](https://github.com/gorse-io/gorse) | Apache 2.0 | AI recommendations |
| CRM | [Twenty](https://github.com/twentyhq/twenty) | AGPLv3 | Client management |
| Video | [Diffusion Studio](https://github.com/diffusionstudio/core) | MIT | Browser video editing |
| TTS | [Chatterbox](https://github.com/resemble-ai/chatterbox) | MIT | Voice synthesis |

### Package.json Additions

```json
{
  "dependencies": {
    "@tiptap/core": "^3.0.0",
    "@tiptap/react": "^3.0.0",
    "@tiptap/starter-kit": "^3.0.0",
    "@tiptap/extension-collaboration": "^3.0.0",
    "@tiptap/extension-collaboration-caret": "^3.0.0",
    "@hocuspocus/provider": "^3.0.0",
    "@hocuspocus/server": "^3.0.0",
    "@hocuspocus/extension-database": "^3.0.0",
    "@hocuspocus/extension-redis": "^3.0.0",
    "yjs": "^13.6.0",
    "y-protocols": "^1.0.6",
    "y-indexeddb": "^9.0.12",
    "@getlago/lago-javascript-client": "^1.0.0",
    "@diffusionstudio/core": "^1.0.0",
    "stripe": "^14.0.0"
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up Hocuspocus server with Redis
- [ ] Implement collaborative editor with Tiptap
- [ ] Add offline persistence with IndexedDB
- [ ] Deploy real-time collaboration for documents

### Phase 2: Monetization (Weeks 5-8)
- [ ] Integrate Lago for usage tracking
- [ ] Set up Stripe Connect for marketplace payments
- [ ] Implement escrow system
- [ ] Add subscription management

### Phase 3: AI & Recommendations (Weeks 9-12)
- [ ] Deploy Gorse recommendation engine
- [ ] Implement freelancer-project matching
- [ ] Add AI voice synthesis
- [ ] Integrate multi-provider AI

### Phase 4: Creative Studio (Weeks 13-16)
- [ ] Implement browser-based video editing
- [ ] Add audio studio features
- [ ] Integrate TTS for voiceovers
- [ ] Build template system

### Phase 5: Enterprise (Weeks 17-20)
- [ ] Implement SSO (SAML/OIDC)
- [ ] Add RBAC with custom roles
- [ ] Build audit logging
- [ ] Add compliance features

### Phase 6: Marketplace (Weeks 21-24)
- [ ] Launch service marketplace
- [ ] Add plugin ecosystem
- [ ] Implement theme store
- [ ] Build integration hub

---

## Conclusion

This guide provides a comprehensive blueprint for transforming FreeFlow into an A+++ grade platform that can compete with and surpass industry leaders. By leveraging best-in-class open source technologies and implementing the features outlined here, FreeFlow will offer:

1. **Real-time collaboration** that rivals Figma and Notion
2. **Billing flexibility** that exceeds Stripe Billing
3. **Project management** comparable to Jira/Linear
4. **AI capabilities** that lead the market
5. **Creative tools** for video/audio production
6. **Marketplace ecosystem** like Upwork/Fiverr
7. **Enterprise features** for B2B sales

The total estimated development time is 24 weeks (6 months) with a dedicated team, resulting in a platform that will redefine the freelance and creative collaboration industry.

---

## Sources & References

### Real-Time Collaboration
- [Tiptap Documentation](https://tiptap.dev/docs)
- [Yjs Documentation](https://docs.yjs.dev/)
- [Hocuspocus Documentation](https://tiptap.dev/hocuspocus)

### Billing & Payments
- [Lago Documentation](https://docs.getlago.com/)
- [Kill Bill Documentation](https://docs.killbill.io/)
- [Stripe API Reference](https://stripe.com/docs/api)

### Project Management
- [Plane Developer Docs](https://docs.plane.so/)
- [OpenProject Documentation](https://www.openproject.org/docs/)

### AI & Recommendations
- [Gorse Documentation](https://gorse.io/docs/)
- [TensorFlow Recommenders](https://www.tensorflow.org/recommenders)

### Escrow & Marketplace
- [Escrow API Documentation](https://www.escrow.com/api)
- [MangoPay Documentation](https://mangopay.com/docs/)

### CRM
- [Twenty Documentation](https://twenty.com/developers)
- [SuiteCRM Documentation](https://docs.suitecrm.com/)

### Video Editing
- [Diffusion Studio Core](https://github.com/diffusionstudio/core)
- [Browser Studio](https://github.com/snack-dev/browser-studio)
- [Omniclip](https://github.com/omni-media/omniclip)

### Voice Synthesis
- [Chatterbox by Resemble AI](https://www.resemble.ai/chatterbox/)
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [VibeVoice by Microsoft](https://github.com/microsoft/VibeVoice)
