/**
 * useRecurringInvoices Hook - FreeFlow A+++ Implementation
 * Complete hook for managing recurring invoice templates
 * Features: CRUD operations, optimistic updates, caching, real-time sync
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ============ Types ============

export interface RecurringLineItem {
  id?: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  unit?: string;
  taxable: boolean;
  tax_rate?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value: number;
  sort_order: number;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  template_name: string;
  template_code?: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'custom';
  custom_interval_days?: number;
  start_date: string;
  end_date?: string;
  next_run_date: string;
  last_run_date?: string;
  day_of_week?: number;
  day_of_month?: number;
  month_of_year?: number;
  invoice_prefix: string;
  currency: string;
  tax_rate: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  payment_terms_days: number;
  late_fee_enabled: boolean;
  late_fee_percentage: number;
  late_fee_grace_days: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  auto_send: boolean;
  send_days_before: number;
  cc_emails?: string[];
  bcc_emails?: string[];
  email_subject_template?: string;
  email_body_template?: string;
  notes?: string;
  terms_and_conditions?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  total_invoices_generated: number;
  total_amount_invoiced: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  line_items?: RecurringLineItem[];
  executions?: RecurringExecution[];
}

export interface RecurringExecution {
  id: string;
  template_id: string;
  scheduled_date: string;
  executed_at?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  invoice_id?: string;
  invoice_number?: string;
  total_amount?: number;
  error_message?: string;
}

export interface CreateTemplateInput {
  template_name: string;
  template_code?: string;
  description?: string;
  client_id?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  frequency: RecurringTemplate['frequency'];
  custom_interval_days?: number;
  start_date: string;
  end_date?: string;
  day_of_week?: number;
  day_of_month?: number;
  month_of_year?: number;
  invoice_prefix?: string;
  currency?: string;
  tax_rate?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  payment_terms_days?: number;
  late_fee_enabled?: boolean;
  late_fee_percentage?: number;
  late_fee_grace_days?: number;
  auto_send?: boolean;
  send_days_before?: number;
  cc_emails?: string[];
  bcc_emails?: string[];
  email_subject_template?: string;
  email_body_template?: string;
  notes?: string;
  terms_and_conditions?: string;
  line_items: RecurringLineItem[];
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  status?: RecurringTemplate['status'];
}

interface UseRecurringInvoicesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseRecurringInvoicesReturn {
  templates: RecurringTemplate[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  // Actions
  fetchTemplates: (params?: FetchParams) => Promise<void>;
  getTemplate: (id: string) => Promise<RecurringTemplate | null>;
  createTemplate: (data: CreateTemplateInput) => Promise<RecurringTemplate | null>;
  updateTemplate: (id: string, data: UpdateTemplateInput) => Promise<RecurringTemplate | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  pauseTemplate: (id: string) => Promise<boolean>;
  resumeTemplate: (id: string) => Promise<boolean>;
  bulkAction: (ids: string[], action: 'pause' | 'resume' | 'cancel' | 'delete') => Promise<boolean>;
  refresh: () => Promise<void>;
}

interface FetchParams {
  page?: number;
  pageSize?: number;
  status?: string;
  clientId?: string;
  frequency?: string;
  search?: string;
}

// ============ Hook Implementation ============

export function useRecurringInvoices(
  options: UseRecurringInvoicesOptions = {}
): UseRecurringInvoicesReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });

  // Fetch templates list
  const fetchTemplates = useCallback(async (params: FetchParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', String(params.page));
      if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params.status) searchParams.set('status', params.status);
      if (params.clientId) searchParams.set('clientId', params.clientId);
      if (params.frequency) searchParams.set('frequency', params.frequency);
      if (params.search) searchParams.set('search', params.search);

      const response = await fetch(`/api/recurring-invoices?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch templates');
      }

      setTemplates(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get single template
  const getTemplate = useCallback(async (id: string): Promise<RecurringTemplate | null> => {
    try {
      const response = await fetch(`/api/recurring-invoices/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch template');
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch template';
      toast.error(message);
      return null;
    }
  }, []);

  // Create template
  const createTemplate = useCallback(async (data: CreateTemplateInput): Promise<RecurringTemplate | null> => {
    try {
      const response = await fetch('/api/recurring-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create template');
      }

      toast.success('Recurring invoice template created');

      // Optimistically add to list
      setTemplates(prev => [result.data, ...prev]);

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create template';
      toast.error(message);
      return null;
    }
  }, []);

  // Update template
  const updateTemplate = useCallback(async (id: string, data: UpdateTemplateInput): Promise<RecurringTemplate | null> => {
    try {
      const response = await fetch(`/api/recurring-invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update template');
      }

      toast.success('Template updated');

      // Optimistically update in list
      setTemplates(prev =>
        prev.map(t => (t.id === id ? { ...t, ...result.data } : t))
      );

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update template';
      toast.error(message);
      return null;
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/recurring-invoices/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete template');
      }

      toast.success('Template deleted');

      // Optimistically remove from list
      setTemplates(prev => prev.filter(t => t.id !== id));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete template';
      toast.error(message);
      return false;
    }
  }, []);

  // Pause template
  const pauseTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/recurring-invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'pause' }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to pause template');
      }

      toast.success('Template paused');

      // Optimistically update in list
      setTemplates(prev =>
        prev.map(t => (t.id === id ? { ...t, status: 'paused' as const } : t))
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause template';
      toast.error(message);
      return false;
    }
  }, []);

  // Resume template
  const resumeTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/recurring-invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], action: 'resume' }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resume template');
      }

      toast.success('Template resumed');

      // Optimistically update in list
      setTemplates(prev =>
        prev.map(t => (t.id === id ? { ...t, status: 'active' as const } : t))
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume template';
      toast.error(message);
      return false;
    }
  }, []);

  // Bulk action
  const bulkAction = useCallback(async (
    ids: string[],
    action: 'pause' | 'resume' | 'cancel' | 'delete'
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/recurring-invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} templates`);
      }

      toast.success(`${result.updated || ids.length} templates ${action}d`);

      // Refresh the list
      await fetchTemplates();

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${action} templates`;
      toast.error(message);
      return false;
    }
  }, [fetchTemplates]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchTemplates({ page: pagination.page, pageSize: pagination.pageSize });
  }, [fetchTemplates, pagination.page, pagination.pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    templates,
    isLoading,
    error,
    pagination,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    pauseTemplate,
    resumeTemplate,
    bulkAction,
    refresh,
  };
}

// ============ Helper Hook for Single Template ============

export function useRecurringTemplate(id: string | null) {
  const [template, setTemplate] = useState<RecurringTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setTemplate(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await globalThis.fetch(`/api/recurring-invoices/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch template');
      }

      setTemplate(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch template';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { template, isLoading, error, refetch: fetch };
}

// ============ Frequency Display Helpers ============

export const FREQUENCY_LABELS: Record<RecurringTemplate['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  biannually: 'Every 6 Months',
  annually: 'Annually',
  custom: 'Custom',
};

export const STATUS_COLORS: Record<RecurringTemplate['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function formatFrequency(template: RecurringTemplate): string {
  if (template.frequency === 'custom' && template.custom_interval_days) {
    return `Every ${template.custom_interval_days} days`;
  }
  return FREQUENCY_LABELS[template.frequency] || template.frequency;
}

export function getNextRunDisplay(template: RecurringTemplate): string {
  if (template.status !== 'active') {
    return template.status.charAt(0).toUpperCase() + template.status.slice(1);
  }

  const nextRun = new Date(template.next_run_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((nextRun.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;

  return nextRun.toLocaleDateString();
}
