import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LRUCache } from 'lru-cache';
import { OpenAI } from 'openai';
import { createHash } from 'crypto';

// Initialize OpenAI for optimization recommendations
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize cache for storing recent metrics to detect anomalies
// without excessive database queries
const metricsCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 15, // 15 minutes
});

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Alert thresholds
const ALERT_THRESHOLDS = {
  responseTime: 500, // ms
  errorRate: 0.05, // 5%
  cpuUsage: 80, // 80%
  memoryUsage: 80, // 80%
  pageLoadTime: 3000, // ms
  apiErrorRate: 0.02, // 2%
  databaseQueryTime: 200, // ms
  bounceRate: 0.6, // 60%
};

// Define validation schema for performance metrics
const PerformanceMetricsSchema = z.object({
  // 1. Real-time Performance Metrics
  performanceMetrics: z.object({
    responseTime: z.number().nonnegative(),
    throughput: z.number().nonnegative(),
    errorRate: z.number().min(0).max(1),
    statusCodes: z.record(z.string(), z.number()),
    endpoint: z.string().optional(),
    method: z.string().optional(),
  }),

  // 2. User Experience Analytics
  userExperience: z.object({
    pageLoadTime: z.number().nonnegative(),
    firstContentfulPaint: z.number().nonnegative(),
    largestContentfulPaint: z.number().nonnegative(),
    firstInputDelay: z.number().nonnegative(),
    cumulativeLayoutShift: z.number().nonnegative(),
    interactions: z.array(z.object({
      elementId: z.string(),
      eventType: z.string(),
      timestamp: z.number(),
      duration: z.number().optional(),
    })).optional(),
    bounceRate: z.number().min(0).max(1).optional(),
    sessionDuration: z.number().nonnegative().optional(),
    pageUrl: z.string(),
  }),

  // 3. Resource Monitoring
  resourceUsage: z.object({
    cpuUsage: z.number().min(0).max(100),
    memoryUsage: z.number().min(0).max(100),
    memoryAllocated: z.number().nonnegative(),
    memoryFree: z.number().nonnegative(),
    databaseConnections: z.number().nonnegative().optional(),
    databaseQueryTime: z.number().nonnegative().optional(),
    databaseCpuUsage: z.number().min(0).max(100).optional(),
    networkBandwidth: z.number().nonnegative().optional(),
    diskUsage: z.number().min(0).max(100).optional(),
  }),

  // 4. Error Tracking
  errors: z.array(z.object({
    message: z.string(),
    stack: z.string().optional(),
    componentName: z.string().optional(),
    userId: z.string().optional(),
    timestamp: z.number(),
    browserInfo: z.object({
      name: z.string().optional(),
      version: z.string().optional(),
      os: z.string().optional(),
      device: z.string().optional(),
    }).optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })).optional(),

  // 5. Business Metrics
  businessMetrics: z.object({
    userEngagement: z.number().min(0).max(1).optional(),
    conversionRate: z.number().min(0).max(1).optional(),
    featureAdoption: z.record(z.string(), z.number().min(0).max(1)).optional(),
    activeUsers: z.number().nonnegative().optional(),
    revenueGenerated: z.number().nonnegative().optional(),
    subscriptionTier: z.string().optional(),
    userRetention: z.number().min(0).max(1).optional(),
  }).optional(),

  // Metadata
  metadata: z.object({
    timestamp: z.number(),
    userId: z.string().optional(),
    sessionId: z.string(),
    environment: z.enum(['development', 'staging', 'production']),
    version: z.string(),
    instanceId: z.string().optional(),
    region: z.string().optional(),
  }),
});

type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// Health check response type
type HealthCheckResponse = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      endpoints: Record<string, {
        status: 'healthy' | 'degraded' | 'unhealthy';
        responseTime: number;
        errorRate: number;
      }>;
    };
    storage: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage: number;
    };
    cache: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      hitRate: number;
    };
    authentication: {
      status: 'healthy' | 'degraded' | 'unhealthy';
    };
  };
  uptime: number;
  message?: string;
};

// Alert type
type Alert = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metric: {
    name: string;
    value: number;
    threshold: number;
  };
  metadata: Record<string, any>;
  status: 'active' | 'acknowledged' | 'resolved';
};

// Optimization recommendation type
type OptimizationRecommendation = {
  id: string;
  category: 'performance' | 'resource' | 'user_experience' | 'error' | 'business';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  metrics: {
    name: string;
    current: number;
    target: number;
    improvement: number;
  }[];
  implementationSteps: string[];
  createdAt: number;
};

/**
 * Check authentication and permissions
 */
