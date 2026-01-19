/**
 * Plaid Module Index - FreeFlow A+++ Implementation
 * Central export for Plaid integration
 */

// Client configuration
export {
  getPlaidClient,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_LANGUAGE,
  PLAID_REDIRECT_URI,
  type PlaidLinkToken,
  type PlaidExchangeResult,
  type PlaidAccount,
  type PlaidTransaction,
  type PlaidInstitution,
} from './client';

// Service functions
export {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  syncTransactions,
  getInstitution,
  getItemInfo,
  removeItem,
  performFullSync,
  type TransactionSyncResult,
  type FullSyncResult,
} from './service';
