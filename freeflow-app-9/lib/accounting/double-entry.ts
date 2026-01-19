/**
 * Double-Entry Accounting Service - FreeFlow A+++ Implementation
 * Competes with: QuickBooks, Xero, Wave, FreshBooks
 * Features: Chart of Accounts, Journal Entries, Financial Reports, Bank Reconciliation
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES
// ============================================================================

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense';

export type AccountSubtype =
  // Assets
  | 'cash'
  | 'bank'
  | 'accounts_receivable'
  | 'inventory'
  | 'prepaid_expense'
  | 'fixed_asset'
  | 'accumulated_depreciation'
  | 'other_asset'
  // Liabilities
  | 'accounts_payable'
  | 'credit_card'
  | 'current_liability'
  | 'long_term_liability'
  | 'other_liability'
  // Equity
  | 'owner_equity'
  | 'retained_earnings'
  | 'common_stock'
  | 'opening_balance'
  // Revenue
  | 'income'
  | 'service_revenue'
  | 'other_income'
  // Expenses
  | 'cost_of_goods'
  | 'operating_expense'
  | 'payroll_expense'
  | 'tax_expense'
  | 'depreciation_expense'
  | 'other_expense';

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: AccountSubtype;
  description?: string;
  parentId?: string;
  isActive: boolean;
  isSystem: boolean;
  balance: number;
  currency: string;
  taxCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  referenceType?: 'invoice' | 'payment' | 'expense' | 'transfer' | 'adjustment' | 'opening';
  referenceId?: string;
  lines: JournalLine[];
  status: 'draft' | 'posted' | 'voided';
  isAdjusting: boolean;
  isClosing: boolean;
  attachments?: string[];
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  postedAt?: Date;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  description?: string;
  debit: number;
  credit: number;
  taxCode?: string;
  taxAmount?: number;
}

export interface TrialBalance {
  asOfDate: Date;
  accounts: TrialBalanceAccount[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
}

export interface TrialBalanceAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debitBalance: number;
  creditBalance: number;
}

export interface IncomeStatement {
  startDate: Date;
  endDate: Date;
  revenue: ReportSection[];
  costOfGoodsSold: ReportSection[];
  grossProfit: number;
  operatingExpenses: ReportSection[];
  operatingIncome: number;
  otherIncome: ReportSection[];
  otherExpenses: ReportSection[];
  netIncomeBeforeTax: number;
  incomeTax: number;
  netIncome: number;
}

export interface BalanceSheet {
  asOfDate: Date;
  assets: {
    current: ReportSection[];
    totalCurrent: number;
    fixed: ReportSection[];
    totalFixed: number;
    other: ReportSection[];
    totalOther: number;
    total: number;
  };
  liabilities: {
    current: ReportSection[];
    totalCurrent: number;
    longTerm: ReportSection[];
    totalLongTerm: number;
    total: number;
  };
  equity: {
    items: ReportSection[];
    total: number;
  };
  totalLiabilitiesAndEquity: number;
}

export interface CashFlowStatement {
  startDate: Date;
  endDate: Date;
  operating: {
    netIncome: number;
    adjustments: ReportSection[];
    changesInWorkingCapital: ReportSection[];
    total: number;
  };
  investing: {
    items: ReportSection[];
    total: number;
  };
  financing: {
    items: ReportSection[];
    total: number;
  };
  netChange: number;
  beginningCash: number;
  endingCash: number;
}

export interface ReportSection {
  accountId?: string;
  name: string;
  amount: number;
  children?: ReportSection[];
}

export interface ReconciliationItem {
  id: string;
  bankTransactionId: string;
  journalEntryId?: string;
  date: Date;
  description: string;
  amount: number;
  status: 'unmatched' | 'matched' | 'reconciled' | 'excluded';
  matchConfidence?: number;
  suggestedMatchId?: string;
}

export interface AICategorizationResult {
  accountId: string;
  accountName: string;
  confidence: number;
  reasoning: string;
  alternativeAccounts: Array<{
    accountId: string;
    accountName: string;
    confidence: number;
  }>;
}

// ============================================================================
// SERVICE
// ============================================================================

export class DoubleEntryAccountingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ==========================================================================
  // CHART OF ACCOUNTS
  // ==========================================================================

  /**
   * Get default chart of accounts for freelancers/small businesses
   */
  getDefaultChartOfAccounts(): Partial<ChartOfAccount>[] {
    return [
      // Assets
      { code: '1000', name: 'Cash on Hand', type: 'asset', subtype: 'cash', isSystem: true },
      { code: '1010', name: 'Business Checking', type: 'asset', subtype: 'bank', isSystem: true },
      { code: '1020', name: 'Business Savings', type: 'asset', subtype: 'bank', isSystem: false },
      { code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'accounts_receivable', isSystem: true },
      { code: '1200', name: 'Prepaid Expenses', type: 'asset', subtype: 'prepaid_expense', isSystem: false },
      { code: '1500', name: 'Computer Equipment', type: 'asset', subtype: 'fixed_asset', isSystem: false },
      { code: '1510', name: 'Furniture & Fixtures', type: 'asset', subtype: 'fixed_asset', isSystem: false },
      { code: '1520', name: 'Software Licenses', type: 'asset', subtype: 'other_asset', isSystem: false },
      { code: '1550', name: 'Accumulated Depreciation', type: 'asset', subtype: 'accumulated_depreciation', isSystem: true },

      // Liabilities
      { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'accounts_payable', isSystem: true },
      { code: '2100', name: 'Credit Card', type: 'liability', subtype: 'credit_card', isSystem: false },
      { code: '2200', name: 'Sales Tax Payable', type: 'liability', subtype: 'current_liability', isSystem: false },
      { code: '2300', name: 'Income Tax Payable', type: 'liability', subtype: 'current_liability', isSystem: false },
      { code: '2400', name: 'Unearned Revenue', type: 'liability', subtype: 'current_liability', isSystem: false },
      { code: '2500', name: 'Line of Credit', type: 'liability', subtype: 'long_term_liability', isSystem: false },

      // Equity
      { code: '3000', name: 'Owner\'s Capital', type: 'equity', subtype: 'owner_equity', isSystem: true },
      { code: '3100', name: 'Owner\'s Draws', type: 'equity', subtype: 'owner_equity', isSystem: true },
      { code: '3200', name: 'Retained Earnings', type: 'equity', subtype: 'retained_earnings', isSystem: true },
      { code: '3900', name: 'Opening Balance Equity', type: 'equity', subtype: 'opening_balance', isSystem: true },

      // Revenue
      { code: '4000', name: 'Service Revenue', type: 'revenue', subtype: 'service_revenue', isSystem: true },
      { code: '4100', name: 'Product Sales', type: 'revenue', subtype: 'income', isSystem: false },
      { code: '4200', name: 'Consulting Income', type: 'revenue', subtype: 'service_revenue', isSystem: false },
      { code: '4300', name: 'Freelance Income', type: 'revenue', subtype: 'service_revenue', isSystem: false },
      { code: '4800', name: 'Interest Income', type: 'revenue', subtype: 'other_income', isSystem: false },
      { code: '4900', name: 'Other Income', type: 'revenue', subtype: 'other_income', isSystem: false },

      // Cost of Goods Sold
      { code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'cost_of_goods', isSystem: true },
      { code: '5100', name: 'Subcontractor Costs', type: 'expense', subtype: 'cost_of_goods', isSystem: false },

      // Operating Expenses
      { code: '6000', name: 'Advertising & Marketing', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6100', name: 'Bank Fees', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6150', name: 'Payment Processing Fees', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6200', name: 'Insurance', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6250', name: 'Legal & Professional', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6300', name: 'Office Supplies', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6350', name: 'Postage & Shipping', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6400', name: 'Rent', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6450', name: 'Utilities', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6500', name: 'Software Subscriptions', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6550', name: 'Cloud Services', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6600', name: 'Travel & Transportation', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6650', name: 'Meals & Entertainment', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6700', name: 'Training & Education', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6750', name: 'Telephone & Internet', type: 'expense', subtype: 'operating_expense', isSystem: false },
      { code: '6800', name: 'Depreciation Expense', type: 'expense', subtype: 'depreciation_expense', isSystem: true },
      { code: '6900', name: 'Miscellaneous Expense', type: 'expense', subtype: 'other_expense', isSystem: false },
      { code: '7000', name: 'Income Tax Expense', type: 'expense', subtype: 'tax_expense', isSystem: true },
    ];
  }

  // ==========================================================================
  // JOURNAL ENTRIES
  // ==========================================================================

  /**
   * Validate a journal entry follows double-entry rules
   */
  validateJournalEntry(entry: Partial<JournalEntry>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!entry.lines || entry.lines.length < 2) {
      errors.push('Journal entry must have at least 2 lines');
    }

    if (entry.lines) {
      const totalDebits = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredits = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        errors.push(`Debits ($${totalDebits.toFixed(2)}) must equal credits ($${totalCredits.toFixed(2)})`);
      }

      for (const line of entry.lines) {
        if (!line.accountId) {
          errors.push('Each line must have an account');
        }
        if ((line.debit || 0) < 0 || (line.credit || 0) < 0) {
          errors.push('Debit and credit amounts must be positive');
        }
        if ((line.debit || 0) > 0 && (line.credit || 0) > 0) {
          errors.push('A line cannot have both debit and credit');
        }
        if ((line.debit || 0) === 0 && (line.credit || 0) === 0) {
          errors.push('Each line must have either a debit or credit amount');
        }
      }
    }

    if (!entry.date) {
      errors.push('Journal entry must have a date');
    }

    if (!entry.description) {
      errors.push('Journal entry must have a description');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create journal entry for an invoice
   */
  createInvoiceJournalEntry(invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    taxAmount: number;
    date: Date;
    clientName: string;
    revenueAccountId: string;
    receivableAccountId: string;
    taxAccountId?: string;
  }): Partial<JournalEntry> {
    const lines: JournalLine[] = [
      {
        id: `line_${Date.now()}_1`,
        accountId: invoice.receivableAccountId,
        description: `Invoice ${invoice.invoiceNumber} - ${invoice.clientName}`,
        debit: invoice.total,
        credit: 0,
      },
      {
        id: `line_${Date.now()}_2`,
        accountId: invoice.revenueAccountId,
        description: `Invoice ${invoice.invoiceNumber} - Service Revenue`,
        debit: 0,
        credit: invoice.total - (invoice.taxAmount || 0),
      },
    ];

    if (invoice.taxAmount && invoice.taxAccountId) {
      lines.push({
        id: `line_${Date.now()}_3`,
        accountId: invoice.taxAccountId,
        description: `Invoice ${invoice.invoiceNumber} - Sales Tax`,
        debit: 0,
        credit: invoice.taxAmount,
      });
    }

    return {
      date: invoice.date,
      description: `Invoice ${invoice.invoiceNumber} to ${invoice.clientName}`,
      reference: invoice.invoiceNumber,
      referenceType: 'invoice',
      referenceId: invoice.id,
      lines,
      status: 'draft',
      isAdjusting: false,
      isClosing: false,
    };
  }

  /**
   * Create journal entry for a payment received
   */
  createPaymentReceivedJournalEntry(payment: {
    id: string;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    date: Date;
    clientName: string;
    bankAccountId: string;
    receivableAccountId: string;
    processingFee?: number;
    feeAccountId?: string;
  }): Partial<JournalEntry> {
    const lines: JournalLine[] = [
      {
        id: `line_${Date.now()}_1`,
        accountId: payment.bankAccountId,
        description: `Payment for Invoice ${payment.invoiceNumber}`,
        debit: payment.amount - (payment.processingFee || 0),
        credit: 0,
      },
      {
        id: `line_${Date.now()}_2`,
        accountId: payment.receivableAccountId,
        description: `Payment for Invoice ${payment.invoiceNumber}`,
        debit: 0,
        credit: payment.amount,
      },
    ];

    if (payment.processingFee && payment.feeAccountId) {
      lines.push({
        id: `line_${Date.now()}_3`,
        accountId: payment.feeAccountId,
        description: `Processing fee for Invoice ${payment.invoiceNumber}`,
        debit: payment.processingFee,
        credit: 0,
      });
    }

    return {
      date: payment.date,
      description: `Payment received from ${payment.clientName} for Invoice ${payment.invoiceNumber}`,
      reference: payment.invoiceNumber,
      referenceType: 'payment',
      referenceId: payment.id,
      lines,
      status: 'draft',
      isAdjusting: false,
      isClosing: false,
    };
  }

  /**
   * Create journal entry for an expense
   */
  createExpenseJournalEntry(expense: {
    id: string;
    description: string;
    amount: number;
    date: Date;
    vendor?: string;
    expenseAccountId: string;
    paymentAccountId: string; // bank or credit card
    taxAmount?: number;
    taxAccountId?: string;
  }): Partial<JournalEntry> {
    const lines: JournalLine[] = [
      {
        id: `line_${Date.now()}_1`,
        accountId: expense.expenseAccountId,
        description: expense.description,
        debit: expense.amount - (expense.taxAmount || 0),
        credit: 0,
      },
      {
        id: `line_${Date.now()}_2`,
        accountId: expense.paymentAccountId,
        description: expense.description,
        debit: 0,
        credit: expense.amount,
      },
    ];

    if (expense.taxAmount && expense.taxAccountId) {
      lines[0].debit = expense.amount - expense.taxAmount;
      lines.push({
        id: `line_${Date.now()}_3`,
        accountId: expense.taxAccountId,
        description: `Tax on ${expense.description}`,
        debit: expense.taxAmount,
        credit: 0,
      });
    }

    return {
      date: expense.date,
      description: expense.vendor ? `${expense.description} - ${expense.vendor}` : expense.description,
      referenceType: 'expense',
      referenceId: expense.id,
      lines,
      status: 'draft',
      isAdjusting: false,
      isClosing: false,
    };
  }

  // ==========================================================================
  // FINANCIAL REPORTS
  // ==========================================================================

  /**
   * Calculate trial balance
   */
  calculateTrialBalance(
    accounts: ChartOfAccount[],
    journalEntries: JournalEntry[],
    asOfDate: Date
  ): TrialBalance {
    const balances = new Map<string, { debit: number; credit: number }>();

    // Initialize balances
    for (const account of accounts) {
      balances.set(account.id, { debit: 0, credit: 0 });
    }

    // Sum all posted journal entries up to the date
    for (const entry of journalEntries) {
      if (entry.status !== 'posted') continue;
      if (new Date(entry.date) > asOfDate) continue;

      for (const line of entry.lines) {
        const balance = balances.get(line.accountId);
        if (balance) {
          balance.debit += line.debit || 0;
          balance.credit += line.credit || 0;
        }
      }
    }

    // Build trial balance
    const trialBalanceAccounts: TrialBalanceAccount[] = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const account of accounts) {
      const balance = balances.get(account.id);
      if (!balance) continue;

      // Calculate net balance based on account type
      const netDebit = balance.debit - balance.credit;
      let debitBalance = 0;
      let creditBalance = 0;

      // Assets and Expenses have normal debit balances
      // Liabilities, Equity, and Revenue have normal credit balances
      if (account.type === 'asset' || account.type === 'expense') {
        if (netDebit >= 0) {
          debitBalance = netDebit;
        } else {
          creditBalance = Math.abs(netDebit);
        }
      } else {
        if (netDebit <= 0) {
          creditBalance = Math.abs(netDebit);
        } else {
          debitBalance = netDebit;
        }
      }

      if (debitBalance !== 0 || creditBalance !== 0) {
        trialBalanceAccounts.push({
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          accountType: account.type,
          debitBalance,
          creditBalance,
        });

        totalDebits += debitBalance;
        totalCredits += creditBalance;
      }
    }

    return {
      asOfDate,
      accounts: trialBalanceAccounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  }

  /**
   * Generate Income Statement (Profit & Loss)
   */
  generateIncomeStatement(
    accounts: ChartOfAccount[],
    journalEntries: JournalEntry[],
    startDate: Date,
    endDate: Date
  ): IncomeStatement {
    const accountBalances = this.calculateAccountBalances(
      accounts,
      journalEntries,
      startDate,
      endDate
    );

    // Group accounts by type
    const revenue: ReportSection[] = [];
    const costOfGoodsSold: ReportSection[] = [];
    const operatingExpenses: ReportSection[] = [];
    const otherIncome: ReportSection[] = [];
    const otherExpenses: ReportSection[] = [];
    let incomeTax = 0;

    for (const account of accounts) {
      const balance = accountBalances.get(account.id) || 0;
      if (balance === 0) continue;

      const section: ReportSection = {
        accountId: account.id,
        name: account.name,
        amount: Math.abs(balance),
      };

      if (account.type === 'revenue') {
        if (account.subtype === 'other_income') {
          otherIncome.push(section);
        } else {
          revenue.push(section);
        }
      } else if (account.type === 'expense') {
        if (account.subtype === 'cost_of_goods') {
          costOfGoodsSold.push(section);
        } else if (account.subtype === 'tax_expense') {
          incomeTax += Math.abs(balance);
        } else if (account.subtype === 'other_expense') {
          otherExpenses.push(section);
        } else {
          operatingExpenses.push(section);
        }
      }
    }

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
    const totalCOGS = costOfGoodsSold.reduce((sum, r) => sum + r.amount, 0);
    const grossProfit = totalRevenue - totalCOGS;

    const totalOpEx = operatingExpenses.reduce((sum, r) => sum + r.amount, 0);
    const operatingIncome = grossProfit - totalOpEx;

    const totalOtherIncome = otherIncome.reduce((sum, r) => sum + r.amount, 0);
    const totalOtherExpenses = otherExpenses.reduce((sum, r) => sum + r.amount, 0);

    const netIncomeBeforeTax = operatingIncome + totalOtherIncome - totalOtherExpenses;
    const netIncome = netIncomeBeforeTax - incomeTax;

    return {
      startDate,
      endDate,
      revenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      otherIncome,
      otherExpenses,
      netIncomeBeforeTax,
      incomeTax,
      netIncome,
    };
  }

  /**
   * Generate Balance Sheet
   */
  generateBalanceSheet(
    accounts: ChartOfAccount[],
    journalEntries: JournalEntry[],
    asOfDate: Date
  ): BalanceSheet {
    const accountBalances = this.calculateAccountBalances(
      accounts,
      journalEntries,
      undefined,
      asOfDate
    );

    const currentAssets: ReportSection[] = [];
    const fixedAssets: ReportSection[] = [];
    const otherAssets: ReportSection[] = [];
    const currentLiabilities: ReportSection[] = [];
    const longTermLiabilities: ReportSection[] = [];
    const equityItems: ReportSection[] = [];

    for (const account of accounts) {
      const balance = accountBalances.get(account.id) || 0;
      if (balance === 0) continue;

      const section: ReportSection = {
        accountId: account.id,
        name: account.name,
        amount: Math.abs(balance),
      };

      if (account.type === 'asset') {
        if (['cash', 'bank', 'accounts_receivable', 'inventory', 'prepaid_expense'].includes(account.subtype)) {
          currentAssets.push(section);
        } else if (['fixed_asset', 'accumulated_depreciation'].includes(account.subtype)) {
          // Accumulated depreciation reduces assets
          if (account.subtype === 'accumulated_depreciation') {
            section.amount = -Math.abs(balance);
          }
          fixedAssets.push(section);
        } else {
          otherAssets.push(section);
        }
      } else if (account.type === 'liability') {
        if (['accounts_payable', 'credit_card', 'current_liability'].includes(account.subtype)) {
          currentLiabilities.push(section);
        } else {
          longTermLiabilities.push(section);
        }
      } else if (account.type === 'equity') {
        equityItems.push(section);
      }
    }

    const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.amount, 0);
    const totalFixedAssets = fixedAssets.reduce((sum, a) => sum + a.amount, 0);
    const totalOtherAssets = otherAssets.reduce((sum, a) => sum + a.amount, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;

    const totalCurrentLiabilities = currentLiabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalLongTermLiabilities = longTermLiabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalEquity = equityItems.reduce((sum, e) => sum + e.amount, 0);

    return {
      asOfDate,
      assets: {
        current: currentAssets,
        totalCurrent: totalCurrentAssets,
        fixed: fixedAssets,
        totalFixed: totalFixedAssets,
        other: otherAssets,
        totalOther: totalOtherAssets,
        total: totalAssets,
      },
      liabilities: {
        current: currentLiabilities,
        totalCurrent: totalCurrentLiabilities,
        longTerm: longTermLiabilities,
        totalLongTerm: totalLongTermLiabilities,
        total: totalLiabilities,
      },
      equity: {
        items: equityItems,
        total: totalEquity,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }

  // ==========================================================================
  // AI FEATURES
  // ==========================================================================

  /**
   * AI-powered transaction categorization
   */
  async categorizeTransaction(
    transaction: {
      description: string;
      amount: number;
      vendor?: string;
      date: Date;
    },
    accounts: ChartOfAccount[]
  ): Promise<AICategorizationResult> {
    const expenseAccounts = accounts.filter(a => a.type === 'expense' && a.isActive);

    const prompt = `You are an accounting AI assistant. Categorize this transaction:

Transaction: "${transaction.description}"
Vendor: ${transaction.vendor || 'Unknown'}
Amount: $${Math.abs(transaction.amount).toFixed(2)}
Date: ${transaction.date.toISOString().split('T')[0]}

Available expense accounts:
${expenseAccounts.map(a => `- ${a.code}: ${a.name} (${a.subtype})`).join('\n')}

Return JSON with:
{
  "accountCode": "the best matching account code",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "alternatives": [
    {"accountCode": "second best", "confidence": 0.0-1.0},
    {"accountCode": "third best", "confidence": 0.0-1.0}
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    const primaryAccount = expenseAccounts.find(a => a.code === result.accountCode);
    const alternatives = (result.alternatives || [])
      .map((alt: { accountCode: string; confidence: number }) => {
        const account = expenseAccounts.find(a => a.code === alt.accountCode);
        return account ? {
          accountId: account.id,
          accountName: account.name,
          confidence: alt.confidence,
        } : null;
      })
      .filter(Boolean);

    return {
      accountId: primaryAccount?.id || expenseAccounts[0].id,
      accountName: primaryAccount?.name || 'Miscellaneous Expense',
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || 'Based on transaction description',
      alternativeAccounts: alternatives,
    };
  }

  /**
   * AI-powered bank reconciliation matching
   */
  async suggestReconciliationMatches(
    bankTransactions: Array<{
      id: string;
      date: Date;
      description: string;
      amount: number;
    }>,
    unmatchedJournalEntries: JournalEntry[]
  ): Promise<Map<string, { entryId: string; confidence: number }>> {
    const matches = new Map<string, { entryId: string; confidence: number }>();

    for (const txn of bankTransactions) {
      let bestMatch: { entryId: string; confidence: number } | null = null;

      for (const entry of unmatchedJournalEntries) {
        // Calculate date proximity (within 3 days)
        const dateDiff = Math.abs(
          new Date(txn.date).getTime() - new Date(entry.date).getTime()
        ) / (1000 * 60 * 60 * 24);

        if (dateDiff > 3) continue;

        // Calculate amount match
        const entryTotal = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const amountDiff = Math.abs(Math.abs(txn.amount) - entryTotal);
        const amountMatch = amountDiff < 0.01 ? 1 : Math.max(0, 1 - amountDiff / Math.abs(txn.amount));

        if (amountMatch < 0.9) continue; // Only consider close matches

        // Calculate description similarity (basic)
        const descLower = txn.description.toLowerCase();
        const entryDescLower = entry.description.toLowerCase();
        const descMatch = descLower.includes(entryDescLower.slice(0, 10)) ||
                          entryDescLower.includes(descLower.slice(0, 10)) ? 0.5 : 0;

        const confidence = amountMatch * 0.6 + (1 - dateDiff / 3) * 0.3 + descMatch * 0.1;

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { entryId: entry.id, confidence };
        }
      }

      if (bestMatch && bestMatch.confidence > 0.7) {
        matches.set(txn.id, bestMatch);
      }
    }

    return matches;
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private calculateAccountBalances(
    accounts: ChartOfAccount[],
    journalEntries: JournalEntry[],
    startDate?: Date,
    endDate?: Date
  ): Map<string, number> {
    const balances = new Map<string, number>();

    for (const entry of journalEntries) {
      if (entry.status !== 'posted') continue;

      const entryDate = new Date(entry.date);
      if (startDate && entryDate < startDate) continue;
      if (endDate && entryDate > endDate) continue;

      for (const line of entry.lines) {
        const account = accounts.find(a => a.id === line.accountId);
        if (!account) continue;

        const currentBalance = balances.get(line.accountId) || 0;
        let change = 0;

        // Determine sign based on account type and debit/credit
        // Assets & Expenses: Debits increase, Credits decrease
        // Liabilities, Equity & Revenue: Credits increase, Debits decrease
        if (account.type === 'asset' || account.type === 'expense') {
          change = (line.debit || 0) - (line.credit || 0);
        } else {
          change = (line.credit || 0) - (line.debit || 0);
        }

        balances.set(line.accountId, currentBalance + change);
      }
    }

    return balances;
  }

  /**
   * Generate entry number
   */
  generateEntryNumber(prefix: string = 'JE'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${timestamp}`;
  }
}

// Export singleton instance
export const accountingService = new DoubleEntryAccountingService();
