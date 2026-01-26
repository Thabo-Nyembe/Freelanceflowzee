/**
 * Disputes Hooks - FreeFlow A+++ Implementation
 * Comprehensive hooks for dispute management
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface Dispute {
  id: string;
  order_id: string;
  initiator_id: string;
  respondent_id: string;
  mediator_id?: string;
  dispute_type: DisputeType;
  title: string;
  description: string;
  disputed_amount: number;
  currency: string;
  status: DisputeStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  response_deadline?: string;
  evidence_deadline?: string;
  resolution_deadline?: string;
  buyer_is_initiator: boolean;
  auto_escalate_enabled: boolean;
  requires_mediation: boolean;
  resolution_type?: ResolutionType;
  resolution_amount?: number;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  appeal_count: number;
  appeal_limit: number;
  last_appeal_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  order?: ServiceOrder;
  initiator?: User;
  respondent?: User;
  mediator?: User;
  messages?: DisputeMessage[];
  evidence?: DisputeEvidence[];
  proposals?: DisputeProposal[];
  activity?: DisputeActivity[];
}

export type DisputeType =
  | 'not_as_described'
  | 'quality_issue'
  | 'late_delivery'
  | 'no_delivery'
  | 'scope_creep'
  | 'communication'
  | 'refund_request'
  | 'payment_issue'
  | 'intellectual_property'
  | 'harassment'
  | 'other';

export type DisputeStatus =
  | 'opened'
  | 'response_pending'
  | 'in_discussion'
  | 'evidence_review'
  | 'mediation'
  | 'resolution_proposed'
  | 'resolved'
  | 'closed'
  | 'appealed'
  | 'escalated';

export type ResolutionType =
  | 'full_refund'
  | 'partial_refund'
  | 'redelivery'
  | 'order_cancelled'
  | 'order_completed'
  | 'mutual_cancellation'
  | 'no_action'
  | 'account_warning'
  | 'account_suspension';

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'system' | 'proposal' | 'evidence' | 'decision';
  system_event?: string;
  attachments: Attachment[];
  is_private_to_mediator: boolean;
  read_by_initiator: boolean;
  read_by_respondent: boolean;
  read_by_mediator: boolean;
  created_at: string;
  sender?: User;
}

export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  submitted_by: string;
  title: string;
  description?: string;
  evidence_type: EvidenceType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  external_url?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  relevance_score?: number;
  mediator_notes?: string;
  created_at: string;
  submitter?: User;
}

export type EvidenceType =
  | 'screenshot'
  | 'file'
  | 'link'
  | 'chat_log'
  | 'contract'
  | 'invoice'
  | 'delivery_proof'
  | 'communication'
  | 'other';

export interface DisputeProposal {
  id: string;
  dispute_id: string;
  proposed_by: string;
  resolution_type: ResolutionType;
  proposed_amount?: number;
  description: string;
  terms?: string;
  initiator_accepted?: boolean;
  respondent_accepted?: boolean;
  mediator_recommended?: boolean;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
  counter_proposal_id?: string;
  created_at: string;
  updated_at: string;
  proposer?: User;
}

export interface DisputeActivity {
  id: string;
  dispute_id: string;
  actor_id?: string;
  activity_type: string;
  description: string;
  previous_value?: string;
  new_value?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

interface ServiceOrder {
  id: string;
  package_name: string;
  total: number;
  status: string;
  listing?: {
    id: string;
    title: string;
    images: string[];
  };
}

interface Attachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

// Main useDisputes hook for listing disputes
export function useDisputes(filters?: {
  status?: DisputeStatus | DisputeStatus[];
  role?: 'initiator' | 'respondent' | 'all';
  orderId?: string;
}) {
  const queryClient = useQueryClient();

  const queryKey = ['disputes', filters];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.set(
          'status',
          Array.isArray(filters.status) ? filters.status.join(',') : filters.status
        );
      }
      if (filters?.role) {
        params.set('role', filters.role);
      }
      if (filters?.orderId) {
        params.set('order_id', filters.orderId);
      }

      const response = await fetch(`/api/disputes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch disputes');
      }
      const data = await response.json();
      return data.disputes as Dispute[];
    },
  });

  // Create dispute
  const createDispute = useMutation({
    mutationFn: async (data: {
      order_id: string;
      dispute_type: DisputeType;
      title: string;
      description: string;
      disputed_amount: number;
      evidence_urls?: string[];
    }) => {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dispute');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });

  // Statistics
  const stats = query.data?.reduce(
    (acc, dispute) => {
      acc.total++;
      acc.byStatus[dispute.status] = (acc.byStatus[dispute.status] || 0) + 1;
      if (['opened', 'response_pending', 'in_discussion', 'evidence_review', 'mediation', 'resolution_proposed'].includes(dispute.status)) {
        acc.active++;
      }
      if (dispute.priority === 'urgent' || dispute.priority === 'high') {
        acc.urgent++;
      }
      return acc;
    },
    {
      total: 0,
      active: 0,
      urgent: 0,
      byStatus: {} as Record<string, number>,
    }
  );

  return {
    disputes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    stats,
    createDispute: createDispute.mutateAsync,
    isCreating: createDispute.isPending,
    refetch: query.refetch,
  };
}

// useDispute hook for single dispute with real-time updates
export function useDispute(disputeId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const queryKey = ['dispute', disputeId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/disputes/${disputeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dispute');
      }
      return response.json() as Promise<{
        dispute: Dispute;
        user_role: 'initiator' | 'respondent' | 'mediator' | 'observer';
        can_resolve: boolean;
      }>;
    },
    enabled: !!disputeId,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!disputeId) return;

    channelRef.current = supabase
      .channel(`dispute:${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disputes',
          filter: `id=eq.${disputeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispute_messages',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispute_proposals',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [disputeId, queryClient, supabase]);

  // Update dispute
  const updateDispute = useMutation({
    mutationFn: async (data: {
      action?: 'respond' | 'escalate' | 'close' | 'appeal' | 'extend_deadline' | 'assign_mediator';
      response?: string;
      status?: DisputeStatus;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      deadline_extension_days?: number;
      appeal_reason?: string;
    }) => {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update dispute');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });

  return {
    dispute: query.data?.dispute,
    userRole: query.data?.user_role,
    canResolve: query.data?.can_resolve,
    isLoading: query.isLoading,
    error: query.error,
    updateDispute: updateDispute.mutateAsync,
    isUpdating: updateDispute.isPending,
    refetch: query.refetch,
  };
}

// useDisputeMessages hook for messaging
export function useDisputeMessages(disputeId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const queryKey = ['dispute-messages', disputeId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/disputes/${disputeId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json() as Promise<{
        messages: DisputeMessage[];
        pagination: { total: number; limit: number; offset: number };
      }>;
    },
    enabled: !!disputeId,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!disputeId) return;

    channelRef.current = supabase
      .channel(`dispute-messages:${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispute_messages',
          filter: `dispute_id=eq.${disputeId}`,
        },
        (payload) => {
          // Optimistically add the new message
          queryClient.setQueryData(queryKey, (old: { messages: DisputeMessage[] } | undefined) => {
            if (!old) return old;
            const newMessage = payload.new as DisputeMessage;
            // Avoid duplicates
            if (old.messages.some(m => m.id === newMessage.id)) {
              return old;
            }
            return {
              ...old,
              messages: [...old.messages, newMessage],
            };
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [disputeId, queryClient, supabase, queryKey]);

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (data: {
      message: string;
      message_type?: 'text' | 'proposal' | 'evidence';
      attachments?: Attachment[];
      is_private_to_mediator?: boolean;
    }) => {
      const response = await fetch(`/api/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Optimistically add the message
      queryClient.setQueryData(queryKey, (old: { messages: DisputeMessage[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, data.message],
        };
      });
    },
  });

  return {
    messages: query.data?.messages || [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
    refetch: query.refetch,
  };
}

// useDisputeEvidence hook
export function useDisputeEvidence(disputeId: string) {
  const queryClient = useQueryClient();

  const queryKey = ['dispute-evidence', disputeId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/disputes/${disputeId}/evidence`);
      if (!response.ok) {
        throw new Error('Failed to fetch evidence');
      }
      return response.json() as Promise<{
        evidence: DisputeEvidence[];
        by_party: {
          initiator: DisputeEvidence[];
          respondent: DisputeEvidence[];
        };
      }>;
    },
    enabled: !!disputeId,
  });

  // Submit evidence
  const submitEvidence = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      evidence_type: EvidenceType;
      file_url?: string;
      file_name?: string;
      file_size?: number;
      file_type?: string;
      external_url?: string;
    }) => {
      const response = await fetch(`/api/disputes/${disputeId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit evidence');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
    },
  });

  return {
    evidence: query.data?.evidence || [],
    byParty: query.data?.by_party,
    isLoading: query.isLoading,
    error: query.error,
    submitEvidence: submitEvidence.mutateAsync,
    isSubmitting: submitEvidence.isPending,
    refetch: query.refetch,
  };
}

// useDisputeProposals hook
export function useDisputeProposals(disputeId: string) {
  const queryClient = useQueryClient();

  const queryKey = ['dispute-proposals', disputeId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/disputes/${disputeId}/proposals`);
      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }
      return response.json() as Promise<{
        proposals: DisputeProposal[];
        active_proposal: DisputeProposal | null;
      }>;
    },
    enabled: !!disputeId,
  });

  // Create proposal
  const createProposal = useMutation({
    mutationFn: async (data: {
      resolution_type: ResolutionType;
      proposed_amount?: number;
      description: string;
      terms?: string;
      expires_in_days?: number;
    }) => {
      const response = await fetch(`/api/disputes/${disputeId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create proposal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
    },
  });

  // Respond to proposal
  const respondToProposal = useMutation({
    mutationFn: async (data: {
      proposal_id: string;
      accept: boolean;
      counter?: boolean;
      counter_proposal?: {
        resolution_type: ResolutionType;
        proposed_amount?: number;
        description: string;
        terms?: string;
        expires_in_days?: number;
      };
    }) => {
      const response = await fetch(
        `/api/disputes/${disputeId}/proposals?proposal_id=${data.proposal_id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accept: data.accept,
            counter: data.counter,
            counter_proposal: data.counter_proposal,
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to respond to proposal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['dispute', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });

  return {
    proposals: query.data?.proposals || [],
    activeProposal: query.data?.active_proposal,
    isLoading: query.isLoading,
    error: query.error,
    createProposal: createProposal.mutateAsync,
    isCreating: createProposal.isPending,
    respondToProposal: respondToProposal.mutateAsync,
    isResponding: respondToProposal.isPending,
    refetch: query.refetch,
  };
}

// Dispute templates hook
export function useDisputeTemplates() {
  const supabase = createClient();

  const query = useQuery({
    queryKey: ['dispute-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispute_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });

  return {
    templates: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

// Helper: Get status color
export function getDisputeStatusColor(status: DisputeStatus): string {
  const colors: Record<DisputeStatus, string> = {
    opened: 'bg-blue-100 text-blue-800',
    response_pending: 'bg-yellow-100 text-yellow-800',
    in_discussion: 'bg-purple-100 text-purple-800',
    evidence_review: 'bg-indigo-100 text-indigo-800',
    mediation: 'bg-orange-100 text-orange-800',
    resolution_proposed: 'bg-cyan-100 text-cyan-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    appealed: 'bg-red-100 text-red-800',
    escalated: 'bg-pink-100 text-pink-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Helper: Get status label
export function getDisputeStatusLabel(status: DisputeStatus): string {
  const labels: Record<DisputeStatus, string> = {
    opened: 'Opened',
    response_pending: 'Awaiting Response',
    in_discussion: 'In Discussion',
    evidence_review: 'Evidence Review',
    mediation: 'In Mediation',
    resolution_proposed: 'Resolution Proposed',
    resolved: 'Resolved',
    closed: 'Closed',
    appealed: 'Appealed',
    escalated: 'Escalated',
  };
  return labels[status] || status;
}

// Helper: Get dispute type label
export function getDisputeTypeLabel(type: DisputeType): string {
  const labels: Record<DisputeType, string> = {
    not_as_described: 'Not as Described',
    quality_issue: 'Quality Issue',
    late_delivery: 'Late Delivery',
    no_delivery: 'No Delivery',
    scope_creep: 'Scope Disagreement',
    communication: 'Communication Issues',
    refund_request: 'Refund Request',
    payment_issue: 'Payment Issue',
    intellectual_property: 'IP Issue',
    harassment: 'Harassment',
    other: 'Other',
  };
  return labels[type] || type;
}

// Helper: Get resolution type label
export function getResolutionTypeLabel(type: ResolutionType): string {
  const labels: Record<ResolutionType, string> = {
    full_refund: 'Full Refund',
    partial_refund: 'Partial Refund',
    redelivery: 'Redelivery',
    order_cancelled: 'Order Cancelled',
    order_completed: 'Order Completed',
    mutual_cancellation: 'Mutual Cancellation',
    no_action: 'No Action Required',
    account_warning: 'Account Warning',
    account_suspension: 'Account Suspension',
  };
  return labels[type] || type;
}
