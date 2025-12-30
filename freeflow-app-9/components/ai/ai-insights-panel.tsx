/**
 * AI Insights Panel
 *
 * Unified panel that shows all AI-powered insights
 * Can be embedded in any dashboard page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RevenueInsightsWidget } from './revenue-insights-widget';
import { GrowthActionsWidget } from './growth-actions-widget';
import { LeadScoringWidget } from './lead-scoring-widget';
import { Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { logger } from '@/lib/logger';

interface AIInsightsPanelProps {
  userId: string;
  defaultExpanded?: boolean;
  showHeader?: boolean;
  className?: string;
}

export function AIInsightsPanel({
  userId,
  defaultExpanded = true,
  showHeader = true,
  className = ''
}: AIInsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState('growth');

  // Mock data - replace with real data from your database
  const [revenueData, setRevenueData] = useState<any>(null);
  const [mockLeads, setMockLeads] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Startup Inc',
      industry: 'technology',
      email: 'sarah@techstartup.com',
      source: 'referral' as const,
      budget: 15000,
      projectDescription: 'Website redesign and branding',
      decisionMaker: true,
      painPoints: ['Outdated website', 'Poor conversion rate']
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Design Studio',
      industry: 'creative',
      email: 'michael@designstudio.com',
      source: 'inbound' as const,
      budget: 8000,
      projectDescription: 'Logo and brand identity',
      decisionMaker: true,
      painPoints: ['Need modern branding']
    },
    {
      id: '3',
      name: 'Emma Davis',
      company: 'E-commerce Co',
      industry: 'retail',
      email: 'emma@ecommerce.com',
      source: 'outbound' as const,
      budget: 12000,
      projectDescription: 'Product photography',
      decisionMaker: false
    }
  ]);

  const userProfile = {
    industry: 'creative_services',
    currentRevenue: 5000,
    targetRevenue: 15000,
    availableTimePerWeek: 20
  };

  useEffect(() => {
    // Load revenue data
    const mockRevenue = {
      userId: userId,
      timeframe: 'monthly' as const,
      totalRevenue: 50000,
      revenueBySource: {
        projects: 35000,
        retainers: 10000,
        passive: 5000,
        other: 0
      },
      revenueByClient: [
        { clientId: '1', clientName: 'Client A', revenue: 15000, projectCount: 3 },
        { clientId: '2', clientName: 'Client B', revenue: 12000, projectCount: 2 },
        { clientId: '3', clientName: 'Client C', revenue: 8000, projectCount: 1 }
      ],
      expenses: 15000,
      netProfit: 35000,
      currency: 'USD'
    };
    setRevenueData(mockRevenue);

    logger.info('AI Insights Panel initialized', { userId, activeTab });
  }, [userId]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    logger.info('AI Insights Panel toggled', {
      userId,
      isExpanded: !isExpanded
    });
  };

  if (!isExpanded) {
    return (
      <Card className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${className}`} onClick={toggleExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Business Intelligence</h3>
              <p className="text-sm text-muted-foreground">Click to expand insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Business Intelligence</h2>
                <p className="text-sm text-muted-foreground">
                  Real-time insights to grow your business
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden md:flex">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Claude & GPT-4
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="growth">
            <span className="hidden sm:inline">Daily </span>Growth
          </TabsTrigger>
          <TabsTrigger value="revenue">
            Revenue<span className="hidden sm:inline"> Insights</span>
          </TabsTrigger>
          <TabsTrigger value="leads">
            <span className="hidden sm:inline">Lead </span>Priority
          </TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="mt-4">
          <GrowthActionsWidget
            userId={userId}
            userProfile={userProfile}
          />
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          {revenueData && (
            <RevenueInsightsWidget
              userId={userId}
              revenueData={revenueData}
              showActions={true}
            />
          )}
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <LeadScoringWidget
            userId={userId}
            leads={mockLeads}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
