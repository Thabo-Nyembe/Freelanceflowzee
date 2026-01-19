/**
 * Seller Levels & Gamification Library - FreeFlow A+++ Implementation
 * Based on Fiverr/Upwork seller ranking systems
 */

// Types
export type SellerLevelTier =
  | 'new_seller'
  | 'rising_talent'
  | 'level_1'
  | 'level_2'
  | 'top_rated'
  | 'pro';

export type BadgeCategory =
  | 'achievement'
  | 'skill'
  | 'quality'
  | 'speed'
  | 'communication'
  | 'special'
  | 'verified';

export type AchievementType =
  | 'orders_completed'
  | 'revenue_earned'
  | 'repeat_clients'
  | 'five_star_reviews'
  | 'on_time_delivery'
  | 'quick_response'
  | 'zero_cancellation'
  | 'perfect_month'
  | 'client_favorite'
  | 'skill_certified'
  | 'identity_verified'
  | 'portfolio_complete'
  | 'profile_complete';

export interface SellerLevelDefinition {
  id: string;
  tier: SellerLevelTier;
  display_name: string;
  description: string;
  icon_url?: string;
  color: string;
  min_orders: number;
  min_earnings: number;
  min_rating: number;
  min_on_time_rate: number;
  min_response_rate: number;
  min_completion_rate: number;
  min_days_active: number;
  min_repeat_buyer_rate: number;
  commission_discount: number;
  featured_priority: number;
  max_active_gigs: number;
  can_offer_custom_quotes: boolean;
  can_use_promoted_gigs: boolean;
  support_priority: 'standard' | 'priority' | 'vip';
}

export interface SellerStatistics {
  id: string;
  user_id: string;
  current_level: SellerLevelTier;
  level_achieved_at: string;
  next_evaluation_at?: string;

  // Order metrics
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  active_orders: number;

  // Financial metrics
  total_earnings: number;
  earnings_this_month: number;
  earnings_last_30_days: number;
  average_order_value: number;

  // Quality metrics
  average_rating: number;
  total_reviews: number;
  five_star_reviews: number;
  four_star_reviews: number;
  positive_review_rate: number;

  // Performance metrics
  on_time_delivery_rate: number;
  response_rate: number;
  response_time_hours: number;
  order_completion_rate: number;

  // Client metrics
  unique_clients: number;
  repeat_clients: number;
  repeat_buyer_rate: number;

  // Activity metrics
  days_since_joined: number;
  days_active_last_30: number;
  last_order_date?: string;
  last_delivery_date?: string;
  last_active_at: string;

  // Health
  warnings_count: number;
  has_active_warning: boolean;
  account_health_score: number;
}

export interface BadgeDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon_url?: string;
  icon_name?: string;
  color: string;
  achievement_type?: AchievementType;
  threshold?: number;
  is_public: boolean;
  is_rare: boolean;
  rarity_percentage?: number;
  xp_reward: number;
  unlocks_feature?: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge?: BadgeDefinition;
  awarded_at: string;
  awarded_reason?: string;
  expires_at?: string;
  is_expired: boolean;
  is_featured: boolean;
  display_order: number;
}

