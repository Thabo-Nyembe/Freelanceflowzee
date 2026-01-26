/**
 * useGoals Hook - FreeFlow A+++ Implementation
 * Complete hook for managing goals, OKRs, and progress tracking
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ============ Types ============

export type GoalType = 'objective' | 'key_result' | 'milestone' | 'target' | 'habit' | 'learning';
export type GoalStatus = 'draft' | 'active' | 'on_track' | 'at_risk' | 'behind' | 'completed' | 'cancelled' | 'deferred';
export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type MetricType = 'number' | 'percentage' | 'currency' | 'boolean' | 'milestone' | 'count';
export type GoalVisibility = 'private' | 'team' | 'public';

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  metric_type: MetricType;
  target_value: number;
  current_value: number;
  starting_value: number;
  progress_percentage: number;
  unit?: string;
  weight: number;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  goal_type: GoalType;
  status: GoalStatus;
  visibility: GoalVisibility;
  timeframe: GoalTimeframe;
  start_date: string;
  due_date: string;
  completed_date?: string;
  metric_type: MetricType;
  target_value: number;
  current_value: number;
  starting_value: number;
  progress_percentage: number;
  unit?: string;
  weight: number;
  priority: number;
  color?: string;
  icon?: string;
  tags?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
  // Relations
  parent?: { id: string; title: string };
  children?: Array<{ id: string; title: string; status: GoalStatus; progress_percentage: number }>;
  key_results?: KeyResult[];
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed_date?: string;
  is_completed: boolean;
  milestone_value?: number;
  sort_order: number;
}

export interface GoalCheckIn {
  id: string;
  goal_id: string;
  status?: GoalStatus;
  progress_update?: number;
  confidence_level?: number;
  blockers?: string;
  wins?: string;
  notes?: string;
  check_in_date: string;
  created_at: string;
}

export interface GoalStatistics {
  total: number;
  completed: number;
  active: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  averageProgress: number;
  byType?: {
    objectives: number;
    targets: number;
    habits: number;
  };
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  goal_type?: GoalType;
  parent_id?: string;
  timeframe?: GoalTimeframe;
  start_date: string;
  due_date: string;
  metric_type?: MetricType;
  target_value?: number;
  starting_value?: number;
  unit?: string;
  priority?: number;
  color?: string;
  icon?: string;
  tags?: string[];
  category?: string;
  visibility?: GoalVisibility;
  key_results?: Array<{
    title: string;
    description?: string;
    metric_type?: MetricType;
    target_value?: number;
    starting_value?: number;
    unit?: string;
    weight?: number;
  }>;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  status?: GoalStatus;
  due_date?: string;
  target_value?: number;
  current_value?: number;
  priority?: number;
  color?: string;
  icon?: string;
  tags?: string[];
  category?: string;
  visibility?: GoalVisibility;
}

interface GoalFilters {
  goalType?: GoalType;
  status?: GoalStatus;
  timeframe?: GoalTimeframe;
  parentId?: string | null;
  page?: number;
  pageSize?: number;
}

interface UseGoalsOptions {
  filters?: GoalFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGoalsReturn {
  goals: Goal[];
  statistics: GoalStatistics;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  // Actions
  fetchGoals: (filters?: GoalFilters) => Promise<void>;
  getGoal: (id: string) => Promise<Goal | null>;
  createGoal: (data: CreateGoalInput) => Promise<Goal | null>;
  updateGoal: (id: string, data: UpdateGoalInput) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  updateProgress: (id: string, value: number, note?: string) => Promise<boolean>;
  completeGoal: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  setFilters: (filters: GoalFilters) => void;
}

// ============ Hook Implementation ============

export function useGoals(options: UseGoalsOptions = {}): UseGoalsReturn {
  const { autoRefresh = false, refreshInterval = 60000 } = options;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [statistics, setStatistics] = useState<GoalStatistics>({
    total: 0,
    completed: 0,
    active: 0,
    onTrack: 0,
    atRisk: 0,
    behind: 0,
    averageProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [filters, setFiltersState] = useState<GoalFilters>(options.filters || {});

  // Fetch goals
  const fetchGoals = useCallback(async (newFilters?: GoalFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryFilters = newFilters || filters;
      const params = new URLSearchParams();

      if (queryFilters.page) params.set('page', String(queryFilters.page));
      if (queryFilters.pageSize) params.set('pageSize', String(queryFilters.pageSize));
      if (queryFilters.goalType) params.set('goalType', queryFilters.goalType);
      if (queryFilters.status) params.set('status', queryFilters.status);
      if (queryFilters.timeframe) params.set('timeframe', queryFilters.timeframe);
      if (queryFilters.parentId !== undefined) {
        params.set('parentId', queryFilters.parentId === null ? 'null' : queryFilters.parentId);
      }
      params.set('includeKeyResults', 'true');

      const response = await fetch(`/api/goals?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch goals');
      }

      setGoals(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
      if (result.statistics) {
        setStatistics(result.statistics);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goals';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Get single goal
  const getGoal = useCallback(async (id: string): Promise<Goal | null> => {
    try {
      const response = await fetch(`/api/goals/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch goal');
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goal';
      toast.error(message);
      return null;
    }
  }, []);

  // Create goal
  const createGoal = useCallback(async (data: CreateGoalInput): Promise<Goal | null> => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create goal');
      }

      toast.success('Goal created');

      // Optimistically add to list
      setGoals(prev => [result.data, ...prev]);

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create goal';
      toast.error(message);
      return null;
    }
  }, []);

  // Update goal
  const updateGoal = useCallback(async (id: string, data: UpdateGoalInput): Promise<Goal | null> => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update goal');
      }

      toast.success('Goal updated');

      // Optimistically update in list
      setGoals(prev =>
        prev.map(g => (g.id === id ? { ...g, ...result.data } : g))
      );

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update goal';
      toast.error(message);
      return null;
    }
  }, []);

  // Delete goal
  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete goal');
      }

      toast.success('Goal deleted');

      // Optimistically remove from list
      setGoals(prev => prev.filter(g => g.id !== id));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete goal';
      toast.error(message);
      return false;
    }
  }, []);

  // Update progress
  const updateProgress = useCallback(async (id: string, value: number, note?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalIds: [id],
          action: 'update_progress',
          value,
          note,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update progress');
      }

      toast.success('Progress updated');

      // Optimistically update in list
      setGoals(prev =>
        prev.map(g => (g.id === id ? { ...g, current_value: value } : g))
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      toast.error(message);
      return false;
    }
  }, []);

  // Complete goal
  const completeGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalIds: [id],
          action: 'complete',
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete goal');
      }

      toast.success('Goal completed! 🎉');

      // Optimistically update in list
      setGoals(prev =>
        prev.map(g => (g.id === id ? { ...g, status: 'completed' as GoalStatus, progress_percentage: 100 } : g))
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete goal';
      toast.error(message);
      return false;
    }
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchGoals();
  }, [fetchGoals]);

  // Set filters
  const setFilters = useCallback((newFilters: GoalFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    goals,
    statistics,
    isLoading,
    error,
    pagination,
    fetchGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    completeGoal,
    refresh,
    setFilters,
  };
}

// ============ Single Goal Hook ============

export function useGoal(id: string | null) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoal = useCallback(async () => {
    if (!id) {
      setGoal(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/goals/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch goal');
      }

      setGoal(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch goal';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  return { goal, isLoading, error, refetch: fetchGoal };
}

// ============ Key Results Hook ============

export function useKeyResults(objectiveId: string | null) {
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create key result
  const createKeyResult = useCallback(async (data: {
    title: string;
    description?: string;
    metric_type?: MetricType;
    target_value?: number;
    starting_value?: number;
    unit?: string;
    weight?: number;
  }) => {
    if (!objectiveId) return null;

    try {
      const response = await fetch('/api/goals/key-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          objective_id: objectiveId,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create key result');
      }

      toast.success('Key result added');
      setKeyResults(prev => [...prev, result.data]);

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create key result';
      toast.error(message);
      return null;
    }
  }, [objectiveId]);

  // Update key result
  const updateKeyResult = useCallback(async (id: string, updates: {
    title?: string;
    current_value?: number;
    status?: GoalStatus;
  }) => {
    try {
      const response = await fetch('/api/goals/key-results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update key result');
      }

      toast.success('Key result updated');
      setKeyResults(prev =>
        prev.map(kr => (kr.id === id ? { ...kr, ...result.data } : kr))
      );

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update key result';
      toast.error(message);
      return null;
    }
  }, []);

  // Delete key result
  const deleteKeyResult = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/goals/key-results?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete key result');
      }

      toast.success('Key result removed');
      setKeyResults(prev => prev.filter(kr => kr.id !== id));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete key result';
      toast.error(message);
      return false;
    }
  }, []);

  return {
    keyResults,
    setKeyResults,
    isLoading,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
  };
}

// ============ Formatting Helpers ============

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  objective: 'Objective',
  key_result: 'Key Result',
  milestone: 'Milestone',
  target: 'Target',
  habit: 'Habit',
  learning: 'Learning',
};

export const STATUS_COLORS: Record<GoalStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  on_track: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  at_risk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  behind: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  deferred: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
};

export function formatProgress(current: number, target: number, metricType: MetricType, unit?: string): string {
  switch (metricType) {
    case 'percentage':
      return `${Math.round(current)}%`;
    case 'currency':
      return `${unit || '$'}${current.toLocaleString()} / ${unit || '$'}${target.toLocaleString()}`;
    case 'boolean':
      return current >= target ? 'Complete' : 'In Progress';
    default:
      return `${current.toLocaleString()}${unit ? ` ${unit}` : ''} / ${target.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  }
}

export function getDaysRemaining(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return 'bg-emerald-500';
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}
