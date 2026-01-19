/**
 * useBankTransactions Hook - FreeFlow A+++ Implementation
 * Complete hook for managing bank transactions with filtering, categorization, and reconciliation
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

// ============ Types ============

export interface TransactionCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  parent?: TransactionCategory;
}

export interface BankTransaction {
  id: string;
  account_id: string;
  plaid_transaction_id: string;
  name: string;
  merchant_name: string | null;
  amount: number;
  currency: string;
  date: string;
  datetime: string | null;
  authorized_date: string | null;
  pending: boolean;
  status: 'pending' | 'posted' | 'cancelled';
  category_id: string | null;
  categorization_source: 'plaid' | 'rule' | 'ai' | 'user' | null;
  categorization_confidence: number | null;
  user_category_override: boolean;
  reconciliation_status: 'unreconciled' | 'matched' | 'confirmed' | 'excluded';
  matched_invoice_id: string | null;
  matched_expense_id: string | null;
  reconciled_at: string | null;
  is_excluded: boolean;
  notes: string | null;
  tags: string[] | null;
  location_city: string | null;
  location_region: string | null;
  payment_channel: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
    mask: string | null;
    type: string;
    connection?: {
      id: string;
      institution_name: string;
    };
  };
  category?: TransactionCategory;
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  accountId?: string;
  connectionId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  status?: 'pending' | 'posted' | 'cancelled';
  search?: string;
  sortBy?: 'date' | 'amount' | 'name';
  sortOrder?: 'asc' | 'desc';
  reconciliationStatus?: 'unreconciled' | 'matched' | 'confirmed' | 'excluded';
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UseBankTransactionsOptions {
  filters?: TransactionFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseBankTransactionsReturn {
  transactions: BankTransaction[];
  summary: TransactionSummary;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  updateTransactions: (ids: string[], updates: TransactionUpdate) => Promise<boolean>;
  categorizeTransactions: (ids: string[]) => Promise<boolean>;
  reconcileTransaction: (id: string, options: ReconcileOptions) => Promise<boolean>;
  refresh: () => Promise<void>;
  // Filters
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
}

interface TransactionUpdate {
  categoryId?: string;
  notes?: string;
  tags?: string[];
  reconciliationStatus?: BankTransaction['reconciliation_status'];
  matchedInvoiceId?: string | null;
  matchedExpenseId?: string | null;
  isExcluded?: boolean;
  createRule?: boolean;
}

interface ReconcileOptions {
  status: BankTransaction['reconciliation_status'];
  matchedInvoiceId?: string;
  matchedExpenseId?: string;
}

// ============ Hook Implementation ============

export function useBankTransactions(
  options: UseBankTransactionsOptions = {}
): UseBankTransactionsReturn {
  const { autoRefresh = false, refreshInterval = 60000 } = options;

  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    transactionCount: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TransactionFilters>(options.filters || {});

  // Fetch transactions
  const fetchTransactions = useCallback(async (newFilters?: TransactionFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryFilters = newFilters || filters;
      const params = new URLSearchParams();

      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      const response = await fetch(`/api/plaid/transactions?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }

      setTransactions(result.data || []);
      setPagination(result.pagination || {
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 0,
      });
      setSummary(result.summary || {
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0,
        transactionCount: 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Update transactions
  const updateTransactions = useCallback(async (
    ids: string[],
    updates: TransactionUpdate
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/plaid/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionIds: ids,
          ...updates,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update transactions');
      }

      toast.success(`Updated ${result.data.updated} transaction(s)`);

      // Optimistically update local state
      if (updates.categoryId) {
        setTransactions(prev =>
          prev.map(tx =>
            ids.includes(tx.id)
              ? { ...tx, category_id: updates.categoryId!, user_category_override: true }
              : tx
          )
        );
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transactions';
      toast.error(message);
      return false;
    }
  }, []);

  // Categorize transactions with AI
  const categorizeTransactions = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/plaid/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'categorize',
          transactionIds: ids,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Categorization failed');
      }

      toast.success(`Categorized ${result.data.summary.categorized} transaction(s)`);

      // Refresh to show new categories
      await fetchTransactions();

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Categorization failed';
      toast.error(message);
      return false;
    }
  }, [fetchTransactions]);

  // Reconcile transaction
  const reconcileTransaction = useCallback(async (
    id: string,
    options: ReconcileOptions
  ): Promise<boolean> => {
    return updateTransactions([id], {
      reconciliationStatus: options.status,
      matchedInvoiceId: options.matchedInvoiceId,
      matchedExpenseId: options.matchedExpenseId,
    });
  }, [updateTransactions]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  // Set filters
  const setFilters = useCallback((newFilters: TransactionFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // Initial fetch and filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    transactions,
    summary,
    pagination,
    isLoading,
    error,
    fetchTransactions,
    updateTransactions,
    categorizeTransactions,
    reconcileTransaction,
    refresh,
    setFilters,
    clearFilters,
  };
}

// ============ Categories Hook ============

interface UseCategoriesReturn {
  categories: TransactionCategory[];
  categoryTree: CategoryTreeNode[];
  isLoading: boolean;
  error: string | null;
  getCategoryById: (id: string) => TransactionCategory | undefined;
  refresh: () => Promise<void>;
}

interface CategoryTreeNode extends TransactionCategory {
  children: CategoryTreeNode[];
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/plaid/categorize?type=categories');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch categories');
      }

      setCategories(result.data.categories || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Build category tree
  const categoryTree = useMemo(() => {
    const rootCategories = categories.filter(c => !c.parent_id);
    return rootCategories.map(parent => ({
      ...parent,
      children: categories.filter(c => c.parent_id === parent.id),
    }));
  }, [categories]);

  // Get category by ID
  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  return {
    categories,
    categoryTree,
    isLoading,
    error,
    getCategoryById,
    refresh: fetchCategories,
  };
}

// ============ Formatting Helpers ============

export function formatTransactionAmount(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    signDisplay: 'auto',
  }).format(amount);
}

export function formatTransactionDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTransactionStatusColor(status: BankTransaction['status']): string {
  const colors: Record<BankTransaction['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    posted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || colors.posted;
}

export function getReconciliationStatusColor(status: BankTransaction['reconciliation_status']): string {
  const colors: Record<BankTransaction['reconciliation_status'], string> = {
    unreconciled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    matched: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    excluded: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status] || colors.unreconciled;
}

export function getCategoryColor(category: TransactionCategory | null): string {
  if (!category?.color) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
  return category.color;
}
