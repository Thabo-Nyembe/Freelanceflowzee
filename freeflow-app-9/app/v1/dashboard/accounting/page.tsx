'use client';

/**
 * Accounting Dashboard - FreeFlow A+++ Implementation
 * Full double-entry accounting system competing with QuickBooks, Xero, Wave
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  BookOpen,
  FileText,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Download,
  Check,
  X,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Building2,
  CreditCard,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAccounting } from '@/lib/hooks/use-accounting';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'dashboard' | 'accounts' | 'entries' | 'reports';
type ReportType = 'trial_balance' | 'income_statement' | 'balance_sheet';

interface JournalLineInput {
  account_id: string;
  debit: number;
  credit: number;
  description: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AccountingPage() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('trial_balance');
  const [searchQuery, setSearchQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');

  // New account form
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    account_type: 'expense' as const,
    account_subtype: 'operating_expense',
    description: '',
    opening_balance: 0,
  });

  // New entry form
  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    lines: [
      { account_id: '', debit: 0, credit: 0, description: '' },
      { account_id: '', debit: 0, credit: 0, description: '' },
    ] as JournalLineInput[],
  });

  // Report params
  const [reportParams, setReportParams] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    as_of_date: new Date().toISOString().split('T')[0],
  });

  // Hook
  const {
    accounts,
    entries,
    dashboard,
    currentReport,
    isLoading,
    isInitialized,
    error,
    fetchAccounts,
    initializeChartOfAccounts,
    createAccount,
    fetchEntries,
    createJournalEntry,
    postEntry,
    voidEntry,
    deleteEntry,
    generateReport,
    fetchDashboard,
    getAccountsByType,
    categorizeTransaction,
    clearError,
  } = useAccounting();

  // Effects
  useEffect(() => {
    fetchDashboard();
    fetchEntries({ limit: 20 });
  }, [fetchDashboard, fetchEntries]);

  // =====================================================================
  // HANDLERS
  // =====================================================================

  const handleInitialize = async () => {
    await initializeChartOfAccounts();
    await fetchDashboard();
  };

  const handleCreateAccount = async () => {
    const result = await createAccount(newAccount);
    if (result) {
      setShowNewAccountDialog(false);
      setNewAccount({
        code: '',
        name: '',
        account_type: 'expense',
        account_subtype: 'operating_expense',
        description: '',
        opening_balance: 0,
      });
    }
  };

  const handleCreateEntry = async () => {
    const totalDebit = newEntry.lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = newEntry.lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error('Entry must balance', {
        description: `Debits: $${totalDebit.toFixed(2)}, Credits: $${totalCredit.toFixed(2)}`,
      });
      return;
    }

    const result = await createJournalEntry({
      entry_date: newEntry.entry_date,
      description: newEntry.description,
      reference: newEntry.reference || undefined,
      lines: newEntry.lines.filter(l => l.account_id && (l.debit > 0 || l.credit > 0)),
    });

    if (result) {
      setShowNewEntryDialog(false);
      setNewEntry({
        entry_date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
        lines: [
          { account_id: '', debit: 0, credit: 0, description: '' },
          { account_id: '', debit: 0, credit: 0, description: '' },
        ],
      });
    }
  };

  const handleGenerateReport = async () => {
    await generateReport({
      report_type: selectedReportType,
      ...(selectedReportType === 'trial_balance' || selectedReportType === 'balance_sheet'
        ? { as_of_date: reportParams.as_of_date }
        : { start_date: reportParams.start_date, end_date: reportParams.end_date }),
    });
    setShowReportDialog(false);
  };

  // Export report in different formats
  const handleExportReport = (format: 'csv' | 'json' | 'pdf') => {
    if (!currentReport) {
      toast.error('No report to export', { description: 'Generate a report first' });
      return;
    }

    const reportName = selectedReportType.replace('_', '-');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName}-${timestamp}`;

    try {
      if (format === 'csv') {
        // Generate CSV from report data
        const reportLines = currentReport.lines || [];
        const headers = ['Account Code', 'Account Name', 'Debit', 'Credit', 'Balance'];
        const csvRows = [headers.join(',')];

        reportLines.forEach((line: any) => {
          csvRows.push([
            line.account_code || '',
            `"${(line.account_name || '').replace(/"/g, '""')}"`,
            (line.debit || 0).toFixed(2),
            (line.credit || 0).toFixed(2),
            (line.balance || 0).toFixed(2)
          ].join(','));
        });

        // Add totals
        if (currentReport.totals) {
          csvRows.push(['', 'TOTALS',
            (currentReport.totals.debit || 0).toFixed(2),
            (currentReport.totals.credit || 0).toFixed(2),
            ''
          ].join(','));
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Report exported', { description: `Downloaded as ${filename}.csv` });
      } else if (format === 'json') {
        // Export as JSON
        const jsonContent = JSON.stringify(currentReport, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Report exported', { description: `Downloaded as ${filename}.json` });
      } else if (format === 'pdf') {
        // Generate PDF-like HTML for printing
        const reportTitle = selectedReportType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const reportLines = currentReport.lines || [];

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${reportTitle}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { text-align: center; color: #333; }
    .date { text-align: center; color: #666; margin-bottom: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .number { text-align: right; }
    .totals { font-weight: bold; background-color: #f9f9f9; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>${reportTitle}</h1>
  <div class="date">As of ${new Date().toLocaleDateString()}</div>
  <table>
    <thead>
      <tr>
        <th>Account Code</th>
        <th>Account Name</th>
        <th class="number">Debit</th>
        <th class="number">Credit</th>
        <th class="number">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${reportLines.map((line: any) => `
        <tr>
          <td>${line.account_code || ''}</td>
          <td>${line.account_name || ''}</td>
          <td class="number">$${(line.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="number">$${(line.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="number">$${(line.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
      ${currentReport.totals ? `
        <tr class="totals">
          <td></td>
          <td>TOTALS</td>
          <td class="number">$${(currentReport.totals.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td class="number">$${(currentReport.totals.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          <td></td>
        </tr>
      ` : ''}
    </tbody>
  </table>
  <script>window.print();</script>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            URL.revokeObjectURL(url);
          };
        }
        toast.success('Report exported', { description: 'Opening print dialog for PDF' });
      }
    } catch (error) {
      toast.error('Export failed', { description: 'An error occurred while exporting' });
    }
  };

  const addEntryLine = () => {
    setNewEntry(prev => ({
      ...prev,
      lines: [...prev.lines, { account_id: '', debit: 0, credit: 0, description: '' }],
    }));
  };

  const updateEntryLine = (index: number, field: keyof JournalLineInput, value: string | number) => {
    setNewEntry(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      ),
    }));
  };

  const removeEntryLine = (index: number) => {
    if (newEntry.lines.length <= 2) return;
    setNewEntry(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = accountTypeFilter === 'all' || acc.account_type === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate totals for new entry
  const entryTotals = {
    debit: newEntry.lines.reduce((sum, l) => sum + (l.debit || 0), 0),
    credit: newEntry.lines.reduce((sum, l) => sum + (l.credit || 0), 0),
  };

  // =====================================================================
  // RENDER: NOT INITIALIZED
  // =====================================================================

  if (!isInitialized && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 dark:text-white">
              Full Accounting Module
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Professional double-entry bookkeeping with chart of accounts,
              journal entries, and financial reports. Compete with QuickBooks and Xero.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              {[
                'Chart of Accounts',
                'Double-Entry Journal',
                'Trial Balance',
                'Income Statement',
                'Balance Sheet',
                'AI Categorization',
                'Bank Reconciliation',
                'Fiscal Years',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleInitialize}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Initialize Chart of Accounts
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // RENDER: MAIN
  // =====================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold dark:text-white">Accounting</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Double-Entry Bookkeeping
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportDialog(true)}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Reports
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewAccountDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Account
              </Button>
              <Button
                size="sm"
                onClick={() => setShowNewEntryDialog(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4" />
                Journal Entry
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="mt-4">
            <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-4 p-0">
              {[
                { value: 'dashboard', label: 'Dashboard', icon: PieChart },
                { value: 'accounts', label: 'Chart of Accounts', icon: BookOpen },
                { value: 'entries', label: 'Journal Entries', icon: FileText },
                { value: 'reports', label: 'Reports', icon: BarChart3 },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none pb-3 px-0"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Assets',
                    value: dashboard?.balances.assets || 0,
                    icon: Building2,
                    color: 'blue',
                    trend: '+12.3%',
                    positive: true,
                  },
                  {
                    label: 'Total Liabilities',
                    value: dashboard?.balances.liabilities || 0,
                    icon: CreditCard,
                    color: 'red',
                    trend: '-5.2%',
                    positive: false,
                  },
                  {
                    label: 'Revenue (YTD)',
                    value: dashboard?.balances.revenue || 0,
                    icon: TrendingUp,
                    color: 'green',
                    trend: '+28.4%',
                    positive: true,
                  },
                  {
                    label: 'Net Income',
                    value: dashboard?.netIncome || 0,
                    icon: DollarSign,
                    color: 'purple',
                    trend: '+15.7%',
                    positive: true,
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                      </div>
                      <Badge
                        variant={stat.positive ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {stat.positive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold dark:text-white">
                      ${stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                  <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Recent Entries</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('entries')}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="divide-y dark:divide-gray-700">
                    {entries.slice(0, 5).map((entry, i) => (
                      <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{entry.description}</p>
                            <p className="text-sm text-gray-500">{entry.entry_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium dark:text-white">
                            ${entry.total_debit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge
                            variant={entry.status === 'posted' ? 'default' : 'secondary'}
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {entries.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No journal entries yet</p>
                        <Button
                          variant="link"
                          onClick={() => setShowNewEntryDialog(true)}
                        >
                          Create your first entry
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold dark:text-white">Account Summary</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {[
                      { type: 'asset', label: 'Assets', color: 'blue' },
                      { type: 'liability', label: 'Liabilities', color: 'red' },
                      { type: 'equity', label: 'Equity', color: 'purple' },
                      { type: 'revenue', label: 'Revenue', color: 'green' },
                      { type: 'expense', label: 'Expenses', color: 'orange' },
                    ].map((item) => {
                      const count = accounts.filter(a => a.account_type === item.type && a.is_active).length;
                      return (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                            <span className="text-sm dark:text-gray-300">{item.label}</span>
                          </div>
                          <span className="text-sm font-medium dark:text-white">
                            {count} accounts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</span>
                      <span className="font-semibold dark:text-white">{accounts.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACCOUNTS TAB */}
          {activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="asset">Assets</SelectItem>
                    <SelectItem value="liability">Liabilities</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accounts List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {filteredAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {account.code}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium dark:text-white">{account.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {account.account_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${
                            account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${Math.abs(account.current_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {account.is_active ? (
                            <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Account
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" disabled={account.is_system}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ENTRIES TAB */}
          {activeTab === 'entries' && (
            <motion.div
              key="entries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Entries List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono">{entry.entry_number}</code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium dark:text-white">{entry.description}</span>
                          {entry.reference && (
                            <span className="text-sm text-gray-500 ml-2">
                              Ref: {entry.reference}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          ${entry.total_debit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          ${entry.total_credit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={
                              entry.status === 'posted' ? 'default' :
                              entry.status === 'voided' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {entry.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {entry.status === 'draft' && (
                                <>
                                  <DropdownMenuItem onClick={() => postEntry(entry.id)}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Post Entry
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deleteEntry(entry.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                              {entry.status === 'posted' && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => voidEntry(entry.id, 'Voided by user')}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Void Entry
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No journal entries found</p>
                          <Button
                            variant="link"
                            onClick={() => setShowNewEntryDialog(true)}
                          >
                            Create your first entry
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Report Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    type: 'trial_balance' as const,
                    title: 'Trial Balance',
                    description: 'List of all account balances',
                    icon: BookOpen,
                  },
                  {
                    type: 'income_statement' as const,
                    title: 'Income Statement',
                    description: 'Revenue and expenses (P&L)',
                    icon: TrendingUp,
                  },
                  {
                    type: 'balance_sheet' as const,
                    title: 'Balance Sheet',
                    description: 'Assets, liabilities, and equity',
                    icon: PieChart,
                  },
                ].map((report) => (
                  <motion.button
                    key={report.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedReportType(report.type);
                      setShowReportDialog(true);
                    }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 text-left hover:border-blue-500 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                      <report.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold dark:text-white mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
                  </motion.button>
                ))}
              </div>

              {/* Current Report Display */}
              {currentReport && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Report Results</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExportReport('csv')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportReport('json')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportReport('pdf')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="p-6">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
                      {JSON.stringify(currentReport, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* NEW ACCOUNT DIALOG */}
      <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to your chart of accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Account Code</Label>
                <Input
                  value={newAccount.code}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="e.g., 6100"
                />
              </div>
              <div>
                <Label>Account Type</Label>
                <Select
                  value={newAccount.account_type}
                  onValueChange={(v) => setNewAccount(prev => ({ ...prev, account_type: v as string }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Account Name</Label>
              <Input
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Software Subscriptions"
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newAccount.description}
                onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this account is used for..."
                rows={2}
              />
            </div>

            <div>
              <Label>Opening Balance</Label>
              <Input
                type="number"
                value={newAccount.opening_balance}
                onChange={(e) => setNewAccount(prev => ({ ...prev, opening_balance: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAccountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW ENTRY DIALOG */}
      <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Journal Entry</DialogTitle>
            <DialogDescription>
              Record a new double-entry transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEntry.entry_date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, entry_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Reference (Optional)</Label>
                <Input
                  value={newEntry.reference}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g., INV-001"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this transaction..."
              />
            </div>

            {/* Entry Lines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Entry Lines</Label>
                <Button variant="outline" size="sm" onClick={addEntryLine}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Line
                </Button>
              </div>

              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
                  <div className="col-span-5">Account</div>
                  <div className="col-span-2 text-right">Debit</div>
                  <div className="col-span-2 text-right">Credit</div>
                  <div className="col-span-2">Memo</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Lines */}
                {newEntry.lines.map((line, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Select
                        value={line.account_id}
                        onValueChange={(v) => updateEntryLine(index, 'account_id', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select account..." />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={line.debit || ''}
                        onChange={(e) => updateEntryLine(index, 'debit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={line.credit || ''}
                        onChange={(e) => updateEntryLine(index, 'credit', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={line.description}
                        onChange={(e) => updateEntryLine(index, 'description', e.target.value)}
                        placeholder="Memo"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntryLine(index)}
                        disabled={newEntry.lines.length <= 2}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="grid grid-cols-12 gap-2 pt-2 border-t font-medium">
                  <div className="col-span-5 text-right">Totals:</div>
                  <div className="col-span-2 text-right">
                    ${entryTotals.debit.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right">
                    ${entryTotals.credit.toFixed(2)}
                  </div>
                  <div className="col-span-3">
                    {Math.abs(entryTotals.debit - entryTotals.credit) < 0.01 ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        <Check className="w-3 h-3 mr-1" />
                        Balanced
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Off by ${Math.abs(entryTotals.debit - entryTotals.credit).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateEntry}
              disabled={isLoading || Math.abs(entryTotals.debit - entryTotals.credit) > 0.01}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REPORT DIALOG */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Configure and generate a financial report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select value={selectedReportType} onValueChange={(v) => setSelectedReportType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial_balance">Trial Balance</SelectItem>
                  <SelectItem value="income_statement">Income Statement</SelectItem>
                  <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedReportType === 'trial_balance' || selectedReportType === 'balance_sheet') && (
              <div>
                <Label>As of Date</Label>
                <Input
                  type="date"
                  value={reportParams.as_of_date}
                  onChange={(e) => setReportParams(prev => ({ ...prev, as_of_date: e.target.value }))}
                />
              </div>
            )}

            {selectedReportType === 'income_statement' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={reportParams.start_date}
                    onChange={(e) => setReportParams(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={reportParams.end_date}
                    onChange={(e) => setReportParams(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
