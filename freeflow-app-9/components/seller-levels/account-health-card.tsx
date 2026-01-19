/**
 * Account Health Card - FreeFlow A+++ Implementation
 * Display account health score and factors
 */

'use client';

import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAccountHealth } from '@/lib/hooks/use-seller-levels';

const statusConfig = {
  excellent: {
    label: 'Excellent',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: CheckCircle2,
    description: 'Your account is in great standing!',
  },
  good: {
    label: 'Good',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: CheckCircle2,
    description: 'Your account is healthy with minor areas to improve.',
  },
  needs_attention: {
    label: 'Needs Attention',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: AlertCircle,
    description: 'Some metrics need improvement to maintain your level.',
  },
  at_risk: {
    label: 'At Risk',
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: XCircle,
    description: 'Immediate action required to prevent level demotion.',
  },
};

export function AccountHealthCard() {
  const { health, isLoading } = useAccountHealth();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return null;
  }

  const config = statusConfig[health.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Account Health
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Score */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'h-20 w-20 rounded-full flex items-center justify-center',
              config.bgColor
            )}
          >
            <span className={cn('text-3xl font-bold', config.color)}>
              {health.score}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-5 w-5', config.color)} />
              <span className={cn('font-semibold', config.color)}>
                {config.label}
              </span>
            </div>
            <Progress
              value={health.score}
              className="h-2 w-32 mt-2"
            />
          </div>
        </div>

        {/* Health Factors */}
        {health.factors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Contributing Factors
            </h4>
            <div className="space-y-2">
              {health.factors.map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {factor.status === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : factor.status === 'negative' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">{factor.name}</span>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      factor.impact > 0 && 'text-green-600',
                      factor.impact < 0 && 'text-red-600'
                    )}
                  >
                    {factor.impact > 0 ? '+' : ''}{factor.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning if at risk */}
        {health.status === 'at_risk' && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Action Required
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Your account health is critically low. Improve your metrics
                  within the next 30 days to avoid level demotion and potential
                  restrictions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips for improvement */}
        {health.status !== 'excellent' && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Tips to Improve</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {health.score < 90 && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  Respond to messages within 1 hour
                </li>
              )}
              {health.score < 80 && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  Deliver all orders on time
                </li>
              )}
              {health.score < 70 && (
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  Maintain a 4.8+ star rating
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AccountHealthCard;
