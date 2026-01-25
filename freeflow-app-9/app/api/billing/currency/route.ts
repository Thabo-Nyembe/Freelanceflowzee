import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('billing-currency');

// Types
interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  minCharge: number;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  source: string;
}

// Supported currencies
const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, minCharge: 50 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, minCharge: 50 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, minCharge: 30 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, minCharge: 50 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, minCharge: 50 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, minCharge: 50 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, minCharge: 50 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, minCharge: 400 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, minCharge: 50 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', decimals: 2, minCharge: 1000 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, minCharge: 50 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, minCharge: 50 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, minCharge: 400 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, minCharge: 50 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, minCharge: 300 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, minCharge: 300 },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, minCharge: 250 },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, minCharge: 200 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, minCharge: 500 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, minCharge: 200 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, minCharge: 50 }
};

// Demo exchange rates (in production, fetch from API like Open Exchange Rates)
const DEMO_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.50,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
  BRL: 4.97,
  SGD: 1.34,
  HKD: 7.82,
  NZD: 1.64,
  SEK: 10.42,
  NOK: 10.68,
  DKK: 6.87,
  PLN: 3.98,
  ZAR: 18.65,
  AED: 3.67,
  KRW: 1325.50
};

// GET - Fetch currency data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const from = searchParams.get('from') || 'USD';
    const to = searchParams.get('to');

    switch (action) {
      case 'list':
        return NextResponse.json({
          currencies: Object.values(SUPPORTED_CURRENCIES),
          baseCurrency: 'USD'
        });

      case 'rate':
        if (!to) {
          return NextResponse.json({ error: 'Target currency required' }, { status: 400 });
        }

        const fromRate = DEMO_EXCHANGE_RATES[from] || 1;
        const toRate = DEMO_EXCHANGE_RATES[to];

        if (!toRate) {
          return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
        }

        const exchangeRate = toRate / fromRate;

        return NextResponse.json({
          from,
          to,
          rate: Math.round(exchangeRate * 1000000) / 1000000,
          timestamp: new Date().toISOString(),
          source: 'demo'
        });

      case 'rates':
        const base = from;
        const baseRate = DEMO_EXCHANGE_RATES[base] || 1;

        const rates: Record<string, number> = {};
        Object.entries(DEMO_EXCHANGE_RATES).forEach(([currency, rate]) => {
          rates[currency] = Math.round((rate / baseRate) * 1000000) / 1000000;
        });

        return NextResponse.json({
          base,
          rates,
          timestamp: new Date().toISOString(),
          source: 'demo'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Currency fetch error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch currency data' },
      { status: 500 }
    );
  }
}

