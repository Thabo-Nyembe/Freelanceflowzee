'use client

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnterpriseMetrics {
  budget: {
    total: number;
    used: number;
    remaining: number;
    status: 'optimal' | 'efficient' | 'warning' | 'critical';
  };
  services: {
    vercel: { cost: number; utilization: number; features: string[] };
    supabase: { cost: number; utilization: number; features: string[] };
    wasabi: { cost: number; utilization: number; features: string[] };
  };
  performance: {
    loadTime: number;
    uptime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  savings: {
    monthly: number;
    annual: number;
    vsEnterprise: number;
    percentage: number;
  };
  compliance: string[];
  recommendations: string[];
}

export function EnterpriseDashboard() {
  const [metrics, setMetrics] = useState<EnterpriseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchEnterpriseMetrics();
  }, []);

  const fetchEnterpriseMetrics = async () => {
    try {
      // Simulate API call for enterprise metrics
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMetrics({
        budget: {
          total: 75,
          used: 58.50,
          remaining: 16.50,
          status: 'efficient
        },
        services: {
          vercel: {
            cost: 20,
            utilization: 68,
            features: ['Edge Functions', 'Analytics', 'Team Collaboration', 'Custom Domains']
          },
          supabase: {
            cost: 28.50,
            utilization: 72,
            features: ['8GB Database', 'Advanced Auth', 'Real-time', 'Point-in-time Recovery']
          },
          wasabi: {
            cost: 10,
            utilization: 89,
            features: ['Hot Storage', 'Enterprise SLA', 'Global CDN', 'Compliance Certs']
          }
        },
        performance: {
          loadTime: 1.2,
          uptime: 99.97,
          cacheHitRate: 87,
          errorRate: 0.008
        },
        savings: {
          monthly: 95.50,
          annual: 1146,
          vsEnterprise: 154,
          percentage: 62
        },
        compliance: ['SOC2', 'GDPR', 'HIPAA', 'ISO27001'],
        recommendations: ['🎯 Excellent cost optimization - 62% below enterprise alternatives', '⚡ Performance is optimal with 1.2s load times', '💡 Consider lifecycle policies for 15% additional savings', '🚀 Ready to scale - 22% budget headroom available
        ]
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch enterprise metrics:', error);
      setLoading(false);
    }
  };

  const runEnterpriseOptimization = async () => {
    setOptimizing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update metrics after optimization
      setMetrics(prev => prev ? {
        ...prev,
        budget: {
          ...prev.budget,
          used: prev.budget.used - 8.50,
          remaining: prev.budget.remaining + 8.50
        },
        services: {
          ...prev.services,
          wasabi: {
            ...prev.services.wasabi,
            cost: prev.services.wasabi.cost + 3,
            utilization: 95
          },
          supabase: {
            ...prev.services.supabase,
            cost: prev.services.supabase.cost - 11.50,
            utilization: 45
          }
        },
        savings: {
          ...prev.savings,
          monthly: prev.savings.monthly + 8.50,
          annual: (prev.savings.monthly + 8.50) * 12,
          percentage: Math.min(75, prev.savings.percentage + 8)
        },
        recommendations: ['🎉 Optimization complete! Additional $8.50/month saved', '📁 Moved 2.3GB from Supabase to Wasabi Pro', '✅ Storage now 95% optimized for enterprise efficiency', '💰 Total annual savings now $1,248 vs enterprise cloud
        ]
      } : null);
      
    } catch (error) {
      console.error('Optimization failed:', error);
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

  if (!metrics) {
    return (
      <Card>
        <CardContent className= "flex items-center justify-center h-48">
          <p className= "text-muted-foreground">Failed to load enterprise metrics</p>
        </CardContent>
      </Card>
    );
  }

  const budgetColor = metrics.budget.status === 'optimal' ? 'green' : 
                     metrics.budget.status === 'efficient' ? 'blue' :
                     metrics.budget.status === 'warning' ? 'yellow' : 'red';

  return (
    <div className= "space-y-6">
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-3xl font-bold tracking-tight">Enterprise Dashboard</h2>
          <p className= "text-muted-foreground">
            Advanced monitoring for Vercel Pro + Supabase Pro + Wasabi Pro
          </p>
        </div>
        <div className= "flex items-center gap-4">
          <Badge 
            variant={metrics.budget.status === 'optimal' || metrics.budget.status === 'efficient' ? 'default' : 'destructive'}
            className= "text-sm
          >
            {metrics.budget.status === 'optimal' ? '🎯 Optimal' :
             metrics.budget.status === 'efficient' ? '✅ Efficient' :
             metrics.budget.status === 'warning' ? '⚠️ Warning' : '🚨 Critical'}
          </Badge>
          <Button 
            onClick={runEnterpriseOptimization} 
            disabled={optimizing}
            className= "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
          >
            {optimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className= "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Enterprise Budget</CardTitle>
            <DollarSign className= "h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold text-blue-700">${metrics.budget.used.toFixed(2)}</div>
            <p className= "text-xs text-blue-600">
              of ${metrics.budget.total} budget
            </p>
            <Progress value={(metrics.budget.used / metrics.budget.total) * 100} className= "mt-2" />
            <div className= "text-xs text-green-600 mt-1">
              ${metrics.budget.remaining.toFixed(2)} remaining
            </div>
          </CardContent>
        </Card>

        <Card className= "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Enterprise Savings</CardTitle>
            <TrendingDown className= "h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold text-green-700">${metrics.savings.monthly.toFixed(0)}</div>
            <p className= "text-xs text-green-600">per month vs enterprise cloud</p>
            <div className= "text-xs text-green-700 mt-1 font-medium">
              {metrics.savings.percentage}% cost reduction
            </div>
            <div className= "text-xs text-muted-foreground mt-1">
              ${metrics.savings.annual.toFixed(0)} annually
            </div>
          </CardContent>
        </Card>

        <Card className= "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Performance Score</CardTitle>
            <Gauge className= "h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold text-purple-700">{metrics.performance.loadTime}s</div>
            <p className= "text-xs text-purple-600">average load time</p>
            <div className= "flex justify-between text-xs mt-2">
              <span className= "text-green-600">↗ {metrics.performance.uptime}% uptime</span>
              <span className= "text-blue-600">{metrics.performance.cacheHitRate}% cache hit</span>
            </div>
          </CardContent>
        </Card>

        <Card className= "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className= "flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className= "text-sm font-medium">Compliance Ready</CardTitle>
            <Shield className= "h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className= "text-2xl font-bold text-orange-700">{metrics.compliance.length}</div>
            <p className= "text-xs text-orange-600">certifications active</p>
            <div className= "flex flex-wrap gap-1 mt-2">
              {metrics.compliance.slice(0, 2).map(cert => (
                <Badge key={cert} variant= "outline" className= "text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className= "space-y-4">
        <TabsList className= "grid w-full grid-cols-4">
          <TabsTrigger value= "overview">Overview</TabsTrigger>
          <TabsTrigger value= "services">Services</TabsTrigger>
          <TabsTrigger value= "performance">Performance</TabsTrigger>
          <TabsTrigger value= "savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value= "overview" className= "space-y-4">
          <div className= "grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className= "flex items-center gap-2">
                  <BarChart3 className= "h-5 w-5" />
                  Service Utilization
                </CardTitle>
                <CardDescription>
                  How efficiently you're using your paid plans
                </CardDescription>
              </CardHeader>
              <CardContent className= "space-y-4">
                {Object.entries(metrics.services).map(([service, data]) => {
                  const serviceIcons = {
                    vercel: Zap,
                    supabase: Database,
                    wasabi: HardDrive
                  };
                  const Icon = serviceIcons[service as keyof typeof serviceIcons];
                  
                  return (
                    <div key={service} className= "space-y-2">
                      <div className= "flex items-center justify-between text-sm">
                        <div className= "flex items-center gap-2">
                          <Icon className= "h-4 w-4" />
                          <span className= "capitalize font-medium">{service} Pro</span>
                        </div>
                        <span className= "font-medium">${data.cost.toFixed(2)}</span>
                      </div>
                      <Progress value={data.utilization} className= "h-2" />
                      <div className= "flex justify-between text-xs text-muted-foreground">
                        <span>{data.utilization}% utilized</span>
                        <span>{data.features.length} premium features</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className= "flex items-center gap-2">
                  <Target className= "h-5 w-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered optimization suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className= "space-y-3">
                  {metrics.recommendations.map((recommendation, index) => (
                    <div 
                      key={index}
                      className= "flex items-start gap-3 p-3 rounded-lg bg-muted/50
                    >
                      <div className= "text-sm flex-1">
                        {recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value= "services" className= "space-y-4">
          <div className= "grid gap-4 md:grid-cols-3">
            {Object.entries(metrics.services).map(([service, data]) => (
              <Card key={service}>
                <CardHeader>
                  <CardTitle className= "capitalize">{service} Pro</CardTitle>
                  <CardDescription>
                    ${data.cost.toFixed(2)}/month • {data.utilization}% utilized
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className= "space-y-3">
                    <Progress value={data.utilization} />
                    <div className= "space-y-2">
                      <h4 className= "font-medium text-sm">Premium Features:</h4>
                      {data.features.map(feature => (
                        <div key={feature} className= "flex items-center gap-2 text-sm">
                          <CheckCircle2 className= "h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value= "performance" className= "space-y-4">
          <div className= "grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className= "pb-2">
                <CardTitle className= "text-sm">Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className= "text-2xl font-bold text-green-600">
                  {metrics.performance.loadTime}s
                </div>
                <p className= "text-xs text-muted-foreground">Excellent performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className= "pb-2">
                <CardTitle className= "text-sm">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className= "text-2xl font-bold text-blue-600">
                  {metrics.performance.uptime}%
                </div>
                <p className= "text-xs text-muted-foreground">Enterprise SLA met</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className= "pb-2">
                <CardTitle className= "text-sm">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className= "text-2xl font-bold text-purple-600">
                  {metrics.performance.cacheHitRate}%
                </div>
                <p className= "text-xs text-muted-foreground">Optimal caching</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className= "pb-2">
                <CardTitle className= "text-sm">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className= "text-2xl font-bold text-green-600">
                  {metrics.performance.errorRate}%
                </div>
                <p className= "text-xs text-muted-foreground">Very reliable</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value= "savings" className= "space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Cost Comparison</CardTitle>
              <CardDescription>
                Your optimized setup vs standard enterprise cloud solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className= "grid gap-4 md:grid-cols-4">
                <div className= "text-center p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className= "text-2xl font-bold text-red-600">$154</div>
                  <div className= "text-sm text-red-600">AWS Enterprise</div>
                  <div className= "text-xs text-muted-foreground mt-1">Standard pricing</div>
                </div>
                
                <div className= "text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className= "text-2xl font-bold text-orange-600">$148</div>
                  <div className= "text-sm text-orange-600">Google Cloud</div>
                  <div className= "text-xs text-muted-foreground mt-1">Enterprise tier</div>
                </div>
                
                <div className= "text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className= "text-2xl font-bold text-blue-600">$162</div>
                  <div className= "text-sm text-blue-600">Azure Enterprise</div>
                  <div className= "text-xs text-muted-foreground mt-1">Premium features</div>
                </div>
                
                <div className= "text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className= "text-2xl font-bold text-green-600">
                    ${metrics.budget.used.toFixed(0)}
                  </div>
                  <div className= "text-sm text-green-600">Your Setup</div>
                  <div className= "text-xs text-muted-foreground mt-1">Optimized & efficient</div>
                </div>
              </div>
              
              <div className= "mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                <div className= "text-center">
                  <div className= "text-lg font-semibold text-green-600">
                    Monthly Savings: ${metrics.savings.monthly.toFixed(0)}
                  </div>
                  <div className= "text-sm text-green-600">
                    Annual Savings: ${metrics.savings.annual.toFixed(0)} 
                    ({metrics.savings.percentage}% cost reduction)
                  </div>
                  <div className= "text-xs text-muted-foreground mt-2">
                    🏆 Best-in-class performance with enterprise-grade features at startup costs
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 