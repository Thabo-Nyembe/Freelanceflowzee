'use client';

/**
 * RecurringInvoiceDetails - FreeFlow A+++ Implementation
 * Detailed view of a recurring invoice template with execution history
 */

import { useState } from 'react';
import {
  Calendar, DollarSign, Mail, Clock, Play, Pause, Trash2,
  Edit, ChevronRight, CheckCircle, XCircle, AlertCircle,
  MoreHorizontal, Send, Copy, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  useRecurringTemplate,
  RecurringTemplate,
  RecurringExecution,
  FREQUENCY_LABELS,
  STATUS_COLORS,
  formatFrequency,
  getNextRunDisplay,
} from '@/lib/hooks/use-recurring-invoices';
import { cn } from '@/lib/utils';

interface RecurringInvoiceDetailsProps {
  templateId: string;
  onBack: () => void;
  onEdit: (template: RecurringTemplate) => void;
  onDelete: (id: string) => Promise<boolean>;
  onPause: (id: string) => Promise<boolean>;
  onResume: (id: string) => Promise<boolean>;
}

export function RecurringInvoiceDetails({
  templateId,
  onBack,
  onEdit,
  onDelete,
  onPause,
  onResume,
}: RecurringInvoiceDetailsProps) {
  const { template, isLoading, error, refetch } = useRecurringTemplate(templateId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const handlePause = async () => {
    setIsActioning(true);
    await onPause(templateId);
    await refetch();
    setIsActioning(false);
  };

  const handleResume = async () => {
    setIsActioning(true);
    await onResume(templateId);
    await refetch();
    setIsActioning(false);
  };

  const handleDelete = async () => {
    setIsActioning(true);
    const success = await onDelete(templateId);
    if (success) {
      onBack();
    }
    setIsActioning(false);
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <Card className="bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Template Not Found
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{error || 'Unable to load template'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const executions = template.executions || [];
  const completedExecutions = executions.filter(e => e.status === 'completed');
  const pendingExecutions = executions.filter(e => e.status === 'pending');
  const failedExecutions = executions.filter(e => e.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{template.template_name}</h1>
              <Badge className={STATUS_COLORS[template.status]}>
                {template.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {template.client_name || template.client_email || 'No client assigned'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {template.status === 'active' ? (
            <Button variant="outline" onClick={handlePause} disabled={isActioning}>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : template.status === 'paused' ? (
            <Button variant="outline" onClick={handleResume} disabled={isActioning}>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          ) : null}

          <Button onClick={() => onEdit(template)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(template.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="w-4 h-4 mr-2" />
                Generate Invoice Now
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Amount</p>
                <p className="text-2xl font-bold">
                  ${template.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Generated</p>
                <p className="text-2xl font-bold">{template.total_invoices_generated}</p>
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
                  ${template.total_amount_invoiced.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Invoice</p>
                <p className="text-xl font-bold">{getNextRunDisplay(template)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="line-items">Line Items ({template.line_items?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">
            History ({executions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Frequency" value={formatFrequency(template)} />
                <DetailRow label="Start Date" value={new Date(template.start_date).toLocaleDateString()} />
                <DetailRow
                  label="End Date"
                  value={template.end_date ? new Date(template.end_date).toLocaleDateString() : 'No end date'}
                />
                <DetailRow
                  label="Next Run"
                  value={template.status === 'active' ? new Date(template.next_run_date).toLocaleDateString() : 'N/A'}
                />
                {template.last_run_date && (
                  <DetailRow label="Last Run" value={new Date(template.last_run_date).toLocaleDateString()} />
                )}
              </CardContent>
            </Card>

            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Invoice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Prefix" value={template.invoice_prefix} />
                <DetailRow label="Currency" value={template.currency} />
                <DetailRow label="Payment Terms" value={`${template.payment_terms_days} days`} />
                <DetailRow label="Tax Rate" value={`${template.tax_rate}%`} />
                {template.late_fee_enabled && (
                  <DetailRow
                    label="Late Fee"
                    value={`${template.late_fee_percentage}% after ${template.late_fee_grace_days} days`}
                  />
                )}
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Name" value={template.client_name || '-'} />
                <DetailRow label="Email" value={template.client_email || '-'} />
                {template.client_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-sm whitespace-pre-line">{template.client_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Auto-send"
                  value={template.auto_send ? 'Enabled' : 'Disabled'}
                  valueClassName={template.auto_send ? 'text-green-600' : 'text-muted-foreground'}
                />
                {template.auto_send && (
                  <>
                    <DetailRow
                      label="Send Timing"
                      value={template.send_days_before === 0 ? 'Immediately' : `${template.send_days_before} days before due`}
                    />
                    {template.cc_emails && template.cc_emails.length > 0 && (
                      <DetailRow label="CC" value={template.cc_emails.join(', ')} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {(template.notes || template.terms_and_conditions) && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Notes & Terms</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{template.notes}</p>
                    </div>
                  )}
                  {template.terms_and_conditions && (
                    <div>
                      <p className="text-sm font-medium mb-1">Terms & Conditions</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{template.terms_and_conditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="line-items" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {template.line_items?.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.item_name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.taxable ? `${item.tax_rate || template.tax_rate}%` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex flex-col items-end gap-1 text-sm">
                  <div className="flex justify-between w-48">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${template.subtotal.toFixed(2)}</span>
                  </div>
                  {template.discount_amount > 0 && (
                    <div className="flex justify-between w-48 text-green-600">
                      <span>Discount:</span>
                      <span>-${template.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-48">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>${template.tax_amount.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2 w-48" />
                  <div className="flex justify-between w-48 font-bold">
                    <span>Total:</span>
                    <span>${template.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Execution History</CardTitle>
              <CardDescription>
                {completedExecutions.length} completed, {pendingExecutions.length} pending, {failedExecutions.length} failed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {executions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No execution history yet</p>
                  <p className="text-sm">The first invoice will be generated on {new Date(template.next_run_date).toLocaleDateString()}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Executed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map(execution => (
                      <TableRow key={execution.id}>
                        <TableCell>
                          {new Date(execution.scheduled_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <ExecutionStatusBadge status={execution.status} />
                        </TableCell>
                        <TableCell>
                          {execution.invoice_number || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {execution.total_amount
                            ? `$${execution.total_amount.toFixed(2)}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {execution.executed_at
                            ? new Date(execution.executed_at).toLocaleString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{template.template_name}&quot; and cancel all future scheduled invoices.
              Previously generated invoices will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isActioning}
              className="bg-red-600 hover:bg-red-700"
            >
              {isActioning ? 'Deleting...' : 'Delete Template'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ Helper Components ============

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium', valueClassName)}>{value}</span>
    </div>
  );
}

function ExecutionStatusBadge({ status }: { status: RecurringExecution['status'] }) {
  const config: Record<RecurringExecution['status'], { icon: typeof CheckCircle; className: string }> = {
    pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    processing: { icon: RefreshCw, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    completed: { icon: CheckCircle, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    failed: { icon: XCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    skipped: { icon: AlertCircle, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  };

  const { icon: Icon, className } = config[status];

  return (
    <Badge className={cn('gap-1', className)}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  );
}
