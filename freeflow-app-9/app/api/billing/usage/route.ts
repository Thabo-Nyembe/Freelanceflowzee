import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
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

const logger = createSimpleLogger('invoices-api');

// ============================================================================
// USAGE TRACKING API
// ============================================================================
// Track and report usage for metered billing:
// - API calls
// - Storage usage (GB)
// - AI tokens
// - Video processing minutes
// - Collaboration sessions
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

// ============================================================================
// Types
// ============================================================================

type UsageType = 'api_calls' | 'storage_gb' | 'ai_tokens' | 'video_minutes' | 'collaboration_minutes' | 'team_members';

interface UsageRecord {
  id: string;
  user_id: string;
  usage_type: UsageType;
  quantity: number;
  unit_price?: number;
  timestamp: string;
  billing_period_start: string;
  billing_period_end: string;
  stripe_usage_record_id?: string;
  metadata?: Record<string, any>;
}

interface UsageSummary {
  type: UsageType;
  current: number;
  limit: number;
  percentage: number;
  unit: string;
  cost: number;
}

interface UsageRequest {
  action: string;
  usageType?: UsageType;
  quantity?: number;
  metadata?: Record<string, any>;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Usage Limits by Plan
// ============================================================================

const PLAN_LIMITS: Record<string, Record<UsageType, number>> = {
  free: {
    api_calls: 1000,
    storage_gb: 1,
    ai_tokens: 10000,
    video_minutes: 10,
    collaboration_minutes: 60,
    team_members: 1,
  },
  starter: {
    api_calls: 10000,
    storage_gb: 10,
    ai_tokens: 100000,
    video_minutes: 60,
    collaboration_minutes: 600,
    team_members: 3,
  },
  professional: {
    api_calls: 100000,
    storage_gb: 100,
    ai_tokens: 1000000,
    video_minutes: 600,
    collaboration_minutes: 6000,
    team_members: 10,
  },
  enterprise: {
    api_calls: -1, // Unlimited
    storage_gb: 1000,
    ai_tokens: -1, // Unlimited
    video_minutes: -1, // Unlimited
    collaboration_minutes: -1, // Unlimited
    team_members: -1, // Unlimited
  },
};

const USAGE_UNIT_PRICES: Record<UsageType, number> = {
  api_calls: 0.0001, // $0.01 per 100 calls
  storage_gb: 0.10, // $0.10 per GB
  ai_tokens: 0.00001, // $0.01 per 1000 tokens
  video_minutes: 0.05, // $0.05 per minute
  collaboration_minutes: 0.01, // $0.01 per minute
  team_members: 5.00, // $5 per member
};

const USAGE_UNITS: Record<UsageType, string> = {
  api_calls: 'calls',
  storage_gb: 'GB',
  ai_tokens: 'tokens',
  video_minutes: 'minutes',
  collaboration_minutes: 'minutes',
  team_members: 'members',
};

// ============================================================================
// HELPER: Get user from auth header
// ============================================================================
async function getUserFromAuth(request: NextRequest, supabase: any) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  }
  return null;
}

