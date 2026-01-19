# Competitive Research & Implementation Phases

> **FreeFlow A+++ Grade Implementation Guide**
>
> Last Updated: January 2026
> Total Phases: 5 Major + 20 Sub-phases
> Estimated Full Implementation: 20 weeks

---

## Executive Summary

This document provides comprehensive research and implementation guidance for building FreeFlow into an industry-leading A+++ grade platform. Each phase includes:

- **Competitor Analysis**: How industry leaders implement each feature
- **Open Source Resources**: Best MIT/Apache licensed code to leverage
- **Context7 Documentation**: Latest library best practices
- **Implementation Code**: Production-ready TypeScript/React examples
- **Database Schemas**: Supabase PostgreSQL table designs
- **API Routes**: Next.js App Router API implementations

---

## Table of Contents

1. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure-weeks-1-4)
   - Offline Mode with Sync
   - Recurring Invoices
   - Bank Connections
   - Goals & OKRs

2. [Phase 2: Marketplace & Discovery](#phase-2-marketplace--discovery-weeks-5-8)
   - Service Marketplace
   - Job Matching Algorithm
   - Dispute Resolution
   - Seller Levels/Badges

3. [Phase 3: Creative Collaboration](#phase-3-creative-collaboration-weeks-9-12)
   - Frame-Accurate Video Comments
   - Screen Recording
   - Track Changes (Suggestions Mode)
   - Version History Timeline

4. [Phase 4: AI Enhancement](#phase-4-ai-enhancement-weeks-13-16)
   - Voice AI Mode
   - Custom AI Agents
   - Meeting Summaries
   - Organization-Wide AI Context

5. [Phase 5: Enterprise Features](#phase-5-enterprise-features-weeks-17-20)
   - Full Accounting Module
   - Automation Recipe Builder
   - Native Mobile Apps
   - White-Label Multi-Tenancy

---

# Phase 1: Core Infrastructure (Weeks 1-4)

## 1.1 Offline Mode with Sync

### Competitor Research

**Figma's Approach:**
- Local-first architecture using IndexedDB
- Optimistic UI updates with conflict resolution
- Background sync when connection restored
- Works completely offline for editing

**Google Docs:**
- Chrome extension for offline access
- Service Worker caches document state
- Sync queue for pending changes
- Conflict detection with merge UI

**Notion:**
- Progressive Web App with offline support
- Local SQLite-like storage
- Automatic sync with visual indicators
- Manual conflict resolution for heavy edits

### Open Source Resources

| Project | Stars | Key Features |
|---------|-------|--------------|
| [RxDB](https://github.com/pubkey/rxdb) | 21k+ | Reactive offline-first database |
| [PouchDB](https://github.com/pouchdb/pouchdb) | 16k+ | CouchDB-compatible sync |
| [WatermelonDB](https://github.com/Nozbe/WatermelonDB) | 10k+ | React Native optimized |
| [Dexie.js](https://github.com/dexie/Dexie.js) | 11k+ | IndexedDB wrapper |

### Implementation Guide

#### Service Worker Setup

```typescript
// public/sw.ts
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache API responses with network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Background sync for offline mutations
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations', {
  maxRetentionTime: 24 * 60, // Retry for 24 hours
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Synced:', entry.request.url);
      } catch (error) {
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

// Register mutation routes for background sync
registerRoute(
  ({ request }) =>
    request.method === 'POST' ||
    request.method === 'PUT' ||
    request.method === 'DELETE',
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);
```

#### IndexedDB Sync Store

```typescript
// lib/offline/sync-store.ts
import Dexie, { Table } from 'dexie';

export interface SyncOperation {
  id?: number;
  table: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  serverId?: string;
}

export interface CachedEntity {
  id: string;
  table: string;
  data: Record<string, unknown>;
  updatedAt: number;
  version: number;
}

class OfflineDatabase extends Dexie {
  syncQueue!: Table<SyncOperation>;
  entities!: Table<CachedEntity>;

  constructor() {
    super('FreeFlowOffline');
    this.version(1).stores({
      syncQueue: '++id, table, synced, timestamp',
      entities: 'id, table, updatedAt',
    });
  }
}

export const offlineDb = new OfflineDatabase();

export async function queueMutation(
  table: string,
  operation: SyncOperation['operation'],
  data: Record<string, unknown>
): Promise<void> {
  await offlineDb.syncQueue.add({
    table,
    operation,
    data,
    timestamp: Date.now(),
    synced: false,
  });
}

export async function syncPendingOperations(): Promise<void> {
  const pending = await offlineDb.syncQueue
    .where('synced')
    .equals(false)
    .toArray();

  for (const op of pending) {
    try {
      const response = await fetch(`/api/${op.table}`, {
        method: op.operation === 'delete' ? 'DELETE' :
                op.operation === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(op.data),
      });

      if (response.ok) {
        const result = await response.json();
        await offlineDb.syncQueue.update(op.id!, {
          synced: true,
          serverId: result.id
        });
      }
    } catch (error) {
      console.error('Sync failed for operation:', op.id, error);
    }
  }
}
```

#### React Hook for Offline-First Data

```typescript
// lib/hooks/use-offline-first.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineDb, queueMutation, CachedEntity } from '@/lib/offline/sync-store';

interface UseOfflineFirstOptions<T> {
  table: string;
  queryKey: string[];
  fetchFn: () => Promise<T[]>;
}

export function useOfflineFirst<T extends { id: string }>({
  table,
  queryKey,
  fetchFn,
}: UseOfflineFirstOptions<T>) {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Main query with offline fallback
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        if (isOnline) {
          const data = await fetchFn();
          // Cache in IndexedDB
          await Promise.all(
            data.map((item) =>
              offlineDb.entities.put({
                id: item.id,
                table,
                data: item as Record<string, unknown>,
                updatedAt: Date.now(),
                version: 1,
              })
            )
          );
          return data;
        }
      } catch (error) {
        console.warn('Fetch failed, using cached data:', error);
      }

      // Fallback to IndexedDB
      const cached = await offlineDb.entities
        .where('table')
        .equals(table)
        .toArray();
      return cached.map((c) => c.data as T);
    },
    staleTime: isOnline ? 1000 * 60 : Infinity, // Don't refetch when offline
  });

  // Optimistic create
  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<T, 'id'>) => {
      const tempId = `temp_${Date.now()}`;
      const itemWithId = { ...newItem, id: tempId } as T;

      // Optimistic update
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        [...(old || []), itemWithId]
      );

      // Queue for sync
      await queueMutation(table, 'create', itemWithId);

      if (isOnline) {
        const response = await fetch(`/api/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
        return response.json();
      }

      return itemWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Optimistic update
  const updateMutation = useMutation({
    mutationFn: async (updatedItem: T) => {
      // Optimistic update
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old?.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );

      // Queue for sync
      await queueMutation(table, 'update', updatedItem);

      if (isOnline) {
        const response = await fetch(`/api/${table}/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });
        return response.json();
      }

      return updatedItem;
    },
  });

  // Optimistic delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update
      queryClient.setQueryData<T[]>(queryKey, (old) =>
        old?.filter((item) => item.id !== id)
      );

      // Queue for sync
      await queueMutation(table, 'delete', { id });

      if (isOnline) {
        await fetch(`/api/${table}/${id}`, { method: 'DELETE' });
      }
    },
  });

  return {
    ...query,
    isOnline,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    pendingCount: query.data?.filter(
      (item) => item.id.startsWith('temp_')
    ).length || 0,
  };
}
```

#### Supabase Realtime Sync on Reconnect

```typescript
// lib/offline/realtime-sync.ts
import { createClient } from '@/lib/supabase/client';
import { offlineDb, syncPendingOperations } from './sync-store';

export function initializeRealtimeSync() {
  const supabase = createClient();

  // Listen for connection state changes
  supabase.realtime.onReconnect(() => {
    console.log('Reconnected to Supabase, syncing pending operations...');
    syncPendingOperations();
  });

  // Subscribe to changes for conflict detection
  const channel = supabase
    .channel('sync-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      async (payload) => {
        const { table, eventType, new: newRecord, old: oldRecord } = payload;

        // Check for conflicts with local changes
        const localVersion = await offlineDb.entities
          .where('id')
          .equals(newRecord?.id || oldRecord?.id)
          .first();

        if (localVersion && eventType === 'UPDATE') {
          // Server version is newer - notify user of conflict
          if (new Date(newRecord.updated_at) > new Date(localVersion.updatedAt)) {
            // Emit conflict event for UI handling
            window.dispatchEvent(
              new CustomEvent('sync-conflict', {
                detail: {
                  table,
                  localData: localVersion.data,
                  serverData: newRecord,
                },
              })
            );
          }
        }
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}
```

### Database Schema

```sql
-- Sync metadata table for tracking offline changes
CREATE TABLE sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  local_version INTEGER DEFAULT 1,
  server_version INTEGER DEFAULT 1,
  last_synced_at TIMESTAMPTZ,
  conflict_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, table_name, record_id)
);

-- Index for efficient sync queries
CREATE INDEX idx_sync_metadata_user ON sync_metadata(user_id, last_synced_at);

-- RLS policies
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync metadata"
  ON sync_metadata
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 1.2 Recurring Invoices

### Competitor Research

**FreshBooks:**
- Flexible schedules (weekly, monthly, yearly, custom)
- Auto-send on schedule
- Late fee automation
- Client notification preferences

**Stripe Billing:**
- Subscription lifecycle management
- Usage-based billing with meters
- Proration handling
- Dunning (failed payment retry)

**Invoice Ninja:**
- Cron-based generation
- Email templates per schedule
- Grace periods
- Auto-archive old invoices

### Open Source Resources

| Project | Feature | Integration Approach |
|---------|---------|---------------------|
| [node-cron](https://github.com/node-cron/node-cron) | Scheduling | Background jobs |
| [Stripe Billing](https://stripe.com/billing) | Subscriptions | API integration |
| [BullMQ](https://github.com/taskforcesh/bullmq) | Job queues | Reliable scheduling |

### Implementation Guide

#### Database Schema

```sql
-- Recurring invoice templates
CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- Template details
  title TEXT NOT NULL,
  description TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Schedule configuration
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  custom_interval_days INTEGER, -- For custom frequency
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = indefinite
  next_invoice_date DATE NOT NULL,

  -- Automation settings
  auto_send BOOLEAN DEFAULT false,
  send_days_before INTEGER DEFAULT 0,
  payment_terms_days INTEGER DEFAULT 30,
  late_fee_enabled BOOLEAN DEFAULT false,
  late_fee_percent DECIMAL(5,2) DEFAULT 0,
  late_fee_flat DECIMAL(12,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  invoices_generated INTEGER DEFAULT 0,
  last_generated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track generated invoices
ALTER TABLE invoices ADD COLUMN recurring_invoice_id UUID REFERENCES recurring_invoices(id);
ALTER TABLE invoices ADD COLUMN recurring_sequence INTEGER;

-- Indexes
CREATE INDEX idx_recurring_next_date ON recurring_invoices(next_invoice_date)
  WHERE status = 'active';
CREATE INDEX idx_recurring_user ON recurring_invoices(user_id);

-- RLS
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their recurring invoices"
  ON recurring_invoices
  FOR ALL
  USING (auth.uid() = user_id);
```

#### API Route for Recurring Invoice Management

```typescript
// app/api/billing/recurring/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const recurringInvoiceSchema = z.object({
  client_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  line_items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    rate: z.number(),
    amount: z.number(),
  })),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  custom_interval_days: z.number().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  auto_send: z.boolean().default(false),
  send_days_before: z.number().default(0),
  payment_terms_days: z.number().default(30),
  late_fee_enabled: z.boolean().default(false),
  late_fee_percent: z.number().default(0),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = recurringInvoiceSchema.parse(body);

  // Calculate totals
  const subtotal = validated.line_items.reduce((sum, item) => sum + item.amount, 0);
  const tax_amount = subtotal * (validated.tax_rate || 0) / 100;
  const total = subtotal + tax_amount;

  // Calculate next invoice date
  const next_invoice_date = calculateNextInvoiceDate(
    new Date(validated.start_date),
    validated.frequency,
    validated.custom_interval_days
  );

  const { data, error } = await supabase
    .from('recurring_invoices')
    .insert({
      user_id: user.id,
      ...validated,
      subtotal,
      tax_amount,
      total,
      next_invoice_date: next_invoice_date.toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('recurring_invoices')
    .select(`
      *,
      client:clients(id, name, email),
      generated_invoices:invoices(id, invoice_number, status, total)
    `)
    .eq('user_id', user.id)
    .order('next_invoice_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

function calculateNextInvoiceDate(
  startDate: Date,
  frequency: string,
  customDays?: number
): Date {
  const next = new Date(startDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'custom':
      next.setDate(next.getDate() + (customDays || 30));
      break;
  }

  return next;
}
```

#### Background Job for Invoice Generation

```typescript
// lib/jobs/recurring-invoice-processor.ts
import { Queue, Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create job queue
export const recurringInvoiceQueue = new Queue('recurring-invoices', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Process recurring invoices
const worker = new Worker(
  'recurring-invoices',
  async (job: Job) => {
    const { action } = job.data;

    if (action === 'process-due') {
      await processDueRecurringInvoices();
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

async function processDueRecurringInvoices() {
  const today = new Date().toISOString().split('T')[0];

  // Get all due recurring invoices
  const { data: dueInvoices, error } = await supabase
    .from('recurring_invoices')
    .select(`
      *,
      client:clients(*),
      user:users(*)
    `)
    .eq('status', 'active')
    .lte('next_invoice_date', today);

  if (error) {
    console.error('Failed to fetch due invoices:', error);
    return;
  }

  for (const recurring of dueInvoices || []) {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${recurring.invoices_generated + 1}`;

      // Create the invoice
      const { data: invoice, error: createError } = await supabase
        .from('invoices')
        .insert({
          user_id: recurring.user_id,
          client_id: recurring.client_id,
          recurring_invoice_id: recurring.id,
          recurring_sequence: recurring.invoices_generated + 1,
          invoice_number: invoiceNumber,
          title: recurring.title,
          description: recurring.description,
          line_items: recurring.line_items,
          subtotal: recurring.subtotal,
          tax_rate: recurring.tax_rate,
          tax_amount: recurring.tax_amount,
          total: recurring.total,
          currency: recurring.currency,
          status: 'draft',
          due_date: calculateDueDate(recurring.payment_terms_days),
          issue_date: today,
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create invoice:', createError);
        continue;
      }

      // Calculate next invoice date
      const nextDate = calculateNextInvoiceDate(
        new Date(recurring.next_invoice_date),
        recurring.frequency,
        recurring.custom_interval_days
      );

      // Check if we've reached the end date
      const shouldComplete = recurring.end_date &&
        nextDate > new Date(recurring.end_date);

      // Update recurring invoice
      await supabase
        .from('recurring_invoices')
        .update({
          invoices_generated: recurring.invoices_generated + 1,
          last_generated_at: new Date().toISOString(),
          next_invoice_date: shouldComplete ? null : nextDate.toISOString().split('T')[0],
          status: shouldComplete ? 'completed' : 'active',
        })
        .eq('id', recurring.id);

      // Auto-send if enabled
      if (recurring.auto_send && invoice) {
        await sendInvoiceEmail(invoice, recurring.client);

        await supabase
          .from('invoices')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', invoice.id);
      }

      console.log(`Generated invoice ${invoiceNumber} for recurring ${recurring.id}`);
    } catch (err) {
      console.error(`Error processing recurring invoice ${recurring.id}:`, err);
    }
  }
}

async function sendInvoiceEmail(invoice: any, client: any) {
  // Integration with Resend or other email service
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'invoices@freeflow.app',
    to: client.email,
    subject: `Invoice ${invoice.invoice_number} from FreeFlow`,
    html: `
      <h1>Invoice ${invoice.invoice_number}</h1>
      <p>Amount due: ${invoice.currency} ${invoice.total}</p>
      <p>Due date: ${invoice.due_date}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}/pay">
        Pay Now
      </a>
    `,
  });
}

function calculateDueDate(paymentTermsDays: number): string {
  const due = new Date();
  due.setDate(due.getDate() + paymentTermsDays);
  return due.toISOString().split('T')[0];
}

function calculateNextInvoiceDate(
  current: Date,
  frequency: string,
  customDays?: number
): Date {
  const next = new Date(current);

  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'biweekly': next.setDate(next.getDate() + 14); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    case 'custom': next.setDate(next.getDate() + (customDays || 30)); break;
  }

  return next;
}

// Schedule job to run every hour
recurringInvoiceQueue.add(
  'process-due',
  { action: 'process-due' },
  {
    repeat: {
      pattern: '0 * * * *', // Every hour
    },
  }
);

export { worker };
```

---

## 1.3 Bank Connections (Plaid Integration)

### Competitor Research

**FreshBooks + Wave:**
- Plaid Link for bank connection
- Auto-import transactions
- AI categorization
- Reconciliation matching

**QuickBooks:**
- 14,000+ bank connections
- Real-time balance sync
- Rule-based categorization
- Smart matching algorithms

### Open Source Resources

| Project | Purpose |
|---------|---------|
| [Plaid SDK](https://plaid.com/docs/) | Bank connections |
| [Akahu](https://akahu.nz/) | NZ/AU alternative |
| [TrueLayer](https://truelayer.com/) | EU Open Banking |

### Implementation Guide

#### Plaid Link Component

```typescript
// components/banking/plaid-link-button.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: any) => void;
}

export function PlaidLinkButton({ onSuccess }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Get link token from backend
  useEffect(() => {
    async function fetchLinkToken() {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
      });
      const { link_token } = await response.json();
      setLinkToken(link_token);
    }
    fetchLinkToken();
  }, []);

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: useCallback(
      (publicToken: string, metadata: any) => {
        onSuccess(publicToken, metadata);
        toast.success('Bank account connected successfully!');
      },
      [onSuccess]
    ),
    onExit: (err, metadata) => {
      if (err) {
        toast.error('Connection cancelled');
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      className="gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-8h2v6h-2V8z"/>
      </svg>
      Connect Bank Account
    </Button>
  );
}
```

#### Plaid API Routes

```typescript
// app/api/plaid/create-link-token/route.ts
import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { createClient } from '@/lib/supabase/server';

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  })
);

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: 'FreeFlow',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Gb, CountryCode.Ca],
      language: 'en',
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid link token error:', error);
    return NextResponse.json(
      { error: 'Failed to create link token' },
      { status: 500 }
    );
  }
}

// app/api/plaid/exchange-token/route.ts
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { public_token, metadata } = await request.json();

  try {
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account details
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Store connection in database
    const { data: connection, error } = await supabase
      .from('bank_connections')
      .insert({
        user_id: user.id,
        plaid_item_id: itemId,
        plaid_access_token: accessToken, // Encrypt in production!
        institution_id: metadata.institution.institution_id,
        institution_name: metadata.institution.name,
        accounts: accountsResponse.data.accounts.map(acc => ({
          account_id: acc.account_id,
          name: acc.name,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
        })),
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Queue initial transaction sync
    await fetch('/api/plaid/sync-transactions', {
      method: 'POST',
      body: JSON.stringify({ connection_id: connection.id }),
    });

    return NextResponse.json({ success: true, connection });
  } catch (error) {
    console.error('Plaid exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}
```

#### Transaction Sync and Categorization

```typescript
// app/api/plaid/sync-transactions/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { plaidClient } from '@/lib/plaid/client';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(request: Request) {
  const supabase = await createClient();
  const { connection_id } = await request.json();

  // Get connection details
  const { data: connection, error: connError } = await supabase
    .from('bank_connections')
    .select('*')
    .eq('id', connection_id)
    .single();

  if (connError || !connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
  }

  try {
    // Fetch transactions from Plaid
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: connection.plaid_access_token,
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });

    const transactions = transactionsResponse.data.transactions;

    // Process and categorize each transaction
    const processedTransactions = await Promise.all(
      transactions.map(async (txn) => {
        // Use AI to categorize if Plaid category is generic
        let category = txn.category?.[0] || 'Uncategorized';
        let suggestedExpenseCategory = null;

        if (category === 'Uncategorized' || !txn.category) {
          const aiCategory = await categorizeWithAI(txn.name, txn.amount);
          category = aiCategory.category;
          suggestedExpenseCategory = aiCategory.expenseCategory;
        }

        return {
          user_id: connection.user_id,
          bank_connection_id: connection.id,
          plaid_transaction_id: txn.transaction_id,
          account_id: txn.account_id,
          amount: Math.abs(txn.amount),
          is_expense: txn.amount > 0,
          date: txn.date,
          name: txn.name,
          merchant_name: txn.merchant_name,
          category,
          plaid_category: txn.category,
          suggested_expense_category: suggestedExpenseCategory,
          pending: txn.pending,
          matched_invoice_id: null,
          matched_expense_id: null,
        };
      })
    );

    // Upsert transactions
    const { error: insertError } = await supabase
      .from('bank_transactions')
      .upsert(processedTransactions, {
        onConflict: 'plaid_transaction_id',
      });

    if (insertError) throw insertError;

    // Update sync timestamp
    await supabase
      .from('bank_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection_id);

    return NextResponse.json({
      success: true,
      synced: processedTransactions.length,
    });
  } catch (error) {
    console.error('Transaction sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}

async function categorizeWithAI(
  merchantName: string,
  amount: number
): Promise<{ category: string; expenseCategory: string }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a financial categorization AI. Categorize transactions for freelancers.
          Return JSON with:
          - category: general category (Food, Transportation, Software, Office, etc.)
          - expenseCategory: specific expense type for tax purposes`,
      },
      {
        role: 'user',
        content: `Categorize: "${merchantName}" for $${Math.abs(amount)}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return {
    category: result.category || 'Uncategorized',
    expenseCategory: result.expenseCategory || 'general',
  };
}
```

---

## 1.4 Goals & OKRs System

### Competitor Research

**Asana Goals:**
- Company → Team → Individual hierarchy
- Progress roll-up from sub-goals
- Automatic status updates from projects
- Timeline visualization

**ClickUp Goals:**
- Targets with numeric/currency/boolean types
- Folders for goal organization
- Rolling period goals (weekly sprint goals)
- Team workspaces

**Lattice:**
- OKR alignment trees
- Check-in reminders
- Scoring rubrics
- Integration with performance reviews

### Implementation Guide

#### Database Schema

```sql
-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,

  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('company', 'team', 'individual')),

  -- Target and progress
  target_type TEXT NOT NULL CHECK (target_type IN ('numeric', 'currency', 'percentage', 'boolean', 'milestone')),
  target_value DECIMAL(12,2),
  current_value DECIMAL(12,2) DEFAULT 0,
  currency TEXT,

  -- Timeline
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  time_period TEXT, -- 'Q1 2026', 'H1 2026', '2026', etc.

  -- Status
  status TEXT DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'completed', 'cancelled')),
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

  -- Linked items
  linked_project_ids UUID[] DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id),
  team_ids UUID[] DEFAULT '{}',

  -- Metadata
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key Results (for OKRs)
CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  -- Measurement
  target_type TEXT NOT NULL CHECK (target_type IN ('numeric', 'currency', 'percentage', 'boolean')),
  start_value DECIMAL(12,2) DEFAULT 0,
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  unit TEXT, -- 'users', 'revenue', '%', etc.

  -- Progress
  progress_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'at_risk')),

  -- Owner
  owner_id UUID REFERENCES auth.users(id),

  -- Order
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal check-ins
CREATE TABLE goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  previous_value DECIMAL(12,2),
  new_value DECIMAL(12,2),
  status TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_org ON goals(organization_id);
CREATE INDEX idx_goals_parent ON goals(parent_goal_id);
CREATE INDEX idx_goals_time_period ON goals(time_period);
CREATE INDEX idx_key_results_goal ON key_results(goal_id);

-- Function to auto-update goal progress from key results
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals
  SET
    progress_percent = (
      SELECT COALESCE(AVG(progress_percent), 0)
      FROM key_results
      WHERE goal_id = NEW.goal_id
    ),
    current_value = (
      SELECT COALESCE(SUM(current_value), 0)
      FROM key_results
      WHERE goal_id = NEW.goal_id
    ),
    updated_at = NOW()
  WHERE id = NEW.goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
AFTER INSERT OR UPDATE ON key_results
FOR EACH ROW EXECUTE FUNCTION update_goal_progress();
```

#### Goals Hook

```typescript
// lib/hooks/use-goals.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'company' | 'team' | 'individual';
  target_type: 'numeric' | 'currency' | 'percentage' | 'boolean' | 'milestone';
  target_value?: number;
  current_value: number;
  progress_percent: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed' | 'cancelled';
  start_date: string;
  due_date: string;
  time_period?: string;
  parent_goal_id?: string;
  key_results?: KeyResult[];
  child_goals?: Goal[];
}

interface KeyResult {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  progress_percent: number;
  status: string;
}

export function useGoals(filters?: {
  type?: Goal['type'];
  time_period?: string;
  status?: string;
}) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const queryKey = ['goals', filters];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('goals')
        .select(`
          *,
          key_results (*),
          child_goals:goals!parent_goal_id (*),
          owner:users!owner_id (id, name, avatar_url)
        `)
        .is('parent_goal_id', null) // Only top-level goals
        .order('due_date', { ascending: true });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.time_period) {
        query = query.eq('time_period', filters.time_period);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Goal[];
    },
  });

  const createGoal = useMutation({
    mutationFn: async (newGoal: Partial<Goal>) => {
      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Goal> & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const updateKeyResult = useMutation({
    mutationFn: async ({
      id,
      current_value
    }: {
      id: string;
      current_value: number;
    }) => {
      // Calculate progress percentage
      const { data: kr } = await supabase
        .from('key_results')
        .select('start_value, target_value')
        .eq('id', id)
        .single();

      if (!kr) throw new Error('Key result not found');

      const range = kr.target_value - kr.start_value;
      const progress = range > 0
        ? Math.min(100, Math.max(0, ((current_value - kr.start_value) / range) * 100))
        : current_value >= kr.target_value ? 100 : 0;

      const { data, error } = await supabase
        .from('key_results')
        .update({
          current_value,
          progress_percent: Math.round(progress),
          status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const checkIn = useMutation({
    mutationFn: async ({
      goal_id,
      new_value,
      notes,
    }: {
      goal_id: string;
      new_value: number;
      notes?: string;
    }) => {
      // Get current value
      const { data: goal } = await supabase
        .from('goals')
        .select('current_value, target_value')
        .eq('id', goal_id)
        .single();

      if (!goal) throw new Error('Goal not found');

      // Calculate new progress
      const progress = goal.target_value
        ? Math.min(100, (new_value / goal.target_value) * 100)
        : 0;

      // Determine status based on progress and time remaining
      let status: Goal['status'] = 'on_track';
      // Add logic for at_risk/behind based on due date

      // Create check-in record
      await supabase.from('goal_check_ins').insert({
        goal_id,
        previous_value: goal.current_value,
        new_value,
        status,
        notes,
      });

      // Update goal
      const { data, error } = await supabase
        .from('goals')
        .update({
          current_value: new_value,
          progress_percent: Math.round(progress),
          status: progress >= 100 ? 'completed' : status,
        })
        .eq('id', goal_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  return {
    goals: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    updateKeyResult: updateKeyResult.mutate,
    checkIn: checkIn.mutate,
  };
}
```

---

# Phase 2: Marketplace & Discovery (Weeks 5-8)

## 2.1 Service Marketplace

### Competitor Research

**Fiverr Gig System:**
- Category hierarchy (8 main, 200+ sub-categories)
- Gig packages (Basic, Standard, Premium)
- Gig extras (add-ons)
- SEO-optimized listings
- Buyer protection

**Upwork Project Catalog:**
- Fixed-price predefined projects
- Scope clearly defined upfront
- Revision limits built-in
- Faster hiring process

### Database Schema

```sql
-- Service listings (gigs)
CREATE TABLE service_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES service_categories(id),
  subcategory_id UUID REFERENCES service_categories(id),
  tags TEXT[] DEFAULT '{}',

  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Packages
  packages JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   { "name": "Basic", "description": "...", "price": 50, "delivery_days": 3, "revisions": 1, "features": ["..."] },
  --   { "name": "Standard", "description": "...", "price": 100, "delivery_days": 5, "revisions": 2, "features": ["..."] },
  --   { "name": "Premium", "description": "...", "price": 200, "delivery_days": 7, "revisions": 3, "features": ["..."] }
  -- ]

  -- Extras (add-ons)
  extras JSONB DEFAULT '[]',
  -- Example: [{ "title": "Extra fast delivery", "price": 25, "delivery_days": -1 }]

  -- Requirements (questions for buyer)
  requirements JSONB DEFAULT '[]',

  -- FAQs
  faqs JSONB DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'rejected')),
  rejection_reason TEXT,

  -- Stats
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,

  -- SEO
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,

  -- Settings
  max_concurrent_orders INTEGER DEFAULT 5,
  vacation_mode BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES service_categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Orders from marketplace
CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES service_listings(id),
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),

  -- Package selected
  package_name TEXT NOT NULL,
  package_price DECIMAL(12,2) NOT NULL,
  extras JSONB DEFAULT '[]',
  extras_total DECIMAL(12,2) DEFAULT 0,

  -- Totals
  subtotal DECIMAL(12,2) NOT NULL,
  service_fee DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Timeline
  delivery_days INTEGER NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,

  -- Requirements (buyer's answers)
  requirements_answers JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'requirements_submitted', 'in_progress',
    'delivered', 'revision_requested', 'completed',
    'cancelled', 'disputed'
  )),

  -- Revisions
  revisions_used INTEGER DEFAULT 0,
  revisions_allowed INTEGER NOT NULL,

  -- Review
  buyer_review_id UUID,
  seller_review_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables
CREATE TABLE service_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,

  message TEXT,
  files JSONB DEFAULT '[]', -- [{ "name": "...", "url": "...", "size": 1234 }]

  delivery_number INTEGER NOT NULL, -- 1 for initial, 2+ for revisions
  is_revision BOOLEAN DEFAULT false,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revision_requested')),
  revision_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_category ON service_listings(category_id) WHERE status = 'active';
CREATE INDEX idx_listings_user ON service_listings(user_id);
CREATE INDEX idx_listings_rating ON service_listings(average_rating DESC) WHERE status = 'active';
CREATE INDEX idx_listings_search ON service_listings USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_orders_buyer ON service_orders(buyer_id);
CREATE INDEX idx_orders_seller ON service_orders(seller_id);
```

### Marketplace Search API

```typescript
// app/api/marketplace/search/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();

  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const deliveryTime = searchParams.get('delivery_time');
  const sellerLevel = searchParams.get('seller_level');
  const sortBy = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let dbQuery = supabase
    .from('service_listings')
    .select(`
      *,
      seller:users!user_id (
        id, name, avatar_url,
        seller_profile:seller_profiles (level, rating, reviews_count)
      ),
      category:service_categories!category_id (name, slug)
    `)
    .eq('status', 'active')
    .eq('vacation_mode', false);

  // Full-text search
  if (query) {
    dbQuery = dbQuery.textSearch('title', query, {
      type: 'websearch',
      config: 'english',
    });
  }

  // Category filters
  if (category) {
    dbQuery = dbQuery.eq('category.slug', category);
  }
  if (subcategory) {
    dbQuery = dbQuery.eq('subcategory_id', subcategory);
  }

  // Price filter (using first package price)
  if (minPrice) {
    dbQuery = dbQuery.gte('packages->0->price', parseFloat(minPrice));
  }
  if (maxPrice) {
    dbQuery = dbQuery.lte('packages->0->price', parseFloat(maxPrice));
  }

  // Delivery time filter
  if (deliveryTime) {
    dbQuery = dbQuery.lte('packages->0->delivery_days', parseInt(deliveryTime));
  }

  // Sorting
  switch (sortBy) {
    case 'price_low':
      dbQuery = dbQuery.order('packages->0->price', { ascending: true });
      break;
    case 'price_high':
      dbQuery = dbQuery.order('packages->0->price', { ascending: false });
      break;
    case 'rating':
      dbQuery = dbQuery.order('average_rating', { ascending: false });
      break;
    case 'orders':
      dbQuery = dbQuery.order('orders_completed', { ascending: false });
      break;
    case 'newest':
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    default: // relevance - handled by text search
      dbQuery = dbQuery.order('orders_completed', { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  dbQuery = dbQuery.range(from, from + limit - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    listings: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
```

---

## 2.2 Job Matching Algorithm

### Competitor Research

**Upwork Matching:**
- Skill-to-job matching (TF-IDF + embeddings)
- Historical success rate weighting
- Response time factor
- Availability consideration
- Client preference learning

**LinkedIn Jobs:**
- Skills graph matching
- Experience level matching
- Location/remote preferences
- Salary expectations alignment

### Implementation with AI Embeddings

```typescript
// lib/ai/job-matching.ts
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI();

interface MatchScore {
  job_id: string;
  score: number;
  reasons: string[];
  skills_matched: string[];
  skills_missing: string[];
}

export async function matchFreelancerToJobs(
  userId: string,
  limit: number = 20
): Promise<MatchScore[]> {
  const supabase = await createClient();

  // Get freelancer profile with embedding
  const { data: profile } = await supabase
    .from('freelancer_profiles')
    .select(`
      *,
      skills:freelancer_skills (skill_name, proficiency, years_experience),
      portfolio:portfolio_items (title, description, tags),
      work_history:service_orders (
        listing:service_listings (category_id, tags),
        buyer_review:reviews (rating)
      )
    `)
    .eq('user_id', userId)
    .single();

  if (!profile) {
    throw new Error('Freelancer profile not found');
  }

  // Create profile embedding if not exists
  let profileEmbedding = profile.embedding;
  if (!profileEmbedding) {
    profileEmbedding = await createProfileEmbedding(profile);
    await supabase
      .from('freelancer_profiles')
      .update({ embedding: profileEmbedding })
      .eq('user_id', userId);
  }

  // Get open jobs
  const { data: jobs } = await supabase
    .from('job_postings')
    .select(`
      *,
      client:users!client_id (id, name),
      required_skills:job_required_skills (skill_name, importance)
    `)
    .eq('status', 'open')
    .gte('deadline', new Date().toISOString());

  if (!jobs || jobs.length === 0) {
    return [];
  }

  // Score each job
  const scoredJobs = await Promise.all(
    jobs.map(async (job) => {
      // Get or create job embedding
      let jobEmbedding = job.embedding;
      if (!jobEmbedding) {
        jobEmbedding = await createJobEmbedding(job);
        await supabase
          .from('job_postings')
          .update({ embedding: jobEmbedding })
          .eq('id', job.id);
      }

      // Calculate cosine similarity
      const similarity = cosineSimilarity(profileEmbedding, jobEmbedding);

      // Calculate skill match
      const skillMatch = calculateSkillMatch(
        profile.skills,
        job.required_skills
      );

      // Calculate experience match
      const experienceMatch = calculateExperienceMatch(
        profile,
        job.experience_level
      );

      // Calculate availability match
      const availabilityMatch = profile.available_hours >= job.estimated_hours
        ? 1
        : profile.available_hours / job.estimated_hours;

      // Weighted final score
      const finalScore =
        similarity * 0.3 +
        skillMatch.score * 0.35 +
        experienceMatch * 0.2 +
        availabilityMatch * 0.15;

      return {
        job_id: job.id,
        score: Math.round(finalScore * 100),
        reasons: generateMatchReasons(similarity, skillMatch, experienceMatch),
        skills_matched: skillMatch.matched,
        skills_missing: skillMatch.missing,
      };
    })
  );

  // Sort by score and return top matches
  return scoredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function createProfileEmbedding(profile: any): Promise<number[]> {
  const text = `
    Freelancer specializing in ${profile.skills?.map((s: any) => s.skill_name).join(', ')}.
    ${profile.bio || ''}
    Portfolio includes: ${profile.portfolio?.map((p: any) => p.title).join(', ')}.
    Experience level: ${profile.experience_years} years.
  `;

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

async function createJobEmbedding(job: any): Promise<number[]> {
  const text = `
    ${job.title}
    ${job.description}
    Required skills: ${job.required_skills?.map((s: any) => s.skill_name).join(', ')}.
    Experience level: ${job.experience_level}.
    Budget: ${job.budget_min}-${job.budget_max} ${job.currency}.
  `;

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function calculateSkillMatch(
  freelancerSkills: any[],
  requiredSkills: any[]
): { score: number; matched: string[]; missing: string[] } {
  const freelancerSkillNames = new Set(
    freelancerSkills.map(s => s.skill_name.toLowerCase())
  );

  const matched: string[] = [];
  const missing: string[] = [];
  let weightedScore = 0;
  let totalWeight = 0;

  for (const required of requiredSkills) {
    const importance = required.importance || 1;
    totalWeight += importance;

    if (freelancerSkillNames.has(required.skill_name.toLowerCase())) {
      matched.push(required.skill_name);
      weightedScore += importance;
    } else {
      missing.push(required.skill_name);
    }
  }

  return {
    score: totalWeight > 0 ? weightedScore / totalWeight : 0,
    matched,
    missing,
  };
}

function calculateExperienceMatch(profile: any, requiredLevel: string): number {
  const levelYears: Record<string, number> = {
    entry: 0,
    intermediate: 2,
    expert: 5,
  };

  const required = levelYears[requiredLevel] || 0;
  const actual = profile.experience_years || 0;

  if (actual >= required) return 1;
  return actual / required;
}

function generateMatchReasons(
  similarity: number,
  skillMatch: { score: number; matched: string[] },
  experienceMatch: number
): string[] {
  const reasons: string[] = [];

  if (similarity > 0.8) {
    reasons.push('Profile highly relevant to job requirements');
  } else if (similarity > 0.6) {
    reasons.push('Good profile match for this job');
  }

  if (skillMatch.score >= 0.9) {
    reasons.push(`Matches ${skillMatch.matched.length} of ${skillMatch.matched.length} required skills`);
  } else if (skillMatch.score >= 0.7) {
    reasons.push(`Strong skill overlap (${Math.round(skillMatch.score * 100)}%)`);
  }

  if (experienceMatch === 1) {
    reasons.push('Experience level meets requirements');
  }

  return reasons;
}
```

---

*[Continued in next sections: Dispute Resolution, Seller Levels, Phase 3-5 implementations...]*

---

# Summary: Key Implementation Files

## Phase 1: Core Infrastructure
```
lib/offline/service-worker.ts
lib/offline/sync-store.ts
lib/offline/realtime-sync.ts
lib/hooks/use-offline-first.ts
app/api/billing/recurring/route.ts
lib/jobs/recurring-invoice-processor.ts
lib/plaid/client.ts
app/api/plaid/create-link-token/route.ts
app/api/plaid/exchange-token/route.ts
app/api/plaid/sync-transactions/route.ts
app/(app)/dashboard/goals-v2/page.tsx
lib/hooks/use-goals.ts
```

## Phase 2: Marketplace
```
app/(marketplace)/services/page.tsx
app/(marketplace)/services/[slug]/page.tsx
app/api/marketplace/search/route.ts
app/api/marketplace/listings/route.ts
lib/ai/job-matching.ts
app/api/disputes/route.ts
lib/gamification/seller-levels.ts
```

## Phase 3: Creative Collaboration
```
components/video/frame-comments.tsx
lib/media-recorder/screen-capture.ts
lib/tiptap/track-changes-extension.ts
lib/versioning/history-timeline.ts
```

## Phase 4: AI Enhancement
```
app/api/ai/voice/route.ts
lib/whisper/transcription.ts
app/(app)/dashboard/ai-agents/page.tsx
lib/ai/meeting-summarizer.ts
lib/ai/org-knowledge-base.ts
```

## Phase 5: Enterprise
```
app/(app)/dashboard/accounting/page.tsx
lib/accounting/double-entry.ts
lib/automations/recipe-builder.ts
lib/multi-tenancy/white-label.ts
```

---

## Document Metadata

- **Created**: January 2026
- **Version**: 1.0
- **Author**: FreeFlow Development Team
- **Related Documents**:
  - [FEATURE_GAP_ANALYSIS.md](./FEATURE_GAP_ANALYSIS.md)
  - [API_ENDPOINTS.md](./API_ENDPOINTS.md)
  - [DATABASE_SCHEMAS.md](./DATABASE_SCHEMAS.md)

---

**Note**: This document provides foundational implementations. Each feature should be expanded with:
- Unit tests (Jest/Vitest)
- E2E tests (Playwright)
- Error handling
- Rate limiting
- Monitoring/logging
- Documentation
