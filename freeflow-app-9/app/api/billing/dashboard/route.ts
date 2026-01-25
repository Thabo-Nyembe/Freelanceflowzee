import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('billing-dashboard');

// Types
interface BillingMetrics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  churnRate: number;
  ltv: number;
  arpu: number;
  revenueGrowth: number;
  netRevenue: number;
}

interface SubscriptionBreakdown {
  plan: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface RevenueTimeline {
  date: string;
  mrr: number;
  newMrr: number;
  churnedMrr: number;
  expansionMrr: number;
}

interface UpcomingInvoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: string;
}

// GET - Fetch billing dashboard data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d': startDate.setDate(endDate.getDate() - 7); break;
      case '30d': startDate.setDate(endDate.getDate() - 30); break;
      case '90d': startDate.setDate(endDate.getDate() - 90); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
      default: startDate.setDate(endDate.getDate() - 30);
    }

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, plans(*), users(name, email)')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    // Fetch invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    // Calculate metrics
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
    const mrr = activeSubscriptions.reduce((sum, s) => sum + (s.plans?.price || 0), 0);
    const arr = mrr * 12;

    // Calculate churn
    const cancelledSubscriptions = subscriptions?.filter(s => s.status === 'cancelled') || [];
    const churnRate = activeSubscriptions.length > 0
      ? (cancelledSubscriptions.length / (activeSubscriptions.length + cancelledSubscriptions.length)) * 100
      : 0;

    // Calculate LTV and ARPU
    const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0) || 0;
    const uniqueCustomers = new Set(invoices?.map(i => i.customer_id)).size || 1;
    const arpu = totalRevenue / uniqueCustomers;
    const avgLifespan = churnRate > 0 ? 100 / churnRate : 24; // months
    const ltv = arpu * avgLifespan;

    // Previous period for growth calculation
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const { data: prevInvoices } = await supabase
      .from('invoices')
      .select('amount')
      .eq('organization_id', organizationId)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    const prevRevenue = prevInvoices?.reduce((sum, i) => sum + i.amount, 0) || 1;
    const revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue) * 100;

    const metrics: BillingMetrics = {
      mrr,
      arr,
      activeSubscriptions: activeSubscriptions.length,
      churnRate: Math.round(churnRate * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      arpu: Math.round(arpu * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      netRevenue: totalRevenue
    };

    // Subscription breakdown by plan
    const planCounts: Record<string, { count: number; revenue: number }> = {};
    activeSubscriptions.forEach(s => {
      const planName = s.plans?.name || 'Unknown';
      if (!planCounts[planName]) {
        planCounts[planName] = { count: 0, revenue: 0 };
      }
      planCounts[planName].count++;
      planCounts[planName].revenue += s.plans?.price || 0;
    });

    const subscriptionBreakdown: SubscriptionBreakdown[] = Object.entries(planCounts).map(([plan, data]) => ({
      plan,
      count: data.count,
      revenue: data.revenue,
      percentage: Math.round((data.count / activeSubscriptions.length) * 100)
    }));

    // Revenue timeline (daily MRR for the period)
    const revenueTimeline: RevenueTimeline[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySubscriptions = subscriptions?.filter(s =>
        new Date(s.created_at).toISOString().split('T')[0] <= dateStr &&
        (!s.cancelled_at || new Date(s.cancelled_at).toISOString().split('T')[0] > dateStr)
      ) || [];

      const dayMrr = daySubscriptions.reduce((sum, s) => sum + (s.plans?.price || 0), 0);
      const newSubs = subscriptions?.filter(s =>
        new Date(s.created_at).toISOString().split('T')[0] === dateStr
      ) || [];
      const newMrr = newSubs.reduce((sum, s) => sum + (s.plans?.price || 0), 0);

      const churned = subscriptions?.filter(s =>
        s.cancelled_at && new Date(s.cancelled_at).toISOString().split('T')[0] === dateStr
      ) || [];
      const churnedMrr = churned.reduce((sum, s) => sum + (s.plans?.price || 0), 0);

      revenueTimeline.push({
        date: dateStr,
        mrr: dayMrr,
        newMrr,
        churnedMrr,
        expansionMrr: 0 // Would need upgrade tracking
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Upcoming invoices
    const { data: upcomingInvoices } = await supabase
      .from('invoices')
      .select('*, users(name)')
      .eq('organization_id', organizationId)
      .in('status', ['pending', 'draft'])
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(10);

    const formattedUpcomingInvoices: UpcomingInvoice[] = (upcomingInvoices || []).map(inv => ({
      id: inv.id,
      customerId: inv.customer_id,
      customerName: inv.users?.name || 'Unknown',
      amount: inv.amount,
      currency: inv.currency || 'USD',
      dueDate: inv.due_date,
      status: inv.status
    }));

    // Payment method distribution
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('type')
      .eq('organization_id', organizationId);

    const paymentMethodStats: Record<string, number> = {};
    paymentMethods?.forEach(pm => {
      paymentMethodStats[pm.type] = (paymentMethodStats[pm.type] || 0) + 1;
    });

    return NextResponse.json({
      metrics,
      subscriptionBreakdown,
      revenueTimeline: revenueTimeline.slice(-30), // Last 30 data points
      upcomingInvoices: formattedUpcomingInvoices,
      paymentMethodDistribution: paymentMethodStats,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  } catch (error) {
    logger.error('Billing dashboard error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch billing dashboard' },
      { status: 500 }
    );
  }
}

// POST - Perform dashboard actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'export-report': {
        const { organizationId, format, period } = params;

        // Generate report data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (period === '30d' ? 30 : period === '90d' ? 90 : 365));

        const { data: invoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', startDate.toISOString());

        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('organization_id', organizationId);

        const report = {
          generatedAt: new Date().toISOString(),
          period: { start: startDate.toISOString(), end: endDate.toISOString() },
          summary: {
            totalInvoices: invoices?.length || 0,
            totalRevenue: invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0) || 0,
            activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
            mrr: subscriptions?.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.plans?.price || 0), 0) || 0
          },
          invoices: invoices || [],
          subscriptions: subscriptions || []
        };

        // Log export
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'billing_report_exported',
          resource_type: 'billing_report',
          details: { format, period, organizationId }
        });

        return NextResponse.json({
          success: true,
          report,
          format
        });
      }

      case 'forecast-revenue': {
        const { organizationId, months } = params;

        // Get historical data
        const { data: historicalMrr } = await supabase
          .from('subscriptions')
          .select('created_at, plans(price)')
          .eq('organization_id', organizationId)
          .eq('status', 'active')
          .order('created_at', { ascending: true });

        // Simple linear regression for forecasting
        const monthlyMrr: Record<string, number> = {};
        historicalMrr?.forEach(sub => {
          const month = new Date(sub.created_at).toISOString().substring(0, 7);
          monthlyMrr[month] = (monthlyMrr[month] || 0) + (sub.plans?.price || 0);
        });

        const sortedMonths = Object.keys(monthlyMrr).sort();
        const values = sortedMonths.map(m => monthlyMrr[m]);

        // Calculate trend
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Generate forecast
        const forecast = [];
        const lastMonth = new Date();
        for (let i = 1; i <= months; i++) {
          const forecastDate = new Date(lastMonth);
          forecastDate.setMonth(forecastDate.getMonth() + i);
          const predictedMrr = Math.max(0, intercept + slope * (n + i - 1));

          forecast.push({
            month: forecastDate.toISOString().substring(0, 7),
            predictedMrr: Math.round(predictedMrr * 100) / 100,
            predictedArr: Math.round(predictedMrr * 12 * 100) / 100,
            confidence: Math.max(0.5, 1 - (i * 0.05)) // Decreasing confidence over time
          });
        }

        return NextResponse.json({
          success: true,
          historicalData: monthlyMrr,
          forecast,
          trend: { slope, intercept }
        });
      }

      case 'get-insights': {
        const { organizationId } = params;

        // Analyze billing data for insights
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('organization_id', organizationId);

        const { data: invoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        const insights = [];

        // Churn risk analysis
        const atRiskSubscriptions = subscriptions?.filter(s => {
          const daysSinceCreation = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return s.status === 'active' && daysSinceCreation > 30 && !s.renewed_at;
        });

        if (atRiskSubscriptions && atRiskSubscriptions.length > 0) {
          insights.push({
            type: 'warning',
            category: 'churn_risk',
            title: 'Subscriptions at Risk',
            description: `${atRiskSubscriptions.length} subscriptions haven't renewed and may be at risk of churning`,
            impact: atRiskSubscriptions.reduce((sum, s) => sum + (s.plans?.price || 0), 0),
            recommendation: 'Consider reaching out to these customers with a retention offer'
          });
        }

        // Payment failure analysis
        const failedPayments = invoices?.filter(i => i.status === 'failed');
        if (failedPayments && failedPayments.length > 0) {
          const failureRate = (failedPayments.length / (invoices?.length || 1)) * 100;
          insights.push({
            type: failureRate > 10 ? 'critical' : 'warning',
            category: 'payment_failures',
            title: 'Payment Failures Detected',
            description: `${failedPayments.length} payments failed (${failureRate.toFixed(1)}% failure rate)`,
            impact: failedPayments.reduce((sum, i) => sum + i.amount, 0),
            recommendation: 'Review dunning settings and consider adding backup payment methods'
          });
        }

        // Growth opportunity
        const monthlyGrowth = subscriptions?.filter(s => {
          const created = new Date(s.created_at);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return created >= monthAgo;
        }).length || 0;

        if (monthlyGrowth > 5) {
          insights.push({
            type: 'success',
            category: 'growth',
            title: 'Strong Growth Momentum',
            description: `${monthlyGrowth} new subscriptions added this month`,
            recommendation: 'Consider launching an upsell campaign to maximize revenue from new customers'
          });
        }

        // Plan optimization
        const planDistribution: Record<string, number> = {};
        subscriptions?.forEach(s => {
          const plan = s.plans?.name || 'Unknown';
          planDistribution[plan] = (planDistribution[plan] || 0) + 1;
        });

        const totalSubs = subscriptions?.length || 1;
        Object.entries(planDistribution).forEach(([plan, count]) => {
          const percentage = (count / totalSubs) * 100;
          if (plan !== 'Enterprise' && percentage > 60) {
            insights.push({
              type: 'info',
              category: 'plan_optimization',
              title: 'Plan Concentration',
              description: `${percentage.toFixed(0)}% of customers are on the ${plan} plan`,
              recommendation: 'Consider creating upgrade incentives to move customers to higher-tier plans'
            });
          }
        });

        return NextResponse.json({
          success: true,
          insights,
          metrics: {
            totalSubscriptions: subscriptions?.length || 0,
            activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
            totalInvoices: invoices?.length || 0,
            revenueAtRisk: atRiskSubscriptions?.reduce((sum, s) => sum + (s.plans?.price || 0), 0) || 0
          }
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Billing dashboard action error', { error });
    return NextResponse.json(
      { error: 'Failed to perform billing action' },
      { status: 500 }
    );
  }
}
