/**
 * React Hook: useRevenueIntelligence
 *
 * Easy integration of AI revenue intelligence features into any component
 */

'use client'

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'
import type {
  RevenueData,
  RevenueIntelligenceReport,
  RevenueForecast
} from '@/lib/ai/revenue-intelligence-engine';

interface UseRevenueIntelligenceReturn {
  // State
  report: RevenueIntelligenceReport | null;
  forecast: RevenueForecast | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  generateReport: (revenueData: RevenueData, options?: any) => Promise<void>;
  getForecast: (timeframe: '30_days' | '60_days' | '90_days' | '6_months' | '1_year') => Promise<void>;
  reset: () => void;
}

export function useRevenueIntelligence(): UseRevenueIntelligenceReturn {
  const [report, setReport] = useState<RevenueIntelligenceReport | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient()

  // Realtime subscription for revenue data updates
  useEffect(() => {
    const channel = supabase
      .channel('revenue-intelligence-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          // Invalidate report when transactions change
          if (report) {
            setReport(prev => prev ? { ...prev, needsRefresh: true } as any : null)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => {
          // Invalidate forecast when invoices change
          if (forecast) {
            setForecast(prev => prev ? { ...prev, needsRefresh: true } as any : null)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'revenue_reports' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newReport = payload.new as any
            if (newReport.report_data) {
              setReport(newReport.report_data)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, report, forecast])

  /**
   * Generate comprehensive revenue intelligence report
   */
  const generateReport = useCallback(async (
    revenueData: RevenueData,
    options?: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/revenue-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revenueData, options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error generating revenue intelligence report:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get revenue forecast
   */
  const getForecast = useCallback(async (
    timeframe: '30_days' | '60_days' | '90_days' | '6_months' | '1_year'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/revenue-intelligence?timeframe=${timeframe}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get forecast');
      }

      const data = await response.json();
      setForecast(data.forecast);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error getting forecast:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setReport(null);
    setForecast(null);
    setError(null);
  }, []);

  return {
    report,
    forecast,
    isLoading,
    error,
    generateReport,
    getForecast,
    reset,
  };
}
