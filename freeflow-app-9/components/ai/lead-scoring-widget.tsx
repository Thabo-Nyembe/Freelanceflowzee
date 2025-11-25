/**
 * Lead Scoring Widget
 *
 * AI-powered lead qualification and prioritization
 * Shows which leads to focus on for maximum conversion
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGrowthAutomation } from '@/lib/hooks/use-growth-automation';
import type { Lead } from '@/lib/ai/growth-automation-engine';
import {
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  Mail,
  Phone,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface LeadScoringWidgetProps {
  userId: string;
  leads: Lead[];
  compact?: boolean;
  onLeadClick?: (lead: Lead) => void;
}

export function LeadScoringWidget({
  userId,
  leads,
  compact = false,
  onLeadClick
}: LeadScoringWidgetProps) {
  const { leadScores, isLoading, scoreLeads } = useGrowthAutomation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (leads.length > 0) {
      loadLeadScores();
    }
  }, [leads]);

  const loadLeadScores = async () => {
    setIsRefreshing(true);
    logger.info('Scoring leads with AI', { userId, leadCount: leads.length });

    try {
      await scoreLeads(leads);
      logger.info('Lead scoring complete', {
        userId,
        scoredCount: leadScores.length
      });
    } catch (error) {
      logger.error('Failed to score leads', { userId, error });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot':
        return 'text-red-600 bg-red-100 dark:bg-red-950';
      case 'warm':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-950';
      case 'cold':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-950';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'hot':
        return <AlertCircle className="h-4 w-4" />;
      case 'warm':
        return <TrendingUp className="h-4 w-4" />;
      case 'cold':
        return <Clock className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <div>
            <h3 className="font-semibold">Scoring Your Leads...</h3>
            <p className="text-sm text-muted-foreground">AI is analyzing {leads.length} leads</p>
          </div>
        </div>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">No Leads Yet</h3>
          <p className="text-sm text-muted-foreground">
            Add leads to get AI-powered scoring and prioritization
          </p>
        </div>
      </Card>
    );
  }

  if (leadScores.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">AI Lead Scoring</h3>
              <p className="text-sm text-muted-foreground">
                Score and prioritize {leads.length} leads
              </p>
            </div>
          </div>
          <Button onClick={loadLeadScores}>
            Score Leads
          </Button>
        </div>
      </Card>
    );
  }

  const hotLeads = leadScores.filter(l => l.priority === 'hot');
  const avgScore = leadScores.reduce((sum, l) => sum + l.score, 0) / leadScores.length;
  const totalValue = leadScores.reduce((sum, l) => sum + l.estimatedValue, 0);

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Lead Priority</h4>
          </div>
          <Button variant="ghost" size="sm" onClick={loadLeadScores}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {leadScores.slice(0, 3).map((leadScore) => {
            const lead = leads.find(l => l.id === leadScore.leadId);
            if (!lead) return null;

            return (
              <div
                key={leadScore.leadId}
                className="p-2 border rounded hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onLeadClick?.(lead)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm truncate">{lead.name}</p>
                  <Badge className={getPriorityColor(leadScore.priority)} variant="secondary">
                    {leadScore.score}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">${leadScore.estimatedValue.toLocaleString()}</span>
                  <span className="text-muted-foreground">{(leadScore.conversionProbability * 100).toFixed(0)}% prob</span>
                </div>
              </div>
            );
          })}
        </div>

        {hotLeads.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              🔥 {hotLeads.length} hot leads need attention
            </p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Lead Scoring</h3>
              <p className="text-sm text-muted-foreground">Intelligent lead prioritization and insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadLeadScores}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-score
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
            <p className="text-2xl font-bold">{leadScores.length}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">🔥 Hot Leads</p>
            <p className="text-2xl font-bold text-red-600">{hotLeads.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Priority contacts</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
            <p className="text-2xl font-bold text-green-600">{avgScore.toFixed(0)}/100</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Pipeline Value</p>
            <p className="text-2xl font-bold text-blue-600">${(totalValue / 1000).toFixed(0)}K</p>
          </div>
        </div>
      </Card>

      {/* Lead List */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Prioritized Leads</h4>

        <div className="space-y-3">
          {leadScores.map((leadScore) => {
            const lead = leads.find(l => l.id === leadScore.leadId);
            if (!lead) return null;

            return (
              <div
                key={leadScore.leadId}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onLeadClick?.(lead)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(leadScore.priority)}`}>
                      {getPriorityIcon(leadScore.priority)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-semibold">{lead.name}</h5>
                        {lead.company && (
                          <span className="text-sm text-muted-foreground">@ {lead.company}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(leadScore.priority)} variant="secondary">
                          {leadScore.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Score: {leadScore.score}/100
                        </Badge>
                        <Badge variant="outline">
                          {(leadScore.conversionProbability * 100).toFixed(0)}% conversion
                        </Badge>
                        {lead.industry && (
                          <Badge variant="secondary">{lead.industry}</Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {lead.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{lead.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="text-xs">${leadScore.estimatedValue.toLocaleString()} value</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{leadScore.timeToClose} days to close</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1">
                      {leadScore.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(leadScore.confidence * 100).toFixed(0)}% confident
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {leadScore.reasoning.strengths.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">
                          Strengths:
                        </p>
                        <ul className="space-y-0.5">
                          {leadScore.reasoning.strengths.slice(0, 2).map((strength, i) => (
                            <li key={i} className="text-xs text-green-800 dark:text-green-200">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {leadScore.reasoning.concerns.length > 0 && (
                  <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-900">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-orange-900 dark:text-orange-100 mb-1">
                          Concerns:
                        </p>
                        <ul className="space-y-0.5">
                          {leadScore.reasoning.concerns.slice(0, 2).map((concern, i) => (
                            <li key={i} className="text-xs text-orange-800 dark:text-orange-200">
                              • {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Action */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        💡 Next Best Action:
                      </p>
                      <p className="text-sm font-medium">{leadScore.nextBestAction}</p>
                    </div>
                    <Button size="sm" variant="default">
                      Take Action
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
