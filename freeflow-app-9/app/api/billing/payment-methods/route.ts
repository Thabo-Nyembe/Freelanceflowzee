import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('billing-payment-methods');

// Types
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'crypto';
  isDefault: boolean;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    funding: string;
  };
  bankAccount?: {
    bankName: string;
    accountType: string;
    last4: string;
    routingNumber: string;
  };
  billingDetails: {
    name: string;
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  createdAt: string;
}

// GET - Fetch payment methods
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const customerId = searchParams.get('customerId');

    let query = supabase
      .from('payment_methods')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (customerId) {
      query = query.eq('customer_id', customerId);
    } else {
      query = query.eq('customer_id', user.id);
    }

    const { data: paymentMethods, error } = await query;

    if (error) throw error;

    // Mask sensitive data
    const maskedMethods = (paymentMethods || []).map(pm => ({
      ...pm,
      card: pm.card ? {
        ...pm.card,
        number: `****${pm.card.last4}`
      } : undefined,
      bank_account: pm.bank_account ? {
        ...pm.bank_account,
        account_number: `****${pm.bank_account.last4}`
      } : undefined
    }));

    return NextResponse.json({
      paymentMethods: maskedMethods,
      defaultMethod: maskedMethods.find(pm => pm.is_default) || null
    });
  } catch (error) {
    logger.error('Fetch payment methods error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST - Payment method actions
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
      case 'add-card': {
        const {
          organizationId,
          cardNumber,
          expMonth,
          expYear,
          cvc,
          billingDetails,
          setAsDefault
        } = params;

        // In production, this would use Stripe's tokenization
        // Never store raw card numbers - use Stripe Elements or similar

        // Detect card brand from number
        const detectCardBrand = (number: string): string => {
          const cleaned = number.replace(/\s/g, '');
          if (/^4/.test(cleaned)) return 'visa';
          if (/^5[1-5]/.test(cleaned)) return 'mastercard';
          if (/^3[47]/.test(cleaned)) return 'amex';
          if (/^6(?:011|5)/.test(cleaned)) return 'discover';
          return 'unknown';
        };

        const brand = detectCardBrand(cardNumber);
        const last4 = cardNumber.slice(-4);

        // Validate card (basic Luhn check)
        const luhnCheck = (num: string): boolean => {
          const arr = num.replace(/\s/g, '').split('').reverse().map(x => parseInt(x));
          const sum = arr.reduce((acc, val, i) => {
            if (i % 2 !== 0) {
              val *= 2;
              if (val > 9) val -= 9;
            }
            return acc + val;
          }, 0);
          return sum % 10 === 0;
        };

        if (!luhnCheck(cardNumber)) {
          return NextResponse.json({ error: 'Invalid card number' }, { status: 400 });
        }

        // Validate expiration
        const now = new Date();
        const expDate = new Date(expYear, expMonth - 1);
        if (expDate < now) {
          return NextResponse.json({ error: 'Card has expired' }, { status: 400 });
        }

        // If setting as default, unset current default
        if (setAsDefault) {
          await supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('customer_id', user.id);
        }

        const { data: paymentMethod, error } = await supabase
          .from('payment_methods')
          .insert({
            organization_id: organizationId,
            customer_id: user.id,
            type: 'card',
            is_default: setAsDefault || false,
            card: {
              brand,
              last4,
              exp_month: expMonth,
              exp_year: expYear,
              funding: 'credit' // Would be detected from BIN in production
            },
            billing_details: billingDetails,
            // In production, store Stripe payment method ID instead
            stripe_payment_method_id: `pm_demo_${Date.now()}`
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'payment_method_added',
          resource_type: 'payment_method',
          resource_id: paymentMethod.id,
          details: { type: 'card', brand, last4 }
        });

        return NextResponse.json({
          success: true,
          paymentMethod: {
            ...paymentMethod,
            card: { ...paymentMethod.card, number: `****${last4}` }
          }
        });
      }

      case 'add-bank-account': {
        const {
          organizationId,
          accountNumber,
          routingNumber,
          accountType,
          accountHolderName,
          bankName,
          setAsDefault
        } = params;

        const last4 = accountNumber.slice(-4);

        // Validate routing number (US)
        if (!/^\d{9}$/.test(routingNumber)) {
          return NextResponse.json({ error: 'Invalid routing number' }, { status: 400 });
        }

        // If setting as default, unset current default
        if (setAsDefault) {
          await supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('customer_id', user.id);
        }

        const { data: paymentMethod, error } = await supabase
          .from('payment_methods')
          .insert({
            organization_id: organizationId,
            customer_id: user.id,
            type: 'bank_account',
            is_default: setAsDefault || false,
            bank_account: {
              bank_name: bankName,
              account_type: accountType,
              last4,
              routing_number: routingNumber,
              account_holder_name: accountHolderName
            },
            billing_details: {
              name: accountHolderName
            }
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'payment_method_added',
          resource_type: 'payment_method',
          resource_id: paymentMethod.id,
          details: { type: 'bank_account', bankName, last4 }
        });

        return NextResponse.json({
          success: true,
          paymentMethod: {
            ...paymentMethod,
            bank_account: { ...paymentMethod.bank_account, account_number: `****${last4}` }
          }
        });
      }

      case 'set-default': {
        const { paymentMethodId } = params;

        // Verify ownership
        const { data: pm } = await supabase
          .from('payment_methods')
          .select('customer_id')
          .eq('id', paymentMethodId)
          .single();

        if (pm?.customer_id !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Unset current default
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('customer_id', user.id);

        // Set new default
        const { error } = await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', paymentMethodId);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Default payment method updated'
        });
      }

      case 'update': {
        const { paymentMethodId, billingDetails, expMonth, expYear } = params;

        // Verify ownership
        const { data: pm } = await supabase
          .from('payment_methods')
          .select('customer_id, type, card')
          .eq('id', paymentMethodId)
          .single();

        if (pm?.customer_id !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updates: Record<string, unknown> = {
          updated_at: new Date().toISOString()
        };

        if (billingDetails) {
          updates.billing_details = billingDetails;
        }

        if (pm.type === 'card' && (expMonth || expYear)) {
          updates.card = {
            ...pm.card,
            exp_month: expMonth || pm.card.exp_month,
            exp_year: expYear || pm.card.exp_year
          };
        }

        const { error } = await supabase
          .from('payment_methods')
          .update(updates)
          .eq('id', paymentMethodId);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Payment method updated'
        });
      }

      case 'delete': {
        const { paymentMethodId } = params;

        // Verify ownership
        const { data: pm } = await supabase
          .from('payment_methods')
          .select('customer_id, is_default')
          .eq('id', paymentMethodId)
          .single();

        if (pm?.customer_id !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if it's the only payment method for an active subscription
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('payment_method_id', paymentMethodId)
          .eq('status', 'active');

        if (subscriptions && subscriptions.length > 0) {
          return NextResponse.json(
            { error: 'Cannot delete payment method associated with active subscriptions' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('payment_methods')
          .delete()
          .eq('id', paymentMethodId);

        if (error) throw error;

        // If was default, set another as default
        if (pm.is_default) {
          const { data: remaining } = await supabase
            .from('payment_methods')
            .select('id')
            .eq('customer_id', user.id)
            .limit(1)
            .single();

          if (remaining) {
            await supabase
              .from('payment_methods')
              .update({ is_default: true })
              .eq('id', remaining.id);
          }
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'payment_method_deleted',
          resource_type: 'payment_method',
          resource_id: paymentMethodId
        });

        return NextResponse.json({
          success: true,
          message: 'Payment method deleted'
        });
      }

      case 'verify-bank': {
        const { paymentMethodId, amounts } = params;

        // Micro-deposit verification
        // In production, this would verify against actual deposits made by Stripe/Plaid

        const { data: pm } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('id', paymentMethodId)
          .eq('customer_id', user.id)
          .single();

        if (!pm || pm.type !== 'bank_account') {
          return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
        }

        // Simulate verification (in production, verify against actual micro-deposits)
        const isVerified = amounts[0] === 32 && amounts[1] === 45; // Demo values

        if (isVerified) {
          await supabase
            .from('payment_methods')
            .update({
              verified: true,
              verified_at: new Date().toISOString()
            })
            .eq('id', paymentMethodId);

          return NextResponse.json({
            success: true,
            verified: true,
            message: 'Bank account verified successfully'
          });
        }

        return NextResponse.json({
          success: false,
          verified: false,
          message: 'Verification amounts do not match'
        });
      }

      case 'get-setup-intent': {
        // In production, this would create a Stripe SetupIntent
        // for secure client-side card collection

        return NextResponse.json({
          success: true,
          clientSecret: `seti_demo_${Date.now()}_secret`,
          message: 'Use Stripe.js confirmCardSetup with this clientSecret'
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Payment method action error', { error });
    return NextResponse.json(
      { error: 'Failed to perform payment method action' },
      { status: 500 }
    );
  }
}
