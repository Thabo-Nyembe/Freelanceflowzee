"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ClientReview, ReviewStage } from '@/components/video/client-review-panel';

export interface CreateReviewData {
  video_id: string;
  title: string;
  description?: string;
  deadline?: string;
  stages: Omit<ReviewStage, 'id'>[];
  reviewer_emails?: string[];
  settings?: {
    allow_comments: boolean;
    require_all_approvals: boolean;
    auto_advance_stages: boolean;
    send_notifications: boolean;
  };
}

export interface ReviewStats {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  average_completion_time: number;
  overdue_reviews: number;
}

export function useClientReviews() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('client_reviews')
        .select(`
          *,
          video:videos(id, title, thumbnail_url, duration),
          project:projects(id, name),
          stages:review_stages(*),
          approvals:review_approvals(
            *,
            user:profiles(id, display_name, avatar_url)
          ),
          collaborators:review_collaborators(
            *,
            user:profiles(id, display_name, avatar_url)
          )
        `)
        .or(`created_by.eq.${user.id},id.in.(${
          // Get reviews where user is a collaborator
          await supabase
            .from('review_collaborators')
            .select('review_id')
            .eq('user_id', user.id)
            .then(({ data }) => data?.map(c => c.review_id).join(',') || 'null')
        })`)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  const createReview = useCallback(async (reviewData: CreateReviewData) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/video/${reviewData.video_id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create review');
      }

      const newReview = await response.json();
      setReviews(prev => [newReview, ...prev]);

      toast({
        title: 'Success',
        description: 'Review workflow created successfully',
      });

      return newReview;
    } catch (err) {
      console.error('Error creating review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create review';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [supabase, toast]);

  const updateReview = useCallback(async (reviewId: string, updates: Partial<ClientReview>) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      const response = await fetch(`/api/video/${review.video_id}/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_id: reviewId, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }

      const updatedReview = await response.json();
      setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));

      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });

      return updatedReview;
    } catch (err) {
      console.error('Error updating review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [reviews, toast]);

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error: deleteError } = await supabase
        .from('client_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('created_by', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setReviews(prev => prev.filter(r => r.id !== reviewId));

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting review:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete review';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [supabase, toast]);

  // Calculate review statistics
  const getStats = useCallback((): ReviewStats => {
    const now = new Date();
    
    const stats = {
      total_reviews: reviews.length,
      pending_reviews: 0,
      approved_reviews: 0,
      rejected_reviews: 0,
      average_completion_time: 0,
      overdue_reviews: 0
    };

    const completionTimes: number[] = [];

    reviews.forEach(review => {
      // Count by status
      switch (review.status) {
        case 'in_review':
        case 'draft':
          stats.pending_reviews++;
          break;
        case 'approved':
          stats.approved_reviews++;
          break;
        case 'rejected':
          stats.rejected_reviews++;
          break;
      }

      // Check if overdue
      if (review.deadline && new Date(review.deadline) < now && 
          !['approved', 'rejected'].includes(review.status)) {
        stats.overdue_reviews++;
      }

      // Calculate completion time
      if (review.completed_at && review.started_at) {
        const startTime = new Date(review.started_at).getTime();
        const endTime = new Date(review.completed_at).getTime();
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);
        completionTimes.push(durationHours);
      }
    });

    // Calculate average completion time
    if (completionTimes.length > 0) {
      stats.average_completion_time = Math.round(
        completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      );
    }

    return stats;
  }, [reviews]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    stats: getStats(),
    createReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews
  };
}

export function useReviewApprovals(reviewId: string, videoId: string) {
  const [loading, setLoading] = useState<any>(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const submitApproval = useCallback(async (
    action: 'approve' | 'reject' | 'changes_requested',
    stageId: string,
    feedback?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/video/${videoId}/reviews/${reviewId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          stage_id: stageId,
          feedback
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit approval');
      }

      const result = await response.json();

      // Show appropriate success message
      const actionLabels = {
        approve: 'approved',
        reject: 'rejected',
        changes_requested: 'requested changes for'
      };

      toast({
        title: 'Success',
        description: `You have ${actionLabels[action]} this review`,
      });

      return result;
    } catch (err) {
      console.error('Error submitting approval:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit approval';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [reviewId, videoId, toast]);

  const getApprovalStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/video/${videoId}/reviews/${reviewId}/approve`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get approval status');
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting approval status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get approval status';
      setError(errorMessage);
      throw err;
    }
  }, [reviewId, videoId]);

  return {
    loading,
    error,
    submitApproval,
    getApprovalStatus
  };
}

export function useReviewTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('review_templates')
        .select('*')
        .or(`is_public.eq.true,created_by.eq.${user.id}`)
        .order('usage_count', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  };
}

// Real-time subscription hook for review updates
export function useReviewSubscription(reviewId?: string) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const supabase = createClient();

  useEffect(() => {
    if (!reviewId) return;

    const channel = supabase
      .channel(`review-${reviewId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_approvals',
          filter: `review_id=eq.${reviewId}`
        },
        () => {
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_reviews',
          filter: `id=eq.${reviewId}`
        },
        () => {
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reviewId, supabase]);

  return { lastUpdate };
} 