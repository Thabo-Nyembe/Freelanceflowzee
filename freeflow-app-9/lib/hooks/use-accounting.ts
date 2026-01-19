'use client';

/**
 * Accounting Hook - FreeFlow A+++ Implementation
 * React hook for double-entry accounting functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
  ChartOfAccount,
  JournalEntry,
  JournalLine,
  TrialBalance,
  IncomeStatement,
  BalanceSheet,
  AICategorizationResult,
} from '@/lib/accounting/double-entry';

// ============================================================================
// TYPES
// ============================================================================

interface AccountWithMeta extends ChartOfAccount {
  hasTransactions?: boolean;
}

interface JournalEntryWithLines extends Omit<JournalEntry, 'lines'> {
  lines: Array<JournalLine & {
    account?: {
      id: string;
      code: string;
      name: string;
      account_type: string;
    };
  }>;
}

interface AccountingDashboard {
  balances: {
    assets: number;
    liabilities: number;
    equity: number;
    revenue: number;
    expenses: number;
  };
  netIncome: number;
  recentEntriesCount: number;
  draftEntriesCount: number;
  accountsCount: number;
}

interface FiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  periods?: FiscalPeriod[];
}

interface FiscalPeriod {
  id: string;
  name: string;
  period_number: number;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

interface CreateAccountParams {
  code: string;
  name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_subtype: string;
  description?: string;
  parent_id?: string;
  opening_balance?: number;
  currency?: string;
  tax_code?: string;
  is_bank?: boolean;
}

interface CreateJournalEntryParams {
  entry_date: string;
  description: string;
  reference?: string;
  reference_type?: 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment' | 'opening' | 'closing' | 'manual';
  reference_id?: string;
  is_adjusting?: boolean;
  lines: Array<{
    account_id: string;
    debit?: number;
    credit?: number;
    description?: string;
    tax_code?: string;
    tax_amount?: number;
    project_id?: string;
  }>;
  attachments?: string[];
  tags?: string[];
  notes?: string;
}

interface ReportParams {
  report_type: 'trial_balance' | 'income_statement' | 'balance_sheet' | 'cash_flow' | 'general_ledger';
  start_date?: string;
  end_date?: string;
  as_of_date?: string;
  account_ids?: string[];
  compare_last_period?: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAccounting() {
  // State
  const [accounts, setAccounts] = useState<AccountWithMeta[]>([]);
  const [entries, setEntries] = useState<JournalEntryWithLines[]>([]);
  const [dashboard, setDashboard] = useState<AccountingDashboard | null>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [currentReport, setCurrentReport] = useState<TrialBalance | IncomeStatement | BalanceSheet | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================================================================
  // CHART OF ACCOUNTS
  // =====================================================================

  const fetchAccounts = useCallback(async (type?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ resource: 'accounts' });
      if (type) params.set('type', type);

      const response = await fetch(`/api/accounting?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }

      setAccounts(data.accounts);
      setIsInitialized(data.accounts.length > 0);
      return data.accounts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeChartOfAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=initialize-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize chart of accounts');
      }

      setAccounts(data.accounts);
      setIsInitialized(true);
      toast.success('Chart of accounts initialized', {
        description: `Created ${data.accounts.length} accounts`,
      });

      return data.accounts;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize';
      setError(message);
      toast.error('Initialization failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (params: CreateAccountParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setAccounts(prev => [...prev, data.account].sort((a, b) => a.code.localeCompare(b.code)));
      toast.success('Account created', { description: `${params.code} - ${params.name}` });

      return data.account;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
      toast.error('Create failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (id: string, updates: Partial<CreateAccountParams>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?resource=account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account');
      }

      setAccounts(prev =>
        prev.map(acc => acc.id === id ? data.account : acc)
          .sort((a, b) => a.code.localeCompare(b.code))
      );
      toast.success('Account updated');

      return data.account;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update account';
      setError(message);
      toast.error('Update failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounting?resource=account&id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      if (data.message?.includes('deactivated')) {
        setAccounts(prev => prev.map(acc =>
          acc.id === id ? { ...acc, is_active: false } : acc
        ));
        toast.info('Account deactivated', { description: 'Account has transactions' });
      } else {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
        toast.success('Account deleted');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      setError(message);
      toast.error('Delete failed', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================================
  // JOURNAL ENTRIES
  // =====================================================================

  const fetchEntries = useCallback(async (params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({ resource: 'entries' });
      if (params?.status) searchParams.set('status', params.status);
      if (params?.start_date) searchParams.set('start_date', params.start_date);
      if (params?.end_date) searchParams.set('end_date', params.end_date);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());

      const response = await fetch(`/api/accounting?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch entries');
      }

      setEntries(data.entries);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entries';
      setError(message);
      return { entries: [], total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEntry = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounting?resource=entry&id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch entry');
      }

      return data.entry;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entry';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createJournalEntry = useCallback(async (params: CreateJournalEntryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=create-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create entry');
      }

      setEntries(prev => [data.entry, ...prev]);
      toast.success('Journal entry created', { description: data.entry.entry_number });

      return data.entry;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create entry';
      setError(message);
      toast.error('Create failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const postEntry = useCallback(async (entryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=post-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post entry');
      }

      setEntries(prev =>
        prev.map(e => e.id === entryId ? { ...e, status: 'posted' as const } : e)
      );
      toast.success('Entry posted', { description: 'Account balances updated' });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to post entry';
      setError(message);
      toast.error('Post failed', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const voidEntry = useCallback(async (entryId: string, reason?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=void-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to void entry');
      }

      setEntries(prev =>
        prev.map(e => e.id === entryId ? { ...e, status: 'voided' as const } : e)
      );
      toast.success('Entry voided');

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to void entry';
      setError(message);
      toast.error('Void failed', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (entryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/accounting?resource=entry&id=${entryId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete entry');
      }

      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success('Entry deleted');

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
      toast.error('Delete failed', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================================
  // REPORTS
  // =====================================================================

  const generateReport = useCallback(async (params: ReportParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setCurrentReport(data.report);
      toast.success('Report generated');

      return data.report;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      toast.error('Report failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================================
  // DASHBOARD
  // =====================================================================

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?resource=dashboard');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard');
      }

      setDashboard(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================================
  // FISCAL YEARS
  // =====================================================================

  const fetchFiscalYears = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?resource=fiscal-years');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch fiscal years');
      }

      setFiscalYears(data.fiscalYears);
      return data.fiscalYears;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch fiscal years';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFiscalYear = useCallback(async (params: {
    name: string;
    start_date: string;
    end_date: string;
    retained_earnings_account_id?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/accounting?action=create-fiscal-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create fiscal year');
      }

      setFiscalYears(prev => [data.fiscalYear, ...prev]);
      toast.success('Fiscal year created', { description: params.name });

      return data.fiscalYear;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create fiscal year';
      setError(message);
      toast.error('Create failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =====================================================================
  // AI CATEGORIZATION
  // =====================================================================

  const categorizeTransaction = useCallback(async (params: {
    description: string;
    amount: number;
    vendor?: string;
    date?: string;
  }): Promise<AICategorizationResult | null> => {
    try {
      const response = await fetch('/api/accounting?action=categorize-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to categorize');
      }

      return data.categorization;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to categorize';
      toast.error('AI categorization failed', { description: message });
      return null;
    }
  }, []);

  // =====================================================================
  // HELPERS
  // =====================================================================

  const getAccountsByType = useCallback((type: string) => {
    return accounts.filter(acc => acc.account_type === type && acc.is_active);
  }, [accounts]);

  const getAccountBalance = useCallback((accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.current_balance || 0;
  }, [accounts]);

  const clearError = useCallback(() => setError(null), []);

  // Initial fetch
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // =====================================================================
  // RETURN
  // =====================================================================

  return {
    // State
    accounts,
    entries,
    dashboard,
    fiscalYears,
    currentReport,
    isLoading,
    isInitialized,
    error,

    // Accounts
    fetchAccounts,
    initializeChartOfAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountsByType,
    getAccountBalance,

    // Entries
    fetchEntries,
    fetchEntry,
    createJournalEntry,
    postEntry,
    voidEntry,
    deleteEntry,

    // Reports
    generateReport,

    // Dashboard
    fetchDashboard,

    // Fiscal Years
    fetchFiscalYears,
    createFiscalYear,

    // AI
    categorizeTransaction,

    // Utilities
    clearError,
  };
}

export type UseAccountingReturn = ReturnType<typeof useAccounting>;
