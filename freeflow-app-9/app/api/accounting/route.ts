/**
 * Accounting API - FreeFlow A+++ Implementation
 * Full double-entry accounting system competing with QuickBooks, Xero, Wave
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  accountingService,
  ChartOfAccount,
  JournalEntry,
} from '@/lib/accounting/double-entry';
import { z } from 'zod';
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

const logger = createSimpleLogger('accounting-api');

// ============================================================================
// SCHEMAS
// ============================================================================

const createAccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  account_type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  account_subtype: z.string(),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  opening_balance: z.number().default(0),
  currency: z.string().default('USD'),
  tax_code: z.string().optional(),
  is_bank: z.boolean().default(false),
});

const createJournalEntrySchema = z.object({
  entry_date: z.string(), // ISO date
  description: z.string().min(1),
  reference: z.string().optional(),
  reference_type: z.enum(['invoice', 'payment', 'expense', 'transfer', 'adjustment', 'opening', 'closing', 'manual']).optional(),
  reference_id: z.string().uuid().optional(),
  is_adjusting: z.boolean().default(false),
  lines: z.array(z.object({
    account_id: z.string().uuid(),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    description: z.string().optional(),
    tax_code: z.string().optional(),
    tax_amount: z.number().optional(),
    project_id: z.string().uuid().optional(),
  })).min(2),
  attachments: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const reportParamsSchema = z.object({
  report_type: z.enum(['trial_balance', 'income_statement', 'balance_sheet', 'cash_flow', 'general_ledger']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  as_of_date: z.string().optional(),
  account_ids: z.array(z.string().uuid()).optional(),
  compare_last_period: z.boolean().optional(),
});

// ============================================================================
// POST - Create resources or perform actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'create-account';

    switch (action) {
      // =====================================================================
      // CHART OF ACCOUNTS
      // =====================================================================
      case 'create-account': {
        const data = createAccountSchema.parse(body);

        // Check for duplicate code
        const { data: existing } = await supabase
          .from('chart_of_accounts')
          .select('id')
          .eq('user_id', user.id)
          .eq('code', data.code)
          .single();

        if (existing) {
          return NextResponse.json(
            { error: 'Account code already exists' },
            { status: 400 }
          );
        }

        const { data: account, error } = await supabase
          .from('chart_of_accounts')
          .insert({
            user_id: user.id,
            ...data,
            current_balance: data.opening_balance,
            is_active: true,
            is_system: false,
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, account });
      }

      case 'initialize-chart': {
        // Initialize default chart of accounts
        const defaults = accountingService.getDefaultChartOfAccounts();

        const { data: existing } = await supabase
          .from('chart_of_accounts')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (existing && existing.length > 0) {
          return NextResponse.json(
            { error: 'Chart of accounts already initialized' },
            { status: 400 }
          );
        }

        const accountsToInsert = defaults.map(acc => ({
          user_id: user.id,
          code: acc.code,
          name: acc.name,
          account_type: acc.type,
          account_subtype: acc.subtype,
          is_system: acc.isSystem,
          is_active: true,
          opening_balance: 0,
          current_balance: 0,
          currency: 'USD',
        }));

        const { data: accounts, error } = await supabase
          .from('chart_of_accounts')
          .insert(accountsToInsert)
          .select();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: `Created ${accounts.length} accounts`,
          accounts,
        });
      }

      // =====================================================================
      // JOURNAL ENTRIES
      // =====================================================================
      case 'create-entry': {
        const data = createJournalEntrySchema.parse(body);

        // Validate that debits equal credits
        const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
          return NextResponse.json(
            { error: `Debits ($${totalDebit.toFixed(2)}) must equal credits ($${totalCredit.toFixed(2)})` },
            { status: 400 }
          );
        }

        // Generate entry number
        const entryNumber = accountingService.generateEntryNumber();

        // Create journal entry
        const { data: entry, error: entryError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            entry_number: entryNumber,
            entry_date: data.entry_date,
            description: data.description,
            reference: data.reference,
            reference_type: data.reference_type,
            reference_id: data.reference_id,
            is_adjusting: data.is_adjusting,
            is_closing: false,
            total_debit: totalDebit,
            total_credit: totalCredit,
            status: 'draft',
            created_by: user.id,
            attachments: data.attachments || [],
            tags: data.tags || [],
            notes: data.notes,
          })
          .select()
          .single();

        if (entryError) throw entryError;

        // Create journal lines
        const linesToInsert = data.lines.map((line, index) => ({
          journal_entry_id: entry.id,
          account_id: line.account_id,
          debit: line.debit || 0,
          credit: line.credit || 0,
          description: line.description,
          tax_code: line.tax_code,
          tax_amount: line.tax_amount || 0,
          project_id: line.project_id,
          line_number: index + 1,
        }));

        const { error: linesError } = await supabase
          .from('journal_lines')
          .insert(linesToInsert);

        if (linesError) throw linesError;

        return NextResponse.json({ success: true, entry });
      }

      case 'post-entry': {
        const { entry_id } = body;

        if (!entry_id) {
          return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
        }

        // Get entry and validate
        const { data: entry, error: getError } = await supabase
          .from('journal_entries')
          .select('*, lines:journal_lines(*)')
          .eq('id', entry_id)
          .eq('user_id', user.id)
          .single();

        if (getError || !entry) {
          return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        if (entry.status !== 'draft') {
          return NextResponse.json(
            { error: 'Only draft entries can be posted' },
            { status: 400 }
          );
        }

        // Post the entry
        const { error: postError } = await supabase
          .from('journal_entries')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', entry_id);

        if (postError) throw postError;

        // Update account balances (trigger handles this, but we'll also do it explicitly)
        for (const line of entry.lines) {
          const { data: account } = await supabase
            .from('chart_of_accounts')
            .select('account_type, current_balance')
            .eq('id', line.account_id)
            .single();

          if (account) {
            const change = ['asset', 'expense'].includes(account.account_type)
              ? (line.debit || 0) - (line.credit || 0)
              : (line.credit || 0) - (line.debit || 0);

            await supabase
              .from('chart_of_accounts')
              .update({
                current_balance: account.current_balance + change,
                updated_at: new Date().toISOString(),
              })
              .eq('id', line.account_id);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Entry posted successfully',
        });
      }

      case 'void-entry': {
        const { entry_id, reason } = body;

        if (!entry_id) {
          return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
        }

        const { data: entry } = await supabase
          .from('journal_entries')
          .select('status')
          .eq('id', entry_id)
          .eq('user_id', user.id)
          .single();

        if (!entry) {
          return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        // Create reversing entry if already posted
        if (entry.status === 'posted') {
          // Get original lines
          // PERFORMANCE FIX: Select only needed fields for reversing entry
          const { data: lines } = await supabase
            .from('journal_lines')
            .select('account_id, debit, credit, description, line_number')
            .eq('journal_entry_id', entry_id);

          // Create reversing entry with swapped debits/credits
          const reversingEntryNumber = accountingService.generateEntryNumber('REV');

          const { data: reversingEntry, error: reverseError } = await supabase
            .from('journal_entries')
            .insert({
              user_id: user.id,
              entry_number: reversingEntryNumber,
              entry_date: new Date().toISOString().split('T')[0],
              description: `Reversal of ${entry_id} - ${reason || 'Voided'}`,
              reference_type: 'adjustment',
              is_reversing: true,
              reversed_entry_id: entry_id,
              total_debit: lines?.reduce((sum, l) => sum + (l.credit || 0), 0) || 0,
              total_credit: lines?.reduce((sum, l) => sum + (l.debit || 0), 0) || 0,
              status: 'posted',
              created_by: user.id,
              posted_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (reverseError) throw reverseError;

          // Create reversed lines
          if (lines && reversingEntry) {
            const reversedLines = lines.map((line, index) => ({
              journal_entry_id: reversingEntry.id,
              account_id: line.account_id,
              debit: line.credit || 0,
              credit: line.debit || 0,
              description: `Reversal: ${line.description || ''}`,
              line_number: index + 1,
            }));

            await supabase.from('journal_lines').insert(reversedLines);
          }
        }

        // Mark original entry as voided
        await supabase
          .from('journal_entries')
          .update({
            status: 'voided',
            voided_at: new Date().toISOString(),
            void_reason: reason,
          })
          .eq('id', entry_id);

        return NextResponse.json({
          success: true,
          message: 'Entry voided successfully',
        });
      }

      // =====================================================================
      // REPORTS
      // =====================================================================
      case 'generate-report': {
        const params = reportParamsSchema.parse(body);

        // Get accounts and entries
        // PERFORMANCE FIX: Select only needed fields for chart of accounts
        const { data: accounts } = await supabase
          .from('chart_of_accounts')
          .select('id, code, name, account_type, parent_id, balance, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('code');

        const { data: entries } = await supabase
          .from('journal_entries')
          .select('*, lines:journal_lines(*)')
          .eq('user_id', user.id)
          .eq('status', 'posted')
          .order('entry_date');

        if (!accounts || !entries) {
          return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
        }

        // Transform data for the service
        const accountsData = accounts as ChartOfAccount[];
        const entriesData = entries.map(e => ({
          ...e,
          date: new Date(e.entry_date),
          lines: e.lines,
        })) as JournalEntry[];

        let report;

        switch (params.report_type) {
          case 'trial_balance': {
            const asOfDate = params.as_of_date
              ? new Date(params.as_of_date)
              : new Date();

            report = accountingService.calculateTrialBalance(
              accountsData,
              entriesData,
              asOfDate
            );
            break;
          }

          case 'income_statement': {
            const endDate = params.end_date ? new Date(params.end_date) : new Date();
            const startDate = params.start_date
              ? new Date(params.start_date)
              : new Date(endDate.getFullYear(), 0, 1); // Start of year

            report = accountingService.generateIncomeStatement(
              accountsData,
              entriesData,
              startDate,
              endDate
            );
            break;
          }

          case 'balance_sheet': {
            const asOfDate = params.as_of_date
              ? new Date(params.as_of_date)
              : new Date();

            report = accountingService.generateBalanceSheet(
              accountsData,
              entriesData,
              asOfDate
            );
            break;
          }

          default:
            return NextResponse.json(
              { error: `Report type ${params.report_type} not yet implemented` },
              { status: 400 }
            );
        }

        return NextResponse.json({ success: true, report });
      }

      // =====================================================================
      // AI CATEGORIZATION
      // =====================================================================
      case 'categorize-transaction': {
        const { description, amount, vendor, date } = body;

        if (!description || amount === undefined) {
          return NextResponse.json(
            { error: 'Description and amount required' },
            { status: 400 }
          );
        }

        // Get expense accounts
        // PERFORMANCE FIX: Select only needed fields for expense accounts
        const { data: accounts } = await supabase
          .from('chart_of_accounts')
          .select('id, code, name, account_type, balance, currency')
          .eq('user_id', user.id)
          .eq('account_type', 'expense')
          .eq('is_active', true);

        if (!accounts || accounts.length === 0) {
          return NextResponse.json(
            { error: 'No expense accounts found. Initialize chart of accounts first.' },
            { status: 400 }
          );
        }

        const result = await accountingService.categorizeTransaction(
          {
            description,
            amount,
            vendor,
            date: date ? new Date(date) : new Date(),
          },
          accounts as ChartOfAccount[]
        );

        return NextResponse.json({ success: true, categorization: result });
      }

      // =====================================================================
      // FISCAL YEARS
      // =====================================================================
      case 'create-fiscal-year': {
        const { name, start_date, end_date, retained_earnings_account_id } = body;

        const { data: fiscalYear, error } = await supabase
          .from('fiscal_years')
          .insert({
            user_id: user.id,
            name,
            start_date,
            end_date,
            retained_earnings_account_id,
            is_current: true,
          })
          .select()
          .single();

        if (error) throw error;

        // Create monthly periods
        const periods = [];
        let periodStart = new Date(start_date);
        let periodNum = 1;

        while (periodStart < new Date(end_date)) {
          const periodEnd = new Date(periodStart);
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          periodEnd.setDate(0); // Last day of month

          periods.push({
            fiscal_year_id: fiscalYear.id,
            name: periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            period_number: periodNum++,
            start_date: periodStart.toISOString().split('T')[0],
            end_date: periodEnd > new Date(end_date)
              ? end_date
              : periodEnd.toISOString().split('T')[0],
          });

          periodStart = new Date(periodEnd);
          periodStart.setDate(periodStart.getDate() + 1);
        }

        await supabase.from('fiscal_periods').insert(periods);

        return NextResponse.json({ success: true, fiscalYear });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Accounting API error', { error });
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Fetch resources
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') || 'accounts';

    switch (resource) {
      case 'accounts': {
        const type = searchParams.get('type');
        const active = searchParams.get('active') !== 'false';

        // PERFORMANCE FIX: Select only needed fields for accounts list
        let query = supabase
          .from('chart_of_accounts')
          .select('id, code, name, account_type, parent_id, balance, currency, is_active, created_at')
          .eq('user_id', user.id)
          .order('code');

        if (type) {
          query = query.eq('account_type', type);
        }

        if (active) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ accounts: data });
      }

      case 'entries': {
        const status = searchParams.get('status');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
          .from('journal_entries')
          .select(`
            *,
            lines:journal_lines (
              *,
              account:chart_of_accounts (id, code, name, account_type)
            )
          `)
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq('status', status);
        }

        if (startDate) {
          query = query.gte('entry_date', startDate);
        }

        if (endDate) {
          query = query.lte('entry_date', endDate);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return NextResponse.json({
          entries: data,
          total: count,
          limit,
          offset,
        });
      }

      case 'entry': {
        const entryId = searchParams.get('id');

        if (!entryId) {
          return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('journal_entries')
          .select(`
            *,
            lines:journal_lines (
              *,
              account:chart_of_accounts (id, code, name, account_type)
            )
          `)
          .eq('id', entryId)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ entry: data });
      }

      case 'fiscal-years': {
        const { data, error } = await supabase
          .from('fiscal_years')
          .select('*, periods:fiscal_periods(*)')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ fiscalYears: data });
      }

      case 'reconciliations': {
        const accountId = searchParams.get('account_id');

        let query = supabase
          .from('bank_reconciliations')
          .select('*, items:reconciliation_items(*)')
          .eq('user_id', user.id)
          .order('statement_date', { ascending: false });

        if (accountId) {
          query = query.eq('account_id', accountId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({ reconciliations: data });
      }

      case 'dashboard': {
        // Get summary data for accounting dashboard
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // Get account balances by type
        const { data: accounts } = await supabase
          .from('chart_of_accounts')
          .select('account_type, current_balance')
          .eq('user_id', user.id)
          .eq('is_active', true);

        const balancesByType = {
          assets: 0,
          liabilities: 0,
          equity: 0,
          revenue: 0,
          expenses: 0,
        };

        accounts?.forEach(acc => {
          switch (acc.account_type) {
            case 'asset':
              balancesByType.assets += acc.current_balance || 0;
              break;
            case 'liability':
              balancesByType.liabilities += acc.current_balance || 0;
              break;
            case 'equity':
              balancesByType.equity += acc.current_balance || 0;
              break;
            case 'revenue':
              balancesByType.revenue += acc.current_balance || 0;
              break;
            case 'expense':
              balancesByType.expenses += acc.current_balance || 0;
              break;
          }
        });

        // Get recent entries count
        const { count: recentEntriesCount } = await supabase
          .from('journal_entries')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Get draft entries count
        const { count: draftEntriesCount } = await supabase
          .from('journal_entries')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('status', 'draft');

        return NextResponse.json({
          balances: balancesByType,
          netIncome: balancesByType.revenue - balancesByType.expenses,
          recentEntriesCount,
          draftEntriesCount,
          accountsCount: accounts?.length || 0,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown resource: ${resource}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Accounting API GET error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH - Partial Update (alias for PUT)
// ============================================================================
export async function PATCH(request: NextRequest) {
  // PATCH is an alias for PUT - both support partial updates
  return PUT(request)
}

// ============================================================================
// PUT - Update resources
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') || 'account';

    switch (resource) {
      case 'account': {
        const { id, ...updates } = body;

        if (!id) {
          return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('chart_of_accounts')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, account: data });
      }

      case 'entry': {
        const { id, ...updates } = body;

        if (!id) {
          return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
        }

        // Can only update draft entries
        const { data: entry } = await supabase
          .from('journal_entries')
          .select('status')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (!entry || entry.status !== 'draft') {
          return NextResponse.json(
            { error: 'Can only update draft entries' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('journal_entries')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({ success: true, entry: data });
      }

      default:
        return NextResponse.json(
          { error: `Unknown resource: ${resource}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Accounting API PUT error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove resources
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') || 'account';
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    switch (resource) {
      case 'account': {
        // Check if account has transactions
        const { count } = await supabase
          .from('journal_lines')
          .select('id', { count: 'exact' })
          .eq('account_id', id);

        if (count && count > 0) {
          // Deactivate instead of delete
          await supabase
            .from('chart_of_accounts')
            .update({ is_active: false })
            .eq('id', id)
            .eq('user_id', user.id);

          return NextResponse.json({
            success: true,
            message: 'Account deactivated (has transactions)',
          });
        }

        const { error } = await supabase
          .from('chart_of_accounts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .eq('is_system', false);

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      case 'entry': {
        // Can only delete draft entries
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .eq('status', 'draft');

        if (error) throw error;

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown resource: ${resource}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Accounting API DELETE error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
