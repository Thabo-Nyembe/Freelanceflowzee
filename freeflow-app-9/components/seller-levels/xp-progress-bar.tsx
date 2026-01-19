/**
 * XP Progress Bar - FreeFlow A+++ Implementation
 * Show XP progress and level
 */

'use client';

import { Sparkles, TrendingUp, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSellerXP } from '@/lib/hooks/use-seller-levels';
import { calculateXPForLevel } from '@/lib/gamification/seller-levels';
import { cn } from '@/lib/utils';

interface XPProgressBarProps {
  compact?: boolean;
  className?: string;
}

export function XPProgressBar({ compact = false, className }: XPProgressBarProps) {
  const { data: xp, isLoading } = useSellerXP();

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!xp) {
    return null;
  }

  const xpForCurrentLevel = calculateXPForLevel(xp.current_level);
  const xpForNextLevel = calculateXPForLevel(xp.current_level + 1);
  const xpInCurrentLevel = xp.total_xp - getTotalXPForLevel(xp.current_level);
  const progressPercentage = (xpInCurrentLevel / xpForNextLevel) * 100;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-2', className)}>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Lvl {xp.current_level}
              </Badge>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">
              {xp.total_xp.toLocaleString()} XP (Level {xp.current_level})
            </p>
            <p className="text-xs text-muted-foreground">
              {xp.xp_to_next_level.toLocaleString()} XP to next level
            </p>
            {xp.current_streak_days > 0 && (
              <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                <Flame className="h-3 w-3" />
                {xp.current_streak_days} day streak! ({Math.round((xp.streak_multiplier - 1) * 100)}% bonus)
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold">Level {xp.current_level}</p>
              <p className="text-xs text-muted-foreground">
                {xp.total_xp.toLocaleString()} total XP
              </p>
            </div>
          </div>
          {xp.current_streak_days > 0 && (
            <Badge
              variant="outline"
              className="gap-1 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300"
            >
              <Flame className="h-3 w-3" />
              {xp.current_streak_days} day streak
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{xpInCurrentLevel.toLocaleString()} XP</span>
            <span>{xpForNextLevel.toLocaleString()} XP to Level {xp.current_level + 1}</span>
          </div>
        </div>

        {/* XP Breakdown */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          <XPSource
            label="Orders"
            value={xp.xp_from_orders}
            icon={<TrendingUp className="h-3 w-3" />}
          />
          <XPSource
            label="Reviews"
            value={xp.xp_from_reviews}
            icon="⭐"
          />
          <XPSource
            label="Badges"
            value={xp.xp_from_badges}
            icon="🏆"
          />
          <XPSource
            label="Profile"
            value={xp.xp_from_profile}
            icon="👤"
          />
          <XPSource
            label="Activity"
            value={xp.xp_from_activity}
            icon="📊"
          />
        </div>

        {/* Streak Info */}
        {xp.streak_multiplier > 1 && (
          <div className="mt-3 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-center">
            <p className="text-sm text-orange-700 dark:text-orange-300">
              🔥 {Math.round((xp.streak_multiplier - 1) * 100)}% XP bonus from streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface XPSourceProps {
  label: string;
  value: number;
  icon: React.ReactNode | string;
}

function XPSource({ label, value, icon }: XPSourceProps) {
  return (
    <div className="text-center">
      <div className="text-lg mb-0.5">
        {typeof icon === 'string' ? icon : icon}
      </div>
      <p className="text-xs font-medium">{value.toLocaleString()}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXPForLevel(i);
  }
  return total;
}

export default XPProgressBar;