async function checkAuth(req: NextRequest) {
  // Get session from NextAuth
  const session = await getServerSession(authOptions);
  
  // Check API key for service-to-service communication
  const apiKey = req.headers.get('x-api-key');
  const validApiKey = process.env.PERFORMANCE_MONITORING_API_KEY;
  
  if (!session && (!apiKey || apiKey !== validApiKey)) {
    return false;
  }
  
  // If using API key, no further checks needed
  if (apiKey === validApiKey) {
    return true;
  }
  
  // For user sessions, check permissions
  if (session) {
    // @ts-ignore - user role exists in our extended session type
    const userRole = session.user?.role;
    if (!userRole || !['admin', 'engineer', 'manager'].includes(userRole)) {
      return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Apply rate limiting
 */
async function applyRateLimit(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await limiter.check(10, ip); // 10 requests per minute per IP
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Process and store metrics
 */
async function processMetrics(metrics: PerformanceMetrics) {
  try {
    // Store metrics in Supabase
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert({
        metrics: metrics,
        created_at: new Date().toISOString(),
      });
      
    if (error) {
      console.error('Error storing metrics:', error);
      return false;
    }
    
    // Update cache for anomaly detection
    const cacheKey = `${metrics.metadata.userId || 'anonymous'}-${metrics.metadata.sessionId}`;
    metricsCache.set(cacheKey, metrics);
    
    // Check for alerts
    const alerts = checkForAlerts(metrics);
    if (alerts.length > 0) {
      await storeAndSendAlerts(alerts);
    }
    
    return true;
  } catch (error) {
    console.error('Error processing metrics:', error);
    return false;
  }
}

/**
 * Check for performance alerts based on thresholds
 */
function checkForAlerts(metrics: PerformanceMetrics): Alert[] {
  const alerts: Alert[] = [];
  const timestamp = Date.now();
  
  // Check response time
  if (metrics.performanceMetrics.responseTime > ALERT_THRESHOLDS.responseTime) {
    alerts.push({
      id: createHash('md5').update(`response_time_${timestamp}`).digest('hex'),
      type: 'response_time_exceeded',
      severity: metrics.performanceMetrics.responseTime > ALERT_THRESHOLDS.responseTime * 2 ? 'high' : 'medium',
      message: `Response time exceeded threshold: ${metrics.performanceMetrics.responseTime}ms vs ${ALERT_THRESHOLDS.responseTime}ms threshold`,
      timestamp,
      metric: {
        name: 'responseTime',
        value: metrics.performanceMetrics.responseTime,
        threshold: ALERT_THRESHOLDS.responseTime,
      },
      metadata: {
        endpoint: metrics.performanceMetrics.endpoint,
        method: metrics.performanceMetrics.method,
      },
      status: 'active',
    });
  }
  
  // Check error rate
  if (metrics.performanceMetrics.errorRate > ALERT_THRESHOLDS.errorRate) {
    alerts.push({
      id: createHash('md5').update(`error_rate_${timestamp}`).digest('hex'),
      type: 'error_rate_exceeded',
      severity: metrics.performanceMetrics.errorRate > ALERT_THRESHOLDS.errorRate * 2 ? 'critical' : 'high',
      message: `Error rate exceeded threshold: ${(metrics.performanceMetrics.errorRate * 100).toFixed(2)}% vs ${(ALERT_THRESHOLDS.errorRate * 100).toFixed(2)}% threshold`,
      timestamp,
      metric: {
        name: 'errorRate',
        value: metrics.performanceMetrics.errorRate,
        threshold: ALERT_THRESHOLDS.errorRate,
      },
      metadata: {
        endpoint: metrics.performanceMetrics.endpoint,
        method: metrics.performanceMetrics.method,
      },
      status: 'active',
    });
  }
  
  // Check CPU usage
  if (metrics.resourceUsage.cpuUsage > ALERT_THRESHOLDS.cpuUsage) {
    alerts.push({
      id: createHash('md5').update(`cpu_usage_${timestamp}`).digest('hex'),
      type: 'cpu_usage_exceeded',
      severity: metrics.resourceUsage.cpuUsage > 90 ? 'critical' : 'high',
      message: `CPU usage exceeded threshold: ${metrics.resourceUsage.cpuUsage.toFixed(2)}% vs ${ALERT_THRESHOLDS.cpuUsage}% threshold`,
      timestamp,
      metric: {
        name: 'cpuUsage',
        value: metrics.resourceUsage.cpuUsage,
        threshold: ALERT_THRESHOLDS.cpuUsage,
      },
      metadata: {
        instanceId: metrics.metadata.instanceId,
        region: metrics.metadata.region,
      },
      status: 'active',
    });
  }
  
  // Check memory usage
  if (metrics.resourceUsage.memoryUsage > ALERT_THRESHOLDS.memoryUsage) {
    alerts.push({
      id: createHash('md5').update(`memory_usage_${timestamp}`).digest('hex'),
      type: 'memory_usage_exceeded',
      severity: metrics.resourceUsage.memoryUsage > 90 ? 'critical' : 'high',
      message: `Memory usage exceeded threshold: ${metrics.resourceUsage.memoryUsage.toFixed(2)}% vs ${ALERT_THRESHOLDS.memoryUsage}% threshold`,
      timestamp,
      metric: {
        name: 'memoryUsage',
        value: metrics.resourceUsage.memoryUsage,
        threshold: ALERT_THRESHOLDS.memoryUsage,
      },
      metadata: {
        instanceId: metrics.metadata.instanceId,
        region: metrics.metadata.region,
        memoryAllocated: metrics.resourceUsage.memoryAllocated,
        memoryFree: metrics.resourceUsage.memoryFree,
      },
      status: 'active',
    });
  }
  
  // Check page load time
  if (metrics.userExperience.pageLoadTime > ALERT_THRESHOLDS.pageLoadTime) {
    alerts.push({
      id: createHash('md5').update(`page_load_time_${timestamp}`).digest('hex'),
      type: 'page_load_time_exceeded',
      severity: metrics.userExperience.pageLoadTime > ALERT_THRESHOLDS.pageLoadTime * 2 ? 'high' : 'medium',
      message: `Page load time exceeded threshold: ${metrics.userExperience.pageLoadTime}ms vs ${ALERT_THRESHOLDS.pageLoadTime}ms threshold`,
      timestamp,
      metric: {
        name: 'pageLoadTime',
        value: metrics.userExperience.pageLoadTime,
        threshold: ALERT_THRESHOLDS.pageLoadTime,
      },
      metadata: {
        pageUrl: metrics.userExperience.pageUrl,
        fcp: metrics.userExperience.firstContentfulPaint,
        lcp: metrics.userExperience.largestContentfulPaint,
      },
      status: 'active',
    });
  }
  
  // Check database query time if available
  if (metrics.resourceUsage.databaseQueryTime && 
      metrics.resourceUsage.databaseQueryTime > ALERT_THRESHOLDS.databaseQueryTime) {
    alerts.push({
      id: createHash('md5').update(`db_query_time_${timestamp}`).digest('hex'),
      type: 'database_query_time_exceeded',
      severity: metrics.resourceUsage.databaseQueryTime > ALERT_THRESHOLDS.databaseQueryTime * 2 ? 'high' : 'medium',
      message: `Database query time exceeded threshold: ${metrics.resourceUsage.databaseQueryTime}ms vs ${ALERT_THRESHOLDS.databaseQueryTime}ms threshold`,
      timestamp,
      metric: {
        name: 'databaseQueryTime',
        value: metrics.resourceUsage.databaseQueryTime,
        threshold: ALERT_THRESHOLDS.databaseQueryTime,
      },
      metadata: {
        databaseConnections: metrics.resourceUsage.databaseConnections,
        databaseCpuUsage: metrics.resourceUsage.databaseCpuUsage,
      },
      status: 'active',
    });
  }
  
  // Check bounce rate if available
  if (metrics.userExperience.bounceRate && 
      metrics.userExperience.bounceRate > ALERT_THRESHOLDS.bounceRate) {
    alerts.push({
      id: createHash('md5').update(`bounce_rate_${timestamp}`).digest('hex'),
      type: 'bounce_rate_exceeded',
      severity: 'medium',
      message: `Bounce rate exceeded threshold: ${(metrics.userExperience.bounceRate * 100).toFixed(2)}% vs ${(ALERT_THRESHOLDS.bounceRate * 100).toFixed(2)}% threshold`,
      timestamp,
      metric: {
        name: 'bounceRate',
        value: metrics.userExperience.bounceRate,
        threshold: ALERT_THRESHOLDS.bounceRate,
      },
      metadata: {
        pageUrl: metrics.userExperience.pageUrl,
      },
      status: 'active',
    });
  }
  
  return alerts;
}

/**
 * Store alerts and send notifications
 */
async function storeAndSendAlerts(alerts: Alert[]) {
  try {
    // Store alerts in Supabase
    const { error } = await supabase
      .from('performance_alerts')
      .insert(alerts.map(alert => ({
        alert_id: alert.id,
        alert_type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: new Date(alert.timestamp).toISOString(),
        metric_name: alert.metric.name,
        metric_value: alert.metric.value,
        metric_threshold: alert.metric.threshold,
        metadata: alert.metadata,
        status: alert.status,
      })));
      
    if (error) {
      console.error('Error storing alerts:', error);
    }
    
    // Send critical and high severity alerts to notification channels
    const criticalAlerts = alerts.filter(alert => 
      ['critical', 'high'].includes(alert.severity)
    );
    
    if (criticalAlerts.length > 0) {
      await sendAlertNotifications(criticalAlerts);
    }
  } catch (error) {
    console.error('Error processing alerts:', error);
  }
}

/**
 * Send alert notifications to configured channels
 */
async function sendAlertNotifications(alerts: Alert[]) {
  try {
    // Send to Slack if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *KAZI Platform Alert${alerts.length > 1 ? 's' : ''}*`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `🚨 KAZI Platform Alert${alerts.length > 1 ? 's' : ''}`,
                emoji: true
              }
            },
            ...alerts.map(alert => ({
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Type:* ${alert.type}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Severity:* ${alert.severity.toUpperCase()}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Message:* ${alert.message}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Time:* <!date^${Math.floor(alert.timestamp / 1000)}^{date_short_pretty} at {time}|${new Date(alert.timestamp).toISOString()}>`
                }
              ]
            }))
          ]
        })
      });
      
      if (!response.ok) {
        console.error('Error sending Slack notification:', await response.text());
      }
    }
    
    // Send to PagerDuty if configured
    if (process.env.PAGERDUTY_ROUTING_KEY) {
      for (const alert of alerts) {
        const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routing_key: process.env.PAGERDUTY_ROUTING_KEY,
            event_action: 'trigger',
            payload: {
              summary: alert.message,
              source: 'KAZI Platform',
              severity: alert.severity,
              timestamp: new Date(alert.timestamp).toISOString(),
              custom_details: {
                metric_name: alert.metric.name,
                metric_value: alert.metric.value,
                metric_threshold: alert.metric.threshold,
                ...alert.metadata
              }
            }
          })
        });
        
        if (!response.ok) {
          console.error('Error sending PagerDuty alert:', await response.text());
        }
      }
    }
    
    // Send email alerts if configured
    if (process.env.ALERT_EMAIL_RECIPIENTS) {
      // Implementation would depend on your email service
      // This is a placeholder for the email sending logic
      console.log('Would send email alerts to:', process.env.ALERT_EMAIL_RECIPIENTS);
    }
  } catch (error) {
    console.error('Error sending alert notifications:', error);
  }
}

/**
 * Generate optimization recommendations using AI
 */
async function generateOptimizationRecommendations(metrics: PerformanceMetrics[]): Promise<OptimizationRecommendation[]> {
  try {
    // Extract relevant metrics for analysis
    const analysisData = metrics.map(metric => ({
      responseTime: metric.performanceMetrics.responseTime,
      errorRate: metric.performanceMetrics.errorRate,
      cpuUsage: metric.resourceUsage.cpuUsage,
      memoryUsage: metric.resourceUsage.memoryUsage,
      pageLoadTime: metric.userExperience.pageLoadTime,
      firstContentfulPaint: metric.userExperience.firstContentfulPaint,
      largestContentfulPaint: metric.userExperience.largestContentfulPaint,
      cumulativeLayoutShift: metric.userExperience.cumulativeLayoutShift,
      databaseQueryTime: metric.resourceUsage.databaseQueryTime,
      timestamp: metric.metadata.timestamp,
    }));
    
    // Calculate averages and identify problematic areas
    const avgResponseTime = analysisData.reduce((sum, data) => sum + data.responseTime, 0) / analysisData.length;
    const avgPageLoadTime = analysisData.reduce((sum, data) => sum + data.pageLoadTime, 0) / analysisData.length;
    const avgCpuUsage = analysisData.reduce((sum, data) => sum + data.cpuUsage, 0) / analysisData.length;
    const avgMemoryUsage = analysisData.reduce((sum, data) => sum + data.memoryUsage, 0) / analysisData.length;
    const avgErrorRate = analysisData.reduce((sum, data) => sum + data.errorRate, 0) / analysisData.length;
    
    // Identify problem areas
    const problemAreas = [];
    if (avgResponseTime > ALERT_THRESHOLDS.responseTime * 0.8) problemAreas.push('api_performance');
    if (avgPageLoadTime > ALERT_THRESHOLDS.pageLoadTime * 0.8) problemAreas.push('frontend_performance');
    if (avgCpuUsage > ALERT_THRESHOLDS.cpuUsage * 0.8) problemAreas.push('cpu_usage');
    if (avgMemoryUsage > ALERT_THRESHOLDS.memoryUsage * 0.8) problemAreas.push('memory_usage');
    if (avgErrorRate > ALERT_THRESHOLDS.errorRate * 0.8) problemAreas.push('error_rate');
    
    // If no obvious problems, return empty recommendations
    if (problemAreas.length === 0) {
      return [];
    }
    
    // Generate recommendations using OpenAI
    const recommendations: OptimizationRecommendation[] = [];
    
    // Only call OpenAI if API key is configured
    if (process.env.OPENAI_API_KEY) {
      for (const area of problemAreas) {
        const prompt = `
          As a performance optimization expert for web applications, provide specific recommendations to improve the following performance issue in the KAZI platform:
          
          Issue Area: ${area.replace('_', ' ')}
          
          Current Metrics:
          - Average Response Time: ${avgResponseTime.toFixed(2)}ms
          - Average Page Load Time: ${avgPageLoadTime.toFixed(2)}ms
          - Average CPU Usage: ${avgCpuUsage.toFixed(2)}%
          - Average Memory Usage: ${avgMemoryUsage.toFixed(2)}%
          - Average Error Rate: ${(avgErrorRate * 100).toFixed(2)}%
          
          Provide 3 specific, actionable recommendations to improve this issue. For each recommendation, include:
          1. A clear title
          2. A detailed description of what to implement
          3. The expected impact (low/medium/high)
          4. The implementation effort required (low/medium/high)
          5. Specific implementation steps
          6. Expected improvement metrics
          
          Format your response as JSON with the following structure for each recommendation:
          {
            "title": "Recommendation title",
            "description": "Detailed description",
            "impact": "low|medium|high",
            "effort": "low|medium|high",
            "metrics": [
              {
                "name": "metric name",
                "current": current value,
                "target": target value,
                "improvement": improvement percentage
              }
            ],
            "implementationSteps": ["Step 1", "Step 2", "Step 3"]
          }
        `;
        
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
        });
        
        try {
          const content = response.choices[0].message.content;
          if (content) {
            // Extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsedRecommendations = JSON.parse(jsonMatch[0]);
              
              // Format the recommendation
              const recommendation: OptimizationRecommendation = {
                id: createHash('md5').update(`${area}_${Date.now()}`).digest('hex'),
                category: area.includes('frontend') ? 'user_experience' : 
                         area.includes('error') ? 'error' : 
                         area.includes('cpu') || area.includes('memory') ? 'resource' : 'performance',
                title: parsedRecommendations.title,
                description: parsedRecommendations.description,
                impact: parsedRecommendations.impact,
                effort: parsedRecommendations.effort,
                metrics: parsedRecommendations.metrics,
                implementationSteps: parsedRecommendations.implementationSteps,
                createdAt: Date.now(),
              };
              
              recommendations.push(recommendation);
            }
          }
        } catch (error) {
          console.error('Error parsing AI recommendation:', error);
        }
      }
    } else {
      // Fallback to static recommendations if OpenAI is not configured
      for (const area of problemAreas) {
        let recommendation: OptimizationRecommendation;
        
        switch (area) {
          case 'api_performance':
            recommendation = {
              id: createHash('md5').update(`api_performance_${Date.now()}`).digest('hex'),
              category: 'performance',
              title: 'Implement API Response Caching',
              description: 'Add Redis caching for frequently accessed API endpoints to reduce response times and database load.',
              impact: 'high',
              effort: 'medium',
              metrics: [
                {
                  name: 'responseTime',
                  current: avgResponseTime,
                  target: avgResponseTime * 0.5,
                  improvement: 50
                }
              ],
              implementationSteps: [
                'Identify frequently accessed endpoints',
                'Set up Redis cache with appropriate TTL',
                'Implement cache-control headers',
                'Add cache invalidation on data updates'
              ],
              createdAt: Date.now(),
            };
            break;
            
          case 'frontend_performance':
            recommendation = {
              id: createHash('md5').update(`frontend_performance_${Date.now()}`).digest('hex'),
              category: 'user_experience',
              title: 'Optimize Image Loading Strategy',
              description: 'Implement lazy loading, responsive images, and WebP format to improve page load times.',
              impact: 'high',
              effort: 'medium',
              metrics: [
                {
                  name: 'pageLoadTime',
                  current: avgPageLoadTime,
                  target: avgPageLoadTime * 0.7,
                  improvement: 30
                },
                {
                  name: 'largestContentfulPaint',
                  current: analysisData[0].largestContentfulPaint,
                  target: analysisData[0].largestContentfulPaint * 0.7,
                  improvement: 30
                }
              ],
              implementationSteps: [
                'Add loading="lazy" attribute to below-the-fold images',
                'Implement responsive images with srcset',
                'Convert images to WebP format with fallbacks',
                'Use next/image component with priority for above-the-fold images'
              ],
              createdAt: Date.now(),
            };
            break;
            
          case 'cpu_usage':
            recommendation = {
              id: createHash('md5').update(`cpu_usage_${Date.now()}`).digest('hex'),
              category: 'resource',
              title: 'Optimize Background Processing',
              description: 'Move CPU-intensive tasks to background workers and implement better concurrency control.',
              impact: 'high',
              effort: 'high',
              metrics: [
                {
                  name: 'cpuUsage',
                  current: avgCpuUsage,
                  target: avgCpuUsage * 0.7,
                  improvement: 30
                }
              ],
              implementationSteps: [
                'Identify CPU-intensive operations',
                'Implement queue-based processing with Bull/Redis',
                'Set up worker processes with appropriate concurrency',
                'Add monitoring and auto-scaling for worker pools'
              ],
              createdAt: Date.now(),
            };
            break;
            
          case 'memory_usage':
            recommendation = {
              id: createHash('md5').update(`memory_usage_${Date.now()}`).digest('hex'),
              category: 'resource',
              title: 'Fix Memory Leaks and Optimize Memory Usage',
              description: 'Identify and fix memory leaks in the application and optimize memory-intensive operations.',
              impact: 'high',
              effort: 'medium',
              metrics: [
                {
                  name: 'memoryUsage',
                  current: avgMemoryUsage,
                  target: avgMemoryUsage * 0.7,
                  improvement: 30
                }
              ],
              implementationSteps: [
                'Run memory profiling to identify leaks',
                'Fix component unmounting and event listener cleanup',
                'Implement pagination for large data sets',
                'Optimize state management to reduce memory footprint'
              ],
              createdAt: Date.now(),
            };
            break;
            
          case 'error_rate':
            recommendation = {
              id: createHash('md5').update(`error_rate_${Date.now()}`).digest('hex'),
              category: 'error',
              title: 'Implement Comprehensive Error Handling',
              description: 'Add robust error boundaries, input validation, and graceful fallbacks to reduce error rates.',
              impact: 'high',
              effort: 'medium',
              metrics: [
                {
                  name: 'errorRate',
                  current: avgErrorRate,
                  target: avgErrorRate * 0.5,
                  improvement: 50
                }
              ],
              implementationSteps: [
                'Add React Error Boundaries around critical components',
                'Implement comprehensive input validation',
                'Add retry logic for network requests',
                'Create fallback UI states for error conditions'
              ],
              createdAt: Date.now(),
            };
            break;
            
          default:
            recommendation = {
              id: createHash('md5').update(`general_${Date.now()}`).digest('hex'),
              category: 'performance',
              title: 'General Performance Optimization',
              description: 'Implement general performance best practices to improve overall system performance.',
              impact: 'medium',
              effort: 'medium',
              metrics: [
                {
                  name: 'responseTime',
                  current: avgResponseTime,
                  target: avgResponseTime * 0.8,
                  improvement: 20
                },
                {
                  name: 'pageLoadTime',
                  current: avgPageLoadTime,
                  target: avgPageLoadTime * 0.8,
                  improvement: 20
                }
              ],
              implementationSteps: [
                'Audit and optimize database queries',
                'Implement code splitting and lazy loading',
                'Optimize third-party dependencies',
                'Set up performance monitoring alerts'
              ],
              createdAt: Date.now(),
            };
        }
        
        recommendations.push(recommendation);
      }
    }
    
    // Store recommendations in database
    await storeOptimizationRecommendations(recommendations);
    
    return recommendations;
  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
    return [];
  }
}

/**
 * Store optimization recommendations in database
 */
async function storeOptimizationRecommendations(recommendations: OptimizationRecommendation[]) {
  try {
    if (recommendations.length === 0) return;
    
    const { error } = await supabase
      .from('optimization_recommendations')
      .insert(recommendations.map(rec => ({
        recommendation_id: rec.id,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        impact: rec.impact,
        effort: rec.effort,
        metrics: rec.metrics,
        implementation_steps: rec.implementationSteps,
        created_at: new Date(rec.createdAt).toISOString(),
        status: 'pending',
      })));
      
    if (error) {
      console.error('Error storing optimization recommendations:', error);
    }
  } catch (error) {
    console.error('Error storing optimization recommendations:', error);
  }
}

/**
 * Perform system health check
 */
async function performHealthCheck(): Promise<HealthCheckResponse> {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    const dbStartTime = Date.now();
    const { data: dbData, error: dbError } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1);
    const dbResponseTime = Date.now() - dbStartTime;
    
    // Check API endpoints
    const apiEndpoints: Record<string, {
      status: 'healthy' | 'degraded' | 'unhealthy';
      responseTime: number;
      errorRate: number;
    }> = {};
    
    // Get API health data from cache or database
    const { data: apiHealthData } = await supabase
      .from('api_health')
      .select('endpoint, status, response_time, error_rate')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (apiHealthData) {
      for (const endpoint of apiHealthData) {
        apiEndpoints[endpoint.endpoint] = {
          status: endpoint.status,
          responseTime: endpoint.response_time,
          errorRate: endpoint.error_rate,
        };
      }
    }
    
    // Check storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .getBucket('uploads');
    
    // Check authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    // Calculate overall status
    const dbStatus = !dbError ? 'healthy' : 'unhealthy';
    const storageStatus = !storageError ? 'healthy' : 'unhealthy';
    const authStatus = !authError ? 'healthy' : 'unhealthy';
    
    // Calculate API status
    const apiStatusValues = Object.values(apiEndpoints).map(e => e.status);
    const apiStatus = apiStatusValues.every(s => s === 'healthy') ? 'healthy' :
                     apiStatusValues.some(s => s === 'unhealthy') ? 'unhealthy' : 'degraded';
    
    // Calculate overall status
    const overallStatus = [dbStatus, apiStatus, storageStatus, authStatus].every(s => s === 'healthy') ? 'healthy' :
                         [dbStatus, apiStatus, storageStatus, authStatus].some(s => s === 'unhealthy') ? 'unhealthy' : 'degraded';
    
    // Get uptime from environment or default to 0
    const uptime = process.env.DEPLOYMENT_TIMESTAMP ? 
      Date.now() - parseInt(process.env.DEPLOYMENT_TIMESTAMP) : 
      0;
    
    return {
      status: overallStatus,
      timestamp: Date.now(),
      version: process.env.APP_VERSION || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        api: {
          status: apiStatus,
          endpoints: apiEndpoints,
        },
        storage: {
          status: storageStatus,
          usage: storageData?.size || 0,
        },
        cache: {
          status: 'healthy', // Placeholder - would need actual cache metrics
          hitRate: 0.95, // Placeholder
        },
        authentication: {
          status: authStatus,
        },
      },
      uptime,
      message: overallStatus === 'healthy' ? 'All systems operational' : 
              overallStatus === 'degraded' ? 'Some systems experiencing degraded performance' :
              'Critical system components are down',
    };
  } catch (error) {
    console.error('Error performing health check:', error);
    return {
      status: 'unhealthy',
      timestamp: Date.now(),
      version: process.env.APP_VERSION || '1.0.0',
      services: {
        database: {
          status: 'unhealthy',
          responseTime: 0,
        },
        api: {
          status: 'unhealthy',
          endpoints: {},
        },
        storage: {
          status: 'unhealthy',
          usage: 0,
        },
        cache: {
          status: 'unhealthy',
          hitRate: 0,
        },
        authentication: {
          status: 'unhealthy',
        },
      },
      uptime: 0,
      message: 'Health check failed to complete',
    };
  }
}

/**
 * POST handler for submitting performance metrics
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(req);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Apply rate limiting
    const isRateLimitOk = await applyRateLimit(req);
    if (!isRateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    
    try {
      const metrics = PerformanceMetricsSchema.parse(body);
      
      // Process and store metrics
      const success = await processMetrics(metrics);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to process metrics' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: true, message: 'Metrics received and processed' },
        { status: 200 }
      );
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid metrics format', details: validationError },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for retrieving performance metrics and recommendations
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth(req);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Apply rate limiting
    const isRateLimitOk = await applyRateLimit(req);
    if (!isRateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'metrics';
    const period = url.searchParams.get('period') || '24h';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    // Handle health check requests
    if (type === 'health') {
      const healthData = await performHealthCheck();
      return NextResponse.json(healthData);
    }
    
    // Calculate time range based on period
    const now = new Date();
    let startTime: Date;
    
    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Handle different data type requests
    switch (type) {
      case 'metrics': {
        // Retrieve metrics from database
        const { data, error } = await supabase
          .from('performance_metrics')
          .select('metrics, created_at')
          .gte('created_at', startTime.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) {
          console.error('Error retrieving metrics:', error);
          return NextResponse.json(
            { error: 'Failed to retrieve metrics' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          metrics: data.map(item => ({
            ...item.metrics,
            timestamp: new Date(item.created_at).getTime()
          }))
        });
      }
      
      case 'alerts': {
        // Retrieve alerts from database
        const { data, error } = await supabase
          .from('performance_alerts')
          .select('*')
          .gte('timestamp', startTime.toISOString())
          .order('timestamp', { ascending: false })
          .limit(limit);
          
        if (error) {
          console.error('Error retrieving alerts:', error);
          return NextResponse.json(
            { error: 'Failed to retrieve alerts' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ alerts: data });
      }
      
      case 'recommendations': {
        // Retrieve recent metrics for generating recommendations
        const { data: metricsData, error: metricsError } = await supabase
          .from('performance_metrics')
          .select('metrics')
          .gte('created_at', startTime.toISOString())
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (metricsError) {
          console.error('Error retrieving metrics for recommendations:', metricsError);
          return NextResponse.json(
            { error: 'Failed to retrieve metrics for recommendations' },
            { status: 500 }
          );
        }
        
        // Check if we have existing recent recommendations
        const { data: existingRecs, error: recsError } = await supabase
          .from('optimization_recommendations')
          .select('*')
          .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false });
          
        if (!recsError && existingRecs && existingRecs.length > 0) {
          // Return existing recommendations if they're recent
          return NextResponse.json({ recommendations: existingRecs });
        }
        
        // Generate new recommendations
        const metrics = metricsData.map(item => item.metrics);
        const recommendations = await generateOptimizationRecommendations(metrics);
        
        return NextResponse.json({ recommendations });
      }
      
      case 'summary': {
        // Retrieve summary statistics
        const { data: metricsData, error: metricsError } = await supabase
          .from('performance_metrics')
          .select('metrics, created_at')
          .gte('created_at', startTime.toISOString())
          .order('created_at', { ascending: false });
          
        if (metricsError) {
          console.error('Error retrieving metrics for summary:', metricsError);
          return NextResponse.json(
            { error: 'Failed to retrieve metrics for summary' },
            { status: 500 }
          );
        }
        
        const { data: alertsData, error: alertsError } = await supabase
          .from('performance_alerts')
          .select('severity, status')
          .gte('timestamp', startTime.toISOString());
          
        if (alertsError) {
          console.error('Error retrieving alerts for summary:', alertsError);
        }
        
        // Calculate summary statistics
        const metrics = metricsData.map(item => item.metrics);
        
        // Response times
        const responseTimesP95 = calculatePercentile(
          metrics.map(m => m.performanceMetrics.responseTime),
          95
        );
        
        // Error rates
        const avgErrorRate = metrics.reduce((sum, m) => sum + m.performanceMetrics.errorRate, 0) / metrics.length;
        
        // Page load times
        const pageLoadTimeP95 = calculatePercentile(
          metrics.map(m => m.userExperience.pageLoadTime),
          95
        );
        
        // Resource usage
        const avgCpuUsage = metrics.reduce((sum, m) => sum + m.resourceUsage.cpuUsage, 0) / metrics.length;
        const avgMemoryUsage = metrics.reduce((sum, m) => sum + m.resourceUsage.memoryUsage, 0) / metrics.length;
        
        // Alert counts
        const criticalAlerts = alertsData?.filter(a => a.severity === 'critical').length || 0;
        const highAlerts = alertsData?.filter(a => a.severity === 'high').length || 0;
        const mediumAlerts = alertsData?.filter(a => a.severity === 'medium').length || 0;
        const lowAlerts = alertsData?.filter(a => a.severity === 'low').length || 0;
        const activeAlerts = alertsData?.filter(a => a.status === 'active').length || 0;
        
        return NextResponse.json({
          summary: {
            period,
            metrics: {
              responseTimeP95: responseTimesP95,
              avgErrorRate: avgErrorRate,
              pageLoadTimeP95: pageLoadTimeP95,
              avgCpuUsage: avgCpuUsage,
              avgMemoryUsage: avgMemoryUsage,
            },
            alerts: {
              total: alertsData?.length || 0,
              critical: criticalAlerts,
              high: highAlerts,
              medium: mediumAlerts,
              low: lowAlerts,
              active: activeAlerts,
            },
            timestamp: Date.now(),
          }
        });
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid data type requested' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate percentile
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  // Sort values
  const sorted = [...values].sort((a, b) => a - b);
  
  // Calculate index
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  
  return sorted[index];
}
