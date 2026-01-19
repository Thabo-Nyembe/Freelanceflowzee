/**
 * Seller Levels Hooks - FreeFlow A+++ Implementation
 * React hooks for seller levels, badges, and XP
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  SellerLevelTier,
  SellerLevelDefinition,
  SellerStatistics,
  BadgeDefinition,
  UserBadge,
  SellerXP,
  BadgeCategory,
} from '@/lib/gamification/seller-levels';

// Query keys
const SELLER_LEVELS_KEY = ['seller-levels'];
const SELLER_STATS_KEY = ['seller-stats'];
const BADGES_KEY = ['badges'];
const USER_BADGES_KEY = ['user-badges'];
const SELLER_XP_KEY = ['seller-xp'];

// ============================================
// SELLER LEVELS HOOK
// ============================================

interface SellerLevelsResponse {
  levels: SellerLevelDefinition[];
  userStats: SellerStatistics | null;
  userXP: SellerXP | null;
  levelProgress: {
    current: SellerLevelDefinition;
    next: SellerLevelDefinition | null;
    progress: {
      metrics: Record<string, { current: number; required: number; percentage: number }>;
      overall: number;
    } | null;
  } | null;
}

export function useSellerLevels(includeUserStats = true) {
  return useQuery<SellerLevelsResponse>({
    queryKey: [...SELLER_LEVELS_KEY, { includeUserStats }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (includeUserStats) {
        params.set('include_user_stats', 'true');
      }

      const response = await fetch(`/api/seller-levels?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seller levels');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// SELLER PROFILE HOOK (for viewing other sellers)
// ============================================

interface SellerProfileResponse {
  stats: SellerStatistics | null;
  level: SellerLevelDefinition | null;
  badges: UserBadge[];
  xp: { total_xp: number; current_level: number } | null;
  recentPromotions: Array<{
    previous_level: SellerLevelTier;
    new_level: SellerLevelTier;
    changed_at: string;
  }>;
}

export function useSellerProfile(userId: string) {
  return useQuery<SellerProfileResponse>({
    queryKey: [...SELLER_STATS_KEY, userId],
    queryFn: async () => {
      const response = await fetch(`/api/seller-levels/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seller profile');
      }
      return response.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// BADGES HOOKS
// ============================================

interface BadgesResponse {
  badges: BadgeDefinition[];
  byCategory: Record<BadgeCategory, (BadgeDefinition & { earned: boolean })[]>;
  userBadgeIds: string[];
  totalBadges: number;
  earnedCount: number;
}

export function useBadges(
  options: {
    category?: BadgeCategory;
    includeUserBadges?: boolean;
  } = {}
) {
  const { category, includeUserBadges = true } = options;

  return useQuery<BadgesResponse>({
    queryKey: [...BADGES_KEY, { category, includeUserBadges }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (includeUserBadges) params.set('include_user_badges', 'true');

      const response = await fetch(`/api/badges?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserBadges(userId?: string) {
  return useQuery<UserBadge[]>({
    queryKey: [...USER_BADGES_KEY, userId],
    queryFn: async () => {
      const params = userId ? `?user_id=${userId}` : '';
      const response = await fetch(`/api/badges${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user badges');
      }
      const data = await response.json();
      return data.user_badges || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// BADGE MUTATIONS
// ============================================

export function useAwardBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      badge_id: string;
      user_id: string;
      reason?: string;
    }) => {
      const response = await fetch('/api/badges/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to award badge');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Badge "${data.badge_name}" awarded!`, {
        description: `+${data.xp_earned} XP earned`,
      });
      queryClient.invalidateQueries({ queryKey: BADGES_KEY });
      queryClient.invalidateQueries({ queryKey: USER_BADGES_KEY });
      queryClient.invalidateQueries({ queryKey: SELLER_XP_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePinBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_badge_id: string;
      is_pinned: boolean;
    }) => {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin', ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update badge');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: USER_BADGES_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useShareBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userBadgeId: string) => {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share', user_badge_id: userBadgeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to share badge');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Badge shared!');
      queryClient.invalidateQueries({ queryKey: USER_BADGES_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ============================================
// XP HOOK
// ============================================

export function useSellerXP() {
  return useQuery<SellerXP | null>({
    queryKey: SELLER_XP_KEY,
    queryFn: async () => {
      const response = await fetch('/api/seller-levels?include_user_stats=true');
      if (!response.ok) {
        throw new Error('Failed to fetch XP');
      }
      const data = await response.json();
      return data.userXP;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// LEVEL PROGRESS HELPERS
// ============================================

export function useLevelProgress() {
  const { data, isLoading, error } = useSellerLevels(true);

  const progress = data?.levelProgress;
  const stats = data?.userStats;

  // Calculate missing requirements
  const missingRequirements: string[] = [];
  if (progress?.progress && progress.next) {
    const metrics = progress.progress.metrics;

    if (metrics.orders?.percentage < 100) {
      missingRequirements.push(
        `${progress.next.min_orders - (stats?.completed_orders || 0)} more orders needed`
      );
    }
    if (metrics.earnings?.percentage < 100) {
      missingRequirements.push(
        `$${(progress.next.min_earnings - (stats?.total_earnings || 0)).toFixed(0)} more earnings needed`
      );
    }
    if (metrics.rating?.percentage < 100) {
      missingRequirements.push(
        `Rating of ${progress.next.min_rating}+ needed (current: ${stats?.average_rating?.toFixed(1) || 0})`
      );
    }
    if (metrics.daysActive?.percentage < 100) {
      missingRequirements.push(
        `${progress.next.min_days_active - (stats?.days_since_joined || 0)} more days active needed`
      );
    }
  }

  return {
    currentLevel: progress?.current,
    nextLevel: progress?.next,
    progress: progress?.progress,
    overallProgress: progress?.progress?.overall || 0,
    missingRequirements,
    isLoading,
    error,
  };
}

// ============================================
// LEADERBOARD HOOK
// ============================================

interface LeaderboardEntry {
  user_id: string;
  name: string;
  avatar_url?: string;
  current_level: SellerLevelTier;
  total_xp: number;
  completed_orders: number;
  average_rating: number;
  rank: number;
}

export function useSellerLeaderboard(
  options: {
    sortBy?: 'xp' | 'orders' | 'rating' | 'earnings';
    limit?: number;
  } = {}
) {
  const { sortBy = 'xp', limit = 10 } = options;

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['seller-leaderboard', { sortBy, limit }],
    queryFn: async () => {
      // This would need a dedicated leaderboard API endpoint
      // For now, return empty array - you'd implement this
      return [];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// ============================================
// ACHIEVEMENT TRACKING HOOK
// ============================================

interface Achievement {
  id: string;
  achievement_type: string;
  current_progress: number;
  target: number;
  completed: boolean;
  completed_at?: string;
  badge?: BadgeDefinition;
}

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ['seller-achievements'],
    queryFn: async () => {
      // This would fetch from /api/achievements
      // For now, return empty array
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// ACCOUNT HEALTH HOOK
// ============================================

interface AccountHealth {
  score: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
  factors: Array<{
    name: string;
    impact: number;
    status: 'positive' | 'negative' | 'neutral';
  }>;
}

export function useAccountHealth() {
  const { data } = useSellerLevels(true);
  const stats = data?.userStats;

  if (!stats) {
    return {
      health: null,
      isLoading: true,
    };
  }

  // Calculate health score
  let score = 100;
  const factors: AccountHealth['factors'] = [];

  // Rating impact
  if (stats.average_rating >= 4.8) {
    factors.push({ name: 'Excellent rating', impact: 10, status: 'positive' });
    score += 10;
  } else if (stats.average_rating < 4.0) {
    factors.push({ name: 'Low rating', impact: -20, status: 'negative' });
    score -= 20;
  }

  // On-time delivery
  if (stats.on_time_delivery_rate >= 95) {
    factors.push({ name: 'Great delivery speed', impact: 10, status: 'positive' });
    score += 10;
  } else if (stats.on_time_delivery_rate < 80) {
    factors.push({ name: 'Late deliveries', impact: -15, status: 'negative' });
    score -= 15;
  }

  // Response rate
  if (stats.response_rate >= 95) {
    factors.push({ name: 'Quick responses', impact: 5, status: 'positive' });
    score += 5;
  } else if (stats.response_rate < 80) {
    factors.push({ name: 'Slow response time', impact: -10, status: 'negative' });
    score -= 10;
  }

  // Warnings
  if (stats.has_active_warning) {
    factors.push({ name: 'Active warning', impact: -20, status: 'negative' });
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  let status: AccountHealth['status'];
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'needs_attention';
  else status = 'at_risk';

  return {
    health: { score, status, factors },
    isLoading: false,
  };
}
