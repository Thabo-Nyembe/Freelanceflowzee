import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// ============================================================================
// WORLD-CLASS SUBSCRIPTION MANAGEMENT API
// ============================================================================
// Complete subscription lifecycle management
// - Get subscription details
// - Update subscription
// - Pause/Resume subscription
// - Update payment method
// - Get usage and limits
// - Get invoice history
// - Preview proration for plan changes
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

// Plan limits for feature gating
const PLAN_LIMITS = {
  starter: {
    projects: 3,
    storage: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    aiCredits: 100,
    teamMembers: 1,
    videoMinutes: 60,
    clientPortals: 1,
    customBranding: false,
    prioritySupport: false,
    apiAccess: false,
  },
  professional: {
    projects: -1, // unlimited
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    aiCredits: 5000,
    teamMembers: 10,
    videoMinutes: 600,
    clientPortals: -1,
    customBranding: true,
    prioritySupport: true,
    apiAccess: true,
  },
  enterprise: {
    projects: -1,
    storage: -1, // unlimited
    aiCredits: -1,
    teamMembers: 50,
    videoMinutes: -1,
    clientPortals: -1,
    customBranding: true,
    prioritySupport: true,
    apiAccess: true,
  },
};

interface SubscriptionRequest {
  action: string;
  subscriptionId?: string;
  paymentMethodId?: string;
  newPlanId?: string;
  quantity?: number;
  pauseCollection?: boolean;
  invoiceId?: string;
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: SubscriptionRequest = await request.json();
    const { action } = body;