// POST - Currency actions
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
      case 'convert': {
        const { amount, from, to } = params;

        if (!SUPPORTED_CURRENCIES[from] || !SUPPORTED_CURRENCIES[to]) {
          return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
        }

        const fromRate = DEMO_EXCHANGE_RATES[from] || 1;
        const toRate = DEMO_EXCHANGE_RATES[to];
        const exchangeRate = toRate / fromRate;
        const convertedAmount = amount * exchangeRate;

        const toConfig = SUPPORTED_CURRENCIES[to];
        const roundedAmount = Math.round(convertedAmount * Math.pow(10, toConfig.decimals)) / Math.pow(10, toConfig.decimals);

        return NextResponse.json({
          success: true,
          original: {
            amount,
            currency: from,
            formatted: formatCurrency(amount, from)
          },
          converted: {
            amount: roundedAmount,
            currency: to,
            formatted: formatCurrency(roundedAmount, to)
          },
          rate: Math.round(exchangeRate * 1000000) / 1000000,
          timestamp: new Date().toISOString()
        });
      }

      case 'convert-prices': {
        const { prices, targetCurrency } = params;

        if (!SUPPORTED_CURRENCIES[targetCurrency]) {
          return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
        }

        const convertedPrices = prices.map((price: { amount: number; currency: string; id?: string }) => {
          const fromRate = DEMO_EXCHANGE_RATES[price.currency] || 1;
          const toRate = DEMO_EXCHANGE_RATES[targetCurrency];
          const exchangeRate = toRate / fromRate;
          const convertedAmount = price.amount * exchangeRate;

          const toConfig = SUPPORTED_CURRENCIES[targetCurrency];
          const roundedAmount = Math.round(convertedAmount * Math.pow(10, toConfig.decimals)) / Math.pow(10, toConfig.decimals);

          return {
            id: price.id,
            original: {
              amount: price.amount,
              currency: price.currency
            },
            converted: {
              amount: roundedAmount,
              currency: targetCurrency,
              formatted: formatCurrency(roundedAmount, targetCurrency)
            },
            rate: Math.round(exchangeRate * 1000000) / 1000000
          };
        });

        return NextResponse.json({
          success: true,
          targetCurrency,
          prices: convertedPrices,
          timestamp: new Date().toISOString()
        });
      }

      case 'set-organization-currency': {
        const { organizationId, primaryCurrency, supportedCurrencies } = params;

        const { error } = await supabase
          .from('organizations')
          .update({
            primary_currency: primaryCurrency,
            supported_currencies: supportedCurrencies,
            updated_at: new Date().toISOString()
          })
          .eq('id', organizationId);

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'organization_currency_updated',
          resource_type: 'organization',
          resource_id: organizationId,
          details: { primaryCurrency, supportedCurrencies }
        });

        return NextResponse.json({
          success: true,
          message: 'Organization currency settings updated'
        });
      }

      case 'create-multi-currency-price': {
        const { planId, prices } = params;

        // Validate all currencies
        for (const price of prices) {
          if (!SUPPORTED_CURRENCIES[price.currency]) {
            return NextResponse.json({ error: `Unsupported currency: ${price.currency}` }, { status: 400 });
          }
        }

        // Update plan with multi-currency prices
        const { error } = await supabase
          .from('plans')
          .update({
            currency_prices: prices,
            updated_at: new Date().toISOString()
          })
          .eq('id', planId);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Multi-currency prices set for plan'
        });
      }

      case 'get-customer-currency': {
        const { customerId, ipAddress, acceptLanguage } = params;

        // Get customer's saved currency preference
        const { data: customer } = await supabase
          .from('users')
          .select('preferred_currency, country')
          .eq('id', customerId)
          .single();

        if (customer?.preferred_currency) {
          return NextResponse.json({
            success: true,
            currency: customer.preferred_currency,
            source: 'customer_preference'
          });
        }

        // Infer from country
        if (customer?.country) {
          const countryToCurrency: Record<string, string> = {
            US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', JP: 'JPY',
            DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
            CH: 'CHF', CN: 'CNY', IN: 'INR', MX: 'MXN', BR: 'BRL',
            SG: 'SGD', HK: 'HKD', NZ: 'NZD', SE: 'SEK', NO: 'NOK',
            DK: 'DKK', PL: 'PLN', ZA: 'ZAR', AE: 'AED', KR: 'KRW'
          };

          const inferredCurrency = countryToCurrency[customer.country] || 'USD';

          return NextResponse.json({
            success: true,
            currency: inferredCurrency,
            source: 'country_inference'
          });
        }

        // Default to USD
        return NextResponse.json({
          success: true,
          currency: 'USD',
          source: 'default'
        });
      }

      case 'set-customer-currency': {
        const { customerId, currency } = params;

        if (!SUPPORTED_CURRENCIES[currency]) {
          return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
        }

        const { error } = await supabase
          .from('users')
          .update({
            preferred_currency: currency,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          currency
        });
      }

      case 'calculate-fx-fee': {
        const { amount, fromCurrency, toCurrency, feePercentage } = params;

        if (fromCurrency === toCurrency) {
          return NextResponse.json({
            success: true,
            originalAmount: amount,
            fxFee: 0,
            totalAmount: amount,
            currency: fromCurrency
          });
        }

        const feeRate = feePercentage || 2.5; // Default 2.5% FX fee
        const fxFee = amount * (feeRate / 100);

        return NextResponse.json({
          success: true,
          originalAmount: amount,
          fxFeePercentage: feeRate,
          fxFee: Math.round(fxFee * 100) / 100,
          totalAmount: Math.round((amount + fxFee) * 100) / 100,
          fromCurrency,
          toCurrency
        });
      }

      case 'get-payout-currencies': {
        // Currencies available for payouts (typically fewer than payment currencies)
        const payoutCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SGD', 'HKD'];

        return NextResponse.json({
          success: true,
          currencies: payoutCurrencies.map(code => ({
            ...SUPPORTED_CURRENCIES[code],
            minimumPayout: SUPPORTED_CURRENCIES[code].minCharge * 2
          }))
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Currency action error', { error });
    return NextResponse.json(
      { error: 'Failed to perform currency action' },
      { status: 500 }
    );
  }
}

// Helper function to format currency
function formatCurrency(amount: number, currencyCode: string): string {
  const config = SUPPORTED_CURRENCIES[currencyCode];
  if (!config) return `${amount} ${currencyCode}`;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(config.decimals)}`;
  }
}