// ============================================================================
// HELPER: Get billing period
// ============================================================================
function getCurrentBillingPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// ============================================================================
// HELPER: Get user's plan
// ============================================================================
async function getUserPlan(userId: string, supabase: any): Promise<string> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return data?.plan_id || 'free';
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: UsageRequest = await request.json();
    const { action } = body;

    const user = await getUserFromAuth(request, supabase);
    const userId = user?.id;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    switch (action) {
      // ======================================================================
      // RECORD USAGE
      // ======================================================================
      case 'record': {
        const { usageType, quantity, metadata } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!usageType || quantity === undefined) {
          return NextResponse.json({
            success: false,
            error: 'Usage type and quantity required',
          }, { status: 400 });
        }

        const { start, end } = getCurrentBillingPeriod();

        // Record in database
        const { data: record, error: dbError } = await supabase
          .from('usage_records')
          .insert({
            user_id: userId,
            usage_type: usageType,
            quantity,
            unit_price: USAGE_UNIT_PRICES[usageType],
            billing_period_start: start.toISOString(),
            billing_period_end: end.toISOString(),
            metadata,
          })
          .select()
          .single();

        if (dbError) {
          // Table might not exist - create it
          logger.error('Usage record error (table may not exist)', { error: dbError });
        }

        // Report to Stripe for metered billing (if configured)
        if (!isDemo && process.env.STRIPE_SECRET_KEY) {
          try {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('stripe_subscription_id')
              .eq('user_id', userId)
              .eq('status', 'active')
              .single();

            if (subscription?.stripe_subscription_id) {
              // Get subscription items for metered billing
              const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
              const meteredItem = stripeSubscription.items.data.find(
                item => item.price.recurring?.usage_type === 'metered'
              );

              if (meteredItem) {
                await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
                  quantity: Math.round(quantity),
                  timestamp: Math.floor(Date.now() / 1000),
                  action: 'increment',
                });
              }
            }
          } catch (stripeError) {
            logger.error('Stripe usage record error', { error: stripeError });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            recorded: true,
            usageType,
            quantity,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // ======================================================================
      // GET USAGE SUMMARY
      // ======================================================================
      case 'summary': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        const plan = await getUserPlan(userId, supabase);
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
        const { start, end } = getCurrentBillingPeriod();

        // Get usage totals for current period
        const { data: usageData } = await supabase
          .from('usage_records')
          .select('usage_type, quantity')
          .eq('user_id', userId)
          .gte('timestamp', start.toISOString())
          .lte('timestamp', end.toISOString());

        // Aggregate by type
        const usageTotals: Record<UsageType, number> = {
          api_calls: 0,
          storage_gb: 0,
          ai_tokens: 0,
          video_minutes: 0,
          collaboration_minutes: 0,
          team_members: 0,
        };

        usageData?.forEach(record => {
          if (record.usage_type in usageTotals) {
            usageTotals[record.usage_type as UsageType] += record.quantity;
          }
        });

        // Build summary
        const summary: UsageSummary[] = Object.entries(usageTotals).map(([type, current]) => {
          const limit = limits[type as UsageType];
          const percentage = limit > 0 ? (current / limit) * 100 : 0;
          const overage = limit > 0 && current > limit ? current - limit : 0;
          const cost = overage * USAGE_UNIT_PRICES[type as UsageType];

          return {
            type: type as UsageType,
            current,
            limit: limit === -1 ? Infinity : limit,
            percentage: Math.min(percentage, 100),
            unit: USAGE_UNITS[type as UsageType],
            cost,
          };
        });

        return NextResponse.json({
          success: true,
          data: {
            plan,
            billingPeriod: {
              start: start.toISOString(),
              end: end.toISOString(),
            },
            summary,
            totalOverageCost: summary.reduce((sum, s) => sum + s.cost, 0),
          },
        });
      }

      // ======================================================================
      // GET USAGE HISTORY
      // ======================================================================
      case 'history': {
        const { usageType, startDate, endDate } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        let query = supabase
          .from('usage_records')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(100);

        if (usageType) {
          query = query.eq('usage_type', usageType);
        }

        if (startDate) {
          query = query.gte('timestamp', startDate);
        }

        if (endDate) {
          query = query.lte('timestamp', endDate);
        }

        const { data: records, error } = await query;

        if (error) {
          logger.error('Usage history error', { error });
          return NextResponse.json({
            success: true,
            data: { records: [] },
          });
        }

        return NextResponse.json({
          success: true,
          data: { records: records || [] },
        });
      }

      // ======================================================================
      // CHECK LIMIT
      // ======================================================================
      case 'check-limit': {
        const { usageType } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!usageType) {
          return NextResponse.json({
            success: false,
            error: 'Usage type required',
          }, { status: 400 });
        }

        const plan = await getUserPlan(userId, supabase);
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
        const limit = limits[usageType];
        const { start, end } = getCurrentBillingPeriod();

        // Get current usage
        const { data } = await supabase
          .from('usage_records')
          .select('quantity')
          .eq('user_id', userId)
          .eq('usage_type', usageType)
          .gte('timestamp', start.toISOString())
          .lte('timestamp', end.toISOString());

        const current = data?.reduce((sum, r) => sum + r.quantity, 0) || 0;
        const remaining = limit === -1 ? Infinity : Math.max(0, limit - current);
        const isWithinLimit = limit === -1 || current < limit;

        return NextResponse.json({
          success: true,
          data: {
            usageType,
            current,
            limit: limit === -1 ? 'unlimited' : limit,
            remaining,
            isWithinLimit,
            percentageUsed: limit > 0 ? (current / limit) * 100 : 0,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['record', 'summary', 'history', 'check-limit'],
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('Usage API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// ============================================================================
// GET HANDLER - Quick usage check
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getUserFromAuth(request, supabase);
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    // Quick summary for dashboard
    const plan = await getUserPlan(userId, supabase);
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const { start } = getCurrentBillingPeriod();

    // Get totals
    const { data } = await supabase
      .from('usage_records')
      .select('usage_type, quantity')
      .eq('user_id', userId)
      .gte('timestamp', start.toISOString());

    const totals: Record<string, number> = {};
    data?.forEach(record => {
      totals[record.usage_type] = (totals[record.usage_type] || 0) + record.quantity;
    });

    return NextResponse.json({
      success: true,
      data: {
        plan,
        usage: totals,
        limits,
      },
    });
  } catch (error) {
    logger.error('Usage GET Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}
