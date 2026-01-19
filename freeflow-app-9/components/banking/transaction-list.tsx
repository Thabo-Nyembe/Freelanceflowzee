/**
 * Transaction List - FreeFlow A+++ Implementation
 * Complete transaction display with filtering, categorization, and reconciliation
 */

'use client';

import { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Tag,
  MoreVertical,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  CreditCard,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  useBankTransactions,
  useCategories,
  BankTransaction,
  TransactionFilters,
  formatTransactionAmount,
  formatTransactionDate,
  getTransactionStatusColor,
  getReconciliationStatusColor,
} from '@/lib/hooks/use-bank-transactions';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  accountId?: string;
  connectionId?: string;
}

export function TransactionList({ accountId, connectionId }: TransactionListProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    accountId,
    connectionId,
    page: 1,
    pageSize: 50,
  });
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsTransaction, setDetailsTransaction] = useState<BankTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    transactions,
    summary,
    pagination,
    isLoading,
    fetchTransactions,
    updateTransactions,
    categorizeTransactions,
  } = useBankTransactions({ filters });

  const { categories, categoryTree } = useCategories();

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof TransactionFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      accountId,
      connectionId,
      page: 1,
      pageSize: 50,
    });
    setSearchQuery('');
  };

  // Toggle transaction selection
  const toggleSelection = (id: string) => {
    setSelectedTransactions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    }
  };

  // Categorize selected
  const handleCategorize = async (categoryId: string) => {
    if (selectedTransactions.size === 0) return;
    await updateTransactions(Array.from(selectedTransactions), { categoryId, createRule: true });
    setSelectedTransactions(new Set());
  };

  // AI categorize selected
  const handleAICategorize = async () => {
    if (selectedTransactions.size === 0) return;
    await categorizeTransactions(Array.from(selectedTransactions));
    setSelectedTransactions(new Set());
  };

  // Exclude selected
  const handleExclude = async () => {
    if (selectedTransactions.size === 0) return;
    await updateTransactions(Array.from(selectedTransactions), { isExcluded: true });
    setSelectedTransactions(new Set());
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.reconciliationStatus) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Income</CardDescription>
            <CardTitle className="text-xl text-green-600">
              {formatTransactionAmount(summary.totalIncome)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-xl text-red-600">
              {formatTransactionAmount(-summary.totalExpenses)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Flow</CardDescription>
            <CardTitle className={cn(
              "text-xl",
              summary.netFlow >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatTransactionAmount(summary.netFlow)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-xl">{summary.transactionCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                        className="text-sm"
                      />
                      <Input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={filters.category || ''}
                      onValueChange={(v) => handleFilterChange('category', v || undefined)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categoryTree.map(parent => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.icon} {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(v) => handleFilterChange('status', v || undefined)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reconciliation</label>
                    <Select
                      value={filters.reconciliationStatus || ''}
                      onValueChange={(v) => handleFilterChange('reconciliationStatus', v || undefined)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="unreconciled">Unreconciled</SelectItem>
                        <SelectItem value="matched">Matched</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="excluded">Excluded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTransactions.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedTransactions.size} selected
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedTransactions(new Set())}>
            <X className="h-4 w-4" />
          </Button>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Categorize
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categoryTree.map(cat => (
                <DropdownMenuItem key={cat.id} onClick={() => handleCategorize(cat.id)}>
                  {cat.icon} {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleAICategorize}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Categorize
          </Button>
          <Button variant="outline" size="sm" onClick={handleExclude}>
            <XCircle className="h-4 w-4 mr-2" />
            Exclude
          </Button>
        </div>
      )}

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 text-sm font-medium">
              <Checkbox
                checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <div className="flex-1">Transaction</div>
              <div className="w-32 text-right">Amount</div>
              <div className="w-28">Category</div>
              <div className="w-24">Status</div>
              <div className="w-8" />
            </div>

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>
              ))
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No transactions found</p>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer",
                    selectedTransactions.has(transaction.id) && "bg-muted/50"
                  )}
                  onClick={() => setDetailsTransaction(transaction)}
                >
                  <Checkbox
                    checked={selectedTransactions.has(transaction.id)}
                    onCheckedChange={() => toggleSelection(transaction.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      transaction.amount > 0
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-red-100 dark:bg-red-900"
                    )}>
                      {transaction.amount > 0 ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {transaction.merchant_name || transaction.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatTransactionDate(transaction.date)}
                        {transaction.account && (
                          <>
                            <span className="text-muted-foreground/50">•</span>
                            <CreditCard className="h-3 w-3" />
                            {transaction.account.name}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-32 text-right font-semibold",
                    transaction.amount > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatTransactionAmount(transaction.amount, transaction.currency)}
                  </div>
                  <div className="w-28">
                    {transaction.category ? (
                      <Badge variant="outline" className="truncate max-w-full">
                        {transaction.category.icon} {transaction.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Uncategorized
                      </Badge>
                    )}
                  </div>
                  <div className="w-24">
                    <Badge className={getTransactionStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setDetailsTransaction(transaction);
                      }}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        categorizeTransactions([transaction.id]);
                      }}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Categorize
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        updateTransactions([transaction.id], { isExcluded: true });
                      }}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Exclude
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} transactions
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('page', pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('page', pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Transaction Details Sheet */}
      <Sheet open={!!detailsTransaction} onOpenChange={(open) => !open && setDetailsTransaction(null)}>
        <SheetContent>
          {detailsTransaction && (
            <>
              <SheetHeader>
                <SheetTitle>{detailsTransaction.merchant_name || detailsTransaction.name}</SheetTitle>
                <SheetDescription>
                  Transaction details and categorization
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="text-center">
                  <p className={cn(
                    "text-3xl font-bold",
                    detailsTransaction.amount > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatTransactionAmount(detailsTransaction.amount, detailsTransaction.currency)}
                  </p>
                  <p className="text-muted-foreground">
                    {formatTransactionDate(detailsTransaction.date)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <Select
                      value={detailsTransaction.category_id || ''}
                      onValueChange={(v) => {
                        updateTransactions([detailsTransaction.id], { categoryId: v, createRule: true });
                        setDetailsTransaction(prev => prev ? { ...prev, category_id: v } : null);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryTree.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getTransactionStatusColor(detailsTransaction.status)}>
                        {detailsTransaction.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reconciliation</label>
                    <div className="mt-1">
                      <Badge className={getReconciliationStatusColor(detailsTransaction.reconciliation_status)}>
                        {detailsTransaction.reconciliation_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {detailsTransaction.account && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account</label>
                      <p className="mt-1 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {detailsTransaction.account.connection?.institution_name} - {detailsTransaction.account.name}
                      </p>
                    </div>
                  )}

                  {detailsTransaction.location_city && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="mt-1">
                        {[detailsTransaction.location_city, detailsTransaction.location_region]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}

                  {detailsTransaction.payment_channel && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                      <p className="mt-1 capitalize">{detailsTransaction.payment_channel.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      categorizeTransactions([detailsTransaction.id]);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Categorize
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      updateTransactions([detailsTransaction.id], {
                        reconciliationStatus: 'confirmed',
                      });
                      setDetailsTransaction(prev =>
                        prev ? { ...prev, reconciliation_status: 'confirmed' } : null
                      );
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Reconciled
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
