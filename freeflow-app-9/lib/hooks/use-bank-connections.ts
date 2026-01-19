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

// ============ Categorization Rules ============

export interface CategorizationRule {
  id: string;
  name: string;
  match_field: 'merchant' | 'description' | 'amount';
  match_type: 'contains' | 'equals' | 'starts_with' | 'regex' | 'greater_than' | 'less_than';
  match_value: string;
  category: string;
  subcategory?: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRuleInput {
  name: string;
  match_field: 'merchant' | 'description' | 'amount';
  match_type: 'contains' | 'equals' | 'starts_with' | 'regex' | 'greater_than' | 'less_than';
  match_value: string;
  category: string;
  subcategory?: string;
  priority?: number;
}

interface UseCategorizationRulesReturn {
  rules: CategorizationRule[];
  isLoading: boolean;
  error: string | null;
  createRule: (input: CreateRuleInput) => Promise<CategorizationRule | null>;
  updateRule: (id: string, input: Partial<CreateRuleInput>) => Promise<boolean>;
  deleteRule: (id: string) => Promise<boolean>;
  toggleRule: (id: string) => Promise<boolean>;
  reorderRules: (ruleIds: string[]) => Promise<boolean>;
  testRule: (ruleId: string, sampleText: string) => Promise<boolean>;
  applyRules: () => Promise<{ matched: number; updated: number }>;
  refresh: () => Promise<void>;
}

export function useCategorizationRules(): UseCategorizationRulesReturn {
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rules
  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plaid/categorization-rules');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch rules');
      }

      setRules(result.data?.rules || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rules';
      setError(message);
      // Don't toast on initial load failure - use empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create rule
  const createRule = useCallback(async (input: CreateRuleInput): Promise<CategorizationRule | null> => {
    try {
      const response = await fetch('/api/plaid/categorization-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create rule');
      }

      const newRule = result.data.rule;
      setRules(prev => [...prev, newRule].sort((a, b) => a.priority - b.priority));
      toast.success('Rule created successfully');
      return newRule;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create rule';
      toast.error(message);
      return null;
    }
  }, []);

  // Update rule
  const updateRule = useCallback(async (id: string, input: Partial<CreateRuleInput>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/plaid/categorization-rules?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update rule');
      }

      setRules(prev => prev.map(r => r.id === id ? { ...r, ...result.data.rule } : r));
      toast.success('Rule updated');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update rule';
      toast.error(message);
      return false;
    }
  }, []);

  // Delete rule
  const deleteRule = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/plaid/categorization-rules?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete rule');
      }

      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Rule deleted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rule';
      toast.error(message);
      return false;
    }
  }, []);

  // Toggle rule active status
  const toggleRule = useCallback(async (id: string): Promise<boolean> => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return false;
    return updateRule(id, { name: rule.name, match_field: rule.match_field, match_type: rule.match_type, match_value: rule.match_value, category: rule.category });
  }, [rules, updateRule]);

  // Reorder rules
  const reorderRules = useCallback(async (ruleIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/plaid/categorization-rules/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleIds }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reorder rules');
      }

      await fetchRules();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder rules';
      toast.error(message);
      return false;
    }
  }, [fetchRules]);

  // Test a rule against sample text
  const testRule = useCallback(async (ruleId: string, sampleText: string): Promise<boolean> => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return false;

    try {
      let matches = false;
      const text = sampleText.toLowerCase();
      const value = rule.match_value.toLowerCase();

      switch (rule.match_type) {
        case 'contains':
          matches = text.includes(value);
          break;
        case 'equals':
          matches = text === value;
          break;
        case 'starts_with':
          matches = text.startsWith(value);
          break;
        case 'regex':
          matches = new RegExp(rule.match_value, 'i').test(sampleText);
          break;
        case 'greater_than':
          matches = parseFloat(sampleText) > parseFloat(rule.match_value);
          break;
        case 'less_than':
          matches = parseFloat(sampleText) < parseFloat(rule.match_value);
          break;
      }

      return matches;
    } catch {
      return false;
    }
  }, [rules]);

  // Apply all rules to uncategorized transactions
  const applyRules = useCallback(async (): Promise<{ matched: number; updated: number }> => {
    try {
      const response = await fetch('/api/plaid/categorization-rules/apply', {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to apply rules');
      }

      const { matched, updated } = result.data;
      toast.success(`Applied rules to ${updated} transactions`);
      return { matched, updated };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to apply rules';
      toast.error(message);
      return { matched: 0, updated: 0 };
    }
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchRules();
  }, [fetchRules]);

  // Initial fetch
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    reorderRules,
    testRule,
    applyRules,
    refresh,
  };
}

// Default categories for transactions
export const TRANSACTION_CATEGORIES = [
  { id: 'income', label: 'Income', subcategories: ['Salary', 'Freelance', 'Investment', 'Other'] },
  { id: 'housing', label: 'Housing', subcategories: ['Rent', 'Mortgage', 'Utilities', 'Maintenance'] },
  { id: 'transportation', label: 'Transportation', subcategories: ['Gas', 'Public Transit', 'Parking', 'Car Payment', 'Insurance'] },
  { id: 'food', label: 'Food & Dining', subcategories: ['Groceries', 'Restaurants', 'Coffee Shops', 'Delivery'] },
  { id: 'shopping', label: 'Shopping', subcategories: ['Clothing', 'Electronics', 'Home', 'Other'] },
  { id: 'entertainment', label: 'Entertainment', subcategories: ['Streaming', 'Movies', 'Games', 'Events'] },
  { id: 'health', label: 'Health & Fitness', subcategories: ['Doctor', 'Pharmacy', 'Gym', 'Insurance'] },
  { id: 'business', label: 'Business', subcategories: ['Software', 'Equipment', 'Marketing', 'Services'] },
  { id: 'travel', label: 'Travel', subcategories: ['Flights', 'Hotels', 'Car Rental', 'Activities'] },
  { id: 'fees', label: 'Fees & Charges', subcategories: ['Bank Fees', 'Interest', 'Late Fees'] },
  { id: 'transfer', label: 'Transfer', subcategories: ['Internal', 'External', 'Investment'] },
  { id: 'other', label: 'Other', subcategories: ['Uncategorized'] },
];
