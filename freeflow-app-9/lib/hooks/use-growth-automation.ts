/**
 * React Hook: useGrowthAutomation
 *
 * Easy integration of AI growth automation features into any component
 */

'use client'

import { useState, useCallback, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type {
  Lead,
  LeadScore,
  OutreachMessage,
  ClientAcquisitionPlaybook,
  ReferralOptimization,
  MarketOpportunity,
  GrowthActionPlan,
} from '@/lib/ai/growth-automation-engine';

interface UseGrowthAutomationReturn {
  // State
  leadScores: LeadScore[];
  outreachMessage: OutreachMessage | null;
  playbook: ClientAcquisitionPlaybook | null;
  referralOptimization: ReferralOptimization | null;
  opportunities: MarketOpportunity[];
  actionPlan: GrowthActionPlan | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  scoreLeads: (leads: Lead[]) => Promise<void>;
  generateOutreach: (lead: Lead, type: string, userInfo: any) => Promise<void>;
  getAcquisitionPlaybook: (industry: string, expertise: string[], currentClientCount: number, targetMonthlyRevenue: number) => Promise<void>;
  optimizeReferrals: (clientData: any[]) => Promise<void>;
  scanOpportunities: (currentExpertise: string[], industry: string) => Promise<void>;
  getActionPlan: (userProfile: any) => Promise<void>;
  reset: () => void;
}

export function useGrowthAutomation(): UseGrowthAutomationReturn {
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [outreachMessage, setOutreachMessage] = useState<OutreachMessage | null>(null);
  const [playbook, setPlaybook] = useState<ClientAcquisitionPlaybook | null>(null);
  const [referralOptimization, setReferralOptimization] = useState<ReferralOptimization | null>(null);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [actionPlan, setActionPlan] = useState<GrowthActionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient()

  // Realtime subscription for growth automation updates
  useEffect(() => {
    const channel = supabase
      .channel('growth-automation-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          // Refresh lead scores when leads table changes
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Trigger a refresh of lead scores
            setLeadScores(prev => {
              const newLead = payload.new as any
              const exists = prev.find(l => l.leadId === newLead.id)
              if (exists) {
                return prev.map(l => l.leadId === newLead.id ? { ...l, ...newLead } : l)
              }
              return prev
            })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_opportunities' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOpportunities(prev => [payload.new as MarketOpportunity, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOpportunities(prev => prev.map(o =>
              (o as any).id === (payload.new as any).id ? payload.new as MarketOpportunity : o
            ))
          } else if (payload.eventType === 'DELETE') {
            setOpportunities(prev => prev.filter(o => (o as any).id !== (payload.old as any).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  /**
   * Helper to make API calls
   */
  const callAPI = async (action: string, data: any) => {
    const response = await fetch('/api/ai/growth-automation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  };

  /**
   * Score leads
   */
  const scoreLeads = useCallback(async (leads: Lead[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callAPI('score_leads', { leads });
      setLeadScores(result.leadScores);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error scoring leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate outreach message
   */
  const generateOutreach = useCallback(async (
    lead: Lead,
    type: string,
    userInfo: any
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callAPI('generate_outreach', { lead, type, userInfo });
      setOutreachMessage(result.outreach);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error generating outreach:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get acquisition playbook
   */
  const getAcquisitionPlaybook = useCallback(async (
    industry: string,
    expertise: string[],
    currentClientCount: number,
    targetMonthlyRevenue: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callAPI('acquisition_playbook', {
        industry,
        expertise,
        currentClientCount,
        targetMonthlyRevenue,
      });
      setPlaybook(result.playbook);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error getting playbook:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Optimize referral system
   */
  const optimizeReferrals = useCallback(async (clientData: any[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callAPI('referral_optimization', { clientData });
      setReferralOptimization(result.optimization);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error optimizing referrals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Scan market opportunities
   */
  const scanOpportunities = useCallback(async (
    currentExpertise: string[],
    industry: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callAPI('market_opportunities', { currentExpertise, industry });
      setOpportunities(result.opportunities);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error scanning opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get action plan
   */
  const getActionPlan = useCallback(async (userProfile: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await callAPI('action_plan', { userProfile });
      setActionPlan(result.actionPlan);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error getting action plan:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLeadScores([]);
    setOutreachMessage(null);
    setPlaybook(null);
    setReferralOptimization(null);
    setOpportunities([]);
    setActionPlan(null);
    setError(null);
  }, []);

  return {
    leadScores,
    outreachMessage,
    playbook,
    referralOptimization,
    opportunities,
    actionPlan,
    isLoading,
    error,
    scoreLeads,
    generateOutreach,
    getAcquisitionPlaybook,
    optimizeReferrals,
    scanOpportunities,
    getActionPlan,
    reset,
  };
}
