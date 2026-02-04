import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('billing-revenue-analytics');

// Types
interface RevenueMetrics {
  mrr: number;
  arr: number;
  mrrGrowth: number;
  netRevenue: number;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  reactivationMrr: number;
}

interface CohortData {
  cohort: string;
  size: number;
  retention: number[];
  ltv: number;
}

// GET - Fetch revenue analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const period = searchParams.get('period') || '12m';
    const metric = searchParams.get('metric');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case '3m': startDate.setMonth(endDate.getMonth() - 3); break;
      case '6m': startDate.setMonth(endDate.getMonth() - 6); break;
      case '12m': startDate.setMonth(endDate.getMonth() - 12); break;
      case '24m': startDate.setMonth(endDate.getMonth() - 24); break;
      default: startDate.setMonth(endDate.getMonth() - 12);
    }

    // Fetch all subscriptions for the period
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('organization_id', organizationId)
      .or(`created_at.gte.${startDate.toISOString()},status.eq.active`);

    // Fetch all invoices for the period
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    // Calculate MRR breakdown
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
    const currentMrr = activeSubscriptions.reduce((sum, s) => {
      const price = s.plans?.price || 0;
      return sum + (s.plans?.interval === 'yearly' ? price / 12 : price);
    }, 0);

    // Calculate MRR movements by month
    const mrrByMonth: Record<string, {
      mrr: number;
      newMrr: number;
      expansionMrr: number;
      contractionMrr: number;
      churnedMrr: number;
      reactivationMrr: number;
    }> = {};

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthKey = currentDate.toISOString().substring(0, 7);
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // New subscriptions this month
      const newSubs = subscriptions?.filter(s =>
        new Date(s.created_at) >= monthStart && new Date(s.created_at) <= monthEnd
      ) || [];

      // Cancelled this month
      const churnedSubs = subscriptions?.filter(s =>
        s.cancelled_at &&
        new Date(s.cancelled_at) >= monthStart &&
        new Date(s.cancelled_at) <= monthEnd
      ) || [];

      // Active at month end
      const activeAtEnd = subscriptions?.filter(s =>
        new Date(s.created_at) <= monthEnd &&
        (!s.cancelled_at || new Date(s.cancelled_at) > monthEnd)
      ) || [];

      const monthMrr = activeAtEnd.reduce((sum, s) => {
        const price = s.plans?.price || 0;
        return sum + (s.plans?.interval === 'yearly' ? price / 12 : price);
      }, 0);

      const newMrr = newSubs.reduce((sum, s) => {
        const price = s.plans?.price || 0;
        return sum + (s.plans?.interval === 'yearly' ? price / 12 : price);
      }, 0);

      const churnedMrr = churnedSubs.reduce((sum, s) => {
        const price = s.plans?.price || 0;
        return sum + (s.plans?.interval === 'yearly' ? price / 12 : price);
      }, 0);

      mrrByMonth[monthKey] = {
        mrr: monthMrr,
        newMrr,
        expansionMrr: 0, // Would need upgrade tracking
        contractionMrr: 0, // Would need downgrade tracking
        churnedMrr,
        reactivationMrr: 0 // Would need reactivation tracking
      };

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Calculate growth rate
    const monthKeys = Object.keys(mrrByMonth).sort();
    const lastMonth = mrrByMonth[monthKeys[monthKeys.length - 1]];
    const prevMonth = mrrByMonth[monthKeys[monthKeys.length - 2]];
    const mrrGrowth = prevMonth?.mrr > 0
      ? ((lastMonth?.mrr - prevMonth?.mrr) / prevMonth?.mrr) * 100
      : 0;

    // Revenue by plan
    const revenueByPlan: Record<string, { count: number; mrr: number; percentage: number }> = {};
    activeSubscriptions.forEach(s => {
      const planName = s.plans?.name || 'Unknown';
      if (!revenueByPlan[planName]) {
        revenueByPlan[planName] = { count: 0, mrr: 0, percentage: 0 };
      }
      revenueByPlan[planName].count++;
      const price = s.plans?.price || 0;
      revenueByPlan[planName].mrr += s.plans?.interval === 'yearly' ? price / 12 : price;
    });

    Object.values(revenueByPlan).forEach(plan => {
      plan.percentage = currentMrr > 0 ? (plan.mrr / currentMrr) * 100 : 0;
    });

    // Calculate LTV
    const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
    const uniqueCustomers = new Set(paidInvoices.map(i => i.customer_id)).size || 1;
    const arpu = totalRevenue / uniqueCustomers;

    // Churn rate
    const totalSubscriptions = subscriptions?.length || 1;
    const cancelledSubscriptions = subscriptions?.filter(s => s.status === 'cancelled').length || 0;
    const churnRate = (cancelledSubscriptions / totalSubscriptions) * 100;
    const avgLifespan = churnRate > 0 ? 100 / churnRate : 24;
    const ltv = arpu * avgLifespan;

    // Quick Ratio (Growth Efficiency)
    const totalNewMrr = Object.values(mrrByMonth).reduce((sum, m) => sum + m.newMrr, 0);
    const totalChurnedMrr = Object.values(mrrByMonth).reduce((sum, m) => sum + m.churnedMrr, 0);
    const quickRatio = totalChurnedMrr > 0 ? totalNewMrr / totalChurnedMrr : totalNewMrr > 0 ? Infinity : 1;

    return NextResponse.json({
      summary: {
        mrr: Math.round(currentMrr * 100) / 100,
        arr: Math.round(currentMrr * 12 * 100) / 100,
        mrrGrowth: Math.round(mrrGrowth * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        arpu: Math.round(arpu * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        quickRatio: quickRatio === Infinity ? 'Infinite' : Math.round(quickRatio * 100) / 100,
        activeSubscriptions: activeSubscriptions.length,
        totalCustomers: uniqueCustomers
      },
      mrrTimeline: Object.entries(mrrByMonth).map(([month, data]) => ({
        month,
        ...data
      })),
      revenueByPlan,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  } catch (error) {
    logger.error('Revenue analytics error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}

// POST - Revenue analytics actions
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
      case 'cohort-analysis': {
        const { organizationId, cohortType, months } = params;

        // Build cohort data based on subscription start month
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - (months || 12));

        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('organization_id', organizationId)
          .gte('created_at', startDate.toISOString());

        // Group by cohort (signup month)
        const cohorts: Record<string, {
          customers: Set<string>;
          retention: Record<number, Set<string>>;
          revenue: number[];
        }> = {};

        subscriptions?.forEach(sub => {
          const cohortMonth = new Date(sub.created_at).toISOString().substring(0, 7);
          if (!cohorts[cohortMonth]) {
            cohorts[cohortMonth] = {
              customers: new Set(),
              retention: {},
              revenue: []
            };
          }
          cohorts[cohortMonth].customers.add(sub.user_id);

          // Calculate retention for each month since signup
          const signupDate = new Date(sub.created_at);
          const monthsSinceSignup = Math.floor(
            (endDate.getTime() - signupDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
          );

          for (let i = 0; i <= monthsSinceSignup; i++) {
            const checkDate = new Date(signupDate);
            checkDate.setMonth(checkDate.getMonth() + i);

            const wasActive = !sub.cancelled_at ||
              new Date(sub.cancelled_at) > checkDate;

            if (wasActive) {
              if (!cohorts[cohortMonth].retention[i]) {
                cohorts[cohortMonth].retention[i] = new Set();
              }
              cohorts[cohortMonth].retention[i].add(sub.user_id);
            }
          }
        });

        // Format cohort data
        const cohortData: CohortData[] = Object.entries(cohorts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([cohort, data]) => {
            const size = data.customers.size;
            const retention = [];
            for (let i = 0; i <= 12; i++) {
              const retained = data.retention[i]?.size || 0;
              retention.push(size > 0 ? Math.round((retained / size) * 100) : 0);
            }

            return {
              cohort,
              size,
              retention,
              ltv: 0 // Would calculate from actual revenue
            };
          });

        return NextResponse.json({
          success: true,
          cohortData,
          averageRetention: cohortData.length > 0
            ? cohortData[0].retention.map((_, i) =>
                Math.round(cohortData.reduce((sum, c) => sum + c.retention[i], 0) / cohortData.length)
              )
            : []
        });
      }

      case 'forecast': {
        const { organizationId, forecastMonths } = params;

        // Get historical MRR data
        const thirteenMonthsAgo = new Date();
        thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('organization_id', organizationId)
          .gte('created_at', thirteenMonthsAgo.toISOString());

        // Calculate monthly MRR
        const monthlyMrr: number[] = [];
        const currentDate = new Date(thirteenMonthsAgo);
        const endDate = new Date();

        while (currentDate <= endDate) {
          const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          const activeAtEnd = subscriptions?.filter(s =>
            new Date(s.created_at) <= monthEnd &&
            (!s.cancelled_at || new Date(s.cancelled_at) > monthEnd)
          ) || [];

          const mrr = activeAtEnd.reduce((sum, s) => {
            const price = s.plans?.price || 0;
            return sum + (s.plans?.interval === 'yearly' ? price / 12 : price);
          }, 0);

          monthlyMrr.push(mrr);
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Linear regression for forecasting
        const n = monthlyMrr.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = monthlyMrr.reduce((a, b) => a + b, 0);
        const sumXY = monthlyMrr.reduce((sum, y, i) => sum + i * y, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Generate forecast
        const forecast = [];
        for (let i = 1; i <= (forecastMonths || 12); i++) {
          const month = new Date();
          month.setMonth(month.getMonth() + i);

          const predictedMrr = Math.max(0, intercept + slope * (n + i - 1));
          const confidence = Math.max(0.5, 1 - (i * 0.03));

          // Calculate confidence interval
          const stdDev = Math.sqrt(
            monthlyMrr.reduce((sum, val, idx) => {
              const predicted = intercept + slope * idx;
              return sum + Math.pow(val - predicted, 2);
            }, 0) / n
          );

          forecast.push({
            month: month.toISOString().substring(0, 7),
            predictedMrr: Math.round(predictedMrr * 100) / 100,
            predictedArr: Math.round(predictedMrr * 12 * 100) / 100,
            confidence: Math.round(confidence * 100),
            lowerBound: Math.round((predictedMrr - 1.96 * stdDev) * 100) / 100,
            upperBound: Math.round((predictedMrr + 1.96 * stdDev) * 100) / 100
          });
        }

        return NextResponse.json({
          success: true,
          historical: monthlyMrr.map((mrr, i) => {
            const month = new Date(thirteenMonthsAgo);
            month.setMonth(month.getMonth() + i);
            return {
              month: month.toISOString().substring(0, 7),
              mrr: Math.round(mrr * 100) / 100
            };
          }),
          forecast,
          trend: slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable',
          monthlyGrowthRate: monthlyMrr.length > 1
            ? Math.round(slope / monthlyMrr[monthlyMrr.length - 1] * 100 * 100) / 100
            : 0
        });
      }

      case 'export-report': {
        const { organizationId, reportType, format, dateRange } = params;

        // Generate report data based on type
        let reportData;

        switch (reportType) {
          case 'revenue-summary':
            const { data: invoices } = await supabase
              .from('invoices')
              .select('*')
              .eq('organization_id', organizationId)
              .gte('created_at', dateRange?.start || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
              .lte('created_at', dateRange?.end || new Date().toISOString());

            reportData = {
              title: 'Revenue Summary Report',
              generatedAt: new Date().toISOString(),
              dateRange,
              summary: {
                totalInvoices: invoices?.length || 0,
                paidInvoices: invoices?.filter(i => i.status === 'paid').length || 0,
                totalRevenue: invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0) || 0,
                outstandingAmount: invoices?.filter(i => ['pending', 'draft'].includes(i.status)).reduce((sum, i) => sum + i.total, 0) || 0
              },
              details: invoices
            };
            break;

          case 'mrr-breakdown':
            const { data: subs } = await supabase
              .from('subscriptions')
              .select('*, plans(*), users(name, email)')
              .eq('organization_id', organizationId)
              .eq('status', 'active');

            reportData = {
              title: 'MRR Breakdown Report',
              generatedAt: new Date().toISOString(),
              summary: {
                totalMrr: subs?.reduce((sum, s) => sum + (s.plans?.price || 0), 0) || 0,
                subscriptionCount: subs?.length || 0
              },
              subscriptions: subs
            };
            break;

          default:
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
        }

        // Log export
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'revenue_report_exported',
          resource_type: 'report',
          details: { reportType, format, dateRange }
        });

        return NextResponse.json({
          success: true,
          report: reportData,
          format
        });
      }

      case 'segment-analysis': {
        const { organizationId, segmentBy } = params;

        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*, plans(*), users(name, email, metadata)')
          .eq('organization_id', organizationId)
          .eq('status', 'active');

        const segments: Record<string, { count: number; mrr: number; arpu: number }> = {};

        subscriptions?.forEach(sub => {
          let segmentKey = 'Other';

          switch (segmentBy) {
            case 'plan':
              segmentKey = sub.plans?.name || 'Unknown';
              break;
            case 'industry':
              segmentKey = sub.users?.metadata?.industry || 'Unknown';
              break;
            case 'company_size':
              segmentKey = sub.users?.metadata?.company_size || 'Unknown';
              break;
            case 'region':
              segmentKey = sub.users?.metadata?.region || 'Unknown';
              break;
          }

          if (!segments[segmentKey]) {
            segments[segmentKey] = { count: 0, mrr: 0, arpu: 0 };
          }

          segments[segmentKey].count++;
          const price = sub.plans?.price || 0;
          segments[segmentKey].mrr += sub.plans?.interval === 'yearly' ? price / 12 : price;
        });

        // Calculate ARPU per segment
        Object.values(segments).forEach(seg => {
          seg.arpu = seg.count > 0 ? Math.round((seg.mrr / seg.count) * 100) / 100 : 0;
          seg.mrr = Math.round(seg.mrr * 100) / 100;
        });

        return NextResponse.json({
          success: true,
          segmentBy,
          segments,
          totalSegments: Object.keys(segments).length
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Revenue analytics action error', { error });
    return NextResponse.json(
      { error: 'Failed to perform revenue analytics action' },
      { status: 500 }
    );
  }
}
