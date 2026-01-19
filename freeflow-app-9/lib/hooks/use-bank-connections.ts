/**
 * useBankConnections Hook - FreeFlow A+++ Implementation
 * Complete hook for managing bank connections and Plaid integration
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ============ Types ============

export interface BankInstitution {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  website_url: string | null;
}

export interface BankAccount {
  id: string;
  connection_id: string;
  name: string;
  official_name: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  current_balance: number | null;
  available_balance: number | null;
  credit_limit: number | null;
  currency: string;
  is_active: boolean;
  is_hidden: boolean;
  balance_last_updated: string | null;
}

export interface BankConnection {
  id: string;
  institution_name: string;
  status: 'pending' | 'connected' | 'disconnected' | 'error' | 'pending_expiration';
  last_sync_at: string | null;
  next_sync_at: string | null;
  error_code: string | null;
  error_message: string | null;
  accounts_synced_count: number;
  transactions_synced_count: number;
  created_at: string;
  updated_at: string;
  institution: BankInstitution | null;
  accounts?: BankAccount[];
}

export interface ConnectionSummary {
  totalConnections: number;
  activeConnections: number;
  totalBalance: number;
}

interface UseBankConnectionsReturn {
  connections: BankConnection[];
  summary: ConnectionSummary;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchConnections: (includeAccounts?: boolean) => Promise<void>;
  createLinkToken: (connectionId?: string) => Promise<string | null>;
  exchangeToken: (publicToken: string, metadata: PlaidLinkMetadata) => Promise<BankConnection | null>;
  removeConnection: (connectionId: string) => Promise<boolean>;
  syncConnection: (connectionId: string) => Promise<boolean>;
  syncAll: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

interface PlaidLinkMetadata {
  institution?: {
    institution_id: string;
    name: string;
  };
  accounts?: Array<{
    id: string;
    name: string;
    mask?: string;
    type: string;
    subtype?: string;
  }>;
}

// ============ Hook Implementation ============

export function useBankConnections(): UseBankConnectionsReturn {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [summary, setSummary] = useState<ConnectionSummary>({
    totalConnections: 0,
    activeConnections: 0,
    totalBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch connections
  const fetchConnections = useCallback(async (includeAccounts = true) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeAccounts) {
        params.set('includeAccounts', 'true');
      }

      const response = await fetch(`/api/plaid/connections?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch connections');
      }

      setConnections(result.data?.connections || []);
      setSummary(result.data?.summary || {
        totalConnections: 0,
        activeConnections: 0,
        totalBalance: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch connections';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create link token
  const createLinkToken = useCallback(async (connectionId?: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create link token');
      }

      return result.data.linkToken;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create link token';
      toast.error(message);
      return null;
    }
  }, []);

  // Exchange public token
  const exchangeToken = useCallback(async (
    publicToken: string,
    metadata: PlaidLinkMetadata
  ): Promise<BankConnection | null> => {
    try {
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicToken,
          institutionId: metadata.institution?.institution_id,
          institutionName: metadata.institution?.name,
          accounts: metadata.accounts,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to connect bank');
      }

      toast.success('Bank connected successfully!');

      // Refresh connections list
      await fetchConnections();

      return result.data.connection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect bank';
      toast.error(message);
      return null;
    }
  }, [fetchConnections]);

  // Remove connection
  const removeConnection = useCallback(async (connectionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/plaid/connections?id=${connectionId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove connection');
      }

      toast.success('Bank connection removed');

      // Optimistically update
      setConnections(prev => prev.filter(c => c.id !== connectionId));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove connection';
      toast.error(message);
      return false;
    }
  }, []);

  // Sync single connection
  const syncConnection = useCallback(async (connectionId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/plaid/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed');
      }

      toast.success(`Synced ${result.data.transactionsAdded} new transactions`);

      // Refresh connections
      await fetchConnections();

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      toast.error(message);
      return false;
    }
  }, [fetchConnections]);

  // Sync all connections
  const syncAll = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/plaid/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncAll: true }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed');
      }

      const { summary: syncSummary } = result.data;
      toast.success(
        `Synced ${syncSummary.totalTransactionsAdded} transactions across ${syncSummary.connectionsProcessed} accounts`
      );

      // Refresh connections
      await fetchConnections();

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      toast.error(message);
      return false;
    }
  }, [fetchConnections]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchConnections();
  }, [fetchConnections]);

  // Initial fetch
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    summary,
    isLoading,
    error,
    fetchConnections,
    createLinkToken,
    exchangeToken,
    removeConnection,
    syncConnection,
    syncAll,
    refresh,
  };
}

// ============ Plaid Link Hook ============

interface UsePlaidLinkOptions {
  onSuccess?: (publicToken: string, metadata: PlaidLinkMetadata) => void;
  onExit?: (error: Error | null, metadata: unknown) => void;
}

interface PlaidLinkHandler {
  open: () => void;
  ready: boolean;
  error: string | null;
}

export function usePlaidLink(options: UsePlaidLinkOptions = {}): PlaidLinkHandler {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [handler, setHandler] = useState<{ open: () => void } | null>(null);

  // Load Plaid Link script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if ((window as unknown as { Plaid?: unknown }).Plaid) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setError('Failed to load Plaid');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Create link token
  useEffect(() => {
    if (!ready) return;

    async function getLinkToken() {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        setLinkToken(result.data.linkToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    }

    getLinkToken();
  }, [ready]);

  // Initialize Plaid Link handler
  useEffect(() => {
    if (!ready || !linkToken || typeof window === 'undefined') return;

    const Plaid = (window as unknown as { Plaid: { create: (config: unknown) => { open: () => void } } }).Plaid;
    if (!Plaid) return;

    const linkHandler = Plaid.create({
      token: linkToken,
      onSuccess: (publicToken: string, metadata: PlaidLinkMetadata) => {
        options.onSuccess?.(publicToken, metadata);
      },
      onExit: (err: Error | null, metadata: unknown) => {
        options.onExit?.(err, metadata);
      },
    });

    setHandler(linkHandler);
  }, [ready, linkToken, options]);

  const open = useCallback(() => {
    if (handler) {
      handler.open();
    } else {
      toast.error('Plaid Link is not ready yet');
    }
  }, [handler]);

  return {
    open,
    ready: ready && !!handler,
    error,
  };
}

// ============ Formatting Helpers ============

export function formatBalance(amount: number | null, currency = 'USD'): string {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getConnectionStatusColor(status: BankConnection['status']): string {
  const colors: Record<BankConnection['status'], string> = {
    connected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    disconnected: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    pending_expiration: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  return colors[status] || colors.disconnected;
}

export function getAccountTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    depository: '🏦',
    credit: '💳',
    loan: '📋',
    investment: '📈',
    brokerage: '📊',
    other: '💰',
  };
  return icons[type] || icons.other;
}
