/**
 * Seller Stats Card - FreeFlow A+++ Implementation
 * Display key seller statistics
 */

'use client';

import {
  DollarSign,
  ShoppingBag,
  Star,
  Clock,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSellerLevels } from '@/lib/hooks/use-seller-levels';
import { cn } from '@/lib/utils';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

function StatItem({ icon, label, value, subValue, trend, className }: StatItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="p-2 rounded-lg bg-muted">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold flex items-center gap-1">
          {value}
          {trend && (
            <TrendingUp
              className={cn(
                'h-4 w-4',
                trend === 'up' && 'text-green-500',
                trend === 'down' && 'text-red-500 rotate-180',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            />
          )}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export function SellerStatsCard() {
  const { data, isLoading } = useSellerLevels(true);
  const stats = data?.userStats;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No seller statistics available yet.</p>
          <p className="text-sm">Complete your first order to see your stats!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatItem
            icon={<ShoppingBag className="h-5 w-5 text-blue-500" />}
            label="Completed Orders"
            value={stats.completed_orders}
            subValue={`${stats.active_orders} active`}
          />
          <StatItem
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
            label="Total Earnings"
            value={`$${stats.total_earnings.toLocaleString()}`}
            subValue={`$${stats.earnings_this_month.toLocaleString()} this month`}
          />
          <StatItem
            icon={<Star className="h-5 w-5 text-amber-500" />}
            label="Average Rating"
            value={stats.average_rating.toFixed(1)}
            subValue={`${stats.total_reviews} reviews`}
          />
          <StatItem
            icon={<Clock className="h-5 w-5 text-purple-500" />}
            label="On-Time Delivery"
            value={`${Math.round(stats.on_time_delivery_rate)}%`}
          />
          <StatItem
            icon={<MessageCircle className="h-5 w-5 text-pink-500" />}
            label="Response Rate"
            value={`${Math.round(stats.response_rate)}%`}
            subValue={formatResponseTime(stats.response_time_hours)}
          />
          <StatItem
            icon={<Users className="h-5 w-5 text-indigo-500" />}
            label="Unique Clients"
            value={stats.unique_clients}
            subValue={`${stats.repeat_clients} repeat`}
          />
          <StatItem
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            label="Completion Rate"
            value={`${Math.round(stats.order_completion_rate)}%`}
          />
          <StatItem
            icon={<Calendar className="h-5 w-5 text-orange-500" />}
            label="Days Active"
            value={stats.days_since_joined}
            subValue={`${stats.days_active_last_30} in last 30 days`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function formatResponseTime(hours: number): string {
  if (hours < 1) {
    return `Avg. ${Math.round(hours * 60)} min response`;
  }
  if (hours < 24) {
    return `Avg. ${Math.round(hours)} hr response`;
  }
  return `Avg. ${Math.round(hours / 24)} day response`;
}

export default SellerStatsCard;
