/**
 * Revenue Insights Widget
 *
 * Displays AI-powered revenue optimization insights
 * Shows pricing recommendations, upsell opportunities, and revenue leaks
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRevenueIntelligence } from '@/lib/hooks/use-revenue-intelligence';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Target,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface RevenueInsightsWidgetProps {
  userId: string;
  revenueData?: any;
  compact?: boolean;
  showActions?: boolean;
}

export function RevenueInsightsWidget({
  userId,
  revenueData,
  compact = false,
  showActions = true
}: RevenueInsightsWidgetProps) {
  const { report, isLoading, generateReport } = useRevenueIntelligence();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (revenueData) {
      loadInsights();
    }
  }, [revenueData]);

  const loadInsights = async () => {
    setIsRefreshing(true);
    logger.info('Loading AI revenue insights', { userId });

    try {
      await generateReport(revenueData, {
        industry: revenueData.industry || 'creative_services',
        includeForecasting: true,
        includeMarketAnalysis: true
      });

      logger.info('AI revenue insights loaded successfully', {
        userId,
        hasReport: !!report
      });
    } catch (error) {
      logger.error('Failed to load revenue insights', { userId, error });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <div>
            <h3 className="font-semibold">Analyzing Your Revenue...</h3>
            <p className="text-sm text-muted-foreground">AI is generating personalized insights</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">AI Revenue Intelligence</h3>
              <p className="text-sm text-muted-foreground">Get personalized revenue optimization insights</p>
            </div>
          </div>
          <Button onClick={loadInsights} disabled={!revenueData}>
            Analyze Revenue
          </Button>
        </div>
      </Card>
    );
  }

  const { summary, pricingOptimization, upsellOpportunities, revenueLeaks, actionPlan } = report;

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Revenue Insights</h4>
          </div>
          <Button variant="ghost" size="sm" onClick={loadInsights}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Current MRR</span>
            <span className="font-semibold text-sm">${(summary.currentMRR ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Projected MRR</span>
            <span className="font-semibold text-sm text-green-600">
              ${(summary.projectedMRR ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Growth Potential</span>
            <Badge variant="default" className="text-xs">
              +{(summary.growthRate ?? 0).toFixed(1)}%
            </Badge>
          </div>
        </div>

        {summary.topPriorities.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium mb-2">Top Priority:</p>
            <p className="text-xs text-muted-foreground">{summary.topPriorities[0]}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Revenue Intelligence</h3>
              <p className="text-sm text-muted-foreground">Personalized insights to grow your revenue</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current MRR</p>
            <p className="text-2xl font-bold">${(summary.currentMRR ?? 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Projected MRR</p>
            <p className="text-2xl font-bold text-green-600">${(summary.projectedMRR ?? 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
            <p className="text-2xl font-bold text-blue-600">+{(summary.growthRate ?? 0).toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Opportunity Value</p>
            <p className="text-2xl font-bold text-purple-600">${(summary.totalOpportunityValue ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Pricing Optimization */}
      {pricingOptimization.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold">Pricing Optimization</h4>
            <Badge variant="secondary">{pricingOptimization.length} recommendations</Badge>
          </div>

          <div className="space-y-3">
            {pricingOptimization.slice(0, 3).map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">Increase pricing by {((rec.recommendedPrice - rec.currentPrice) / rec.currentPrice * 100).toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>
                  </div>
                  <Badge variant={rec.confidence > 0.8 ? 'default' : 'secondary'}>
                    {(rec.confidence * 100).toFixed(0)}% confident
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm mt-3">
                  <div>
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-semibold">${rec.currentPrice.toLocaleString()}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <div>
                    <span className="text-muted-foreground">Recommended: </span>
                    <span className="font-semibold text-green-600">${rec.recommendedPrice.toLocaleString()}</span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-muted-foreground">Impact: </span>
                    <span className="font-semibold text-green-600">+{rec.expectedImpact.revenueIncrease.toFixed(0)}%</span>
                  </div>
                </div>

                {rec.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Next Steps:</p>
                    <ul className="space-y-1">
                      {rec.actions.slice(0, 2).map((action, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start">
                          <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Revenue Leaks */}
      {revenueLeaks.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold">Revenue Leaks Detected</h4>
            <Badge variant="destructive">{revenueLeaks.length} issues</Badge>
          </div>

          <div className="space-y-3">
            {revenueLeaks.map((leak, index) => (
              <div key={index} className="p-4 border border-orange-200 dark:border-orange-900 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={leak.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {leak.severity}
                      </Badge>
                      <span className="text-sm font-medium capitalize">{leak.type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{leak.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Est. Loss</p>
                    <p className="text-lg font-bold text-orange-600">${leak.estimatedLoss.toLocaleString()}/mo</p>
                  </div>
                </div>

                {leak.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-900">
                    <p className="text-xs font-medium mb-2">Fix It:</p>
                    <ul className="space-y-1">
                      {leak.recommendations.slice(0, 2).map((rec, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start">
                          <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upsell Opportunities */}
      {upsellOpportunities.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold">Upsell Opportunities</h4>
            <Badge variant="secondary">{upsellOpportunities.length} opportunities</Badge>
          </div>

          <div className="space-y-3">
            {upsellOpportunities.slice(0, 3).map((opp, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{opp.clientName}</p>
                    <Badge variant="outline" className="mt-1">
                      {opp.opportunityType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Est. Value</p>
                    <p className="text-lg font-bold text-blue-600">${opp.estimatedValue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{(opp.probability * 100).toFixed(0)}% probability</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{opp.reasoning}</p>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Suggested Approach:
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">{opp.suggestedApproach}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    <strong>Best timing:</strong> {opp.optimalTiming}
                  </p>
                </div>

                {opp.talkingPoints.length > 0 && showActions && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      View Talking Points ({opp.talkingPoints.length})
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Plan */}
      {showActions && actionPlan.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">Recommended Actions</h4>
          </div>

          <div className="space-y-2">
            {actionPlan.slice(0, 5).map((action, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={
                        action.priority === 'critical' ? 'destructive' :
                        action.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline">{action.category.replace('_', ' ')}</Badge>
                      <Badge variant="secondary">{action.effortLevel} effort</Badge>
                    </div>
                    <p className="font-medium mt-2">{action.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-muted-foreground">Impact</p>
                    <p className="text-lg font-bold text-green-600">
                      +${action.estimatedImpact.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{action.timeToImplement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