export interface SellerXP {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  xp_from_orders: number;
  xp_from_reviews: number;
  xp_from_badges: number;
  xp_from_profile: number;
  xp_from_activity: number;
  current_streak_days: number;
  longest_streak_days: number;
  streak_multiplier: number;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  xp_amount: number;
  xp_type: string;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

export interface LevelProgress {
  currentLevel: SellerLevelDefinition;
  nextLevel?: SellerLevelDefinition;
  progress: {
    orders: { current: number; required: number; percentage: number };
    earnings: { current: number; required: number; percentage: number };
    rating: { current: number; required: number; percentage: number };
    onTimeRate: { current: number; required: number; percentage: number };
    responseRate: { current: number; required: number; percentage: number };
    completionRate: { current: number; required: number; percentage: number };
    daysActive: { current: number; required: number; percentage: number };
    repeatBuyerRate: { current: number; required: number; percentage: number };
  };
  overallProgress: number;
  missingRequirements: string[];
  estimatedTimeToNextLevel?: string;
}

// Level tier order for comparison
const LEVEL_ORDER: Record<SellerLevelTier, number> = {
  new_seller: 1,
  rising_talent: 2,
  level_1: 3,
  level_2: 4,
  top_rated: 5,
  pro: 6,
};

// Helper functions
export function compareLevels(a: SellerLevelTier, b: SellerLevelTier): number {
  return LEVEL_ORDER[a] - LEVEL_ORDER[b];
}

export function isHigherLevel(
  current: SellerLevelTier,
  target: SellerLevelTier
): boolean {
  return LEVEL_ORDER[current] > LEVEL_ORDER[target];
}

export function getLevelColor(tier: SellerLevelTier): string {
  const colors: Record<SellerLevelTier, string> = {
    new_seller: '#6B7280',
    rising_talent: '#10B981',
    level_1: '#3B82F6',
    level_2: '#8B5CF6',
    top_rated: '#F59E0B',
    pro: '#EF4444',
  };
  return colors[tier];
}

export function getLevelDisplayName(tier: SellerLevelTier): string {
  const names: Record<SellerLevelTier, string> = {
    new_seller: 'New Seller',
    rising_talent: 'Rising Talent',
    level_1: 'Level 1 Seller',
    level_2: 'Level 2 Seller',
    top_rated: 'Top Rated',
    pro: 'Pro Verified',
  };
  return names[tier];
}

export function getBadgeCategoryLabel(category: BadgeCategory): string {
  const labels: Record<BadgeCategory, string> = {
    achievement: 'Achievement',
    skill: 'Skill',
    quality: 'Quality',
    speed: 'Speed',
    communication: 'Communication',
    special: 'Special',
    verified: 'Verified',
  };
  return labels[category];
}

export function getBadgeCategoryColor(category: BadgeCategory): string {
  const colors: Record<BadgeCategory, string> = {
    achievement: '#F59E0B',
    skill: '#3B82F6',
    quality: '#10B981',
    speed: '#8B5CF6',
    communication: '#EC4899',
    special: '#EF4444',
    verified: '#059669',
  };
  return colors[category];
}

// Calculate level progress
export function calculateLevelProgress(
  stats: SellerStatistics,
  currentLevel: SellerLevelDefinition,
  nextLevel?: SellerLevelDefinition
): LevelProgress {
  const missingRequirements: string[] = [];

  const calculateMetricProgress = (
    current: number,
    required: number
  ): { current: number; required: number; percentage: number } => {
    const percentage = required > 0 ? Math.min(100, (current / required) * 100) : 100;
    return { current, required, percentage };
  };

  const progress = {
    orders: calculateMetricProgress(
      stats.completed_orders,
      nextLevel?.min_orders || currentLevel.min_orders
    ),
    earnings: calculateMetricProgress(
      stats.total_earnings,
      nextLevel?.min_earnings || currentLevel.min_earnings
    ),
    rating: calculateMetricProgress(
      stats.average_rating,
      nextLevel?.min_rating || currentLevel.min_rating
    ),
    onTimeRate: calculateMetricProgress(
      stats.on_time_delivery_rate,
      nextLevel?.min_on_time_rate || currentLevel.min_on_time_rate
    ),
    responseRate: calculateMetricProgress(
      stats.response_rate,
      nextLevel?.min_response_rate || currentLevel.min_response_rate
    ),
    completionRate: calculateMetricProgress(
      stats.order_completion_rate,
      nextLevel?.min_completion_rate || currentLevel.min_completion_rate
    ),
    daysActive: calculateMetricProgress(
      stats.days_since_joined,
      nextLevel?.min_days_active || currentLevel.min_days_active
    ),
    repeatBuyerRate: calculateMetricProgress(
      stats.repeat_buyer_rate,
      nextLevel?.min_repeat_buyer_rate || currentLevel.min_repeat_buyer_rate
    ),
  };

  // Check what's missing for next level
  if (nextLevel) {
    if (progress.orders.percentage < 100) {
      missingRequirements.push(
        `Need ${nextLevel.min_orders - stats.completed_orders} more orders`
      );
    }
    if (progress.earnings.percentage < 100) {
      missingRequirements.push(
        `Need $${(nextLevel.min_earnings - stats.total_earnings).toFixed(2)} more in earnings`
      );
    }
    if (progress.rating.percentage < 100) {
      missingRequirements.push(
        `Need ${nextLevel.min_rating.toFixed(1)} or higher rating`
      );
    }
    if (progress.onTimeRate.percentage < 100) {
      missingRequirements.push(
        `Need ${nextLevel.min_on_time_rate}% on-time delivery`
      );
    }
    if (progress.responseRate.percentage < 100) {
      missingRequirements.push(
        `Need ${nextLevel.min_response_rate}% response rate`
      );
    }
    if (progress.daysActive.percentage < 100) {
      missingRequirements.push(
        `Need to be active for ${nextLevel.min_days_active - stats.days_since_joined} more days`
      );
    }
  }

  // Calculate overall progress (average of all metrics)
  const progressValues = Object.values(progress).map((p) => p.percentage);
  const overallProgress =
    progressValues.reduce((a, b) => a + b, 0) / progressValues.length;

  return {
    currentLevel,
    nextLevel,
    progress,
    overallProgress,
    missingRequirements,
  };
}

// Calculate XP for next level
export function calculateXPForLevel(level: number): number {
  // Exponential curve: Level 1 = 100, Level 2 = 150, Level 3 = 225, etc.
  return Math.round(100 * Math.pow(1.5, level - 1));
}

// Get total XP required to reach a level
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXPForLevel(i);
  }
  return total;
}

// XP rewards configuration
export const XP_REWARDS = {
  order_completed: 25,
  five_star_review: 15,
  four_star_review: 10,
  on_time_delivery: 5,
  quick_response: 3, // Responding within 1 hour
  daily_login: 2,
  profile_complete: 50,
  portfolio_item: 10,
  first_sale: 100,
  streak_bonus_multiplier: 0.1, // +10% per day streak (max 2x)
} as const;

// Format functions
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatResponseTime(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  if (hours < 24) {
    return `${Math.round(hours)} hr`;
  }
  return `${Math.round(hours / 24)} days`;
}

// Account health calculation
export function calculateAccountHealth(stats: SellerStatistics): {
  score: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
  factors: { name: string; impact: number; status: 'positive' | 'negative' | 'neutral' }[];
} {
  const factors: { name: string; impact: number; status: 'positive' | 'negative' | 'neutral' }[] = [];
  let score = 100;

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

  // Cancellation rate
  const cancellationRate = stats.total_orders > 0
    ? (stats.cancelled_orders / stats.total_orders) * 100
    : 0;
  if (cancellationRate > 10) {
    factors.push({ name: 'High cancellation rate', impact: -15, status: 'negative' });
    score -= 15;
  }

  // Warnings
  if (stats.has_active_warning) {
    factors.push({ name: 'Active warning', impact: -20, status: 'negative' });
    score -= 20;
  }

  score = Math.max(0, Math.min(100, score));

  let status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
  if (score >= 90) status = 'excellent';
  else if (score >= 70) status = 'good';
  else if (score >= 50) status = 'needs_attention';
  else status = 'at_risk';

  return { score, status, factors };
}
