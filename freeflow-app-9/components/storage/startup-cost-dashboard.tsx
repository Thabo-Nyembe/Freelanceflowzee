'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StartupCostData {
  currentSpend: number;
  monthlyBudget: number;
  budgetUsed: number;
  wasabiSavings: number;
  potentialSavings: number;
  optimizationScore: number;
  status: 'safe' | 'warning' | 'over_budget';
  breakdown: {
    storage: number;
    functions: number;
    bandwidth: number;
    database: number;
  };
  recommendations: string[];
}

export function StartupCostDashboard() {
  const [costData, setCostData] = useState<StartupCostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchCostData();
  }, []);

  const fetchCostData = async () => {
    try {
      // Simulate API call to fetch startup cost data
      // In production, this would call your cost monitoring API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCostData({
        currentSpend: 23.50,
        monthlyBudget: 50.00,
        budgetUsed: 47,
        wasabiSavings: 18.40,
        potentialSavings: 5.20,
        optimizationScore: 85,
        status: 'safe',
        breakdown: {
          storage: 8.50,   // Wasabi savings already applied
          functions: 12.00, // Optimized Vercel functions
          bandwidth: 2.50,  // Aggressive caching
          database: 0.50    // Supabase free tier
        },
        recommendations: [
          '✅ Great savings! You\'re 72% below standard cloud costs',
          '🚀 Consider scaling up - you have budget room', '💡 Move 3 more files to Wasabi for extra $2.10/month savings
        ]
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch cost data: ', error);'
      setLoading(false);
    }
  };

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update cost data with optimization results
      setCostData(prev => prev ? {
        ...prev,
        currentSpend: prev.currentSpend - 2.10,
        wasabiSavings: prev.wasabiSavings + 2.10,
        optimizationScore: Math.min(100, prev.optimizationScore + 5),
        potentialSavings: Math.max(0, prev.potentialSavings - 2.10),
        recommendations: ['🎉 Optimization complete! Moved 3 files to Wasabi', '💰 Additional $2.10/month saved', '✅ Storage now 95% optimized for startup budget
        ]
      } : null);
      
    } catch (error) {
      console.error('Optimization failed: ', error);'
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className= "space-y-6">
        <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className= "animate-pulse">
              <CardHeader className= "pb-2">
                <div className= "h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className= "h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!costData) {
    return (
      <Card>
        <CardContent className= "flex items-center justify-center h-48">
          <p className= "text-muted-foreground">Failed to load cost data</p>
        </CardContent>
      </Card>
    );
  }

  const budgetStatus = costData.status;
  const budgetColor = budgetStatus === 'safe' ? 'green' : budgetStatus === 'warning' ? 'yellow' : 'red';

  return (
    <div className= "space-y-6">
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-3xl font-bold tracking-tight">Startup Cost Dashboard</h2>
          <p className= "text-muted-foreground">
            Monitor and optimize your cloud costs for maximum startup savings
          </p>
        </div>
        <Badge 
          variant={budgetStatus === 'safe' ? 'default' : budgetStatus === 'warning' ? 'secondary' : 'destructive'}
          className="text-sm
        >"
          {budgetStatus === 'safe' ? '✅ Budget Healthy' : 
           budgetStatus === 'warning' ? '⚠️ Approaching Limit' : 
           '🚨 Over Budget'}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className= "h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold">${costData.currentSpend.toFixed(2)}</div>
            <p className= "text-xs text-muted-foreground">
              of ${costData.monthlyBudget.toFixed(2)} budget
            </p>
            <Progress value={costData.budgetUsed} className= "mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Wasabi Savings</CardTitle>
            <TrendingDown className= "h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold text-green-600">${costData.wasabiSavings.toFixed(2)}</div>
            <p className= "text-xs text-muted-foreground">
              vs standard cloud storage
            </p>
            <div className= "text-xs text-green-600 mt-1">
              72% cheaper than AWS S3
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Optimization Score</CardTitle>
            <Target className= "h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold">{costData.optimizationScore}%</div>
            <p className= "text-xs text-muted-foreground">
              startup optimized
            </p>
            <Progress value={costData.optimizationScore} className= "mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Potential Savings</CardTitle>
            <PiggyBank className= "h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold">${costData.potentialSavings.toFixed(2)}</div>
            <p className= "text-xs text-muted-foreground">
              available this month
            </p>
            {costData.potentialSavings > 0 && (
              <Button 
                size= "sm" 
                variant= "outline" 
                className="mt-2 text-xs
                onClick={runOptimization}
                disabled={optimizing}
              >"
                {optimizing ? 'Optimizing...' : 'Optimize Now'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <div className= "grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className= "flex items-center gap-2">
              <BarChart3 className= "h-5 w-5" />
              Cost Breakdown
            </CardTitle>
            <CardDescription>
              Current month spending by service
            </CardDescription>
          </CardHeader>
          <CardContent className= "space-y-4">
            {Object.entries(costData.breakdown).map(([service, cost]) => {
              const percentage = (cost / costData.currentSpend) * 100;
              const serviceIcons = {
                storage: HardDrive,
                functions: Zap,
                bandwidth: Cloud,
                database: CheckCircle
              };
              const Icon = serviceIcons[service as keyof typeof serviceIcons];
              
              return (
                <div key={service} className= "space-y-2">
                  <div className= "flex items-center justify-between text-sm">
                    <div className= "flex items-center gap-2">
                      <Icon className= "h-4 w-4" />
                      <span className= "capitalize">{service}</span>
                    </div>
                    <span className= "font-medium">${cost.toFixed(2)}</span>
                  </div>
                  <Progress value={percentage} className= "h-2" />
                  <div className= "text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% of total spend
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className= "flex items-center gap-2">
              {costData.recommendations.length > 0 ? (
                <AlertTriangle className= "h-5 w-5 text-yellow-600" />
              ) : (
                <CheckCircle className= "h-5 w-5 text-green-600" />
              )}
              Recommendations
            </CardTitle>
            <CardDescription>
              Ways to optimize your startup costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className= "space-y-3">
              {costData.recommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50
                >"
                  <div className= "text-sm flex-1">
                    {recommendation}
                  </div>
                </div>
              ))}
              
              {costData.recommendations.length === 0 && (
                <div className= "text-center text-muted-foreground py-4">
                  <CheckCircle className= "h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p>All optimizations applied!</p>
                  <p className= "text-sm">Your startup costs are fully optimized.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Annual Cost Projection</CardTitle>
          <CardDescription>
            Based on current usage and optimization level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className= "grid gap-4 md:grid-cols-3">
            <div className= "text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <div className= "text-2xl font-bold text-red-600">$1,200</div>
              <div className= "text-sm text-red-600">Standard Cloud</div>
              <div className= "text-xs text-muted-foreground mt-1">Without optimization</div>
            </div>
            
            <div className= "text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className= "text-2xl font-bold text-yellow-600">$600</div>
              <div className= "text-sm text-yellow-600">Basic Optimization</div>
              <div className= "text-xs text-muted-foreground mt-1">Some savings applied</div>
            </div>
            
            <div className= "text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className= "text-2xl font-bold text-green-600">
                ${(costData.currentSpend * 12).toFixed(0)}
              </div>
              <div className= "text-sm text-green-600">Startup Optimized</div>
              <div className= "text-xs text-muted-foreground mt-1">Your current setup</div>
            </div>
          </div>
          
          <div className= "mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className= "text-center">
              <div className= "text-lg font-semibold text-blue-600">
                Annual Savings: ${(1200 - (costData.currentSpend * 12)).toFixed(0)}
              </div>
              <div className= "text-sm text-blue-600">
                That's {Math.round(((1200 - (costData.currentSpend * 12)) / 1200) * 100)}% 
                savings compared to standard cloud costs!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 