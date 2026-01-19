/**
 * Level Progress Card - FreeFlow A+++ Implementation
 * Show progress toward next seller level
 */

'use client';

import { ArrowRight, CheckCircle2, Circle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLevelProgress } from '@/lib/hooks/use-seller-levels';
import { SellerLevelBadge } from './seller-level-badge';

export function LevelProgressCard() {
  const {
    currentLevel,
    nextLevel,
    progress,
    overallProgress,
    missingRequirements,
    isLoading,
  } = useLevelProgress();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-full" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentLevel) {
    return null;
  }

  const metrics = progress?.metrics || {};

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Level Progress
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Complete all requirements to advance to the next level.
                      Levels are evaluated monthly based on your performance.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>
              {nextLevel
                ? `Progress toward ${nextLevel.display_name}`
                : 'You have reached the highest level!'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SellerLevelBadge level={currentLevel.tier} size="sm" />
            {nextLevel && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <SellerLevelBadge level={nextLevel.tier} size="sm" />
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Individual Metrics */}
        {nextLevel && (
          <div className="grid gap-3">
            <MetricRow
              label="Completed Orders"
              current={metrics.orders?.current || 0}
              required={metrics.orders?.required || 0}
              percentage={metrics.orders?.percentage || 0}
              format="number"
            />
            <MetricRow
              label="Total Earnings"
              current={metrics.earnings?.current || 0}
              required={metrics.earnings?.required || 0}
              percentage={metrics.earnings?.percentage || 0}
              format="currency"
            />
            <MetricRow
              label="Average Rating"
              current={metrics.rating?.current || 0}
              required={metrics.rating?.required || 0}
              percentage={metrics.rating?.percentage || 0}
              format="rating"
            />
            <MetricRow
              label="On-Time Delivery"
              current={metrics.onTimeRate?.current || 0}
              required={metrics.onTimeRate?.required || 0}
              percentage={metrics.onTimeRate?.percentage || 0}
              format="percentage"
            />
            <MetricRow
              label="Response Rate"
              current={metrics.responseRate?.current || 0}
              required={metrics.responseRate?.required || 0}
              percentage={metrics.responseRate?.percentage || 0}
              format="percentage"
            />
            <MetricRow
              label="Days Active"
              current={metrics.daysActive?.current || 0}
              required={metrics.daysActive?.required || 0}
              percentage={metrics.daysActive?.percentage || 0}
              format="days"
            />
          </div>
        )}

        {/* Missing Requirements */}
        {missingRequirements.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">To reach the next level:</p>
            <ul className="space-y-1">
              {missingRequirements.map((req, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <Circle className="h-2 w-2" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Level Benefits */}
        {nextLevel && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Benefits at {nextLevel.display_name}:</p>
            <div className="flex flex-wrap gap-2">
              {nextLevel.commission_discount > 0 && (
                <Badge variant="secondary">
                  {nextLevel.commission_discount}% lower fees
                </Badge>
              )}
              {nextLevel.can_offer_custom_quotes && (
                <Badge variant="secondary">Custom quotes</Badge>
              )}
              {nextLevel.can_use_promoted_gigs && (
                <Badge variant="secondary">Promoted gigs</Badge>
              )}
              {nextLevel.support_priority !== 'standard' && (
                <Badge variant="secondary">
                  {nextLevel.support_priority === 'vip' ? 'VIP' : 'Priority'} support
                </Badge>
              )}
              <Badge variant="secondary">
                Up to {nextLevel.max_active_gigs} active gigs
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricRowProps {
  label: string;
  current: number;
  required: number;
  percentage: number;
  format: 'number' | 'currency' | 'percentage' | 'rating' | 'days';
}

function MetricRow({ label, current, required, percentage, format }: MetricRowProps) {
  const isComplete = percentage >= 100;

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'rating':
        return value.toFixed(1);
      case 'days':
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className={isComplete ? 'text-green-600' : ''}>{label}</span>
          <span className="text-muted-foreground">
            {formatValue(current)} / {formatValue(required)}
          </span>
        </div>
        <Progress
          value={Math.min(100, percentage)}
          className="h-1.5"
        />
      </div>
    </div>
  );
}

export default LevelProgressCard;