    // Get user from auth
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    switch (action) {
      // ======================================================================
      // GET SUBSCRIPTION DETAILS
      // ======================================================================
      case 'get-subscription': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              subscription: {
                id: 'sub_demo_123',
                status: 'active',
                planId: 'professional',
                planName: 'Professional',
                price: 2900,
                interval: 'month',
                currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                cancelAtPeriodEnd: false,
                trialEnd: null,
              },
              limits: PLAN_LIMITS.professional,
              usage: {
                projects: 12,
                storage: 25 * 1024 * 1024 * 1024, // 25GB used
                aiCredits: 1500,
                teamMembers: 3,
              },
            },
          });
        }

        // Get subscription from database
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (!subscription) {
          return NextResponse.json({
            success: true,
            data: {
              subscription: null,
              limits: PLAN_LIMITS.starter,
              planId: 'starter',
            },
          });
        }

        // Get usage stats
        const { data: usage } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', userId)
          .single();

        const planLimits = PLAN_LIMITS[subscription.plan_type as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;

        return NextResponse.json({
          success: true,
          data: {
            subscription,
            limits: planLimits,
            usage: usage || {},
          },
        });
      }

      // ======================================================================
      // GET USAGE STATISTICS
      // ======================================================================
      case 'get-usage': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              usage: {
                projects: { used: 12, limit: -1, percentage: 0 },
                storage: { used: 25600000000, limit: 107374182400, percentage: 24 },
                aiCredits: { used: 1500, limit: 5000, percentage: 30 },
                teamMembers: { used: 3, limit: 10, percentage: 30 },
                videoMinutes: { used: 120, limit: 600, percentage: 20 },
              },
              period: {
                start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          });
        }

        // Get user's subscription to determine limits
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        const planType = subscription?.plan_type || 'starter';
        const limits = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS];

        // Get actual usage from various tables
        const [projectsResult, filesResult, teamResult] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact' }).eq('user_id', userId),
          supabase.from('files').select('size').eq('user_id', userId),
          supabase.from('team_members').select('id', { count: 'exact' }).eq('user_id', userId),
        ]);

        const projectsUsed = projectsResult.count || 0;
        const storageUsed = filesResult.data?.reduce((sum, f) => sum + (f.size || 0), 0) || 0;
        const teamUsed = teamResult.count || 0;

        // Calculate percentages
        const calculatePercentage = (used: number, limit: number) => {
          if (limit === -1) return 0;
          return Math.round((used / limit) * 100);
        };

        return NextResponse.json({
          success: true,
          data: {
            usage: {
              projects: {
                used: projectsUsed,
                limit: limits.projects,
                percentage: calculatePercentage(projectsUsed, limits.projects),
              },
              storage: {
                used: storageUsed,
                limit: limits.storage,
                percentage: calculatePercentage(storageUsed, limits.storage),
              },
              teamMembers: {
                used: teamUsed,
                limit: limits.teamMembers,
                percentage: calculatePercentage(teamUsed, limits.teamMembers),
              },
            },
            planType,
          },
        });
      }

      // ======================================================================
      // UPDATE PAYMENT METHOD
      // ======================================================================
      case 'update-payment-method': {
        const { paymentMethodId } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!paymentMethodId) {
          return NextResponse.json({
            success: false,
            error: 'Payment method ID required',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Payment method would be updated',
              paymentMethodId,
            },
          });
        }

        // Get customer ID
        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!user?.stripe_customer_id) {
          return NextResponse.json({
            success: false,
            error: 'No billing account found',
          }, { status: 404 });
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: user.stripe_customer_id,
        });

        // Set as default
        await stripe.customers.update(user.stripe_customer_id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            message: 'Payment method updated successfully',
          },
        });
      }

      // ======================================================================
      // GET PAYMENT METHODS
      // ======================================================================
      case 'get-payment-methods': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              paymentMethods: [
                {
                  id: 'pm_demo_1',
                  type: 'card',
                  brand: 'visa',
                  last4: '4242',
                  expMonth: 12,
                  expYear: 2026,
                  isDefault: true,
                },
              ],
            },
          });
        }

        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!user?.stripe_customer_id) {
          return NextResponse.json({
            success: true,
            data: { paymentMethods: [] },
          });
        }

        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripe_customer_id,
          type: 'card',
        });

        // Get default payment method
        const customer = await stripe.customers.retrieve(user.stripe_customer_id) as Stripe.Customer;
        const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

        return NextResponse.json({
          success: true,
          data: {
            paymentMethods: paymentMethods.data.map(pm => ({
              id: pm.id,
              type: pm.type,
              brand: pm.card?.brand,
              last4: pm.card?.last4,
              expMonth: pm.card?.exp_month,
              expYear: pm.card?.exp_year,
              isDefault: pm.id === defaultPaymentMethod,
            })),
          },
        });
      }

      // ======================================================================
      // GET INVOICES
      // ======================================================================
      case 'get-invoices': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              invoices: [
                {
                  id: 'in_demo_1',
                  number: 'INV-2024-001',
                  status: 'paid',
                  amount: 2900,
                  currency: 'usd',
                  created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  pdfUrl: null,
                  hostedUrl: null,
                },
                {
                  id: 'in_demo_2',
                  number: 'INV-2024-002',
                  status: 'paid',
                  amount: 2900,
                  currency: 'usd',
                  created: new Date().toISOString(),
                  pdfUrl: null,
                  hostedUrl: null,
                },
              ],
            },
          });
        }

        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!user?.stripe_customer_id) {
          return NextResponse.json({
            success: true,
            data: { invoices: [] },
          });
        }

        const invoices = await stripe.invoices.list({
          customer: user.stripe_customer_id,
          limit: 12,
        });

        return NextResponse.json({
          success: true,
          data: {
            invoices: invoices.data.map(inv => ({
              id: inv.id,
              number: inv.number,
              status: inv.status,
              amount: inv.amount_paid,
              currency: inv.currency,
              created: new Date(inv.created * 1000).toISOString(),
              pdfUrl: inv.invoice_pdf,
              hostedUrl: inv.hosted_invoice_url,
            })),
          },
        });
      }

      // ======================================================================
      // PREVIEW PRORATION
      // ======================================================================
      case 'preview-proration': {
        const { newPlanId } = body;

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (!newPlanId) {
          return NextResponse.json({
            success: false,
            error: 'New plan ID required',
          }, { status: 400 });
        }

        if (isDemo) {
          const prices: Record<string, number> = { starter: 0, professional: 2900, enterprise: 9900 };
          const newPrice = prices[newPlanId] || 2900;

          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              prorationAmount: Math.round(newPrice * 0.5), // Simulated proration
              creditBalance: 0,
              amountDue: Math.round(newPrice * 0.5),
              newPlanPrice: newPrice,
              effectiveDate: new Date().toISOString(),
            },
          });
        }

        // Get current subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (!subscription?.stripe_subscription_id) {
          return NextResponse.json({
            success: false,
            error: 'No active subscription',
          }, { status: 404 });
        }

        // Get new price ID
        const priceIds: Record<string, string> = {
          starter: process.env.STRIPE_PRICE_STARTER || '',
          professional: process.env.STRIPE_PRICE_PROFESSIONAL || '',
          enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
        };

        const sub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

        // Create invoice preview
        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!user?.stripe_customer_id) {
          return NextResponse.json({
            success: false,
            error: 'No billing account',
          }, { status: 404 });
        }

        const preview = await stripe.invoices.createPreview({
          customer: user.stripe_customer_id,
          subscription: subscription.stripe_subscription_id,
          subscription_items: [
            {
              id: sub.items.data[0].id,
              price: priceIds[newPlanId],
            },
          ],
          subscription_proration_behavior: 'create_prorations',
        });

        return NextResponse.json({
          success: true,
          data: {
            prorationAmount: preview.subtotal,
            creditBalance: preview.starting_balance,
            amountDue: preview.amount_due,
            lines: preview.lines.data.map(line => ({
              description: line.description,
              amount: line.amount,
            })),
          },
        });
      }

      // ======================================================================
      // PAUSE SUBSCRIPTION
      // ======================================================================
      case 'pause-subscription': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Subscription would be paused',
              pausedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          });
        }

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (!subscription?.stripe_subscription_id) {
          return NextResponse.json({
            success: false,
            error: 'No active subscription',
          }, { status: 404 });
        }

        // Pause collection
        const updated = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            pause_collection: {
              behavior: 'mark_uncollectible',
            },
          }
        );

        return NextResponse.json({
          success: true,
          data: {
            message: 'Subscription paused',
            pauseCollection: updated.pause_collection,
          },
        });
      }

      // ======================================================================
      // RESUME SUBSCRIPTION
      // ======================================================================
      case 'resume-subscription': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Subscription would be resumed',
            },
          });
        }

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .single();

        if (!subscription?.stripe_subscription_id) {
          return NextResponse.json({
            success: false,
            error: 'No subscription found',
          }, { status: 404 });
        }

        // Resume collection
        const updated = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            pause_collection: '',
          }
        );

        return NextResponse.json({
          success: true,
          data: {
            message: 'Subscription resumed',
            status: updated.status,
          },
        });
      }

      // ======================================================================
      // GET UPCOMING INVOICE
      // ======================================================================
      case 'get-upcoming-invoice': {
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: 'Authentication required',
          }, { status: 401 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              upcomingInvoice: {
                amount: 2900,
                currency: 'usd',
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                lines: [
                  { description: 'Professional Plan (Monthly)', amount: 2900 },
                ],
              },
            },
          });
        }

        const { data: user } = await supabase
          .from('users')
          .select('stripe_customer_id')
          .eq('id', userId)
          .single();

        if (!user?.stripe_customer_id) {
          return NextResponse.json({
            success: true,
            data: { upcomingInvoice: null },
          });
        }

        try {
          const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
            customer: user.stripe_customer_id,
          });

          return NextResponse.json({
            success: true,
            data: {
              upcomingInvoice: {
                amount: upcomingInvoice.amount_due,
                currency: upcomingInvoice.currency,
                dueDate: upcomingInvoice.next_payment_attempt
                  ? new Date(upcomingInvoice.next_payment_attempt * 1000).toISOString()
                  : null,
                lines: upcomingInvoice.lines.data.map(line => ({
                  description: line.description,
                  amount: line.amount,
                })),
              },
            },
          });
        } catch {
          return NextResponse.json({
            success: true,
            data: { upcomingInvoice: null },
          });
        }
      }

      // ======================================================================
      // CHECK FEATURE ACCESS
      // ======================================================================
      case 'check-feature': {
        const feature = (body as any).feature;

        if (!userId) {
          // Return starter limits for unauthenticated users
          return NextResponse.json({
            success: true,
            data: {
              hasAccess: false,
              limit: PLAN_LIMITS.starter[feature as keyof typeof PLAN_LIMITS.starter] || 0,
              planRequired: 'professional',
            },
          });
        }

        if (isDemo) {
          const demoLimits = PLAN_LIMITS.professional;
          const limitValue = demoLimits[feature as keyof typeof demoLimits];

          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              hasAccess: limitValue === true || limitValue === -1 || (typeof limitValue === 'number' && limitValue > 0),
              limit: limitValue,
              currentPlan: 'professional',
            },
          });
        }

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_type')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        const planType = subscription?.plan_type || 'starter';
        const limits = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS];
        const limitValue = limits[feature as keyof typeof limits];

        return NextResponse.json({
          success: true,
          data: {
            hasAccess: limitValue === true || limitValue === -1 || (typeof limitValue === 'number' && limitValue > 0),
            limit: limitValue,
            currentPlan: planType,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'get-subscription',
            'get-usage',
            'update-payment-method',
            'get-payment-methods',
            'get-invoices',
            'preview-proration',
            'pause-subscription',
            'resume-subscription',
            'get-upcoming-invoice',
            'check-feature',
          ],
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Subscription API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// GET handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'get-subscription';

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ action }),
  }));
}
