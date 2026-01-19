/**
 * Seller Level Badge - FreeFlow A+++ Implementation
 * Display seller's current level badge
 */

'use client';

import { Crown, Star, TrendingUp, Award, Shield, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SellerLevelTier } from '@/lib/gamification/seller-levels';

interface SellerLevelBadgeProps {
  level: SellerLevelTier;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelConfig: Record<
  SellerLevelTier,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  new_seller: {
    label: 'New Seller',
    icon: TrendingUp,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    description: 'Just getting started on FreeFlow',
  },
  rising_talent: {
    label: 'Rising Talent',
    icon: Star,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Showing great promise with early success',
  },
  level_1: {
    label: 'Level 1',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Established seller with proven track record',
  },
  level_2: {
    label: 'Level 2',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Experienced professional with excellent metrics',
  },
  top_rated: {
    label: 'Top Rated',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Elite seller with exceptional performance',
  },
  pro: {
    label: 'Pro Verified',
    icon: Gem,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'Manually vetted professional expert',
  },
};

const sizeConfig = {
  sm: {
    badge: 'h-6 px-2 text-xs gap-1',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'h-8 px-3 text-sm gap-1.5',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'h-10 px-4 text-base gap-2',
    icon: 'h-5 w-5',
  },
};

export function SellerLevelBadge({
  level,
  showLabel = true,
  size = 'md',
  className,
}: SellerLevelBadgeProps) {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center rounded-full font-medium',
              config.bgColor,
              config.color,
              sizes.badge,
              className
            )}
          >
            <Icon className={sizes.icon} />
            {showLabel && <span>{config.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default SellerLevelBadge;
