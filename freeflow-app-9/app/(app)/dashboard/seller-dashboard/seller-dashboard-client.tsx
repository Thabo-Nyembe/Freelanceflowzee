/**
 * Seller Dashboard Client - FreeFlow A+++ Implementation
 * Client component for seller dashboard
 */

'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Award,
  Target,
  Heart,
  Sparkles,
  BarChart3,
  Trophy,
  Star,
  Info,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  SellerLevelBadge,
  LevelProgressCard,
  SellerStatsCard,
  XPProgressBar,
  AccountHealthCard,
} from '@/components/seller-levels';
import { useSellerLevels, useBadges } from '@/lib/hooks/use-seller-levels';
import { getBadgeCategoryColor, getBadgeCategoryLabel } from '@/lib/gamification/seller-levels';
import type { BadgeCategory } from '@/lib/gamification/seller-levels';

export function SellerDashboardClient() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: levelsData, isLoading: levelsLoading } = useSellerLevels(true);
  const { data: badgesData, isLoading: badgesLoading } = useBadges({ includeUserBadges: true });

  const stats = levelsData?.userStats;
  const currentLevel = levelsData?.levelProgress?.current;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance, level up, and earn badges
          </p>
        </div>
        <div className="flex items-center gap-4">
          {currentLevel && (
            <SellerLevelBadge level={currentLevel.tier} size="lg" />
          )}
          <XPProgressBar compact />
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickStatCard
            icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
            label="Completed Orders"
            value={stats.completed_orders}
            change={`${stats.active_orders} active`}
          />
          <QuickStatCard
            icon={<Star className="h-5 w-5 text-amber-500" />}
            label="Average Rating"
            value={stats.average_rating.toFixed(1)}
            change={`${stats.total_reviews} reviews`}
          />
          <QuickStatCard
            icon={<Trophy className="h-5 w-5 text-purple-500" />}
            label="Badges Earned"
            value={badgesData?.earnedCount || 0}
            change={`of ${badgesData?.totalBadges || 0} total`}
          />
          <QuickStatCard
            icon={<Target className="h-5 w-5 text-green-500" />}
            label="Account Health"
            value={`${stats.account_health_score}%`}
            change={stats.account_health_score >= 90 ? 'Excellent' : stats.account_health_score >= 70 ? 'Good' : 'Needs work'}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Levels
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Award className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Heart className="h-4 w-4" />
            Health
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <LevelProgressCard />
            <XPProgressBar />
          </div>
          <SellerStatsCard />
        </TabsContent>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-6 mt-6">
          <LevelProgressCard />

          {/* All Levels */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Level Tiers</CardTitle>
              <CardDescription>
                Progress through levels by meeting performance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {levelsData?.levels.map((level, index) => {
                  const isCurrent = level.tier === currentLevel?.tier;
                  const isPast = currentLevel && index < levelsData.levels.findIndex(l => l.tier === currentLevel.tier);

                  return (
                    <div
                      key={level.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCurrent
                          ? 'border-primary bg-primary/5'
                          : isPast
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50'
                          : 'border-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SellerLevelBadge level={level.tier} />
                          {isCurrent && (
                            <Badge variant="default">Current</Badge>
                          )}
                          {isPast && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Achieved
                            </Badge>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{level.min_orders}+ orders</p>
                          <p>${level.min_earnings.toLocaleString()}+ earnings</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {level.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {level.commission_discount > 0 && (
                          <Badge variant="outline">{level.commission_discount}% lower fees</Badge>
                        )}
                        <Badge variant="outline">{level.max_active_gigs} max gigs</Badge>
                        {level.can_offer_custom_quotes && (
                          <Badge variant="outline">Custom quotes</Badge>
                        )}
                        {level.support_priority !== 'standard' && (
                          <Badge variant="outline">{level.support_priority} support</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6 mt-6">
          {badgesData?.byCategory && Object.entries(badgesData.byCategory).map(([category, badges]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getBadgeCategoryColor(category as BadgeCategory) }}
                  />
                  {getBadgeCategoryLabel(category as BadgeCategory)} Badges
                </CardTitle>
                <CardDescription>
                  {badges.filter((b: { earned: boolean }) => b.earned).length} of {badges.length} earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {badges.map((badge: {
                    id: string;
                    name: string;
                    description: string;
                    icon_name?: string;
                    color: string;
                    xp_reward: number;
                    earned: boolean;
                    is_rare?: boolean;
                    threshold?: number;
                  }) => (
                    <BadgeCard
                      key={badge.id}
                      name={badge.name}
                      description={badge.description}
                      iconName={badge.icon_name}
                      color={badge.color}
                      xpReward={badge.xp_reward}
                      earned={badge.earned}
                      isRare={badge.is_rare}
                      threshold={badge.threshold}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <AccountHealthCard />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How Account Health Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your account health score is calculated based on several factors:
                </p>
                <div className="space-y-3">
                  <HealthFactor
                    label="Customer Ratings"
                    description="Maintain 4.8+ star average"
                    impact="High"
                  />
                  <HealthFactor
                    label="On-Time Delivery"
                    description="Deliver 95%+ of orders on time"
                    impact="High"
                  />
                  <HealthFactor
                    label="Response Rate"
                    description="Respond to 95%+ of messages within 24 hours"
                    impact="Medium"
                  />
                  <HealthFactor
                    label="Cancellation Rate"
                    description="Keep cancellations below 5%"
                    impact="High"
                  />
                  <HealthFactor
                    label="Active Warnings"
                    description="Resolve any account warnings"
                    impact="Critical"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <SellerStatsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QuickStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: string;
}

function QuickStatCard({ icon, label, value, change }: QuickStatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{change}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BadgeCardProps {
  name: string;
  description: string;
  iconName?: string;
  color: string;
  xpReward: number;
  earned: boolean;
  isRare?: boolean;
  threshold?: number;
}

function BadgeCard({
  name,
  description,
  color,
  xpReward,
  earned,
  isRare,
}: BadgeCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border text-center transition-all ${
        earned
          ? 'bg-card hover:shadow-md'
          : 'bg-muted/30 opacity-60 grayscale'
      }`}
    >
      <div
        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
        style={{ backgroundColor: earned ? `${color}20` : undefined }}
      >
        <Trophy
          className="h-6 w-6"
          style={{ color: earned ? color : undefined }}
        />
      </div>
      <p className="font-medium text-sm">{name}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      <div className="flex items-center justify-center gap-1 mt-2">
        <Sparkles className="h-3 w-3 text-amber-500" />
        <span className="text-xs">{xpReward} XP</span>
        {isRare && (
          <Badge variant="secondary" className="text-[10px] ml-1">Rare</Badge>
        )}
      </div>
    </div>
  );
}

interface HealthFactorProps {
  label: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
}

function HealthFactor({ label, description, impact }: HealthFactorProps) {
  const impactColors = {
    Low: 'bg-blue-100 text-blue-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Badge className={impactColors[impact]} variant="secondary">
        {impact}
      </Badge>
    </div>
  );
}

export default SellerDashboardClient;
