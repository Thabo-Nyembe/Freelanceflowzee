/**
 * Plaid Client - FreeFlow A+++ Implementation
 * Secure Plaid API client with token management
 */

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid';

// ============ Environment Configuration ============

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID!;
const PLAID_SECRET = process.env.PLAID_SECRET!;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'; // sandbox, development, production

// Map environment string to Plaid environment
const plaidEnvironment = {
  sandbox: PlaidEnvironments.sandbox,
  development: PlaidEnvironments.development,
  production: PlaidEnvironments.production,
}[PLAID_ENV] || PlaidEnvironments.sandbox;

// ============ Plaid Client Configuration ============

const configuration = new Configuration({
  basePath: plaidEnvironment,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

// ============ Singleton Client ============

let plaidClientInstance: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (!plaidClientInstance) {
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      throw new Error('Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET environment variables.');
    }
    plaidClientInstance = new PlaidApi(configuration);
  }
  return plaidClientInstance;
}

// ============ Constants ============

export const PLAID_PRODUCTS: Products[] = [
  Products.Transactions,
  Products.Auth,
  Products.Identity,
];

export const PLAID_COUNTRY_CODES: CountryCode[] = [
  CountryCode.Us,
  CountryCode.Ca,
  CountryCode.Gb,
];

export const PLAID_LANGUAGE = 'en';

export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI ||
  (process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com/api/plaid/oauth-callback'
    : 'http://localhost:3000/api/plaid/oauth-callback');

// ============ Helper Types ============

export interface PlaidLinkToken {
  linkToken: string;
  expiration: string;
  requestId: string;
}

export interface PlaidExchangeResult {
  accessToken: string;
  itemId: string;
  requestId: string;
}

export interface PlaidAccount {
  accountId: string;
  name: string;
  officialName: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
    isoCurrencyCode: string | null;
  };
}

export interface PlaidTransaction {
  transactionId: string;
  accountId: string;
  amount: number;
  date: string;
  datetime: string | null;
  authorizedDate: string | null;
  name: string;
  merchantName: string | null;
  pending: boolean;
  pendingTransactionId: string | null;
  categoryId: string | null;
  category: string[] | null;
  personalFinanceCategory: {
    primary: string;
    detailed: string;
  } | null;
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
  };
  paymentChannel: string;
  isoCurrencyCode: string | null;
}

export interface PlaidInstitution {
  institutionId: string;
  name: string;
  logo: string | null;
  primaryColor: string | null;
  url: string | null;
  countryCodes: string[];
  products: string[];
  oauth: boolean;
}
