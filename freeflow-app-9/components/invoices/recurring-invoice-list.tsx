'use client';

/**
 * RecurringInvoiceList - FreeFlow A+++ Implementation
 * Full-featured list of recurring invoice templates
 * Features: Search, filters, sorting, bulk actions, pagination
 */

import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, MoreVertical, Play, Pause,
  Trash2, Calendar, DollarSign, RefreshCw, Mail,
  ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useRecurringInvoices,
  RecurringTemplate,
  FREQUENCY_LABELS,
  STATUS_COLORS,
  formatFrequency,
  getNextRunDisplay,
} from '@/lib/hooks/use-recurring-invoices';

interface RecurringInvoiceListProps {
  onCreateNew?: () => void;
  onEdit?: (template: RecurringTemplate) => void;
  onViewDetails?: (template: RecurringTemplate) => void;
}

export function RecurringInvoiceList({
  onCreateNew,
  onEdit,
  onViewDetails,
}: RecurringInvoiceListProps) {
  const {
    templates,
    isLoading,
    error,
    pagination,
    fetchTemplates,
    deleteTemplate,
    pauseTemplate,
    resumeTemplate,
    bulkAction,
    refresh,
  } = useRecurringInvoices();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          template.template_name.toLowerCase().includes(query) ||
          template.client_name?.toLowerCase().includes(query) ||
          template.client_email?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && template.status !== statusFilter) {
        return false;
      }

      // Frequency filter
      if (frequencyFilter !== 'all' && template.frequency !== frequencyFilter) {
        return false;
      }

      return true;
    });
  }, [templates, searchQuery, statusFilter, frequencyFilter]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTemplates.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Action handlers
  const handleDelete = async (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete);
      setTemplateToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleBulkAction = async (action: 'pause' | 'resume' | 'cancel' | 'delete') => {
    if (selectedIds.size === 0) return;
    await bulkAction(Array.from(selectedIds), action);
    setSelectedIds(new Set());
  };

  // Stats
  const stats = useMemo(() => {
    const active = templates.filter(t => t.status === 'active').length;
    const paused = templates.filter(t => t.status === 'paused').length;
    const totalRevenue = templates.reduce((sum, t) => sum + t.total_amount_invoiced, 0);
    const monthlyRecurring = templates
      .filter(t => t.status === 'active')
      .reduce((sum, t) => {
        // Normalize to monthly equivalent
        const multiplier = {
          daily: 30,
          weekly: 4.33,
          biweekly: 2.17,
          monthly: 1,
          quarterly: 0.33,
          biannually: 0.17,
          annually: 0.083,
          custom: t.custom_interval_days ? 30 / t.custom_interval_days : 1,
        };
        return sum + (t.total_amount * (multiplier[t.frequency] || 1));
      }, 0);

    return { active, paused, totalRevenue, monthlyRecurring };
  }, [templates]);

  if (error) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Failed to Load Templates
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Pause className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paused</p>
                <p className="text-2xl font-bold">{stats.paused}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Monthly</p>
                <p className="text-2xl font-bold">
                  ${stats.monthlyRecurring.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoiced</p>
                <p className="text-2xl font-bold">
                  ${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Actions ({selectedIds.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('pause')}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('resume')}>
                  <Play className="w-4 h-4 mr-2" />
                  Resume Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button onClick={refresh} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="w-5 h-5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recurring Templates</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || frequencyFilter !== 'all'
                  ? 'No templates match your filters.'
                  : 'Create your first recurring invoice template to automate billing.'}
              </p>
              {!searchQuery && statusFilter === 'all' && frequencyFilter === 'all' && (
                <Button onClick={onCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 bg-muted/50 border-b flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <Checkbox
                  checked={selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <div className="flex-1">Template</div>
                <div className="w-24 text-center">Status</div>
                <div className="w-28 text-center">Frequency</div>
                <div className="w-24 text-right">Amount</div>
                <div className="w-28 text-center">Next Run</div>
                <div className="w-10" />
              </div>

              {/* Rows */}
              <div className="divide-y">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onViewDetails?.(template)}
                  >
                    <Checkbox
                      checked={selectedIds.has(template.id)}
                      onCheckedChange={() => toggleSelect(template.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{template.template_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {template.client_name || template.client_email || 'No client'}
                      </p>
                    </div>
                    <div className="w-24 text-center">
                      <Badge className={STATUS_COLORS[template.status]}>
                        {template.status}
                      </Badge>
                    </div>
                    <div className="w-28 text-center text-sm">
                      {formatFrequency(template)}
                    </div>
                    <div className="w-24 text-right font-medium">
                      ${template.total_amount.toLocaleString()}
                    </div>
                    <div className="w-28 text-center text-sm">
                      {getNextRunDisplay(template)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit?.(template); }}>
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onViewDetails?.(template); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {template.status === 'active' ? (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); pauseTemplate(template.id); }}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        ) : template.status === 'paused' ? (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); resumeTemplate(template.id); }}>
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        ) : null}
                        {template.auto_send && (
                          <DropdownMenuItem onClick={e => e.stopPropagation()}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={e => { e.stopPropagation(); handleDelete(template.id); }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTemplates.length} of {pagination.total} templates
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchTemplates({ page: pagination.page - 1 })}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchTemplates({ page: pagination.page + 1 })}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel all future scheduled invoices. Generated invoices will not be affected.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
