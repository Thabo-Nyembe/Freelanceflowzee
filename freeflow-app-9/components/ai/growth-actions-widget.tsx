/**
 * Growth Actions Widget
 *
 * Displays AI-generated daily growth actions
 * Shows what the user should do today to grow their business
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useGrowthAutomation } from '@/lib/hooks/use-growth-automation';
import {
  Target,
  Clock,
  TrendingUp,
  Mail,
  Users,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface GrowthActionsWidgetProps {
  userId: string;
  userProfile: {
    industry: string;
    currentRevenue: number;
    targetRevenue: number;
    availableTimePerWeek: number;
  };
  compact?: boolean;
}

export function GrowthActionsWidget({
  userId,
  userProfile,
  compact = false
}: GrowthActionsWidgetProps) {
  const { actionPlan, isLoading, getActionPlan } = useGrowthAutomation();
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadActionPlan();
    // Load completed actions from localStorage
    const saved = localStorage.getItem(`growth-actions-completed-${userId}`);
    if (saved) {
      setCompletedActions(new Set(JSON.parse(saved)));
    }
  }, [userId]);

  const loadActionPlan = async () => {
    setIsRefreshing(true);
    logger.info('Loading AI growth action plan', { userId });

    try {
      await getActionPlan(userProfile);
      logger.info('AI growth action plan loaded', { userId });
    } catch (error) {
      logger.error('Failed to load growth action plan', { userId, error });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleAction = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
      logger.info('Action marked as incomplete', { userId, actionId });
    } else {
      newCompleted.add(actionId);
      logger.info('Action marked as complete', { userId, actionId });
    }
    setCompletedActions(newCompleted);
    localStorage.setItem(`growth-actions-completed-${userId}`, JSON.stringify([...newCompleted]));
  };

  const getActionIcon = (category: string) => {
    switch (category) {
      case 'outreach':
        return <Mail className="h-4 w-4" />;
      case 'content':
        return <MessageSquare className="h-4 w-4" />;
      case 'networking':
        return <Users className="h-4 w-4" />;
      case 'follow_up':
        return <Target className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <div>
            <h3 className="font-semibold">Generating Your Action Plan...</h3>
            <p className="text-sm text-muted-foreground">AI is creating personalized growth actions</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!actionPlan) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Daily Growth Actions</h3>
              <p className="text-sm text-muted-foreground">Get AI-powered tasks to grow your business</p>
            </div>
          </div>
          <Button onClick={loadActionPlan}>
            Generate Plan
          </Button>
        </div>
      </Card>
    );
  }

  const dailyActions = actionPlan.daily || [];
  const completedCount = dailyActions.filter(a => completedActions.has(a.action)).length;
  const totalTime = dailyActions.reduce((sum, a) => {
    const minutes = parseInt(a.timeRequired.match(/\d+/)?.[0] || '0');
    return sum + minutes;
  }, 0);

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Today's Growth Actions</h4>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{dailyActions.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {dailyActions.slice(0, 3).map((action, index) => {
            const actionId = action.action;
            const isCompleted = completedActions.has(actionId);

            return (
              <div
                key={index}
                className={`flex items-start space-x-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer ${
                  isCompleted ? 'opacity-50' : ''
                }`}
                onClick={() => toggleAction(actionId)}
              >
                <Checkbox
                  checked={isCompleted}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {action.action}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-[10px] py-0">
                      {action.timeRequired}
                    </Badge>
                    <Badge
                      variant={action.impact === 'high' ? 'default' : 'secondary'}
                      className="text-[10px] py-0"
                    >
                      {action.impact} impact
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total time needed</span>
          <span className="font-semibold">{totalTime} min</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Daily Growth Actions</h3>
              <p className="text-sm text-muted-foreground">AI-powered tasks to grow your business today</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadActionPlan}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
            <p className="text-2xl font-bold">
              {completedCount}/{dailyActions.length}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / dailyActions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Time Needed</p>
            </div>
            <p className="text-2xl font-bold">{totalTime} min</p>
            <p className="text-xs text-muted-foreground mt-1">
              ~{Math.round(totalTime / 60 * 10) / 10} hours of focused work
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-muted-foreground">High Impact</p>
            </div>
            <p className="text-2xl font-bold">
              {dailyActions.filter(a => a.impact === 'high').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Priority actions today</p>
          </div>
        </div>
      </Card>

      {/* Daily Actions */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
            {dailyActions.length}
          </span>
          Today's Actions
        </h4>

        <div className="space-y-3">
          {dailyActions.map((action, index) => {
            const actionId = action.action;
            const isCompleted = completedActions.has(actionId);

            return (
              <div
                key={index}
                className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                  isCompleted ? 'bg-muted/30 border-green-200 dark:border-green-900' : ''
                }`}
                onClick={() => toggleAction(actionId)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isCompleted}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded ${
                          action.impact === 'high' ? 'bg-red-100 dark:bg-red-950 text-red-600' :
                          action.impact === 'medium' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600'
                        }`}>
                          {getActionIcon(action.category)}
                        </div>
                        <div>
                          <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {action.action}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {action.category.replace('_', ' ')}
                            </Badge>
                            <Badge
                              variant={action.impact === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {action.impact} impact
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {action.timeRequired}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Actions */}
      {actionPlan.weekly && actionPlan.weekly.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              {actionPlan.weekly.length}
            </span>
            This Week
          </h4>

          <div className="space-y-3">
            {actionPlan.weekly.slice(0, 3).map((action, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{action.action}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{action.timeRequired}</Badge>
                      <Badge variant={action.impact === 'high' ? 'destructive' : 'secondary'}>
                        {action.impact} impact
                      </Badge>
                    </div>
                  </div>
                </div>

                {action.deliverables.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Deliverables:</p>
                    <ul className="space-y-1">
                      {action.deliverables.map((deliverable, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start">
                          <ChevronRight className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          {deliverable}
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

      {/* Monthly Goals */}
      {actionPlan.monthly && actionPlan.monthly.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              {actionPlan.monthly.length}
            </span>
            This Month
          </h4>

          <div className="space-y-3">
            {actionPlan.monthly.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{action.action}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{action.timeRequired}</Badge>
                      <Badge variant={action.impact === 'high' ? 'destructive' : 'secondary'}>
                        {action.impact} impact
                      </Badge>
                    </div>
                  </div>
                </div>

                {action.metrics.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Success Metrics:</p>
                    <div className="flex flex-wrap gap-2">
                      {action.metrics.map((metric, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
